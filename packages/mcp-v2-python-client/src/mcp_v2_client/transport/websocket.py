"""
WebSocket transport implementation for MCP v2.
"""

import asyncio
import json
import logging
from typing import Optional

import websockets
from websockets.exceptions import WebSocketException

from .base import MCPTransport
from ..types import MCPRequest, MCPResponse, TransportConfig
from ..exceptions import MCPTransportException

logger = logging.getLogger(__name__)


class WebSocketTransport(MCPTransport):
    """WebSocket transport implementation for MCP v2."""

    def __init__(self, config: TransportConfig) -> None:
        super().__init__(config)
        self._websocket: Optional[websockets.WebSocketServerProtocol] = None
        self._connected = False
        self._receive_task: Optional[asyncio.Task] = None

    async def connect(self) -> None:
        """Connect to the WebSocket endpoint."""
        try:
            self._websocket = await websockets.connect(
                self._config.endpoint,
                ping_interval=30,
                ping_timeout=10,
                close_timeout=5,
            )
            
            self._connected = True
            self._receive_task = asyncio.create_task(self._receive_messages())
            
            if self.on_connect:
                await self.on_connect()
                
            logger.info(f"Connected to WebSocket endpoint: {self._config.endpoint}")
            
        except Exception as e:
            self._connected = False
            if self.on_error:
                await self.on_error(e)
            raise MCPTransportException("WebSocket connection failed") from e

    async def disconnect(self) -> None:
        """Disconnect from the WebSocket endpoint."""
        self._connected = False
        
        if self._receive_task is not None:
            self._receive_task.cancel()
            try:
                await self._receive_task
            except asyncio.CancelledError:
                pass
            self._receive_task = None

        if self._websocket is not None:
            await self._websocket.close()
            self._websocket = None
            
        if self.on_disconnect:
            await self.on_disconnect()
            
        logger.info("Disconnected from WebSocket endpoint")

    def is_connected(self) -> bool:
        """Check if the transport is connected."""
        return (
            self._connected 
            and self._websocket is not None 
            and not self._websocket.closed
        )

    async def send(self, request: MCPRequest) -> None:
        """Send a request message."""
        if not self.is_connected():
            raise MCPTransportException("Transport not connected")

        if self._websocket is None:
            raise MCPTransportException("WebSocket not initialized")

        try:
            # Convert request to JSON
            request_data = request.dict()
            json_data = json.dumps(request_data, default=str)
            
            await self._websocket.send(json_data)
            
        except WebSocketException as e:
            if self.on_error:
                await self.on_error(e)
            raise MCPTransportException("Failed to send WebSocket message") from e

    async def _receive_messages(self) -> None:
        """Receive messages from the WebSocket."""
        if self._websocket is None:
            return

        try:
            async for message in self._websocket:
                try:
                    response_data = json.loads(message)
                    mcp_response = MCPResponse(**response_data)
                    
                    if self.on_message:
                        await self.on_message(mcp_response)
                        
                except Exception as e:
                    logger.error(f"Failed to parse WebSocket message: {message}")
                    if self.on_error:
                        await self.on_error(e)
                        
        except WebSocketException as e:
            logger.error(f"WebSocket error: {e}")
            if self.on_error:
                await self.on_error(e)
        except asyncio.CancelledError:
            logger.debug("WebSocket receive task cancelled")
        finally:
            self._connected = False

    async def close(self) -> None:
        """Close the transport and clean up resources."""
        await self.disconnect()
