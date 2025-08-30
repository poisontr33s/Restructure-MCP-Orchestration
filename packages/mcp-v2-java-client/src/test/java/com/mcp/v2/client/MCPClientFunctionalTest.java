package com.mcp.v2.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mcp.v2.client.factory.MCPClientFactory;
import com.mcp.v2.client.types.MCPTypes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Functional tests for MCP v2 Java client.
 */
public class MCPClientFunctionalTest {

    private ObjectMapper objectMapper;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        objectMapper = new ObjectMapper();
    }

    @Test
    void testClientCreation() {
        // Test HTTP client creation
        MCPClient httpClient = MCPClientFactory.createHttpClient("http://localhost:8080/mcp")
                .clientId("test-client")
                .enableMetrics(true)
                .build();
        
        assertNotNull(httpClient);
        assertEquals("test-client", httpClient.getConfig().getClientId());
        assertTrue(httpClient.getConfig().isEnableMetrics());
        assertFalse(httpClient.isConnected());
    }

    @Test
    void testWebSocketClientCreation() {
        // Test WebSocket client creation
        MCPClient wsClient = MCPClientFactory.createWebSocketClient("ws://localhost:8080/mcp")
                .clientId("ws-test-client")
                .enableCaching(false)
                .build();
        
        assertNotNull(wsClient);
        assertEquals("ws-test-client", wsClient.getConfig().getClientId());
        assertFalse(wsClient.getConfig().isEnableCaching());
    }

    @Test
    void testProductionClientConfiguration() {
        MCPClient prodClient = MCPClientFactory.createProductionClient("http", "https://api.example.com/mcp")
                .clientId("prod-client")
                .metadata("environment", "production")
                .build();
        
        assertNotNull(prodClient);
        assertEquals("prod-client", prodClient.getConfig().getClientId());
        assertTrue(prodClient.getConfig().isEnableMetrics());
        assertTrue(prodClient.getConfig().isEnableCaching());
        assertTrue(prodClient.getConfig().isEnableLogging());
        assertEquals("production", prodClient.getConfig().getMetadata().get("environment"));
    }

    @Test
    void testContextManagement() {
        MCPClient client = MCPClientFactory.createHttpClient("http://localhost:8080/mcp")
                .build();
        
        // Test initial context
        assertNull(client.getContext());
        
        // Test context update
        MCPTypes.ContextInfo context = new MCPTypes.ContextInfo("session-123", "user-456", "client-789");
        context.setTtl(3600L);
        context.setPriority(1);
        
        client.updateContext(context);
        
        MCPTypes.ContextInfo retrievedContext = client.getContext();
        assertNotNull(retrievedContext);
        assertEquals("session-123", retrievedContext.getSessionId());
        assertEquals("user-456", retrievedContext.getUserId());
        assertEquals("client-789", retrievedContext.getClientId());
        assertEquals(3600L, retrievedContext.getTtl());
        assertEquals(1, retrievedContext.getPriority());
    }

    @Test
    void testEventSystem() {
        MCPClient client = MCPClientFactory.createHttpClient("http://localhost:8080/mcp")
                .build();
        
        // Test event subscription
        boolean[] eventReceived = {false};
        client.addEventListener(MCPTypes.EventType.CONTEXT_UPDATED, event -> {
            eventReceived[0] = true;
            assertEquals(MCPTypes.EventType.CONTEXT_UPDATED, event.getType());
        });
        
        // Trigger event
        MCPTypes.ContextInfo context = new MCPTypes.ContextInfo("test", "test", "test");
        client.updateContext(context);
        
        // Verify event was received
        assertTrue(eventReceived[0]);
    }

    @Test
    void testRequestCreation() {
        ObjectNode params = objectMapper.createObjectNode();
        params.put("query", "test");
        params.put("limit", 10);
        
        MCPTypes.MCPRequest request = new MCPTypes.MCPRequest("test-id", "search", params);
        
        assertNotNull(request);
        assertEquals("test-id", request.getId());
        assertEquals("search", request.getMethod());
        assertEquals("2.0", request.getJsonrpc());
        assertEquals("2.0", request.getVersion());
        assertNotNull(request.getTimestamp());
        assertEquals(params, request.getParams());
    }

    @Test
    void testResponseCreation() {
        ObjectNode result = objectMapper.createObjectNode();
        result.put("status", "success");
        result.put("count", 5);
        
        MCPTypes.MCPResponse response = new MCPTypes.MCPResponse("test-id", result);
        
        assertNotNull(response);
        assertEquals("test-id", response.getId());
        assertEquals("2.0", response.getJsonrpc());
        assertEquals("2.0", response.getVersion());
        assertNotNull(response.getTimestamp());
        assertEquals(result, response.getResult());
        assertTrue(response.isSuccess());
        assertNull(response.getError());
    }

    @Test
    void testErrorResponse() {
        MCPTypes.MCPError error = new MCPTypes.MCPError(
                MCPTypes.ErrorCodes.METHOD_NOT_FOUND, 
                "Method not found", 
                "METHOD_NOT_FOUND"
        );
        
        MCPTypes.MCPResponse response = new MCPTypes.MCPResponse("test-id", error);
        
        assertNotNull(response);
        assertEquals("test-id", response.getId());
        assertFalse(response.isSuccess());
        assertNotNull(response.getError());
        assertEquals(MCPTypes.ErrorCodes.METHOD_NOT_FOUND, response.getError().getCode());
        assertEquals("Method not found", response.getError().getMessage());
        assertEquals("METHOD_NOT_FOUND", response.getError().getType());
    }

    @Test
    void testTransportConfiguration() {
        MCPTypes.TransportConfig transport = new MCPTypes.TransportConfig("http", "http://localhost:8080/mcp");
        transport.setTimeout(45000);
        transport.setRetryAttempts(5);
        transport.setEnableMetrics(true);
        
        assertEquals("http", transport.getType());
        assertEquals("http://localhost:8080/mcp", transport.getEndpoint());
        assertEquals(45000, transport.getTimeout());
        assertEquals(5, transport.getRetryAttempts());
        assertTrue(transport.isEnableMetrics());
    }

    @Test
    void testClientConfiguration() {
        MCPTypes.TransportConfig transport = new MCPTypes.TransportConfig("http", "http://localhost:8080/mcp");
        MCPTypes.ClientConfig config = new MCPTypes.ClientConfig("test-client", transport);
        config.setEnableCaching(false);
        config.setEnableMetrics(true);
        config.setEnableLogging(true);
        
        assertEquals("test-client", config.getClientId());
        assertEquals("2.0", config.getVersion());
        assertEquals(transport, config.getTransport());
        assertFalse(config.isEnableCaching());
        assertTrue(config.isEnableMetrics());
        assertTrue(config.isEnableLogging());
    }

    @Test
    void testEventTypes() {
        assertEquals("request.sent", MCPTypes.EventType.REQUEST_SENT.getValue());
        assertEquals("response.received", MCPTypes.EventType.RESPONSE_RECEIVED.getValue());
        assertEquals("error.occurred", MCPTypes.EventType.ERROR_OCCURRED.getValue());
        assertEquals("connection.opened", MCPTypes.EventType.CONNECTION_OPENED.getValue());
        assertEquals("connection.closed", MCPTypes.EventType.CONNECTION_CLOSED.getValue());
        assertEquals("context.updated", MCPTypes.EventType.CONTEXT_UPDATED.getValue());
    }

    @Test
    void testErrorCodes() {
        assertEquals(-32700, MCPTypes.ErrorCodes.PARSE_ERROR);
        assertEquals(-32600, MCPTypes.ErrorCodes.INVALID_REQUEST);
        assertEquals(-32601, MCPTypes.ErrorCodes.METHOD_NOT_FOUND);
        assertEquals(-32602, MCPTypes.ErrorCodes.INVALID_PARAMS);
        assertEquals(-32603, MCPTypes.ErrorCodes.INTERNAL_ERROR);
        assertEquals(-32100, MCPTypes.ErrorCodes.CONTEXT_INVALID);
        assertEquals(-32200, MCPTypes.ErrorCodes.TRANSPORT_ERROR);
        assertEquals(-32300, MCPTypes.ErrorCodes.AUTHENTICATION_ERROR);
    }

    @Test
    void testClientMetrics() {
        MCPClient client = MCPClientFactory.createHttpClient("http://localhost:8080/mcp")
                .enableMetrics(true)
                .build();
        
        // Get initial metrics
        var metrics = client.getMetrics();
        assertNotNull(metrics);
        
        if (client.getConfig().isEnableMetrics()) {
            assertTrue(metrics.has("clientId"));
            assertTrue(metrics.has("version"));
            assertTrue(metrics.has("startTime"));
        }
    }

    @Test
    void testClientClose() {
        MCPClient client = MCPClientFactory.createHttpClient("http://localhost:8080/mcp")
                .build();
        
        // Should not throw exception
        assertDoesNotThrow(() -> client.close());
    }
}
