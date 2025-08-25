#!/usr/bin/env node

/**
 * Main entry point for the MCP Orchestration System
 */

import { OrchestrationHub } from '@mcp/core';
import { ServerManager } from '@mcp/core';
import { MonitorServer } from '@mcp/core';
import { defaultConfig } from '@mcp/shared';

// Import server implementations
import SequentialThinkingServer from '@mcp/server-sequential-thinking';
import DuckDuckGoServer from '@mcp/server-duckduckgo';
import M365GraphServer from '@mcp/server-m365-graph';

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
    serverManager.registerServerType('m365-graph', M365GraphServer);
    // Register other server types here

    // Create orchestration hub
    const orchestrationHub = new OrchestrationHub(defaultConfig.servers, {
      monitorPort: defaultConfig.monitor.port,
      checkInterval: defaultConfig.healthCheck.interval,
    });

    // Initialize orchestration hub
    await orchestrationHub.initialize();

    // Create monitor server
    const monitorServer = new MonitorServer(orchestrationHub, {
      port: defaultConfig.monitor.port,
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
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
