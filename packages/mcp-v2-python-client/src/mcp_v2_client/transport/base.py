"""
Base transport interface for MCP v2 communication.
"""

from abc import ABC, abstractmethod
from typing import Callable, Optional

from ..types import MCPRequest, MCPResponse, TransportConfig


class MCPTransport(ABC):
    """Base transport interface for MCP v2 communication."""

    def __init__(self, config: TransportConfig) -> None:
        self._config = config
        self.on_message: Optional[Callable[[MCPResponse], None]] = None
        self.on_connect: Optional[Callable[[], None]] = None
        self.on_disconnect: Optional[Callable[[], None]] = None
        self.on_error: Optional[Callable[[Exception], None]] = None

    @abstractmethod
    async def connect(self) -> None:
        """Connect to the remote endpoint."""
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        """Disconnect from the remote endpoint."""
        pass

    @abstractmethod
    def is_connected(self) -> bool:
        """Check if the transport is connected."""
        pass

    @abstractmethod
    async def send(self, request: MCPRequest) -> None:
        """Send a request message."""
        pass

    @property
    def config(self) -> TransportConfig:
        """Get transport configuration."""
        return self._config

    @abstractmethod
    async def close(self) -> None:
        """Close the transport and clean up resources."""
        pass
