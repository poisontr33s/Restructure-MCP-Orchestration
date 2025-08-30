package com.mcporchestration.monitor.service;

import com.mcporchestration.shared.model.ServerInfo;
import com.mcporchestration.shared.types.ServerStatus;
import com.mcporchestration.shared.types.ServerType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Advanced Java 21 monitoring service tests with virtual threads and reactive patterns
 * 
 * Captain Guthilda's Renaissance Monitoring Tests:
 * - WebSocket real-time updates
 * - Virtual thread metrics collection
 * - AI performance monitoring
 * - Pattern matching validation
 */
@ExtendWith(MockitoExtension.class)
class MonitoringServiceTest {

    @Mock
    private WebClient webClient;
    
    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    
    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    
    @Mock
    private WebClient.ResponseSpec responseSpec;

    private MonitoringService monitoringService;

    @BeforeEach
    void setUp() {
        monitoringService = new MonitoringService(webClient);
    }

    @Test
    void shouldStreamServerStatusUpdatesWithVirtualThreads() {
        // Given - Stream of AI server updates with virtual thread metrics
        var serverUpdates = Flux.just(
            createAiServerInfo("guthilda-nlp-1", ServerStatus.STARTING, Map.of(
                "virtual_threads", "50", "ai_model", "gpt-4", "initialization_phase", "loading")),
            createAiServerInfo("guthilda-nlp-1", ServerStatus.RUNNING, Map.of(
                "virtual_threads", "150", "ai_model", "gpt-4", "initialization_phase", "complete")),
            createAiServerInfo("claude-reasoning-1", ServerStatus.RUNNING, Map.of(
                "virtual_threads", "75", "ai_model", "claude-3", "reasoning_depth", "advanced"))
        ).delayElements(Duration.ofMillis(100));

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri("/api/servers/stream")).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToFlux(ServerInfo.class)).thenReturn(serverUpdates);

        // When
        var result = monitoringService.streamServerUpdates();

        // Then - Validate streaming updates with AI metrics
        StepVerifier.create(result.take(3))
            .assertNext(info -> {
                assertEquals("guthilda-nlp-1", info.name());
                assertEquals(ServerStatus.STARTING, info.status());
                assertEquals("50", info.metadata().get("virtual_threads"));
                assertEquals("loading", info.metadata().get("initialization_phase"));
            })
            .assertNext(info -> {
                assertEquals("guthilda-nlp-1", info.name());
                assertEquals(ServerStatus.RUNNING, info.status());
                assertEquals("150", info.metadata().get("virtual_threads"));
                assertEquals("complete", info.metadata().get("initialization_phase"));
            })
            .assertNext(info -> {
                assertEquals("claude-reasoning-1", info.name());
                assertEquals(ServerStatus.RUNNING, info.status());
                assertEquals("advanced", info.metadata().get("reasoning_depth"));
            })
            .verifyComplete();
    }

    @Test
    void shouldCollectSystemMetricsWithAiInsights() {
        // Given - System metrics with AI-specific data
        var systemMetrics = Map.of(
            "total_servers", 12,
            "ai_servers_active", 8,
            "virtual_threads_total", 2500,
            "virtual_threads_active", 1850,
            "memory_usage_gb", 4.2,
            "ai_model_cache_hit_ratio", 0.94,
            "guthilda_orchestration_mode", "autonomous",
            "claude_integration_status", "optimal",
            "sequential_thinking_depth", 5
        );

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri("/api/metrics")).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(systemMetrics));

        // When
        var result = monitoringService.getSystemMetrics();

        // Then - Validate AI-enhanced system metrics
        StepVerifier.create(result)
            .assertNext(metrics -> {
                assertEquals(12, metrics.get("total_servers"));
                assertEquals(8, metrics.get("ai_servers_active"));
                assertEquals(2500, metrics.get("virtual_threads_total"));
                assertEquals(1850, metrics.get("virtual_threads_active"));
                assertEquals(0.94, metrics.get("ai_model_cache_hit_ratio"));
                assertEquals("autonomous", metrics.get("guthilda_orchestration_mode"));
                assertEquals("optimal", metrics.get("claude_integration_status"));
            })
            .verifyComplete();
    }

    @Test
    void shouldMonitorAiPerformanceMetrics() {
        // Given - AI performance data with pattern matching scenarios
        var aiMetrics = Map.of(
            "nlp_processing_time_ms", 245.7,
            "reasoning_accuracy_percentage", 96.8,
            "model_switching_time_ms", 150.3,
            "virtual_thread_efficiency", 0.87,
            "ai_decision_confidence", 0.91,
            "guthilda_meta_automation_score", 0.95,
            "claude_reasoning_depth_avg", 4.2,
            "sequential_thinking_iterations_avg", 6.8
        );

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri("/api/ai-metrics")).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(aiMetrics));

        // When
        var result = monitoringService.getAiPerformanceMetrics();

        // Then - Validate AI performance insights
        StepVerifier.create(result)
            .assertNext(metrics -> {
                assertEquals(245.7, metrics.get("nlp_processing_time_ms"));
                assertEquals(96.8, metrics.get("reasoning_accuracy_percentage"));
                assertEquals(0.87, metrics.get("virtual_thread_efficiency"));
                assertEquals(0.95, metrics.get("guthilda_meta_automation_score"));
                assertEquals(4.2, metrics.get("claude_reasoning_depth_avg"));
                
                // Validate performance thresholds
                assertTrue((Double) metrics.get("reasoning_accuracy_percentage") > 95.0);
                assertTrue((Double) metrics.get("ai_decision_confidence") > 0.90);
            })
            .verifyComplete();
    }

    @Test
    void shouldHandleServerCrashesWithGracefulRecovery() {
        // Given - Server crash scenario with AI context
        var crashedServer = createAiServerInfo("crashed-ai-server", ServerStatus.ERROR, Map.of(
            "error_type", "ai_model_crash",
            "virtual_threads_leaked", "25",
            "last_ai_decision", "incomplete",
            "recovery_strategy", "restart_with_checkpoint"
        ));

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(ServerInfo.class)).thenReturn(Mono.just(crashedServer));

        // When
        var result = monitoringService.getServerInfo("crashed-ai-server");

        // Then - Validate crash detection and recovery planning
        StepVerifier.create(result)
            .assertNext(info -> {
                assertEquals(ServerStatus.ERROR, info.status());
                assertEquals("ai_model_crash", info.metadata().get("error_type"));
                assertEquals("25", info.metadata().get("virtual_threads_leaked"));
                assertEquals("restart_with_checkpoint", info.metadata().get("recovery_strategy"));
            })
            .verifyComplete();
    }

    @Test
    void shouldStreamRealTimeLogsWithAiFiltering() {
        // Given - Log stream with AI-enhanced filtering
        var logEntries = Flux.just(
            Map.of("level", "INFO", "message", "AI model loaded successfully", 
                   "server", "guthilda-nlp-1", "ai_context", "model_initialization"),
            Map.of("level", "WARN", "message", "Virtual thread pool approaching capacity", 
                   "server", "orchestration-hub", "ai_context", "resource_management"),
            Map.of("level", "ERROR", "message", "Claude API rate limit exceeded", 
                   "server", "claude-integration", "ai_context", "api_throttling"),
            Map.of("level", "INFO", "message", "Sequential thinking completed iteration 5", 
                   "server", "thinking-server", "ai_context", "reasoning_progress")
        ).delayElements(Duration.ofMillis(50));

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri("/api/logs/stream")).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToFlux(Map.class)).thenReturn(logEntries);

        // When
        var result = monitoringService.streamSystemLogs();

        // Then - Validate AI-contextual log streaming
        StepVerifier.create(result.take(4))
            .assertNext(log -> {
                assertEquals("INFO", log.get("level"));
                assertEquals("model_initialization", log.get("ai_context"));
                assertTrue(((String) log.get("message")).contains("AI model"));
            })
            .assertNext(log -> {
                assertEquals("WARN", log.get("level"));
                assertEquals("resource_management", log.get("ai_context"));
                assertTrue(((String) log.get("message")).contains("Virtual thread"));
            })
            .assertNext(log -> {
                assertEquals("ERROR", log.get("level"));
                assertEquals("api_throttling", log.get("ai_context"));
                assertTrue(((String) log.get("message")).contains("Claude API"));
            })
            .assertNext(log -> {
                assertEquals("INFO", log.get("level"));
                assertEquals("reasoning_progress", log.get("ai_context"));
                assertTrue(((String) log.get("message")).contains("Sequential thinking"));
            })
            .verifyComplete();
    }

    @Test
    void shouldDetectAnomaliesInServerBehavior() {
        // Given - Anomaly detection with AI patterns
        var anomalyReport = Map.of(
            "server_name", "suspicious-ai-server",
            "anomaly_type", "memory_leak_virtual_threads",
            "severity", "HIGH", 
            "ai_confidence", 0.89,
            "pattern_deviation", 2.3,
            "recommended_action", "immediate_restart",
            "guthilda_analysis", "virtual_thread_leak_detected_autonomous_recovery_initiated",
            "detection_algorithm", "pattern_matching_with_ml"
        );

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri("/api/anomalies")).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToFlux(Map.class)).thenReturn(Flux.just(anomalyReport));

        // When
        var result = monitoringService.detectAnomalies();

        // Then - Validate AI-powered anomaly detection
        StepVerifier.create(result.take(1))
            .assertNext(anomaly -> {
                assertEquals("suspicious-ai-server", anomaly.get("server_name"));
                assertEquals("memory_leak_virtual_threads", anomaly.get("anomaly_type"));
                assertEquals("HIGH", anomaly.get("severity"));
                assertEquals(0.89, anomaly.get("ai_confidence"));
                assertEquals("immediate_restart", anomaly.get("recommended_action"));
                assertTrue(((String) anomaly.get("guthilda_analysis")).contains("autonomous_recovery"));
            })
            .verifyComplete();
    }

    private ServerInfo createAiServerInfo(String name, ServerStatus status, Map<String, String> metadata) {
        return new ServerInfo(
            name,
            ServerType.GUTHILDA_AI,
            status,
            8080,
            true,
            Instant.now(),
            status == ServerStatus.RUNNING ? Instant.now() : null,
            metadata
        );
    }
}
