/**
 * MCP v2 Java Client Library
 * 
 * This package provides a comprehensive, type-safe implementation of the MCP v2 protocol
 * for Java applications. It includes:
 * 
 * <ul>
 * <li>Core interfaces and types: {@link com.mcp.v2.client.MCPClient}, {@link com.mcp.v2.client.types.MCPTypes}</li>
 * <li>Factory for creating clients: {@link com.mcp.v2.client.factory.MCPClientFactory}</li>
 * <li>Transport implementations: HTTP, WebSocket, and gRPC transports</li>
 * <li>Event-driven architecture with reactive streams support</li>
 * <li>Comprehensive error handling and logging</li>
 * <li>Metrics and monitoring capabilities</li>
 * </ul>
 * 
 * <h2>Quick Start</h2>
 * <pre>{@code
 * // Create an HTTP client
 * MCPClient client = MCPClientFactory.createHttpClient("http://localhost:8080");
 * 
 * // Send a request
 * MCPTypes.MCPResponse response = client.send(request).block();
 * 
 * // Close the client
 * client.close();
 * }</pre>
 * 
 * <h2>Supported Transports</h2>
 * <ul>
 * <li>HTTP/HTTPS with JSON-RPC 2.0</li>
 * <li>WebSocket for real-time communication</li>
 * <li>gRPC for high-performance scenarios</li>
 * </ul>
 * 
 * <h2>Key Features</h2>
 * <ul>
 * <li>Type-safe protocol implementation</li>
 * <li>Context-aware request handling</li>
 * <li>Reactive streams support with Project Reactor</li>
 * <li>Comprehensive error handling</li>
 * <li>Built-in metrics and monitoring</li>
 * <li>Extensible transport layer</li>
 * <li>Thread-safe implementations</li>
 * </ul>
 * 
 * @author MCP v2 Team
 * @version 2.0.0
 * @since 2.0.0
 */
package com.mcp.v2.client;
