package com.mcporchestration.shared.types;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.constraints.NotNull;

/**
 * Server status enumeration for MCP services
 * Enhanced with Java 21 pattern matching and sealed interfaces
 */
public enum ServerStatus {
    STARTING("starting"),
    RUNNING("running"),
    ERROR("error"),
    STOPPED("stopped"),
    STOPPING("stopping"),
    NOT_RESPONDING("not responding"),
    TIMEOUT("timeout"),
    INITIALIZING("initializing"),
    DEGRADED("degraded"),
    MAINTENANCE("maintenance");

    private final String value;

    ServerStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ServerStatus fromString(@NotNull String value) {
        return switch (value.toLowerCase()) {
            case "starting" -> STARTING;
            case "running" -> RUNNING;
            case "error" -> ERROR;
            case "stopped" -> STOPPED;
            case "stopping" -> STOPPING;
            case "not responding" -> NOT_RESPONDING;
            case "timeout" -> TIMEOUT;
            case "initializing" -> INITIALIZING;
            case "degraded" -> DEGRADED;
            case "maintenance" -> MAINTENANCE;
            default -> throw new IllegalArgumentException("Unknown server status: " + value);
        };
    }

    /**
     * Check if the server is in a healthy state
     * Utilizes Java 21 pattern matching for enhanced readability
     */
    public boolean isHealthy() {
        return switch (this) {
            case RUNNING -> true;
            case STARTING, INITIALIZING -> true; // Transitional states are considered healthy
            case ERROR, STOPPED, STOPPING, NOT_RESPONDING, TIMEOUT -> false;
            case DEGRADED -> false; // Degraded is unhealthy but recoverable
            case MAINTENANCE -> true; // Maintenance is a planned state
        };
    }

    /**
     * Check if the server is in an active state
     */
    public boolean isActive() {
        return switch (this) {
            case RUNNING, STARTING, INITIALIZING, DEGRADED, MAINTENANCE -> true;
            case ERROR, STOPPED, STOPPING, NOT_RESPONDING, TIMEOUT -> false;
        };
    }

    @Override
    public String toString() {
        return value;
    }
}
