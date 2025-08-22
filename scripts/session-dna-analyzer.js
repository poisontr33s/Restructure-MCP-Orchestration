#!/usr/bin/env node

/**
 * SESSION DNA ANALYZER
 * Universal AI-agnostic system for analyzing session compatibility and cross-pollination potential
 * Builds on established .md.session format and existing session intelligence architecture
 */

const fs = require('fs').promises;
const path = require('path');

class SessionDNAAnalyzer {
  constructor(options = {}) {
    // Build on our established directory structure
    this.preloadDir = options.preloadDir || 'preload-sessions';
    this.outputDir = options.outputDir || 'session-dna';
    
    // Universal AI principles for cross-model compatibility
    this.dnaFactors = {
      conceptual: {
        weight: 0.4,
        patterns: ['multi-agent', 'arbitrage', 'architecture', 'system', 'orchestration', 'intelligence']
      },
      technical: {
        weight: 0.3,
        patterns: ['implementation', 'tools', 'files', 'build', 'development', 'optimization']
      },
      achievement: {
        weight: 0.2,
        patterns: ['completed', 'implemented', 'success', 'breakthrough', 'milestone', 'achievement']
      },
      temporal: {
        weight: 0.1,
        patterns: ['recent', 'current', 'active', 'latest', 'ongoing', 'immediate']
      }
    };
    
    // Compatibility thresholds for amalgamation vs sub-separation
    this.compatibilityThresholds = {
      amalgamate: 0.7,    // High compatibility - can merge
      bridge: 0.4,        // Medium compatibility - can cross-pollinate
      separate: 0.2       // Low compatibility - keep as sub-disparate
    };
    
    // ML-ready architecture for future evolution
    this.mlReadyMetrics = {
      pattern_vectors: new Map(),
      compatibility_history: [],
      cross_pollination_success: new Map(),
      adaptive_weights: { ...this.dnaFactors }
    };
  }

