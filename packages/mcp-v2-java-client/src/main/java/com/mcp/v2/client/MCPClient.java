package com.mcp.v2.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.mcp.v2.client.types.MCPTypes;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

/**
 * Base interface for all MCP v2 clients.
 */
public interface MCPClient {

    /**
     * Send a request and return a future with the response.
     *
     * @param request The MCP request to send
     * @return CompletableFuture containing the response
     */
    CompletableFuture<MCPTypes.MCPResponse> sendRequest(MCPTypes.MCPRequest request);

    /**
     * Send a request and return a reactive Mono with the response.
     *
     * @param request The MCP request to send
     * @return Mono containing the response
     */
    Mono<MCPTypes.MCPResponse> sendRequestReactive(MCPTypes.MCPRequest request);

    /**
     * Send a request with specified method and parameters.
     *
     * @param method The method name
     * @param params The parameters
     * @return CompletableFuture containing the response
     */
    CompletableFuture<MCPTypes.MCPResponse> send(String method, JsonNode params);

    /**
     * Send a request with specified method and parameters (reactive).
     *
     * @param method The method name
     * @param params The parameters
     * @return Mono containing the response
     */
    Mono<MCPTypes.MCPResponse> sendReactive(String method, JsonNode params);

    /**
     * Connect to the MCP server.
     *
     * @return CompletableFuture indicating connection success
     */
    CompletableFuture<Void> connect();

    /**
     * Disconnect from the MCP server.
     *
     * @return CompletableFuture indicating disconnection success
     */
    CompletableFuture<Void> disconnect();

    /**
     * Check if the client is connected.
     *
     * @return true if connected, false otherwise
     */
    boolean isConnected();

    /**
     * Get the current context information.
     *
     * @return Current context
     */
    MCPTypes.ContextInfo getContext();

    /**
     * Update the context information.
     *
     * @param context New context
     */
    void updateContext(MCPTypes.ContextInfo context);

    /**
     * Subscribe to events from the client.
     *
     * @return Flux of event data
     */
    Flux<MCPTypes.EventData> events();

    /**
     * Add an event listener.
     *
     * @param eventType The event type to listen for
     * @param listener The event listener
     */
    void addEventListener(MCPTypes.EventType eventType, Consumer<MCPTypes.EventData> listener);

    /**
     * Remove an event listener.
     *
     * @param eventType The event type
     * @param listener The listener to remove
     */
    void removeEventListener(MCPTypes.EventType eventType, Consumer<MCPTypes.EventData> listener);

    /**
     * Get client configuration.
     *
     * @return Client configuration
     */
    MCPTypes.ClientConfig getConfig();

    /**
     * Get client metrics if enabled.
     *
     * @return Client metrics as JSON
     */
    JsonNode getMetrics();

    /**
     * Close the client and clean up resources.
     */
    void close();
}
