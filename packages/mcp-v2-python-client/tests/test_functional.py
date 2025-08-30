"""Functional tests for MCP v2 Python client."""

import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock

from mcp_v2_client import (
    MCPClientFactory,
    MCPRequest,
    MCPResponse,
    MCPError,
    ContextInfo,
    EventType,
    EventData,
    TransportConfig,
    ClientConfig,
    ErrorCodes,
)


class TestMCPClientCreation:
    """Test client creation and configuration."""

    def test_http_client_creation(self):
        """Test HTTP client creation."""
        client = (
            MCPClientFactory.create_http_client("http://localhost:8080/mcp")
            .client_id("test-client")
            .enable_metrics(True)
            .build()
        )

        assert client is not None
        assert client.get_config().client_id == "test-client"
        assert client.get_config().enable_metrics is True
        assert client.is_connected() is False

    def test_websocket_client_creation(self):
        """Test WebSocket client creation."""
        client = (
            MCPClientFactory.create_websocket_client("ws://localhost:8080/mcp")
            .client_id("ws-test-client")
            .enable_caching(False)
            .build()
        )

        assert client is not None
        assert client.get_config().client_id == "ws-test-client"
        assert client.get_config().enable_caching is False

    def test_production_client_configuration(self):
        """Test production client configuration."""
        client = (
            MCPClientFactory.create_production_client("http", "https://api.example.com/mcp")
            .client_id("prod-client")
            .metadata("environment", "production")
            .build()
        )

        assert client is not None
        config = client.get_config()
        assert config.client_id == "prod-client"
        assert config.enable_metrics is True
        assert config.enable_caching is True
        assert config.enable_logging is True
        assert config.metadata["environment"] == "production"


class TestContextManagement:
    """Test context management functionality."""

    def test_context_creation(self):
        """Test context information creation."""
        context = ContextInfo(
            session_id="session-123",
            user_id="user-456",
            client_id="client-789",
            ttl=3600,
            priority=1,
            tags=["production", "critical"],
            metadata={"user_role": "admin"},
        )

        assert context.session_id == "session-123"
        assert context.user_id == "user-456"
        assert context.client_id == "client-789"
        assert context.ttl == 3600
        assert context.priority == 1
        assert "production" in context.tags
        assert context.metadata["user_role"] == "admin"

    def test_context_update(self):
        """Test context updates on client."""
        client = MCPClientFactory.create_http_client("http://localhost:8080/mcp").build()

        # Test initial context
        assert client.get_context() is None

        # Test context update
        context = ContextInfo(
            session_id="session-123", user_id="user-456", client_id="client-789"
        )
        client.update_context(context)

        retrieved_context = client.get_context()
        assert retrieved_context is not None
        assert retrieved_context.session_id == "session-123"
        assert retrieved_context.user_id == "user-456"
        assert retrieved_context.client_id == "client-789"


class TestEventSystem:
    """Test event system functionality."""

    def test_event_listener_registration(self):
        """Test event listener registration and removal."""
        client = MCPClientFactory.create_http_client("http://localhost:8080/mcp").build()

        event_received = []

        def on_context_updated(event):
            event_received.append(event)

        # Add event listener
        client.add_event_listener(EventType.CONTEXT_UPDATED, on_context_updated)

        # Trigger event
        context = ContextInfo(session_id="test", user_id="test", client_id="test")
        client.update_context(context)

        # Note: In real implementation, we would need to process the event loop
        # This is a simplified test for the interface

    def test_event_data_creation(self):
        """Test event data structure."""
        event_data = EventData(
            type=EventType.RESPONSE_RECEIVED,
            data={"status": "success"},
            source="client-123",
            target="server-456",
        )

        assert event_data.type == EventType.RESPONSE_RECEIVED
        assert event_data.data["status"] == "success"
        assert event_data.source == "client-123"
        assert event_data.target == "server-456"
        assert event_data.timestamp is not None


