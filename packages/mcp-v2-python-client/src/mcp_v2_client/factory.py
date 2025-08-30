"""
Factory for creating MCP v2 clients with different configurations.
"""

from typing import Dict, Any, Optional
from uuid import uuid4

from .client import BaseMCPClient, MCPClient
from .transport import HttpTransport, WebSocketTransport, MCPTransport
from .types import TransportConfig, ClientConfig, ContextInfo


class MCPClientFactory:
    """Factory for creating MCP v2 clients with different configurations."""

    @staticmethod
    def create_http_client(endpoint: str) -> "MCPClientBuilder":
        """Create an HTTP-based MCP client."""
        transport = TransportConfig(type="http", endpoint=endpoint)
        return MCPClientBuilder(transport)

    @staticmethod
    def create_websocket_client(endpoint: str) -> "MCPClientBuilder":
        """Create a WebSocket-based MCP client."""
        transport = TransportConfig(type="websocket", endpoint=endpoint)
        return MCPClientBuilder(transport)

    @staticmethod
    def create_production_client(transport_type: str, endpoint: str) -> "MCPClientBuilder":
        """Create a production-ready MCP client with optimized settings."""
        transport = TransportConfig(
            type=transport_type,
            endpoint=endpoint,
            timeout=30,
            retry_attempts=3,
            enable_metrics=True,
        )
        return (
            MCPClientBuilder(transport)
            .enable_metrics(True)
            .enable_logging(True)
            .enable_caching(True)
        )

    @staticmethod
    def create_development_client(transport_type: str, endpoint: str) -> "MCPClientBuilder":
        """Create a development MCP client with debug settings."""
        transport = TransportConfig(
            type=transport_type,
            endpoint=endpoint,
            timeout=60,
            retry_attempts=1,
            enable_metrics=True,
        )
        return (
            MCPClientBuilder(transport)
            .enable_metrics(True)
            .enable_logging(True)
            .enable_caching(False)
        )

    @staticmethod
    def create_cached_client(transport_type: str, endpoint: str) -> "MCPClientBuilder":
        """Create a cached MCP client that caches responses."""
        return MCPClientFactory.create_production_client(transport_type, endpoint).enable_caching(
            True
        )


class MCPClientBuilder:
    """Builder for configuring and creating MCP clients."""

    def __init__(self, transport: TransportConfig) -> None:
        self._client_id = str(uuid4())
        self._transport = transport
        self._default_context: Optional[ContextInfo] = None
        self._enable_caching = True
        self._enable_metrics = True
        self._enable_logging = True
        self._metadata: Dict[str, Any] = {}

    def client_id(self, client_id: str) -> "MCPClientBuilder":
        """Set the client ID."""
        self._client_id = client_id
        return self

    def transport(self, transport: TransportConfig) -> "MCPClientBuilder":
        """Set the transport configuration."""
        self._transport = transport
        return self

    def default_context(self, context: ContextInfo) -> "MCPClientBuilder":
        """Set the default context."""
        self._default_context = context
        return self

    def enable_caching(self, enable_caching: bool) -> "MCPClientBuilder":
        """Enable or disable caching."""
        self._enable_caching = enable_caching
        return self

    def enable_metrics(self, enable_metrics: bool) -> "MCPClientBuilder":
        """Enable or disable metrics."""
        self._enable_metrics = enable_metrics
        return self

    def enable_logging(self, enable_logging: bool) -> "MCPClientBuilder":
        """Enable or disable logging."""
        self._enable_logging = enable_logging
        return self

    def metadata(self, key: str, value: Any) -> "MCPClientBuilder":
        """Set client metadata."""
        self._metadata[key] = value
        return self

    def build(self) -> MCPClient:
        """Build the MCP client."""
        config = ClientConfig(
            client_id=self._client_id,
            transport=self._transport,
            default_context=self._default_context,
            enable_caching=self._enable_caching,
            enable_metrics=self._enable_metrics,
            enable_logging=self._enable_logging,
            metadata=self._metadata,
        )

        transport = self._create_transport(self._transport)
        return BaseMCPClient(config, transport)

    def _create_transport(self, config: TransportConfig) -> MCPTransport:
        """Create the appropriate transport based on configuration."""
        transport_type = config.type.lower()
        
        if transport_type == "http":
            return HttpTransport(config)
        elif transport_type == "websocket":
            return WebSocketTransport(config)
        else:
            raise ValueError(f"Unsupported transport type: {config.type}")
