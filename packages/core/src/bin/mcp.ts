#!/usr/bin/env node

/**
 * Main entry point for the MCP Orchestration System
 */

/* eslint-disable no-console */
// Console output is appropriate for CLI applications

import { OrchestrationHub } from '@mcp/core';
import { ServerManager } from '@mcp/core';
import { MonitorServer } from '@mcp/core';
import { defaultConfig } from '@mcp/shared';

// Print banner
console.log(`
╔════════════════════════════════════════════════════╗
║             MCP ORCHESTRATION SYSTEM               ║
║                                                    ║
║  Centralized management for Model Context Protocol  ║
║            servers and microservices               ║
╚════════════════════════════════════════════════════╝
`);

async function main() {
  try {
    console.log('Starting MCP Orchestration System...');
    
    // Create server manager
    const serverManager = new ServerManager();
    
    // Register server types
    serverManager.registerServerType('sequential-thinking', SequentialThinkingServer);
    serverManager.registerServerType('duckduckgo', DuckDuckGoServer);
    // Register other server types here
    
    // Create orchestration hub
    const orchestrationHub = new OrchestrationHub(defaultConfig.servers, {
      monitorPort: defaultConfig.monitor.port,
      checkInterval: defaultConfig.healthCheck.interval
    });
    
    // Initialize orchestration hub
    await orchestrationHub.initialize();
    
    // Create monitor server
    const monitorServer = new MonitorServer(orchestrationHub, {
      port: defaultConfig.monitor.port
    });
    
    // Start monitor server
    await monitorServer.start();
    
    // Start all servers
    await orchestrationHub.startAllServers();
    
    console.log(`MCP Orchestration System is running`);
    console.log(`Monitor dashboard available at: http://localhost:${defaultConfig.monitor.port}`);
    
    // Handle process shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down MCP Orchestration System...');
      
      await orchestrationHub.shutdown();
      await monitorServer.stop();
      
      console.log('MCP Orchestration System shutdown complete');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start MCP Orchestration System:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
