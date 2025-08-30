package com.mcp.v2.client.types;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

/**
 * Core types for MCP v2 protocol implementation in Java.
 */
public class MCPTypes {

    /**
     * Base interface for all MCP v2 messages.
     */
    public interface MCPMessage {
        String getId();
        String getVersion();
        Instant getTimestamp();
        Map<String, Object> getMetadata();
    }

    /**
     * MCP v2 Request message structure.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MCPRequest implements MCPMessage {
        @JsonProperty("id")
        private String id;

        @JsonProperty("jsonrpc")
        private String jsonrpc = "2.0";

        @JsonProperty("method")
        private String method;

        @JsonProperty("params")
        private JsonNode params;

        @JsonProperty("version")
        private String version = "2.0";

        @JsonProperty("timestamp")
        private Instant timestamp;

        @JsonProperty("metadata")
        private Map<String, Object> metadata;

        @JsonProperty("context")
        private ContextInfo context;

        // Constructors
        public MCPRequest() {
            this.timestamp = Instant.now();
        }

        public MCPRequest(String id, String method, JsonNode params) {
            this();
            this.id = id;
            this.method = method;
            this.params = params;
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getJsonrpc() { return jsonrpc; }
        public void setJsonrpc(String jsonrpc) { this.jsonrpc = jsonrpc; }

        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }

        public JsonNode getParams() { return params; }
        public void setParams(JsonNode params) { this.params = params; }

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

        public ContextInfo getContext() { return context; }
        public void setContext(ContextInfo context) { this.context = context; }
    }

    /**
     * MCP v2 Response message structure.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MCPResponse implements MCPMessage {
        @JsonProperty("id")
        private String id;

        @JsonProperty("jsonrpc")
        private String jsonrpc = "2.0";

        @JsonProperty("result")
        private JsonNode result;

        @JsonProperty("error")
        private MCPError error;

        @JsonProperty("version")
        private String version = "2.0";

        @JsonProperty("timestamp")
        private Instant timestamp;

        @JsonProperty("metadata")
        private Map<String, Object> metadata;

        @JsonProperty("context")
        private ContextInfo context;

        // Constructors
        public MCPResponse() {
            this.timestamp = Instant.now();
        }

        public MCPResponse(String id, JsonNode result) {
            this();
            this.id = id;
            this.result = result;
        }

        public MCPResponse(String id, MCPError error) {
            this();
            this.id = id;
            this.error = error;
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getJsonrpc() { return jsonrpc; }
        public void setJsonrpc(String jsonrpc) { this.jsonrpc = jsonrpc; }

        public JsonNode getResult() { return result; }
        public void setResult(JsonNode result) { this.result = result; }

        public MCPError getError() { return error; }
        public void setError(MCPError error) { this.error = error; }

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

        public ContextInfo getContext() { return context; }
        public void setContext(ContextInfo context) { this.context = context; }

        public boolean isSuccess() { return error == null; }
    }

    /**
     * MCP v2 Error structure.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MCPError {
        @JsonProperty("code")
        private int code;

        @JsonProperty("message")
        private String message;

        @JsonProperty("data")
        private JsonNode data;

        @JsonProperty("type")
        private String type;

        @JsonProperty("timestamp")
        private Instant timestamp;

        // Constructors
        public MCPError() {
            this.timestamp = Instant.now();
        }

        public MCPError(int code, String message) {
            this();
            this.code = code;
            this.message = message;
        }

        public MCPError(int code, String message, String type) {
            this(code, message);
            this.type = type;
        }

        // Getters and Setters
        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public JsonNode getData() { return data; }
        public void setData(JsonNode data) { this.data = data; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }

    /**
     * Context information for MCP operations.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ContextInfo {
        @JsonProperty("sessionId")
        private String sessionId;

        @JsonProperty("userId")
        private String userId;

        @JsonProperty("clientId")
        private String clientId;

        @JsonProperty("capabilities")
        private Map<String, Boolean> capabilities;

        @JsonProperty("metadata")
        private Map<String, Object> metadata;

        @JsonProperty("ttl")
        private Long ttl;

        @JsonProperty("priority")
        private Integer priority;

        @JsonProperty("tags")
        private String[] tags;

        // Constructors
        public ContextInfo() {}

        public ContextInfo(String sessionId, String userId, String clientId) {
            this.sessionId = sessionId;
            this.userId = userId;
            this.clientId = clientId;
        }

        // Getters and Setters
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getClientId() { return clientId; }
        public void setClientId(String clientId) { this.clientId = clientId; }

        public Map<String, Boolean> getCapabilities() { return capabilities; }
        public void setCapabilities(Map<String, Boolean> capabilities) { this.capabilities = capabilities; }

        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

        public Long getTtl() { return ttl; }
        public void setTtl(Long ttl) { this.ttl = ttl; }

        public Integer getPriority() { return priority; }
        public void setPriority(Integer priority) { this.priority = priority; }

        public String[] getTags() { return tags; }
        public void setTags(String[] tags) { this.tags = tags; }
    }

    /**
     * Transport configuration for different connection types.
     */
    public static class TransportConfig {
        private String type;
        private String endpoint;
        private Map<String, Object> options;
        private int timeout = 30000;
        private int retryAttempts = 3;
        private boolean enableMetrics = true;

