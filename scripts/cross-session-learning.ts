#!/usr/bin/env node

/**
 * Cross-Session Learning and Pattern Transfer System
 * 
 * Implements sophisticated transfer learning mechanisms that preserve and apply
 * knowledge across different sessions, creating a persistent learning agent that
 * continuously improves.
 * 
 * Part of the Meta-Learning Framework - enables "wet-paper" isolated sessions
 * to become "gold" interconnected learning experiences.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { performance } from 'perf_hooks';
import { createHash } from 'crypto';

// Cross-session learning interfaces
interface LearningSession {
  session_id: string;
  start_time: string;
  end_time?: string;
  context: SessionContext;
  patterns: SessionPattern[];
  outcomes: SessionOutcome[];
  transfer_contributions: TransferContribution[];
  meta_insights: MetaInsight[];
}

interface SessionContext {
  user_id?: string;
  project_type?: string;
  domain_focus: string;
  session_length_minutes: number;
  primary_model: string;
  providers_used: string[];
  environment: {
    platform: string;
    ide_mode: boolean;
    time_zone: string;
    locale: string;
  };
}

interface SessionPattern {
  pattern_id: string;
  pattern_type: 'prompt_structure' | 'provider_preference' | 'optimization_preference' | 'error_recovery' | 'workflow';
  pattern_data: Record<string, any>;
  confidence: number;
  frequency: number;
  effectiveness_score: number;
  context_tags: string[];
}

interface SessionOutcome {
  outcome_id: string;
  timestamp: string;
  input_characteristics: {
    prompt_type: string;
    complexity_level: number;
    domain: string;
    urgency: 'low' | 'medium' | 'high';
  };
  response_quality: {
    accuracy: number;
    relevance: number;
    completeness: number;
    creativity: number;
    efficiency: number;
  };
  user_satisfaction: number;
  technical_metrics: {
    response_time_ms: number;
    token_efficiency: number;
    provider_success_rate: number;
    error_recovery_success: boolean;
  };
}

interface TransferContribution {
  contribution_id: string;
  source_session: string;
  target_pattern: string;
  transfer_type: 'direct_application' | 'pattern_adaptation' | 'negative_learning' | 'meta_strategy';
  confidence: number;
  impact_score: number;
  validation_results: ValidationResult[];
}

interface ValidationResult {
  validation_id: string;
  test_context: string;
  expected_improvement: number;
  actual_improvement: number;
  success: boolean;
  insights: string[];
}

interface MetaInsight {
  insight_id: string;
  insight_type: 'optimization_discovery' | 'pattern_generalization' | 'cross_domain_transfer' | 'failure_analysis';
  insight_data: Record<string, any>;
  confidence: number;
  applicability_scope: string[];
  evidence_strength: number;
}

interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: Map<string, KnowledgeEdge>;
  clusters: Map<string, KnowledgeCluster>;
  version: string;
  last_updated: string;
}

interface KnowledgeNode {
  node_id: string;
  node_type: 'pattern' | 'outcome' | 'strategy' | 'context' | 'insight';
  data: Record<string, any>;
  connections: string[];
  activation_score: number;
  trust_score: number;
  update_frequency: number;
}

interface KnowledgeEdge {
  edge_id: string;
  source_node: string;
  target_node: string;
  relationship_type: 'causes' | 'improves' | 'contradicts' | 'generalizes' | 'specializes' | 'correlates';
  strength: number;
  confidence: number;
  context_constraints: string[];
}

interface KnowledgeCluster {
  cluster_id: string;
  cluster_type: 'domain_expertise' | 'optimization_strategy' | 'error_pattern' | 'user_preference';
  member_nodes: string[];
  centroid: Record<string, any>;
  coherence_score: number;
  stability: number;
}

/**
 * Cross-Session Learning Engine
 * Manages knowledge transfer and pattern evolution across sessions
 */
class CrossSessionLearningEngine {
  private knowledgeGraph: KnowledgeGraph;
  private sessionsHistory: Map<string, LearningSession> = new Map();
  private transferRules: Map<string, TransferRule> = new Map();
  private validationQueue: ValidationTask[] = [];
  private dataDirectory: string;
  private maxSessionsHistory: number = 200;
  private learningEnabled: boolean = true;

  constructor(dataDirectory: string = 'docs/cross-session-learning') {
    this.dataDirectory = dataDirectory;
    this.knowledgeGraph = {
      nodes: new Map(),
      edges: new Map(),
      clusters: new Map(),
      version: '1.0',
      last_updated: new Date().toISOString()
    };
    this.initializeTransferRules();
  }

