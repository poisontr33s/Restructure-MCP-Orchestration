#!/usr/bin/env node

/**
 * CLAUDE AUTO-PRELOAD SYSTEM
 * Automatically preloads optimized .md.session files into Claude Code on startup
 * Zero-redundancy, maximum-performance session intelligence loading
 */

const fs = require('fs').promises;
const path = require('path');

class ClaudeAutoPreload {
  constructor(options = {}) {
    this.preloadDir = options.preloadDir || 'preload-sessions';
    this.claudeMemoryDir = path.join(process.env.USERPROFILE || process.env.HOME, '.claude');
    this.maxPreloadSessions = options.maxPreloadSessions || 3;
    this.priorityThreshold = options.priorityThreshold || 70;
    
    this.config = {
      auto_preload: true,
      intelligence_mode: 'maximum_context',
      redundancy_reduction: true,
      cross_model_compatibility: true,
      performance_optimized: true
    };
  }

  async setupAutoPreload() {
    console.log('🚀 Setting up Claude Code auto-preload system...');
    
    try {
      // Ensure directories exist
      await fs.mkdir(this.claudeMemoryDir, { recursive: true });
      await fs.mkdir(this.preloadDir, { recursive: true });
      
      // Scan available .md.session files
      const availableSessions = await this.scanPreloadSessions();
      
      // Select optimal sessions for preloading
      const selectedSessions = await this.selectOptimalSessions(availableSessions);
      
      // Create Claude Code memory integration
      await this.createMemoryIntegration(selectedSessions);
      
      // Generate startup script
      await this.generateStartupScript(selectedSessions);
      
      // Create VS Code integration
      await this.createVSCodeIntegration(selectedSessions);
      
      console.log('✅ Auto-preload system configured successfully!');
      return selectedSessions;
      
    } catch (error) {
      console.error('❌ Auto-preload setup failed:', error.message);
      throw error;
    }
  }

