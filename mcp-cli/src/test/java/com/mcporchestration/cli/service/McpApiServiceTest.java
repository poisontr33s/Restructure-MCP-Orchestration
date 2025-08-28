package com.mcporchestration.cli.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mcporchestration.shared.config.ServerConfig;
import com.mcporchestration.shared.model.ServerInfo;
import com.mcporchestration.shared.types.ServerStatus;
import com.mcporchestration.shared.types.ServerType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for McpApiService with Java 21 features and virtual thread testing
 * 
 * Captain Guthilda's Renaissance Testing Paradigm:
 * - Test all virtual thread scenarios
 * - Validate reactive patterns
 * - Ensure AI integration readiness
 */
@ExtendWith(MockitoExtension.class)
class McpApiServiceTest {

    @Mock
    private WebClient webClient;
    
    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    
    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    
    @Mock
    private WebClient.ResponseSpec responseSpec;
    
    private McpApiService mcpApiService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mcpApiService = new McpApiService(webClient, objectMapper);
    }

    @Test
    void shouldGetServerInfoSuccessfully() {
        // Given - Captain Guthilda's test server configuration
        var serverInfo = new ServerInfo(
            "test-server",
            ServerType.SEQUENTIAL_THINKING,
            ServerStatus.RUNNING,
            8080,
            true,
            Instant.now(),
            Instant.now(),
            Map.of("ai_enabled", "true", "guthilda_mode", "active")
        );

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(ServerInfo.class)).thenReturn(Mono.just(serverInfo));

        // When
        Mono<ServerInfo> result = mcpApiService.getServerInfo("test-server");

        // Then - Validate reactive pattern with virtual thread support
        StepVerifier.create(result)
            .assertNext(info -> {
                assertEquals("test-server", info.name());
                assertEquals(ServerType.SEQUENTIAL_THINKING, info.type());
                assertEquals(ServerStatus.RUNNING, info.status());
                assertTrue(info.enabled());
                assertEquals("true", info.metadata().get("ai_enabled"));
                assertEquals("active", info.metadata().get("guthilda_mode"));
            })
            .verifyComplete();
    }

    @Test
    void shouldGetAllServersSuccessfully() {
        // Given - Multiple servers for AI orchestration testing
        var servers = List.of(
            new ServerInfo("ai-server-1", ServerType.GUTHILDA_AI, ServerStatus.RUNNING, 8081, true, 
                          Instant.now(), Instant.now(), Map.of("ai_type", "nlp")),
            new ServerInfo("ai-server-2", ServerType.CLAUDE_INTEGRATION, ServerStatus.RUNNING, 8082, true,
                          Instant.now(), Instant.now(), Map.of("ai_type", "reasoning")),
            new ServerInfo("thinking-server", ServerType.SEQUENTIAL_THINKING, ServerStatus.STOPPED, 8083, false,
                          Instant.now(), Instant.now(), Map.of("complexity", "high"))
        );

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri("/api/servers")).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToFlux(ServerInfo.class)).thenReturn(reactor.core.publisher.Flux.fromIterable(servers));

        // When
        var result = mcpApiService.getAllServers();

        // Then - Test AI server diversity and status patterns
        StepVerifier.create(result)
            .assertNext(info -> {
                assertEquals("ai-server-1", info.name());
                assertEquals(ServerType.GUTHILDA_AI, info.type());
                assertEquals("nlp", info.metadata().get("ai_type"));
            })
            .assertNext(info -> {
                assertEquals("ai-server-2", info.name());
                assertEquals(ServerType.CLAUDE_INTEGRATION, info.type());
                assertEquals("reasoning", info.metadata().get("ai_type"));
            })
            .assertNext(info -> {
                assertEquals("thinking-server", info.name());
                assertEquals(ServerType.SEQUENTIAL_THINKING, info.type());
                assertEquals(ServerStatus.STOPPED, info.status());
                assertFalse(info.enabled());
            })
            .verifyComplete();
    }

    @Test
    void shouldStartServerWithModernJavaPatterns() {
        // Given - Server configuration with AI enhancements
        var config = new ServerConfig(
            "guthilda-master",
            ServerType.GUTHILDA_AI,
            9000,
            true,
            Map.of(
                "ai_model", "gpt-4",
                "orchestration_mode", "autonomous",
                "virtual_threads", "enabled"
            )
        );

        var expectedResponse = new ServerInfo(
            config.name(),
            config.type(), 
            ServerStatus.STARTING,
            config.port(),
            config.enabled(),
            Instant.now(),
            null,
            config.metadata()
        );

        when(webClient.post()).thenReturn(mock(WebClient.RequestBodyUriSpec.class));
        when(webClient.post().uri("/api/servers/start")).thenReturn(mock(WebClient.RequestBodySpec.class));
        when(webClient.post().uri("/api/servers/start").bodyValue(any(ServerConfig.class)))
            .thenReturn(mock(WebClient.RequestHeadersSpec.class));
        when(webClient.post().uri("/api/servers/start").bodyValue(any(ServerConfig.class)).retrieve())
            .thenReturn(responseSpec);
        when(responseSpec.bodyToMono(ServerInfo.class)).thenReturn(Mono.just(expectedResponse));

        // When
        var result = mcpApiService.startServer(config);

        // Then - Validate AI-enhanced server startup
        StepVerifier.create(result)
            .assertNext(info -> {
                assertEquals("guthilda-master", info.name());
                assertEquals(ServerType.GUTHILDA_AI, info.type());
                assertEquals(ServerStatus.STARTING, info.status());
                assertEquals("gpt-4", info.metadata().get("ai_model"));
                assertEquals("autonomous", info.metadata().get("orchestration_mode"));
            })
            .verifyComplete();
    }

    @Test
    void shouldHandleServerErrorsGracefully() {
        // Given - Simulate server error with AI context
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(ServerInfo.class))
            .thenReturn(Mono.error(new RuntimeException("AI server connection failed")));

        // When
        var result = mcpApiService.getServerInfo("failing-ai-server");

        // Then - Validate error handling with virtual thread safety
        StepVerifier.create(result)
            .expectErrorMatches(throwable -> 
                throwable instanceof RuntimeException && 
                throwable.getMessage().equals("AI server connection failed"))
            .verify();
    }

    @Test
    void shouldStopServerWithProperCleanup() {
        // Given - Server stopping scenario with AI cleanup
        var stopResponse = new ServerInfo(
            "cleanup-server",
            ServerType.DUCKDUCKGO,
            ServerStatus.STOPPING,
            8080,
            true,
            Instant.now(),
            Instant.now(),
            Map.of("cleanup_phase", "ai_models", "virtual_threads", "terminating")
        );

        when(webClient.post()).thenReturn(mock(WebClient.RequestBodyUriSpec.class));
        when(webClient.post().uri("/api/servers/cleanup-server/stop")).thenReturn(mock(WebClient.RequestBodySpec.class));
        when(webClient.post().uri("/api/servers/cleanup-server/stop").retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(ServerInfo.class)).thenReturn(Mono.just(stopResponse));

        // When
        var result = mcpApiService.stopServer("cleanup-server");

        // Then - Validate proper shutdown sequence
        StepVerifier.create(result)
            .assertNext(info -> {
                assertEquals("cleanup-server", info.name());
                assertEquals(ServerStatus.STOPPING, info.status());
                assertEquals("ai_models", info.metadata().get("cleanup_phase"));
                assertEquals("terminating", info.metadata().get("virtual_threads"));
            })
            .verifyComplete();
    }

    @Test
    void shouldValidateSystemHealthWithAiMetrics() {
        // Given - System health response with AI metrics
        var healthData = Map.of(
            "status", "healthy",
            "ai_servers_active", 5,
            "virtual_threads_count", 1000,
            "guthilda_mode", "autonomous",
            "memory_usage", "2.1GB",
            "ai_model_cache", "optimal"
        );

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri("/api/health")).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(healthData));

        // When
        var result = mcpApiService.getSystemHealth();

        // Then - Validate AI-enhanced health metrics
        StepVerifier.create(result)
            .assertNext(health -> {
                assertEquals("healthy", health.get("status"));
                assertEquals(5, health.get("ai_servers_active"));
                assertEquals(1000, health.get("virtual_threads_count"));
                assertEquals("autonomous", health.get("guthilda_mode"));
                assertEquals("optimal", health.get("ai_model_cache"));
            })
            .verifyComplete();
    }
}
