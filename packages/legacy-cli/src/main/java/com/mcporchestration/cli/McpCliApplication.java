package com.mcporchestration.cli;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import picocli.CommandLine;
import picocli.spring.PicocliSpringFactory;
import org.springframework.context.ApplicationContext;

/**
 * MCP CLI Application with Java 21 enhancements
 * Captain Guthilda's Command Line Interface for Meta-Automation
 */
@SpringBootApplication
public class McpCliApplication implements Runnable {

    public static void main(String[] args) {
        // Enable virtual threads for CLI operations
        System.setProperty("spring.threads.virtual.enabled", "true");
        
        var context = SpringApplication.run(McpCliApplication.class, args);
        
        // Create PicoCLI command line with Spring integration
        var factory = new PicocliSpringFactory(context);
        var commandLine = new CommandLine(McpCommand.class, factory);
        
        // Enhanced error handling with Java 21 features
        var exitCode = commandLine.execute(args);
        System.exit(exitCode);
    }

    @Override
    public void run() {
        // Default command behavior
        System.out.println("""
            🏴‍☠️ Captain Guthilda's MCP CLI - Java 21 Edition
            
            Use 'mcp --help' for available commands
            """);
    }
}