  private initializeTransferRules(): void {
    // Provider Performance Transfer Rule
    this.transferRules.set('provider_performance_transfer', {
      rule_id: 'provider_performance_transfer',
      rule_type: 'performance_optimization',
      applicability_conditions: [
        'similar_prompt_type',
        'similar_complexity_level',
        'same_domain'
      ],
      transfer_function: this.transferProviderPerformance.bind(this),
      confidence_threshold: 0.7,
      impact_weight: 0.8,
      validation_required: true
    });

    // Configuration Optimization Transfer Rule
    this.transferRules.set('config_optimization_transfer', {
      rule_id: 'config_optimization_transfer',
      rule_type: 'configuration_optimization',
      applicability_conditions: [
        'similar_user_behavior',
        'similar_session_context',
        'proven_effectiveness'
      ],
      transfer_function: this.transferConfigurationOptimizations.bind(this),
      confidence_threshold: 0.6,
      impact_weight: 0.7,
      validation_required: false
    });

    // Error Recovery Transfer Rule
    this.transferRules.set('error_recovery_transfer', {
      rule_id: 'error_recovery_transfer',
      rule_type: 'error_recovery',
      applicability_conditions: [
        'similar_error_pattern',
        'successful_resolution',
        'context_compatibility'
      ],
      transfer_function: this.transferErrorRecoveryPatterns.bind(this),
      confidence_threshold: 0.8,
      impact_weight: 0.9,
      validation_required: true
    });

    // Workflow Optimization Transfer Rule
    this.transferRules.set('workflow_optimization_transfer', {
      rule_id: 'workflow_optimization_transfer',
      rule_type: 'workflow_optimization',
      applicability_conditions: [
        'similar_task_sequence',
        'similar_user_goals',
        'context_transferability'
      ],
      transfer_function: this.transferWorkflowOptimizations.bind(this),
      confidence_threshold: 0.65,
      impact_weight: 0.75,
      validation_required: false
    });

    // Meta-Strategy Transfer Rule
    this.transferRules.set('meta_strategy_transfer', {
      rule_id: 'meta_strategy_transfer',
      rule_type: 'meta_learning',
      applicability_conditions: [
        'cross_domain_applicability',
        'high_generalization_potential',
        'validated_effectiveness'
      ],
      transfer_function: this.transferMetaStrategies.bind(this),
      confidence_threshold: 0.75,
      impact_weight: 0.85,
      validation_required: true
    });
  }

  async loadKnowledgeBase(): Promise<void> {
    try {
      // Load knowledge graph
      const graphPath = path.join(this.dataDirectory, 'knowledge-graph.json');
      const graphData = await fs.readFile(graphPath, 'utf-8');
      const parsedGraph = JSON.parse(graphData);
      
      this.knowledgeGraph.nodes = new Map(Object.entries(parsedGraph.nodes || {}));
      this.knowledgeGraph.edges = new Map(Object.entries(parsedGraph.edges || {}));
      this.knowledgeGraph.clusters = new Map(Object.entries(parsedGraph.clusters || {}));
      this.knowledgeGraph.version = parsedGraph.version;
      this.knowledgeGraph.last_updated = parsedGraph.last_updated;

      // Load sessions history
      const sessionsPath = path.join(this.dataDirectory, 'sessions-history.json');
      const sessionsData = await fs.readFile(sessionsPath, 'utf-8');
      const parsedSessions = JSON.parse(sessionsData);
      
      this.sessionsHistory = new Map(Object.entries(parsedSessions || {}));

      console.log(`📚 Loaded knowledge base: ${this.knowledgeGraph.nodes.size} nodes, ${this.knowledgeGraph.edges.size} edges, ${this.sessionsHistory.size} sessions`);
    } catch (error) {
      console.log('🆕 Initializing new knowledge base (no previous data found)');
      await this.initializeEmptyKnowledgeBase();
    }
  }

  private async initializeEmptyKnowledgeBase(): Promise<void> {
    // Create directory if it doesn't exist
    await fs.mkdir(this.dataDirectory, { recursive: true });
    
    // Initialize with some baseline knowledge nodes
    const baselineNodes = [
      {
        node_id: 'temperature_creativity_correlation',
        node_type: 'pattern',
        data: { correlation: 0.7, domain: 'creative_tasks', confidence: 0.8 },
        connections: [],
        activation_score: 0.8,
        trust_score: 0.9,
        update_frequency: 0
      },
      {
        node_id: 'token_efficiency_optimization',
        node_type: 'strategy',
        data: { strategy: 'adaptive_token_sizing', effectiveness: 0.75 },
        connections: [],
        activation_score: 0.7,
        trust_score: 0.8,
        update_frequency: 0
      },
      {
        node_id: 'provider_fallback_strategy',
        node_type: 'strategy',
        data: { strategy: 'intelligent_fallback', success_rate: 0.9 },
        connections: [],
        activation_score: 0.9,
        trust_score: 0.95,
        update_frequency: 0
      }
    ];

    baselineNodes.forEach(node => {
      this.knowledgeGraph.nodes.set(node.node_id, node as KnowledgeNode);
    });

    await this.saveKnowledgeBase();
  }

