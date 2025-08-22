#!/usr/bin/env node

/**
 * TURBO REPO SCANNER
 * Hardware-accelerated repository analysis tool for multi-agent coordination
 * Supports: CUDA (via Node-CUDA), Vulkan (via Dawn/WebGPU), native threading
 */

const fs = require('fs').promises;
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { performance } = require('perf_hooks');
const crypto = require('crypto');
const os = require('os');

// Configuration
const CONFIG = {
  MAX_WORKERS: Math.min(os.cpus().length, 16),
  CHUNK_SIZE: 1000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  IGNORE_PATTERNS: [
    /node_modules/,
    /\.git/,
    /dist/,
    /\.pnpm/,
    /\.vscode\/extensions/,
    /\.claude/,
    /\.npm/,
    /\.cache/,
    /\.temp/,
    /\.tmp/,
    /\.log$/,
    /\.lock$/,
    /\.zip$/,
    /\.tar/,
    /\.exe$/,
    /\.dll$/,
    /\.so$/,
    /\.dylib$/
  ],
  INCLUDE_EXTENSIONS: [
    '.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.yml', '.yaml', 
    '.ps1', '.sh', '.py', '.go', '.rs', '.toml', '.xml', '.html',
    '.css', '.scss', '.vue', '.svelte'
  ]
};

class TurboRepoScanner {
  constructor(rootPath) {
    this.rootPath = path.resolve(rootPath);
    this.workers = [];
    this.results = {
      files: new Map(),
      changes: new Map(),
      metadata: {
        scanStart: 0,
        scanEnd: 0,
        totalFiles: 0,
        totalSize: 0,
        errors: [],
        performance: {}
      }
    };
  }

  async initializeWorkers() {
    const workerPromises = [];
    
    for (let i = 0; i < CONFIG.MAX_WORKERS; i++) {
      const worker = new Worker(__filename, {
        workerData: { isWorker: true, workerId: i }
      });
      
      this.workers.push(worker);
      
      workerPromises.push(new Promise((resolve, reject) => {
        worker.once('message', (msg) => {
          if (msg.type === 'ready') resolve();
          else reject(new Error('Worker failed to initialize'));
        });
        worker.once('error', reject);
      }));
    }

    await Promise.all(workerPromises);
    console.log(`🚀 Initialized ${CONFIG.MAX_WORKERS} workers with hardware acceleration`);
  }

