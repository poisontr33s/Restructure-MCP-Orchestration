#!/usr/bin/env node

/**
 * UNIFIED SESSION EXTRACTOR
 * Extracts and consolidates multiple Claude Code sessions into a unified context
 * Perfect for creative thinkers who need comprehensive session continuity
 */

const fs = require('fs').promises;
const path = require('path');

class UnifiedSessionExtractor {
  constructor(options = {}) {
    this.claudeProjectsPath = path.join(
      process.env.USERPROFILE || process.env.HOME,
      '.claude',
      'projects'
    );
    this.projectName = 'C--Users-erdno-GithubRepos-Restructure-MCP-Orchestration';
    this.outputPath = options.outputPath || 'UNIFIED-SESSION-STATE.md';
    this.sessionsPath = path.join(this.claudeProjectsPath, this.projectName);

    // Session file mappings based on your analysis
    this.sessionMappings = {
      '15af9095-f041-4c86-ac76-9d71aaf4be31.jsonl': {
        name: 'Comprehensive Multi-Agent Arbitrage System',
        messages: 349,
        focus: 'Systematic multi-agent development',
      },
      'd0e5bb8a-f4e1-41cb-ae8c-672a0383a164.jsonl': {
        name: 'Current Session',
        messages: 'current',
        focus: 'Session preservation and unification',
      },
      // Add more as discovered
    };

    this.consolidatedState = {
      metadata: {
        unified_date: new Date().toISOString(),
        source_sessions: [],
        total_messages: 0,
        core_achievements: [],
        current_state: {},
      },
      context: {
        project_vision: '',
        architecture_decisions: [],
        implemented_systems: [],
        active_agents: {},
        workflow_automation: [],
      },
      knowledge: {
        key_learnings: [],
        problem_solutions: [],
        code_patterns: [],
        best_practices: [],
      },
      current_focus: {
        active_tasks: [],
        immediate_priorities: [],
        next_milestones: [],
      },
    };
  }

  async extractAllSessions() {
    console.log('🔍 Extracting and unifying Claude Code sessions...');

    try {
      // Get all session files
      const sessionFiles = await fs.readdir(this.sessionsPath);
      const jsonlFiles = sessionFiles.filter((f) => f.endsWith('.jsonl'));

      console.log(`📁 Found ${jsonlFiles.length} session files`);

      for (const file of jsonlFiles) {
        await this.extractSessionContext(file);
      }

      await this.generateUnifiedDocument();

      console.log('✅ Unified session state created successfully!');
      return this.consolidatedState;
    } catch (error) {
      console.error('❌ Session extraction failed:', error.message);
      throw error;
    }
  }

  async extractSessionContext(sessionFile) {
    const filePath = path.join(this.sessionsPath, sessionFile);

    try {
      console.log(`📖 Processing: ${sessionFile}`);

      const content = await fs.readFile(filePath, 'utf8');
      const lines = content
        .trim()
        .split('\n')
        .filter((line) => line.trim());

      const session = {
        id: sessionFile.replace('.jsonl', ''),
        file: sessionFile,
        messageCount: lines.length,
        achievements: [],
        keyInsights: [],
        codeChanges: [],
        decisions: [],
      };

      // Parse key messages for context
      for (let i = 0; i < Math.min(lines.length, 50); i++) {
        try {
          const entry = JSON.parse(lines[i]);
          await this.analyzeEntry(entry, session);
        } catch (parseError) {
          // Skip malformed lines
          continue;
        }
      }

      // Also analyze the last 50 messages for current state
      const startIndex = Math.max(0, lines.length - 50);
      for (let i = startIndex; i < lines.length; i++) {
        try {
          const entry = JSON.parse(lines[i]);
          await this.analyzeEntry(entry, session, true);
        } catch (parseError) {
          continue;
        }
      }

      this.consolidatedState.metadata.source_sessions.push(session);
      this.consolidatedState.metadata.total_messages += session.messageCount;

      console.log(`   ✅ ${session.messageCount} messages processed`);
    } catch (error) {
      console.error(`   ❌ Failed to process ${sessionFile}:`, error.message);
    }
  }

