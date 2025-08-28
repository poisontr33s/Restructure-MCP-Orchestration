package com.mcporchestration.monitor.controller;

import com.mcporchestration.shared.model.ServerInfo;
import com.mcporchestration.monitor.service.MonitoringService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * 🏴‍☠️ CAPTAIN GUTHILDA'S MONITORING API
 * 
 * REST API controller for monitoring dashboard functionality.
 * Provides endpoints for real-time server monitoring, metrics,
 * and system health using Java 21 pattern matching and virtual threads.
 */
@RestController
@RequestMapping("/api/monitor")
@CrossOrigin(origins = "*")
public class MonitoringController {

    private final MonitoringService monitoringService;

    public MonitoringController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    /**
     * Get all server information
     */
    @GetMapping("/servers")
    public Mono<List<ServerInfo>> getAllServers() {
        return monitoringService.getAllServers();
    }

    /**
     * Get server information by ID
     */
    @GetMapping("/servers/{serverId}")
    public Mono<ResponseEntity<ServerInfo>> getServer(@PathVariable String serverId) {
        return monitoringService.getServerById(serverId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    /**
     * Get real-time server metrics stream
     */
    @GetMapping(value = "/metrics/stream", produces = "text/event-stream")
    public Flux<Map<String, Object>> getMetricsStream() {
        return monitoringService.getMetricsStream()
                .delayElements(Duration.ofSeconds(1));
    }

    /**
     * Get system health status
     */
    @GetMapping("/health")
    public Mono<Map<String, Object>> getSystemHealth() {
        return monitoringService.getSystemHealth();
    }

    /**
     * Get performance analytics
     */
    @GetMapping("/analytics")
    public Mono<Map<String, Object>> getAnalytics() {
        return monitoringService.getPerformanceAnalytics();
    }

    /**
     * Restart a server
     */
    @PostMapping("/servers/{serverId}/restart")
    public Mono<ResponseEntity<String>> restartServer(@PathVariable String serverId) {
        return monitoringService.restartServer(serverId)
                .map(success -> success ? 
                    ResponseEntity.ok("Server restarted successfully") :
                    ResponseEntity.internalServerError().body("Failed to restart server"));
    }

    /**
     * Stop a server
     */
    @PostMapping("/servers/{serverId}/stop")
    public Mono<ResponseEntity<String>> stopServer(@PathVariable String serverId) {
        return monitoringService.stopServer(serverId)
                .map(success -> success ? 
                    ResponseEntity.ok("Server stopped successfully") :
                    ResponseEntity.internalServerError().body("Failed to stop server"));
    }

    /**
     * Start a server
     */
    @PostMapping("/servers/{serverId}/start")
    public Mono<ResponseEntity<String>> startServer(@PathVariable String serverId) {
        return monitoringService.startServer(serverId)
                .map(success -> success ? 
                    ResponseEntity.ok("Server started successfully") :
                    ResponseEntity.internalServerError().body("Failed to start server"));
    }
}
