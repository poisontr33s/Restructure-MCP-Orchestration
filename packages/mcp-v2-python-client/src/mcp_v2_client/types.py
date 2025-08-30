"""
Type definitions for MCP v2 protocol implementation in Python.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import uuid4

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Event types for MCP v2 event system."""
    
    REQUEST_SENT = "request.sent"
    RESPONSE_RECEIVED = "response.received"
    ERROR_OCCURRED = "error.occurred"
    CONNECTION_OPENED = "connection.opened"
    CONNECTION_CLOSED = "connection.closed"
    CONNECTION_ERROR = "connection.error"
    CONTEXT_UPDATED = "context.updated"
    METRICS_COLLECTED = "metrics.collected"


class ErrorCodes:
    """Standard error codes for MCP v2."""
    
    # JSON-RPC 2.0 error codes
    PARSE_ERROR = -32700
    INVALID_REQUEST = -32600
    METHOD_NOT_FOUND = -32601
    INVALID_PARAMS = -32602
    INTERNAL_ERROR = -32603
    SERVER_ERROR_START = -32099
    SERVER_ERROR_END = -32000
    
    # MCP-specific error codes
    CONTEXT_INVALID = -32100
    CONTEXT_EXPIRED = -32101
    TRANSPORT_ERROR = -32200
    AUTHENTICATION_ERROR = -32300
    AUTHORIZATION_ERROR = -32301
    RATE_LIMIT_ERROR = -32400
    RESOURCE_NOT_FOUND = -32404
    RESOURCE_CONFLICT = -32409
    VALIDATION_ERROR = -32422


class ContextInfo(BaseModel):
    """Context information for MCP operations."""
    
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    client_id: Optional[str] = None
    capabilities: Optional[Dict[str, bool]] = None
    metadata: Optional[Dict[str, Any]] = None
    ttl: Optional[int] = None  # Time to live in seconds
    priority: Optional[int] = None  # Priority level (higher = more important)
    tags: Optional[List[str]] = None

    class Config:
        """Pydantic configuration."""
        extra = "allow"


class MCPError(BaseModel):
    """MCP v2 Error structure."""
    
    code: int
    message: str
    data: Optional[Any] = None
    type: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic configuration."""
        extra = "allow"


class MCPRequest(BaseModel):
    """MCP v2 Request message structure."""
    
    id: str = Field(default_factory=lambda: str(uuid4()))
    jsonrpc: str = "2.0"
    method: str
    params: Optional[Any] = None
    version: str = "2.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None
    context: Optional[ContextInfo] = None

    class Config:
        """Pydantic configuration."""
        extra = "allow"


class MCPResponse(BaseModel):
    """MCP v2 Response message structure."""
    
    id: str
    jsonrpc: str = "2.0"
    result: Optional[Any] = None
    error: Optional[MCPError] = None
    version: str = "2.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None
    context: Optional[ContextInfo] = None

    @property
    def is_success(self) -> bool:
        """Check if the response indicates success."""
        return self.error is None

    class Config:
        """Pydantic configuration."""
        extra = "allow"


class EventData(BaseModel):
    """Event data structure for MCP v2 events."""
    
    type: EventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Optional[Any] = None
    source: Optional[str] = None
    target: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        """Pydantic configuration."""
        extra = "allow"


class TransportConfig(BaseModel):
    """Transport configuration for different connection types."""
    
    type: str  # "http", "websocket", "grpc"
    endpoint: str
    options: Optional[Dict[str, Any]] = None
    timeout: int = 30  # seconds
    retry_attempts: int = 3
    enable_metrics: bool = True

    class Config:
        """Pydantic configuration."""
        extra = "allow"


class ClientConfig(BaseModel):
    """Client configuration for MCP v2 clients."""
    
    client_id: str = Field(default_factory=lambda: str(uuid4()))
    version: str = "2.0"
    transport: TransportConfig
    default_context: Optional[ContextInfo] = None
    enable_caching: bool = True
    enable_metrics: bool = True
    enable_logging: bool = True
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        """Pydantic configuration."""
        extra = "allow"


# Type aliases for convenience
MCPMessage = Union[MCPRequest, MCPResponse]
JSONValue = Union[str, int, float, bool, None, Dict[str, Any], List[Any]]