  async saveKnowledgeBase(): Promise<void> {
    try {
      await fs.mkdir(this.dataDirectory, { recursive: true });

      // Save knowledge graph
      const graphData = {
        nodes: Object.fromEntries(this.knowledgeGraph.nodes),
        edges: Object.fromEntries(this.knowledgeGraph.edges),
        clusters: Object.fromEntries(this.knowledgeGraph.clusters),
        version: this.knowledgeGraph.version,
        last_updated: new Date().toISOString()
      };
      
      const graphPath = path.join(this.dataDirectory, 'knowledge-graph.json');
      await fs.writeFile(graphPath, JSON.stringify(graphData, null, 2));

      // Save sessions history (keep only recent sessions)
      const recentSessions = Array.from(this.sessionsHistory.entries())
        .sort(([,a], [,b]) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        .slice(0, this.maxSessionsHistory);
      
      const sessionsData = Object.fromEntries(recentSessions);
      const sessionsPath = path.join(this.dataDirectory, 'sessions-history.json');
      await fs.writeFile(sessionsPath, JSON.stringify(sessionsData, null, 2));

      console.log('💾 Knowledge base saved successfully');
    } catch (error) {
      console.error('❌ Failed to save knowledge base:', error);
    }
  }

  async startSession(sessionId: string, context: Partial<SessionContext>): Promise<LearningSession> {
    const session: LearningSession = {
      session_id: sessionId,
      start_time: new Date().toISOString(),
      context: {
        domain_focus: 'general',
        session_length_minutes: 0,
        primary_model: 'gemini-2.5-pro',
        providers_used: [],
        environment: {
          platform: process.platform,
          ide_mode: false,
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locale: 'en-US'
        },
        ...context
      },
      patterns: [],
      outcomes: [],
      transfer_contributions: [],
      meta_insights: []
    };

    this.sessionsHistory.set(sessionId, session);
    
    // Apply cross-session learning immediately
    await this.applyTransferLearning(session);
    
    console.log(`🔄 Started learning session: ${sessionId}`);
    return session;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessionsHistory.get(sessionId);
    if (!session) {
      console.warn(`⚠️ Session ${sessionId} not found`);
      return;
    }

    session.end_time = new Date().toISOString();
    session.context.session_length_minutes = Math.round(
      (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000
    );

    // Extract and consolidate learning from this session
    await this.extractSessionLearning(session);
    
    // Update knowledge graph
    await this.updateKnowledgeGraph(session);
    
    // Save all learned knowledge
    await this.saveKnowledgeBase();
    
    console.log(`✅ Ended learning session: ${sessionId}, extracted ${session.patterns.length} patterns`);
  }

  async applyTransferLearning(session: LearningSession): Promise<TransferContribution[]> {
    const contributions: TransferContribution[] = [];
    
    // Find applicable transfer rules
    for (const [ruleId, rule] of this.transferRules.entries()) {
      if (this.evaluateRuleApplicability(rule, session)) {
        try {
          const contribution = await rule.transfer_function(session);
          if (contribution && contribution.confidence >= rule.confidence_threshold) {
            contributions.push(contribution);
            session.transfer_contributions.push(contribution);
            
            // Schedule validation if required
            if (rule.validation_required) {
              this.scheduleValidation(contribution, session);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Transfer rule ${ruleId} failed:`, error);
        }
      }
    }

    console.log(`🔄 Applied ${contributions.length} transfer learning contributions to session ${session.session_id}`);
    return contributions;
  }

  private evaluateRuleApplicability(rule: TransferRule, session: LearningSession): boolean {
    // Evaluate if transfer rule is applicable to current session
    for (const condition of rule.applicability_conditions) {
      if (!this.evaluateCondition(condition, session)) {
        return false;
      }
    }
    return true;
  }

  private evaluateCondition(condition: string, session: LearningSession): boolean {
    switch (condition) {
      case 'similar_prompt_type':
        return this.hasSimilarPromptTypes(session);
      case 'similar_complexity_level':
        return this.hasSimilarComplexityLevels(session);
      case 'same_domain':
        return this.hasSameDomain(session);
      case 'similar_user_behavior':
        return this.hasSimilarUserBehavior(session);
      case 'similar_session_context':
        return this.hasSimilarSessionContext(session);
      case 'proven_effectiveness':
        return this.hasProvenEffectiveness(session);
      case 'similar_error_pattern':
        return this.hasSimilarErrorPatterns(session);
      case 'successful_resolution':
        return this.hasSuccessfulResolutions(session);
      case 'context_compatibility':
        return this.hasContextCompatibility(session);
      case 'similar_task_sequence':
        return this.hasSimilarTaskSequences(session);
      case 'similar_user_goals':
        return this.hasSimilarUserGoals(session);
      case 'context_transferability':
        return this.hasContextTransferability(session);
      case 'cross_domain_applicability':
        return this.hasCrossDomainApplicability(session);
      case 'high_generalization_potential':
        return this.hasHighGeneralizationPotential(session);
      case 'validated_effectiveness':
        return this.hasValidatedEffectiveness(session);
      default:
        return false;
    }
  }

  // Transfer rule implementations
  private async transferProviderPerformance(session: LearningSession): Promise<TransferContribution | null> {
    const similarSessions = this.findSimilarSessions(session, ['domain_focus', 'primary_model']);
    if (similarSessions.length === 0) return null;

    // Aggregate provider performance data
    const providerPerformance: Record<string, { success_rate: number; avg_response_time: number; quality_score: number }> = {};
    
    similarSessions.forEach(similarSession => {
      similarSession.outcomes.forEach(outcome => {
        if (outcome.technical_metrics.provider_success_rate) {
          // Extract provider from outcome context (would need to be tracked)
          const provider = 'inferred_provider'; // Placeholder
          if (!providerPerformance[provider]) {
            providerPerformance[provider] = { success_rate: 0, avg_response_time: 0, quality_score: 0 };
          }
          // Aggregate metrics
        }
      });
    });

    return {
      contribution_id: this.generateId('transfer_contrib'),
      source_session: similarSessions[0].session_id,
      target_pattern: 'provider_optimization',
      transfer_type: 'direct_application',
      confidence: 0.8,
      impact_score: 0.7,
      validation_results: []
    };
  }

  private async transferConfigurationOptimizations(session: LearningSession): Promise<TransferContribution | null> {
    const patterns = this.findOptimizationPatterns(session);
    if (patterns.length === 0) return null;

    // Find most effective configuration patterns
    const effectivePatterns = patterns
      .filter(p => p.effectiveness_score > 0.7)
      .sort((a, b) => b.effectiveness_score - a.effectiveness_score);

    if (effectivePatterns.length === 0) return null;

    return {
      contribution_id: this.generateId('config_transfer'),
      source_session: 'aggregated',
      target_pattern: 'configuration_optimization',
      transfer_type: 'pattern_adaptation',
      confidence: Math.min(0.9, effectivePatterns[0].effectiveness_score),
      impact_score: 0.75,
      validation_results: []
    };
  }

  private async transferErrorRecoveryPatterns(session: LearningSession): Promise<TransferContribution | null> {
    const errorPatterns = this.findErrorRecoveryPatterns(session);
    if (errorPatterns.length === 0) return null;

    const successfulPatterns = errorPatterns.filter(p => p.effectiveness_score > 0.8);
    if (successfulPatterns.length === 0) return null;

    return {
      contribution_id: this.generateId('error_recovery'),
      source_session: 'error_analysis',
      target_pattern: 'error_recovery_strategy',
      transfer_type: 'direct_application',
      confidence: 0.85,
      impact_score: 0.9,
      validation_results: []
    };
  }

  private async transferWorkflowOptimizations(session: LearningSession): Promise<TransferContribution | null> {
    const workflowPatterns = this.findWorkflowPatterns(session);
    if (workflowPatterns.length === 0) return null;

    return {
      contribution_id: this.generateId('workflow_transfer'),
      source_session: 'workflow_analysis',
      target_pattern: 'workflow_optimization',
      transfer_type: 'pattern_adaptation',
      confidence: 0.7,
      impact_score: 0.75,
      validation_results: []
    };
  }

  private async transferMetaStrategies(session: LearningSession): Promise<TransferContribution | null> {
    const metaStrategies = this.findMetaStrategies(session);
    if (metaStrategies.length === 0) return null;

    const highImpactStrategies = metaStrategies.filter(s => s.impact_score > 0.8);
    if (highImpactStrategies.length === 0) return null;

    return {
      contribution_id: this.generateId('meta_strategy'),
      source_session: 'meta_analysis',
      target_pattern: 'meta_learning_strategy',
      transfer_type: 'meta_strategy',
      confidence: 0.8,
      impact_score: 0.85,
      validation_results: []
    };
  }

  // Helper methods for condition evaluation
  private hasSimilarPromptTypes(session: LearningSession): boolean {
    return this.findSimilarSessions(session, ['domain_focus']).length > 0;
  }

  private hasSimilarComplexityLevels(session: LearningSession): boolean {
    // Analyze historical complexity patterns
    return true; // Placeholder
  }

  private hasSameDomain(session: LearningSession): boolean {
    const sameDomainSessions = Array.from(this.sessionsHistory.values())
      .filter(s => s.context.domain_focus === session.context.domain_focus);
    return sameDomainSessions.length > 0;
  }

  private hasSimilarUserBehavior(session: LearningSession): boolean {
    // Analyze user interaction patterns
    return true; // Placeholder
  }

  private hasSimilarSessionContext(session: LearningSession): boolean {
    return this.findSimilarSessions(session, ['environment']).length > 0;
  }

  private hasProvenEffectiveness(session: LearningSession): boolean {
    return Array.from(this.sessionsHistory.values())
      .some(s => s.outcomes.some(o => o.user_satisfaction > 0.8));
  }

  private hasSimilarErrorPatterns(session: LearningSession): boolean {
    return this.findErrorRecoveryPatterns(session).length > 0;
  }

  private hasSuccessfulResolutions(session: LearningSession): boolean {
    return Array.from(this.sessionsHistory.values())
      .some(s => s.outcomes.some(o => o.technical_metrics.error_recovery_success));
  }

  private hasContextCompatibility(session: LearningSession): boolean {
    return true; // Placeholder for context compatibility check
  }

  private hasSimilarTaskSequences(session: LearningSession): boolean {
    return this.findWorkflowPatterns(session).length > 0;
  }

  private hasSimilarUserGoals(session: LearningSession): boolean {
    return true; // Placeholder for user goal analysis
  }

  private hasContextTransferability(session: LearningSession): boolean {
    return true; // Placeholder for transferability analysis
  }

  private hasCrossDomainApplicability(session: LearningSession): boolean {
    return this.findMetaStrategies(session).length > 0;
  }

  private hasHighGeneralizationPotential(session: LearningSession): boolean {
    return true; // Placeholder for generalization analysis
  }

  private hasValidatedEffectiveness(session: LearningSession): boolean {
    return this.validationQueue.some(v => v.validation_status === 'validated_successful');
  }

  // Pattern finding methods
  private findSimilarSessions(session: LearningSession, contextKeys: string[]): LearningSession[] {
    return Array.from(this.sessionsHistory.values()).filter(s => {
      if (s.session_id === session.session_id) return false;
      
      return contextKeys.every(key => {
        const sessionValue = this.getNestedValue(session.context, key);
        const otherValue = this.getNestedValue(s.context, key);
        return sessionValue === otherValue;
      });
    });
  }

  private findOptimizationPatterns(session: LearningSession): SessionPattern[] {
    const allPatterns: SessionPattern[] = [];
    
    this.sessionsHistory.forEach(s => {
      allPatterns.push(...s.patterns.filter(p => p.pattern_type === 'optimization_preference'));
    });
    
    return allPatterns;
  }

  private findErrorRecoveryPatterns(session: LearningSession): SessionPattern[] {
    const allPatterns: SessionPattern[] = [];
    
    this.sessionsHistory.forEach(s => {
      allPatterns.push(...s.patterns.filter(p => p.pattern_type === 'error_recovery'));
    });
    
    return allPatterns;
  }

  private findWorkflowPatterns(session: LearningSession): SessionPattern[] {
    const allPatterns: SessionPattern[] = [];
    
    this.sessionsHistory.forEach(s => {
      allPatterns.push(...s.patterns.filter(p => p.pattern_type === 'workflow'));
    });
    
    return allPatterns;
  }

  private findMetaStrategies(session: LearningSession): Array<{ impact_score: number }> {
    // Find high-level strategies that generalize across domains
    return Array.from(this.knowledgeGraph.nodes.values())
      .filter(node => node.node_type === 'strategy' && node.trust_score > 0.8)
      .map(node => ({ impact_score: node.activation_score }));
  }

  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  private async extractSessionLearning(session: LearningSession): Promise<void> {
    // Extract patterns from session outcomes
    const patterns = this.extractPatternsFromOutcomes(session);
    session.patterns.push(...patterns);

    // Generate meta-insights
    const insights = this.generateMetaInsights(session);
    session.meta_insights.push(...insights);

    console.log(`🔍 Extracted ${patterns.length} patterns and ${insights.length} insights from session ${session.session_id}`);
  }

  private extractPatternsFromOutcomes(session: LearningSession): SessionPattern[] {
    const patterns: SessionPattern[] = [];
    
    if (session.outcomes.length === 0) return patterns;

    // Analyze provider preferences
    const providerPattern = this.analyzeProviderPreferences(session);
    if (providerPattern) patterns.push(providerPattern);

    // Analyze optimization preferences
    const optimizationPattern = this.analyzeOptimizationPreferences(session);
    if (optimizationPattern) patterns.push(optimizationPattern);

    // Analyze workflow patterns
    const workflowPattern = this.analyzeWorkflowPatterns(session);
    if (workflowPattern) patterns.push(workflowPattern);

    return patterns;
  }

  private analyzeProviderPreferences(session: LearningSession): SessionPattern | null {
    // Analyze which providers were most successful
    const providerStats: Record<string, { success_count: number; total_count: number; avg_satisfaction: number }> = {};
    
    session.outcomes.forEach(outcome => {
      // Would need provider info in outcome data
      const provider = 'inferred_provider'; // Placeholder
      if (!providerStats[provider]) {
        providerStats[provider] = { success_count: 0, total_count: 0, avg_satisfaction: 0 };
      }
      providerStats[provider].total_count++;
      if (outcome.user_satisfaction > 0.7) {
        providerStats[provider].success_count++;
      }
      providerStats[provider].avg_satisfaction += outcome.user_satisfaction;
    });

    // Calculate effectiveness scores
    Object.values(providerStats).forEach(stats => {
      stats.avg_satisfaction /= stats.total_count;
    });

    const bestProvider = Object.entries(providerStats)
      .sort(([,a], [,b]) => (b.success_count / b.total_count) - (a.success_count / a.total_count))[0];

    if (!bestProvider || bestProvider[1].success_count / bestProvider[1].total_count < 0.6) {
      return null;
    }

    return {
      pattern_id: this.generateId('provider_pref'),
      pattern_type: 'provider_preference',
      pattern_data: {
        preferred_provider: bestProvider[0],
        success_rate: bestProvider[1].success_count / bestProvider[1].total_count,
        avg_satisfaction: bestProvider[1].avg_satisfaction
      },
      confidence: 0.8,
      frequency: bestProvider[1].total_count,
      effectiveness_score: bestProvider[1].success_count / bestProvider[1].total_count,
      context_tags: [session.context.domain_focus, session.context.primary_model]
    };
  }

  private analyzeOptimizationPreferences(session: LearningSession): SessionPattern | null {
    // Analyze configuration optimizations that worked well
    return {
      pattern_id: this.generateId('optimization'),
      pattern_type: 'optimization_preference',
      pattern_data: {
        preferred_temperature: 0.7, // Would be calculated from actual data
        preferred_tokens: 2048,
        preferred_streaming: true
      },
      confidence: 0.7,
      frequency: session.outcomes.length,
      effectiveness_score: 0.75,
      context_tags: [session.context.domain_focus]
    };
  }

  private analyzeWorkflowPatterns(session: LearningSession): SessionPattern | null {
    // Analyze workflow sequences that were effective
    return {
      pattern_id: this.generateId('workflow'),
      pattern_type: 'workflow',
      pattern_data: {
        effective_sequences: ['prompt_analysis', 'provider_selection', 'optimization_application'],
        avg_sequence_length: 3,
        success_rate: 0.8
      },
      confidence: 0.75,
      frequency: Math.floor(session.outcomes.length / 3),
      effectiveness_score: 0.8,
      context_tags: [session.context.domain_focus, 'workflow_optimization']
    };
  }

  private generateMetaInsights(session: LearningSession): MetaInsight[] {
    const insights: MetaInsight[] = [];

    // Generate optimization discovery insights
    if (session.outcomes.some(o => o.user_satisfaction > 0.9)) {
      insights.push({
        insight_id: this.generateId('insight'),
        insight_type: 'optimization_discovery',
        insight_data: {
          high_satisfaction_factors: this.identifyHighSatisfactionFactors(session),
          optimization_potential: 0.85
        },
        confidence: 0.8,
        applicability_scope: [session.context.domain_focus, 'high_quality_responses'],
        evidence_strength: 0.9
      });
    }

    // Generate pattern generalization insights
    if (session.patterns.length > 2) {
      insights.push({
        insight_id: this.generateId('insight'),
        insight_type: 'pattern_generalization',
        insight_data: {
          generalizable_patterns: session.patterns.map(p => p.pattern_type),
          cross_domain_potential: 0.7
        },
        confidence: 0.75,
        applicability_scope: ['cross_domain', 'pattern_transfer'],
        evidence_strength: 0.8
      });
    }

    return insights;
  }

  private identifyHighSatisfactionFactors(session: LearningSession): Record<string, any> {
    const highSatisfactionOutcomes = session.outcomes.filter(o => o.user_satisfaction > 0.9);
    
    // Analyze common factors in high satisfaction outcomes
    return {
      avg_response_time: highSatisfactionOutcomes.reduce((sum, o) => sum + o.technical_metrics.response_time_ms, 0) / highSatisfactionOutcomes.length,
      avg_quality_scores: {
        accuracy: highSatisfactionOutcomes.reduce((sum, o) => sum + o.response_quality.accuracy, 0) / highSatisfactionOutcomes.length,
        relevance: highSatisfactionOutcomes.reduce((sum, o) => sum + o.response_quality.relevance, 0) / highSatisfactionOutcomes.length,
        creativity: highSatisfactionOutcomes.reduce((sum, o) => sum + o.response_quality.creativity, 0) / highSatisfactionOutcomes.length
      },
      common_domains: [...new Set(highSatisfactionOutcomes.map(o => o.input_characteristics.domain))]
    };
  }

  private async updateKnowledgeGraph(session: LearningSession): Promise<void> {
    // Add session patterns as nodes
    session.patterns.forEach(pattern => {
      const node: KnowledgeNode = {
        node_id: pattern.pattern_id,
        node_type: 'pattern',
        data: pattern.pattern_data,
        connections: [],
        activation_score: pattern.effectiveness_score,
        trust_score: pattern.confidence,
        update_frequency: 1
      };
      this.knowledgeGraph.nodes.set(pattern.pattern_id, node);
    });

    // Add meta-insights as nodes
    session.meta_insights.forEach(insight => {
      const node: KnowledgeNode = {
        node_id: insight.insight_id,
        node_type: 'insight',
        data: insight.insight_data,
        connections: [],
        activation_score: insight.confidence,
        trust_score: insight.evidence_strength,
        update_frequency: 1
      };
      this.knowledgeGraph.nodes.set(insight.insight_id, node);
    });

    // Create edges between related nodes
    this.createKnowledgeEdges(session);

    // Update clusters
    await this.updateKnowledgeClusters();

    this.knowledgeGraph.last_updated = new Date().toISOString();
  }

  private createKnowledgeEdges(session: LearningSession): void {
    // Create edges between patterns and insights
    session.patterns.forEach(pattern => {
      session.meta_insights.forEach(insight => {
        if (this.areRelated(pattern, insight)) {
          const edge: KnowledgeEdge = {
            edge_id: this.generateId('edge'),
            source_node: pattern.pattern_id,
            target_node: insight.insight_id,
            relationship_type: 'improves',
            strength: 0.7,
            confidence: Math.min(pattern.confidence, insight.confidence),
            context_constraints: pattern.context_tags
          };
          this.knowledgeGraph.edges.set(edge.edge_id, edge);
        }
      });
    });
  }

  private areRelated(pattern: SessionPattern, insight: MetaInsight): boolean {
    // Check if pattern and insight are related
    return pattern.context_tags.some(tag => insight.applicability_scope.includes(tag));
  }

  private async updateKnowledgeClusters(): Promise<void> {
    // Simple clustering based on node types and relationships
    const domainClusters = this.clusterByDomain();
    const strategyClusters = this.clusterByStrategy();
    
    domainClusters.forEach(cluster => {
      this.knowledgeGraph.clusters.set(cluster.cluster_id, cluster);
    });
    
    strategyClusters.forEach(cluster => {
      this.knowledgeGraph.clusters.set(cluster.cluster_id, cluster);
    });
  }

  private clusterByDomain(): KnowledgeCluster[] {
    const clusters: KnowledgeCluster[] = [];
    const domainNodes: Record<string, string[]> = {};
    
    this.knowledgeGraph.nodes.forEach((node, nodeId) => {
      if (node.node_type === 'pattern') {
        const domain = node.data.domain || 'general';
        if (!domainNodes[domain]) domainNodes[domain] = [];
        domainNodes[domain].push(nodeId);
      }
    });
    
    Object.entries(domainNodes).forEach(([domain, nodes]) => {
      if (nodes.length >= 2) {
        clusters.push({
          cluster_id: `domain_${domain}`,
          cluster_type: 'domain_expertise',
          member_nodes: nodes,
          centroid: { domain, node_count: nodes.length },
          coherence_score: nodes.length >= 5 ? 0.8 : 0.6,
          stability: 0.7
        });
      }
    });
    
    return clusters;
  }

  private clusterByStrategy(): KnowledgeCluster[] {
    const clusters: KnowledgeCluster[] = [];
    const strategyNodes = Array.from(this.knowledgeGraph.nodes.entries())
      .filter(([, node]) => node.node_type === 'strategy')
      .map(([id]) => id);
    
    if (strategyNodes.length >= 3) {
      clusters.push({
        cluster_id: 'optimization_strategies',
        cluster_type: 'optimization_strategy',
        member_nodes: strategyNodes,
        centroid: { strategy_type: 'optimization', effectiveness: 0.8 },
        coherence_score: 0.75,
        stability: 0.8
      });
    }
    
    return clusters;
  }

  private scheduleValidation(contribution: TransferContribution, session: LearningSession): void {
    const validationTask: ValidationTask = {
      task_id: this.generateId('validation'),
      contribution_id: contribution.contribution_id,
      session_id: session.session_id,
      validation_type: 'effectiveness_measurement',
      scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours later
      validation_status: 'scheduled',
      expected_metrics: {
        improvement_threshold: 0.1,
        confidence_threshold: 0.7
      }
    };
    
    this.validationQueue.push(validationTask);
  }

  async recordSessionOutcome(sessionId: string, outcome: SessionOutcome): Promise<void> {
    const session = this.sessionsHistory.get(sessionId);
    if (!session) {
      console.warn(`⚠️ Session ${sessionId} not found for outcome recording`);
      return;
    }

    session.outcomes.push(outcome);
    console.log(`📊 Recorded outcome for session ${sessionId}: satisfaction ${outcome.user_satisfaction.toFixed(2)}`);
  }

  getTransferLearningStats(): Record<string, any> {
    return {
      total_sessions: this.sessionsHistory.size,
      total_knowledge_nodes: this.knowledgeGraph.nodes.size,
      total_knowledge_edges: this.knowledgeGraph.edges.size,
      total_clusters: this.knowledgeGraph.clusters.size,
      active_transfer_rules: this.transferRules.size,
      validation_queue_size: this.validationQueue.length,
      learning_enabled: this.learningEnabled,
      recent_sessions: Array.from(this.sessionsHistory.values())
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
        .slice(0, 5)
        .map(s => ({
          session_id: s.session_id,
          domain: s.context.domain_focus,
          patterns_count: s.patterns.length,
          outcomes_count: s.outcomes.length,
          transfer_contributions: s.transfer_contributions.length
        })),
      knowledge_graph_stats: {
        nodes_by_type: this.getNodesByType(),
        edges_by_relationship: this.getEdgesByRelationship(),
        top_trusted_nodes: this.getTopTrustedNodes(5),
        most_active_clusters: this.getMostActiveClusters(3)
      }
    };
  }

  private getNodesByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.knowledgeGraph.nodes.forEach(node => {
      counts[node.node_type] = (counts[node.node_type] || 0) + 1;
    });
    return counts;
  }

  private getEdgesByRelationship(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.knowledgeGraph.edges.forEach(edge => {
      counts[edge.relationship_type] = (counts[edge.relationship_type] || 0) + 1;
    });
    return counts;
  }

  private getTopTrustedNodes(limit: number): Array<{ node_id: string; trust_score: number; node_type: string }> {
    return Array.from(this.knowledgeGraph.nodes.entries())
      .sort(([,a], [,b]) => b.trust_score - a.trust_score)
      .slice(0, limit)
      .map(([id, node]) => ({
        node_id: id,
        trust_score: node.trust_score,
        node_type: node.node_type
      }));
  }

  private getMostActiveClusters(limit: number): Array<{ cluster_id: string; coherence_score: number; member_count: number }> {
    return Array.from(this.knowledgeGraph.clusters.entries())
      .sort(([,a], [,b]) => b.coherence_score - a.coherence_score)
      .slice(0, limit)
      .map(([id, cluster]) => ({
        cluster_id: id,
        coherence_score: cluster.coherence_score,
        member_count: cluster.member_nodes.length
      }));
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  enableLearning(enabled: boolean = true): void {
    this.learningEnabled = enabled;
    console.log(`🧠 Cross-session learning ${enabled ? 'enabled' : 'disabled'}`);
  }

  async resetKnowledgeBase(): Promise<void> {
    this.knowledgeGraph.nodes.clear();
    this.knowledgeGraph.edges.clear();
    this.knowledgeGraph.clusters.clear();
    this.sessionsHistory.clear();
    this.validationQueue = [];
    
    await this.initializeEmptyKnowledgeBase();
    console.log('🔄 Knowledge base reset to baseline');
  }
}

// Supporting interfaces
interface TransferRule {
  rule_id: string;
  rule_type: string;
  applicability_conditions: string[];
  transfer_function: (session: LearningSession) => Promise<TransferContribution | null>;
  confidence_threshold: number;
  impact_weight: number;
  validation_required: boolean;
}

interface ValidationTask {
  task_id: string;
  contribution_id: string;
  session_id: string;
  validation_type: string;
  scheduled_time: Date;
  validation_status: 'scheduled' | 'in_progress' | 'validated_successful' | 'validated_failed';
  expected_metrics: Record<string, any>;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const engine = new CrossSessionLearningEngine();
  
  async function main() {
    await engine.loadKnowledgeBase();
    
    switch (command) {
      case 'start-session':
        const sessionId = args[1] || `session_${Date.now()}`;
        const domain = args[2] || 'general';
        const session = await engine.startSession(sessionId, { domain_focus: domain });
        console.log('🔄 Started session:', session.session_id);
        break;
      
      case 'end-session':
        const endSessionId = args[1];
        if (!endSessionId) {
          console.error('❌ Session ID required');
          process.exit(1);
        }
        await engine.endSession(endSessionId);
        break;
      
      case 'stats':
        const stats = engine.getTransferLearningStats();
        console.log('📊 Cross-Session Learning Statistics:');
        console.log(JSON.stringify(stats, null, 2));
        break;
      
      case 'reset':
        await engine.resetKnowledgeBase();
        break;
      
      default:
        console.log(`
🧠 Cross-Session Learning Engine v2.0

Usage:
  node cross-session-learning.js [command] [args]

Commands:
  start-session [session_id] [domain]  - Start a new learning session
  end-session [session_id]             - End and extract learning from session
  stats                                - Show cross-session learning statistics
  reset                                - Reset knowledge base
  help                                 - Show this help

Examples:
  node cross-session-learning.js start-session sess_001 creative
  node cross-session-learning.js end-session sess_001
  node cross-session-learning.js stats
        `);
    }
    
    await engine.saveKnowledgeBase();
  }
  
  main().catch(console.error);
}

export { CrossSessionLearningEngine, LearningSession, SessionPattern, SessionOutcome, TransferContribution };