  async analyzeDNA() {
    console.log('🧬 Session DNA Analysis Starting...');
    console.log('   📂 Using established .md.session format');
    console.log('   🤖 Universal AI compatibility mode');
    
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      
      // Load all established .md.session files
      const sessions = await this.loadMdSessions();
      console.log(`   📁 Loaded ${sessions.length} .md.session files`);
      
      // Analyze DNA for each session
      const dnaProfiles = await this.extractDNAProfiles(sessions);
      
      // Calculate cross-compatibility matrix
      const compatibilityMatrix = await this.buildCompatibilityMatrix(dnaProfiles);
      
      // Determine amalgamation vs sub-separation strategy
      const pollination = await this.determineCrossPollination(compatibilityMatrix);
      
      // Generate universal compatibility report
      await this.generateDNAReport(dnaProfiles, compatibilityMatrix, pollination);
      
      console.log('✅ Session DNA analysis complete!');
      return { dnaProfiles, compatibilityMatrix, pollination };
      
    } catch (error) {
      console.error('❌ DNA analysis failed:', error.message);
      throw error;
    }
  }

  async loadMdSessions() {
    console.log('   🔍 Loading established .md.session files...');
    
    const files = await fs.readdir(this.preloadDir);
    const mdSessionFiles = files.filter(f => f.endsWith('.md.session'));
    
    const sessions = [];
    
    for (const file of mdSessionFiles) {
      const filePath = path.join(this.preloadDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      const session = {
        id: file.replace('.md.session', ''),
        filename: file,
        path: filePath,
        content: content,
        metadata: this.extractMdSessionMetadata(content),
        intelligence: this.extractIntelligenceContent(content)
      };
      
      sessions.push(session);
    }
    
    return sessions;
  }

  extractMdSessionMetadata(content) {
    // Extract from established .md.session format
    const priorityMatch = content.match(/\\*\\*🎯 Auto-Preload Priority\\*\\*: (\\w+)/);
    const intelligenceMatch = content.match(/\\*\\*🧠 Intelligence\\*\\*: (\\d+)%/);
    const messagesMatch = content.match(/\\*\\*📊 Messages\\*\\*: (\\d+)/);
    const typeMatch = content.match(/\\| \\*\\*Type\\*\\* \\| (\\w+) \\|/);
    const conceptsMatch = content.match(/\\| \\*\\*Concepts\\*\\* \\| (.+?) \\|/);
    
    return {
      priority: priorityMatch ? priorityMatch[1] : 'MEDIUM',
      intelligence_score: intelligenceMatch ? parseInt(intelligenceMatch[1]) : 50,
      message_count: messagesMatch ? parseInt(messagesMatch[1]) : 0,
      session_type: typeMatch ? typeMatch[1] : 'Current',
      concepts: conceptsMatch && conceptsMatch[1] ? 
        conceptsMatch[1].split('`').filter(c => c.trim() && c.trim() !== ' ' && c.trim() !== '') : [],
      raw_concepts: conceptsMatch ? conceptsMatch[1] : ''
    };
  }

  extractIntelligenceContent(content) {
    // Extract different intelligence sections from .md.session
    const sections = {
      achievements: this.extractSection(content, '🏆 Critical Achievements'),
      vision: this.extractSection(content, '🎯 Session Vision'),
      technical: this.extractSection(content, '🔧 Technical Context'),
      architecture: this.extractSection(content, '🏗️ Architecture Elements'),
      metrics: this.extractSection(content, '📈 Intelligence Metrics')
    };
    
    return sections;
  }

  extractSection(content, sectionTitle) {
    const sectionRegex = new RegExp(`## ${sectionTitle}[^#]*?\\n([^#]*?)(?=\\n## |$)`, 'i');
    const match = content.match(sectionRegex);
    return match ? match[1].trim() : '';
  }

  async extractDNAProfiles(sessions) {
    console.log('   🧬 Extracting DNA profiles...');
    
    const profiles = [];
    
    for (const session of sessions) {
      const dna = {
        session_id: session.id,
        metadata: session.metadata,
        dna_vectors: {},
        compatibility_score: 0,
        cross_pollination_potential: {},
        ml_features: {}
      };
      
      // Calculate DNA vectors for each factor
      for (const [factorName, factor] of Object.entries(this.dnaFactors)) {
        dna.dna_vectors[factorName] = this.calculateFactorScore(
          session.content + JSON.stringify(session.intelligence),
          factor.patterns
        ) * factor.weight;
      }
      
      // Overall DNA strength
      dna.compatibility_score = Object.values(dna.dna_vectors).reduce((sum, score) => sum + score, 0);
      
      // ML-ready features for future learning
      dna.ml_features = {
        concept_density: session.metadata.concepts ? session.metadata.concepts.length : 0,
        intelligence_score: session.metadata.intelligence_score || 0,
        message_density: session.metadata.message_count || 0,
        session_type_vector: this.encodeSessionType(session.metadata.session_type),
        priority_weight: this.encodePriority(session.metadata.priority)
      };
      
      profiles.push(dna);
      console.log(`     🧬 ${session.id}: DNA Score ${dna.compatibility_score.toFixed(3)}`);
    }
    
    return profiles;
  }

  calculateFactorScore(content, patterns) {
    if (!content || typeof content !== 'string') return 0;
    
    const text = content.toLowerCase();
    let score = 0;
    let totalWords = text.split(/\\s+/).length;
    
    for (const pattern of patterns) {
      const regex = new RegExp(`\\\\b${pattern}\\\\b`, 'gi');
      const matches = (text.match(regex) || []).length;
      score += matches / totalWords; // Normalized frequency
    }
    
    return Math.min(1.0, score); // Cap at 1.0
  }

  encodeSessionType(type) {
    const typeMap = { 'Genesis': 1.0, 'Evolution': 0.8, 'Specialization': 0.6, 'Current': 0.4 };
    return typeMap[type] || 0.2;
  }

  encodePriority(priority) {
    const priorityMap = { 'MAXIMUM': 1.0, 'HIGH': 0.8, 'MEDIUM': 0.6, 'LOW': 0.4 };
    return priorityMap[priority] || 0.3;
  }

  async buildCompatibilityMatrix(profiles) {
    console.log('   🔗 Building cross-compatibility matrix...');
    
    const matrix = {};
    
    for (let i = 0; i < profiles.length; i++) {
      const sessionA = profiles[i];
      matrix[sessionA.session_id] = {};
      
      for (let j = 0; j < profiles.length; j++) {
        const sessionB = profiles[j];
        
        if (i === j) {
          matrix[sessionA.session_id][sessionB.session_id] = 1.0; // Self-compatibility
          continue;
        }
        
        // Calculate multi-dimensional compatibility
        const compatibility = this.calculateCompatibility(sessionA, sessionB);
        matrix[sessionA.session_id][sessionB.session_id] = compatibility;
        
        console.log(`     🔗 ${sessionA.session_id} ↔ ${sessionB.session_id}: ${compatibility.toFixed(3)}`);
      }
    }
    
    return matrix;
  }

  calculateCompatibility(sessionA, sessionB) {
    let compatibility = 0;
    
    // DNA vector similarity (cosine similarity)
    const vectorA = Object.values(sessionA.dna_vectors);
    const vectorB = Object.values(sessionB.dna_vectors);
    
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA > 0 && magnitudeB > 0) {
      compatibility += (dotProduct / (magnitudeA * magnitudeB)) * 0.6; // 60% weight
    }
    
    // Concept overlap
    const conceptsA = new Set((sessionA.metadata.concepts || []).map(c => c.toLowerCase()));
    const conceptsB = new Set((sessionB.metadata.concepts || []).map(c => c.toLowerCase()));
    const intersection = new Set([...conceptsA].filter(c => conceptsB.has(c)));
    const union = new Set([...conceptsA, ...conceptsB]);
    
    if (union.size > 0) {
      compatibility += (intersection.size / union.size) * 0.3; // 30% weight
    }
    
    // Intelligence score similarity
    const scoreDiff = Math.abs(sessionA.metadata.intelligence_score - sessionB.metadata.intelligence_score);
    const scoreCompatibility = 1 - (scoreDiff / 100);
    compatibility += scoreCompatibility * 0.1; // 10% weight
    
    return Math.min(1.0, compatibility);
  }

  async determineCrossPollination(compatibilityMatrix) {
    console.log('   🌱 Determining cross-pollination strategy...');
    
    const strategy = {
      amalgamation_groups: [],
      bridge_pairs: [],
      sub_disparate: [],
      cross_pollination_map: new Map()
    };
    
    const sessionIds = Object.keys(compatibilityMatrix);
    const processed = new Set();
    
    // Find amalgamation groups (high compatibility clusters)
    for (const sessionId of sessionIds) {
      if (processed.has(sessionId)) continue;
      
      const compatibleSessions = sessionIds.filter(otherId => 
        compatibilityMatrix[sessionId][otherId] >= this.compatibilityThresholds.amalgamate
      );
      
      if (compatibleSessions.length > 1) {
        strategy.amalgamation_groups.push(compatibleSessions);
        compatibleSessions.forEach(id => processed.add(id));
        console.log(`     🔗 Amalgamation Group: ${compatibleSessions.join(' + ')}`);
      }
    }
    
    // Find bridge pairs (medium compatibility)
    for (const sessionId of sessionIds) {
      for (const otherId of sessionIds) {
        if (sessionId === otherId) continue;
        
        const compatibility = compatibilityMatrix[sessionId][otherId];
        
        if (compatibility >= this.compatibilityThresholds.bridge && 
            compatibility < this.compatibilityThresholds.amalgamate) {
          
          const bridgeKey = [sessionId, otherId].sort().join('↔');
          if (!strategy.cross_pollination_map.has(bridgeKey)) {
            strategy.bridge_pairs.push([sessionId, otherId, compatibility]);
            strategy.cross_pollination_map.set(bridgeKey, compatibility);
            console.log(`     🌉 Bridge Pair: ${sessionId} ↔ ${otherId} (${compatibility.toFixed(3)})`);
          }
        }
      }
    }
    
    // Identify sub-disparate sessions (low compatibility)
    for (const sessionId of sessionIds) {
      const maxCompatibility = Math.max(...sessionIds
        .filter(id => id !== sessionId)
        .map(id => compatibilityMatrix[sessionId][id])
      );
      
      if (maxCompatibility < this.compatibilityThresholds.separate) {
        strategy.sub_disparate.push(sessionId);
        console.log(`     🔄 Sub-Disparate: ${sessionId} (max compatibility: ${maxCompatibility.toFixed(3)})`);
      }
    }
    
    return strategy;
  }

  async generateDNAReport(profiles, compatibilityMatrix, pollination) {
    console.log('   📊 Generating universal DNA report...');
    
    const report = `# Session DNA Analysis Report

**Generated**: ${new Date().toISOString()}  
**Sessions Analyzed**: ${profiles.length}  
**Compatibility Mode**: Universal AI-Agnostic  
**Architecture**: Built on established .md.session format  

## 🧬 DNA Profile Summary

${profiles.map((profile, i) => `
### ${i + 1}. Session: ${profile.session_id}
- **Type**: ${profile.metadata.session_type}
- **Intelligence**: ${profile.metadata.intelligence_score}%
- **DNA Score**: ${profile.compatibility_score.toFixed(3)}
- **Concepts**: ${profile.metadata.concepts.join(', ')}
- **DNA Vectors**:
  - Conceptual: ${profile.dna_vectors.conceptual.toFixed(3)}
  - Technical: ${profile.dna_vectors.technical.toFixed(3)}
  - Achievement: ${profile.dna_vectors.achievement.toFixed(3)}
  - Temporal: ${profile.dna_vectors.temporal.toFixed(3)}
`).join('')}

## 🔗 Cross-Pollination Strategy

### Amalgamation Groups (High Compatibility ≥${this.compatibilityThresholds.amalgamate})
${pollination.amalgamation_groups.length > 0 ? 
  pollination.amalgamation_groups.map((group, i) => `
${i + 1}. **Unified Session**: ${group.join(' + ')}
   - Can be safely merged into single .md.session
   - Shared conceptual DNA enables seamless integration
   - Recommended for culminated universal session
`).join('') : '- No high-compatibility groups found'}

### Bridge Pairs (Medium Compatibility ≥${this.compatibilityThresholds.bridge})
${pollination.bridge_pairs.length > 0 ?
  pollination.bridge_pairs.map(([sessionA, sessionB, compatibility]) => `
- **${sessionA} ↔ ${sessionB}**: ${compatibility.toFixed(3)}
  - Can cross-pollinate via compatibility bridge
  - Selective intelligence siphoning recommended
`).join('') : '- No bridge pairs identified'}

### Sub-Disparate Sessions (Low Compatibility <${this.compatibilityThresholds.separate})
${pollination.sub_disparate.length > 0 ?
  pollination.sub_disparate.map(sessionId => `
- **${sessionId}**: Maintains unique intelligence profile
  - Incompatible with current sessions
  - Preserves individual .md.session identity
`).join('') : '- All sessions have bridge potential'}

## 🤖 Universal AI Compatibility

### Fundamental Principles Used:
- **Semantic Similarity**: Concept-based matching (any AI understands)
- **Pattern Recognition**: Universal achievement/technical patterns
- **Hierarchical Intelligence**: Priority-based compatibility scoring
- **Vector Mathematics**: Language-agnostic similarity calculations

### ML-Ready Architecture:
- **Feature Vectors**: Prepared for future machine learning
- **Compatibility History**: Tracking for adaptive improvements
- **Cross-Pollination Metrics**: Success rate monitoring ready
- **Adaptive Weights**: Self-improving factor importance

## 🚀 Implementation Recommendations

### For Current Session Context:
1. **Implement Cross-Pollination Engine** using this DNA analysis
2. **Create Amalgamated Sessions** from high-compatibility groups
3. **Build Bridge System** for medium-compatibility pairs
4. **Preserve Sub-Disparate** sessions as unique intelligence assets

### For Future Evolution:
- ML algorithm can learn from compatibility patterns
- Adaptive weight adjustment based on cross-pollination success
- Self-improving DNA factor identification
- Automated optimal session combination suggestions

---
*Universal AI-Agnostic Session Intelligence - Built on established .md.session architecture*`;

    await fs.writeFile(path.join(this.outputDir, 'dna-analysis-report.md'), report);
    
    // Generate ML-ready compatibility data
    const mlData = {
      profiles: profiles,
      compatibility_matrix: compatibilityMatrix,
      cross_pollination_strategy: pollination,
      ml_features: {
        feature_vectors: profiles.map(p => p.ml_features),
        compatibility_patterns: this.extractCompatibilityPatterns(compatibilityMatrix),
        success_metrics: this.initializeSuccessMetrics()
      }
    };
    
    await fs.writeFile(
      path.join(this.outputDir, 'ml-ready-data.json'), 
      JSON.stringify(mlData, null, 2)
    );
    
    console.log('   📄 Generated: dna-analysis-report.md');
    console.log('   📄 Generated: ml-ready-data.json');
    
    return report;
  }

  extractCompatibilityPatterns(matrix) {
    const patterns = [];
    const sessionIds = Object.keys(matrix);
    
    for (const sessionA of sessionIds) {
      for (const sessionB of sessionIds) {
        if (sessionA !== sessionB) {
          patterns.push({
            session_pair: [sessionA, sessionB],
            compatibility: matrix[sessionA][sessionB],
            pattern_type: this.classifyCompatibilityPattern(matrix[sessionA][sessionB])
          });
        }
      }
    }
    
    return patterns;
  }

  classifyCompatibilityPattern(compatibility) {
    if (compatibility >= this.compatibilityThresholds.amalgamate) return 'amalgamation';
    if (compatibility >= this.compatibilityThresholds.bridge) return 'bridge';
    return 'sub_disparate';
  }

  initializeSuccessMetrics() {
    return {
      amalgamation_success_rate: 0,
      bridge_effectiveness: 0,
      cross_pollination_quality: 0,
      ml_prediction_accuracy: 0
    };
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new SessionDNAAnalyzer();

  async function main() {
    try {
      const results = await analyzer.analyzeDNA();
      
      console.log('\\n🎉 SESSION DNA ANALYSIS COMPLETE!');
      console.log(`📊 Profiles: ${results.dnaProfiles.length}`);
      console.log(`🔗 Amalgamation Groups: ${results.pollination.amalgamation_groups.length}`);
      console.log(`🌉 Bridge Pairs: ${results.pollination.bridge_pairs.length}`);
      console.log(`🔄 Sub-Disparate: ${results.pollination.sub_disparate.length}`);
      console.log('📁 Reports: session-dna/');
      console.log('🚀 Ready for Cross-Pollination Engine!');
      
    } catch (error) {
      console.error('❌ DNA analysis failed:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = SessionDNAAnalyzer;