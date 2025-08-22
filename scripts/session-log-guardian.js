#!/usr/bin/env node

/**
 * SESSION LOG GUARDIAN
 * Intelligent auto-cleanup and prevention system for session log bulk-up
 * Prevents recursive file generation and maintains optimal storage
 */

const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');

class SessionLogGuardian {
  constructor(logDir, options = {}) {
    this.logDir = path.resolve(logDir);
    this.config = {
      // File management thresholds
      maxProblemsFiles: options.maxProblemsFiles || 10,
      maxProblemsAge: options.maxProblemsAge || 24 * 60 * 60 * 1000, // 24 hours
      maxTotalSize: options.maxTotalSize || 50 * 1024 * 1024, // 50MB
      
      // Session log management
      maxSessionEntries: options.maxSessionEntries || 1000,
      archiveThreshold: options.archiveThreshold || 500,
      
      // Prevention mechanisms
      detectRecursion: options.detectRecursion !== false,
      emergencyCleanup: options.emergencyCleanup !== false,
      
      // Reporting
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      
      ...options
    };

    this.stats = {
      filesProcessed: 0,
      filesRemoved: 0,
      sizeReclaimed: 0,
      recursionDetected: false,
      emergencyTriggered: false,
      errors: []
    };
  }

  async analyze() {
    console.log('🔍 Analyzing session log directory...');
    const startTime = performance.now();

    try {
      const analysis = {
        timestamp: new Date().toISOString(),
        directory: this.logDir,
        files: {},
        patterns: {},
        risks: [],
        recommendations: []
      };

      // Scan all files
      const files = await this.scanDirectory();
      analysis.files = await this.categorizeFiles(files);
      
      // Detect patterns and risks
      analysis.patterns = this.analyzePatterns(analysis.files);
      analysis.risks = this.assessRisks(analysis.patterns);
      analysis.recommendations = this.generateRecommendations(analysis.risks);

      const duration = performance.now() - startTime;
      analysis.performance = { duration_ms: duration.toFixed(2) };

      return analysis;

    } catch (error) {
      this.stats.errors.push({ type: 'analysis', error: error.message });
      throw error;
    }
  }

  async scanDirectory() {
    const files = [];
    
    try {
      const entries = await fs.readdir(this.logDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile()) {
          const filePath = path.join(this.logDir, entry.name);
          const stats = await fs.stat(filePath);
          
          files.push({
            name: entry.name,
            path: filePath,
            size: stats.size,
            mtime: stats.mtime,
            age: Date.now() - stats.mtime.getTime()
          });
        }
      }
    } catch (error) {
      this.stats.errors.push({ type: 'scan', error: error.message });
    }

