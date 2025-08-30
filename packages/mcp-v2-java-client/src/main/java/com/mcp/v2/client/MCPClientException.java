package com.mcp.v2.client;

import com.mcp.v2.client.types.MCPTypes;

/**
 * Exception classes for MCP client operations.
 */
public class MCPClientException extends RuntimeException {
    private final int errorCode;
    private final String errorType;

    public MCPClientException(String message) {
        super(message);
        this.errorCode = MCPTypes.ErrorCodes.INTERNAL_ERROR;
        this.errorType = "INTERNAL_ERROR";
    }

    public MCPClientException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = MCPTypes.ErrorCodes.INTERNAL_ERROR;
        this.errorType = "INTERNAL_ERROR";
    }

    public MCPClientException(int errorCode, String message, String errorType) {
        super(message);
        this.errorCode = errorCode;
        this.errorType = errorType;
    }

    public MCPClientException(int errorCode, String message, String errorType, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.errorType = errorType;
    }

    public int getErrorCode() {
        return errorCode;
    }

    public String getErrorType() {
        return errorType;
    }
}
