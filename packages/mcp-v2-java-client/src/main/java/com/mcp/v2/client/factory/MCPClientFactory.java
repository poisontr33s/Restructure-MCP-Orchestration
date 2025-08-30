package com.mcp.v2.client.factory;

import com.mcp.v2.client.MCPClient;
import com.mcp.v2.client.MCPClientBuilder;
import com.mcp.v2.client.impl.BaseMCPClient;
import com.mcp.v2.client.impl.HttpMCPClient;
import com.mcp.v2.client.impl.WebSocketMCPClient;
import com.mcp.v2.client.transport.MCPTransport;
import com.mcp.v2.client.transport.http.HttpTransport;
import com.mcp.v2.client.transport.websocket.WebSocketTransport;
import com.mcp.v2.client.types.MCPTypes;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Factory for creating MCP v2 clients with different configurations.
 */
public class MCPClientFactory {

    /**
     * Create an HTTP-based MCP client.
     *
     * @param endpoint The HTTP endpoint URL
     * @return MCP client builder
     */
    public static MCPClientBuilder createHttpClient(String endpoint) {
        MCPTypes.TransportConfig transport = new MCPTypes.TransportConfig("http", endpoint);
        return new DefaultMCPClientBuilder().transport(transport);
    }

    /**
     * Create a WebSocket-based MCP client.
     *
     * @param endpoint The WebSocket endpoint URL
     * @return MCP client builder
     */
    public static MCPClientBuilder createWebSocketClient(String endpoint) {
        MCPTypes.TransportConfig transport = new MCPTypes.TransportConfig("websocket", endpoint);
        return new DefaultMCPClientBuilder().transport(transport);
    }

    /**
     * Create a production-ready MCP client with optimized settings.
     *
     * @param transportType The transport type ("http" or "websocket")
     * @param endpoint The endpoint URL
     * @return MCP client builder
     */
    public static MCPClientBuilder createProductionClient(String transportType, String endpoint) {
        MCPTypes.TransportConfig transport = new MCPTypes.TransportConfig(transportType, endpoint);
        transport.setTimeout(30000);
        transport.setRetryAttempts(3);
        transport.setEnableMetrics(true);

        return new DefaultMCPClientBuilder()
                .transport(transport)
                .enableMetrics(true)
                .enableLogging(true)
                .enableCaching(true);
    }

    /**
     * Create a development MCP client with debug settings.
     *
     * @param transportType The transport type
     * @param endpoint The endpoint URL
     * @return MCP client builder
     */
    public static MCPClientBuilder createDevelopmentClient(String transportType, String endpoint) {
        MCPTypes.TransportConfig transport = new MCPTypes.TransportConfig(transportType, endpoint);
        transport.setTimeout(60000);
        transport.setRetryAttempts(1);
        transport.setEnableMetrics(true);

        return new DefaultMCPClientBuilder()
                .transport(transport)
                .enableMetrics(true)
                .enableLogging(true)
                .enableCaching(false);
    }

    /**
     * Create a cached MCP client that caches responses.
     *
     * @param transportType The transport type
     * @param endpoint The endpoint URL
     * @return MCP client builder
     */
    public static MCPClientBuilder createCachedClient(String transportType, String endpoint) {
        return createProductionClient(transportType, endpoint)
                .enableCaching(true);
    }

    /**
     * Default implementation of MCPClientBuilder.
     */
    private static class DefaultMCPClientBuilder implements MCPClientBuilder {
        
        private String clientId = UUID.randomUUID().toString();
        private MCPTypes.TransportConfig transport;
        private MCPTypes.ContextInfo defaultContext;
        private boolean enableCaching = true;
        private boolean enableMetrics = true;
        private boolean enableLogging = true;
        private final Map<String, Object> metadata = new HashMap<>();

        @Override
        public MCPClientBuilder clientId(String clientId) {
            this.clientId = clientId;
            return this;
        }

        @Override
        public MCPClientBuilder transport(MCPTypes.TransportConfig transport) {
            this.transport = transport;
            return this;
        }

        @Override
        public MCPClientBuilder defaultContext(MCPTypes.ContextInfo context) {
            this.defaultContext = context;
            return this;
        }

        @Override
        public MCPClientBuilder enableCaching(boolean enableCaching) {
            this.enableCaching = enableCaching;
            return this;
        }

        @Override
        public MCPClientBuilder enableMetrics(boolean enableMetrics) {
            this.enableMetrics = enableMetrics;
            return this;
        }

        @Override
        public MCPClientBuilder enableLogging(boolean enableLogging) {
            this.enableLogging = enableLogging;
            return this;
        }

        @Override
        public MCPClientBuilder metadata(String key, Object value) {
            this.metadata.put(key, value);
            return this;
        }

        @Override
        public MCPClient build() {
            if (transport == null) {
                throw new IllegalArgumentException("Transport configuration is required");
            }

            MCPTypes.ClientConfig config = new MCPTypes.ClientConfig(clientId, transport);
            config.setDefaultContext(defaultContext);
            config.setEnableCaching(enableCaching);
            config.setEnableMetrics(enableMetrics);
            config.setEnableLogging(enableLogging);
            config.setMetadata(metadata);

            MCPTransport mcpTransport = createTransport(transport);
            
            switch (transport.getType().toLowerCase()) {
                case "http":
                    return new HttpMCPClient(config, mcpTransport);
                case "websocket":
                    return new WebSocketMCPClient(config, mcpTransport);
                default:
                    throw new IllegalArgumentException("Unsupported transport type: " + transport.getType());
            }
        }

        private MCPTransport createTransport(MCPTypes.TransportConfig config) {
            switch (config.getType().toLowerCase()) {
                case "http":
                    return new HttpTransport(config);
                case "websocket":
                    return new WebSocketTransport(config);
                default:
                    throw new IllegalArgumentException("Unsupported transport type: " + config.getType());
            }
        }
    }
}
