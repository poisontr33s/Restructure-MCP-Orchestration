#!/usr/bin/env node
/**
 * 🌑🔄 Continuous Session Guardian
 * 
 * This system prevents session timeouts, auto-saves everything, and maintains
 * continuous operation without requiring [Keep] prompts or manual intervention.
 * Perfect for 8-hour sleep cycles while maintaining active development sessions.
 */

import { exec, spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SessionState {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  autoSaveInterval: number;
  keepAliveInterval: number;
  geminiProcess?: ChildProcess;
  serverProcess?: ChildProcess;
  isActiveSession: boolean;
}

export class ContinuousSessionGuardian {
  private sessionState: SessionState;
  private autoSaveTimer?: NodeJS.Timeout;
  private keepAliveTimer?: NodeJS.Timeout;
  private activityCheckTimer?: NodeJS.Timeout;
  private workspaceRoot: string;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.sessionState = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      lastActivity: new Date(),
      autoSaveInterval: 30000, // 30 seconds
      keepAliveInterval: 15000, // 15 seconds
      isActiveSession: true
    };
  }

  /**
   * 🚀 Initialize continuous session management
   */
  async initializeContinuousSession(): Promise<void> {
    console.log('🌑🔄 Initializing Continuous Session Guardian...');
    console.log(`📋 Session ID: ${this.sessionState.sessionId}`);
    console.log(`⏰ Auto-save interval: ${this.sessionState.autoSaveInterval}ms`);
    console.log(`💓 Keep-alive interval: ${this.sessionState.keepAliveInterval}ms`);

    // Start all background processes
    await this.startAutoSaveLoop();
    await this.startKeepAliveLoop();
    await this.startActivityMonitoring();
    await this.startLiveServer();
    await this.startGeminiCLI();
    
    // Set up graceful shutdown
    this.setupGracefulShutdown();
    
    console.log('✅ Continuous Session Guardian active - no manual intervention required');
  }

  /**
   * 💾 Auto-save everything continuously
   */
  private async startAutoSaveLoop(): Promise<void> {
    this.autoSaveTimer = setInterval(async () => {
      try {
        await this.performAutoSave();
        this.updateLastActivity();
      } catch (error) {
        console.error('❌ Auto-save error:', error);
      }
    }, this.sessionState.autoSaveInterval);

    console.log('💾 Auto-save loop started');
  }

  /**
   * 💓 Keep session alive continuously
   */
  private async startKeepAliveLoop(): Promise<void> {
    this.keepAliveTimer = setInterval(async () => {
      try {
        await this.sendKeepAlive();
        this.updateLastActivity();
      } catch (error) {
        console.error('❌ Keep-alive error:', error);
      }
    }, this.sessionState.keepAliveInterval);

    console.log('💓 Keep-alive loop started');
  }

  /**
   * 👁️ Monitor system activity
   */
  private async startActivityMonitoring(): Promise<void> {
    this.activityCheckTimer = setInterval(async () => {
      try {
        await this.checkSystemActivity();
      } catch (error) {
        console.error('❌ Activity monitoring error:', error);
      }
    }, 60000); // Check every minute

    console.log('👁️ Activity monitoring started');
  }

  /**
   * 🌐 Start and maintain live server
   */
  private async startLiveServer(): Promise<void> {
    try {
      // Check if Live Server is already running
      const runningServers = await this.checkRunningServers();
      
      if (!runningServers.includes('5500')) {
        console.log('🌐 Starting Live Server...');
        
        // Start Live Server in background
        this.sessionState.serverProcess = spawn('pwsh', [
          '-NoProfile',
          '-Command',
          'Start-Process -FilePath "code" -ArgumentList "--command liveServer.start" -NoNewWindow -PassThru'
        ], {
          detached: false,
          stdio: 'pipe',
          cwd: this.workspaceRoot
        });

        this.sessionState.serverProcess.on('error', (error) => {
          console.error('🌐 Live Server error:', error);
          setTimeout(() => this.startLiveServer(), 5000); // Retry in 5 seconds
        });

        console.log('✅ Live Server started/maintained');
      } else {
        console.log('✅ Live Server already running');
      }
    } catch (error) {
      console.error('❌ Live Server startup error:', error);
    }
  }

  /**
   * 🤖 Start and maintain Gemini CLI
   */
  private async startGeminiCLI(): Promise<void> {
    try {
      // Kill any existing Gemini processes first
      await this.killExistingGeminiProcesses();
      
      console.log('🤖 Starting Gemini CLI in IDE mode...');
      
      this.sessionState.geminiProcess = spawn('pwsh', [
        '-NoProfile',
        '-Command',
        'gemini --ide-mode-feature --include-directories packages,scripts,docs,.vscode,server,clients,agent --auto-accept --no-prompts'
      ], {
        detached: false,
        stdio: 'pipe',
        cwd: this.workspaceRoot,
        env: {
          ...process.env,
          Path: `C:/Users/erdno/.local/bin;${process.env.Path}`,
          GEMINI_AUTO_ACCEPT: 'true',
          GEMINI_NO_PROMPTS: 'true'
        }
      });

      this.sessionState.geminiProcess.on('error', (error) => {
        console.error('🤖 Gemini CLI error:', error);
        setTimeout(() => this.startGeminiCLI(), 10000); // Retry in 10 seconds
      });

      this.sessionState.geminiProcess.on('exit', (code) => {
        console.log(`🤖 Gemini CLI exited with code ${code}, restarting...`);
        setTimeout(() => this.startGeminiCLI(), 5000);
      });

      console.log('✅ Gemini CLI started in autonomous mode');
    } catch (error) {
      console.error('❌ Gemini CLI startup error:', error);
    }
  }

  /**
   * 💾 Perform comprehensive auto-save
   */
  private async performAutoSave(): Promise<void> {
    const timestamp = new Date().toISOString();
    
    // 1. Save session state
    await this.saveSessionState();
    
    // 2. Save MCP snapshot
    await this.saveMCPSnapshot();
    
    // 3. Auto-commit git changes if any
    await this.autoCommitChanges();
    
    // 4. Save Gemini session
    await this.saveGeminiSession();
    
    // 5. Update session log
    await this.updateSessionLog('auto_save', 'Automated save completed', timestamp);
    
    console.log(`💾 Auto-save completed at ${timestamp}`);
  }

  /**
   * 💓 Send keep-alive signals to prevent timeouts
   */
  private async sendKeepAlive(): Promise<void> {
    // 1. Send HTTP keep-alive to local server
    try {
      await execAsync('curl -s http://localhost:5500 > nul 2>&1', { timeout: 5000 });
    } catch {
      // Server might not be ready, that's ok
    }

    // 2. Touch activity file
    const activityFile = path.join(this.workspaceRoot, '.vscode', '.session', 'activity.txt');
    await fs.writeFile(activityFile, new Date().toISOString(), 'utf8').catch(() => {});

    // 3. Send VS Code keep-alive command
    try {
      await execAsync('code --command workbench.action.keepAlive', { timeout: 3000 });
    } catch {
      // Command might not exist, that's ok
    }

    // 4. Update Gemini activity if process exists
    if (this.sessionState.geminiProcess && !this.sessionState.geminiProcess.killed) {
      try {
        this.sessionState.geminiProcess.stdin?.write('\n');
      } catch {
        // Process might be busy, that's ok
      }
    }
  }

  /**
   * 👁️ Check system activity and restart components if needed
   */
  private async checkSystemActivity(): Promise<void> {
    // Check if Gemini CLI is still running
    if (!this.sessionState.geminiProcess || this.sessionState.geminiProcess.killed) {
      console.log('🔄 Gemini CLI not running, restarting...');
      await this.startGeminiCLI();
    }

    // Check if Live Server is accessible
    try {
      await execAsync('curl -s http://localhost:5500', { timeout: 3000 });
    } catch {
      console.log('🔄 Live Server not accessible, restarting...');
      await this.startLiveServer();
    }

    // Check system resources
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      console.log('🧹 High memory usage detected, triggering garbage collection...');
      if (global.gc) {
        global.gc();
      }
    }
  }

  /**
   * 💾 Save current session state
   */
  private async saveSessionState(): Promise<void> {
    const sessionFile = path.join(this.workspaceRoot, '.vscode', '.session', 'session-state.json');
    const stateData = {
      ...this.sessionState,
      geminiProcess: undefined, // Don't serialize process objects
      serverProcess: undefined
    };
    
    await fs.mkdir(path.dirname(sessionFile), { recursive: true });
    await fs.writeFile(sessionFile, JSON.stringify(stateData, null, 2), 'utf8');
  }

  /**
   * 📸 Save MCP snapshot
   */
  private async saveMCPSnapshot(): Promise<void> {
    try {
      await execAsync('pwsh -NoProfile -File .vscode/scripts/save-mcp-snapshot.ps1', {
        cwd: this.workspaceRoot,
        timeout: 10000
      });
    } catch (error) {
      console.warn('⚠️ MCP snapshot save failed:', error);
    }
  }

  /**
   * 🔄 Auto-commit git changes
   */
  private async autoCommitChanges(): Promise<void> {
    try {
      // Check if there are any changes
      const { stdout } = await execAsync('git status --porcelain', { cwd: this.workspaceRoot });
      
      if (stdout.trim()) {
        const timestamp = new Date().toISOString();
        await execAsync('git add .', { cwd: this.workspaceRoot });
        await execAsync(`git commit -m "🤖 Auto-save: Continuous session guardian - ${timestamp}"`, {
          cwd: this.workspaceRoot
        });
        console.log('🔄 Auto-committed changes');
      }
    } catch (error) {
      // Auto-commit failures are not critical
      console.debug('🔄 Auto-commit skipped:', error);
    }
  }

  /**
   * 🤖 Save Gemini session
   */
  private async saveGeminiSession(): Promise<void> {
    try {
      await execAsync('npx tsx scripts/unified-gemini-v2.ts --save-session', {
        cwd: this.workspaceRoot,
        timeout: 5000
      });
    } catch (error) {
      console.warn('⚠️ Gemini session save failed:', error);
    }
  }

  /**
   * 📝 Update session log
   */
  private async updateSessionLog(topic: string, summary: string, details: string): Promise<void> {
    try {
      await execAsync(`pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "${topic}" -Summary "${summary}" -Details "${details}" -Actor "guardian"`, {
        cwd: this.workspaceRoot,
        timeout: 5000
      });
    } catch (error) {
      console.warn('⚠️ Session log update failed:', error);
    }
  }

  /**
   * 🔍 Check running servers
   */
  private async checkRunningServers(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('netstat -an | findstr LISTENING');
      const ports = stdout.match(/:(\d+)/g)?.map(p => p.slice(1)) || [];
      return ports;
    } catch {
      return [];
    }
  }

  /**
   * 💀 Kill existing Gemini processes
   */
  private async killExistingGeminiProcesses(): Promise<void> {
    try {
      await execAsync('pwsh -NoProfile -Command "Get-Process | Where-Object {$_.ProcessName -like \'*gemini*\'} | Stop-Process -Force"');
    } catch {
      // No processes to kill or permission denied, that's ok
    }
  }

  /**
   * 🏷️ Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `guardian-${timestamp}-${random}`;
  }

  /**
   * ⏰ Update last activity timestamp
   */
  private updateLastActivity(): void {
    this.sessionState.lastActivity = new Date();
  }

  /**
   * 🛑 Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      
      // Clear timers
      if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
      if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
      if (this.activityCheckTimer) clearInterval(this.activityCheckTimer);
      
      // Perform final save
      await this.performAutoSave();
      
      // Kill child processes
      if (this.sessionState.geminiProcess) {
        this.sessionState.geminiProcess.kill();
      }
      if (this.sessionState.serverProcess) {
        this.sessionState.serverProcess.kill();
      }
      
      console.log('✅ Graceful shutdown complete');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  /**
   * 📊 Get session statistics
   */
  getSessionStats(): object {
    const uptime = Date.now() - this.sessionState.startTime.getTime();
    const lastActivityAge = Date.now() - this.sessionState.lastActivity.getTime();
    
    return {
      sessionId: this.sessionState.sessionId,
      uptime: Math.round(uptime / 1000), // seconds
      lastActivityAge: Math.round(lastActivityAge / 1000), // seconds
      isActive: this.sessionState.isActiveSession,
      geminiRunning: !!this.sessionState.geminiProcess && !this.sessionState.geminiProcess.killed,
      serverRunning: !!this.sessionState.serverProcess && !this.sessionState.serverProcess.killed
    };
  }
}

// CLI entry point
if (require.main === module) {
  const guardian = new ContinuousSessionGuardian();
  guardian.initializeContinuousSession().catch(console.error);
}
