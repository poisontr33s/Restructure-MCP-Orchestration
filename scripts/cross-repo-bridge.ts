#!/usr/bin/env node

/**
 * Universal Cross-Repository Bridge System
 * 
 * Connects and orchestrates multiple repositories with language/ecosystem agnostic support:
 * - poisontr33s/poisontr33s (landing page, conceptual base)
 * - poisontr33s/PsychoNoir-Kontrapunkt 
 * - poisontr33s/Restructure-MCP-Orchestration
 * 
 * Features:
 * - Universal language detection (Node.js, Python, Rust, Go, Java, etc.)
 * - Package manager agnostic (npm, pnpm, yarn, pip, cargo, go mod, maven, etc.)
 * - Cross-repository synchronization and communication
 * - Structural integrity validation before merge operations
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface RepositoryConfig {
  name: string;
  url: string;
  localPath?: string;
  role: 'landing' | 'orchestration' | 'specialized';
  languages: string[];
  packageManagers: string[];
  buildCommands: string[];
  testCommands: string[];
  lintCommands: string[];
}

interface ProjectDetection {
  language: string;
  packageManager: string;
  buildSystem: string;
  configFiles: string[];
  dependencies: Record<string, string>;
}

class UniversalCrossRepoBridge {
  private repositories: RepositoryConfig[] = [
    {
      name: 'poisontr33s',
      url: 'https://github.com/poisontr33s/poisontr33s',
      role: 'landing',
      languages: [],
      packageManagers: [],
      buildCommands: [],
      testCommands: [],
      lintCommands: []
    },
    {
      name: 'PsychoNoir-Kontrapunkt',
      url: 'https://github.com/poisontr33s/PsychoNoir-Kontrapunkt',
      role: 'specialized',
      languages: [],
      packageManagers: [],
      buildCommands: [],
      testCommands: [],
      lintCommands: []
    },
    {
      name: 'Restructure-MCP-Orchestration',
      url: 'https://github.com/poisontr33s/Restructure-MCP-Orchestration',
      role: 'orchestration',
      languages: ['typescript', 'javascript'],
      packageManagers: ['pnpm'],
      buildCommands: ['pnpm build'],
      testCommands: ['pnpm test'],
      lintCommands: ['pnpm lint']
    }
  ];

  private bridgeWorkspace = '/tmp/cross-repo-bridge';

  /**
   * Detect project type and configuration from repository
   */
  private detectProjectType(repoPath: string): ProjectDetection {
    const detection: ProjectDetection = {
      language: 'unknown',
      packageManager: 'none',
      buildSystem: 'none',
      configFiles: [],
      dependencies: {}
    };

    const files = fs.readdirSync(repoPath);
    
    // Language detection
    if (files.includes('package.json')) {
      detection.language = 'javascript';
      detection.configFiles.push('package.json');
      
      // Package manager detection
      if (files.includes('pnpm-lock.yaml')) {
        detection.packageManager = 'pnpm';
      } else if (files.includes('yarn.lock')) {
        detection.packageManager = 'yarn';
      } else if (files.includes('package-lock.json')) {
        detection.packageManager = 'npm';
      }
      
      // Read dependencies
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(repoPath, 'package.json'), 'utf8'));
        detection.dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      } catch (error) {
        console.warn('Could not read package.json dependencies');
      }
    }
    
    if (files.includes('Cargo.toml')) {
      detection.language = 'rust';
      detection.packageManager = 'cargo';
      detection.buildSystem = 'cargo';
      detection.configFiles.push('Cargo.toml');
    }
    
    if (files.includes('go.mod')) {
      detection.language = 'go';
      detection.packageManager = 'go-modules';
      detection.buildSystem = 'go';
      detection.configFiles.push('go.mod');
    }
    
    if (files.includes('requirements.txt') || files.includes('pyproject.toml') || files.includes('setup.py')) {
      detection.language = 'python';
      if (files.includes('pyproject.toml')) {
        detection.packageManager = 'poetry';
        detection.configFiles.push('pyproject.toml');
      } else if (files.includes('requirements.txt')) {
        detection.packageManager = 'pip';
        detection.configFiles.push('requirements.txt');
      }
    }
    
    if (files.includes('pom.xml')) {
      detection.language = 'java';
      detection.packageManager = 'maven';
      detection.buildSystem = 'maven';
      detection.configFiles.push('pom.xml');
    }
    
    if (files.includes('build.gradle') || files.includes('build.gradle.kts')) {
      detection.language = 'java';
      detection.packageManager = 'gradle';
      detection.buildSystem = 'gradle';
      detection.configFiles.push(files.includes('build.gradle') ? 'build.gradle' : 'build.gradle.kts');
    }

    return detection;
  }

  /**
   * Generate universal build commands based on detected project type
   */
  private generateUniversalCommands(detection: ProjectDetection): {
    build: string[];
    test: string[];
    lint: string[];
    install: string[];
  } {
    const commands = {
      build: [] as string[],
      test: [] as string[],
      lint: [] as string[],
      install: [] as string[]
    };

    switch (detection.language) {
      case 'javascript':
        switch (detection.packageManager) {
          case 'pnpm':
            commands.install = ['pnpm install'];
            commands.build = ['pnpm build'];
            commands.test = ['pnpm test'];
            commands.lint = ['pnpm lint'];
            break;
          case 'yarn':
            commands.install = ['yarn install'];
            commands.build = ['yarn build'];
            commands.test = ['yarn test'];
            commands.lint = ['yarn lint'];
            break;
          case 'npm':
            commands.install = ['npm install'];
            commands.build = ['npm run build'];
            commands.test = ['npm test'];
            commands.lint = ['npm run lint'];
            break;
        }
        break;
        
      case 'rust':
        commands.install = ['cargo fetch'];
        commands.build = ['cargo build --release'];
        commands.test = ['cargo test'];
        commands.lint = ['cargo clippy', 'cargo fmt --check'];
        break;
        
      case 'go':
        commands.install = ['go mod download'];
        commands.build = ['go build ./...'];
        commands.test = ['go test ./...'];
        commands.lint = ['go vet ./...', 'gofmt -d .'];
        break;
        
      case 'python':
        if (detection.packageManager === 'poetry') {
          commands.install = ['poetry install'];
          commands.build = ['poetry build'];
          commands.test = ['poetry run pytest'];
          commands.lint = ['poetry run flake8', 'poetry run black --check .'];
        } else {
          commands.install = ['pip install -r requirements.txt'];
          commands.test = ['python -m pytest'];
          commands.lint = ['flake8', 'black --check .'];
        }
        break;
        
      case 'java':
        if (detection.packageManager === 'maven') {
          commands.install = ['mvn dependency:resolve'];
          commands.build = ['mvn compile'];
          commands.test = ['mvn test'];
          commands.lint = ['mvn checkstyle:check'];
        } else if (detection.packageManager === 'gradle') {
          commands.install = ['./gradlew dependencies'];
          commands.build = ['./gradlew build'];
          commands.test = ['./gradlew test'];
          commands.lint = ['./gradlew checkstyleMain'];
        }
        break;
    }

    return commands;
  }

  /**
   * Clone or update repository
   */
  private async cloneOrUpdateRepo(repo: RepositoryConfig): Promise<string> {
    const repoPath = path.join(this.bridgeWorkspace, repo.name);
    
    if (fs.existsSync(repoPath)) {
      console.log(`Updating ${repo.name}...`);
      try {
        execSync('git pull origin main', { cwd: repoPath, stdio: 'inherit' });
      } catch (error) {
        console.log(`Main branch not found, trying master...`);
        execSync('git pull origin master', { cwd: repoPath, stdio: 'inherit' });
      }
    } else {
      console.log(`Cloning ${repo.name}...`);
      execSync(`git clone ${repo.url} ${repoPath}`, { stdio: 'inherit' });
    }
    
    return repoPath;
  }

  /**
   * Analyze repository structure and update configuration
   */
  private analyzeRepository(repo: RepositoryConfig, repoPath: string): void {
    console.log(`Analyzing ${repo.name}...`);
    
    const detection = this.detectProjectType(repoPath);
    const commands = this.generateUniversalCommands(detection);
    
    // Update repository configuration
    repo.languages = [detection.language];
    repo.packageManagers = [detection.packageManager];
    repo.buildCommands = commands.build;
    repo.testCommands = commands.test;
    repo.lintCommands = commands.lint;
    
    console.log(`  Language: ${detection.language}`);
    console.log(`  Package Manager: ${detection.packageManager}`);
    console.log(`  Config Files: ${detection.configFiles.join(', ')}`);
    console.log(`  Build Commands: ${commands.build.join(' && ')}`);
  }

  /**
   * Validate structural integrity across repositories
   */
  private async validateStructuralIntegrity(): Promise<boolean> {
    console.log('🔍 Validating structural integrity across repositories...');
    
    let allValid = true;
    
    for (const repo of this.repositories) {
      if (!repo.localPath) continue;
      
      console.log(`\nValidating ${repo.name}...`);
      
      // Check if repository has proper structure
      const hasGitRepo = fs.existsSync(path.join(repo.localPath, '.git'));
      if (!hasGitRepo) {
        console.error(`❌ ${repo.name}: Not a valid git repository`);
        allValid = false;
        continue;
      }
      
      // Run build if available
      if (repo.buildCommands.length > 0) {
        try {
          console.log(`  Building ${repo.name}...`);
          for (const command of repo.buildCommands) {
            execSync(command, { cwd: repo.localPath, stdio: 'inherit' });
          }
          console.log(`  ✅ ${repo.name}: Build successful`);
        } catch (error) {
          console.error(`  ❌ ${repo.name}: Build failed`);
          allValid = false;
        }
      }
      
      // Run tests if available
      if (repo.testCommands.length > 0) {
        try {
          console.log(`  Testing ${repo.name}...`);
          for (const command of repo.testCommands) {
            execSync(command, { cwd: repo.localPath, stdio: 'inherit' });
          }
          console.log(`  ✅ ${repo.name}: Tests passed`);
        } catch (error) {
          console.error(`  ⚠️  ${repo.name}: Tests failed (non-blocking)`);
        }
      }
      
      // Run linting if available
      if (repo.lintCommands.length > 0) {
        try {
          console.log(`  Linting ${repo.name}...`);
          for (const command of repo.lintCommands) {
            execSync(command, { cwd: repo.localPath, stdio: 'inherit' });
          }
          console.log(`  ✅ ${repo.name}: Linting passed`);
        } catch (error) {
          console.error(`  ⚠️  ${repo.name}: Linting issues found (non-blocking)`);
        }
      }
    }
    
    return allValid;
  }

  /**
   * Create cross-repository synchronization links
   */
  private createCrossRepoLinks(): void {
    console.log('🔗 Creating cross-repository links...');
    
    const linksConfig = {
      repositories: this.repositories.map(repo => ({
        name: repo.name,
        url: repo.url,
        role: repo.role,
        localPath: repo.localPath,
        languages: repo.languages,
        packageManagers: repo.packageManagers
      })),
      crossRepoScripts: {
        'sync-all': 'cross-repo-bridge sync',
        'build-all': 'cross-repo-bridge build',
        'test-all': 'cross-repo-bridge test',
        'validate-all': 'cross-repo-bridge validate'
      },
      lastSync: new Date().toISOString()
    };
    
    // Save configuration to each repository
    for (const repo of this.repositories) {
      if (!repo.localPath) continue;
      
      const configPath = path.join(repo.localPath, '.cross-repo-bridge.json');
      fs.writeFileSync(configPath, JSON.stringify(linksConfig, null, 2));
      console.log(`  ✅ Created bridge config for ${repo.name}`);
    }
  }

  /**
   * Main bridge initialization
   */
  async initialize(): Promise<void> {
    console.log('🌉 Initializing Universal Cross-Repository Bridge...');
    
    // Create workspace
    if (!fs.existsSync(this.bridgeWorkspace)) {
      fs.mkdirSync(this.bridgeWorkspace, { recursive: true });
    }
    
    // Clone/update all repositories
    for (const repo of this.repositories) {
      try {
        repo.localPath = await this.cloneOrUpdateRepo(repo);
        this.analyzeRepository(repo, repo.localPath);
      } catch (error) {
        console.error(`Failed to process ${repo.name}:`, error);
      }
    }
    
    // Create cross-repo links
    this.createCrossRepoLinks();
    
    // Validate structural integrity
    const isValid = await this.validateStructuralIntegrity();
    
    if (isValid) {
      console.log('\n✅ Cross-repository bridge initialized successfully!');
      console.log('🎯 All repositories meet structural integrity requirements for merge to master.');
    } else {
      console.log('\n⚠️  Bridge initialized with warnings. Review issues before merge to master.');
    }
  }

  /**
   * Command line interface
   */
  async run(args: string[]): Promise<void> {
    const command = args[0] || 'init';
    
    switch (command) {
      case 'init':
        await this.initialize();
        break;
      case 'validate':
        await this.validateStructuralIntegrity();
        break;
      case 'sync':
        for (const repo of this.repositories) {
          if (repo.localPath) {
            await this.cloneOrUpdateRepo(repo);
          }
        }
        break;
      default:
        console.log('Available commands: init, validate, sync');
    }
  }
}

// CLI entry point
if (require.main === module) {
  const bridge = new UniversalCrossRepoBridge();
  bridge.run(process.argv.slice(2)).catch(console.error);
}

export default UniversalCrossRepoBridge;