# MCP v2 Java Client

A comprehensive, production-ready Java client library for the Model Context Protocol (MCP) v2.

## Features

- **Multiple Transport Support**: HTTP, WebSocket, and gRPC transports
- **Reactive Programming**: Built on Project Reactor for non-blocking operations
- **Type Safety**: Full type safety with comprehensive Java types
- **Event System**: Event-driven architecture with customizable listeners
- **Context Management**: Advanced context handling with TTL and priority
- **Caching**: Built-in response caching capabilities
- **Metrics**: Comprehensive metrics collection and reporting
- **Retry Logic**: Configurable retry mechanisms with exponential backoff
- **Connection Management**: Robust connection handling with automatic reconnection
- **Thread Safety**: Fully thread-safe implementation
- **Logging**: Configurable logging with SLF4J

## Quick Start

### Maven Dependency

```xml
<dependency>
    <groupId>com.mcp.v2</groupId>
    <artifactId>mcp-v2-java-client</artifactId>
    <version>2.0.0</version>
</dependency>
```

### Basic Usage

```java
import com.mcp.v2.client.MCPClient;
import com.mcp.v2.client.factory.MCPClientFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

// Create an HTTP client
MCPClient client = MCPClientFactory.createHttpClient("http://localhost:8080/mcp")
    .clientId("my-application")
    .enableMetrics(true)
    .enableCaching(true)
    .build();

// Connect to server
client.connect().thenRun(() -> {
    System.out.println("Connected to MCP server!");
});

// Send a request
ObjectMapper mapper = new ObjectMapper();
ObjectNode params = mapper.createObjectNode();
params.put("query", "Hello, World!");

client.send("echo", params)
    .thenAccept(response -> {
        if (response.isSuccess()) {
            System.out.println("Response: " + response.getResult());
        } else {
            System.err.println("Error: " + response.getError().getMessage());
        }
    })
    .exceptionally(throwable -> {
        System.err.println("Request failed: " + throwable.getMessage());
        return null;
    });
```

### WebSocket Client

```java
// Create WebSocket client with event handling
MCPClient wsClient = MCPClientFactory.createWebSocketClient("ws://localhost:8080/mcp")
    .clientId("websocket-client")
    .enableLogging(true)
    .build();

// Subscribe to events
wsClient.events()
    .filter(event -> event.getType() == MCPTypes.EventType.RESPONSE_RECEIVED)
    .subscribe(event -> System.out.println("Received response: " + event.getData()));

// Connect and start listening
wsClient.connect().join();
```

### Reactive Programming

```java
import reactor.core.publisher.Mono;

// Use reactive streams for non-blocking operations
Mono<MCPTypes.MCPResponse> responseMono = client.sendReactive("search", params);

responseMono
    .map(MCPTypes.MCPResponse::getResult)
    .doOnNext(result -> System.out.println("Result: " + result))
    .doOnError(error -> System.err.println("Error: " + error.getMessage()))
    .subscribe();
```

## Advanced Configuration

### Production Client

```java
MCPClient prodClient = MCPClientFactory.createProductionClient("http", "https://api.example.com/mcp")
    .clientId("prod-client-v1.0")
    .metadata("environment", "production")
    .metadata("region", "us-east-1")
    .defaultContext(new MCPTypes.ContextInfo("session-123", "user-456", "prod-client"))
    .build();
```

### Custom Transport Configuration

```java
MCPTypes.TransportConfig transport = new MCPTypes.TransportConfig("http", "http://localhost:8080/mcp");
transport.setTimeout(45000);
transport.setRetryAttempts(5);
transport.setEnableMetrics(true);

MCPClient customClient = MCPClientFactory.createHttpClient("http://localhost:8080/mcp")
    .transport(transport)
    .enableCaching(false)
    .build();
```

### Event Handling

```java
// Add event listeners
client.addEventListener(MCPTypes.EventType.CONNECTION_OPENED, event -> {
    System.out.println("Connected at: " + event.getTimestamp());
});

client.addEventListener(MCPTypes.EventType.ERROR_OCCURRED, event -> {
    System.err.println("Error occurred: " + event.getData());
});

client.addEventListener(MCPTypes.EventType.RESPONSE_RECEIVED, event -> {
    System.out.println("Response received: " + event.getData());
});
```

### Context Management

```java
// Create context with metadata
MCPTypes.ContextInfo context = new MCPTypes.ContextInfo("session-123", "user-456", "client-789");
context.setTtl(3600L); // 1 hour TTL
context.setPriority(1); // High priority
context.setTags(new String[]{"production", "critical"});

Map<String, Object> metadata = new HashMap<>();
metadata.put("userRole", "admin");
metadata.put("requestSource", "web-ui");
context.setMetadata(metadata);

// Update client context
client.updateContext(context);
```

### Metrics Collection

```java
// Get client metrics
JsonNode metrics = client.getMetrics();
System.out.println("Total requests: " + metrics.get("requestsTotal"));
System.out.println("Total responses: " + metrics.get("responsesTotal"));
System.out.println("Connection status: " + metrics.get("connectionStatus"));
```

## Error Handling

The library provides comprehensive error handling with specific exception types:

```java
try {
    MCPTypes.MCPResponse response = client.send("method", params).get();
    // Handle successful response
} catch (MCPClientException e) {
    System.err.println("Client error: " + e.getMessage());
    System.err.println("Error code: " + e.getErrorCode());
    System.err.println("Error type: " + e.getErrorType());
} catch (MCPTransportException e) {
    System.err.println("Transport error: " + e.getMessage());
} catch (MCPContextException e) {
    System.err.println("Context error: " + e.getMessage());
}
```

## Transport Types

### HTTP Transport

Best for request-response patterns and stateless operations:

```java
MCPClient httpClient = MCPClientFactory.createHttpClient("http://localhost:8080/mcp")
    .build();
```

### WebSocket Transport

Ideal for real-time, bidirectional communication:

```java
MCPClient wsClient = MCPClientFactory.createWebSocketClient("ws://localhost:8080/mcp")
    .build();
```

## Thread Safety

All client implementations are fully thread-safe and can be safely used across multiple threads:

```java
// Safe to use from multiple threads
ExecutorService executor = Executors.newFixedThreadPool(10);

for (int i = 0; i < 100; i++) {
    final int requestId = i;
    executor.submit(() -> {
        ObjectNode params = mapper.createObjectNode();
        params.put("id", requestId);
        
        client.send("process", params)
            .thenAccept(response -> System.out.println("Processed: " + requestId));
    });
}
```

## Requirements

- Java 17 or higher
- Maven 3.6+ or Gradle 7+

## Dependencies

The library uses the following key dependencies:

- **Jackson**: JSON serialization/deserialization
- **OkHttp**: HTTP client implementation
- **Netty**: WebSocket and gRPC transport
- **Project Reactor**: Reactive programming support
- **SLF4J**: Logging facade
- **Jedis**: Redis client for caching (optional)

## Building

```bash
# Build the library
mvn clean compile

# Run tests
mvn test

# Create JAR
mvn package

# Install to local repository
mvn install
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### 2.0.0

- Initial release of MCP v2 Java client
- Support for HTTP and WebSocket transports
- Reactive programming support with Project Reactor
- Comprehensive event system
- Advanced context management
- Built-in caching and metrics
- Full thread safety
- Production-ready error handling and retry logic
