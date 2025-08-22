#!/usr/bin/env node

/**
 * INTELLIGENT SESSION PROCESSOR
 * Transforms raw Claude Code sessions into hierarchical .session files
 * Perfect for revolutionary thinkers who need intelligent knowledge preservation
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class IntelligentSessionProcessor {
  constructor(options = {}) {
    this.claudeProjectsPath = path.join(process.env.USERPROFILE || process.env.HOME, '.claude', 'projects');
    this.projectName = 'C--Users-erdno-GithubRepos-Restructure-MCP-Orchestration';
    this.sessionsPath = path.join(this.claudeProjectsPath, this.projectName);
    this.outputDir = options.outputDir || 'sessions';
    
    // Intelligence extraction patterns
    this.patterns = {
      vision: /\b(vision|revolutionary|breakthrough|paradigm|transformative|groundbreaking)\b/gi,
      architecture: /\b(architecture|system|design|structure|framework|pattern)\b/gi,
      achievements: /\b(✅|completed|implemented|achieved|success|milestone)\b/gi,
      insights: /\b(insight|learning|discovery|realization|understanding|pattern)\b/gi,
      decisions: /\b(decision|chose|selected|adopted|determined|established)\b/gi,
      problems: /\b(problem|issue|challenge|bug|error|failure)\b/gi,
      solutions: /\b(solution|fix|resolve|solve|workaround|approach)\b/gi
    };
    
    // Session hierarchy classification
    this.hierarchyRules = {
      genesis: {
        indicators: ['initial', 'first', 'foundation', 'core', 'basic', 'start'],
        min_messages: 100,
        vision_density: 0.05
      },
      evolution: {
        indicators: ['refine', 'improve', 'enhance', 'iterate', 'develop'],
        min_messages: 50,
        solution_density: 0.03
      },
      specialization: {
        indicators: ['specific', 'advanced', 'optimize', 'expert', 'deep'],
        min_messages: 25,
        technical_density: 0.04
      }
    };
  }

  async processAllSessions() {
    console.log('🧠 Intelligent Session Processing Started...');
    
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });
      
      // Get all session files
      const sessionFiles = await fs.readdir(this.sessionsPath);
      const jsonlFiles = sessionFiles.filter(f => f.endsWith('.jsonl'));
      
      console.log(`📁 Processing ${jsonlFiles.length} sessions`);
      
      const processedSessions = [];
      
      // Process each session
      for (const file of jsonlFiles) {
        const sessionData = await this.processSession(file);
        if (sessionData) {
          processedSessions.push(sessionData);
        }
      }
      
      // Build session hierarchy and relationships
      const hierarchy = this.buildSessionHierarchy(processedSessions);
      
      // Generate .session files
      for (const session of hierarchy) {
        await this.generateSessionFile(session);
      }
      
      // Create session index
      await this.generateSessionIndex(hierarchy);
      
      console.log('✅ Intelligent session processing complete!');
      return hierarchy;
      
    } catch (error) {
      console.error('❌ Processing failed:', error.message);
      throw error;
    }
  }

  async processSession(sessionFile) {
    const filePath = path.join(this.sessionsPath, sessionFile);
    
    try {
      console.log(`🔍 Analyzing: ${sessionFile}`);
      
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      if (lines.length === 0) return null;
      
      const session = {
        id: sessionFile.replace('.jsonl', ''),
        file: sessionFile,
        messageCount: lines.length,
        content: {
          userMessages: [],
          assistantMessages: [],
          toolUses: [],
          summaries: []
        },
        intelligence: {
          concepts: new Map(),
          achievements: [],
          insights: [],
          decisions: [],
          problemSolutions: [],
          codeChanges: []
        },
        metadata: {
          startTime: null,
          endTime: null,
          duration: 0,
          agents: new Set(['claude-code']),
          filesModified: new Set(),
          toolsUsed: new Set()
        }
      };

      // Parse all messages for intelligence
      for (let i = 0; i < lines.length; i++) {
        try {
          const entry = JSON.parse(lines[i]);
          await this.extractIntelligence(entry, session, i === 0, i === lines.length - 1);
        } catch (parseError) {
          continue;
        }
      }
      
      // Calculate intelligence metrics
      session.intelligence.score = this.calculateIntelligenceScore(session);
      session.hierarchyLevel = this.classifyHierarchyLevel(session);
      
      console.log(`   📊 Intelligence Score: ${session.intelligence.score}%`);
      console.log(`   🏗️  Hierarchy Level: ${session.hierarchyLevel}`);
      
      return session;
      
    } catch (error) {
      console.error(`   ❌ Failed to process ${sessionFile}:`, error.message);
      return null;
    }
  }

  async extractIntelligence(entry, session, isFirst, isLast) {
    // Set timestamps
    if (isFirst && entry.timestamp) {
      session.metadata.startTime = entry.timestamp;
    }
    if (isLast && entry.timestamp) {
      session.metadata.endTime = entry.timestamp;
    }
    
    // Extract from user messages
    if (entry.type === 'user' && entry.message?.content) {
      const content = typeof entry.message.content === 'string' 
        ? entry.message.content 
        : JSON.stringify(entry.message.content);
      
      session.content.userMessages.push({
        timestamp: entry.timestamp,
        content: content.substring(0, 500)
      });
      
      // Extract concepts and patterns
      this.extractConcepts(content, session.intelligence.concepts);
      this.extractPatterns(content, session.intelligence);
    }
    
    // Extract from assistant messages  
    if (entry.type === 'assistant' && entry.message?.content) {
      const content = entry.message.content;
      
      if (Array.isArray(content)) {
        // Handle structured content
        const textContent = content.filter(c => c.type === 'text').map(c => c.text).join(' ');
        const toolUses = content.filter(c => c.type === 'tool_use');
        
        if (textContent) {
          session.content.assistantMessages.push({
            timestamp: entry.timestamp,
            content: textContent.substring(0, 500)
          });
          
          this.extractConcepts(textContent, session.intelligence.concepts);
          this.extractPatterns(textContent, session.intelligence);
        }
        
        // Track tool usage
        toolUses.forEach(tool => {
          session.metadata.toolsUsed.add(tool.name);
          session.content.toolUses.push({
            timestamp: entry.timestamp,
            tool: tool.name,
            input: JSON.stringify(tool.input).substring(0, 200)
          });
          
          // Track file modifications
          if (tool.input?.file_path) {
            session.metadata.filesModified.add(tool.input.file_path);
          }
        });
      }
    }
    
    // Handle summary entries
    if (entry.type === 'summary') {
      session.content.summaries.push({
        timestamp: entry.timestamp || new Date().toISOString(),
        summary: entry.summary
      });
      
      this.extractConcepts(entry.summary, session.intelligence.concepts);
    }
  }

  extractConcepts(text, conceptsMap) {
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    
    // Key technical concepts
    const keyTerms = [
      'agent', 'multi-agent', 'arbitrage', 'mcp', 'orchestration', 
      'session', 'claude', 'gemini', 'gpt', 'architecture', 'system',
      'monorepo', 'pnpm', 'turbo', 'typescript', 'react', 'vscode',
      'workflow', 'automation', 'guardian', 'preservation', 'intelligence'
    ];
    
    words.forEach(word => {
      if (keyTerms.includes(word) || word.length > 6) {
        conceptsMap.set(word, (conceptsMap.get(word) || 0) + 1);
      }
    });
  }

  extractPatterns(text, intelligence) {
    // Extract achievements
    const achievementMatches = text.match(this.patterns.achievements);
    if (achievementMatches) {
      const sentences = text.split(/[.!?]/).filter(s => 
        this.patterns.achievements.test(s) && s.length > 20
      );
      intelligence.achievements.push(...sentences.slice(0, 3));
    }
    
    // Extract insights
    const insightMatches = text.match(this.patterns.insights);
    if (insightMatches) {
      const sentences = text.split(/[.!?]/).filter(s => 
        this.patterns.insights.test(s) && s.length > 20
      );
      intelligence.insights.push(...sentences.slice(0, 2));
    }
    
    // Extract decisions
    const decisionMatches = text.match(this.patterns.decisions);
    if (decisionMatches) {
      const sentences = text.split(/[.!?]/).filter(s => 
        this.patterns.decisions.test(s) && s.length > 20
      );
      intelligence.decisions.push(...sentences.slice(0, 2));
    }
  }

  calculateIntelligenceScore(session) {
    let score = 0;
    
    // Message density (0-25 points)
    score += Math.min(25, session.messageCount / 10);
    
    // Concept richness (0-25 points)  
    score += Math.min(25, session.intelligence.concepts.size / 2);
    
    // Achievement density (0-20 points)
    score += Math.min(20, session.intelligence.achievements.length * 2);
    
    // Insight quality (0-15 points)
    score += Math.min(15, session.intelligence.insights.length * 3);
    
    // Tool usage diversity (0-10 points)
    score += Math.min(10, session.metadata.toolsUsed.size);
    
    // Code impact (0-5 points)
    score += Math.min(5, session.metadata.filesModified.size);
    
    return Math.round(score);
  }

  classifyHierarchyLevel(session) {
    const text = [
      ...session.content.userMessages,
      ...session.content.assistantMessages,
      ...session.content.summaries
    ].map(item => item.content || item.summary || '').join(' ').toLowerCase();
    
    // Check for genesis indicators
    const genesisScore = this.hierarchyRules.genesis.indicators.filter(
      indicator => text.includes(indicator)
    ).length;
    
    if (genesisScore >= 2 && session.messageCount >= this.hierarchyRules.genesis.min_messages) {
      return 'genesis';
    }
    
    // Check for evolution indicators
    const evolutionScore = this.hierarchyRules.evolution.indicators.filter(
      indicator => text.includes(indicator)
    ).length;
    
    if (evolutionScore >= 2 && session.messageCount >= this.hierarchyRules.evolution.min_messages) {
      return 'evolution';
    }
    
    // Check for specialization indicators
    const specializationScore = this.hierarchyRules.specialization.indicators.filter(
      indicator => text.includes(indicator)
    ).length;
    
    if (specializationScore >= 1 && session.messageCount >= this.hierarchyRules.specialization.min_messages) {
      return 'specialization';
    }
    
    return 'current';
  }

  buildSessionHierarchy(sessions) {
    // Sort by intelligence score and message count
    const sortedSessions = sessions.sort((a, b) => {
      if (a.intelligence.score !== b.intelligence.score) {
        return b.intelligence.score - a.intelligence.score;
      }
      return b.messageCount - a.messageCount;
    });
    
    // Assign hierarchy relationships
    sortedSessions.forEach((session, index) => {
      session.metadata.hierarchyIndex = index;
      session.metadata.parentSessions = [];
      session.metadata.childSessions = [];
      
      // Genesis sessions (highest intelligence, most messages)
      if (index === 0 || session.hierarchyLevel === 'genesis') {
        session.hierarchyLevel = 'genesis';
        session.metadata.level = 0;
      } else if (session.hierarchyLevel === 'evolution' || session.intelligence.score > 70) {
        session.metadata.level = 1;
        session.metadata.parentSessions.push(sortedSessions[0].id);
      } else {
        session.metadata.level = 2;
        // Find most relevant parent
        const parent = sortedSessions.slice(0, index).find(p => p.metadata.level <= 1);
        if (parent) {
          session.metadata.parentSessions.push(parent.id);
        }
      }
    });
    
    return sortedSessions;
  }

  async generateSessionFile(session) {
    const filename = `${session.id}.session`;
    const filePath = path.join(this.outputDir, filename);
    
    // Build YAML frontmatter
    const frontmatter = {
      session_id: session.id,
      session_type: session.hierarchyLevel,
      hierarchy_level: session.metadata.level,
      parent_sessions: session.metadata.parentSessions,
      child_sessions: session.metadata.childSessions,
      created: session.metadata.startTime,
      updated: session.metadata.endTime,
      total_messages: session.messageCount,
      intelligence_score: session.intelligence.score,
      key_concepts: Array.from(session.intelligence.concepts.keys()).slice(0, 10),
      agents_involved: Array.from(session.metadata.agents),
      tools_used: Array.from(session.metadata.toolsUsed),
      files_modified: Array.from(session.metadata.filesModified).slice(0, 5)
    };
    
    // Build markdown content
    const topConcepts = Array.from(session.intelligence.concepts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const markdown = `# ${session.hierarchyLevel.charAt(0).toUpperCase() + session.hierarchyLevel.slice(1)} Session: ${session.id}

## 🎯 Session Overview
- **Type**: ${session.hierarchyLevel}
- **Messages**: ${session.messageCount}
- **Intelligence Score**: ${session.intelligence.score}%
- **Duration**: ${session.metadata.startTime} to ${session.metadata.endTime}

## 💎 Key Concepts
${topConcepts.map(([concept, count]) => `- **${concept}** (${count} mentions)`).join('\n')}

## 🏆 Major Achievements
${session.intelligence.achievements.slice(0, 5).map((achievement, i) => `${i + 1}. ${achievement.trim()}`).join('\n')}

## 💡 Key Insights
${session.intelligence.insights.slice(0, 3).map((insight, i) => `${i + 1}. ${insight.trim()}`).join('\n')}

## 🔧 Technical Activities
- **Tools Used**: ${Array.from(session.metadata.toolsUsed).join(', ')}
- **Files Modified**: ${session.metadata.filesModified.size} files
- **Code Changes**: ${session.content.toolUses.length} tool operations

## 🔄 Session Bridging
This session can bridge to any new session with context:
- **State**: ${session.hierarchyLevel} session with ${session.intelligence.score}% intelligence preservation
- **Concepts**: ${Array.from(session.intelligence.concepts.keys()).slice(0, 3).join(', ')}
- **Next**: Continue development with accumulated intelligence

## 📊 Intelligence Metrics
- **Conceptual Depth**: ${'█'.repeat(Math.floor(session.intelligence.score/10))}${'░'.repeat(10-Math.floor(session.intelligence.score/10))} ${session.intelligence.score}%
- **Achievement Density**: ${session.intelligence.achievements.length}/5
- **Insight Quality**: ${session.intelligence.insights.length}/3
- **Technical Impact**: ${session.metadata.filesModified.size} files modified

---
`;

    // Build JSON appendix
    const jsonAppendix = {
      session_metadata: {
        raw_messages: session.messageCount,
        tool_operations: session.content.toolUses.length,
        files_modified: Array.from(session.metadata.filesModified),
        intelligence_breakdown: {
          concepts: session.intelligence.concepts.size,
          achievements: session.intelligence.achievements.length,
          insights: session.intelligence.insights.length,
          decisions: session.intelligence.decisions.length
        }
      },
      intelligence_graph: {
        concepts: Object.fromEntries(
          Array.from(session.intelligence.concepts.entries()).slice(0, 10)
        )
      },
      bridging_capability: {
        hierarchy_level: session.metadata.level,
        parent_sessions: session.metadata.parentSessions,
        bridge_strength: session.intelligence.score / 100,
        context_preservation: true
      }
    };
    
    // Combine into .session format
    const sessionContent = `---
${Object.entries(frontmatter).map(([key, value]) => 
  `${key}: ${Array.isArray(value) ? `[${value.map(v => `"${v}"`).join(', ')}]` : `"${value}"`}`
).join('\n')}
---

${markdown}

\`\`\`json
${JSON.stringify(jsonAppendix, null, 2)}
\`\`\`
`;

    await fs.writeFile(filePath, sessionContent);
    console.log(`📄 Generated: ${filename}`);
  }

  async generateSessionIndex(sessions) {
    const indexPath = path.join(this.outputDir, 'sessions.index.md');
    
    const index = `# Session Intelligence Index

Generated: ${new Date().toISOString()}
Total Sessions: ${sessions.length}

## Session Hierarchy

${sessions.map(session => `
### ${session.hierarchyLevel.charAt(0).toUpperCase() + session.hierarchyLevel.slice(1)}: ${session.id}
- **Intelligence Score**: ${session.intelligence.score}%
- **Messages**: ${session.messageCount}
- **Level**: ${session.metadata.level}
- **Key Concepts**: ${Array.from(session.intelligence.concepts.keys()).slice(0, 3).join(', ')}
- **File**: \`${session.id}.session\`
`).join('\n')}

## Cross-Session Bridging

Any session can bridge to any other session through the unified intelligence network. Each \`.session\` file contains complete bridging context and hierarchical relationships.

### Usage:
1. Select any \`.session\` file for your context needs
2. Use the bridging context to connect to any new Claude Code session
3. Leverage the hierarchical intelligence for comprehensive understanding
`;

    await fs.writeFile(indexPath, index);
    console.log('📋 Generated: sessions.index.md');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    outputDir: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'sessions'
  };

  const processor = new IntelligentSessionProcessor(options);

  async function main() {
    try {
      const sessions = await processor.processAllSessions();
      
      console.log('\n🎉 INTELLIGENT SESSION PROCESSING COMPLETE!');
      console.log('📁 Sessions directory:', options.outputDir);
      console.log('📋 Session index:', path.join(options.outputDir, 'sessions.index.md'));
      console.log('🚀 Ready for intelligent session bridging!');
      
    } catch (error) {
      console.error('❌ Processing failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = IntelligentSessionProcessor;