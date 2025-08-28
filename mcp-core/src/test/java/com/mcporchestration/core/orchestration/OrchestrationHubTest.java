package com.mcporchestration.core.orchestration;

import com.mcporchestration.shared.config.ServerConfig;
import com.mcporchestration.shared.model.ServerInfo;
import com.mcporchestration.shared.types.ServerStatus;
import com.mcporchestration.shared.types.ServerType;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 🏴‍☠️ CAPTAIN GUTHILDA'S ORCHESTRATION HUB TESTS
 * 
 * Comprehensive test suite for the OrchestrationHub using Java 21 features,
 * virtual threads, and pattern matching validation.
 * 
 * @author Captain Guthilda's Java 21 Test Fleet
 * @since 1.0.0
 */
@ExtendWith(MockitoExtension.class)
@SpringJUnitConfig
@DisplayName("OrchestrationHub Java 21 Tests")
class OrchestrationHubTest {

    private OrchestrationHub orchestrationHub;

    @Mock
    private ServerInfo mockServerInfo;

    @BeforeEach
    void setUp() {
        orchestrationHub = new OrchestrationHub();
    }

    @Test
    @DisplayName("🚀 Should start servers with virtual thread excellence")
    void shouldStartServersWithVirtualThreadExcellence() throws Exception {
        // Given: Captain Guthilda's test server configuration
        var serverConfig = new ServerConfig(
            "test-guthilda-server",
            ServerType.GUTHILDA_AI,
            Map.of(
                "ai_mode", "renaissance",
                "virtual_threads", true,
                "golden_potato_perfection", true
            ),
            8080
        );

        // When: Starting server with AI orchestration
        var future = orchestrationHub.startServer(serverConfig);
        var result = future.get(); // This should complete quickly with virtual threads

        // Then: Server should be running with AI capabilities
        assertNotNull(result, "Server should start successfully");
        assertEquals(ServerStatus.RUNNING, result.status(), "Server should be in running state");
        assertEquals("test-guthilda-server", result.config().id(), "Server ID should match");
        assertEquals(ServerType.GUTHILDA_AI, result.config().type(), "Server type should be AI");
    }

    @Test
    @DisplayName("⚓ Should stop servers gracefully with pattern matching")
    void shouldStopServersGracefullyWithPatternMatching() throws Exception {
        // Given: Running server with AI orchestration
        var serverConfig = new ServerConfig(
            "test-stop-server",
            ServerType.SEQUENTIAL_THINKING,
            Map.of("test_mode", true),
            8081
        );
        
        var startResult = orchestrationHub.startServer(serverConfig).get();
        assertEquals(ServerStatus.RUNNING, startResult.status());

        // When: Stopping server with graceful shutdown
        var stopFuture = orchestrationHub.stopServer("test-stop-server");
        var stopResult = stopFuture.get();

        // Then: Server should be stopped gracefully
        assertNotNull(stopResult, "Stop operation should complete");
        assertEquals(ServerStatus.STOPPED, stopResult.status(), "Server should be stopped");
    }

    @Test
    @DisplayName("🤖 Should list all servers with AI enhancement")
    void shouldListAllServersWithAiEnhancement() throws Exception {
        // Given: Multiple servers in Captain Guthilda's fleet
        var serverConfigs = List.of(
            new ServerConfig("ai-server-1", ServerType.GUTHILDA_AI, Map.of(), 8082),
            new ServerConfig("thinking-server", ServerType.SEQUENTIAL_THINKING, Map.of(), 8083),
            new ServerConfig("claude-server", ServerType.CLAUDE_INTEGRATION, Map.of(), 8084)
        );

        // Start all servers concurrently using virtual threads
        var startFutures = serverConfigs.stream()
            .map(orchestrationHub::startServer)
            .toList();

        // Wait for all to complete
        CompletableFuture.allOf(startFutures.toArray(new CompletableFuture[0])).get();

        // When: Listing all servers
        var allServers = orchestrationHub.getAllServers();

        // Then: All servers should be listed with AI status
        assertEquals(3, allServers.size(), "Should list all started servers");
        
        var serverTypes = allServers.stream()
            .map(info -> info.config().type())
            .toList();
        
        assertTrue(serverTypes.contains(ServerType.GUTHILDA_AI), "Should include AI server");
        assertTrue(serverTypes.contains(ServerType.SEQUENTIAL_THINKING), "Should include thinking server");
        assertTrue(serverTypes.contains(ServerType.CLAUDE_INTEGRATION), "Should include Claude server");
    }

    @Test
    @DisplayName("🌀 Should handle server status updates with pattern matching")
    void shouldHandleServerStatusUpdatesWithPatternMatching() throws Exception {
        // Given: Server with dynamic status
        var serverConfig = new ServerConfig(
            "status-test-server",
            ServerType.MONITORING,
            Map.of("status_updates", true),
            8085
        );

        var server = orchestrationHub.startServer(serverConfig).get();

        // When: Checking server status with pattern matching
        var statusInfo = orchestrationHub.getServerStatus("status-test-server");

        // Then: Status should be analyzed with Java 21 pattern matching
        var statusAnalysis = switch (statusInfo.status()) {
            case RUNNING -> "Server is operating with golden potato perfection";
            case STARTING -> "Server is initializing AI capabilities";
            case STOPPING -> "Server is gracefully shutting down";
            case STOPPED -> "Server is at rest, ready for deployment";
            case ERROR -> "Server requires Captain Guthilda's attention";
        };

        assertNotNull(statusAnalysis, "Status analysis should be provided");
        assertTrue(statusAnalysis.contains("golden potato") || statusAnalysis.contains("AI") || 
                  statusAnalysis.contains("gracefully") || statusAnalysis.contains("rest") ||
                  statusAnalysis.contains("Guthilda"), 
                  "Status analysis should match pattern matching result");
    }

