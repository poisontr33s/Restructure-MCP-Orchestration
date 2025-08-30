package com.mcp.v2.client.transport;

import com.mcp.v2.client.types.MCPTypes;

import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

/**
 * Transport interface for MCP v2 communication.
 */
public interface MCPTransport extends AutoCloseable {

    /**
     * Connect to the remote endpoint.
     *
     * @return CompletableFuture indicating connection success
     */
    CompletableFuture<Void> connect();

    /**
     * Disconnect from the remote endpoint.
     *
     * @return CompletableFuture indicating disconnection success
     */
    CompletableFuture<Void> disconnect();

    /**
     * Check if the transport is connected.
     *
     * @return true if connected, false otherwise
     */
    boolean isConnected();

    /**
     * Send a request message.
     *
     * @param request The request to send
     * @return CompletableFuture indicating send success
     */
    CompletableFuture<Void> send(MCPTypes.MCPRequest request);

    /**
     * Set message handler for incoming responses.
     *
     * @param handler Message handler
     */
    void onMessage(Consumer<MCPTypes.MCPResponse> handler);

    /**
     * Set connection event handler.
     *
     * @param handler Connection handler
     */
    void onConnect(Runnable handler);

    /**
     * Set disconnection event handler.
     *
     * @param handler Disconnection handler
     */
    void onDisconnect(Runnable handler);

    /**
     * Set error event handler.
     *
     * @param handler Error handler
     */
    void onError(Consumer<Throwable> handler);

    /**
     * Get transport configuration.
     *
     * @return Transport configuration
     */
    MCPTypes.TransportConfig getConfig();

    /**
     * Close the transport and clean up resources.
     */
    @Override
    void close();
}
