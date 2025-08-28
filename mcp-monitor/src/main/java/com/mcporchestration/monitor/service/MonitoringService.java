package com.mcporchestration.monitor.service;

import com.mcporchestration.shared.model.ServerInfo;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

/**
 * 🏴‍☠️ CAPTAIN GUTHILDA'S MONITORING SERVICE
 * 
 * Core monitoring service that interfaces with the orchestration core
 * to provide real-time monitoring data. Uses Java 21 virtual threads
 * for enhanced concurrency and reactive streams for real-time updates.
 */
@Service
public class MonitoringService {

    private final WebClient webClient;
    private final ExecutorService virtualExecutor;

    public MonitoringService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("http://localhost:8080") // MCP Core URL
                .build();
        this.virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();
    }

    /**
     * Get all servers from the orchestration core
     */
    public Mono<List<ServerInfo>> getAllServers() {
        return webClient.get()
                .uri("/api/orchestration/servers")
                .retrieve()
                .bodyToFlux(ServerInfo.class)
                .collectList();
    }

    /**
     * Get server by ID
     */
    public Mono<ServerInfo> getServerById(String serverId) {
        return webClient.get()
                .uri("/api/orchestration/servers/{serverId}", serverId)
                .retrieve()
                .bodyToMono(ServerInfo.class);
    }

    /**
     * Get real-time metrics stream using Java 21 virtual threads
     */
    public Flux<Map<String, Object>> getMetricsStream() {
        return Flux.interval(Duration.ofSeconds(1))
                .flatMap(tick -> getSystemMetrics())
                .onErrorContinue((error, obj) -> {
                    System.err.println("Error in metrics stream: " + error.getMessage());
                });
    }

    /**
     * Get current system metrics
     */
    private Mono<Map<String, Object>> getSystemMetrics() {
        return Mono.fromCallable(() -> {
            // Using virtual threads for concurrent metric collection
            var runtime = Runtime.getRuntime();
            
            return Map.of(
                "timestamp", System.currentTimeMillis(),
                "memory", Map.of(
                    "total", runtime.totalMemory(),
                    "free", runtime.freeMemory(),
                    "used", runtime.totalMemory() - runtime.freeMemory(),
                    "max", runtime.maxMemory()
                ),
                "cpu", Map.of(
                    "processors", runtime.availableProcessors(),
                    "load", getSystemLoad()
                ),
                "threads", Map.of(
                    "virtual", Thread.activeCount(),
                    "platform", Thread.getAllStackTraces().size()
                )
            );
        }).subscribeOn(reactor.core.scheduler.Schedulers.fromExecutor(virtualExecutor));
    }

    /**
     * Get system health status
     */
    public Mono<Map<String, Object>> getSystemHealth() {
        return webClient.get()
                .uri("/api/orchestration/health")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .defaultIfEmpty(Map.of("status", "unknown"));
    }

    /**
     * Get performance analytics
     */
    public Mono<Map<String, Object>> getPerformanceAnalytics() {
        return getAllServers()
                .map(servers -> {
                    var analytics = Map.of(
                        "totalServers", servers.size(),
                        "activeServers", servers.stream().mapToInt(s -> 
                            s.status().name().equals("RUNNING") ? 1 : 0).sum(),
                        "serverTypes", servers.stream()
                            .collect(java.util.stream.Collectors.groupingBy(
                                s -> s.config().type().name(),
                                java.util.stream.Collectors.counting()
                            )),
                        "uptime", getSystemUptime()
                    );
                    return analytics;
                });
    }

    /**
     * Restart a server
     */
    public Mono<Boolean> restartServer(String serverId) {
        return webClient.post()
                .uri("/api/orchestration/servers/{serverId}/restart", serverId)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> true)
                .onErrorReturn(false);
    }

    /**
     * Stop a server
     */
    public Mono<Boolean> stopServer(String serverId) {
        return webClient.post()
                .uri("/api/orchestration/servers/{serverId}/stop", serverId)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> true)
                .onErrorReturn(false);
    }

    /**
     * Start a server
     */
    public Mono<Boolean> startServer(String serverId) {
        return webClient.post()
                .uri("/api/orchestration/servers/{serverId}/start", serverId)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> true)
                .onErrorReturn(false);
    }

    /**
     * Get system load (Java 21 compatible)
     */
    private double getSystemLoad() {
        try {
            var mxBean = java.lang.management.ManagementFactory.getOperatingSystemMXBean();
            if (mxBean instanceof com.sun.management.OperatingSystemMXBean osBean) {
                return osBean.getCpuLoad();
            }
            return -1.0;
        } catch (Exception e) {
            return -1.0;
        }
    }

    /**
     * Get system uptime
     */
    private long getSystemUptime() {
        var runtimeMXBean = java.lang.management.ManagementFactory.getRuntimeMXBean();
        return runtimeMXBean.getUptime();
    }
}
