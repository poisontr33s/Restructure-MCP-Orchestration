#!/usr/bin/env node

/**
 * CLAUDE CODE AUTO-STARTUP WITH PRELOAD
 * Automatically starts Claude Code with optimized session intelligence preloaded
 */

const { spawn } = require('child_process');
const path = require('path');

// Auto-preload configuration
const PRELOAD_CONFIG = {
  sessions: [],
  memory_file: 'AUTO-PRELOAD-CONTEXT.md',
  intelligence_mode: 'maximum',
  auto_bridge: true,
};

async function startClaudeWithPreload() {
  console.log('🚀 Starting Claude Code with auto-preload...');

  // Construct preload command
  const preloadPrompt = `Auto-resumed with preloaded session intelligence:

📁 Sessions Loaded: ${PRELOAD_CONFIG.sessions.length}
🧠 Intelligence Mode: Maximum Context  
🎯 Foundation: Multi-agent arbitrage system operational
🔄 Bridge: Automatic session continuity active

Continue revolutionary development with full context awareness.`;

  // Start Claude Code with preload context
  const claude = spawn('claude', ['--continue', '--print', preloadPrompt], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  claude.on('close', (code) => {
    console.log(`Claude Code exited with code ${code}`);
  });

  claude.on('error', (error) => {
    console.error('❌ Failed to start Claude Code:', error.message);

    // Fallback: show preload info
    console.log('\n📋 Preload Context Available:');
    console.log('Files:', PRELOAD_CONFIG.sessions.join(', '));
    console.log('\n🔄 Manual start: claude --continue');
  });
}

if (require.main === module) {
  startClaudeWithPreload();
}

module.exports = { startClaudeWithPreload, PRELOAD_CONFIG };