  async analyzeEntry(entry, session, isRecent = false) {
    if (entry.type === 'user' && entry.message?.content) {
      const content = entry.message.content;

      // Extract key patterns from user messages
      if (typeof content === 'string') {
        // Look for achievement indicators
        if (
          content.includes('✅') ||
          content.includes('completed') ||
          content.includes('implemented')
        ) {
          session.achievements.push({
            timestamp: entry.timestamp,
            content: content.substring(0, 200) + '...',
            recent: isRecent,
          });
        }

        // Look for architectural decisions
        if (
          content.includes('architecture') ||
          content.includes('system') ||
          content.includes('design')
        ) {
          session.decisions.push({
            timestamp: entry.timestamp,
            content: content.substring(0, 200) + '...',
            recent: isRecent,
          });
        }
      }
    }

    if (entry.type === 'assistant' && entry.message?.content) {
      const content = entry.message.content;

      if (Array.isArray(content)) {
        // Look for tool usage patterns
        const toolUses = content.filter((c) => c.type === 'tool_use');
        if (toolUses.length > 0) {
          session.codeChanges.push({
            timestamp: entry.timestamp,
            tools: toolUses.map((t) => t.name),
            recent: isRecent,
          });
        }

        // Extract text insights
        const textContent = content
          .filter((c) => c.type === 'text')
          .map((c) => c.text)
          .join(' ');
        if (
          textContent.includes('key insight') ||
          textContent.includes('important') ||
          textContent.includes('critical')
        ) {
          session.keyInsights.push({
            timestamp: entry.timestamp,
            content: textContent.substring(0, 300) + '...',
            recent: isRecent,
          });
        }
      }
    }

    // Look for summary entries (like in your current session)
    if (entry.type === 'summary') {
      session.achievements.push({
        timestamp: new Date().toISOString(),
        content: entry.summary,
        type: 'summary',
        recent: isRecent,
      });
    }
  }