    return files;
  }

  async categorizeFiles(files) {
    const categories = {
      problems: [],
      sessions: [],
      markdown: [],
      scripts: [],
      other: [],
      totals: {
        count: files.length,
        size: 0
      }
    };

    for (const file of files) {
      categories.totals.size += file.size;

      if (file.name.startsWith('problems-') && file.name.endsWith('.json')) {
        categories.problems.push(file);
      } else if (file.name === 'session.jsonl' || file.name.includes('session')) {
        categories.sessions.push(file);
      } else if (file.name.endsWith('.md')) {
        categories.markdown.push(file);
      } else if (file.name.endsWith('.ps1') || file.name.endsWith('.js')) {
        categories.scripts.push(file);
      } else {
        categories.other.push(file);
      }
    }

    return categories;
  }

  analyzePatterns(files) {
    const patterns = {
      problems_explosion: false,
      rapid_generation: false,
      size_growth: false,
      time_clustering: false
    };

    // Problems file explosion detection
    if (files.problems.length > this.config.maxProblemsFiles) {
      patterns.problems_explosion = {
        detected: true,
        count: files.problems.length,
        threshold: this.config.maxProblemsFiles,
        severity: 'critical'
      };
    }

    // Rapid generation detection (multiple files in short timespan)
    if (files.problems.length > 5) {
      const sortedByTime = files.problems.sort((a, b) => b.mtime - a.mtime);
      const recentFiles = sortedByTime.slice(0, 10);
      const timeSpan = recentFiles[0].mtime - recentFiles[recentFiles.length - 1].mtime;
      
      if (timeSpan < 5 * 60 * 1000) { // 5 minutes
        patterns.rapid_generation = {
          detected: true,
          files_in_5min: recentFiles.length,
          severity: 'high'
        };
      }
    }

    // Size growth detection
    const totalProblemsSize = files.problems.reduce((sum, f) => sum + f.size, 0);
    if (totalProblemsSize > this.config.maxTotalSize * 0.8) {
      patterns.size_growth = {
        detected: true,
        current_size: totalProblemsSize,
        threshold: this.config.maxTotalSize,
        severity: 'high'
      };
    }

    return patterns;
  }

  assessRisks(patterns) {
    const risks = [];

    if (patterns.problems_explosion?.detected) {
      risks.push({
        type: 'recursive_generation',
        severity: 'critical',
        description: 'Massive problems file generation detected',
        impact: 'System instability, disk space exhaustion',
        recommendation: 'Immediate cleanup and prevention'
      });
    }

    if (patterns.rapid_generation?.detected) {
      risks.push({
        type: 'runaway_process',
        severity: 'high',
        description: 'Rapid file generation in short timespan',
        impact: 'Performance degradation, resource exhaustion',
        recommendation: 'Identify and stop generating process'
      });
    }

    if (patterns.size_growth?.detected) {
      risks.push({
        type: 'storage_exhaustion',
        severity: 'medium',
        description: 'Session log directory approaching size limits',
        impact: 'Potential disk space issues',
        recommendation: 'Archive and cleanup old files'
      });
    }

    return risks;
  }

  generateRecommendations(risks) {
    const recommendations = [];

    const criticalRisks = risks.filter(r => r.severity === 'critical');
    const highRisks = risks.filter(r => r.severity === 'high');

    if (criticalRisks.length > 0) {
      recommendations.push({
        priority: 'immediate',
        action: 'emergency_cleanup',
        description: 'Run emergency cleanup to remove bulk problems files',
        command: 'node scripts/session-log-guardian.js --emergency-cleanup'
      });
    }

    if (highRisks.length > 0) {
      recommendations.push({
        priority: 'urgent',
        action: 'process_investigation',
        description: 'Identify and stop the process generating excessive files',
        command: 'node scripts/session-log-guardian.js --analyze --verbose'
      });
    }

    recommendations.push({
      priority: 'routine',
      action: 'regular_maintenance',
      description: 'Set up automated cleanup schedule',
      command: 'node scripts/session-log-guardian.js --cleanup --schedule'
    });

    return recommendations;
  }

  async emergencyCleanup() {
    console.log('🚨 EMERGENCY CLEANUP INITIATED');
    
    if (this.config.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be deleted');
    }

    const files = await this.scanDirectory();
    const categorized = await this.categorizeFiles(files);

    // Emergency cleanup strategy
    const cleanupTargets = [];

    // 1. Remove excess problems files (keep only newest 5)
    if (categorized.problems.length > 5) {
      const sortedProblems = categorized.problems.sort((a, b) => b.mtime - a.mtime);
      const toRemove = sortedProblems.slice(5); // Keep newest 5
      cleanupTargets.push(...toRemove);
    }

    // 2. Remove old problems files (older than threshold)
    const oldProblems = categorized.problems.filter(f => f.age > this.config.maxProblemsAge);
    cleanupTargets.push(...oldProblems);

    // Execute cleanup
    let sizeReclaimed = 0;
    let filesRemoved = 0;

    for (const file of cleanupTargets) {
      try {
        if (!this.config.dryRun) {
          await fs.unlink(file.path);
        }
        sizeReclaimed += file.size;
        filesRemoved++;
        
        if (this.config.verbose) {
          console.log(`🗑️  Removed: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
        }
      } catch (error) {
        this.stats.errors.push({ type: 'cleanup', file: file.name, error: error.message });
      }
    }

    this.stats.filesRemoved = filesRemoved;
    this.stats.sizeReclaimed = sizeReclaimed;
    this.stats.emergencyTriggered = true;

    console.log(`✅ Emergency cleanup complete:`);
    console.log(`   Files removed: ${filesRemoved}`);
    console.log(`   Space reclaimed: ${(sizeReclaimed / (1024 * 1024)).toFixed(2)}MB`);

    return {
      filesRemoved,
      sizeReclaimed,
      errors: this.stats.errors
    };
  }

  async preventiveCleanup() {
    console.log('🛡️  Running preventive cleanup...');
    
    const files = await this.scanDirectory();
    const categorized = await this.categorizeFiles(files);

    // Preventive cleanup strategy
    const actions = [];

    // 1. Limit problems files to reasonable number
    if (categorized.problems.length > this.config.maxProblemsFiles) {
      const excess = categorized.problems.length - this.config.maxProblemsFiles;
      const oldest = categorized.problems
        .sort((a, b) => a.mtime - b.mtime)
        .slice(0, excess);
      
      actions.push({
        type: 'remove_excess_problems',
        files: oldest,
        reason: `Exceeded max problems files (${this.config.maxProblemsFiles})`
      });
    }

    // 2. Archive large session logs
    const largeSessionLogs = categorized.sessions.filter(f => f.size > 1024 * 1024); // 1MB+
    if (largeSessionLogs.length > 0) {
      actions.push({
        type: 'archive_large_sessions',
        files: largeSessionLogs,
        reason: 'Session logs exceeding size threshold'
      });
    }

    // Execute actions
    for (const action of actions) {
      await this.executeCleanupAction(action);
    }

    return {
      actionsExecuted: actions.length,
      stats: this.stats
    };
  }

  async executeCleanupAction(action) {
    switch (action.type) {
      case 'remove_excess_problems':
        for (const file of action.files) {
          if (!this.config.dryRun) {
            await fs.unlink(file.path);
          }
          this.stats.filesRemoved++;
          this.stats.sizeReclaimed += file.size;
          
          if (this.config.verbose) {
            console.log(`🗑️  ${action.reason}: ${file.name}`);
          }
        }
        break;

      case 'archive_large_sessions':
        for (const file of action.files) {
          const archivePath = path.join(this.logDir, 'archive', file.name);
          if (!this.config.dryRun) {
            await fs.mkdir(path.dirname(archivePath), { recursive: true });
            await fs.rename(file.path, archivePath);
          }
          
          if (this.config.verbose) {
            console.log(`📦 Archived: ${file.name}`);
          }
        }
        break;
    }
  }

  async installPreventionMechanisms() {
    console.log('🛡️  Installing prevention mechanisms...');

    // Create watcher script for real-time monitoring (without chokidar dependency)
    const watcherScript = `#!/usr/bin/env node

/**
 * Session Log Watcher - Native file monitoring without external dependencies
 * Monitors for rapid problems file generation and triggers emergency cleanup
 */

const fs = require('fs');
const path = require('path');
const SessionLogGuardian = require('./session-log-guardian.js');

const guardian = new SessionLogGuardian('${this.logDir}', {
  maxProblemsFiles: ${this.config.maxProblemsFiles},
  emergencyCleanup: true,
  verbose: true
});

let recentFiles = [];
let lastScanTime = Date.now();

function monitorDirectory() {
  const logDir = '${this.logDir}';
  
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
      console.log(\`📊 \${newFiles.length} new problems files detected\`);
    }
    
    // Keep only files from last 5 minutes
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000;
    recentFiles = recentFiles.filter(f => f.time > fiveMinutesAgo);
    
    // Check for bulk-up condition
    if (recentFiles.length > 10) {
      console.log(\`🚨 Rapid file generation detected! \${recentFiles.length} files in 5 minutes\`);
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
console.log(\`📁 Monitoring: \${guardian.logDir}\`);

setInterval(monitorDirectory, 30000);
monitorDirectory(); // Initial scan

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n🛑 Guardian watcher stopped');
  process.exit(0);
});
`;

    const watcherPath = path.join('scripts', 'session-log-watcher.js');
    if (!this.config.dryRun) {
      await fs.writeFile(watcherPath, watcherScript);
    }

    // Create scheduled cleanup task
    const scheduledTask = {
      label: "Guardian: Session Log Cleanup",
      type: "shell",
      command: "node scripts/session-log-guardian.js --cleanup",
      options: { cwd: "${workspaceFolder}" },
      problemMatcher: [],
      runOptions: { runOn: "folderOpen" }
    };

    console.log('✅ Prevention mechanisms installed');
    return { watcher: watcherPath, task: scheduledTask };
  }

  getStats() {
    return {
      ...this.stats,
      config: this.config,
      timestamp: new Date().toISOString()
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const logDir = args.find(arg => !arg.startsWith('--')) || 'docs/session-log';
  
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    emergencyCleanup: args.includes('--emergency-cleanup'),
    analyze: args.includes('--analyze'),
    cleanup: args.includes('--cleanup'),
    install: args.includes('--install'),
    schedule: args.includes('--schedule')
  };

  const guardian = new SessionLogGuardian(logDir, options);

  async function main() {
    try {
      if (options.emergencyCleanup) {
        const result = await guardian.emergencyCleanup();
        console.log('\n📊 Emergency cleanup result:', result);
      } else if (options.cleanup) {
        const result = await guardian.preventiveCleanup();
        console.log('\n📊 Preventive cleanup result:', result);
      } else if (options.install) {
        const result = await guardian.installPreventionMechanisms();
        console.log('\n📊 Prevention mechanisms:', result);
      } else if (options.analyze) {
        const analysis = await guardian.analyze();
        console.log('\n📊 ANALYSIS REPORT:');
        console.log(JSON.stringify(analysis, null, 2));
      } else {
        console.log(`
🛡️  Session Log Guardian Usage:

node session-log-guardian.js [options] [log-directory]

Options:
  --analyze              Analyze current state and risks
  --emergency-cleanup    Run emergency cleanup (removes bulk files)
  --cleanup             Run preventive cleanup
  --install             Install prevention mechanisms
  --dry-run             Show what would be done without doing it
  --verbose             Show detailed output

Examples:
  node session-log-guardian.js --analyze
  node session-log-guardian.js --emergency-cleanup --dry-run
  node session-log-guardian.js --cleanup docs/session-log
        `);
      }

      console.log('\n📈 Guardian stats:', guardian.getStats());

    } catch (error) {
      console.error('❌ Guardian error:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = SessionLogGuardian;