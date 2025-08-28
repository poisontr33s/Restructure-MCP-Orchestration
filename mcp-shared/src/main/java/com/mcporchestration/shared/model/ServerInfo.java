package com.mcporchestration.shared.model;

import com.mcporchestration.shared.config.ServerConfig;
import com.mcporchestration.shared.types.ServerStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

/**
 * Server information record with comprehensive runtime data
 * Utilizes Java 21 records for immutable data structures with enhanced monitoring
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ServerInfo(
    ServerConfig config,
    ServerStatus status,
    Long pid,
    Instant startTime,
    Instant lastHealthCheck,
    String version,
    Map<String, Object> metadata,
    HealthMetrics healthMetrics,
    Optional<String> errorMessage
) {

    /**
     * Health metrics sub-record for detailed server monitoring
     */
    public record HealthMetrics(
        double cpuUsage,
        long memoryUsage,
        long memoryTotal,
        int activeConnections,
        long requestCount,
        long errorCount,
        double responseTimeMs
    ) {
        public double getMemoryUsagePercentage() {
            return memoryTotal > 0 ? (double) memoryUsage / memoryTotal * 100.0 : 0.0;
        }

        public double getErrorRate() {
            return requestCount > 0 ? (double) errorCount / requestCount * 100.0 : 0.0;
        }

        public boolean isHealthy() {
            return cpuUsage < 90.0 && 
                   getMemoryUsagePercentage() < 85.0 && 
                   getErrorRate() < 5.0 &&
                   responseTimeMs < 5000.0;
        }
    }

    /**
     * Builder for ServerInfo with fluent API
     */
    public static class Builder {
        private ServerConfig config;
        private ServerStatus status = ServerStatus.STOPPED;
        private Long pid;
        private Instant startTime;
        private Instant lastHealthCheck;
        private String version;
        private Map<String, Object> metadata = Map.of();
        private HealthMetrics healthMetrics;
        private Optional<String> errorMessage = Optional.empty();

        public Builder config(ServerConfig config) {
            this.config = config;
            return this;
        }

        public Builder status(ServerStatus status) {
            this.status = status;
            return this;
        }

        public Builder pid(Long pid) {
            this.pid = pid;
            return this;
        }

        public Builder startTime(Instant startTime) {
            this.startTime = startTime;
            return this;
        }

        public Builder lastHealthCheck(Instant lastHealthCheck) {
            this.lastHealthCheck = lastHealthCheck;
            return this;
        }

        public Builder version(String version) {
            this.version = version;
            return this;
        }

        public Builder metadata(Map<String, Object> metadata) {
            this.metadata = metadata;
            return this;
        }

        public Builder healthMetrics(HealthMetrics healthMetrics) {
            this.healthMetrics = healthMetrics;
            return this;
        }

        public Builder errorMessage(String errorMessage) {
            this.errorMessage = Optional.ofNullable(errorMessage);
            return this;
        }

        public ServerInfo build() {
            return new ServerInfo(
                config, status, pid, startTime, lastHealthCheck,
                version, metadata, healthMetrics, errorMessage
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
     * Get the uptime in seconds
     */
    public long getUptimeSeconds() {
        if (startTime == null) return 0;
        return java.time.Duration.between(startTime, Instant.now()).getSeconds();
    }

    /**
     * Check if the server is healthy based on status and metrics
     */
    public boolean isHealthy() {
        return status.isHealthy() && 
               (healthMetrics == null || healthMetrics.isHealthy()) &&
               errorMessage.isEmpty();
    }

    /**
     * Create a copy with updated status
     */
    public ServerInfo withStatus(ServerStatus newStatus) {
        return new ServerInfo(
            config, newStatus, pid, startTime, 
            Instant.now(), version, metadata, healthMetrics, errorMessage
        );
    }

    /**
     * Create a copy with updated health metrics
     */
    public ServerInfo withHealthMetrics(HealthMetrics newMetrics) {
        return new ServerInfo(
            config, status, pid, startTime, 
            Instant.now(), version, metadata, newMetrics, errorMessage
        );
    }

    /**
     * Create a copy with an error message
     */
    public ServerInfo withError(String error) {
        return new ServerInfo(
            config, ServerStatus.ERROR, pid, startTime, 
            Instant.now(), version, metadata, healthMetrics, Optional.of(error)
        );
    }

    /**
     * Get server identifier
     */
    public String getServerId() {
        return config.getServerId();
    }
}