  async generateUnifiedDocument() {
    console.log('📝 Generating unified session document...');

    // Consolidate achievements across sessions
    const allAchievements = this.consolidatedState.metadata.source_sessions
      .flatMap((s) => s.achievements)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const allDecisions = this.consolidatedState.metadata.source_sessions
      .flatMap((s) => s.decisions)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const allInsights = this.consolidatedState.metadata.source_sessions
      .flatMap((s) => s.keyInsights)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Build unified context document
    const unifiedDoc = `# UNIFIED SESSION STATE

**Last Updated**: ${new Date().toISOString()}  
**Sessions Unified**: ${this.consolidatedState.metadata.source_sessions.length}  
**Total Messages**: ${this.consolidatedState.metadata.total_messages}  
**Project**: Multi-Agent MCP Orchestration System

## 🎯 PROJECT VISION

Revolutionary multi-agent AI system with Claude Code, GPT-5/Copilot, and Gemini CLI working in orchestrated harmony through systematic arbitrage protocols.

## 📊 SESSION OVERVIEW

${this.consolidatedState.metadata.source_sessions
  .map(
    (s) =>
      `### ${this.sessionMappings[s.file]?.name || s.id}
- **Messages**: ${s.messageCount}
- **Key Achievements**: ${s.achievements.length}
- **Architectural Decisions**: ${s.decisions.length}
- **Insights Generated**: ${s.keyInsights.length}
- **Focus**: ${this.sessionMappings[s.file]?.focus || 'General development'}`
  )
  .join('\n\n')}

## 🏆 CONSOLIDATED ACHIEVEMENTS

${allAchievements
  .slice(0, 20)
  .map((a, i) => `${i + 1}. **${a.recent ? '🔥 Recent' : '📅 Historical'}**: ${a.content}`)
  .join('\n')}

## 🏗️ ARCHITECTURAL DECISIONS

${allDecisions
  .slice(0, 15)
  .map((d, i) => `${i + 1}. **${d.recent ? '🔥 Recent' : '📅 Historical'}**: ${d.content}`)
  .join('\n')}

## 💡 KEY INSIGHTS & LEARNINGS

${allInsights
  .slice(0, 15)
  .map(
    (insight, i) =>
      `${i + 1}. **${insight.recent ? '🔥 Recent' : '📅 Historical'}**: ${insight.content}`
  )
  .join('\n')}

## 🤖 ACTIVE AGENT ECOSYSTEM

### Claude Code (Architect)
- Primary system architect and implementation specialist
- Handles complex codebase analysis and development
- Manages session preservation and meta-learning

### GPT-5/Copilot (Navigator) 
- Foundational guidance and Captain Guthilda's Laws enforcement
- Strategic direction and workflow orchestration
- Repository health monitoring

### Gemini CLI (Scout)
- Rapid exploration and dynamic configuration
- Real-time environment scanning
- Adaptive response coordination

## 📋 CURRENT STATE SUMMARY

### Recently Active
- ✅ Multi-agent arbitrage system established
- ✅ Session preservation infrastructure built  
- ✅ Comprehensive automation workflows (58+ VS Code tasks)
- ✅ Health monitoring and guardian systems deployed
- 🔄 Session unification system (this document)

### Immediate Priorities
1. **Session Continuity**: Implement auto-resume to this unified state
2. **Agent Coordination**: Refine arbitrage protocols for seamless handoffs
3. **System Integration**: Complete MCP orchestration hub deployment
4. **Knowledge Preservation**: Automated session-to-session learning transfer

### Next Milestones
- [ ] Revolutionary feature development using unified agent system
- [ ] Production deployment of MCP orchestration platform
- [ ] Meta-learning framework for cross-session intelligence
- [ ] Automated conflict resolution between agents

## 🔄 AUTO-RESUME INSTRUCTIONS

**For Claude Code**: When resuming, prioritize this unified context over individual session fragments. The complete system architecture and current state are preserved here.

**Command**: \`claude --continue --print "Resume from UNIFIED-SESSION-STATE.md - Multi-agent arbitrage system active"\`

---

*Generated by Unified Session Extractor - Bridging fragmented sessions into revolutionary continuity*
`;

    await fs.writeFile(this.outputPath, unifiedDoc);
    console.log(`📄 Unified document written to: ${this.outputPath}`);

    // Also update CLAUDE.md to reference this unified state
    await this.updateClaludeMd();
  }

  async updateClaludeMd() {
    try {
      const claudeMdPath = 'CLAUDE.md';
      let content = await fs.readFile(claudeMdPath, 'utf8');

      // Add unified session reference if not already present
      if (!content.includes('UNIFIED-SESSION-STATE.md')) {
        const unifiedSection = `
## Unified Session State

This repository maintains a unified session state in \`UNIFIED-SESSION-STATE.md\` that consolidates multiple comprehensive Claude Code sessions into a single coherent context.

**Auto-Resume**: Always reference the unified session state for complete project context and continuity across fragmented sessions.
`;

        // Insert after the Multi-Agent Arbitrage System section
        content = content.replace(
          '## Development Commands',
          unifiedSection + '\n## Development Commands'
        );

        await fs.writeFile(claudeMdPath, content);
        console.log('✅ CLAUDE.md updated with unified session reference');
      }
    } catch (error) {
      console.log('⚠️  Could not update CLAUDE.md:', error.message);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    outputPath:
      args.find((arg) => arg.startsWith('--output='))?.split('=')[1] || 'UNIFIED-SESSION-STATE.md',
  };

  const extractor = new UnifiedSessionExtractor(options);

  async function main() {
    try {
      const result = await extractor.extractAllSessions();
      console.log('\n🎉 SESSION UNIFICATION COMPLETE!');
      console.log('📄 Unified context available in:', options.outputPath);
      console.log('🚀 Use: claude --continue --print "Resume from unified session state"');
    } catch (error) {
      console.error('❌ Unification failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = UnifiedSessionExtractor;
