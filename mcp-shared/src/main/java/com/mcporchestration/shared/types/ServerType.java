package com.mcporchestration.shared.types;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.constraints.NotNull;

/**
 * Server type enumeration for MCP services
 * Utilizes Java 21 features for enhanced type safety and performance
 */
public enum ServerType {
    SEQUENTIAL_THINKING("sequential-thinking"),
    DUCKDUCKGO("duckduckgo"),
    PUPPETEER("puppeteer"),
    MEMORY_BANK("memory-bank"),
    GITHUB("github"),
    KNOWLEDGE_GRAPH_MEMORY("knowledge-graph-memory"),
    COMPASS("compass"),
    PLAYWRIGHT("playwright"),
    GUTHILDA_AI("guthilda-ai"),
    CLAUDE_INTEGRATION("claude-integration"),
    COPILOT_BRIDGE("copilot-bridge");

    private final String value;

    ServerType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ServerType fromString(@NotNull String value) {
        return switch (value.toLowerCase()) {
            case "sequential-thinking" -> SEQUENTIAL_THINKING;
            case "duckduckgo" -> DUCKDUCKGO;
            case "puppeteer" -> PUPPETEER;
            case "memory-bank" -> MEMORY_BANK;
            case "github" -> GITHUB;
            case "knowledge-graph-memory" -> KNOWLEDGE_GRAPH_MEMORY;
            case "compass" -> COMPASS;
            case "playwright" -> PLAYWRIGHT;
            case "guthilda-ai" -> GUTHILDA_AI;
            case "claude-integration" -> CLAUDE_INTEGRATION;
            case "copilot-bridge" -> COPILOT_BRIDGE;
            default -> throw new IllegalArgumentException("Unknown server type: " + value);
        };
    }

    @Override
    public String toString() {
        return value;
    }
}
