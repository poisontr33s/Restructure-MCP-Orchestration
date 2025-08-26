#!/usr/bin/env node

/**
 * 🌑🔥 Autonomous Heritage Guardian Launcher
 * 
 * This script starts the continuous autonomous operation system that:
 * 1. Prevents task stopping by auto-routing to complementary tasks
 * 2. Integrates with Gemini CLI for task guidance
 * 3. Maintains semi-agentic interface operation
 * 4. Ensures web browser monitoring continues without prompts
 */

import { ElderPocketPlaneHeritageGuardian } from './elder-pocket-plane-heritage-guardian';

// Simple logger for the launcher
const logger = {
  info: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, ...args);
  }
};

async function startAutonomousOperation(): Promise<void> {
  try {
    logger.info('🌑🔥 Starting autonomous operation system...');
    
    // Get workspace root
    const workspaceRoot = process.cwd();
    
    // Initialize Heritage Guardian with autonomous task management
    const heritageGuardian = new ElderPocketPlaneHeritageGuardian(workspaceRoot);
    
    // Start the guardian - this includes continuous task management
    await heritageGuardian.initializeHeritageGuardian();
    
    logger.info('✅ Autonomous operation system started successfully');
    logger.info('🌐 Live monitoring available at: http://localhost:5500');
    logger.info('🌙 System ready for sleep mode - no user intervention required');
    
    // Keep the process alive for continuous operation
    process.on('SIGINT', () => {
      logger.info('🛑 Graceful shutdown requested...');
      process.exit(0);
    });
    
    // Log that we're running autonomously
    setInterval(() => {
      logger.info('🤖 Autonomous operation heartbeat - system running smoothly');
    }, 5 * 60 * 1000); // Every 5 minutes
    
  } catch (error) {
    logger.error('💥 Autonomous operation startup failed:', error);
    process.exit(1);
  }
}

// Start immediately
startAutonomousOperation().catch((error) => {
  console.error('💥 Fatal error in autonomous launcher:', error);
  process.exit(1);
});
