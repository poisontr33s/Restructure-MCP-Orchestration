package com.mcp.v2.client.impl;

import com.mcp.v2.client.transport.MCPTransport;
import com.mcp.v2.client.types.MCPTypes;

/**
 * WebSocket-specific implementation of MCP v2 client.
 */
public class WebSocketMCPClient extends BaseMCPClient {

    public WebSocketMCPClient(MCPTypes.ClientConfig config, MCPTransport transport) {
        super(config, transport);
        
        if (!"websocket".equalsIgnoreCase(config.getTransport().getType())) {
            throw new IllegalArgumentException("WebSocketMCPClient requires WebSocket transport configuration");
        }
    }

    // WebSocket-specific methods can be added here if needed
}
