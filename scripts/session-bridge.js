#!/usr/bin/env node

/**
 * SESSION BRIDGE
 * Intelligent session-to-session knowledge transfer protocol
 * Bridges any .session file to any new Claude Code session with perfect continuity
 */

const fs = require('fs').promises;
const path = require('path');

class SessionBridge {
  constructor(options = {}) {
    this.sessionsDir = options.sessionsDir || 'sessions';
    this.bridgeStrategies = {
      genesis: this.genesisStrategy.bind(this),
      evolution: this.evolutionStrategy.bind(this),
      specialization: this.specializationStrategy.bind(this),
      current: this.currentStrategy.bind(this),
    };
  }

  async bridgeToSession(sessionId, targetContext = 'continue revolutionary development') {
    console.log(`🌉 Bridging to session: ${sessionId}`);

    try {
      // Load session file
      const sessionPath = path.join(this.sessionsDir, `${sessionId}.session`);
      const sessionContent = await fs.readFile(sessionPath, 'utf8');

      // Parse .session file
      const session = this.parseSessionFile(sessionContent);

      // Generate bridge context using appropriate strategy
      const strategy =
        this.bridgeStrategies[session.metadata.session_type] || this.bridgeStrategies.current;
      const bridgeContext = await strategy(session, targetContext);

      // Create bridging command
      const bridgeCommand = this.generateBridgeCommand(session, bridgeContext);

      console.log('✅ Bridge context generated successfully!');
      return bridgeCommand;
    } catch (error) {
      console.error('❌ Bridge generation failed:', error.message);
      throw error;
    }
  }

  parseSessionFile(content) {
    // Extract YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) throw new Error('Invalid .session file format');

    const frontmatterText = frontmatterMatch[1];
    const markdown = content.substring(frontmatterMatch[0].length);

    // Parse YAML-like frontmatter (simple implementation)
    const metadata = {};
    frontmatterText.split('\n').forEach((line) => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        // Parse arrays and strings
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[key] = value
            .slice(1, -1)
            .split(',')
            .map((v) => v.trim().replace(/"/g, ''));
        } else {
          metadata[key] = value.replace(/"/g, '');
        }
      }
    });

    // Extract JSON appendix
    const jsonMatch = markdown.match(/```json\n([\s\S]*?)\n```/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[1]) : {};

    return {
      metadata,
      markdown,
      intelligence: jsonData,
    };
  }

  async genesisStrategy(session, targetContext) {
    return {
      type: 'GENESIS_BRIDGE',
      priority: 'MAXIMUM',
      context: `
🎯 GENESIS SESSION BRIDGE - REVOLUTIONARY FOUNDATION

**Original Vision**: ${this.extractVision(session)}
**Core Architecture**: Multi-agent arbitrage system with Claude Code (Architect), GPT-5 (Navigator), Gemini (Scout)
**Intelligence Score**: ${session.metadata.intelligence_score}% (Genesis-level)

**Foundational Achievements**:
${this.extractTopAchievements(session, 5)}

**Revolutionary Context**:
- **Messages Processed**: ${session.metadata.total_messages} (Genesis session)
- **Files Modified**: ${session.metadata.files_modified?.length || 0} files
- **Tools Mastered**: ${session.metadata.tools_used?.join(', ') || 'Multiple'}
- **Concepts Established**: ${session.metadata.key_concepts?.join(', ') || 'Core architecture'}

**Bridge Command**: ${targetContext} with complete genesis context and revolutionary multi-agent foundation.

**Next Phase**: Build upon established foundation with full architectural awareness and agent coordination protocols.
      `.trim(),
    };
  }

  async evolutionStrategy(session, targetContext) {
    return {
      type: 'EVOLUTION_BRIDGE',
      priority: 'HIGH',
      context: `
🔄 EVOLUTION SESSION BRIDGE - REFINEMENT & ADVANCEMENT

**Evolution Focus**: ${this.extractEvolutionFocus(session)}
**Intelligence Score**: ${session.metadata.intelligence_score}% (Evolution-level)

**Key Refinements**:
${this.extractTopAchievements(session, 3)}

**Advanced Capabilities**:
- **Messages**: ${session.metadata.total_messages} (Evolution depth)
- **Tools Advanced**: ${session.metadata.tools_used?.join(', ') || 'Enhanced'}
- **System Improvements**: ${this.extractImprovements(session)}

**Bridge Command**: ${targetContext} with evolved capabilities and refined understanding.
      `.trim(),
    };
  }

  async specializationStrategy(session, targetContext) {
    return {
      type: 'SPECIALIZATION_BRIDGE',
      priority: 'FOCUSED',
      context: `
🎯 SPECIALIZATION SESSION BRIDGE - EXPERT FOCUS

**Domain Expertise**: ${this.extractSpecialization(session)}
**Intelligence Score**: ${session.metadata.intelligence_score}% (Specialized)

**Expert Knowledge**:
${this.extractTopAchievements(session, 2)}

**Specialized Context**:
- **Focus Area**: ${session.metadata.key_concepts?.slice(0, 2).join(', ') || 'Specialized domain'}
- **Expert Tools**: ${session.metadata.tools_used?.slice(0, 3).join(', ') || 'Domain-specific'}

**Bridge Command**: ${targetContext} with specialized expertise and focused domain knowledge.
      `.trim(),
    };
  }

