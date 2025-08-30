package com.mcporchestration.cli;

import com.mcporchestration.cli.service.McpApiService;
import com.mcporchestration.shared.types.ServerType;
import org.fusesource.jansi.Ansi;
import org.springframework.stereotype.Component;
import picocli.CommandLine.*;

import java.util.concurrent.Callable;

/**
 * Main MCP Command with Java 21 enhancements and Captain Guthilda's style
 */
@Component
@Command(
    name = "mcp", 
    description = "🏴‍☠️ Captain Guthilda's MCP Orchestration CLI - Java 21 Edition",
    mixinStandardHelpOptions = true,
    version = "2.0.0-java21",
    subcommands = {
        McpCommand.StatusCommand.class,
        McpCommand.StartCommand.class,
        McpCommand.StopCommand.class,
        McpCommand.GuthildaCommand.class
    }
)
public class McpCommand implements Callable<Integer> {

    private final McpApiService apiService;

    public McpCommand(McpApiService apiService) {
        this.apiService = apiService;
    }

    @Override
    public Integer call() {
        System.out.println(colorize("""
            ╔════════════════════════════════════════════════════════════════╗
            ║          🏴‍☠️ CAPTAIN GUTHILDA'S MCP CLI - JAVA 21              ║
            ║                                                                ║
            ║  Meta-Automation Orchestrator & System Boss                   ║
            ║  Enhanced with Virtual Threads & Pattern Matching            ║
            ║                                                                ║
            ║  Commands:                                                     ║
            ║    status    - Check system status                            ║
            ║    start     - Start MCP servers                              ║
            ║    stop      - Stop MCP servers                               ║
            ║    guthilda  - Captain Guthilda special commands              ║
            ║                                                                ║
            ║  Use 'mcp <command> --help' for more information              ║
            ╚════════════════════════════════════════════════════════════════╝
            """, Ansi.Color.CYAN));
        return 0;
    }

    /**
     * Status command to check system health
     */
    @Component
    @Command(name = "status", description = "📊 Check MCP system status")
    public static class StatusCommand implements Callable<Integer> {
        
        private final McpApiService apiService;

        public StatusCommand(McpApiService apiService) {
            this.apiService = apiService;
        }

        @Option(names = {"-v", "--verbose"}, description = "Verbose output")
        private boolean verbose;

        @Override
        public Integer call() {
            try {
                System.out.println(colorize("🔍 Checking MCP system status...", Ansi.Color.YELLOW));
                
                var status = apiService.getSystemStatus().block();
                
                if (status != null) {
                    System.out.println(colorize("✅ System Status: OPERATIONAL", Ansi.Color.GREEN));
                    System.out.println(colorize("📊 Servers: %d total, %d healthy, %d unhealthy"
                        .formatted(status.totalServers(), status.healthyServers(), status.unhealthyServers()), 
                        Ansi.Color.CYAN));
                    
                    if (verbose) {
                        System.out.println(colorize("\n🏴‍☠️ Captain Guthilda's Fleet Status:", Ansi.Color.MAGENTA));
                        status.servers().forEach(server -> {
                            var statusColor = server.isHealthy() ? Ansi.Color.GREEN : Ansi.Color.RED;
                            var statusIcon = server.isHealthy() ? "✅" : "❌";
                            System.out.println(colorize("  %s %s (%s) - %s"
                                .formatted(statusIcon, server.config().name(), 
                                          server.config().type(), server.status()), statusColor));
                        });
                    }
                    
                    return 0;
                } else {
                    System.out.println(colorize("❌ Failed to get system status", Ansi.Color.RED));
                    return 1;
                }
                
            } catch (Exception e) {
                System.out.println(colorize("💥 Error: " + e.getMessage(), Ansi.Color.RED));
                return 1;
            }
        }
    }

    /**
     * Start command for servers
     */
    @Component
    @Command(name = "start", description = "🚀 Start MCP servers")
    public static class StartCommand implements Callable<Integer> {
        
        private final McpApiService apiService;

        public StartCommand(McpApiService apiService) {
            this.apiService = apiService;
        }

        @Parameters(index = "0", description = "Server type to start")
        private ServerType serverType;

