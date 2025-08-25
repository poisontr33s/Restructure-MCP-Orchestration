#!/usr/bin/env node

/**
 * Captain Guthilda CLI
 * Command-line interface for the meta-automation orchestrator
 */

import { CaptainGuthilda } from './index.js';

const ASCII_BANNER = `
╔════════════════════════════════════════════════════════════════╗
║                    🏴‍☠️ CAPTAIN GUTHILDA 🏴‍☠️                     ║
║                                                                ║
║           Meta-Automation Orchestrator & System Boss           ║
║                                                                ║
║  "Triple-:D'Cup" Piroteena - Fractal Id: [Feather.Weeds.Sub]  ║
╚════════════════════════════════════════════════════════════════╝
`;

async function main() {
  console.log(ASCII_BANNER);

  const args = process.argv.slice(2);
  const command = args[0];
  const subcommand = args[1];

  const guthilda = new CaptainGuthilda();

  try {
    await guthilda.initialize();

    switch (command) {
      case 'status':
        await handleStatus(guthilda, subcommand);
        break;

      case 'auth':
        await handleAuth(guthilda, subcommand);
        break;

      case 'orchestrate':
        await handleOrchestrate(guthilda, subcommand);
        break;

      case 'discover':
        await handleDiscover(guthilda, subcommand);
        break;

      case 'cleanup':
        await handleCleanup(guthilda, subcommand);
        break;

      case 'report':
        await handleReport(guthilda, subcommand);
        break;

      case 'claude-code':
      case 'claude':
        await handleClaudeCode(guthilda, subcommand);
        break;

      case 'help':
      case '--help':
      case '-h':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('💀 Command failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function handleStatus(guthilda: CaptainGuthilda, subcommand?: string) {
  console.log('⚓ Checking system status...\n');

  const status = await guthilda.getStatus();

  console.log('🎛️  System Status:');
  console.log(`   MCP Orchestration: ${getStatusIcon(status.systems.mcp)} ${status.systems.mcp}`);
  console.log(
    `   AI Services: ${getStatusIcon(status.systems.aiServices)} ${status.systems.aiServices}`
  );
  console.log(
    `   Automation: ${getStatusIcon(status.systems.automation)} ${status.systems.automation}`
  );
  console.log(
    `   Monitoring: ${getStatusIcon(status.systems.monitoring)} ${status.systems.monitoring}`
  );

  console.log('\n📊 Metrics:');
  console.log(`   Uptime: ${formatUptime(status.metrics.uptime)}`);
  console.log(`   Active Services: ${status.metrics.activeServices}`);
  console.log(`   Completed Tasks: ${status.metrics.completedTasks}`);
  console.log(`   Error Count: ${status.metrics.errorCount}`);

  console.log(`\n🕐 Last Update: ${status.lastUpdate.toISOString()}`);
}

async function handleAuth(guthilda: CaptainGuthilda, subcommand?: string) {
  console.log('🔐 Managing AI service authentication...\n');

  if (subcommand === 'setup') {
    console.log('🛠️  Setting up authentication for all services...');
    const results = await guthilda.authenticateServices();

    console.log('\nAuthentication Results:');
    for (const result of results) {
      console.log(`   ${result.service}: ${getStatusIcon(result.status)} ${result.message}`);
      if (result.capabilities) {
        console.log(`      Capabilities: ${result.capabilities.join(', ')}`);
      }
    }
  } else {
    console.log('Available auth commands:');
    console.log('   guthilda auth setup    - Setup authentication for all AI services');
  }
}

async function handleOrchestrate(guthilda: CaptainGuthilda, subcommand?: string) {
  console.log('🎼 Running orchestration workflows...\n');

  const workflows = subcommand ? [subcommand] : ['all'];
  const tasks = await guthilda.orchestrate(workflows);

  console.log('Started orchestration tasks:');
  for (const task of tasks) {
    console.log(`   ${task.type}: ${getStatusIcon(task.status)} ${task.status}`);
  }

  // Wait for tasks to complete and show results
  console.log('\nWaiting for tasks to complete...');
  // Task monitoring logic would go here
}

async function handleDiscover(guthilda: CaptainGuthilda, subcommand?: string) {
  console.log('🔍 Starting content discovery...\n');

  const discoveries = await guthilda.discoverContent();

  console.log('Content Discovery Results:');
  for (const discovery of discoveries) {
    console.log(`   ${discovery.service}: Found ${discovery.content?.items?.length || 0} items`);
  }
}

async function handleCleanup(guthilda: CaptainGuthilda, subcommand?: string) {
  console.log('🧹 Running cleanup operations...\n');

  const tasks = await guthilda.orchestrate(['cleanup']);

  console.log('Cleanup tasks started:');
  for (const task of tasks) {
    console.log(`   ${task.type}: ${getStatusIcon(task.status)} ${task.status}`);
  }
}

async function handleReport(guthilda: CaptainGuthilda, subcommand?: string) {
  console.log('📋 Generating orchestration report...\n');

  const report = await guthilda.generateReport();

  console.log('📊 Orchestration Report');
  console.log(`Generated: ${report.timestamp.toISOString()}`);
  console.log(`\nSystem Status: ${JSON.stringify(report.status.systems, null, 2)}`);
  console.log(`Active Tasks: ${report.activeTasks.length}`);

  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    for (const rec of report.recommendations) {
      console.log(`   • ${rec}`);
    }
  }
}

async function handleClaudeCode(guthilda: CaptainGuthilda, subcommand?: string) {
  console.log('🤖 Checking Claude Code installation...\n');

  try {
    // Parse repositories if provided as subcommand
    const repositories = subcommand ? subcommand.split(',').map((r) => r.trim()) : undefined;

    const result = await guthilda.checkClaudeCode(repositories);

    // Display summary
    console.log('📊 Claude Code Installation Summary:');
    console.log(`   Total Repositories: ${result.summary.totalRepositories}`);
    console.log(
      `   Fully Configured: ${getStatusIcon('success')} ${result.summary.fullyConfigured}`
    );
    console.log(
      `   Partially Configured: ${getStatusIcon('partial')} ${result.summary.partiallyConfigured}`
    );
    console.log(`   Not Configured: ${getStatusIcon('error')} ${result.summary.notConfigured}`);
    console.log(`   Configuration Rate: ${result.summary.configurationRate}%`);

    // Display detailed results
    console.log('\n📋 Repository Details:');
    for (const repo of result.repositories) {
      const statusIcon = getStatusIcon(
        repo.status === 'fully-configured'
          ? 'success'
          : repo.status === 'partially-configured'
            ? 'partial'
            : 'error'
      );

      console.log(`   ${statusIcon} ${repo.repository} (${repo.status})`);
      console.log(`      Claude Workflow: ${repo.claudeWorkflow ? '✅' : '❌'}`);
      console.log(`      Claude Review Workflow: ${repo.claudeReviewWorkflow ? '✅' : '❌'}`);
      console.log(`      ANTHROPIC_API_KEY: ${repo.anthropicApiKey ? '✅' : '❌'}`);
      console.log(`      Total Branches: ${repo.totalBranches}`);
    }

    // Display recommendations
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      for (const rec of result.recommendations) {
        console.log(`   • ${rec}`);
      }
    }
  } catch (error) {
    console.error(
      '❌ Failed to check Claude Code installation:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'healthy':
    case 'connected':
    case 'active':
    case 'operational':
    case 'success':
    case 'completed':
      return '✅';
    case 'degraded':
    case 'partial':
    case 'limited':
    case 'running':
      return '⚠️';
    case 'down':
    case 'disconnected':
    case 'offline':
    case 'failed':
    case 'error':
      return '❌';
    case 'idle':
    case 'pending':
      return '⏸️';
    default:
      return '❓';
  }
}

function formatUptime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function showHelp() {
  console.log('⚓ Captain Guthilda Command Reference:\n');

  console.log('Core Commands:');
  console.log('   status              Show comprehensive system status');
  console.log('   auth setup          Setup AI service authentication');
  console.log('   orchestrate [type]  Run orchestration workflows');
  console.log('   discover            Discover content across AI services');
  console.log('   cleanup             Run cleanup operations');
  console.log('   report              Generate orchestration report');
  console.log('   claude-code [repos] Check Claude Code installation across repos');
  console.log('   help                Show this help message');

  console.log('\nOrchestration Types:');
  console.log('   all                 Run all workflows (default)');
  console.log('   cleanup             Cleanup workflows only');
  console.log('   integration         Integration workflows only');
  console.log('   deployment          Deployment workflows only');

  console.log('\nExamples:');
  console.log('   guthilda status                    # Check all systems');
  console.log('   guthilda auth setup                # Configure AI services');
  console.log('   guthilda orchestrate integration   # Run integration workflows');
  console.log('   guthilda discover                  # Scan for content');
  console.log('   guthilda cleanup                   # Clean up system');
  console.log('   guthilda claude-code               # Check Claude Code in all repos');
  console.log('   guthilda claude-code repo1,repo2   # Check specific repositories');

  console.log('\n🏴‍☠️ Captain Guthilda - Meta-Automation Orchestrator');
  console.log('For more information, see: .github/guthilda-monorepo-rituals.md');
}

// Run the CLI
main().catch((error) => {
  console.error('💀 Fatal error:', error);
  process.exit(1);
});
