#!/usr/bin/env node

/**
 * MULTI-AGENT FILE READER
 * Unified tool for GPT-5, Gemini CLI, and Claude Code to read and analyze files
 * Supports: batch reading, intelligent chunking, context-aware summaries
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class MultiAgentFileReader {
  constructor(options = {}) {
    this.options = {
      maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB default
      chunkSize: options.chunkSize || 50000, // 50KB chunks
      includeMetadata: options.includeMetadata !== false,
      generateSummaries: options.generateSummaries !== false,
      contextWindow: options.contextWindow || 10, // lines before/after for context
      ...options,
    };

    this.cache = new Map();
    this.stats = {
      filesRead: 0,
      totalSize: 0,
      cacheHits: 0,
      errors: [],
    };
  }

  async readFile(filePath, options = {}) {
    const absolutePath = path.resolve(filePath);
    const cacheKey = this.generateCacheKey(absolutePath, options);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.cache.get(cacheKey);
    }

    try {
      const stats = await fs.stat(absolutePath);

      if (stats.size > this.options.maxFileSize) {
        return this.readLargeFile(absolutePath, options);
      }

      const content = await fs.readFile(absolutePath, 'utf-8');
      const result = await this.processFileContent(absolutePath, content, stats, options);

      // Cache the result
      this.cache.set(cacheKey, result);
      this.stats.filesRead++;
      this.stats.totalSize += stats.size;

      return result;
    } catch (error) {
      const errorResult = {
        path: absolutePath,
        error: error.message,
        readable: false,
        timestamp: new Date().toISOString(),
      };

      this.stats.errors.push(errorResult);
      return errorResult;
    }
  }

  async readMultipleFiles(filePaths, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 10;

    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const batchPromises = batch.map((filePath) => this.readFile(filePath, options));
      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            error: result.reason.message,
            readable: false,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return results;
  }

  async readDirectoryContents(dirPath, options = {}) {
    const filters = {
      extensions: options.extensions || [
        '.js',
        '.ts',
        '.tsx',
        '.jsx',
        '.json',
        '.md',
        '.yml',
        '.yaml',
        '.ps1',
      ],
      ignore: options.ignore || ['node_modules', '.git', 'dist', '.pnpm'],
      maxDepth: options.maxDepth || 5,
      ...options.filters,
    };

    const files = await this.findFiles(dirPath, filters);
    return this.readMultipleFiles(files, options);
  }

  async findFiles(dirPath, filters, currentDepth = 0) {
    if (currentDepth > filters.maxDepth) return [];

    const files = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (!filters.ignore.some((pattern) => entry.name.includes(pattern))) {
            const subFiles = await this.findFiles(fullPath, filters, currentDepth + 1);
            files.push(...subFiles);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (filters.extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      this.stats.errors.push({
        path: dirPath,
        error: error.message,
        type: 'directory_scan',
      });
    }

    return files;
  }

  async readLargeFile(filePath, options = {}) {
    const stats = await fs.stat(filePath);
    const chunkSize = options.chunkSize || this.options.chunkSize;
    const maxChunks = Math.ceil(stats.size / chunkSize);

    // For very large files, read strategically
    const strategy = options.strategy || 'smart_sample';

    switch (strategy) {
      case 'head_tail':
        return this.readHeadTail(filePath, chunkSize);
      case 'smart_sample':
        return this.readSmartSample(filePath, chunkSize);
      case 'chunked':
        return this.readChunked(filePath, chunkSize, options.maxChunks || 10);
      default:
        return this.readSmartSample(filePath, chunkSize);
    }
  }

  async readHeadTail(filePath, chunkSize) {
    const fd = await fs.open(filePath, 'r');
    const stats = await fd.stat();

    try {
      // Read beginning
      const headBuffer = Buffer.alloc(Math.min(chunkSize, stats.size));
      await fd.read(headBuffer, 0, headBuffer.length, 0);
      const head = headBuffer.toString('utf-8');

      // Read end if file is large enough
      let tail = '';
      if (stats.size > chunkSize * 2) {
        const tailBuffer = Buffer.alloc(chunkSize);
        await fd.read(tailBuffer, 0, tailBuffer.length, stats.size - chunkSize);
        tail = tailBuffer.toString('utf-8');
      }

      return {
        path: filePath,
        type: 'large_file_head_tail',
        size: stats.size,
        readable: true,
        content: {
          head,
          tail,
          truncated: stats.size > chunkSize * 2,
        },
        metadata: await this.generateMetadata(filePath, head + tail),
        timestamp: new Date().toISOString(),
      };
    } finally {
      await fd.close();
    }
  }

  async readSmartSample(filePath, chunkSize) {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Smart sampling: beginning, middle sections, end
    const totalLines = lines.length;
    const sampleSize = Math.min(200, Math.floor(totalLines * 0.1));

    const samples = [
      ...lines.slice(0, sampleSize / 3), // Beginning
      ...lines.slice(Math.floor(totalLines * 0.4), Math.floor(totalLines * 0.4) + sampleSize / 3), // Middle
      ...lines.slice(Math.floor(totalLines * 0.8), Math.floor(totalLines * 0.8) + sampleSize / 3), // End
    ];

    const sampledContent = samples.join('\n');

    return {
      path: filePath,
      type: 'large_file_smart_sample',
      size: content.length,
      readable: true,
      content: sampledContent,
      metadata: {
        totalLines,
        sampledLines: samples.length,
        sampleRatio: samples.length / totalLines,
        ...(await this.generateMetadata(filePath, sampledContent)),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async processFileContent(filePath, content, stats, options = {}) {
    const result = {
      path: filePath,
      type: this.getFileType(filePath),
      size: stats.size,
      readable: true,
      content,
      timestamp: new Date().toISOString(),
    };

    if (this.options.includeMetadata) {
      result.metadata = await this.generateMetadata(filePath, content);
    }

    if (this.options.generateSummaries && content.length > 1000) {
      result.summary = this.generateSummary(content, this.getFileType(filePath));
    }

    return result;
  }

  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript_react',
      '.jsx': 'javascript_react',
      '.json': 'json',
      '.md': 'markdown',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.ps1': 'powershell',
      '.sh': 'shell',
      '.py': 'python',
      '.go': 'go',
      '.rs': 'rust',
    };

    return typeMap[ext] || 'text';
  }

  async generateMetadata(filePath, content) {
    const lines = content.split('\n');
    const metadata = {
      lineCount: lines.length,
      characterCount: content.length,
      hash: crypto.createHash('md5').update(content).digest('hex'),
      encoding: 'utf-8',
    };

    // Type-specific metadata
    const fileType = this.getFileType(filePath);

    switch (fileType) {
      case 'javascript':
      case 'typescript':
        metadata.functions = this.countMatches(content, /function\s+\w+|const\s+\w+\s*=\s*\(/g);
        metadata.imports = this.countMatches(content, /import\s+.*from|require\(/g);
        metadata.exports = this.countMatches(content, /export\s+/g);
        break;

      case 'json':
        try {
          const parsed = JSON.parse(content);
          metadata.jsonValid = true;
          metadata.topLevelKeys = Array.isArray(parsed)
            ? parsed.length
            : Object.keys(parsed).length;
        } catch {
          metadata.jsonValid = false;
        }
        break;

      case 'markdown':
        metadata.headers = this.countMatches(content, /^#+\s+/gm);
        metadata.codeBlocks = this.countMatches(content, /```/g) / 2;
        metadata.links = this.countMatches(content, /\[.*\]\(.*\)/g);
        break;
    }

    return metadata;
  }

  generateSummary(content, fileType) {
    const lines = content.split('\n');
    const firstLines = lines.slice(0, 5);
    const lastLines = lines.slice(-3);

    const summary = {
      type: fileType,
      preview: firstLines.join('\n'),
      structure: this.analyzeStructure(content, fileType),
      keyElements: this.extractKeyElements(content, fileType),
    };

    return summary;
  }

  analyzeStructure(content, fileType) {
    switch (fileType) {
      case 'javascript':
      case 'typescript':
        return {
          hasDefaultExport: content.includes('export default'),
          hasNamedExports: /export\s+(?:const|function|class)/.test(content),
          isModule: content.includes('import') || content.includes('export'),
          asyncFunctions: this.countMatches(content, /async\s+function|async\s+\w+\s*=>/g),
        };

      case 'json':
        try {
          const parsed = JSON.parse(content);
          return {
            isArray: Array.isArray(parsed),
            nestingDepth: this.calculateNestingDepth(parsed),
            hasNullValues: JSON.stringify(parsed).includes('null'),
          };
        } catch {
          return { malformed: true };
        }

      default:
        return { analyzed: false };
    }
  }

  extractKeyElements(content, fileType) {
    const elements = [];

    switch (fileType) {
      case 'javascript':
      case 'typescript':
        // Extract function names
        const functions = content.match(
          /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\w+))/g
        );
        if (functions) elements.push(...functions);

        // Extract class names
        const classes = content.match(/class\s+(\w+)/g);
        if (classes) elements.push(...classes);
        break;

      case 'markdown':
        // Extract headers
        const headers = content.match(/^#+\s+(.+)$/gm);
        if (headers) elements.push(...headers.slice(0, 10)); // First 10 headers
        break;
    }

    return elements.slice(0, 20); // Limit to 20 elements
  }

  countMatches(content, regex) {
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }

  calculateNestingDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) return depth;

    if (Array.isArray(obj)) {
      return Math.max(depth, ...obj.map((item) => this.calculateNestingDepth(item, depth + 1)));
    }

    return Math.max(
      depth,
      ...Object.values(obj).map((value) => this.calculateNestingDepth(value, depth + 1))
    );
  }

  generateCacheKey(filePath, options) {
    return crypto
      .createHash('md5')
      .update(filePath + JSON.stringify(options))
      .digest('hex');
  }

  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      memoryUsage: process.memoryUsage(),
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🔍 Multi-Agent File Reader Usage:

node multi-agent-file-reader.js <command> [options]

Commands:
  file <path>                 Read a single file
  files <path1> <path2>...   Read multiple files
  dir <path>                 Read all files in directory
  scan <path>                Deep scan with summaries

Examples:
  node multi-agent-file-reader.js file package.json
  node multi-agent-file-reader.js dir packages/core/src
  node multi-agent-file-reader.js scan . --extensions .ts,.js,.md
    `);
    process.exit(0);
  }

  const command = args[0];
  const reader = new MultiAgentFileReader({
    generateSummaries: args.includes('--summaries'),
    includeMetadata: !args.includes('--no-metadata'),
  });

  async function executeCommand() {
    try {
      let result;

      switch (command) {
        case 'file':
          result = await reader.readFile(args[1]);
          break;

        case 'files':
          result = await reader.readMultipleFiles(args.slice(1));
          break;

        case 'dir':
          const options = {
            extensions: args.includes('--extensions')
              ? args[args.indexOf('--extensions') + 1].split(',')
              : undefined,
          };
          result = await reader.readDirectoryContents(args[1], options);
          break;

        case 'scan':
          const scanOptions = {
            generateSummaries: true,
            includeMetadata: true,
            extensions: args.includes('--extensions')
              ? args[args.indexOf('--extensions') + 1].split(',')
              : undefined,
          };
          result = await reader.readDirectoryContents(args[1], scanOptions);
          break;

        default:
          throw new Error(`Unknown command: ${command}`);
      }

      console.log(JSON.stringify(result, null, 2));
      console.error('\n📊 Stats:', reader.getStats());
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }

  executeCommand();
}

module.exports = MultiAgentFileReader;
