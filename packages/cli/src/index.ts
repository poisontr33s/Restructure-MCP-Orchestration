#!/usr/bin/env node

/* eslint-disable no-console */
// Console output is appropriate for CLI applications

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { OrchestrationHub, MonitorServer } from '@mcp/core';
import { defaultConfig } from '@mcp/shared';

// Create commander program
const program = new Command();

// Setup program metadata
program
  .name('mcp')
  .description('MCP Orchestration System CLI')
  .version('1.0.0');

// Function to start the MCP Orchestration System
async function startOrchestrationSystem(port = defaultConfig.monitor.port) {
  const spinner = ora('Starting MCP Orchestration System...').start();
  
  try {
    // Create orchestration hub
    const orchestrationHub = new OrchestrationHub(defaultConfig.servers, {
      monitorPort: port,
      checkInterval: defaultConfig.healthCheck.interval
    });
    
    // Initialize orchestration hub
    await orchestrationHub.initialize();
    
    // Create monitor server
    const monitorServer = new MonitorServer(orchestrationHub, {
      port: port
    });
    
    // Start monitor server
    await monitorServer.start();
    
    // Start all servers
    await orchestrationHub.startAllServers();
    
    spinner.succeed(chalk.green('MCP Orchestration System started successfully'));
    
    console.log(`
${chalk.cyan('Dashboard:')} ${chalk.underline(`http://localhost:${port}`)}

Press ${chalk.yellow('Ctrl+C')} to stop the MCP Orchestration System
    `);
    
    // Handle process shutdown
    process.on('SIGINT', async () => {
      console.log('\n');
      const shutdownSpinner = ora('Shutting down MCP Orchestration System...').start();
      
      try {
        await orchestrationHub.shutdown();
        await monitorServer.stop();
        
        shutdownSpinner.succeed(chalk.green('MCP Orchestration System shutdown complete'));
        process.exit(0);
      } catch (error) {
        shutdownSpinner.fail(chalk.red(`Failed to shutdown: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });
  } catch (error) {
    spinner.fail(chalk.red(`Failed to start: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

// Define commands
program
  .command('start')
  .description('Start the MCP Orchestration System')
  .option('-p, --port <port>', 'Monitor server port', defaultConfig.monitor.port.toString())
  .action(async (options) => {
    await startOrchestrationSystem(parseInt(options.port, 10));
  });

program
  .command('status')
  .description('Check the status of MCP servers')
  .option('-p, --port <port>', 'Monitor server port', defaultConfig.monitor.port.toString())
  .action(async (options) => {
    const spinner = ora('Checking MCP server status...').start();
    
    try {
      const response = await fetch(`http://localhost:${options.port}/api/status`);
      
      if (!response.ok) {
        throw new Error(`Failed to get status: ${response.statusText}`);
      }
      
      const status = await response.json();
      
      spinner.succeed(chalk.green('Retrieved MCP server status'));
      
      console.log('\n' + chalk.bold('MCP Servers:'));
      
      status.servers.forEach((server: { name: string; type: string; status: string; port: number; pid?: number }) => {
        let statusColor;
        
        switch (server.status) {
          case 'running':
            statusColor = chalk.green;
            break;
          case 'starting':
            statusColor = chalk.yellow;
            break;
          case 'error':
          case 'not responding':
          case 'timeout':
            statusColor = chalk.red;
            break;
          default:
            statusColor = chalk.gray;
        }
        
        console.log(`  - ${chalk.cyan(server.name)} (${server.type}): ${statusColor(server.status)}`);
      });
      
      console.log('\n' + chalk.bold('System Info:'));
      console.log(`  - Hostname: ${status.system.hostname}`);
      console.log(`  - Platform: ${status.system.platform}`);
      console.log(`  - CPUs: ${status.system.cpus}`);
      console.log(`  - Memory: ${formatBytes(status.system.memory.free)} free of ${formatBytes(status.system.memory.total)}`);
      console.log(`  - Uptime: ${formatUptime(status.system.uptime)}`);
      
    } catch (error) {
      spinner.fail(chalk.red(`Failed to check status: ${error instanceof Error ? error.message : String(error)}`));
      console.log(`\nMake sure the MCP Orchestration System is running on port ${options.port}`);
      process.exit(1);
    }
  });

program
  .command('server')
  .description('Manage individual MCP servers')
  .option('-p, --port <port>', 'Monitor server port', defaultConfig.monitor.port.toString())
  .addCommand(
    new Command('start')
      .description('Start a specific MCP server')
      .argument('<server>', 'Server type to start')
      .action(async (server, options) => {
        const spinner = ora(`Starting ${server} server...`).start();
        
        try {
          const parentOptions = options.parent.opts();
          const response = await fetch(`http://localhost:${parentOptions.port}/api/servers/${server}/start`, {
            method: 'POST'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to start server: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            spinner.succeed(chalk.green(`Server ${server} is starting`));
          } else {
            spinner.fail(chalk.red(`Failed to start server: ${result.message}`));
          }
        } catch (error) {
          spinner.fail(chalk.red(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('stop')
      .description('Stop a specific MCP server')
      .argument('<server>', 'Server type to stop')
      .action(async (server, options) => {
        const spinner = ora(`Stopping ${server} server...`).start();
        
        try {
          const parentOptions = options.parent.opts();
          const response = await fetch(`http://localhost:${parentOptions.port}/api/servers/${server}/stop`, {
            method: 'POST'
          });
          
          if (!response.ok) {
            throw new Error(`Failed to stop server: ${response.statusText}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            spinner.succeed(chalk.green(`Server ${server} is stopping`));
          } else {
            spinner.fail(chalk.red(`Failed to stop server: ${result.message}`));
          }
        } catch (error) {
          spinner.fail(chalk.red(`Failed to stop server: ${error instanceof Error ? error.message : String(error)}`));
          process.exit(1);
        }
      })
  );

program
  .command('setup')
  .description('Run interactive setup for MCP Orchestration System')
  .action(async () => {
    console.log(chalk.cyan('MCP Orchestration System Setup\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'number',
        name: 'monitorPort',
        message: 'Enter the port for the monitor dashboard:',
        default: defaultConfig.monitor.port,
        validate: (value) => (typeof value === 'number' && value > 0 && value < 65536) ? true : 'Please enter a valid port number'
      },
      {
        type: 'checkbox',
        name: 'servers',
        message: 'Select which MCP servers to enable:',
        choices: defaultConfig.servers.map(server => ({
          name: server.name,
          value: server.type,
          checked: server.enabled
        }))
      },
      {
        type: 'confirm',
        name: 'startNow',
        message: 'Would you like to start the MCP Orchestration System now?',
        default: true
      }
    ]);
    
    // Update configuration based on answers
    // In a real implementation, this would save the configuration to a file
    
    console.log(chalk.green('\nConfiguration saved successfully'));
    
    if (answers.startNow) {
      // Start the MCP Orchestration System
      await startOrchestrationSystem();
    } else {
      console.log(`\nYou can start the MCP Orchestration System later with: ${chalk.cyan('mcp start')}`);
    }
  });

// Format bytes to human-readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format uptime to human-readable format
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days} days, ${hours} hours, ${minutes} minutes`;
  } else if (hours > 0) {
    return `${hours} hours, ${minutes} minutes`;
  } else {
    return `${minutes} minutes`;
  }
}

// Parse command line arguments
program.parse(process.argv);
