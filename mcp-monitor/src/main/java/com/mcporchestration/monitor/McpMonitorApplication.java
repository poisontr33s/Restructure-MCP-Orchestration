package com.mcporchestration.monitor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.reactive.config.EnableWebFlux;

/**
 * 🏴‍☠️ CAPTAIN GUTHILDA'S MONITORING DASHBOARD
 * 
 * Spring Boot application for the MCP Orchestration monitoring dashboard.
 * Provides real-time visualization of server status, performance metrics,
 * and system health using Java 21 virtual threads and reactive streams.
 * 
 * Features:
 * - Real-time WebSocket monitoring
 * - Server performance dashboards  
 * - AI/ML integration metrics
 * - Captain Guthilda's command center
 * 
 * @author Captain Guthilda "Triple-:D'Cup" Piroteena
 * @version Java 21 Edition
 */
@SpringBootApplication
@EnableAsync
@EnableWebFlux
public class McpMonitorApplication {

    public static void main(String[] args) {
        System.out.println("🏴‍☠️ Captain Guthilda's Monitoring Dashboard - Java 21 Edition ⚓");
        System.out.println("⚡ Initializing with Virtual Threads and Reactive Streams...");
        
        SpringApplication.run(McpMonitorApplication.class, args);
    }
}
