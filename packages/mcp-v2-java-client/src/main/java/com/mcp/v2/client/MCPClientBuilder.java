package com.mcp.v2.client;

import com.mcp.v2.client.types.MCPTypes;

/**
 * Builder interface for creating MCP clients.
 */
public interface MCPClientBuilder {

    /**
     * Set the client ID.
     *
     * @param clientId The client ID
     * @return Builder instance
     */
    MCPClientBuilder clientId(String clientId);

    /**
     * Set the transport configuration.
     *
     * @param transport Transport configuration
     * @return Builder instance
     */
    MCPClientBuilder transport(MCPTypes.TransportConfig transport);

    /**
     * Set the default context.
     *
     * @param context Default context
     * @return Builder instance
     */
    MCPClientBuilder defaultContext(MCPTypes.ContextInfo context);

    /**
     * Enable or disable caching.
     *
     * @param enableCaching Whether to enable caching
     * @return Builder instance
     */
    MCPClientBuilder enableCaching(boolean enableCaching);

    /**
     * Enable or disable metrics.
     *
     * @param enableMetrics Whether to enable metrics
     * @return Builder instance
     */
    MCPClientBuilder enableMetrics(boolean enableMetrics);

    /**
     * Enable or disable logging.
     *
     * @param enableLogging Whether to enable logging
     * @return Builder instance
     */
    MCPClientBuilder enableLogging(boolean enableLogging);

    /**
     * Set client metadata.
     *
     * @param key Metadata key
     * @param value Metadata value
     * @return Builder instance
     */
    MCPClientBuilder metadata(String key, Object value);

    /**
     * Build the MCP client.
     *
     * @return Configured MCP client
     */
    MCPClient build();
}