        @Option(names = {"-p", "--port"}, description = "Port number", defaultValue = "8080")
        private int port;

        @Override
        public Integer call() {
            try {
                System.out.println(colorize("🚀 Starting %s server on port %d..."
                    .formatted(serverType, port), Ansi.Color.YELLOW));
                
                var result = apiService.startServer(serverType, port).block();
                
                if (result != null && result.success()) {
                    System.out.println(colorize("✅ " + result.message(), Ansi.Color.GREEN));
                    return 0;
                } else {
                    System.out.println(colorize("❌ Failed to start server", Ansi.Color.RED));
                    return 1;
                }
                
            } catch (Exception e) {
                System.out.println(colorize("💥 Error: " + e.getMessage(), Ansi.Color.RED));
                return 1;
            }
        }
    }

    /**
     * Stop command for servers
     */
    @Component
    @Command(name = "stop", description = "🛑 Stop MCP servers")
    public static class StopCommand implements Callable<Integer> {
        
        private final McpApiService apiService;

        public StopCommand(McpApiService apiService) {
            this.apiService = apiService;
        }

        @Parameters(index = "0", description = "Server ID to stop")
        private String serverId;

        @Override
        public Integer call() {
            try {
                System.out.println(colorize("🛑 Stopping server %s...".formatted(serverId), Ansi.Color.YELLOW));
                
                var result = apiService.stopServer(serverId).block();
                
                if (result != null && result.success()) {
                    System.out.println(colorize("✅ " + result.message(), Ansi.Color.GREEN));
                    return 0;
                } else {
                    System.out.println(colorize("❌ Failed to stop server", Ansi.Color.RED));
                    return 1;
                }
                
            } catch (Exception e) {
                System.out.println(colorize("💥 Error: " + e.getMessage(), Ansi.Color.RED));
                return 1;
            }
        }
    }

    /**
     * Captain Guthilda's special commands
     */
    @Component
    @Command(name = "guthilda", description = "🏴‍☠️ Captain Guthilda's special commands")
    public static class GuthildaCommand implements Callable<Integer> {
        
        private final McpApiService apiService;

        public GuthildaCommand(McpApiService apiService) {
            this.apiService = apiService;
        }

        @Option(names = {"--ahoy"}, description = "Captain's greeting")
        private boolean ahoy;

        @Option(names = {"--fleet"}, description = "Show fleet status")
        private boolean fleet;

        @Override
        public Integer call() {
            if (ahoy) {
                System.out.println(colorize("""
                    🏴‍☠️ AHOY MATEY! 
                    
                    Captain Guthilda "Triple-:D'Cup" Piroteena reporting for duty!
                    Fractal Id: [Feather.Weeds.Subordinate]
                    
                    The Java 21 fleet is ready for Meta-Automation!
                    Virtual threads be sailing, pattern matching be sharp!
                    
                    ⚓ Ready to orchestrate the digital seas! ⚓
                    """, Ansi.Color.MAGENTA));
                return 0;
            }
            
            if (fleet) {
                try {
                    var guthildaStatus = apiService.getGuthildaStatus().block();
                    if (guthildaStatus != null) {
                        System.out.println(colorize("🏴‍☠️ Captain Guthilda's Fleet Report:", Ansi.Color.MAGENTA));
                        guthildaStatus.forEach((key, value) -> 
                            System.out.println(colorize("  %s: %s".formatted(key, value), Ansi.Color.CYAN)));
                        return 0;
                    }
                } catch (Exception e) {
                    System.out.println(colorize("💥 Fleet status unavailable: " + e.getMessage(), Ansi.Color.RED));
                    return 1;
                }
            }
            
            // Default Guthilda command
            System.out.println(colorize("""
                🏴‍☠️ Captain Guthilda's Command Options:
                  --ahoy    : Captain's greeting
                  --fleet   : Show fleet status
                """, Ansi.Color.CYAN));
            return 0;
        }
    }

    /**
     * Utility method to colorize console output
     */
    private static String colorize(String text, Ansi.Color color) {
        return Ansi.ansi().fg(color).a(text).reset().toString();
    }
}
