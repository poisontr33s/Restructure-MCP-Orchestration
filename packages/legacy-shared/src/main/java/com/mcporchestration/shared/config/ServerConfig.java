package com.mcporchestration.shared.config;

import com.mcporchestration.shared.types.ServerType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Server configuration record for MCP services
 * Utilizes Java 21 records for immutable data structures with enhanced validation
 */
public record ServerConfig(
    @NotBlank(message = "Server name cannot be blank")
    String name,
    
    @NotNull(message = "Server type cannot be null")
    ServerType type,
    
    @Min(value = 1024, message = "Port must be at least 1024")
    @Max(value = 65535, message = "Port must be at most 65535")
    int port,
    
    boolean enabled,
    
    // Additional Java 21 enhanced properties
    String description,
    String version,
    int healthCheckIntervalSeconds,
    int timeoutSeconds,
    
    // AI Integration properties
    boolean aiEnabled,
    String aiProvider,
    String aiModel
) {
    
    /**
     * Builder pattern for ServerConfig with Java 21 enhancements
     */
    public static class Builder {
        private String name;
        private ServerType type;
        private int port;
        private boolean enabled = true;
        private String description = "";
        private String version = "1.0.0";
        private int healthCheckIntervalSeconds = 30;
        private int timeoutSeconds = 10;
        private boolean aiEnabled = false;
        private String aiProvider = "";
        private String aiModel = "";

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder type(ServerType type) {
            this.type = type;
            return this;
        }

        public Builder port(int port) {
            this.port = port;
            return this;
        }

        public Builder enabled(boolean enabled) {
            this.enabled = enabled;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder version(String version) {
            this.version = version;
            return this;
        }

        public Builder healthCheckInterval(int seconds) {
            this.healthCheckIntervalSeconds = seconds;
            return this;
        }

        public Builder timeout(int seconds) {
            this.timeoutSeconds = seconds;
            return this;
        }

        public Builder aiEnabled(boolean enabled) {
            this.aiEnabled = enabled;
            return this;
        }

        public Builder aiProvider(String provider) {
            this.aiProvider = provider;
            return this;
        }

        public Builder aiModel(String model) {
            this.aiModel = model;
            return this;
        }

        public ServerConfig build() {
            return new ServerConfig(
                name, type, port, enabled, description, version,
                healthCheckIntervalSeconds, timeoutSeconds,
                aiEnabled, aiProvider, aiModel
            );
        }
    }

    /**
     * Create a builder instance
     */
    public static Builder builder() {
        return new Builder();
    }

    /**
     * Create a copy of this config with modifications
     */
    public ServerConfig withPort(int newPort) {
        return new ServerConfig(
            name, type, newPort, enabled, description, version,
            healthCheckIntervalSeconds, timeoutSeconds,
            aiEnabled, aiProvider, aiModel
        );
    }

    /**
     * Create a copy of this config with enabled/disabled state
     */
    public ServerConfig withEnabled(boolean newEnabled) {
        return new ServerConfig(
            name, type, port, newEnabled, description, version,
            healthCheckIntervalSeconds, timeoutSeconds,
            aiEnabled, aiProvider, aiModel
        );
    }

    /**
     * Check if this server has AI capabilities
     */
    public boolean hasAiCapabilities() {
        return aiEnabled && aiProvider != null && !aiProvider.isBlank();
    }

    /**
     * Get the server identifier (type + port)
     */
    public String getServerId() {
        return "%s:%d".formatted(type.getValue(), port);
    }
}