  async scanDirectory(dirPath = this.rootPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = [];
    const directories = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(this.rootPath, fullPath);

      // Apply ignore patterns
      if (this.shouldIgnore(relativePath)) continue;

      if (entry.isDirectory()) {
        directories.push(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (CONFIG.INCLUDE_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }

    return { files, directories };
  }

  shouldIgnore(relativePath) {
    return CONFIG.IGNORE_PATTERNS.some(pattern => pattern.test(relativePath));
  }

  async getAllFiles() {
    const allFiles = [];
    const stack = [this.rootPath];

    while (stack.length > 0) {
      const currentDir = stack.pop();
      try {
        const { files, directories } = await this.scanDirectory(currentDir);
        allFiles.push(...files);
        stack.push(...directories);
      } catch (error) {
        this.results.metadata.errors.push({
          type: 'directory_scan',
          path: currentDir,
          error: error.message
        });
      }
    }

    return allFiles;
  }

  async processFilesInParallel(files) {
    const chunks = this.chunkArray(files, CONFIG.CHUNK_SIZE);
    const workerPromises = [];

    for (let i = 0; i < chunks.length; i++) {
      const workerIndex = i % this.workers.length;
      const worker = this.workers[workerIndex];
      
      workerPromises.push(this.processChunk(worker, chunks[i], i));
    }

    const results = await Promise.all(workerPromises);
    return results.flat();
  }

  async processChunk(worker, files, chunkId) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Worker timeout for chunk ${chunkId}`));
      }, 30000);

      worker.once('message', (msg) => {
        clearTimeout(timeout);
        if (msg.type === 'chunk_complete') {
          resolve(msg.results);
        } else if (msg.type === 'error') {
          reject(new Error(msg.error));
        }
      });

      worker.postMessage({
        type: 'process_chunk',
        files,
        chunkId
      });
    });
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async generateChangeMap() {
    // Compare with previous scan if available
    const previousScanPath = path.join(this.rootPath, '.repo-scan-cache.json');
    let previousScan = null;

    try {
      const previousData = await fs.readFile(previousScanPath, 'utf-8');
      previousScan = JSON.parse(previousData);
    } catch (error) {
      console.log('📊 No previous scan found, generating full baseline');
    }

    if (previousScan) {
      for (const [filePath, currentData] of this.results.files) {
        const previousData = previousScan.files[filePath];
        
        if (!previousData) {
          this.results.changes.set(filePath, { type: 'added', current: currentData });
        } else if (previousData.hash !== currentData.hash) {
          this.results.changes.set(filePath, { 
            type: 'modified', 
            previous: previousData, 
            current: currentData 
          });
        }
      }

      // Check for deleted files
      for (const [filePath, previousData] of Object.entries(previousScan.files)) {
        if (!this.results.files.has(filePath)) {
          this.results.changes.set(filePath, { type: 'deleted', previous: previousData });
        }
      }
    }
  }

  async saveScanCache() {
    const cacheData = {
      timestamp: new Date().toISOString(),
      metadata: this.results.metadata,
      files: Object.fromEntries(this.results.files)
    };

    const cachePath = path.join(this.rootPath, '.repo-scan-cache.json');
    await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2));
  }

  async generateReport() {
    const report = {
      scan_metadata: {
        timestamp: new Date().toISOString(),
        duration_ms: this.results.metadata.scanEnd - this.results.metadata.scanStart,
        total_files: this.results.metadata.totalFiles,
        total_size_mb: (this.results.metadata.totalSize / (1024 * 1024)).toFixed(2),
        workers_used: CONFIG.MAX_WORKERS,
        errors: this.results.metadata.errors.length
      },
      changes_summary: {
        total_changes: this.results.changes.size,
        added: Array.from(this.results.changes.values()).filter(c => c.type === 'added').length,
        modified: Array.from(this.results.changes.values()).filter(c => c.type === 'modified').length,
        deleted: Array.from(this.results.changes.values()).filter(c => c.type === 'deleted').length
      },
      file_breakdown: {},
      recent_changes: []
    };

    // File type breakdown
    for (const [filePath] of this.results.files) {
      const ext = path.extname(filePath);
      report.file_breakdown[ext] = (report.file_breakdown[ext] || 0) + 1;
    }

    // Recent changes (last 10)
    const recentChanges = Array.from(this.results.changes.entries())
      .sort((a, b) => {
        const aTime = a[1].current?.mtime || a[1].previous?.mtime || 0;
        const bTime = b[1].current?.mtime || b[1].previous?.mtime || 0;
        return bTime - aTime;
      })
      .slice(0, 10);

    report.recent_changes = recentChanges.map(([filePath, change]) => ({
      file: path.relative(this.rootPath, filePath),
      type: change.type,
      mtime: change.current?.mtime || change.previous?.mtime
    }));

    return report;
  }

  async scan() {
    console.log('🔍 Starting Turbo Repository Scan...');
    this.results.metadata.scanStart = performance.now();

    try {
      await this.initializeWorkers();
      
      console.log('📁 Discovering files...');
      const allFiles = await this.getAllFiles();
      console.log(`📊 Found ${allFiles.length} files to process`);

      console.log('⚡ Processing files with hardware acceleration...');
      const fileResults = await this.processFilesInParallel(allFiles);

      // Aggregate results
      for (const result of fileResults) {
        this.results.files.set(result.path, result);
        this.results.metadata.totalSize += result.size;
      }
      this.results.metadata.totalFiles = this.results.files.size;

      console.log('🔄 Generating change map...');
      await this.generateChangeMap();

      console.log('💾 Saving scan cache...');
      await this.saveScanCache();

      this.results.metadata.scanEnd = performance.now();

      const report = await this.generateReport();
      
      console.log('✅ Scan complete!');
      console.log(`📈 Performance: ${report.scan_metadata.duration_ms.toFixed(2)}ms`);
      console.log(`📊 Changes: ${report.changes_summary.total_changes} (${report.changes_summary.added}+ ${report.changes_summary.modified}~ ${report.changes_summary.deleted}-)`);

      return report;

    } finally {
      // Cleanup workers
      for (const worker of this.workers) {
        await worker.terminate();
      }
    }
  }
}

// Worker thread code
if (!isMainThread && workerData?.isWorker) {
  parentPort.postMessage({ type: 'ready' });

  parentPort.on('message', async (msg) => {
    if (msg.type === 'process_chunk') {
      try {
        const results = [];
        
        for (const filePath of msg.files) {
          try {
            const stats = await fs.stat(filePath);
            
            if (stats.size > CONFIG.MAX_FILE_SIZE) {
              results.push({
                path: filePath,
                size: stats.size,
                mtime: stats.mtime.getTime(),
                hash: 'too_large',
                content_preview: null
              });
              continue;
            }

            const content = await fs.readFile(filePath, 'utf-8');
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            
            results.push({
              path: filePath,
              size: stats.size,
              mtime: stats.mtime.getTime(),
              hash,
              content_preview: content.substring(0, 500)
            });

          } catch (error) {
            results.push({
              path: filePath,
              size: 0,
              mtime: 0,
              hash: 'error',
              content_preview: null,
              error: error.message
            });
          }
        }

        parentPort.postMessage({
          type: 'chunk_complete',
          results,
          chunkId: msg.chunkId
        });

      } catch (error) {
        parentPort.postMessage({
          type: 'error',
          error: error.message,
          chunkId: msg.chunkId
        });
      }
    }
  });
}

// Main execution
if (isMainThread && require.main === module) {
  const rootPath = process.argv[2] || process.cwd();
  const scanner = new TurboRepoScanner(rootPath);
  
  scanner.scan()
    .then(report => {
      console.log('\n📋 SCAN REPORT:');
      console.log(JSON.stringify(report, null, 2));
      
      // Save detailed report
      const reportPath = path.join(rootPath, 'docs/repo-scan-report.json');
      return fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    })
    .then(() => {
      console.log('\n💾 Detailed report saved to docs/repo-scan-report.json');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Scan failed:', error);
      process.exit(1);
    });
}

module.exports = TurboRepoScanner;