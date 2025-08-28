package com.mcporchestration.cli.service;

import com.mcporchestration.shared.config.ServerConfig;
import com.mcporchestration.shared.types.ServerType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Service for communicating with MCP Core API
 * Enhanced with Java 21 records and reactive programming
 */
@Service
public class McpApiService {
    
    private final WebClient webClient;
    
    public McpApiService() {
        this.webClient = WebClient.builder()
            .baseUrl("http://localhost:8080/api")
            .build();
    }

    /**
     * Get system status from the core API
     */
    public Mono<SystemStatusResponse> getSystemStatus() {
        return webClient.get()
            .uri("/status")
            .retrieve()
            .bodyToMono(SystemStatusResponse.class);
    }

    /**
     * Start a server
     */
    public Mono<ApiResponse> startServer(ServerType serverType, int port) {
        var config = ServerConfig.builder()
            .name(serverType.getValue())
            .type(serverType)
            .port(port)
            .enabled(true)
            .description("Started via CLI")
            .build();

        var serverId = config.getServerId();

        return webClient.post()
            .uri("/servers/{serverId}/start", serverId)
            .bodyValue(config)
            .retrieve()
            .bodyToMono(ApiResponse.class);
    }

    /**
     * Stop a server
     */
    public Mono<ApiResponse> stopServer(String serverId) {
        return webClient.post()
            .uri("/servers/{serverId}/stop", serverId)
            .retrieve()
            .bodyToMono(ApiResponse.class);
    }

    /**
     * Get Captain Guthilda's status
     */
    public Mono<Map<String, Object>> getGuthildaStatus() {
        return webClient.get()
            .uri("/guthilda/status")
            .retrieve()
            .bodyToMono(Map.class);
    }

    /**
     * Response records for API communication
     */
    public record SystemStatusResponse(
        java.time.Instant timestamp,
        int totalServers,
        int healthyServers,
        int unhealthyServers,
        SystemMetricsResponse systemMetrics,
        java.util.List<ServerInfoResponse> servers
    ) {}

    public record SystemMetricsResponse(
        int availableProcessors,
        long totalMemory,
        long freeMemory,
        String javaVersion,
        String threadingModel
    ) {}

    public record ServerInfoResponse(
        ServerConfigResponse config,
        String status,
        Long pid,
        java.time.Instant startTime,
        java.time.Instant lastHealthCheck,
        String version,
        Map<String, Object> metadata
    ) {
        public boolean isHealthy() {
            return "RUNNING".equals(status) || "STARTING".equals(status);
        }
    }

    public record ServerConfigResponse(
        String name,
        String type,
        int port,
        boolean enabled,
        String description
    ) {}

    public record ApiResponse(
        boolean success,
        String message,
        Object data
    ) {}
}
