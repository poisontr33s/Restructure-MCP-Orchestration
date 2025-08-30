package com.mcp.v2.client;

import com.mcp.v2.client.types.MCPTypes;

/**
 * Transport-specific exceptions.
 */
public class MCPTransportException extends MCPClientException {
    public MCPTransportException(String message) {
        super(MCPTypes.ErrorCodes.TRANSPORT_ERROR, message, "TRANSPORT_ERROR");
    }

    public MCPTransportException(String message, Throwable cause) {
        super(MCPTypes.ErrorCodes.TRANSPORT_ERROR, message, "TRANSPORT_ERROR", cause);
    }
}