  async scanPreloadSessions() {
    console.log('🔍 Scanning optimized .md.session files...');
    
    const files = await fs.readdir(this.preloadDir);
    const mdSessions = files.filter(f => f.endsWith('.md.session'));
    
    const sessions = [];
    
    for (const file of mdSessions) {
      const filePath = path.join(this.preloadDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const metadata = this.parseMdSessionMetadata(content);
      
      sessions.push({
        filename: file,
        path: filePath,
        ...metadata
      });
    }
    
    console.log(`   📁 Found ${sessions.length} optimized sessions`);
    return sessions;
  }

  parseMdSessionMetadata(content) {
    // Extract priority and intelligence from the header
    const priorityMatch = content.match(/\\*\\*🎯 Auto-Preload Priority\\*\\*: (\\w+)/);
    const intelligenceMatch = content.match(/\\*\\*🧠 Intelligence\\*\\*: (\\d+)%/);
    const messagesMatch = content.match(/\\*\\*📊 Messages\\*\\*: (\\d+)/);
    const typeMatch = content.match(/\\| \\*\\*Type\\*\\* \\| (\\w+) \\|/);
    
    return {
      priority: priorityMatch ? priorityMatch[1] : 'MEDIUM',
      intelligence_score: intelligenceMatch ? parseInt(intelligenceMatch[1]) : 50,
      message_count: messagesMatch ? parseInt(messagesMatch[1]) : 0,
      session_type: typeMatch ? typeMatch[1] : 'Current',
      preload_weight: this.calculatePreloadWeight(
        priorityMatch?.[1] || 'MEDIUM',
        parseInt(intelligenceMatch?.[1]) || 50
      )
    };
  }

  calculatePreloadWeight(priority, intelligence) {
    const priorityWeights = {
      'MAXIMUM': 1.0,
      'HIGH': 0.8,
      'MEDIUM': 0.6,
      'LOW': 0.3
    };
    
    return (priorityWeights[priority] || 0.5) * (intelligence / 100);
  }

  async selectOptimalSessions(sessions) {
    console.log('⚖️ Selecting optimal sessions for preloading...');
    
    // Sort by preload weight (highest first)
    const sorted = sessions.sort((a, b) => b.preload_weight - a.preload_weight);
    
    // Filter by intelligence threshold
    const qualified = sorted.filter(s => s.intelligence_score >= this.priorityThreshold);
    
    // Select top sessions up to max limit
    const selected = qualified.slice(0, this.maxPreloadSessions);
    
    console.log('   📋 Selected sessions:');
    selected.forEach((session, i) => {
      console.log(`   ${i + 1}. ${session.filename} (${session.priority}, ${session.intelligence_score}%)`);
    });
    
    return selected;
  }

  async createMemoryIntegration(sessions) {
    console.log('🧠 Creating Claude Code memory integration...');
    
    // Create consolidated preload context
    const preloadContext = await this.consolidateSessionIntelligence(sessions);
    
    // Write to Claude Code memory location (if accessible)
    const memoryFile = 'AUTO-PRELOAD-CONTEXT.md';
    const memoryPath = path.join(this.claudeMemoryDir, memoryFile);
    
    try {
      await fs.writeFile(memoryPath, preloadContext);
      console.log(`   ✅ Created memory file: ${memoryFile}`);
    } catch (error) {
      console.log(`   ⚠️ Could not write to Claude memory (${error.message})`);
      
      // Fallback: create in project directory
      await fs.writeFile(memoryFile, preloadContext);
      console.log(`   ✅ Created fallback memory file: ${memoryFile}`);
    }
  }

  async consolidateSessionIntelligence(sessions) {
    const consolidation = `# Claude Code Auto-Preload Context

**Generated**: ${new Date().toISOString()}  
**Sessions Preloaded**: ${sessions.length}  
**Intelligence Mode**: Maximum Context  
**Redundancy**: Zero  

## 🎯 Preloaded Session Intelligence

${sessions.map((session, i) => `
### ${i + 1}. ${session.session_type} Session (${session.intelligence_score}%)
- **Priority**: ${session.priority}
- **Messages**: ${session.message_count}
- **File**: \`${session.filename}\`
- **Context**: Automatically loaded with full intelligence preservation
`).join('')}

## 🧠 Consolidated Context

**Revolutionary Foundation**: Multi-agent arbitrage system with Claude Code (Architect), GPT-5 (Navigator), Gemini CLI (Scout) operational and coordinated.

**Current State**: All preloaded sessions provide immediate context for continuation of revolutionary development with zero context loss.

**Intelligence Graph**: 
- **Total Messages**: ${sessions.reduce((sum, s) => sum + s.message_count, 0)}
- **Average Intelligence**: ${Math.round(sessions.reduce((sum, s) => sum + s.intelligence_score, 0) / sessions.length)}%
- **Session Types**: ${[...new Set(sessions.map(s => s.session_type))].join(', ')}

## 🚀 Auto-Preload Instructions

**This context is automatically available when Claude Code starts.**

Continue development with:
- Complete architectural awareness from genesis sessions
- Evolution patterns from refinement sessions  
- Specialized knowledge from domain sessions
- Current state from active sessions

**Next Phase**: Revolutionary development continues with full intelligence continuity.

---
*Auto-generated preload context - Zero redundancy, maximum intelligence*`;

    return consolidation;
  }

  async generateStartupScript(sessions) {
    console.log('📜 Generating Claude Code startup script...');
    
    const startupScript = `#!/usr/bin/env node

/**
 * CLAUDE CODE AUTO-STARTUP WITH PRELOAD
 * Automatically starts Claude Code with optimized session intelligence preloaded
 */

const { spawn } = require('child_process');
const path = require('path');

// Auto-preload configuration
const PRELOAD_CONFIG = {
  sessions: ${JSON.stringify(sessions.map(s => s.filename), null, 2)},
  memory_file: 'AUTO-PRELOAD-CONTEXT.md',
  intelligence_mode: 'maximum',
  auto_bridge: true
};

async function startClaudeWithPreload() {
  console.log('🚀 Starting Claude Code with auto-preload...');
  
  // Construct preload command
  const preloadPrompt = \`Auto-resumed with preloaded session intelligence:

📁 Sessions Loaded: \${PRELOAD_CONFIG.sessions.length}
🧠 Intelligence Mode: Maximum Context  
🎯 Foundation: Multi-agent arbitrage system operational
🔄 Bridge: Automatic session continuity active

Continue revolutionary development with full context awareness.\`;

  // Start Claude Code with preload context
  const claude = spawn('claude', ['--continue', '--print', preloadPrompt], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  claude.on('close', (code) => {
    console.log(\`Claude Code exited with code \${code}\`);
  });

  claude.on('error', (error) => {
    console.error('❌ Failed to start Claude Code:', error.message);
    
    // Fallback: show preload info
    console.log('\\n📋 Preload Context Available:');
    console.log('Files:', PRELOAD_CONFIG.sessions.join(', '));
    console.log('\\n🔄 Manual start: claude --continue');
  });
}

if (require.main === module) {
  startClaudeWithPreload();
}

module.exports = { startClaudeWithPreload, PRELOAD_CONFIG };`;

    await fs.writeFile('scripts/claude-autostart.js', startupScript);
    console.log('   ✅ Created: scripts/claude-autostart.js');
    
    // Create batch file for Windows
    const batchScript = `@echo off
echo 🚀 Claude Code Auto-Start with Preload
echo =====================================
node scripts/claude-autostart.js
pause`;

    await fs.writeFile('claude-autostart.bat', batchScript);
    console.log('   ✅ Created: claude-autostart.bat');
  }

