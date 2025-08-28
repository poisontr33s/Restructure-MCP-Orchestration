package com.mcporchestration.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot application for MCP Core Orchestration Engine
 * Utilizes Java 21 features for enhanced performance and modern development
 * 
 * Enhanced with Captain Guthilda's Meta-Automation Architecture
 */
@SpringBootApplication(scanBasePackages = {
    "com.mcporchestration.core",
    "com.mcporchestration.shared"
})
@EnableAsync
@EnableScheduling
public class McpCoreApplication {

    public static void main(String[] args) {
        // Java 21 Virtual Threads for enhanced concurrency
        System.setProperty("spring.threads.virtual.enabled", "true");
        
        // Enable preview features for cutting-edge Java 21 capabilities
        System.setProperty("java.util.concurrent.ForkJoinPool.common.parallelism", 
                          String.valueOf(Runtime.getRuntime().availableProcessors()));
        
        printBanner();
        SpringApplication.run(McpCoreApplication.class, args);
    }

    private static void printBanner() {
        System.out.println("""
            ╔════════════════════════════════════════════════════════════════╗
            ║                MCP ORCHESTRATION SYSTEM - JAVA 21             ║
            ║                                                                ║
            ║  🏴‍☠️ CAPTAIN GUTHILDA COMMANDING - Meta-Automation Engine      ║
            ║     Enhanced with Java 21 Virtual Threads & Pattern Matching  ║
            ║                                                                ║
            ║  ⚡ Features: AI Integration, GitHub Copilot Compatible        ║
            ║  🚀 Performance: Virtual Threads, Records, Sealed Classes      ║
            ║  🎯 Target: Enterprise ML/AI Workflow Orchestration           ║
            ╚════════════════════════════════════════════════════════════════╝
            """);
    }
}
