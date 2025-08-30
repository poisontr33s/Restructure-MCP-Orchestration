package com.mcp.v2.client.transport.http;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mcp.v2.client.MCPTransportException;
import com.mcp.v2.client.transport.MCPTransport;
import com.mcp.v2.client.types.MCPTypes;
import okhttp3.*;
import okhttp3.logging.HttpLoggingInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

/**
 * HTTP transport implementation for MCP v2.
 */
public class HttpTransport implements MCPTransport {
    
    private static final Logger logger = LoggerFactory.getLogger(HttpTransport.class);
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    
    private final MCPTypes.TransportConfig config;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    private Consumer<MCPTypes.MCPResponse> messageHandler;
    private Runnable connectHandler;
    private Runnable disconnectHandler;
    private Consumer<Throwable> errorHandler;
    
    private volatile boolean connected = false;

    public HttpTransport(MCPTypes.TransportConfig config) {
        this.config = config;
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
        
        // Build HTTP client with configuration
        OkHttpClient.Builder builder = new OkHttpClient.Builder()
                .connectTimeout(Duration.ofMillis(config.getTimeout()))
                .readTimeout(Duration.ofMillis(config.getTimeout()))
                .writeTimeout(Duration.ofMillis(config.getTimeout()));
        
        // Add retry interceptor
        if (config.getRetryAttempts() > 0) {
            builder.addInterceptor(new RetryInterceptor(config.getRetryAttempts()));
        }
        
        // Add logging interceptor if enabled
        if (config.isEnableMetrics()) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor(logger::debug);
            logging.setLevel(HttpLoggingInterceptor.Level.BASIC);
            builder.addInterceptor(logging);
        }
        
        this.httpClient = builder.build();
    }

    @Override
    public CompletableFuture<Void> connect() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Test connectivity with a health check
                Request request = new Request.Builder()
                        .url(config.getEndpoint() + "/health")
                        .head()
                        .build();
                
                try (Response response = httpClient.newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        connected = true;
                        if (connectHandler != null) {
                            connectHandler.run();
                        }
                        logger.info("Connected to HTTP endpoint: {}", config.getEndpoint());
                        return null;
                    } else {
                        throw new MCPTransportException("Failed to connect: HTTP " + response.code());
                    }
                }
            } catch (IOException e) {
                connected = false;
                if (errorHandler != null) {
                    errorHandler.accept(e);
                }
                throw new MCPTransportException("Connection failed", e);
            }
        });
    }

    @Override
    public CompletableFuture<Void> disconnect() {
        return CompletableFuture.runAsync(() -> {
            connected = false;
            if (disconnectHandler != null) {
                disconnectHandler.run();
            }
            logger.info("Disconnected from HTTP endpoint");
        });
    }

    @Override
    public boolean isConnected() {
        return connected;
    }

    @Override
    public CompletableFuture<Void> send(MCPTypes.MCPRequest request) {
        if (!connected) {
            return CompletableFuture.failedFuture(
                new MCPTransportException("Transport not connected"));
        }
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                String jsonBody = objectMapper.writeValueAsString(request);
                RequestBody body = RequestBody.create(jsonBody, JSON);
                
                Request httpRequest = new Request.Builder()
                        .url(config.getEndpoint())
                        .post(body)
                        .addHeader("Content-Type", "application/json")
                        .addHeader("Accept", "application/json")
                        .build();
                
                try (Response response = httpClient.newCall(httpRequest).execute()) {
                    if (response.isSuccessful() && response.body() != null) {
                        String responseBody = response.body().string();
                        MCPTypes.MCPResponse mcpResponse = objectMapper.readValue(
                            responseBody, MCPTypes.MCPResponse.class);
                        
                        if (messageHandler != null) {
                            messageHandler.accept(mcpResponse);
                        }
                        return null;
                    } else {
                        throw new MCPTransportException("HTTP request failed: " + response.code());
                    }
                }
            } catch (IOException e) {
                if (errorHandler != null) {
                    errorHandler.accept(e);
                }
                throw new MCPTransportException("Failed to send request", e);
            }
        });
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
        
        httpClient.connectionPool().evictAll();
        httpClient.dispatcher().executorService().shutdown();
    }

    /**
     * Retry interceptor for HTTP requests.
     */
    private static class RetryInterceptor implements Interceptor {
        private final int maxRetries;

        public RetryInterceptor(int maxRetries) {
            this.maxRetries = maxRetries;
        }

        @Override
        public Response intercept(Chain chain) throws IOException {
            Request request = chain.request();
            Response response = null;
            IOException exception = null;

            for (int retry = 0; retry <= maxRetries; retry++) {
                try {
                    response = chain.proceed(request);
                    if (response.isSuccessful()) {
                        return response;
                    }
                    if (response != null) {
                        response.close();
                    }
                } catch (IOException e) {
                    exception = e;
                    if (retry == maxRetries) {
                        throw e;
                    }
                    
                    // Exponential backoff
                    try {
                        Thread.sleep((long) Math.pow(2, retry) * 1000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new IOException("Retry interrupted", ie);
                    }
                }
            }

            if (exception != null) {
                throw exception;
            }
            return response;
        }
    }
}