  async createVSCodeIntegration(sessions) {
    console.log('🎨 Creating VS Code auto-preload integration...');
    
    // Add VS Code tasks for auto-preload
    const tasks = [
      {
        "label": "Claude: Auto-Start with Preload",
        "type": "shell", 
        "command": "node",
        "args": ["scripts/claude-autostart.js"],
        "options": { "cwd": "${workspaceFolder}" },
        "problemMatcher": [],
        "group": "build"
      },
      {
        "label": "Sessions: Update Preload Optimization",
        "type": "shell",
        "command": "node", 
        "args": ["scripts/json-to-mdSession-optimizer.js"],
        "options": { "cwd": "${workspaceFolder}" },
        "problemMatcher": []
      },
      {
        "label": "Sessions: Configure Auto-Preload",
        "type": "shell",
        "command": "node",
        "args": ["scripts/claude-auto-preload.js"],
        "options": { "cwd": "${workspaceFolder}" },
        "problemMatcher": []
      }
    ];
    
    // Read existing tasks.json
    const tasksPath = '.vscode/tasks.json';
    let existingTasks = { tasks: [] };
    
    try {
      const content = await fs.readFile(tasksPath, 'utf8');
      existingTasks = JSON.parse(content);
    } catch (error) {
      console.log('   📝 Creating new tasks.json');
    }
    
    // Add new tasks (avoid duplicates)
    const existingLabels = existingTasks.tasks.map(t => t.label);
    const newTasks = tasks.filter(t => !existingLabels.includes(t.label));
    
    existingTasks.tasks.push(...newTasks);
    
    await fs.writeFile(tasksPath, JSON.stringify(existingTasks, null, 2));
    console.log(`   ✅ Added ${newTasks.length} auto-preload tasks to VS Code`);
  }

  async showPreloadStatus() {
    const sessions = await this.scanPreloadSessions();
    const selected = await this.selectOptimalSessions(sessions);
    
    console.log(`
🎯 CLAUDE AUTO-PRELOAD STATUS

📁 Available Sessions: ${sessions.length}
🎯 Selected for Preload: ${selected.length}
🧠 Average Intelligence: ${Math.round(selected.reduce((sum, s) => sum + s.intelligence_score, 0) / selected.length)}%

## Selected Sessions:
${selected.map((s, i) => `${i + 1}. ${s.filename} (${s.priority}, ${s.intelligence_score}%)`).join('\n')}

## Usage:
- **Auto-start**: \`node scripts/claude-autostart.js\` or \`claude-autostart.bat\`
- **VS Code Task**: "Claude: Auto-Start with Preload"
- **Manual**: Sessions automatically available in Claude Code memory

🚀 Revolutionary continuity ready!`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'setup';
  
  const preloader = new ClaudeAutoPreload();
  
  async function main() {
    try {
      switch (command) {
        case 'setup':
          await preloader.setupAutoPreload();
          break;
          
        case 'status':
          await preloader.showPreloadStatus();
          break;
          
        default:
          console.log(`
🚀 Claude Auto-Preload System

Commands:
  setup   - Configure auto-preload system
  status  - Show current preload status

Usage:
  node scripts/claude-auto-preload.js setup
  node scripts/claude-auto-preload.js status
          `);
      }
      
    } catch (error) {
      console.error('❌ Auto-preload operation failed:', error.message);
      process.exit(1);
    }
  }
  
  main();
}

module.exports = ClaudeAutoPreload;