        // Constructors
        public TransportConfig() {}

        public TransportConfig(String type, String endpoint) {
            this.type = type;
            this.endpoint = endpoint;
        }

        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

        public Map<String, Object> getOptions() { return options; }
        public void setOptions(Map<String, Object> options) { this.options = options; }

        public int getTimeout() { return timeout; }
        public void setTimeout(int timeout) { this.timeout = timeout; }

        public int getRetryAttempts() { return retryAttempts; }
        public void setRetryAttempts(int retryAttempts) { this.retryAttempts = retryAttempts; }

        public boolean isEnableMetrics() { return enableMetrics; }
        public void setEnableMetrics(boolean enableMetrics) { this.enableMetrics = enableMetrics; }
    }

    /**
     * Client configuration for MCP v2 clients.
     */
    public static class ClientConfig {
        private String clientId;
        private String version = "2.0";
        private TransportConfig transport;
        private ContextInfo defaultContext;
        private boolean enableCaching = true;
        private boolean enableMetrics = true;
        private boolean enableLogging = true;
        private Map<String, Object> metadata;

        // Constructors
        public ClientConfig() {}

        public ClientConfig(String clientId, TransportConfig transport) {
            this.clientId = clientId;
            this.transport = transport;
        }

        // Getters and Setters
        public String getClientId() { return clientId; }
        public void setClientId(String clientId) { this.clientId = clientId; }

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public TransportConfig getTransport() { return transport; }
        public void setTransport(TransportConfig transport) { this.transport = transport; }

        public ContextInfo getDefaultContext() { return defaultContext; }
        public void setDefaultContext(ContextInfo defaultContext) { this.defaultContext = defaultContext; }

        public boolean isEnableCaching() { return enableCaching; }
        public void setEnableCaching(boolean enableCaching) { this.enableCaching = enableCaching; }

        public boolean isEnableMetrics() { return enableMetrics; }
        public void setEnableMetrics(boolean enableMetrics) { this.enableMetrics = enableMetrics; }

        public boolean isEnableLogging() { return enableLogging; }
        public void setEnableLogging(boolean enableLogging) { this.enableLogging = enableLogging; }

        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    }

    /**
     * Event types for MCP v2 event system.
     */
    public enum EventType {
        REQUEST_SENT("request.sent"),
        RESPONSE_RECEIVED("response.received"),
        ERROR_OCCURRED("error.occurred"),
        CONNECTION_OPENED("connection.opened"),
        CONNECTION_CLOSED("connection.closed"),
        CONNECTION_ERROR("connection.error"),
        CONTEXT_UPDATED("context.updated"),
        METRICS_COLLECTED("metrics.collected");

        private final String value;

        EventType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return value;
        }
    }

    /**
     * Event data structure for MCP v2 events.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class EventData {
        @JsonProperty("type")
        private EventType type;

        @JsonProperty("timestamp")
        private Instant timestamp;

        @JsonProperty("data")
        private JsonNode data;

        @JsonProperty("source")
        private String source;

        @JsonProperty("target")
        private String target;

        @JsonProperty("metadata")
        private Map<String, Object> metadata;

        // Constructors
        public EventData() {
            this.timestamp = Instant.now();
        }

        public EventData(EventType type, JsonNode data) {
            this();
            this.type = type;
            this.data = data;
        }

        // Getters and Setters
        public EventType getType() { return type; }
        public void setType(EventType type) { this.type = type; }

        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

        public JsonNode getData() { return data; }
        public void setData(JsonNode data) { this.data = data; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }

        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    }

    /**
     * Standard error codes for MCP v2.
     */
    public static class ErrorCodes {
        public static final int PARSE_ERROR = -32700;
        public static final int INVALID_REQUEST = -32600;
        public static final int METHOD_NOT_FOUND = -32601;
        public static final int INVALID_PARAMS = -32602;
        public static final int INTERNAL_ERROR = -32603;
        public static final int SERVER_ERROR_START = -32099;
        public static final int SERVER_ERROR_END = -32000;

        // MCP-specific error codes
        public static final int CONTEXT_INVALID = -32100;
        public static final int CONTEXT_EXPIRED = -32101;
        public static final int TRANSPORT_ERROR = -32200;
        public static final int AUTHENTICATION_ERROR = -32300;
        public static final int AUTHORIZATION_ERROR = -32301;
        public static final int RATE_LIMIT_ERROR = -32400;
        public static final int RESOURCE_NOT_FOUND = -32404;
        public static final int RESOURCE_CONFLICT = -32409;
        public static final int VALIDATION_ERROR = -32422;
    }
}