  async currentStrategy(session, targetContext) {
    return {
      type: 'CURRENT_BRIDGE',
      priority: 'CONTEXTUAL',
      context: `
🔥 CURRENT SESSION BRIDGE - ACTIVE DEVELOPMENT

**Active Context**: ${this.extractCurrentContext(session)}
**Intelligence Score**: ${session.metadata.intelligence_score}% (Current state)

**Recent Progress**: 
${this.extractTopAchievements(session, 1)}

**Bridge Command**: ${targetContext} with current development state and active context.
      `.trim(),
    };
  }

  extractVision(session) {
    const visionMatch = session.markdown.match(/## 🎯[^#]*?vision[^#]*?\n([^#]*)/i);
    return visionMatch
      ? visionMatch[1].trim().substring(0, 200) + '...'
      : 'Revolutionary multi-agent system development';
  }

  extractTopAchievements(session, count = 3) {
    const achievementsMatch = session.markdown.match(
      /## 🏆 Major Achievements\n([\s\S]*?)(?=\n## |$)/
    );
    if (achievementsMatch) {
      const achievements = achievementsMatch[1]
        .split('\n')
        .filter((line) => line.match(/^\d+\./))
        .slice(0, count);
      return achievements.join('\n') || '- Revolutionary system development progress';
    }
    return '- Session intelligence preserved and structured';
  }

  extractEvolutionFocus(session) {
    const concepts = session.metadata.key_concepts?.slice(0, 3).join(', ') || 'System evolution';
    return `Advanced development of ${concepts}`;
  }

  extractImprovements(session) {
    return session.metadata.files_modified?.length
      ? `${session.metadata.files_modified.length} files enhanced`
      : 'System improvements implemented';
  }

  extractSpecialization(session) {
    return session.metadata.key_concepts?.slice(0, 2).join(' & ') || 'Specialized domain focus';
  }

  extractCurrentContext(session) {
    return session.metadata.key_concepts?.slice(0, 1)[0] || 'Active development';
  }

  generateBridgeCommand(session, bridgeContext) {
    const bridgePrompt = `Bridge from ${session.metadata.session_type} session (${session.metadata.session_id}) - ${bridgeContext.context}`;

    return {
      session_type: session.metadata.session_type,
      intelligence_score: session.metadata.intelligence_score,
      bridge_context: bridgeContext,
      claude_command: `claude --continue --print "${bridgePrompt}"`,
      fresh_command: `claude --print "${bridgePrompt}"`,
      usage_instructions: `
🌉 SESSION BRIDGE READY

**Bridge Type**: ${bridgeContext.type}
**Priority**: ${bridgeContext.priority}
**Source Session**: ${session.metadata.session_id} (${session.metadata.session_type})
**Intelligence**: ${session.metadata.intelligence_score}%

**To Continue Existing Session**:
\`\`\`
${`claude --continue --print "${bridgePrompt}"`}
\`\`\`

**To Start Fresh With Context**:
\`\`\`
${`claude --print "${bridgePrompt}"`}
\`\`\`

**Bridge Context Active**: Revolutionary continuity maintained across sessions.
      `,
    };
  }

  async listAvailableSessions() {
    try {
      const indexPath = path.join(this.sessionsDir, 'sessions.index.md');
      const indexContent = await fs.readFile(indexPath, 'utf8');

      console.log('🔍 Available Sessions for Bridging:');
      console.log(indexContent);

      // Parse available sessions
      const sessionMatches = indexContent.matchAll(/### (\w+): ([a-f0-9-]+)/g);
      const sessions = Array.from(sessionMatches).map((match) => ({
        type: match[1],
        id: match[2],
      }));

      return sessions;
    } catch (error) {
      console.error('❌ Could not load session index:', error.message);
      return [];
    }
  }

  async generateBridgeMenu() {
    const sessions = await this.listAvailableSessions();

    const menu = `
🌉 SESSION BRIDGE MENU

${sessions
  .map(
    (session, index) => `
${index + 1}. **${session.type.toUpperCase()} SESSION**
   - ID: ${session.id}
   - Bridge Command: node scripts/session-bridge.js bridge ${session.id}
`
  )
  .join('')}

**Usage Examples**:
\`\`\`bash
# Bridge to genesis session (maximum context)
node scripts/session-bridge.js bridge ${sessions.find((s) => s.type === 'Genesis')?.id || sessions[0]?.id}

# Bridge with custom target context
node scripts/session-bridge.js bridge ${sessions[0]?.id} "implement new revolutionary features"

# List all sessions
node scripts/session-bridge.js list
\`\`\`

**Revolutionary Continuity**: Each bridge maintains complete intelligence and context transfer.
    `;

    console.log(menu);
    return menu;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const sessionId = args[1];
  const targetContext = args.slice(2).join(' ') || 'continue revolutionary development';

  const bridge = new SessionBridge();

  async function main() {
    try {
      switch (command) {
        case 'bridge':
          if (!sessionId) {
            throw new Error('Session ID required. Use: node session-bridge.js bridge <session-id>');
          }

          const bridgeCommand = await bridge.bridgeToSession(sessionId, targetContext);
          console.log('\n' + bridgeCommand.usage_instructions);
          break;

        case 'list':
          await bridge.listAvailableSessions();
          break;

        case 'menu':
        default:
          await bridge.generateBridgeMenu();
          break;
      }
    } catch (error) {
      console.error('❌ Bridge operation failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = SessionBridge;
