#!/usr/bin/env node

/**
 * Session Log Watcher - Native file monitoring without external dependencies
 * Monitors for rapid problems file generation and triggers emergency cleanup
 */

const fs = require('fs');
const path = require('path');
const SessionLogGuardian = require('./session-log-guardian.js');

const guardian = new SessionLogGuardian('C:\Users\erdno\GithubRepos\Restructure-MCP-Orchestration\docs\session-log', {
  maxProblemsFiles: 10,
  emergencyCleanup: true,
  verbose: true
});

let recentFiles = [];
let lastScanTime = Date.now();

function monitorDirectory() {
  const logDir = 'C:\Users\erdno\GithubRepos\Restructure-MCP-Orchestration\docs\session-log';
  
  try {
    // Scan for problems files
    const files = fs.readdirSync(logDir);
    const problemsFiles = files.filter(f => f.startsWith('problems-') && f.endsWith('.json'));
    
    // Track new files since last scan
    const currentTime = Date.now();
    const newFiles = [];
    
    for (const file of problemsFiles) {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() > lastScanTime) {
        newFiles.push({ path: filePath, time: stats.mtime.getTime() });
      }
    }
    
    if (newFiles.length > 0) {
      recentFiles.push(...newFiles);
      console.log(`📊 ${newFiles.length} new problems files detected`);
    }
    
    // Keep only files from last 5 minutes
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000;
    recentFiles = recentFiles.filter(f => f.time > fiveMinutesAgo);
    
    // Check for bulk-up condition
    if (recentFiles.length > 10) {
      console.log(`🚨 Rapid file generation detected! ${recentFiles.length} files in 5 minutes`);
      guardian.emergencyCleanup().catch(err => {
        console.error('Emergency cleanup failed:', err.message);
      });
      recentFiles = []; // Reset counter
    }
    
    lastScanTime = currentTime;
    
  } catch (error) {
    console.error('Monitor error:', error.message);
  }
}

// Monitor every 30 seconds
console.log('👁️  Session log guardian watching for bulk-up (native monitoring)...');
console.log(`📁 Monitoring: ${guardian.logDir}`);

setInterval(monitorDirectory, 30000);
monitorDirectory(); // Initial scan

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Guardian watcher stopped');
  process.exit(0);
});
