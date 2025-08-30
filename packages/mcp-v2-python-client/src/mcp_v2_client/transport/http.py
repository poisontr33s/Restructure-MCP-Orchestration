"""
HTTP transport implementation for MCP v2.
"""

import asyncio
import json
import logging
from typing import Optional
from urllib.parse import urljoin

import aiohttp
from tenacity import retry, stop_after_attempt, wait_exponential

from .base import MCPTransport
from ..types import MCPRequest, MCPResponse, TransportConfig
from ..exceptions import MCPTransportException

logger = logging.getLogger(__name__)


class HttpTransport(MCPTransport):
    """HTTP transport implementation for MCP v2."""

    def __init__(self, config: TransportConfig) -> None:
        super().__init__(config)
        self._session: Optional[aiohttp.ClientSession] = None
        self._connected = False

    async def connect(self) -> None:
        """Connect to the HTTP endpoint."""
        if self._session is not None:
            await self.disconnect()

        timeout = aiohttp.ClientTimeout(total=self._config.timeout)
        self._session = aiohttp.ClientSession(
            timeout=timeout,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
        )

        # Test connectivity with a health check
        try:
            health_url = urljoin(self._config.endpoint, "/health")
            async with self._session.head(health_url) as response:
                if response.status == 200:
                    self._connected = True
                    if self.on_connect:
                        await self.on_connect()
                    logger.info(f"Connected to HTTP endpoint: {self._config.endpoint}")
                else:
                    raise MCPTransportException(f"Failed to connect: HTTP {response.status}")
        except Exception as e:
            self._connected = False
            if self.on_error:
                await self.on_error(e)
            raise MCPTransportException("Connection failed") from e

    async def disconnect(self) -> None:
        """Disconnect from the HTTP endpoint."""
        if self._session is not None:
            await self._session.close()
            self._session = None
        
        self._connected = False
        if self.on_disconnect:
            await self.on_disconnect()
        logger.info("Disconnected from HTTP endpoint")

    def is_connected(self) -> bool:
        """Check if the transport is connected."""
        return self._connected and self._session is not None and not self._session.closed

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    async def send(self, request: MCPRequest) -> None:
        """Send a request message."""
        if not self.is_connected():
            raise MCPTransportException("Transport not connected")

        if self._session is None:
            raise MCPTransportException("Session not initialized")

        try:
            # Convert request to JSON
            request_data = request.dict()
            json_data = json.dumps(request_data, default=str)

            async with self._session.post(
                self._config.endpoint, data=json_data
            ) as response:
                if response.status == 200:
                    response_text = await response.text()
                    response_data = json.loads(response_text)
                    mcp_response = MCPResponse(**response_data)

                    if self.on_message:
                        await self.on_message(mcp_response)
                else:
                    raise MCPTransportException(f"HTTP request failed: {response.status}")

        except Exception as e:
            if self.on_error:
                await self.on_error(e)
            raise MCPTransportException("Failed to send request") from e

    async def close(self) -> None:
        """Close the transport and clean up resources."""
        await self.disconnect()
