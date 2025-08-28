package com.mcporchestration.integration;

import com.mcporchestration.core.McpCoreApplication;
import com.mcporchestration.core.orchestration.OrchestrationHub;
import com.mcporchestration.shared.config.ServerConfig;
import com.mcporchestration.shared.model.ServerInfo;
import com.mcporchestration.shared.types.ServerStatus;
import com.mcporchestration.shared.types.ServerType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.web.reactive.function.BodyInserters;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive Java 21 MCP Orchestration System Integration Tests
 * 
 * Captain Guthilda's Renaissance Integration Test Suite:
 * - Full system orchestration validation
 * - Virtual thread coordination testing
 * - AI integration end-to-end scenarios
 * - Real-world workflow simulation
 * - Performance and scalability validation
 */
@SpringBootTest(
    classes = McpCoreApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "logging.level.com.mcporchestration=DEBUG",
        "mcp.orchestration.virtual-threads.enabled=true",
        "mcp.orchestration.ai-integration.enabled=true",
        "mcp.orchestration.guthilda-mode=autonomous"
    }
)
@AutoConfigureWebTestClient(timeout = Duration.ofSeconds(30))
@ActiveProfiles("integration-test")
class McpOrchestrationSystemIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private OrchestrationHub orchestrationHub;

    @Test
    void shouldBootstrapCompleteAiOrchestrationSystemWithVirtualThreads() {
        // Given - System initialization
        var systemInitialization = orchestrationHub.initialize();
        
        // When - Initialize the complete system
        assertDoesNotThrow(() -> systemInitialization.get());

        // Then - Validate system readiness
        assertTrue(orchestrationHub.isInitialized());
        assertTrue(orchestrationHub.isVirtualThreadsEnabled());
        
        // Validate system health endpoint
        webTestClient.get()
            .uri("/api/health")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.status").isEqualTo("healthy")
            .jsonPath("$.virtual_threads_enabled").isEqualTo(true)
            .jsonPath("$.ai_integration_active").isEqualTo(true)
            .jsonPath("$.guthilda_mode").isEqualTo("autonomous");
    }

    @Test
    void shouldOrchestrateMixedAiServersWithAdvancedCoordination() {
        // Given - Complex AI server configurations
        var guthildaAiConfig = new ServerConfig(
            "guthilda-master-ai",
            ServerType.GUTHILDA_AI,
            9001,
            true,
            Map.of(
                "ai_model", "gpt-4-turbo",
                "orchestration_mode", "autonomous",
                "virtual_thread_pool", "1000",
                "reasoning_depth", "deep"
            )
        );

        var claudeIntegrationConfig = new ServerConfig(
            "claude-reasoning-engine",
            ServerType.CLAUDE_INTEGRATION,
            9002,
            true,
            Map.of(
                "ai_model", "claude-3-opus",
                "reasoning_specialization", "logical_analysis",
                "virtual_thread_pool", "500",
                "integration_level", "deep"
            )
        );

        var sequentialThinkingConfig = new ServerConfig(
            "sequential-meta-thinker",
            ServerType.SEQUENTIAL_THINKING,
            9003,
            true,
            Map.of(
                "complexity_level", "expert",
                "max_iterations", "15",
                "virtual_thread_pool", "300",
                "ai_enhanced", "true"
            )
        );

        // When - Start and coordinate multiple AI servers
        CompletableFuture.allOf(
            startServerViaApi(guthildaAiConfig),
            startServerViaApi(claudeIntegrationConfig),
            startServerViaApi(sequentialThinkingConfig)
        ).join();

        // Then - Validate coordinated AI orchestration
        webTestClient.get()
            .uri("/api/servers")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.length()").isEqualTo(3)
            .jsonPath("$[?(@.name=='guthilda-master-ai')].status").isEqualTo("RUNNING")
            .jsonPath("$[?(@.name=='claude-reasoning-engine')].status").isEqualTo("RUNNING")
            .jsonPath("$[?(@.name=='sequential-meta-thinker')].status").isEqualTo("RUNNING");

        // Validate AI coordination metrics
        webTestClient.get()
            .uri("/api/ai-coordination/metrics")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.active_ai_servers").isEqualTo(3)
            .jsonPath("$.virtual_threads_total").isNumber()
            .jsonPath("$.ai_decision_coordination").isEqualTo("active")
            .jsonPath("$.guthilda_orchestration_status").isEqualTo("autonomous");
    }

    @Test
    void shouldHandleRealWorldAiWorkflowWithPatternMatching() {
        // Given - Real-world AI workflow scenario
        var workflowRequest = Map.of(
            "workflow_type", "complex_reasoning_with_nlp",
            "input_data", Map.of(
                "text_to_analyze", "Optimize distributed AI system performance while maintaining quality",
                "reasoning_requirements", Map.of(
                    "depth", "comprehensive",
                    "creativity", true,
                    "logical_analysis", true,
                    "technical_optimization", true
                ),
                "performance_constraints", Map.of(
                    "max_processing_time_seconds", 30,
                    "min_confidence_threshold", 0.90,
                    "virtual_thread_limit", 2000
                )
            ),
            "coordination_strategy", "parallel_with_synthesis"
        );

        // When - Execute complex AI workflow
        var workflowResult = webTestClient.post()
            .uri("/api/ai-workflow/execute")
            .body(BodyInserters.fromValue(workflowRequest))
            .exchange()
            .expectStatus().isOk()
            .expectBody(Map.class)
            .returnResult()
            .getResponseBody();

        // Then - Validate comprehensive workflow execution
        assertNotNull(workflowResult);
        assertTrue(workflowResult.containsKey("workflow_id"));
        assertTrue(workflowResult.containsKey("execution_status"));
        assertTrue(workflowResult.containsKey("ai_coordination_plan"));

        var workflowId = (String) workflowResult.get("workflow_id");
        
        // Validate workflow progress and completion
        webTestClient.get()
            .uri("/api/ai-workflow/{workflowId}/status", workflowId)
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.status").isEqualTo("completed")
            .jsonPath("$.ai_servers_utilized").isNumber()
            .jsonPath("$.virtual_threads_peak").isNumber()
            .jsonPath("$.overall_confidence").isNumber()
            .jsonPath("$.guthilda_enhancement_factor").isNumber();

        // Validate workflow results quality
        webTestClient.get()
            .uri("/api/ai-workflow/{workflowId}/results", workflowId)
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.nlp_analysis").exists()
            .jsonPath("$.reasoning_conclusions").exists()
            .jsonPath("$.optimization_recommendations").exists()
            .jsonPath("$.confidence_metrics.overall").isNumber()
            .jsonPath("$.performance_metrics.execution_time_ms").isNumber()
            .jsonPath("$.guthilda_insights").exists();
    }

    @Test
    void shouldScaleAiSystemDynamicallyWithVirtualThreadOptimization() {
        // Given - System under increasing load
        var initialLoad = getCurrentSystemLoad();
        
        // Simulate increasing load with multiple concurrent requests
        var loadSimulation = CompletableFuture.allOf(
            simulateAiWorkload("nlp_processing", 10),
            simulateAiWorkload("logical_reasoning", 8),
            simulateAiWorkload("sequential_thinking", 6),
            simulateAiWorkload("pattern_matching", 12)
        );

        // When - System scales under load
        assertDoesNotThrow(() -> loadSimulation.get());

        // Then - Validate dynamic scaling behavior
        webTestClient.get()
            .uri("/api/system/scaling-metrics")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.auto_scaling_triggered").isEqualTo(true)
            .jsonPath("$.virtual_threads_scaled").isNumber()
            .jsonPath("$.ai_servers_load_balanced").isEqualTo(true)
            .jsonPath("$.guthilda_autonomous_decisions").isNumber()
            .jsonPath("$.scaling_efficiency").isNumber();

        // Validate that system maintained performance under load
        webTestClient.get()
            .uri("/api/system/performance-validation")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.response_time_degradation_percentage").isNumber()
            .jsonPath("$.ai_quality_maintained").isEqualTo(true)
            .jsonPath("$.virtual_thread_efficiency").isNumber()
            .jsonPath("$.memory_optimization_active").isEqualTo(true);
    }

    @Test
    void shouldDetectAndRecoverFromSystemAnomaliesAutonomously() {
        // Given - Introduce system anomaly simulation
        var anomalySimulation = Map.of(
            "anomaly_type", "virtual_thread_leak_simulation",
            "severity", "moderate",
            "affected_components", java.util.List.of("ai_decision_engine", "sequential_thinking"),
            "expected_impact", Map.of(
                "memory_increase", 0.25,
                "response_time_increase", 0.15,
                "ai_confidence_decrease", 0.08
            )
        );

        // When - Trigger anomaly and observe autonomous recovery
        webTestClient.post()
            .uri("/api/system/simulate-anomaly")
            .body(BodyInserters.fromValue(anomalySimulation))
            .exchange()
            .expectStatus().isAccepted()
            .expectBody()
            .jsonPath("$.simulation_id").exists()
            .jsonPath("$.guthilda_monitoring").isEqualTo("active");

        // Wait for detection and recovery
        try {
            Thread.sleep(5000); // Allow time for detection and recovery
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then - Validate autonomous anomaly detection and recovery
        webTestClient.get()
            .uri("/api/system/anomaly-recovery-status")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.anomaly_detected").isEqualTo(true)
            .jsonPath("$.detection_time_ms").isNumber()
            .jsonPath("$.recovery_initiated").isEqualTo(true)
            .jsonPath("$.recovery_strategy").exists()
            .jsonPath("$.guthilda_autonomous_action").isEqualTo(true)
            .jsonPath("$.system_health_restored").isEqualTo(true);

        // Validate system returned to optimal state
        webTestClient.get()
            .uri("/api/system/health-validation")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.overall_health").isEqualTo("optimal")
            .jsonPath("$.virtual_threads_healthy").isEqualTo(true)
            .jsonPath("$.ai_performance_restored").isEqualTo(true)
            .jsonPath("$.memory_leaks_resolved").isEqualTo(true);
    }

    @Test
    void shouldDemonstrateAdvancedAiLearningAndAdaptation() {
        // Given - Historical performance data for learning
        var learningDataset = Map.of(
            "historical_decisions", java.util.List.of(
                Map.of("scenario", "high_load", "decision", "scale_virtual_threads", "outcome_success", true),
                Map.of("scenario", "memory_pressure", "decision", "optimize_ai_models", "outcome_success", true),
                Map.of("scenario", "ai_quality_drop", "decision", "model_switching", "outcome_success", false),
                Map.of("scenario", "response_time_spike", "decision", "load_redistribution", "outcome_success", true)
            ),
            "performance_patterns", java.util.List.of(
                Map.of("time_period", "morning_peak", "optimal_config", Map.of("ai_servers", 8, "virtual_threads", 2000)),
                Map.of("time_period", "afternoon_steady", "optimal_config", Map.of("ai_servers", 5, "virtual_threads", 1200))
            ),
            "learning_objectives", java.util.List.of(
                "improve_decision_accuracy",
                "optimize_resource_allocation", 
                "enhance_autonomous_operation"
            )
        );

        // When - Trigger AI learning and adaptation
        webTestClient.post()
            .uri("/api/ai-learning/train-adaptation-model")
            .body(BodyInserters.fromValue(learningDataset))
            .exchange()
            .expectStatus().isAccepted()
            .expectBody()
            .jsonPath("$.training_session_id").exists()
            .jsonPath("$.guthilda_meta_learning").isEqualTo("active");

        // Wait for learning completion
        try {
            Thread.sleep(8000); // Allow time for ML training
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Then - Validate AI learning outcomes
        webTestClient.get()
            .uri("/api/ai-learning/adaptation-results")
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.learning_completed").isEqualTo(true)
            .jsonPath("$.model_accuracy_improvement").isNumber()
            .jsonPath("$.decision_confidence_increase").isNumber()
            .jsonPath("$.guthilda_intelligence_enhancement").isNumber()
            .jsonPath("$.autonomous_capabilities_upgraded").isEqualTo(true);

        // Validate improved decision making
        var testScenario = Map.of(
            "scenario_type", "resource_optimization",
            "system_state", Map.of(
                "current_load", 0.78,
                "memory_usage", 0.65,
                "ai_performance", 0.92
            )
        );

        webTestClient.post()
            .uri("/api/ai-decision/make-enhanced-decision")
            .body(BodyInserters.fromValue(testScenario))
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.decision_confidence").isNumber()
            .jsonPath("$.learning_applied").isEqualTo(true)
            .jsonPath("$.guthilda_enhancement_factor").isNumber()
            .jsonPath("$.predicted_success_rate").isNumber();
    }

    // Helper methods for integration test scenarios

    private CompletableFuture<ServerInfo> startServerViaApi(ServerConfig config) {
        return CompletableFuture.supplyAsync(() -> {
            var response = webTestClient.post()
                .uri("/api/servers/start")
                .body(BodyInserters.fromValue(config))
                .exchange()
                .expectStatus().isOk()
                .expectBody(ServerInfo.class)
                .returnResult()
                .getResponseBody();
            
            // Wait for server to reach running state
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            return response;
        });
    }

    private CompletableFuture<Void> simulateAiWorkload(String workloadType, int requestCount) {
        return CompletableFuture.runAsync(() -> {
            for (int i = 0; i < requestCount; i++) {
                var workloadRequest = Map.of(
                    "type", workloadType,
                    "complexity", "medium",
                    "request_id", workloadType + "_" + i
                );

                webTestClient.post()
                    .uri("/api/workload/simulate")
                    .body(BodyInserters.fromValue(workloadRequest))
                    .exchange()
                    .expectStatus().isAccepted();

                try {
                    Thread.sleep(100); // Small delay between requests
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
    }

    private Map<String, Object> getCurrentSystemLoad() {
        return webTestClient.get()
            .uri("/api/system/current-load")
            .exchange()
            .expectStatus().isOk()
            .expectBody(Map.class)
            .returnResult()
            .getResponseBody();
    }
}