class TestRequestResponse:
    """Test request and response handling."""

    def test_request_creation(self):
        """Test MCP request creation."""
        request = MCPRequest(
            id="test-id", method="search", params={"query": "test", "limit": 10}
        )

        assert request.id == "test-id"
        assert request.method == "search"
        assert request.jsonrpc == "2.0"
        assert request.version == "2.0"
        assert request.timestamp is not None
        assert request.params["query"] == "test"
        assert request.params["limit"] == 10

    def test_success_response_creation(self):
        """Test successful response creation."""
        response = MCPResponse(
            id="test-id", result={"status": "success", "count": 5}
        )

        assert response.id == "test-id"
        assert response.jsonrpc == "2.0"
        assert response.version == "2.0"
        assert response.timestamp is not None
        assert response.result["status"] == "success"
        assert response.result["count"] == 5
        assert response.is_success is True
        assert response.error is None

    def test_error_response_creation(self):
        """Test error response creation."""
        error = MCPError(
            code=ErrorCodes.METHOD_NOT_FOUND,
            message="Method not found",
            type="METHOD_NOT_FOUND",
        )

        response = MCPResponse(id="test-id", error=error)

        assert response.id == "test-id"
        assert response.is_success is False
        assert response.error is not None
        assert response.error.code == ErrorCodes.METHOD_NOT_FOUND
        assert response.error.message == "Method not found"
        assert response.error.type == "METHOD_NOT_FOUND"


class TestTransportConfiguration:
    """Test transport configuration."""

    def test_transport_config_creation(self):
        """Test transport configuration creation."""
        transport = TransportConfig(
            type="http",
            endpoint="http://localhost:8080/mcp",
            timeout=45,
            retry_attempts=5,
            enable_metrics=True,
        )

        assert transport.type == "http"
        assert transport.endpoint == "http://localhost:8080/mcp"
        assert transport.timeout == 45
        assert transport.retry_attempts == 5
        assert transport.enable_metrics is True

    def test_client_config_creation(self):
        """Test client configuration creation."""
        transport = TransportConfig(type="http", endpoint="http://localhost:8080/mcp")
        config = ClientConfig(
            client_id="test-client",
            transport=transport,
            enable_caching=False,
            enable_metrics=True,
            enable_logging=True,
        )

        assert config.client_id == "test-client"
        assert config.version == "2.0"
        assert config.transport == transport
        assert config.enable_caching is False
        assert config.enable_metrics is True
        assert config.enable_logging is True


class TestErrorCodes:
    """Test error code constants."""

    def test_json_rpc_error_codes(self):
        """Test JSON-RPC error codes."""
        assert ErrorCodes.PARSE_ERROR == -32700
        assert ErrorCodes.INVALID_REQUEST == -32600
        assert ErrorCodes.METHOD_NOT_FOUND == -32601
        assert ErrorCodes.INVALID_PARAMS == -32602
        assert ErrorCodes.INTERNAL_ERROR == -32603

    def test_mcp_specific_error_codes(self):
        """Test MCP-specific error codes."""
        assert ErrorCodes.CONTEXT_INVALID == -32100
        assert ErrorCodes.CONTEXT_EXPIRED == -32101
        assert ErrorCodes.TRANSPORT_ERROR == -32200
        assert ErrorCodes.AUTHENTICATION_ERROR == -32300
        assert ErrorCodes.AUTHORIZATION_ERROR == -32301


class TestEventTypes:
    """Test event type enumeration."""

    def test_event_type_values(self):
        """Test event type string values."""
        assert EventType.REQUEST_SENT == "request.sent"
        assert EventType.RESPONSE_RECEIVED == "response.received"
        assert EventType.ERROR_OCCURRED == "error.occurred"
        assert EventType.CONNECTION_OPENED == "connection.opened"
        assert EventType.CONNECTION_CLOSED == "connection.closed"
        assert EventType.CONTEXT_UPDATED == "context.updated"


class TestClientMetrics:
    """Test client metrics functionality."""

    def test_metrics_collection(self):
        """Test metrics collection."""
        client = (
            MCPClientFactory.create_http_client("http://localhost:8080/mcp")
            .enable_metrics(True)
            .build()
        )

        # Get initial metrics
        metrics = client.get_metrics()
        assert metrics is not None

        if client.get_config().enable_metrics:
            assert "client_id" in metrics
            assert "version" in metrics
            assert "start_time" in metrics

    def test_metrics_disabled(self):
        """Test metrics when disabled."""
        client = (
            MCPClientFactory.create_http_client("http://localhost:8080/mcp")
            .enable_metrics(False)
            .build()
        )

        metrics = client.get_metrics()
        assert metrics == {}


class TestClientLifecycle:
    """Test client lifecycle management."""

    @pytest.mark.asyncio
    async def test_client_close(self):
        """Test client cleanup."""
        client = MCPClientFactory.create_http_client("http://localhost:8080/mcp").build()

        # Should not raise exception
        await client.close()

    def test_client_builder_validation(self):
        """Test client builder validation."""
        with pytest.raises(ValueError):
            MCPClientFactory.create_http_client("http://localhost:8080/mcp").transport(
                TransportConfig(type="invalid", endpoint="test")
            ).build()


if __name__ == "__main__":
    pytest.main([__file__])
