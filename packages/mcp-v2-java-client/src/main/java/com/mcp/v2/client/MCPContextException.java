package com.mcp.v2.client;

import com.mcp.v2.client.types.MCPTypes;

/**
 * Context-specific exceptions.
 */
public class MCPContextException extends MCPClientException {
    public MCPContextException(String message) {
        super(MCPTypes.ErrorCodes.CONTEXT_INVALID, message, "CONTEXT_INVALID");
    }

    public MCPContextException(String message, Throwable cause) {
        super(MCPTypes.ErrorCodes.CONTEXT_INVALID, message, "CONTEXT_INVALID", cause);
    }
}
