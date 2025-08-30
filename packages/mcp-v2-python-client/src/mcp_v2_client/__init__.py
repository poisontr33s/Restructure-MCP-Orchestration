"""
MCP v2 Python Client Library

This package provides a comprehensive, production-ready Python client library 
for the Model Context Protocol (MCP) v2.

Features:
- Multiple transport support (HTTP, WebSocket, gRPC)
- Async/await support with asyncio
- Type safety with Pydantic models
- Event-driven architecture
- Context management with TTL and priority
- Built-in caching capabilities
- Comprehensive metrics collection
- Retry logic with exponential backoff
- Connection management with automatic reconnection
- Structured logging with structlog
"""

from ._version import version as __version__
from .client import MCPClient
from .factory import MCPClientFactory
from .types import (
    MCPRequest,
    MCPResponse,
    MCPError,
    ContextInfo,
    TransportConfig,
    ClientConfig,
    EventType,
    EventData,
    ErrorCodes,
)
from .exceptions import (
    MCPClientException,
    MCPTransportException,
    MCPContextException,
)

__all__ = [
    "__version__",
    # Core client
    "MCPClient",
    "MCPClientFactory",
    # Types
    "MCPRequest",
    "MCPResponse", 
    "MCPError",
    "ContextInfo",
    "TransportConfig",
    "ClientConfig",
    "EventType",
    "EventData",
    "ErrorCodes",
    # Exceptions
    "MCPClientException",
    "MCPTransportException",
    "MCPContextException",
]