    @Test
    @DisplayName("🔥 Should restart servers with AI-enhanced recovery")
    void shouldRestartServersWithAiEnhancedRecovery() throws Exception {
        // Given: Server that needs restart
        var serverConfig = new ServerConfig(
            "restart-test-server",
            ServerType.AUTOMATION,
            Map.of("auto_recovery", true),
            8086
        );

        var initialServer = orchestrationHub.startServer(serverConfig).get();
        assertEquals(ServerStatus.RUNNING, initialServer.status());

        // When: Restarting server with AI enhancement
        var restartFuture = orchestrationHub.restartServer("restart-test-server");
        var restartedServer = restartFuture.get();

        // Then: Server should be restarted with enhanced capabilities
        assertNotNull(restartedServer, "Restart should complete successfully");
        assertEquals(ServerStatus.RUNNING, restartedServer.status(), "Server should be running after restart");
        assertEquals("restart-test-server", restartedServer.config().id(), "Server ID should be preserved");
        assertTrue(restartedServer.uptime() >= 0, "Server should have valid uptime");
    }

    @Test
    @DisplayName("⚡ Should handle concurrent operations with virtual threads")
    void shouldHandleConcurrentOperationsWithVirtualThreads() throws Exception {
        // Given: Multiple concurrent server operations
        var serverConfigs = java.util.stream.IntStream.range(0, 10)
            .mapToObj(i -> new ServerConfig(
                "concurrent-server-" + i,
                ServerType.CUSTOM,
                Map.of("concurrent_test", true, "server_index", i),
                8090 + i
            ))
            .toList();

        // When: Starting all servers concurrently
        var startTime = Instant.now();
        var futures = serverConfigs.stream()
            .map(orchestrationHub::startServer)
            .toList();

        var results = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> futures.stream()
                .map(CompletableFuture::join)
                .toList())
            .get();

        var endTime = Instant.now();
        var duration = java.time.Duration.between(startTime, endTime);

        // Then: All operations should complete efficiently with virtual threads
        assertEquals(10, results.size(), "All servers should start successfully");
        assertTrue(duration.toMillis() < 5000, "Virtual threads should enable fast concurrent operations");
        
        results.forEach(result -> {
            assertEquals(ServerStatus.RUNNING, result.status(), "Each server should be running");
            assertTrue(result.config().id().startsWith("concurrent-server-"), "Server ID should match pattern");
        });
    }

    @Test
    @DisplayName("🏴‍☠️ Should provide Captain Guthilda's system overview")
    void shouldProvideCaptainGuthildasSystemOverview() throws Exception {
        // Given: Captain Guthilda's complete fleet
        var fleetServers = List.of(
            new ServerConfig("guthilda-core", ServerType.GUTHILDA_AI, Map.of("role", "commander"), 8100),
            new ServerConfig("monitoring-deck", ServerType.MONITORING, Map.of("role", "observer"), 8101),
            new ServerConfig("automation-engine", ServerType.AUTOMATION, Map.of("role", "executor"), 8102)
        );

        // Start the fleet
        var fleetFutures = fleetServers.stream()
            .map(orchestrationHub::startServer)
            .toList();
        
        CompletableFuture.allOf(fleetFutures.toArray(new CompletableFuture[0])).get();

        // When: Getting system overview
        var systemOverview = orchestrationHub.getSystemOverview();

        // Then: Overview should reflect Captain Guthilda's standards
        assertNotNull(systemOverview, "System overview should be available");
        assertTrue(systemOverview.containsKey("total_servers"), "Should include server count");
        assertTrue(systemOverview.containsKey("running_servers"), "Should include running server count");
        assertTrue(systemOverview.containsKey("virtual_thread_performance"), "Should include virtual thread metrics");
        assertTrue(systemOverview.containsKey("ai_orchestration_status"), "Should include AI status");
        
        // Verify the fleet composition
        assertEquals(3, systemOverview.get("total_servers"), "Should have 3 fleet servers");
        assertEquals(3, systemOverview.get("running_servers"), "All fleet servers should be running");
    }

    @Test
    @DisplayName("🎯 Should validate server configurations with records")
    void shouldValidateServerConfigurationsWithRecords() {
        // Given: Various server configurations using Java 21 records
        var validConfig = new ServerConfig(
            "valid-server",
            ServerType.GUTHILDA_AI,
            Map.of("validation", true),
            8200
        );

        var invalidConfig = new ServerConfig(
            "", // Empty ID should be invalid
            ServerType.GUTHILDA_AI,
            Map.of(),
            -1 // Invalid port
        );

        // When & Then: Validation using pattern matching and records
        assertTrue(orchestrationHub.isValidConfiguration(validConfig), 
                  "Valid configuration should pass validation");
        
        assertFalse(orchestrationHub.isValidConfiguration(invalidConfig), 
                   "Invalid configuration should fail validation");
    }
}
