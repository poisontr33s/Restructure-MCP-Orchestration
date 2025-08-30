"""
MCP v2 Client interface and base implementation.
"""

import asyncio
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, AsyncIterator, Callable, Dict, List, Optional, Union
import logging
import weakref
from uuid import uuid4

from .types import (
    MCPRequest,
    MCPResponse,
    MCPError,
    ContextInfo,
    EventType,
    EventData,
    ClientConfig,
    JSONValue,
)
from .exceptions import MCPClientException, MCPContextException
from .transport.base import MCPTransport

logger = logging.getLogger(__name__)


class MCPClient(ABC):
    """Base interface for all MCP v2 clients."""

    @abstractmethod
    async def send_request(self, request: MCPRequest) -> MCPResponse:
        """Send a request and return the response."""
        pass

    @abstractmethod
    async def send(self, method: str, params: Optional[JSONValue] = None) -> MCPResponse:
        """Send a request with specified method and parameters."""
        pass

    @abstractmethod
    async def connect(self) -> None:
        """Connect to the MCP server."""
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        """Disconnect from the MCP server."""
        pass

    @abstractmethod
    def is_connected(self) -> bool:
        """Check if the client is connected."""
        pass

    @abstractmethod
    def get_context(self) -> Optional[ContextInfo]:
        """Get the current context information."""
        pass

    @abstractmethod
    def update_context(self, context: ContextInfo) -> None:
        """Update the context information."""
        pass

    @abstractmethod
    async def events(self) -> AsyncIterator[EventData]:
        """Subscribe to events from the client."""
        pass

    @abstractmethod
    def add_event_listener(
        self, event_type: EventType, listener: Callable[[EventData], None]
    ) -> None:
        """Add an event listener."""
        pass

    @abstractmethod
    def remove_event_listener(
        self, event_type: EventType, listener: Callable[[EventData], None]
    ) -> None:
        """Remove an event listener."""
        pass

    @abstractmethod
    def get_config(self) -> ClientConfig:
        """Get client configuration."""
        pass

    @abstractmethod
    def get_metrics(self) -> Dict[str, Any]:
        """Get client metrics if enabled."""
        pass

    @abstractmethod
    async def close(self) -> None:
        """Close the client and clean up resources."""
        pass


