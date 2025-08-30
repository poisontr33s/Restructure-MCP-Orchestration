package com.mcp.v2.client.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mcp.v2.client.MCPClient;
import com.mcp.v2.client.MCPClientException;
import com.mcp.v2.client.MCPContextException;
import com.mcp.v2.client.transport.MCPTransport;
import com.mcp.v2.client.types.MCPTypes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

/**
 * Base implementation of the MCP v2 client.
 */
public abstract class BaseMCPClient implements MCPClient {
    
    protected static final Logger logger = LoggerFactory.getLogger(BaseMCPClient.class);
    protected static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    protected final MCPTypes.ClientConfig config;
    protected final MCPTransport transport;
    protected final Map<String, CompletableFuture<MCPTypes.MCPResponse>> pendingRequests;
    protected final Map<MCPTypes.EventType, CopyOnWriteArrayList<Consumer<MCPTypes.EventData>>> eventListeners;
    protected final Sinks.Many<MCPTypes.EventData> eventSink;
    protected final Flux<MCPTypes.EventData> eventFlux;
    
    // Metrics
    protected final AtomicLong requestCounter = new AtomicLong(0);
    protected final AtomicLong responseCounter = new AtomicLong(0);
    protected final AtomicLong errorCounter = new AtomicLong(0);
    protected final Map<String, Object> metrics = new ConcurrentHashMap<>();

    protected MCPTypes.ContextInfo currentContext;
    protected volatile boolean connected = false;

    public BaseMCPClient(MCPTypes.ClientConfig config, MCPTransport transport) {
        this.config = config;
        this.transport = transport;
        this.pendingRequests = new ConcurrentHashMap<>();
        this.eventListeners = new ConcurrentHashMap<>();
        this.eventSink = Sinks.many().multicast().onBackpressureBuffer();
        this.eventFlux = eventSink.asFlux();
        this.currentContext = config.getDefaultContext();

        // Initialize metrics
        if (config.isEnableMetrics()) {
            initializeMetrics();
        }

        // Set up transport event handling
        setupTransportEventHandling();
    }

    protected void initializeMetrics() {
        metrics.put("clientId", config.getClientId());
        metrics.put("version", config.getVersion());
        metrics.put("startTime", Instant.now());
        metrics.put("requestsTotal", 0L);
        metrics.put("responsesTotal", 0L);
        metrics.put("errorsTotal", 0L);
        metrics.put("connectionStatus", "disconnected");
    }

    protected void setupTransportEventHandling() {
        transport.onMessage(this::handleMessage);
        transport.onConnect(() -> {
            connected = true;
            updateMetric("connectionStatus", "connected");
            emitEvent(MCPTypes.EventType.CONNECTION_OPENED, createEventData("Connection established"));
        });
        transport.onDisconnect(() -> {
            connected = false;
            updateMetric("connectionStatus", "disconnected");
            emitEvent(MCPTypes.EventType.CONNECTION_CLOSED, createEventData("Connection closed"));
        });
        transport.onError(this::handleTransportError);
    }

    @Override
    public CompletableFuture<MCPTypes.MCPResponse> sendRequest(MCPTypes.MCPRequest request) {
        return sendRequestReactive(request).toFuture();
    }

    @Override
    public Mono<MCPTypes.MCPResponse> sendRequestReactive(MCPTypes.MCPRequest request) {
        return Mono.fromCallable(() -> {
            validateRequest(request);
            enrichRequest(request);
            
            CompletableFuture<MCPTypes.MCPResponse> future = new CompletableFuture<>();
            pendingRequests.put(request.getId(), future);
            
            if (config.isEnableMetrics()) {
                requestCounter.incrementAndGet();
                updateMetric("requestsTotal", requestCounter.get());
            }
            
            emitEvent(MCPTypes.EventType.REQUEST_SENT, createEventData(request));
            
            transport.send(request);
            return future;
        }).flatMap(Mono::fromFuture);
    }

    @Override
    public CompletableFuture<MCPTypes.MCPResponse> send(String method, JsonNode params) {
        MCPTypes.MCPRequest request = new MCPTypes.MCPRequest(
            UUID.randomUUID().toString(),
            method,
            params
        );
        return sendRequest(request);
    }

    @Override
    public Mono<MCPTypes.MCPResponse> sendReactive(String method, JsonNode params) {
        MCPTypes.MCPRequest request = new MCPTypes.MCPRequest(
            UUID.randomUUID().toString(),
            method,
            params
        );
        return sendRequestReactive(request);
    }

    @Override
    public CompletableFuture<Void> connect() {
        return transport.connect().thenRun(() -> {
            logger.info("Connected to MCP server: {}", config.getTransport().getEndpoint());
        });
    }

    @Override
    public CompletableFuture<Void> disconnect() {
        return transport.disconnect().thenRun(() -> {
            connected = false;
            logger.info("Disconnected from MCP server");
        });
    }

    @Override
    public boolean isConnected() {
        return connected && transport.isConnected();
    }

    @Override
    public MCPTypes.ContextInfo getContext() {
        return currentContext;
    }

