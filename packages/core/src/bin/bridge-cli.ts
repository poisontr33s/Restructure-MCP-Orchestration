#!/usr/bin/env node

/**
 * Repository Bridge CLI
 * Command-line interface for managing repository bridges
 */

import { RepositoryBridge } from '@mcp/core';
import { createLogger } from '@mcp/core/src/logger';

const logger = createLogger('bridge-cli');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function showHelp(): void {
  console.log(`
${colorize('Repository Bridge CLI', 'bright')}

${colorize('USAGE:', 'yellow')}
  bridge-cli <command> [options]

${colorize('COMMANDS:', 'yellow')}
  init <owner/repo>           Initialize a new bridge with main repository
  add <owner/repo:type>       Add a repository to the bridge
  remove <owner/repo>         Remove a repository from the bridge
  list                        List all repositories in the bridge
  config                      Show bridge configuration
  validate                    Validate bridge configuration

${colorize('OPTIONS:', 'yellow')}
  --config, -c <path>         Path to bridge configuration file
  --org <organization>        Default organization (for init)
  --help, -h                  Show this help message

${colorize('EXAMPLES:', 'yellow')}
  ${colorize('# Initialize a bridge', 'cyan')}
  bridge-cli init myorg/main-repo --org myorg

  ${colorize('# Add repositories to the bridge', 'cyan')}
  bridge-cli add myorg/service1:service
  bridge-cli add myorg/library1:dependency

  ${colorize('# List all repositories', 'cyan')}
  bridge-cli list

  ${colorize('# Show configuration', 'cyan')}
  bridge-cli config

${colorize('REPOSITORY TYPES:', 'yellow')}
  service                     Microservice or standalone application
  dependency                  Shared library or utility
  module                      Plugin or extension module
  infrastructure              Infrastructure as code
  documentation               Documentation repository
  template                    Template or boilerplate repository
`);
}

async function initBridge(mainRepo: string, options: { org?: string; config?: string }): Promise<void> {
  try {
    const bridge = new RepositoryBridge(options.config);
    
    // Parse owner/name from mainRepo
    const [owner, name] = mainRepo.split('/');
    if (!owner || !name) {
      console.error(colorize('Error: Invalid repository format. Use: owner/name', 'red'));
      process.exit(1);
    }

    await bridge.initialize();
    bridge.setMainRepository(owner, name, options.org);
    await bridge.saveConfig();

    console.log(colorize('✓ Bridge initialized successfully', 'green'));
    console.log(`  Main repository: ${colorize(`${owner}/${name}`, 'bright')}`);
    if (options.org) {
      console.log(`  Organization: ${colorize(options.org, 'bright')}`);
    }
  } catch (error) {
    console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
    process.exit(1);
  }
}

async function addRepository(repoSpec: string, options: { config?: string }): Promise<void> {
  try {
    const bridge = new RepositoryBridge(options.config);
    await bridge.initialize();

    // Parse owner/name:type from repoSpec
    const [repoPart, type] = repoSpec.split(':');
    const [owner, name] = repoPart.split('/');

    if (!owner || !name || !type) {
      console.error(colorize('Error: Invalid repository specification. Use: owner/name:type', 'red'));
      console.log('Example: myorg/service1:service');
      process.exit(1);
    }

    bridge.addConnectedRepository(owner, name, type);
    await bridge.saveConfig();

    console.log(colorize('✓ Repository added successfully', 'green'));
    console.log(`  Repository: ${colorize(`${owner}/${name}`, 'bright')}`);
    console.log(`  Type: ${colorize(type, 'bright')}`);
  } catch (error) {
    console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
    process.exit(1);
  }
}

async function removeRepository(repoSpec: string, options: { config?: string }): Promise<void> {
  try {
    const bridge = new RepositoryBridge(options.config);
    await bridge.initialize();

    // Parse owner/name from repoSpec
    const [owner, name] = repoSpec.split('/');
    if (!owner || !name) {
      console.error(colorize('Error: Invalid repository format. Use: owner/name', 'red'));
      process.exit(1);
    }

    const removed = bridge.removeConnectedRepository(owner, name);
    if (removed) {
      await bridge.saveConfig();
      console.log(colorize('✓ Repository removed successfully', 'green'));
      console.log(`  Repository: ${colorize(`${owner}/${name}`, 'bright')}`);
    } else {
      console.error(colorize(`Error: Repository not found: ${owner}/${name}`, 'red'));
      process.exit(1);
    }
  } catch (error) {
    console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
    process.exit(1);
  }
}

