# MCP v2 Python Client

A comprehensive, production-ready Python client library for the Model Context Protocol (MCP) v2.

## Features

- **Multiple Transport Support**: HTTP, WebSocket, and gRPC transports
- **Async/Await Support**: Built on asyncio for non-blocking operations  
- **Type Safety**: Full type safety with Pydantic models
- **Event System**: Event-driven architecture with async iterators
- **Context Management**: Advanced context handling with TTL and priority
- **Caching**: Built-in response caching capabilities
- **Metrics**: Comprehensive metrics collection and reporting
- **Retry Logic**: Configurable retry mechanisms with exponential backoff
- **Connection Management**: Robust connection handling with automatic reconnection
- **Structured Logging**: Configurable logging with structlog
- **Production Ready**: Comprehensive error handling and resource management

## Requirements

- Python 3.9 or higher
- Optional: Redis for caching (when using cached clients)

## Installation

```bash
pip install mcp-v2-python-client
```

### Development Installation

```bash
git clone https://github.com/mcp-v2/python-client.git
cd python-client
pip install -e ".[dev]"
```

## Quick Start

### Basic Usage

```python
import asyncio
from mcp_v2_client import MCPClientFactory

async def main():
    # Create an HTTP client
    client = MCPClientFactory.create_http_client("http://localhost:8080/mcp") \
        .client_id("my-application") \
        .enable_metrics(True) \
        .enable_caching(True) \
        .build()

    # Connect to server
    await client.connect()
    print("Connected to MCP server!")

    # Send a request
    response = await client.send("echo", {"message": "Hello, World!"})
    
    if response.is_success:
        print(f"Response: {response.result}")
    else:
        print(f"Error: {response.error.message}")

    # Clean up
    await client.close()

# Run the example
asyncio.run(main())
```

### WebSocket Client

```python
import asyncio
from mcp_v2_client import MCPClientFactory, EventType

async def main():
    # Create WebSocket client with event handling
    client = MCPClientFactory.create_websocket_client("ws://localhost:8080/mcp") \
        .client_id("websocket-client") \
        .enable_logging(True) \
        .build()

    # Add event listener
    def on_response(event):
        print(f"Received response: {event.data}")
    
    client.add_event_listener(EventType.RESPONSE_RECEIVED, on_response)

    # Connect and start listening
    await client.connect()
    
    # Send requests
    await client.send("search", {"query": "test", "limit": 10})
    
    # Listen to events
    async for event in client.events():
        print(f"Event: {event.type} - {event.data}")
        break  # Break after first event for demo

    await client.close()

asyncio.run(main())
```

### Context Management

```python
import asyncio
from mcp_v2_client import MCPClientFactory, ContextInfo

async def main():
    client = MCPClientFactory.create_http_client("http://localhost:8080/mcp").build()
    
    # Create context with metadata
    context = ContextInfo(
        session_id="session-123",
        user_id="user-456", 
        client_id="client-789",
        ttl=3600,  # 1 hour TTL
        priority=1,  # High priority
        tags=["production", "critical"],
        metadata={
            "user_role": "admin",
            "request_source": "web-ui"
        }
    )
    
    # Update client context
    client.update_context(context)
    
    await client.connect()
    
    # All subsequent requests will include this context
    response = await client.send("get_user_data", {"user_id": "456"})
    
    await client.close()

asyncio.run(main())
```

## Advanced Configuration

### Production Client

```python
from mcp_v2_client import MCPClientFactory, ContextInfo

client = MCPClientFactory.create_production_client("http", "https://api.example.com/mcp") \
    .client_id("prod-client-v1.0") \
    .metadata("environment", "production") \
    .metadata("region", "us-east-1") \
    .default_context(ContextInfo(
        session_id="session-123",
        user_id="user-456", 
        client_id="prod-client"
    )) \
    .build()
```

### Custom Transport Configuration

```python
from mcp_v2_client import MCPClientFactory, TransportConfig

transport = TransportConfig(
    type="http",
    endpoint="http://localhost:8080/mcp",
    timeout=45,
    retry_attempts=5,
    enable_metrics=True
)

client = MCPClientFactory.create_http_client("http://localhost:8080/mcp") \
    .transport(transport) \
    .enable_caching(False) \
    .build()
```

### Event Handling