    @Override
    public void updateContext(MCPTypes.ContextInfo context) {
        this.currentContext = context;
        emitEvent(MCPTypes.EventType.CONTEXT_UPDATED, createEventData(context));
    }

    @Override
    public Flux<MCPTypes.EventData> events() {
        return eventFlux;
    }

    @Override
    public void addEventListener(MCPTypes.EventType eventType, Consumer<MCPTypes.EventData> listener) {
        eventListeners.computeIfAbsent(eventType, k -> new CopyOnWriteArrayList<>()).add(listener);
    }

    @Override
    public void removeEventListener(MCPTypes.EventType eventType, Consumer<MCPTypes.EventData> listener) {
        CopyOnWriteArrayList<Consumer<MCPTypes.EventData>> listeners = eventListeners.get(eventType);
        if (listeners != null) {
            listeners.remove(listener);
        }
    }

    @Override
    public MCPTypes.ClientConfig getConfig() {
        return config;
    }

    @Override
    public JsonNode getMetrics() {
        if (!config.isEnableMetrics()) {
            return objectMapper.createObjectNode();
        }
        
        // Update runtime metrics
        metrics.put("timestamp", Instant.now());
        metrics.put("connected", isConnected());
        metrics.put("pendingRequests", pendingRequests.size());
        
        return objectMapper.valueToTree(metrics);
    }

    @Override
    public void close() {
        try {
            disconnect().get();
        } catch (Exception e) {
            logger.warn("Error during disconnect", e);
        }
        
        pendingRequests.clear();
        eventListeners.clear();
        eventSink.tryEmitComplete();
        
        if (transport != null) {
            transport.close();
        }
    }

    protected void handleMessage(MCPTypes.MCPResponse response) {
        try {
            if (config.isEnableMetrics()) {
                responseCounter.incrementAndGet();
                updateMetric("responsesTotal", responseCounter.get());
            }
            
            emitEvent(MCPTypes.EventType.RESPONSE_RECEIVED, createEventData(response));
            
            CompletableFuture<MCPTypes.MCPResponse> future = pendingRequests.remove(response.getId());
            if (future != null) {
                if (response.isSuccess()) {
                    future.complete(response);
                } else {
                    future.completeExceptionally(new MCPClientException(
                        response.getError().getCode(),
                        response.getError().getMessage(),
                        response.getError().getType()
                    ));
                }
            } else {
                logger.warn("Received response for unknown request ID: {}", response.getId());
            }
        } catch (Exception e) {
            logger.error("Error handling message", e);
            handleError(e);
        }
    }

    protected void handleTransportError(Throwable error) {
        logger.error("Transport error", error);
        handleError(error);
    }

    protected void handleError(Throwable error) {
        if (config.isEnableMetrics()) {
            errorCounter.incrementAndGet();
            updateMetric("errorsTotal", errorCounter.get());
        }
        
        emitEvent(MCPTypes.EventType.ERROR_OCCURRED, createEventData(error));
    }

    protected void validateRequest(MCPTypes.MCPRequest request) {
        if (request.getId() == null || request.getId().trim().isEmpty()) {
            throw new MCPClientException("Request ID cannot be null or empty");
        }
        if (request.getMethod() == null || request.getMethod().trim().isEmpty()) {
            throw new MCPClientException("Request method cannot be null or empty");
        }
        if (!isConnected()) {
            throw new MCPClientException("Client is not connected");
        }
    }

    protected void enrichRequest(MCPTypes.MCPRequest request) {
        // Set current context if not provided
        if (request.getContext() == null && currentContext != null) {
            request.setContext(currentContext);
        }
        
        // Set timestamp if not provided
        if (request.getTimestamp() == null) {
            request.setTimestamp(Instant.now());
        }
        
        // Add client metadata
        if (request.getMetadata() == null) {
            request.setMetadata(new ConcurrentHashMap<>());
        }
        request.getMetadata().put("clientId", config.getClientId());
        request.getMetadata().put("clientVersion", config.getVersion());
    }

    protected void emitEvent(MCPTypes.EventType eventType, JsonNode data) {
        MCPTypes.EventData eventData = new MCPTypes.EventData(eventType, data);
        eventData.setSource(config.getClientId());
        
        // Emit to reactive stream
        eventSink.tryEmitNext(eventData);
        
        // Notify event listeners
        CopyOnWriteArrayList<Consumer<MCPTypes.EventData>> listeners = eventListeners.get(eventType);
        if (listeners != null) {
            for (Consumer<MCPTypes.EventData> listener : listeners) {
                try {
                    listener.accept(eventData);
                } catch (Exception e) {
                    logger.warn("Error in event listener", e);
                }
            }
        }
    }

    protected JsonNode createEventData(Object data) {
        try {
            return objectMapper.valueToTree(data);
        } catch (Exception e) {
            ObjectNode errorNode = objectMapper.createObjectNode();
            errorNode.put("error", "Failed to serialize event data: " + e.getMessage());
            return errorNode;
        }
    }

    protected void updateMetric(String key, Object value) {
        if (config.isEnableMetrics()) {
            metrics.put(key, value);
        }
    }
}