class BaseMCPClient(MCPClient):
    """Base implementation of the MCP v2 client."""

    def __init__(self, config: ClientConfig, transport: MCPTransport) -> None:
        self._config = config
        self._transport = transport
        self._current_context = config.default_context
        self._connected = False
        self._closed = False
        
        # Event system
        self._event_listeners: Dict[EventType, List[Callable[[EventData], None]]] = {}
        self._event_queue: asyncio.Queue[EventData] = asyncio.Queue()
        
        # Pending requests
        self._pending_requests: Dict[str, asyncio.Future[MCPResponse]] = {}
        
        # Metrics
        self._metrics = {
            "client_id": config.client_id,
            "version": config.version,
            "start_time": datetime.utcnow(),
            "requests_total": 0,
            "responses_total": 0,
            "errors_total": 0,
            "connection_status": "disconnected",
        }
        
        # Set up transport event handling
        self._setup_transport_handlers()

    def _setup_transport_handlers(self) -> None:
        """Set up transport event handling."""
        
        async def on_message(response: MCPResponse) -> None:
            await self._handle_message(response)
        
        async def on_connect() -> None:
            self._connected = True
            self._update_metric("connection_status", "connected")
            await self._emit_event(EventType.CONNECTION_OPENED, {"message": "Connection established"})
        
        async def on_disconnect() -> None:
            self._connected = False
            self._update_metric("connection_status", "disconnected")
            await self._emit_event(EventType.CONNECTION_CLOSED, {"message": "Connection closed"})
        
        async def on_error(error: Exception) -> None:
            await self._handle_error(error)
        
        self._transport.on_message = on_message
        self._transport.on_connect = on_connect
        self._transport.on_disconnect = on_disconnect
        self._transport.on_error = on_error

    async def send_request(self, request: MCPRequest) -> MCPResponse:
        """Send a request and return the response."""
        self._validate_request(request)
        self._enrich_request(request)
        
        # Create future for response
        future: asyncio.Future[MCPResponse] = asyncio.Future()
        self._pending_requests[request.id] = future
        
        try:
            if self._config.enable_metrics:
                self._metrics["requests_total"] += 1
            
            await self._emit_event(EventType.REQUEST_SENT, request.dict())
            await self._transport.send(request)
            
            # Wait for response with timeout
            timeout = self._config.transport.timeout
            response = await asyncio.wait_for(future, timeout=timeout)
            
            if self._config.enable_metrics:
                self._metrics["responses_total"] += 1
            
            await self._emit_event(EventType.RESPONSE_RECEIVED, response.dict())
            return response
            
        except asyncio.TimeoutError:
            self._pending_requests.pop(request.id, None)
            error = MCPClientException(f"Request timed out after {timeout} seconds")
            await self._handle_error(error)
            raise error
        except Exception as e:
            self._pending_requests.pop(request.id, None)
            await self._handle_error(e)
            raise

    async def send(self, method: str, params: Optional[JSONValue] = None) -> MCPResponse:
        """Send a request with specified method and parameters."""
        request = MCPRequest(
            id=str(uuid4()),
            method=method,
            params=params,
        )
        return await self.send_request(request)

    async def connect(self) -> None:
        """Connect to the MCP server."""
        if self._closed:
            raise MCPClientException("Client has been closed")
        
        await self._transport.connect()
        logger.info(f"Connected to MCP server: {self._config.transport.endpoint}")

    async def disconnect(self) -> None:
        """Disconnect from the MCP server."""
        await self._transport.disconnect()
        self._connected = False
        logger.info("Disconnected from MCP server")

    def is_connected(self) -> bool:
        """Check if the client is connected."""
        return self._connected and self._transport.is_connected()

    def get_context(self) -> Optional[ContextInfo]:
        """Get the current context information."""
        return self._current_context

    def update_context(self, context: ContextInfo) -> None:
        """Update the context information."""
        self._current_context = context
        asyncio.create_task(self._emit_event(EventType.CONTEXT_UPDATED, context.dict()))

    async def events(self) -> AsyncIterator[EventData]:
        """Subscribe to events from the client."""
        while not self._closed:
            try:
                event = await asyncio.wait_for(self._event_queue.get(), timeout=1.0)
                yield event
            except asyncio.TimeoutError:
                continue

    def add_event_listener(
        self, event_type: EventType, listener: Callable[[EventData], None]
    ) -> None:
        """Add an event listener."""
        if event_type not in self._event_listeners:
            self._event_listeners[event_type] = []
        self._event_listeners[event_type].append(listener)

    def remove_event_listener(
        self, event_type: EventType, listener: Callable[[EventData], None]
    ) -> None:
        """Remove an event listener."""
        if event_type in self._event_listeners:
            try:
                self._event_listeners[event_type].remove(listener)
            except ValueError:
                pass

    def get_config(self) -> ClientConfig:
        """Get client configuration."""
        return self._config

    def get_metrics(self) -> Dict[str, Any]:
        """Get client metrics if enabled."""
        if not self._config.enable_metrics:
            return {}
        
        # Update runtime metrics
        current_metrics = self._metrics.copy()
        current_metrics.update({
            "timestamp": datetime.utcnow(),
            "connected": self.is_connected(),
            "pending_requests": len(self._pending_requests),
        })
        
        return current_metrics

    async def close(self) -> None:
        """Close the client and clean up resources."""
        if self._closed:
            return
        
        self._closed = True
        
        try:
            await self.disconnect()
        except Exception as e:
            logger.warning(f"Error during disconnect: {e}")
        
        # Cancel pending requests
        for future in self._pending_requests.values():
            if not future.done():
                future.cancel()
        self._pending_requests.clear()
        
        # Clear event listeners
        self._event_listeners.clear()
        
        # Close transport
        await self._transport.close()

    def _validate_request(self, request: MCPRequest) -> None:
        """Validate a request before sending."""
        if not request.id or not request.id.strip():
            raise MCPClientException("Request ID cannot be null or empty")
        if not request.method or not request.method.strip():
            raise MCPClientException("Request method cannot be null or empty")
        if not self.is_connected():
            raise MCPClientException("Client is not connected")

    def _enrich_request(self, request: MCPRequest) -> None:
        """Enrich a request with additional information."""
        # Set current context if not provided
        if request.context is None and self._current_context is not None:
            request.context = self._current_context
        
        # Add client metadata
        if request.metadata is None:
            request.metadata = {}
        request.metadata.update({
            "client_id": self._config.client_id,
            "client_version": self._config.version,
        })

    async def _handle_message(self, response: MCPResponse) -> None:
        """Handle incoming response message."""
        try:
            future = self._pending_requests.pop(response.id, None)
            if future is not None:
                if response.is_success:
                    future.set_result(response)
                else:
                    error = MCPClientException(
                        message=response.error.message if response.error else "Unknown error",
                        error_code=response.error.code if response.error else -1,
                        error_type=response.error.type if response.error else "UNKNOWN",
                    )
                    future.set_exception(error)
            else:
                logger.warning(f"Received response for unknown request ID: {response.id}")
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            await self._handle_error(e)

    async def _handle_error(self, error: Exception) -> None:
        """Handle error events."""
        logger.error(f"Client error: {error}")
        
        if self._config.enable_metrics:
            self._metrics["errors_total"] += 1
        
        await self._emit_event(EventType.ERROR_OCCURRED, {
            "error": str(error),
            "error_type": type(error).__name__,
        })

    async def _emit_event(self, event_type: EventType, data: Any) -> None:
        """Emit an event to listeners and event stream."""
        event_data = EventData(
            type=event_type,
            data=data,
            source=self._config.client_id,
        )
        
        # Add to event queue
        try:
            self._event_queue.put_nowait(event_data)
        except asyncio.QueueFull:
            logger.warning("Event queue is full, dropping event")
        
        # Notify event listeners
        listeners = self._event_listeners.get(event_type, [])
        for listener in listeners:
            try:
                listener(event_data)
            except Exception as e:
                logger.warning(f"Error in event listener: {e}")

    def _update_metric(self, key: str, value: Any) -> None:
        """Update a metric value."""
        if self._config.enable_metrics:
            self._metrics[key] = value
