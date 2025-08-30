package com.mcp.v2.client.impl;

import com.mcp.v2.client.transport.MCPTransport;
import com.mcp.v2.client.types.MCPTypes;

/**
 * HTTP-specific implementation of MCP v2 client.
 */
public class HttpMCPClient extends BaseMCPClient {

    public HttpMCPClient(MCPTypes.ClientConfig config, MCPTransport transport) {
        super(config, transport);
        
        if (!"http".equalsIgnoreCase(config.getTransport().getType())) {
            throw new IllegalArgumentException("HttpMCPClient requires HTTP transport configuration");
        }
    }

    // HTTP-specific methods can be added here if needed
}
