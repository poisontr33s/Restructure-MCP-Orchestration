package com.mcporchestration.servers.base;

import com.mcporchestration.shared.types.ServerStatus;
import com.mcporchestration.shared.types.ServerType;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 🏴‍☠️ CAPTAIN GUTHILDA'S ABSTRACT MCP SERVER
 * 
 * Base class for all MCP server implementations using Java 21 features.
 * Provides common functionality and enforces the server lifecycle contract.
 */
public abstract class AbstractMcpServer {

    protected final String serverId;
    protected final ServerType serverType;
    protected final AtomicReference<ServerStatus> status;
    protected long startTime;
    protected long lastActivityTime;

    protected AbstractMcpServer(String serverId, ServerType serverType) {
        this.serverId = serverId;
        this.serverType = serverType;
        this.status = new AtomicReference<>(ServerStatus.STOPPED);
        this.lastActivityTime = System.currentTimeMillis();
    }

    /**
     * Start the server using Java 21 virtual threads
     */
    public final CompletableFuture<Void> start() {
        if (status.compareAndSet(ServerStatus.STOPPED, ServerStatus.STARTING)) {
            return doStart()
                .thenRun(() -> {
                    status.set(ServerStatus.RUNNING);
                    startTime = System.currentTimeMillis();
                    lastActivityTime = startTime;
                    System.out.println("✅ Server " + serverId + " started successfully");
                })
                .exceptionally(throwable -> {
                    status.set(ServerStatus.ERROR);
                    System.err.println("❌ Failed to start server " + serverId + ": " + throwable.getMessage());
                    return null;
                });
        }
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Stop the server gracefully
     */
    public final CompletableFuture<Void> stop() {
        if (status.compareAndSet(ServerStatus.RUNNING, ServerStatus.STOPPING)) {
            return doStop()
                .thenRun(() -> {
                    status.set(ServerStatus.STOPPED);
                    System.out.println("🛑 Server " + serverId + " stopped successfully");
                })
                .exceptionally(throwable -> {
                    status.set(ServerStatus.ERROR);
                    System.err.println("❌ Failed to stop server " + serverId + ": " + throwable.getMessage());
                    return null;
                });
        }
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Restart the server
     */
    public final CompletableFuture<Void> restart() {
        return stop().thenCompose(v -> start());
    }

    /**
     * Check server health using pattern matching
     */
    public final ServerHealth checkHealth() {
        updateLastActivity();
        
        return switch (status.get()) {
            case RUNNING -> new ServerHealth(
                serverId,
                ServerHealth.HealthStatus.HEALTHY,
                "Server is running normally",
                getUptime(),
                getMetrics()
            );
            case STARTING, STOPPING, INITIALIZING -> new ServerHealth(
                serverId,
                ServerHealth.HealthStatus.TRANSITIONING,
                "Server is transitioning state",
                getUptime(),
                getMetrics()
            );
            case ERROR -> new ServerHealth(
                serverId,
                ServerHealth.HealthStatus.UNHEALTHY,
                "Server is in error state",
                getUptime(),
                getMetrics()
            );
            case STOPPED -> new ServerHealth(
                serverId,
                ServerHealth.HealthStatus.STOPPED,
                "Server is stopped",
                0,
                getMetrics()
            );
            case NOT_RESPONDING, TIMEOUT -> new ServerHealth(
                serverId,
                ServerHealth.HealthStatus.UNHEALTHY,
                "Server is not responding or timed out",
                getUptime(),
                getMetrics()
            );
            case DEGRADED -> new ServerHealth(
                serverId,
                ServerHealth.HealthStatus.DEGRADED,
                "Server is running but with reduced performance",
                getUptime(),
                getMetrics()
            );
            case MAINTENANCE -> new ServerHealth(
                serverId,
                ServerHealth.HealthStatus.MAINTENANCE,
                "Server is under maintenance",
                getUptime(),
                getMetrics()
            );
        };
    }

    // Abstract methods to be implemented by concrete servers
    protected abstract CompletableFuture<Void> doStart();
    protected abstract CompletableFuture<Void> doStop();

    // Getters
    public String getServerId() { return serverId; }
    public ServerType getServerType() { return serverType; }
    public ServerStatus getStatus() { return status.get(); }
    public long getUptime() { 
        return status.get() == ServerStatus.RUNNING ? System.currentTimeMillis() - startTime : 0; 
    }

    // Protected helper methods
    protected void updateLastActivity() {
        this.lastActivityTime = System.currentTimeMillis();
    }

    protected java.util.Map<String, Object> getMetrics() {
        return java.util.Map.of(
            "uptime", getUptime(),
            "lastActivity", lastActivityTime,
            "status", status.get().name(),
            "type", serverType.name()
        );
    }

    // Health record for server status
    public record ServerHealth(
        String serverId,
        HealthStatus status,
        String message,
        long uptime,
        java.util.Map<String, Object> metrics
    ) {
        public enum HealthStatus {
            HEALTHY, UNHEALTHY, TRANSITIONING, STOPPED, DEGRADED, MAINTENANCE
        }
    }
}
