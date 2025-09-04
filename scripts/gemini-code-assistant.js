#!/usr/bin/env node

/**
 * Gemini Code Assistant - VS Code Extension Style Integration
 *
 * This provides IDE-like code assistance functionality similar to
 * Google's Code Assist and other modern AI coding assistants.
 *
 * Features:
 * - Real-time code suggestions
 * - Context-aware completions
 * - Inline code explanations
 * - Refactoring suggestions
 * - Error detection and fixes
 *
 * @author AI Collaboration Framework
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createInterface } = require('readline');

class GeminiCodeAssistant {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    this.model = null;
    this.conversationHistory = [];
    this.contextWindow = [];
    this.activeFiles = new Map();

    // Assistant configuration
    this.config = {
      model: 'gemini-pro',
      maxContextLines: 100,
      suggestionMode: 'inline', // 'inline' | 'popup' | 'sidebar'
      autoSave: true,
      realTimeAnalysis: true,
      errorDetection: true,
      performance: 'balanced', // 'fast' | 'balanced' | 'thorough'
    };
  }

  /**
   * Initialize Code Assistant
   */
  async initialize() {
    console.log('👨‍💻 Gemini Code Assistant v1.0.0');
    console.log('🚀 IDE-Style AI Coding Companion');
    console.log('='.repeat(50));

    if (!this.apiKey) {
      console.log('⚠️  GOOGLE_API_KEY not configured');
      console.log('🔧 Running in offline mode with limited features\n');
      return this;
    }

    try {
      this.model = this.genAI.getGenerativeModel({
        model: this.config.model,
        generationConfig: {
          temperature: 0.3, // Lower for more consistent code suggestions
          maxOutputTokens: 2048,
        },
      });

      console.log('✅ Gemini Code Assistant connected');
      console.log(`📊 Model: ${this.config.model}`);
      console.log(`⚡ Mode: ${this.config.performance}\n`);
    } catch (error) {
      console.log('❌ Failed to initialize Gemini API:', error.message);
    }

    return this;
  }

  /**
   * Start interactive coding session
   */
  async startCodingSession() {
    console.log('🔨 Starting Interactive Coding Session');
    console.log('💡 Commands: help, load <file>, save <file>, analyze, suggest, refactor, exit\n');

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🤖 gemini> ',
    });

    return new Promise((resolve) => {
      rl.prompt();

      rl.on('line', async (input) => {
        const trimmed = input.trim();

        if (trimmed === 'exit' || trimmed === 'quit') {
          console.log('👋 Goodbye! Code well!');
          rl.close();
          resolve();
          return;
        }

        await this.processCommand(trimmed);
        rl.prompt();
      });

      rl.on('close', () => {
        resolve();
      });
    });
  }

  /**
   * Process interactive commands
   */
  async processCommand(command) {
    const [cmd, ...args] = command.split(' ');
    const argument = args.join(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        this.showSessionHelp();
        break;

      case 'load':
        await this.loadFile(argument);
        break;

      case 'save':
        await this.saveCurrentFile(argument);
        break;

      case 'analyze':
        await this.analyzeCurrentCode();
        break;

      case 'suggest':
        await this.provideSuggestions(argument);
        break;

      case 'complete':
        await this.completeCode(argument);
        break;

      case 'refactor':
        await this.refactorCode(argument);
        break;

      case 'explain':
        await this.explainCode(argument);
        break;

      case 'fix':
        await this.fixErrors();
        break;

      case 'optimize':
        await this.optimizeCode();
        break;

      case 'test':
        await this.generateTests();
        break;

      case 'docs':
        await this.generateDocumentation();
        break;

      case 'status':
        this.showStatus();
        break;

      case 'context':
        this.showContext();
        break;

      default:
        if (command.trim()) {
          // Treat as natural language request
          await this.handleNaturalLanguageRequest(command);
        }
        break;
    }
  }

  /**
   * Show session help
   */
  showSessionHelp() {
    console.log(`
📚 Gemini Code Assistant Commands:

FILE OPERATIONS:
  load <file>          Load file into assistant context
  save <file>          Save current work to file
  status               Show current file and context status

CODE ASSISTANCE:
  analyze              Analyze current code for issues
  suggest [context]    Get code suggestions
  complete [partial]   Complete partial code
  refactor [scope]     Suggest refactoring improvements
  explain [selection]  Explain code functionality
  fix                  Fix detected errors
  optimize             Optimize code performance

GENERATION:
  test                 Generate tests for current code
  docs                 Generate documentation
  
CONTEXT:
  context              Show current context window
  
NATURAL LANGUAGE:
  "Create a function that..." - Describe what you want in plain English
  
EXAMPLES:
  load src/app.js
  analyze
  "Add error handling to this function"
  complete "function calculate"
  refactor "make this more efficient"
  test
        `);
  }

  /**
   * Load file into context
   */
  async loadFile(filePath) {
    if (!filePath) {
      console.log('❌ Please specify a file path');
      return;
    }

    try {
      const fullPath = path.resolve(filePath);
      const content = await fs.readFile(fullPath, 'utf8');
      const fileName = path.basename(fullPath);

      this.activeFiles.set('current', {
        path: fullPath,
        name: fileName,
        content: content,
        lines: content.split('\n'),
        language: this.detectLanguage(fullPath),
        lastModified: new Date(),
      });

      this.updateContext(content);

      console.log(`✅ Loaded: ${fileName}`);
      console.log(`📊 Lines: ${content.split('\n').length}`);
      console.log(`🔧 Language: ${this.detectLanguage(fullPath)}`);
      console.log(`💾 Size: ${content.length} characters\n`);

      // Auto-analyze if enabled
      if (this.config.realTimeAnalysis) {
        await this.analyzeCurrentCode();
      }
    } catch (error) {
      console.log(`❌ Error loading file: ${error.message}`);
    }
  }

  /**
   * Detect programming language from file extension
   */
  detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React JSX',
      '.tsx': 'React TSX',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.kt': 'Kotlin',
      '.swift': 'Swift',
      '.html': 'HTML',
      '.css': 'CSS',
      '.scss': 'SCSS',
      '.json': 'JSON',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.md': 'Markdown',
      '.sh': 'Shell',
      '.bash': 'Bash',
    };

    return languageMap[ext] || 'Unknown';
  }

  /**
   * Update context window
   */
  updateContext(content) {
    const lines = content.split('\n');
    this.contextWindow = lines.slice(-this.config.maxContextLines);
  }

  /**
   * Analyze current code
   */
  async analyzeCurrentCode() {
    const currentFile = this.activeFiles.get('current');
    if (!currentFile) {
      console.log('❌ No file loaded. Use "load <file>" first.');
      return;
    }

    console.log('🔍 Analyzing code...\n');

    if (!this.model) {
      // Offline analysis
      this.performOfflineAnalysis(currentFile);
      return;
    }

    try {
      const prompt = `Analyze this ${currentFile.language} code for:
1. Code quality and structure
2. Potential bugs or issues  
3. Performance optimizations
4. Best practices compliance
5. Security considerations

Code:
\`\`\`${currentFile.language.toLowerCase()}
${currentFile.content}
\`\`\`

Provide specific, actionable feedback.`;

      const result = await this.model.generateContent(prompt);
      const analysis = result.response.text();

      console.log('📊 Code Analysis Results:');
      console.log('='.repeat(30));
      console.log(analysis);
      console.log();
    } catch (error) {
      console.log(`❌ Analysis failed: ${error.message}`);
    }
  }

  /**
   * Offline code analysis
   */
  performOfflineAnalysis(file) {
    console.log('🔧 Offline Analysis Results:');
    console.log('='.repeat(30));

    const issues = [];
    const suggestions = [];

    // Basic static analysis
    if (file.language === 'JavaScript' || file.language === 'TypeScript') {
      if (file.content.includes('var ')) {
        issues.push('🟡 Use const/let instead of var');
      }
      if (file.content.includes('==') && !file.content.includes('===')) {
        issues.push('🟡 Use strict equality (===) instead of ==');
      }
      if (file.content.includes('console.log')) {
        suggestions.push('💡 Remove console.log statements before production');
      }
    }

    // General analysis
    const longLines = file.lines.filter((line, index) => {
      if (line.length > 120) {
        issues.push(`🟡 Line ${index + 1}: Line too long (${line.length} chars)`);
        return true;
      }
      return false;
    });

    if (file.content.split('TODO').length > 1) {
      suggestions.push('📝 TODO comments found - consider addressing them');
    }

    if (issues.length === 0 && suggestions.length === 0) {
      console.log('✅ No obvious issues detected');
    } else {
      if (issues.length > 0) {
        console.log('⚠️  Issues Found:');
        issues.forEach((issue) => console.log(`  ${issue}`));
      }
      if (suggestions.length > 0) {
        console.log('\n💡 Suggestions:');
        suggestions.forEach((suggestion) => console.log(`  ${suggestion}`));
      }
    }
    console.log();
  }

  /**
   * Provide code suggestions
   */
  async provideSuggestions(context = '') {
    const currentFile = this.activeFiles.get('current');
    if (!currentFile) {
      console.log('❌ No file loaded. Use "load <file>" first.');
      return;
    }

    if (!this.model) {
      console.log('💡 Suggestions require GOOGLE_API_KEY for AI assistance');
      return;
    }

    console.log('💭 Generating suggestions...\n');

    try {
      const prompt = `Provide specific improvement suggestions for this ${currentFile.language} code.
            
${context ? `Focus on: ${context}` : 'General improvements'}

Code:
\`\`\`${currentFile.language.toLowerCase()}
${currentFile.content}
\`\`\`

Provide 3-5 specific, actionable suggestions with code examples where helpful.`;

      const result = await this.model.generateContent(prompt);
      const suggestions = result.response.text();

      console.log('💡 Code Suggestions:');
      console.log('='.repeat(20));
      console.log(suggestions);
      console.log();
    } catch (error) {
      console.log(`❌ Suggestion generation failed: ${error.message}`);
    }
  }

  /**
   * Complete partial code
   */
  async completeCode(partial) {
    if (!this.model) {
      console.log('💡 Code completion requires GOOGLE_API_KEY');
      return;
    }

    const currentFile = this.activeFiles.get('current');
    const language = currentFile ? currentFile.language : 'JavaScript';

    console.log('⌨️  Completing code...\n');

    try {
      const prompt = `Complete this ${language} code snippet:

\`\`\`${language.toLowerCase()}
${partial}
\`\`\`

${
  currentFile
    ? `Context from current file:
\`\`\`${language.toLowerCase()}
${this.contextWindow.slice(-20).join('\n')}
\`\`\``
    : ''
}

Provide a natural, well-structured completion.`;

      const result = await this.model.generateContent(prompt);
      const completion = result.response.text();

      console.log('✨ Code Completion:');
      console.log('='.repeat(20));
      console.log(completion);
      console.log();
    } catch (error) {
      console.log(`❌ Code completion failed: ${error.message}`);
    }
  }

  /**
   * Handle natural language requests
   */
  async handleNaturalLanguageRequest(request) {
    if (!this.model) {
      console.log('💡 Natural language requests require GOOGLE_API_KEY');
      return;
    }

    const currentFile = this.activeFiles.get('current');
    console.log(`🗣️  Processing: "${request}"\n`);

    try {
      let prompt = `User request: "${request}"\n\n`;

      if (currentFile) {
        prompt += `Current ${currentFile.language} file context:
\`\`\`${currentFile.language.toLowerCase()}
${this.contextWindow.slice(-30).join('\n')}
\`\`\`\n\n`;
      }

      prompt += `Please provide helpful code, explanations, or suggestions based on this request.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      console.log('🤖 Assistant Response:');
      console.log('='.repeat(22));
      console.log(response);
      console.log();
    } catch (error) {
      console.log(`❌ Request processing failed: ${error.message}`);
    }
  }

  /**
   * Show current status
   */
  showStatus() {
    const currentFile = this.activeFiles.get('current');

    console.log('📊 Code Assistant Status:');
    console.log('='.repeat(25));

    if (currentFile) {
      console.log(`📁 File: ${currentFile.name}`);
      console.log(`📍 Path: ${currentFile.path}`);
      console.log(`🔧 Language: ${currentFile.language}`);
      console.log(`📏 Lines: ${currentFile.lines.length}`);
      console.log(`💾 Size: ${currentFile.content.length} characters`);
      console.log(`🕐 Loaded: ${currentFile.lastModified.toLocaleTimeString()}`);
    } else {
      console.log('📁 No file currently loaded');
    }

    console.log(`🤖 API: ${this.model ? 'Connected' : 'Offline'}`);
    console.log(`⚡ Mode: ${this.config.performance}`);
    console.log(`🧠 Context: ${this.contextWindow.length} lines`);
    console.log();
  }

  /**
   * Show context window
   */
  showContext() {
    console.log(`🧠 Context Window (${this.contextWindow.length} lines):`);
    console.log('='.repeat(30));

    if (this.contextWindow.length === 0) {
      console.log('Empty - load a file to populate context');
    } else {
      this.contextWindow.slice(-10).forEach((line, index) => {
        const lineNum = this.contextWindow.length - 10 + index + 1;
        console.log(`${lineNum.toString().padStart(3)}: ${line}`);
      });
    }
    console.log();
  }

  /**
   * Additional helper methods
   */
  async refactorCode(scope) {
    return this.provideSuggestions(`refactoring ${scope || 'the entire codebase'}`);
  }

  async explainCode(selection) {
    const currentFile = this.activeFiles.get('current');
    if (!currentFile) {
      console.log('❌ No file loaded');
      return;
    }

    const codeToExplain = selection || this.contextWindow.slice(-10).join('\n');
    await this.handleNaturalLanguageRequest(`Explain this code: ${codeToExplain}`);
  }

  async fixErrors() {
    return this.provideSuggestions('fixing errors and bugs');
  }

  async optimizeCode() {
    return this.provideSuggestions('performance optimization');
  }

  async generateTests() {
    return this.handleNaturalLanguageRequest('Generate comprehensive tests for the current code');
  }

  async generateDocumentation() {
    return this.handleNaturalLanguageRequest('Generate documentation for the current code');
  }

  async saveCurrentFile(filePath) {
    const currentFile = this.activeFiles.get('current');
    if (!currentFile) {
      console.log('❌ No file loaded to save');
      return;
    }

    const outputPath = filePath || currentFile.path;
    try {
      await fs.writeFile(outputPath, currentFile.content);
      console.log(`💾 Saved to: ${outputPath}`);
    } catch (error) {
      console.log(`❌ Save failed: ${error.message}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'interactive';

  try {
    const assistant = await new GeminiCodeAssistant().initialize();

    switch (command) {
      case 'interactive':
      case 'session':
        await assistant.startCodingSession();
        break;

      case 'analyze':
        if (args[1]) {
          await assistant.loadFile(args[1]);
          await assistant.analyzeCurrentCode();
        } else {
          console.log('Usage: gemini-code-assistant analyze <file>');
        }
        break;

      case 'help':
        console.log(`
🤖 Gemini Code Assistant

USAGE:
    node gemini-code-assistant.js [command] [options]

COMMANDS:
    interactive        Start interactive coding session (default)
    analyze <file>     Analyze a specific file
    help               Show this help

INTERACTIVE MODE:
    Once in interactive mode, use commands like:
    - load <file>      Load file for analysis
    - analyze          Analyze current code
    - suggest          Get improvement suggestions
    - "your request"   Natural language requests

ENVIRONMENT:
    Set GOOGLE_API_KEY for full AI functionality
                `);
        break;

      default:
        console.log(`Unknown command: ${command}`);
        console.log('Use "help" for usage information');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { GeminiCodeAssistant };
