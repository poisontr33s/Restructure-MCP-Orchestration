"""
Exception classes for MCP v2 client operations.
"""

from typing import Optional

from .types import ErrorCodes


class MCPClientException(Exception):
    """Base exception for MCP client operations."""
    
    def __init__(
        self,
        message: str,
        error_code: int = ErrorCodes.INTERNAL_ERROR,
        error_type: str = "INTERNAL_ERROR",
        cause: Optional[Exception] = None,
    ) -> None:
        super().__init__(message)
        self.error_code = error_code
        self.error_type = error_type
        self.cause = cause

    def __str__(self) -> str:
        return f"[{self.error_type}:{self.error_code}] {super().__str__()}"


class MCPTransportException(MCPClientException):
    """Transport-specific exceptions."""
    
    def __init__(
        self,
        message: str,
        cause: Optional[Exception] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code=ErrorCodes.TRANSPORT_ERROR,
            error_type="TRANSPORT_ERROR",
            cause=cause,
        )


class MCPContextException(MCPClientException):
    """Context-specific exceptions."""
    
    def __init__(
        self,
        message: str,
        cause: Optional[Exception] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code=ErrorCodes.CONTEXT_INVALID,
            error_type="CONTEXT_INVALID",
            cause=cause,
        )


class MCPAuthenticationException(MCPClientException):
    """Authentication-related exceptions."""
    
    def __init__(
        self,
        message: str,
        cause: Optional[Exception] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code=ErrorCodes.AUTHENTICATION_ERROR,
            error_type="AUTHENTICATION_ERROR",
            cause=cause,
        )


class MCPAuthorizationException(MCPClientException):
    """Authorization-related exceptions."""
    
    def __init__(
        self,
        message: str,
        cause: Optional[Exception] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code=ErrorCodes.AUTHORIZATION_ERROR,
            error_type="AUTHORIZATION_ERROR",
            cause=cause,
        )


class MCPValidationException(MCPClientException):
    """Validation-related exceptions."""
    
    def __init__(
        self,
        message: str,
        cause: Optional[Exception] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code=ErrorCodes.VALIDATION_ERROR,
            error_type="VALIDATION_ERROR",
            cause=cause,
        )


class MCPRateLimitException(MCPClientException):
    """Rate limiting exceptions."""
    
    def __init__(
        self,
        message: str,
        retry_after: Optional[int] = None,
        cause: Optional[Exception] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code=ErrorCodes.RATE_LIMIT_ERROR,
            error_type="RATE_LIMIT_ERROR",
            cause=cause,
        )
        self.retry_after = retry_after
