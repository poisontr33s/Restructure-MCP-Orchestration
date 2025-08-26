#!/usr/bin/env node
/**
 * 🚀 No-Prompt Auto-Save Service
 * 
 * This service eliminates all [Keep] prompts and automatically saves everything
 * for seamless 8-hour autonomous operation while you sleep.
 */

import { exec, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface AutoSaveConfig {
  vscodeAutoSave: boolean;
  geminiAutoAccept: boolean;
  claudeAutoAccept: boolean;
  sessionPersistence: boolean;
  noPromptMode: boolean;
}

export class NoPromptAutoSaveService {
  private config: AutoSaveConfig;
  private workspaceRoot: string;
  private saveInterval: NodeJS.Timeout | null = null;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.config = {
      vscodeAutoSave: true,
      geminiAutoAccept: true,
      claudeAutoAccept: true,
      sessionPersistence: true,
      noPromptMode: true
    };
  }

  async initializeNoPromptMode(): Promise<void> {
    // Configure VS Code for no prompts
    await this.configureVSCodeAutoSave();
    
    // Configure Gemini CLI for auto-accept
    await this.configureGeminiAutoAccept();
    
    // Configure Claude for auto-accept
    await this.configureClaudeAutoAccept();
    
    // Start continuous auto-save
    await this.startContinuousAutoSave();
    
    // Setup environment variables for no prompts
    await this.setupNoPromptEnvironment();
  }

  private async configureVSCodeAutoSave(): Promise<void> {
    const settingsPath = path.join(this.workspaceRoot, '.vscode', 'settings.json');
    
    try {
      let settings: any = {};
      try {
        const content = await fs.readFile(settingsPath, 'utf8');
        settings = JSON.parse(content);
      } catch {
        // File doesn't exist or is invalid, start with empty object
      }

      // Enhanced auto-save settings
      const autoSaveSettings = {
        "files.autoSave": "onFocusChange",
        "files.autoSaveDelay": 1000,
        "workbench.editor.autoSave": true,
        "workbench.editor.closeOnFileDelete": false,
        "workbench.editor.confirmDelete": false,
        "workbench.editor.confirmDragAndDrop": false,
        "explorer.confirmDelete": false,
        "explorer.confirmDragAndDrop": false,
        "terminal.integrated.confirmOnExit": "never",
        "terminal.integrated.confirmOnKill": "never",
        "diffEditor.ignoreTrimWhitespace": false,
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
          "source.fixAll": "explicit",
          "source.organizeImports": "explicit"
        },
        
        // Enhanced Copilot settings for autonomous operation
        "github.copilot.chat.enableFileModification": true,
        "github.copilot.chat.allowFileEdits": true,
        "github.copilot.chat.confirmFileCreation": false,
        "github.copilot.chat.confirmFileDelete": false,
        "github.copilot.chat.confirmFileModification": false,
        "github.copilot.editor.enableAutoCompletions": true,
        
        // Gemini CLI integration
        "geminiIde.autoStartOnOpen": true,
        "geminiIde.autoAccept": true,
        "geminiIde.enableCodeGeneration": true,
        "geminiIde.enableCodeCompletion": true,
        "geminiIde.confirmActions": false,
        
        // Claude configuration
        "claude.autoAcceptEdits": true,
        "claude.enableFileModification": true,
        "claude.confirmActions": false,
        
        // Session persistence
        "terminal.integrated.enablePersistentSessions": true,
        "terminal.integrated.persistentSessionScrollback": 10000,
        "window.restoreWindows": "all",
        "workbench.startupEditor": "none"
      };

      // Merge settings
      Object.assign(settings, autoSaveSettings);

      // Write back to file
      await fs.mkdir(path.dirname(settingsPath), { recursive: true });
      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
      
    } catch (error) {
      throw new Error(`Failed to configure VS Code auto-save: ${error}`);
    }
  }

  private async configureGeminiAutoAccept(): Promise<void> {
    // Set environment variables for Gemini CLI
    process.env.GEMINI_AUTO_ACCEPT = 'true';
    process.env.GEMINI_NO_PROMPTS = 'true';
    process.env.GEMINI_AUTONOMOUS_MODE = 'true';
    
    // Create Gemini config file if it doesn't exist
    const geminiConfigPath = path.join(this.workspaceRoot, '.gemini-config.json');
    const geminiConfig = {
      autoAccept: true,
      noPrompts: true,
      autonomousMode: true,
      autoSave: true,
      model: "gemini-2.0-flash-exp",
      maxTokens: 8192,
      temperature: 0.1
    };
    
    await fs.writeFile(geminiConfigPath, JSON.stringify(geminiConfig, null, 2), 'utf8');
  }

  private async configureClaudeAutoAccept(): Promise<void> {
    // Set environment variables for Claude
    process.env.CLAUDE_AUTO_ACCEPT = 'true';
    process.env.CLAUDE_NO_PROMPTS = 'true';
    process.env.CLAUDE_AUTONOMOUS_MODE = 'true';
  }

  private async startContinuousAutoSave(): Promise<void> {
    this.saveInterval = setInterval(async () => {
      await this.performComprehensiveAutoSave();
    }, 15000); // Save every 15 seconds
  }

  private async performComprehensiveAutoSave(): Promise<void> {
    const timestamp = new Date().toISOString();
    
    try {
      // 1. Force save all open files in VS Code
      await this.forceVSCodeSave();
      
      // 2. Save session state
      await this.saveSessionState(timestamp);
      
      // 3. Auto-commit if there are changes
      await this.autoCommitIfChanges(timestamp);
      
      // 4. Save MCP snapshot
      await this.saveMCPSnapshot();
      
      // 5. Keep processes alive
      await this.keepProcessesAlive();
      
    } catch (error) {
      // Auto-save errors should not interrupt autonomous operation
      await this.logError('auto-save', error);
    }
  }

  private async forceVSCodeSave(): Promise<void> {
    try {
      // Send save all command to VS Code
      await execAsync('code --command workbench.action.files.saveAll', { timeout: 3000 });
    } catch {
      // Command might not be available, continue silently
    }
  }

  private async saveSessionState(timestamp: string): Promise<void> {
    const sessionDir = path.join(this.workspaceRoot, '.vscode', '.session');
    await fs.mkdir(sessionDir, { recursive: true });
    
    const sessionState = {
      timestamp,
      config: this.config,
      workspaceRoot: this.workspaceRoot,
      environment: {
        GEMINI_AUTO_ACCEPT: process.env.GEMINI_AUTO_ACCEPT,
        CLAUDE_AUTO_ACCEPT: process.env.CLAUDE_AUTO_ACCEPT,
        NODE_ENV: process.env.NODE_ENV
      },
      processInfo: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
        uptime: process.uptime()
      }
    };
    
    const sessionFile = path.join(sessionDir, 'auto-save-state.json');
    await fs.writeFile(sessionFile, JSON.stringify(sessionState, null, 2), 'utf8');
  }

  private async autoCommitIfChanges(timestamp: string): Promise<void> {
    try {
      // Check if there are any changes
      const { stdout } = await execAsync('git status --porcelain', { 
        cwd: this.workspaceRoot,
        timeout: 5000
      });
      
      if (stdout.trim()) {
        await execAsync('git add .', { cwd: this.workspaceRoot });
        await execAsync(`git commit -m "🤖 Auto-save: No-prompt service - ${timestamp}"`, {
          cwd: this.workspaceRoot
        });
      }
    } catch {
      // Auto-commit failures are not critical during autonomous operation
    }
  }

  private async saveMCPSnapshot(): Promise<void> {
    try {
      await execAsync('pwsh -NoProfile -File .vscode/scripts/save-mcp-snapshot.ps1', {
        cwd: this.workspaceRoot,
        timeout: 8000
      });
    } catch {
      // MCP snapshot failures are not critical
    }
  }

  private async keepProcessesAlive(): Promise<void> {
    // Send keep-alive to local server
    try {
      await execAsync('curl -s http://localhost:5500/keep-alive || curl -s http://localhost:3000/keep-alive || echo "keep-alive"', { 
        timeout: 3000 
      });
    } catch {
      // Server might not be running, that's ok
    }
    
    // Update activity file
    const activityFile = path.join(this.workspaceRoot, '.vscode', '.session', 'activity.timestamp');
    await fs.writeFile(activityFile, Date.now().toString(), 'utf8').catch(() => {});
  }

  private async setupNoPromptEnvironment(): Promise<void> {
    // Set global environment variables for no-prompt operation
    const envVars = {
      AUTONOMOUS_MODE: 'true',
      NO_PROMPTS: 'true',
      AUTO_ACCEPT_ALL: 'true',
      GEMINI_AUTO_ACCEPT: 'true',
      CLAUDE_AUTO_ACCEPT: 'true',
      COPILOT_AUTO_ACCEPT: 'true',
      SESSION_PERSISTENCE: 'true'
    };
    
    Object.assign(process.env, envVars);
    
    // Write environment file for other processes
    const envFile = path.join(this.workspaceRoot, '.env.autonomous');
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    await fs.writeFile(envFile, envContent, 'utf8');
  }

  private async logError(context: string, error: any): Promise<void> {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        context,
        error: error.toString(),
        stack: error.stack
      };
      
      const errorFile = path.join(this.workspaceRoot, '.vscode', '.session', 'auto-save-errors.jsonl');
      await fs.appendFile(errorFile, JSON.stringify(errorLog) + '\n', 'utf8');
    } catch {
      // If we can't log errors, continue silently
    }
  }

  async shutdown(): Promise<void> {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    
    // Perform final save
    await this.performComprehensiveAutoSave();
  }
}

// CLI entry point
if (require.main === module) {
  const service = new NoPromptAutoSaveService();
  service.initializeNoPromptMode().catch(console.error);
}