async function listRepositories(options: { config?: string }): Promise<void> {
  try {
    const bridge = new RepositoryBridge(options.config);
    await bridge.initialize();

    const repositories = bridge.getAllRepositories();
    
    console.log(colorize('Repository Bridge Overview', 'bright'));
    console.log('');

    if (repositories.length === 0) {
      console.log(colorize('No repositories configured', 'yellow'));
      return;
    }

    const mainRepo = repositories.find(r => r.type === 'main');
    if (mainRepo) {
      console.log(colorize('Main Repository:', 'yellow'));
      console.log(`  ${colorize(`${mainRepo.owner}/${mainRepo.name}`, 'bright')} (${mainRepo.type})`);
      console.log('');
    }

    const connectedRepos = repositories.filter(r => r.type !== 'main');
    if (connectedRepos.length > 0) {
      console.log(colorize(`Connected Repositories (${connectedRepos.length}):`, 'yellow'));
      connectedRepos.forEach(repo => {
        const status = repo.enabled ? colorize('enabled', 'green') : colorize('disabled', 'red');
        console.log(`  ${colorize(`${repo.owner}/${repo.name}`, 'bright')} (${repo.type}) [${status}]`);
      });
    } else {
      console.log(colorize('No connected repositories', 'yellow'));
    }
  } catch (error) {
    console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
    process.exit(1);
  }
}

async function showConfig(options: { config?: string }): Promise<void> {
  try {
    const bridge = new RepositoryBridge(options.config);
    await bridge.initialize();

    const config = bridge.getConfig();
    
    console.log(colorize('Bridge Configuration', 'bright'));
    console.log('');
    
    // Main repository
    console.log(colorize('Main Repository:', 'yellow'));
    console.log(`  Owner: ${colorize(config.mainRepository.owner || 'not set', 'bright')}`);
    console.log(`  Name: ${colorize(config.mainRepository.name || 'not set', 'bright')}`);
    console.log(`  Organization: ${colorize(config.mainRepository.organization || 'not set', 'bright')}`);
    console.log('');

    // Connected repositories
    console.log(colorize(`Connected Repositories (${config.connectedRepositories.length}):`, 'yellow'));
    if (config.connectedRepositories.length > 0) {
      config.connectedRepositories.forEach((repo, index) => {
        console.log(`  ${index + 1}. ${colorize(`${repo.owner}/${repo.name}`, 'bright')}`);
        console.log(`     Type: ${repo.type}`);
        console.log(`     Enabled: ${repo.enabled !== false ? colorize('yes', 'green') : colorize('no', 'red')}`);
        if (repo.branchPatterns && repo.branchPatterns.length > 0) {
          console.log(`     Branch Patterns: ${repo.branchPatterns.join(', ')}`);
        }
      });
    } else {
      console.log('  (none)');
    }
    console.log('');

    // Bridge settings
    console.log(colorize('Bridge Settings:', 'yellow'));
    console.log(`  Default Branch Patterns: ${config.bridgeConfig.defaultBranchPatterns.join(', ')}`);
    console.log(`  Excluded Branches: ${config.bridgeConfig.excludeBranches.join(', ')}`);
    console.log(`  Default Min Age: ${config.bridgeConfig.defaultMinAgeDays} days`);
    console.log(`  Default Organization: ${config.bridgeConfig.defaultOrganization || 'not set'}`);
  } catch (error) {
    console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
    process.exit(1);
  }
}

async function validateConfig(options: { config?: string }): Promise<void> {
  try {
    const bridge = new RepositoryBridge(options.config);
    await bridge.initialize();

    const errors = bridge.validateConfig();
    
    console.log(colorize('Configuration Validation', 'bright'));
    console.log('');

    if (errors.length === 0) {
      console.log(colorize('✓ Configuration is valid', 'green'));
    } else {
      console.log(colorize(`❌ Found ${errors.length} validation error(s):`, 'red'));
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const command = args[0];
  const options: { config?: string; org?: string } = {};
  
  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--config' || arg === '-c') {
      options.config = args[++i];
    } else if (arg === '--org') {
      options.org = args[++i];
    }
  }

  try {
    switch (command) {
      case 'init':
        if (args.length < 2) {
          console.error(colorize('Error: Repository required for init command', 'red'));
          console.log('Usage: bridge-cli init <owner/repo>');
          process.exit(1);
        }
        await initBridge(args[1], options);
        break;

      case 'add':
        if (args.length < 2) {
          console.error(colorize('Error: Repository specification required for add command', 'red'));
          console.log('Usage: bridge-cli add <owner/repo:type>');
          process.exit(1);
        }
        await addRepository(args[1], options);
        break;

      case 'remove':
        if (args.length < 2) {
          console.error(colorize('Error: Repository required for remove command', 'red'));
          console.log('Usage: bridge-cli remove <owner/repo>');
          process.exit(1);
        }
        await removeRepository(args[1], options);
        break;

      case 'list':
        await listRepositories(options);
        break;

      case 'config':
        await showConfig(options);
        break;

      case 'validate':
        await validateConfig(options);
        break;

      default:
        console.error(colorize(`Error: Unknown command: ${command}`, 'red'));
        console.log('Run "bridge-cli --help" for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error(colorize(`Error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error(colorize(`Fatal error: ${error instanceof Error ? error.message : String(error)}`, 'red'));
  process.exit(1);
});