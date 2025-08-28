package com.mcporchestration.shared.types;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Test suite for ServerType enum using JUnit 5 and Java 21 features.
 * 
 * @author Captain Guthilda's Java 21 Fleet
 * @since 1.0.0
 */
@DisplayName("ServerType Enum Tests")
class ServerTypeTest {

    @Test
    @DisplayName("Should have all expected server types")
    void shouldHaveAllExpectedServerTypes() {
        var expectedTypes = java.util.Set.of(
            ServerType.SEQUENTIAL_THINKING,
            ServerType.DUCKDUCKGO,
            ServerType.PUPPETEER,
            ServerType.MEMORY_BANK,
            ServerType.GITHUB,
            ServerType.KNOWLEDGE_GRAPH_MEMORY,
            ServerType.COMPASS,
            ServerType.PLAYWRIGHT,
            ServerType.GUTHILDA_AI,
            ServerType.CLAUDE_INTEGRATION,
            ServerType.COPILOT_BRIDGE
        );
        
        var actualTypes = java.util.Set.of(ServerType.values());
        assertEquals(expectedTypes, actualTypes, "ServerType enum should contain all expected values");
    }

    @Test
    @DisplayName("Should provide meaningful string representation")
    void shouldProvideMeaningfulStringRepresentation() {
        assertEquals("sequential-thinking", ServerType.SEQUENTIAL_THINKING.toString());
        assertEquals("guthilda-ai", ServerType.GUTHILDA_AI.toString());
        assertEquals("claude-integration", ServerType.CLAUDE_INTEGRATION.toString());
        assertEquals("duckduckgo", ServerType.DUCKDUCKGO.toString());
    }

    @Test
    @DisplayName("Should support valueOf operations")
    void shouldSupportValueOfOperations() {
        assertEquals(ServerType.SEQUENTIAL_THINKING, ServerType.valueOf("SEQUENTIAL_THINKING"));
        assertEquals(ServerType.GUTHILDA_AI, ServerType.valueOf("GUTHILDA_AI"));
        
        assertThrows(IllegalArgumentException.class, () -> 
            ServerType.valueOf("NONEXISTENT_TYPE"));
    }

    @Test
    @DisplayName("Should work with pattern matching (Java 21)")
    void shouldWorkWithPatternMatching() {
        var result = switch (ServerType.GUTHILDA_AI) {
            case GUTHILDA_AI -> "AI Orchestration";
            case SEQUENTIAL_THINKING -> "Sequential Processing";
            case CLAUDE_INTEGRATION -> "Claude AI";
            default -> "Other Type";
        };
        
        assertEquals("AI Orchestration", result);
    }

    @Test
    @DisplayName("Should be comparable and orderable")
    void shouldBeComparableAndOrderable() {
        assertTrue(ServerType.SEQUENTIAL_THINKING.ordinal() >= 0);
        assertTrue(ServerType.values().length > 0);
        
        // Test ordering consistency
        var types = java.util.Arrays.asList(ServerType.values());
        var sortedTypes = types.stream()
            .sorted()
            .toList();
        
        assertEquals(types, sortedTypes, "Enum values should maintain natural ordering");
    }
}
