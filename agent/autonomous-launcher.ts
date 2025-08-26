#!/usr/bin/env node

/**
 * 🌑🔥 Enhanced Autonomous Heritage Guardian Launcher
 * 
 * This script starts the comprehensive autonomous operation system that:
 * 1. Prevents task stopping by auto-routing to complementary tasks
 * 2. Integrates with Gemini CLI for task guidance
 * 3. Maintains semi-agentic interface operation
 * 4. Ensures web browser monitoring continues without prompts
 * 5. Eliminates ALL [Keep] prompts for 8-hour autonomous operation
 * 6. Auto-saves everything continuously
 * 7. Maintains live server connections
 */

import { ElderPocketPlaneHeritageGuardian } from './elder-pocket-plane-heritage-guardian';
import { ContinuousSessionGuardian } from './continuous-session-guardian';
import { NoPromptAutoSaveService } from './no-prompt-auto-save';

// Enhanced logger for autonomous operation
const logger = {
  info: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${new Date().toISOString()} ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, ...args);
  },
  autonomous: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(`[AUTONOMOUS] ${new Date().toISOString()} 🤖 ${message}`, ...args);
  }
};

async function startAutonomousOperation(): Promise<void> {
  try {
    logger.autonomous('🌑🔥 Starting enhanced autonomous operation system...');
    
    // Get workspace root
    const workspaceRoot = process.cwd();
    
    // 1. Initialize No-Prompt Auto-Save Service (eliminates [Keep] prompts)
    logger.autonomous('🚀 Initializing No-Prompt Auto-Save Service...');
    const autoSaveService = new NoPromptAutoSaveService(workspaceRoot);
    await autoSaveService.initializeNoPromptMode();
    logger.autonomous('✅ No-Prompt Auto-Save Service active');
    
    // 2. Initialize Continuous Session Guardian (maintains connections)
    logger.autonomous('🔄 Initializing Continuous Session Guardian...');
    const sessionGuardian = new ContinuousSessionGuardian(workspaceRoot);
    await sessionGuardian.initializeContinuousSession();
    logger.autonomous('✅ Continuous Session Guardian active');
    
    // 3. Initialize Heritage Guardian with autonomous task management
    logger.autonomous('🏛️ Initializing Heritage Guardian...');
    const heritageGuardian = new ElderPocketPlaneHeritageGuardian(workspaceRoot);
    await heritageGuardian.initializeHeritageGuardian();
    logger.autonomous('✅ Heritage Guardian active');
    
    logger.autonomous('🎉 All autonomous systems online and operational');
    logger.info('🌐 Live monitoring available at: http://localhost:5500');
    logger.info('🌙 System ready for 8-hour sleep mode - ZERO user intervention required');
    logger.info('🤖 Auto-save every 15 seconds, no [Keep] prompts, continuous operation');
    
    // Display session statistics periodically
    setInterval(() => {
      const stats = sessionGuardian.getSessionStats() as any;
      logger.autonomous(`📊 Session Stats: Uptime ${stats.uptime}s, Last Activity ${stats.lastActivityAge}s ago`);
    }, 300000); // Every 5 minutes
    
    // Keep the process alive for continuous operation
    process.on('SIGINT', async () => {
      logger.autonomous('🛑 Graceful shutdown requested...');
      await autoSaveService.shutdown();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.autonomous('🛑 Process termination requested...');
      await autoSaveService.shutdown();
      process.exit(0);
    });
    
    // Keep process alive indefinitely
    setInterval(() => {
      // Heartbeat to keep process alive
    }, 60000);
    
    logger.autonomous('♾️ Autonomous operation loop established - running indefinitely');
    
  } catch (error) {
    logger.error('❌ Failed to start autonomous operation:', error);
    process.exit(1);
  }
}

// Start immediately
startAutonomousOperation().catch((error) => {
  logger.error('💥 Fatal error in autonomous launcher:', error);
  process.exit(1);
});
