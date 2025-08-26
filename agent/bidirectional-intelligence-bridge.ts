#!/usr/bin/env node
/**
 * 🌉 Bidirectional Intelligence Bridge
 * 
 * Coordinates between Claude Sonnet 4 (via VS Code) and Gemini CLI (2.5 Pro)
 * for seamless cross-pollination during autonomous 8-hour operation cycles.
 * 
 * This bridge ensures both AIs work together rather than interfering with each other.
 */

import { exec, spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BridgeState {
  claudeActive: boolean;
  geminiActive: boolean;
  lastClaudeAction: Date;
  lastGeminiAction: Date;
  coordinationMode: 'sequential' | 'parallel' | 'collaborative';
  currentPrimaryAgent: 'claude' | 'gemini' | 'shared';
}

interface AgentMessage {
  from: 'claude' | 'gemini';
  to: 'claude' | 'gemini' | 'both';
  type: 'status' | 'request' | 'completion' | 'handoff';
  content: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export class BidirectionalIntelligenceBridge {
  private bridgeState: BridgeState;
  private messageQueue: AgentMessage[] = [];
  private workspaceRoot: string;
  private coordinationTimer?: NodeJS.Timeout;
  private statusCheckTimer?: NodeJS.Timeout;

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.bridgeState = {
      claudeActive: true, // Assuming Claude is active via VS Code
      geminiActive: false, // Will detect running Gemini CLI
      lastClaudeAction: new Date(),
      lastGeminiAction: new Date(),
      coordinationMode: 'collaborative',
      currentPrimaryAgent: 'shared'
    };
  }

  /**
   * 🚀 Initialize the bidirectional intelligence bridge
   */
  async initializeBridge(): Promise<void> {
    console.log('🌉 Initializing Bidirectional Intelligence Bridge...');
    console.log('🤝 Coordinating Claude Sonnet 4 + Gemini CLI 2.5 Pro');
    
    // Detect active agents
    await this.detectActiveAgents();
    
    // Setup coordination protocols
    await this.setupCoordinationProtocols();
    
    // Start status monitoring
    await this.startStatusMonitoring();
    
    // Create communication channels
    await this.createCommunicationChannels();
    
    console.log('✅ Bidirectional Intelligence Bridge active');
    console.log(`🎯 Mode: ${this.bridgeState.coordinationMode}`);
    console.log(`👑 Primary: ${this.bridgeState.currentPrimaryAgent}`);
  }

  /**
   * 🔍 Detect which AI agents are currently active
   */
  private async detectActiveAgents(): Promise<void> {
    // Check for Gemini CLI processes
    try {
      const { stdout } = await execAsync('tasklist | findstr gemini');
      this.bridgeState.geminiActive = stdout.includes('gemini') || stdout.includes('node');
      
      if (this.bridgeState.geminiActive) {
        console.log('✅ Gemini CLI 2.5 Pro detected and active');
        this.bridgeState.lastGeminiAction = new Date();
      }
    } catch {
      this.bridgeState.geminiActive = false;
      console.log('ℹ️ Gemini CLI not detected');
    }

    // Claude is assumed active if we're running in VS Code context
    this.bridgeState.claudeActive = true;
    console.log('✅ Claude Sonnet 4 active via VS Code');
  }

  /**
   * ⚙️ Setup coordination protocols to prevent conflicts
   */
  private async setupCoordinationProtocols(): Promise<void> {
    // Create coordination rules based on active agents
    if (this.bridgeState.claudeActive && this.bridgeState.geminiActive) {
      this.bridgeState.coordinationMode = 'collaborative';
      console.log('🤝 Collaborative mode: Both agents active, coordinating tasks');
    } else if (this.bridgeState.claudeActive) {
      this.bridgeState.coordinationMode = 'sequential';
      this.bridgeState.currentPrimaryAgent = 'claude';
      console.log('🎯 Claude primary mode: Sequential processing');
    } else if (this.bridgeState.geminiActive) {
      this.bridgeState.coordinationMode = 'sequential';
      this.bridgeState.currentPrimaryAgent = 'gemini';
      console.log('🎯 Gemini primary mode: Sequential processing');
    }

    // Setup task allocation rules
    await this.setupTaskAllocation();
  }

  /**
   * 📋 Setup task allocation between agents
   */
  private async setupTaskAllocation(): Promise<void> {
    const allocationRules = {
      claude: {
        strengths: ['code_analysis', 'architecture_design', 'debugging', 'documentation'],
        priority: ['complex_reasoning', 'system_design', 'error_analysis']
      },
      gemini: {
        strengths: ['file_operations', 'builds', 'testing', 'deployment'],
        priority: ['automation', 'scripts', 'monitoring', 'maintenance']
      },
      shared: {
        tasks: ['session_management', 'status_monitoring', 'auto_save']
      }
    };

    // Save allocation rules for reference
    const rulesFile = path.join(this.workspaceRoot, '.vscode', '.session', 'task-allocation.json');
    await fs.mkdir(path.dirname(rulesFile), { recursive: true });
    await fs.writeFile(rulesFile, JSON.stringify(allocationRules, null, 2), 'utf8');
    
    console.log('📋 Task allocation rules established');
  }

  /**
   * 👁️ Start continuous status monitoring
   */
  private async startStatusMonitoring(): Promise<void> {
    this.statusCheckTimer = setInterval(async () => {
      await this.checkAgentStatus();
      await this.processMessageQueue();
      await this.coordinateActivities();
    }, 30000); // Check every 30 seconds

    console.log('👁️ Status monitoring started (30s intervals)');
  }

  /**
   * 📡 Create communication channels between agents
   */
  private async createCommunicationChannels(): Promise<void> {
    const channelDir = path.join(this.workspaceRoot, '.vscode', '.session', 'agent-bridge');
    await fs.mkdir(channelDir, { recursive: true });

    // Create message files for inter-agent communication
    const channels = ['claude-to-gemini.json', 'gemini-to-claude.json', 'shared-status.json'];
    
    for (const channel of channels) {
      const channelFile = path.join(channelDir, channel);
      if (!(await fs.access(channelFile).then(() => true).catch(() => false))) {
        await fs.writeFile(channelFile, JSON.stringify({ messages: [] }, null, 2), 'utf8');
      }
    }

    console.log('📡 Communication channels established');
  }

  /**
   * 🔍 Check status of both agents
   */
  private async checkAgentStatus(): Promise<void> {
    // Re-detect agents periodically
    await this.detectActiveAgents();

    // Update shared status
    const statusFile = path.join(this.workspaceRoot, '.vscode', '.session', 'agent-bridge', 'shared-status.json');
    const status = {
      timestamp: new Date().toISOString(),
      bridge: this.bridgeState,
      workspace: this.workspaceRoot,
      messageQueueLength: this.messageQueue.length
    };

    await fs.writeFile(statusFile, JSON.stringify(status, null, 2), 'utf8');
  }

  /**
   * 📬 Process message queue between agents
   */
  private async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.deliverMessage(message);
      }
    }
  }

  /**
   * 📤 Deliver message to target agent
   */
  private async deliverMessage(message: AgentMessage): Promise<void> {
    const channelDir = path.join(this.workspaceRoot, '.vscode', '.session', 'agent-bridge');
    
    let targetFile: string;
    if (message.to === 'claude') {
      targetFile = path.join(channelDir, 'gemini-to-claude.json');
    } else if (message.to === 'gemini') {
      targetFile = path.join(channelDir, 'claude-to-gemini.json');
    } else {
      targetFile = path.join(channelDir, 'shared-status.json');
    }

    try {
      const existing = await fs.readFile(targetFile, 'utf8');
      const data = JSON.parse(existing);
      data.messages = data.messages || [];
      data.messages.push(message);
      
      // Keep only last 50 messages
      if (data.messages.length > 50) {
        data.messages = data.messages.slice(-50);
      }
      
      await fs.writeFile(targetFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.warn('⚠️ Failed to deliver message:', error);
    }
  }

  /**
   * 🤝 Coordinate activities between agents
   */
  private async coordinateActivities(): Promise<void> {
    const now = new Date();
    const claudeIdle = (now.getTime() - this.bridgeState.lastClaudeAction.getTime()) > 60000; // 1 minute
    const geminiIdle = (now.getTime() - this.bridgeState.lastGeminiAction.getTime()) > 60000; // 1 minute

    // Determine optimal task distribution
    if (this.bridgeState.coordinationMode === 'collaborative') {
      if (claudeIdle && !geminiIdle) {
        // Gemini is active, Claude idle - suggest handoff
        await this.suggestTaskHandoff('gemini', 'claude');
      } else if (!claudeIdle && geminiIdle) {
        // Claude is active, Gemini idle - suggest handoff
        await this.suggestTaskHandoff('claude', 'gemini');
      }
    }
  }

  /**
   * 🔄 Suggest task handoff between agents
   */
  private async suggestTaskHandoff(from: 'claude' | 'gemini', to: 'claude' | 'gemini'): Promise<void> {
    const handoffMessage: AgentMessage = {
      from,
      to,
      type: 'handoff',
      content: `Task handoff suggested from ${from} to ${to} for load balancing`,
      timestamp: new Date(),
      priority: 'medium'
    };

    this.messageQueue.push(handoffMessage);
    console.log(`🔄 Task handoff suggested: ${from} → ${to}`);
  }

  /**
   * 📊 Send status update from Claude
   */
  async sendClaudeStatus(status: string, action?: string): Promise<void> {
    this.bridgeState.lastClaudeAction = new Date();
    
    const message: AgentMessage = {
      from: 'claude',
      to: 'gemini',
      type: 'status',
      content: `Claude status: ${status}${action ? ` | Action: ${action}` : ''}`,
      timestamp: new Date(),
      priority: 'low'
    };

    this.messageQueue.push(message);
  }

  /**
   * 📥 Read messages for Claude from Gemini
   */
  async readGeminiMessages(): Promise<AgentMessage[]> {
    const messageFile = path.join(this.workspaceRoot, '.vscode', '.session', 'agent-bridge', 'gemini-to-claude.json');
    
    try {
      const content = await fs.readFile(messageFile, 'utf8');
      const data = JSON.parse(content);
      return data.messages || [];
    } catch {
      return [];
    }
  }

  /**
   * 🎯 Get task recommendations for current context
   */
  async getTaskRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];

    if (this.bridgeState.geminiActive) {
      recommendations.push('🤖 Gemini CLI active - focus on code analysis and architecture');
      recommendations.push('🔄 Coordinate file operations with Gemini');
      recommendations.push('📊 Monitor Gemini build outputs and status');
    }

    if (this.bridgeState.coordinationMode === 'collaborative') {
      recommendations.push('🤝 Collaborative mode - cross-pollinate insights');
      recommendations.push('💡 Share complex reasoning with Gemini');
      recommendations.push('🔄 Alternate between deep analysis and implementation');
    }

    recommendations.push('💾 Maintain continuous auto-save coordination');
    recommendations.push('🌐 Keep live server and session persistence active');

    return recommendations;
  }

  /**
   * 📈 Get bridge statistics
   */
  getBridgeStats(): object {
    return {
      bridgeState: this.bridgeState,
      messageQueueLength: this.messageQueue.length,
      uptime: Date.now() - this.bridgeState.lastClaudeAction.getTime(),
      recommendations: this.getTaskRecommendations()
    };
  }

  /**
   * 🛑 Cleanup bridge resources
   */
  async cleanup(): Promise<void> {
    if (this.statusCheckTimer) {
      clearInterval(this.statusCheckTimer);
    }
    if (this.coordinationTimer) {
      clearInterval(this.coordinationTimer);
    }
    
    // Send final status
    await this.sendClaudeStatus('Bridge shutting down', 'cleanup');
    console.log('🛑 Bidirectional Intelligence Bridge shutdown complete');
  }
}

// CLI entry point
if (require.main === module) {
  const bridge = new BidirectionalIntelligenceBridge();
  bridge.initializeBridge().catch(console.error);
}
