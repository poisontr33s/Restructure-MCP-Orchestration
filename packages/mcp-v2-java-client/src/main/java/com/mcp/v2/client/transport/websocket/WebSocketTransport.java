package com.mcp.v2.client.transport.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mcp.v2.client.MCPTransportException;
import com.mcp.v2.client.transport.MCPTransport;
import com.mcp.v2.client.types.MCPTypes;
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.http.*;
import io.netty.handler.codec.http.websocketx.*;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

/**
 * WebSocket transport implementation for MCP v2.
 */
public class WebSocketTransport implements MCPTransport {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketTransport.class);
    
    private final MCPTypes.TransportConfig config;
    private final ObjectMapper objectMapper;
    private final EventLoopGroup group;
    private final URI uri;
    
    private Consumer<MCPTypes.MCPResponse> messageHandler;
    private Runnable connectHandler;
    private Runnable disconnectHandler;
    private Consumer<Throwable> errorHandler;
    
    private Channel channel;
    private volatile boolean connected = false;

    public WebSocketTransport(MCPTypes.TransportConfig config) {
        this.config = config;
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
        this.group = new NioEventLoopGroup();
        
        try {
            this.uri = URI.create(config.getEndpoint());
        } catch (Exception e) {
            throw new MCPTransportException("Invalid WebSocket URI: " + config.getEndpoint(), e);
        }
    }

    @Override
    public CompletableFuture<Void> connect() {
        final CompletableFuture<Void> future = new CompletableFuture<>();
        
        try {
            boolean ssl = "wss".equalsIgnoreCase(uri.getScheme());
            final SslContext sslCtx;
            if (ssl) {
                sslCtx = SslContextBuilder.forClient()
                        .trustManager(InsecureTrustManagerFactory.INSTANCE)
                        .build();
            } else {
                sslCtx = null;
            }
            
            final int port = uri.getPort() == -1 ? (ssl ? 443 : 80) : uri.getPort();
            
            final WebSocketClientHandshaker handshaker = WebSocketClientHandshakerFactory.newHandshaker(
                    uri, WebSocketVersion.V13, null, true, new DefaultHttpHeaders());
            
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(group)
                    .channel(NioSocketChannel.class)
                    .handler(new ChannelInitializer<SocketChannel>() {
                        @Override
                        protected void initChannel(SocketChannel ch) {
                            ChannelPipeline pipeline = ch.pipeline();
                            if (sslCtx != null) {
                                pipeline.addLast(sslCtx.newHandler(ch.alloc(), uri.getHost(), port));
                            }
                            pipeline.addLast(new HttpClientCodec());
                            pipeline.addLast(new HttpObjectAggregator(8192));
                            pipeline.addLast(new WebSocketClientHandler(handshaker, future));
                        }
                    });
            
            bootstrap.connect(uri.getHost(), port).addListener((ChannelFutureListener) channelFuture -> {
                if (channelFuture.isSuccess()) {
                    this.channel = channelFuture.channel();
                } else {
                    future.completeExceptionally(new MCPTransportException("Failed to connect", channelFuture.cause()));
                }
            });
            
        } catch (Exception e) {
            future.completeExceptionally(new MCPTransportException("Connection setup failed", e));
        }
        
        return future;
    }

    @Override
    public CompletableFuture<Void> disconnect() {
        CompletableFuture<Void> future = new CompletableFuture<>();
        
        if (channel != null && channel.isActive()) {
            channel.writeAndFlush(new CloseWebSocketFrame()).addListener((ChannelFutureListener) channelFuture -> {
                connected = false;
                if (disconnectHandler != null) {
                    disconnectHandler.run();
                }
                future.complete(null);
            });
        } else {
            connected = false;
            future.complete(null);
        }
        
        return future;
    }

    @Override
    public boolean isConnected() {
        return connected && channel != null && channel.isActive();
    }

    @Override
    public CompletableFuture<Void> send(MCPTypes.MCPRequest request) {
        if (!isConnected()) {
            return CompletableFuture.failedFuture(new MCPTransportException("Transport not connected"));
        }
        
        CompletableFuture<Void> future = new CompletableFuture<>();
        
        try {
            String json = objectMapper.writeValueAsString(request);
            TextWebSocketFrame frame = new TextWebSocketFrame(json);
            
            channel.writeAndFlush(frame).addListener((ChannelFutureListener) channelFuture -> {
                if (channelFuture.isSuccess()) {
                    future.complete(null);
                } else {
                    future.completeExceptionally(new MCPTransportException("Failed to send message", channelFuture.cause()));
                }
            });
        } catch (Exception e) {
            future.completeExceptionally(new MCPTransportException("Failed to serialize request", e));
        }
        
        return future;
    }

    @Override
    public void onMessage(Consumer<MCPTypes.MCPResponse> handler) {
        this.messageHandler = handler;
    }

    @Override
    public void onConnect(Runnable handler) {
        this.connectHandler = handler;
    }

    @Override
    public void onDisconnect(Runnable handler) {
        this.disconnectHandler = handler;
    }

    @Override
    public void onError(Consumer<Throwable> handler) {
        this.errorHandler = handler;
    }

    @Override
    public MCPTypes.TransportConfig getConfig() {
        return config;
    }

    @Override
    public void close() {
        try {
            disconnect().get(5, TimeUnit.SECONDS);
        } catch (Exception e) {
            logger.warn("Error during disconnect", e);
        }
        
        if (group != null) {
            group.shutdownGracefully();
        }
    }

    /**
     * WebSocket client handler for managing the WebSocket connection.
     */
    private class WebSocketClientHandler extends SimpleChannelInboundHandler<Object> {
        
        private final WebSocketClientHandshaker handshaker;
        private final CompletableFuture<Void> connectionFuture;
        private ChannelPromise handshakeFuture;

        public WebSocketClientHandler(WebSocketClientHandshaker handshaker, CompletableFuture<Void> connectionFuture) {
            this.handshaker = handshaker;
            this.connectionFuture = connectionFuture;
        }

        @Override
        public void channelActive(ChannelHandlerContext ctx) {
            handshakeFuture = ctx.newPromise();
            handshaker.handshake(ctx.channel());
        }

        @Override
        public void channelInactive(ChannelHandlerContext ctx) {
            connected = false;
            if (disconnectHandler != null) {
                disconnectHandler.run();
            }
            logger.info("WebSocket connection closed");
        }

        @Override
        public void channelRead0(ChannelHandlerContext ctx, Object msg) {
            Channel ch = ctx.channel();
            
            if (!handshaker.isHandshakeComplete()) {
                try {
                    handshaker.finishHandshake(ch, (FullHttpResponse) msg);
                    connected = true;
                    if (connectHandler != null) {
                        connectHandler.run();
                    }
                    connectionFuture.complete(null);
                    logger.info("WebSocket handshake completed");
                } catch (WebSocketHandshakeException e) {
                    connected = false;
                    connectionFuture.completeExceptionally(e);
                    logger.error("WebSocket handshake failed", e);
                }
                return;
            }

            if (msg instanceof WebSocketFrame) {
                WebSocketFrame frame = (WebSocketFrame) msg;
                
                if (frame instanceof TextWebSocketFrame) {
                    TextWebSocketFrame textFrame = (TextWebSocketFrame) frame;
                    handleTextMessage(textFrame.text());
                } else if (frame instanceof CloseWebSocketFrame) {
                    ch.close();
                } else if (frame instanceof PongWebSocketFrame) {
                    logger.debug("Received pong frame");
                }
            }
        }

        @Override
        public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
            logger.error("WebSocket error", cause);
            if (errorHandler != null) {
                errorHandler.accept(cause);
            }
            if (!connectionFuture.isDone()) {
                connectionFuture.completeExceptionally(cause);
            }
            ctx.close();
        }

        private void handleTextMessage(String text) {
            try {
                MCPTypes.MCPResponse response = objectMapper.readValue(text, MCPTypes.MCPResponse.class);
                if (messageHandler != null) {
                    messageHandler.accept(response);
                }
            } catch (Exception e) {
                logger.error("Failed to parse WebSocket message: {}", text, e);
                if (errorHandler != null) {
                    errorHandler.accept(e);
                }
            }
        }
    }
}
