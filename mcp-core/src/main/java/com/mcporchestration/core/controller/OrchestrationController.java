package com.mcporchestration.core.controller;

import com.mcporchestration.core.orchestration.OrchestrationHub;
import com.mcporchestration.shared.config.ServerConfig;
import com.mcporchestration.shared.model.ServerInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * REST API Controller for MCP Orchestration Hub
 * Enhanced with Java 21 features and modern Spring Boot patterns
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class OrchestrationController {
    
    private static final Logger logger = LoggerFactory.getLogger(OrchestrationController.class);
    
    private final OrchestrationHub orchestrationHub;

    public OrchestrationController(OrchestrationHub orchestrationHub) {
        this.orchestrationHub = orchestrationHub;
    }

    /**
     * Get system status with all servers
     */
    @GetMapping("/status")
    public ResponseEntity<OrchestrationHub.SystemStatus> getSystemStatus() {
        logger.debug("🔍 Getting system status");
        var status = orchestrationHub.getSystemStatus();
        return ResponseEntity.ok(status);
    }

    /**
     * Get all servers
     */
    @GetMapping("/servers")
    public ResponseEntity<Map<String, ServerInfo>> getAllServers() {
        logger.debug("📋 Getting all servers");
        var servers = orchestrationHub.getAllServers();
        return ResponseEntity.ok(servers);
    }

    /**
     * Start a server
     */
    @PostMapping("/servers/{serverId}/start")
    public CompletableFuture<ResponseEntity<ApiResponse>> startServer(
            @PathVariable String serverId,
            @RequestBody ServerConfig config) {
        
        logger.info("🚀 Starting server: {}", serverId);
        
        return orchestrationHub.startServer(config)
            .thenApply(serverInfo -> ResponseEntity.ok(
                new ApiResponse(true, "Server started successfully", serverInfo)))
            .exceptionally(throwable -> {
                logger.error("❌ Failed to start server {}: {}", serverId, throwable.getMessage());
                return ResponseEntity.badRequest().body(
                    new ApiResponse(false, "Failed to start server: " + throwable.getMessage(), null));
            });
    }

    /**
     * Stop a server
     */
    @PostMapping("/servers/{serverId}/stop")
    public CompletableFuture<ResponseEntity<ApiResponse>> stopServer(@PathVariable String serverId) {
        logger.info("🛑 Stopping server: {}", serverId);
        
        return orchestrationHub.stopServer(serverId)
            .thenApply(result -> ResponseEntity.ok(
                new ApiResponse(true, "Server stopped successfully", null)))
            .exceptionally(throwable -> {
                logger.error("❌ Failed to stop server {}: {}", serverId, throwable.getMessage());
                return ResponseEntity.badRequest().body(
                    new ApiResponse(false, "Failed to stop server: " + throwable.getMessage(), null));
            });
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "timestamp", java.time.Instant.now(),
            "version", "2.0.0-java21",
            "captain", "guthilda",
            "threading", "virtual-threads"
        ));
    }

    /**
     * Captain Guthilda's special status endpoint
     */
    @GetMapping("/guthilda/status")
    public ResponseEntity<Map<String, Object>> guthildaStatus() {
        var status = orchestrationHub.getSystemStatus();
        
        return ResponseEntity.ok(Map.of(
            "captain", "🏴‍☠️ Captain Guthilda Triple-:D'Cup Piroteena",
            "status", "commanding",
            "fleet_size", status.totalServers(),
            "healthy_ships", status.healthyServers(),
            "java_version", "21",
            "virtual_threads", "enabled",
            "ai_integration", "active",
            "meta_automation", "operational",
            "timestamp", status.timestamp()
        ));
    }

    /**
     * API Response record for consistent responses
     */
    public record ApiResponse(
        boolean success,
        String message,
        Object data
    ) {}
}