```python
from mcp_v2_client import EventType

# Add event listeners
client.add_event_listener(EventType.CONNECTION_OPENED, 
    lambda event: print(f"Connected at: {event.timestamp}"))

client.add_event_listener(EventType.ERROR_OCCURRED,
    lambda event: print(f"Error occurred: {event.data}"))

client.add_event_listener(EventType.RESPONSE_RECEIVED,
    lambda event: print(f"Response received: {event.data}"))

# Or use async iteration
async for event in client.events():
    if event.type == EventType.ERROR_OCCURRED:
        print(f"Error: {event.data}")
    elif event.type == EventType.RESPONSE_RECEIVED:
        print(f"Response: {event.data}")
```

### Metrics Collection

```python
# Get client metrics
metrics = client.get_metrics()
print(f"Total requests: {metrics['requests_total']}")
print(f"Total responses: {metrics['responses_total']}")
print(f"Connection status: {metrics['connection_status']}")
```

## Error Handling

The library provides comprehensive error handling with specific exception types:

```python
from mcp_v2_client import (
    MCPClientException,
    MCPTransportException, 
    MCPContextException,
    MCPAuthenticationException
)

try:
    response = await client.send("method", {"param": "value"})
    # Handle successful response
except MCPClientException as e:
    print(f"Client error: {e}")
    print(f"Error code: {e.error_code}")
    print(f"Error type: {e.error_type}")
except MCPTransportException as e:
    print(f"Transport error: {e}")
except MCPContextException as e:
    print(f"Context error: {e}")
```

## Transport Types

### HTTP Transport

Best for request-response patterns and stateless operations:

```python
client = MCPClientFactory.create_http_client("http://localhost:8080/mcp").build()
```

### WebSocket Transport

Ideal for real-time, bidirectional communication:

```python
client = MCPClientFactory.create_websocket_client("ws://localhost:8080/mcp").build()
```

## Concurrency

The client is designed for concurrent usage with asyncio:

```python
import asyncio
from mcp_v2_client import MCPClientFactory

async def send_request(client, request_id):
    response = await client.send("process", {"id": request_id})
    print(f"Processed: {request_id}")

async def main():
    client = MCPClientFactory.create_http_client("http://localhost:8080/mcp").build()
    await client.connect()
    
    # Send multiple concurrent requests
    tasks = [send_request(client, i) for i in range(100)]
    await asyncio.gather(*tasks)
    
    await client.close()

asyncio.run(main())
```

## Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=mcp_v2_client

# Run specific test types
pytest -m unit
pytest -m integration
```

## Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/mcp-v2/python-client.git
cd python-client

# Install in development mode
pip install -e ".[dev]"

# Install pre-commit hooks
pre-commit install
```

### Code Quality

```bash
# Format code
black src tests
isort src tests

# Lint code  
flake8 src tests
mypy src

# Run all quality checks
pre-commit run --all-files
```

### Building Documentation

```bash
cd docs
make html
```

## API Reference

### MCPClient

The main client interface providing methods for sending requests and managing connections.

**Methods:**

- `async send_request(request: MCPRequest) -> MCPResponse`
- `async send(method: str, params: Optional[JSONValue] = None) -> MCPResponse`
- `async connect() -> None`
- `async disconnect() -> None`
- `is_connected() -> bool`
- `get_context() -> Optional[ContextInfo]`
- `update_context(context: ContextInfo) -> None`
- `async events() -> AsyncIterator[EventData]`
- `add_event_listener(event_type: EventType, listener: Callable) -> None`
- `remove_event_listener(event_type: EventType, listener: Callable) -> None`
- `get_config() -> ClientConfig`
- `get_metrics() -> Dict[str, Any]`
- `async close() -> None`

### MCPClientFactory

Factory class for creating pre-configured clients.

**Static Methods:**

- `create_http_client(endpoint: str) -> MCPClientBuilder`
- `create_websocket_client(endpoint: str) -> MCPClientBuilder`
- `create_production_client(transport_type: str, endpoint: str) -> MCPClientBuilder`
- `create_development_client(transport_type: str, endpoint: str) -> MCPClientBuilder`
- `create_cached_client(transport_type: str, endpoint: str) -> MCPClientBuilder`

### Data Types

- **MCPRequest**: Request message structure
- **MCPResponse**: Response message structure  
- **MCPError**: Error information structure
- **ContextInfo**: Context metadata for requests
- **EventData**: Event information structure
- **TransportConfig**: Transport configuration
- **ClientConfig**: Client configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`pytest`)
6. Ensure code quality (`pre-commit run --all-files`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### 2.0.0

- Initial release of MCP v2 Python client
- Support for HTTP and WebSocket transports
- Async/await support with asyncio
- Full type safety with Pydantic models
- Comprehensive event system with async iterators
- Advanced context management
- Built-in caching and metrics
- Production-ready error handling and retry logic
- Structured logging support
- Comprehensive test suite and documentation
