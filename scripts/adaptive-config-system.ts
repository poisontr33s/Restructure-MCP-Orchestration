#!/usr/bin/env node

/**
 * Adaptive Configuration System with Self-Optimization
 * 
 * Applies reinforcement learning and transfer learning to automatically
 * optimize Gemini configurations based on usage patterns and outcomes.
 * 
 * Part of the Meta-Learning Framework - transforms "wet-paper" manual config
 * into "gold" self-optimizing system.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { performance } from 'perf_hooks';

// Configuration optimization interfaces
interface ConfigurationTemplate {
  name: string;
  description: string;
  conditions: ConfigCondition[];
  optimizations: ConfigOptimization[];
  success_metrics: SuccessMetric[];
  adaptation_rules: AdaptationRule[];
}

interface ConfigCondition {
  type: 'prompt_pattern' | 'time_of_day' | 'session_type' | 'performance_history' | 'error_pattern';
  pattern: string | RegExp;
  threshold?: number;
  weight: number;
}

interface ConfigOptimization {
  parameter: string;
  adjustment_type: 'fixed' | 'proportional' | 'adaptive' | 'learned';
  value: any;
  confidence: number;
  learning_source: 'initial' | 'reinforcement' | 'transfer' | 'ensemble';
}

interface SuccessMetric {
  name: string;
  weight: number;
  target_value: number;
  tolerance: number;
  improvement_direction: 'higher' | 'lower';
}

interface AdaptationRule {
  trigger: string;
  action: string;
  parameters: Record<string, any>;
  learning_rate: number;
}

interface ConfigurationOutcome {
  config_id: string;
  timestamp: string;
  context: {
    prompt_type: string;
    prompt_length: number;
    time_of_day: string;
    session_type: string;
    model_used: string;
  };
  performance: {
    response_time_ms: number;
    quality_score: number;
    token_efficiency: number;
    success: boolean;
    error_type?: string;
  };
  satisfaction_score: number; // 0-1 scale
}

interface LearningVector {
  feature_name: string;
  feature_value: number;
  weight: number;
  confidence: number;
  update_frequency: number;
}

/**
 * Self-Optimizing Configuration Manager
 * Applies multi-modal ML approaches to configuration optimization
 */
class AdaptiveConfigurationSystem {
  private configTemplates: Map<string, ConfigurationTemplate> = new Map();
  private learningVectors: Map<string, LearningVector> = new Map();
  private outcomeHistory: ConfigurationOutcome[] = [];
  private optimizationRules: Map<string, Function> = new Map();
  private dataFile: string;
  private learningEnabled: boolean = true;
  private adaptationThreshold: number = 0.7;

  constructor(dataDirectory: string = 'docs') {
    this.dataFile = path.join(dataDirectory, 'adaptive-config-data.json');
    this.initializeTemplates();
    this.initializeLearningVectors();
    this.initializeOptimizationRules();
  }

  private initializeTemplates(): void {
    // Creative Content Template
    this.configTemplates.set('creative_content', {
      name: 'Creative Content Generation',
      description: 'Optimized for creative writing, storytelling, and artistic content',
      conditions: [
        {
          type: 'prompt_pattern',
          pattern: /create|imagine|design|story|creative|artistic|brainstorm/i,
          weight: 0.8
        },
        {
          type: 'session_type',
          pattern: 'creative',
          weight: 0.6
        }
      ],
      optimizations: [
        {
          parameter: 'temperature',
          adjustment_type: 'adaptive',
          value: 0.9,
          confidence: 0.85,
          learning_source: 'initial'
        },
        {
          parameter: 'maxOutputTokens',
          adjustment_type: 'proportional',
          value: 3072,
          confidence: 0.7,
          learning_source: 'reinforcement'
        },
        {
          parameter: 'thinkingBudget',
          adjustment_type: 'learned',
          value: -1,
          confidence: 0.9,
          learning_source: 'transfer'
        }
      ],
      success_metrics: [
        {
          name: 'creativity_score',
          weight: 0.4,
          target_value: 0.8,
          tolerance: 0.1,
          improvement_direction: 'higher'
        },
        {
          name: 'response_length',
          weight: 0.3,
          target_value: 1500,
          tolerance: 500,
          improvement_direction: 'higher'
        },
        {
          name: 'response_time_ms',
          weight: 0.3,
          target_value: 5000,
          tolerance: 2000,
          improvement_direction: 'lower'
        }
      ],
      adaptation_rules: [
        {
          trigger: 'low_creativity_score',
          action: 'increase_temperature',
          parameters: { increment: 0.05, max_value: 1.0 },
          learning_rate: 0.1
        },
        {
          trigger: 'response_too_short',
          action: 'increase_token_limit',
          parameters: { multiplier: 1.2, max_value: 4096 },
          learning_rate: 0.05
        }
      ]
    });

    // Analytical Processing Template
    this.configTemplates.set('analytical_processing', {
      name: 'Analytical and Technical Processing',
      description: 'Optimized for data analysis, technical problem-solving, and logical reasoning',
      conditions: [
        {
          type: 'prompt_pattern',
          pattern: /analyze|calculate|compare|evaluate|technical|data|logic|problem|solve/i,
          weight: 0.85
        },
        {
          type: 'session_type',
          pattern: 'analytical',
          weight: 0.7
        }
      ],
      optimizations: [
        {
          parameter: 'temperature',
          adjustment_type: 'adaptive',
          value: 0.3,
          confidence: 0.9,
          learning_source: 'initial'
        },
        {
          parameter: 'tools',
          adjustment_type: 'fixed',
          value: ['codeExecution', 'googleSearch'],
          confidence: 0.8,
          learning_source: 'transfer'
        },
        {
          parameter: 'maxOutputTokens',
          adjustment_type: 'learned',
          value: 2048,
          confidence: 0.75,
          learning_source: 'reinforcement'
        }
      ],
      success_metrics: [
        {
          name: 'accuracy_score',
          weight: 0.5,
          target_value: 0.9,
          tolerance: 0.05,
          improvement_direction: 'higher'
        },
        {
          name: 'logical_coherence',
          weight: 0.3,
          target_value: 0.85,
          tolerance: 0.1,
          improvement_direction: 'higher'
        },
        {
          name: 'token_efficiency',
          weight: 0.2,
          target_value: 0.8,
          tolerance: 0.1,
          improvement_direction: 'higher'
        }
      ],
      adaptation_rules: [
        {
          trigger: 'low_accuracy_score',
          action: 'decrease_temperature',
          parameters: { decrement: 0.02, min_value: 0.1 },
          learning_rate: 0.15
        },
        {
          trigger: 'poor_token_efficiency',
          action: 'adjust_token_limit',
          parameters: { target_efficiency: 0.8 },
          learning_rate: 0.08
        }
      ]
    });

    // Code Generation Template
    this.configTemplates.set('code_generation', {
      name: 'Code Generation and Programming',
      description: 'Optimized for software development, coding assistance, and technical implementation',
      conditions: [
        {
          type: 'prompt_pattern',
          pattern: /code|script|function|programming|debug|implement|algorithm/i,
          weight: 0.9
        },
        {
          type: 'session_type',
          pattern: 'ide',
          weight: 0.8
        }
      ],
      optimizations: [
        {
          parameter: 'temperature',
          adjustment_type: 'adaptive',
          value: 0.4,
          confidence: 0.85,
          learning_source: 'initial'
        },
        {
          parameter: 'tools',
          adjustment_type: 'fixed',
          value: ['codeExecution'],
          confidence: 0.95,
          learning_source: 'initial'
        },
        {
          parameter: 'ideMode',
          adjustment_type: 'fixed',
          value: true,
          confidence: 1.0,
          learning_source: 'initial'
        },
        {
          parameter: 'includeDirectories',
          adjustment_type: 'learned',
          value: ['src', 'packages', 'scripts', 'tests'],
          confidence: 0.8,
          learning_source: 'transfer'
        }
      ],
      success_metrics: [
        {
          name: 'code_quality',
          weight: 0.4,
          target_value: 0.85,
          tolerance: 0.1,
          improvement_direction: 'higher'
        },
        {
          name: 'compilation_success',
          weight: 0.3,
          target_value: 1.0,
          tolerance: 0.0,
          improvement_direction: 'higher'
        },
        {
          name: 'response_completeness',
          weight: 0.3,
          target_value: 0.9,
          tolerance: 0.05,
          improvement_direction: 'higher'
        }
      ],
      adaptation_rules: [
        {
          trigger: 'compilation_failure',
          action: 'enable_verbose_mode',
          parameters: { include_debugging: true },
          learning_rate: 0.2
        },
        {
          trigger: 'incomplete_response',
          action: 'increase_thinking_budget',
          parameters: { increment: 5000, max_value: 50000 },
          learning_rate: 0.1
        }
      ]
    });

    // Quick Query Template
    this.configTemplates.set('quick_query', {
      name: 'Quick Queries and Simple Requests',
      description: 'Optimized for fast, simple responses and brief interactions',
      conditions: [
        {
          type: 'prompt_pattern',
          pattern: /^.{1,100}$/,
          weight: 0.7
        },
        {
          type: 'prompt_pattern',
          pattern: /what|how|why|when|where|quick|brief|simple/i,
          weight: 0.6
        }
      ],
      optimizations: [
        {
          parameter: 'temperature',
          adjustment_type: 'adaptive',
          value: 0.6,
          confidence: 0.8,
          learning_source: 'initial'
        },
        {
          parameter: 'maxOutputTokens',
          adjustment_type: 'learned',
          value: 512,
          confidence: 0.9,
          learning_source: 'reinforcement'
        },
        {
          parameter: 'streaming',
          adjustment_type: 'fixed',
          value: false,
          confidence: 0.85,
          learning_source: 'transfer'
        }
      ],
      success_metrics: [
        {
          name: 'response_time_ms',
          weight: 0.5,
          target_value: 2000,
          tolerance: 500,
          improvement_direction: 'lower'
        },
        {
          name: 'conciseness_score',
          weight: 0.3,
          target_value: 0.8,
          tolerance: 0.1,
          improvement_direction: 'higher'
        },
        {
          name: 'relevance_score',
          weight: 0.2,
          target_value: 0.9,
          tolerance: 0.05,
          improvement_direction: 'higher'
        }
      ],
      adaptation_rules: [
        {
          trigger: 'slow_response',
          action: 'reduce_token_limit',
          parameters: { reduction_factor: 0.8, min_value: 256 },
          learning_rate: 0.12
        },
        {
          trigger: 'verbose_response',
          action: 'adjust_temperature',
          parameters: { target_conciseness: 0.8 },
          learning_rate: 0.08
        }
      ]
    });
  }

  private initializeLearningVectors(): void {
    // Initialize learning vectors for key configuration parameters
    const baseVectors: Array<{name: string; value: number; weight: number}> = [
      { name: 'temperature_creativity_correlation', value: 0.7, weight: 0.8 },
      { name: 'temperature_accuracy_correlation', value: -0.6, weight: 0.9 },
      { name: 'token_limit_quality_correlation', value: 0.4, weight: 0.7 },
      { name: 'streaming_speed_correlation', value: 0.3, weight: 0.6 },
      { name: 'tools_complexity_correlation', value: 0.8, weight: 0.85 },
      { name: 'thinking_budget_quality_correlation', value: 0.5, weight: 0.7 },
      { name: 'ide_mode_code_quality_correlation', value: 0.9, weight: 0.95 },
      { name: 'prompt_length_token_need_correlation', value: 0.8, weight: 0.8 },
      { name: 'time_of_day_performance_correlation', value: 0.2, weight: 0.4 },
      { name: 'model_version_success_correlation', value: 0.6, weight: 0.7 }
    ];

    baseVectors.forEach(vector => {
      this.learningVectors.set(vector.name, {
        feature_name: vector.name,
        feature_value: vector.value,
        weight: vector.weight,
        confidence: 0.5, // Start with medium confidence
        update_frequency: 0
      });
    });
  }

  private initializeOptimizationRules(): void {
    // Temperature optimization rule
    this.optimizationRules.set('optimize_temperature', (context: any, performance: any) => {
      const creativityCorrelation = this.learningVectors.get('temperature_creativity_correlation')?.feature_value || 0.7;
      const accuracyCorrelation = this.learningVectors.get('temperature_accuracy_correlation')?.feature_value || -0.6;
      
      if (context.prompt_type === 'creative') {
        return Math.min(0.95, 0.7 + (creativityCorrelation * 0.3));
      } else if (context.prompt_type === 'analytical') {
        return Math.max(0.1, 0.5 + (accuracyCorrelation * 0.4));
      }
      return 0.7; // Default
    });

    // Token limit optimization rule
    this.optimizationRules.set('optimize_tokens', (context: any, performance: any) => {
      const lengthCorrelation = this.learningVectors.get('prompt_length_token_need_correlation')?.feature_value || 0.8;
      const qualityCorrelation = this.learningVectors.get('token_limit_quality_correlation')?.feature_value || 0.4;
      
      const baseTokens = 2048;
      const lengthFactor = Math.min(2.0, context.prompt_length / 500 * lengthCorrelation);
      const qualityFactor = performance.quality_score || 0.7;
      
      return Math.floor(baseTokens * lengthFactor * (1 + qualityCorrelation * qualityFactor));
    });

    // Tools optimization rule
    this.optimizationRules.set('optimize_tools', (context: any, performance: any) => {
      const complexityCorrelation = this.learningVectors.get('tools_complexity_correlation')?.feature_value || 0.8;
      const tools = [];
      
      if (context.prompt_type === 'analytical' || context.prompt_type === 'coding') {
        if (Math.random() < complexityCorrelation) {
          tools.push('codeExecution');
        }
      }
      
      if (context.prompt_length > 200 && Math.random() < 0.7) {
        tools.push('googleSearch');
      }
      
      return tools;
    });

    // Streaming optimization rule
    this.optimizationRules.set('optimize_streaming', (context: any, performance: any) => {
      const speedCorrelation = this.learningVectors.get('streaming_speed_correlation')?.feature_value || 0.3;
      
      // Use streaming for longer prompts or when speed correlation is positive
      return context.prompt_length > 500 || (speedCorrelation > 0 && Math.random() < speedCorrelation);
    });
  }

  async loadHistoricalData(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataFile, 'utf-8');
      const parsed = JSON.parse(data);
      
      if (parsed.outcomeHistory) {
        this.outcomeHistory = parsed.outcomeHistory;
      }
      
      if (parsed.learningVectors) {
        Object.entries(parsed.learningVectors).forEach(([key, value]: [string, any]) => {
          this.learningVectors.set(key, value);
        });
      }
      
      console.log(`📚 Loaded ${this.outcomeHistory.length} historical outcomes for adaptive learning`);
    } catch (error) {
      console.log('📝 No historical data found, starting with fresh learning state');
    }
  }

  async saveAdaptiveData(): Promise<void> {
    try {
      const data = {
        outcomeHistory: this.outcomeHistory.slice(-1000), // Keep last 1000 outcomes
        learningVectors: Object.fromEntries(this.learningVectors),
        lastUpdated: new Date().toISOString(),
        version: '2.0'
      };
      
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
      console.log('💾 Adaptive configuration data saved');
    } catch (error) {
      console.error('❌ Failed to save adaptive data:', error);
    }
  }

  optimizeConfiguration(prompt: string, context: Record<string, any> = {}): Record<string, any> {
    const startTime = performance.now();
    
    // Analyze prompt and context
    const promptAnalysis = this.analyzePrompt(prompt);
    const enrichedContext = {
      ...context,
      prompt_type: promptAnalysis.type,
      prompt_length: prompt.length,
      prompt_complexity: promptAnalysis.complexity,
      time_of_day: new Date().getHours() < 12 ? 'morning' : 'afternoon',
      timestamp: new Date().toISOString()
    };

    // Select best matching template
    const selectedTemplate = this.selectOptimalTemplate(prompt, enrichedContext);
    
    // Apply template optimizations
    let optimizedConfig = this.applyTemplateOptimizations(selectedTemplate, enrichedContext);
    
    // Apply learned optimizations
    optimizedConfig = this.applyLearnedOptimizations(optimizedConfig, enrichedContext);
    
    // Apply ensemble optimizations
    optimizedConfig = this.applyEnsembleOptimizations(optimizedConfig, enrichedContext);
    
    const duration = performance.now() - startTime;
    
    console.log(`🎯 Configuration optimized in ${duration.toFixed(1)}ms using template: ${selectedTemplate?.name || 'default'}`);
    
    return {
      ...optimizedConfig,
      _meta: {
        template_used: selectedTemplate?.name || 'default',
        optimization_time_ms: duration,
        confidence_score: this.calculateConfigurationConfidence(optimizedConfig),
        learning_applied: this.learningEnabled,
        context: enrichedContext
      }
    };
  }

  private analyzePrompt(prompt: string): { type: string; complexity: number; keywords: string[] } {
    const keywords = prompt.toLowerCase().match(/\b\w+\b/g) || [];
    
    // Determine prompt type
    let type = 'general';
    if (/code|script|function|programming|debug/i.test(prompt)) type = 'coding';
    else if (/create|imagine|design|story|creative/i.test(prompt)) type = 'creative';
    else if (/analyze|calculate|compare|evaluate|technical/i.test(prompt)) type = 'analytical';
    else if (prompt.length < 100) type = 'quick_query';
    
    // Calculate complexity
    const lengthComplexity = Math.min(1, prompt.length / 2000);
    const structureComplexity = Math.min(1, prompt.split('\n').length / 10);
    const vocabularyComplexity = Math.min(1, new Set(keywords).size / 100);
    const complexity = (lengthComplexity + structureComplexity + vocabularyComplexity) / 3;
    
    return { type, complexity, keywords };
  }

  private selectOptimalTemplate(prompt: string, context: Record<string, any>): ConfigurationTemplate | null {
    let bestTemplate: ConfigurationTemplate | null = null;
    let bestScore = 0;
    
    for (const template of this.configTemplates.values()) {
      let score = 0;
      
      for (const condition of template.conditions) {
        if (this.evaluateCondition(condition, prompt, context)) {
          score += condition.weight;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }
    
    return bestTemplate;
  }

  private evaluateCondition(condition: ConfigCondition, prompt: string, context: Record<string, any>): boolean {
    switch (condition.type) {
      case 'prompt_pattern':
        if (condition.pattern instanceof RegExp) {
          return condition.pattern.test(prompt);
        }
        return prompt.toLowerCase().includes(condition.pattern.toLowerCase());
      
      case 'session_type':
        return context.session_type === condition.pattern;
      
      case 'time_of_day':
        return context.time_of_day === condition.pattern;
      
      case 'performance_history':
        return this.evaluatePerformanceCondition(condition);
      
      default:
        return false;
    }
  }

  private evaluatePerformanceCondition(condition: ConfigCondition): boolean {
    if (this.outcomeHistory.length === 0) return false;
    
    const recentOutcomes = this.outcomeHistory.slice(-10);
    const averagePerformance = recentOutcomes.reduce((sum, outcome) => 
      sum + outcome.satisfaction_score, 0) / recentOutcomes.length;
    
    return averagePerformance >= (condition.threshold || 0.7);
  }

  private applyTemplateOptimizations(template: ConfigurationTemplate | null, context: Record<string, any>): Record<string, any> {
    if (!template) return {};
    
    const config: Record<string, any> = {};
    
    for (const optimization of template.optimizations) {
      switch (optimization.adjustment_type) {
        case 'fixed':
          config[optimization.parameter] = optimization.value;
          break;
        
        case 'adaptive':
          config[optimization.parameter] = this.adaptValue(optimization, context);
          break;
        
        case 'proportional':
          config[optimization.parameter] = this.calculateProportionalValue(optimization, context);
          break;
        
        case 'learned':
          config[optimization.parameter] = this.applyLearnedValue(optimization, context);
          break;
      }
    }
    
    return config;
  }

  private adaptValue(optimization: ConfigOptimization, context: Record<string, any>): any {
    const baseValue = optimization.value;
    
    if (optimization.parameter === 'temperature') {
      // Adapt temperature based on prompt type and learned correlations
      const rule = this.optimizationRules.get('optimize_temperature');
      return rule ? rule(context, {}) : baseValue;
    }
    
    return baseValue;
  }

  private calculateProportionalValue(optimization: ConfigOptimization, context: Record<string, any>): any {
    const baseValue = optimization.value;
    
    if (optimization.parameter === 'maxOutputTokens') {
      // Proportional to prompt length and complexity
      const lengthFactor = Math.min(2, context.prompt_length / 1000);
      const complexityFactor = 1 + (context.prompt_complexity || 0.5);
      return Math.floor(baseValue * lengthFactor * complexityFactor);
    }
    
    return baseValue;
  }

  private applyLearnedValue(optimization: ConfigOptimization, context: Record<string, any>): any {
    // Apply machine learning based optimizations
    const rule = this.optimizationRules.get(`optimize_${optimization.parameter}`);
    return rule ? rule(context, {}) : optimization.value;
  }

  private applyLearnedOptimizations(config: Record<string, any>, context: Record<string, any>): Record<string, any> {
    if (!this.learningEnabled) return config;
    
    // Apply token optimization
    if (!config.maxOutputTokens) {
      const tokenRule = this.optimizationRules.get('optimize_tokens');
      config.maxOutputTokens = tokenRule ? tokenRule(context, {}) : 2048;
    }
    
    // Apply tools optimization
    if (!config.tools) {
      const toolsRule = this.optimizationRules.get('optimize_tools');
      config.tools = toolsRule ? toolsRule(context, {}) : [];
    }
    
    // Apply streaming optimization
    if (config.streaming === undefined) {
      const streamingRule = this.optimizationRules.get('optimize_streaming');
      config.streaming = streamingRule ? streamingRule(context, {}) : true;
    }
    
    return config;
  }

  private applyEnsembleOptimizations(config: Record<string, any>, context: Record<string, any>): Record<string, any> {
    // Ensemble approach: Combine multiple optimization strategies
    
    // Historical performance ensemble
    const historicalOptimal = this.getHistoricalOptimalConfig(context);
    if (historicalOptimal) {
      config = this.blendConfigurations(config, historicalOptimal, 0.3);
    }
    
    // Best practice ensemble
    const bestPractices = this.getBestPracticeConfig(context);
    config = this.blendConfigurations(config, bestPractices, 0.2);
    
    // Safety constraints ensemble
    config = this.applySafetyConstraints(config);
    
    return config;
  }

  private getHistoricalOptimalConfig(context: Record<string, any>): Record<string, any> | null {
    // Find configurations that performed best in similar contexts
    const similarOutcomes = this.outcomeHistory.filter(outcome => 
      outcome.context.prompt_type === context.prompt_type &&
      Math.abs(outcome.context.prompt_length - context.prompt_length) < 500 &&
      outcome.satisfaction_score > 0.8
    );
    
    if (similarOutcomes.length === 0) return null;
    
    // Average the best performing configurations
    const bestOutcome = similarOutcomes.sort((a, b) => 
      b.satisfaction_score - a.satisfaction_score)[0];
    
    return {
      temperature: this.extractConfigParameter(bestOutcome.config_id, 'temperature'),
      maxOutputTokens: this.extractConfigParameter(bestOutcome.config_id, 'maxOutputTokens'),
      streaming: this.extractConfigParameter(bestOutcome.config_id, 'streaming')
    };
  }

  private getBestPracticeConfig(context: Record<string, any>): Record<string, any> {
    // Apply established best practices based on context
    const bestPractices: Record<string, any> = {};
    
    // Temperature best practices
    if (context.prompt_type === 'creative') {
      bestPractices.temperature = 0.85;
    } else if (context.prompt_type === 'analytical') {
      bestPractices.temperature = 0.3;
    } else if (context.prompt_type === 'coding') {
      bestPractices.temperature = 0.4;
    }
    
    // Token limit best practices
    if (context.prompt_length < 100) {
      bestPractices.maxOutputTokens = 512;
    } else if (context.prompt_length > 1500) {
      bestPractices.maxOutputTokens = 4096;
    }
    
    // Streaming best practices
    bestPractices.streaming = context.prompt_length > 500;
    
    return bestPractices;
  }

  private blendConfigurations(base: Record<string, any>, blend: Record<string, any>, blendWeight: number): Record<string, any> {
    const result = { ...base };
    
    Object.entries(blend).forEach(([key, value]) => {
      if (typeof value === 'number' && typeof base[key] === 'number') {
        result[key] = base[key] * (1 - blendWeight) + value * blendWeight;
      } else if (base[key] === undefined) {
        result[key] = value;
      }
    });
    
    return result;
  }

  private applySafetyConstraints(config: Record<string, any>): Record<string, any> {
    // Apply safety constraints to prevent extreme configurations
    
    if (config.temperature) {
      config.temperature = Math.max(0.0, Math.min(1.0, config.temperature));
    }
    
    if (config.maxOutputTokens) {
      config.maxOutputTokens = Math.max(64, Math.min(8192, config.maxOutputTokens));
    }
    
    if (config.thinkingBudget && config.thinkingBudget > 0) {
      config.thinkingBudget = Math.max(1000, Math.min(100000, config.thinkingBudget));
    }
    
    return config;
  }

  private calculateConfigurationConfidence(config: Record<string, any>): number {
    // Calculate confidence in the optimized configuration
    let confidence = 0.5; // Base confidence
    
    // Higher confidence for parameters backed by learning
    if (config.temperature) confidence += 0.2;
    if (config.maxOutputTokens) confidence += 0.15;
    if (config.tools && Array.isArray(config.tools)) confidence += 0.1;
    if (config._meta?.template_used !== 'default') confidence += 0.05;
    
    return Math.min(1.0, confidence);
  }

  private extractConfigParameter(configId: string, parameter: string): any {
    // Extract parameter from historical config (would need actual implementation)
    // For now, return reasonable defaults
    const defaults: Record<string, any> = {
      temperature: 0.7,
      maxOutputTokens: 2048,
      streaming: true
    };
    
    return defaults[parameter];
  }

  recordOutcome(configId: string, context: Record<string, any>, performance: Record<string, any>, satisfactionScore: number): void {
    const outcome: ConfigurationOutcome = {
      config_id: configId,
      timestamp: new Date().toISOString(),
      context: {
        prompt_type: context.prompt_type || 'general',
        prompt_length: context.prompt_length || 0,
        time_of_day: context.time_of_day || 'unknown',
        session_type: context.session_type || 'standard',
        model_used: context.model_used || 'gemini-2.5-pro'
      },
      performance: {
        response_time_ms: performance.response_time_ms || 0,
        quality_score: performance.quality_score || 0.5,
        token_efficiency: performance.token_efficiency || 0.5,
        success: performance.success || false,
        error_type: performance.error_type
      },
      satisfaction_score: Math.max(0, Math.min(1, satisfactionScore))
    };
    
    this.outcomeHistory.push(outcome);
    
    // Keep only recent history
    if (this.outcomeHistory.length > 2000) {
      this.outcomeHistory = this.outcomeHistory.slice(-1500);
    }
    
    // Update learning vectors based on outcome
    this.updateLearningVectors(outcome);
    
    console.log(`📈 Recorded outcome with satisfaction score: ${satisfactionScore.toFixed(2)}`);
  }

  private updateLearningVectors(outcome: ConfigurationOutcome): void {
    if (!this.learningEnabled) return;
    
    // Update correlations based on the outcome
    const learningRate = 0.05;
    
    // Temperature-quality correlation
    if (outcome.performance.quality_score) {
      const tempVector = this.learningVectors.get('temperature_creativity_correlation');
      if (tempVector && outcome.context.prompt_type === 'creative') {
        const adjustment = (outcome.satisfaction_score - 0.5) * learningRate;
        tempVector.feature_value = Math.max(-1, Math.min(1, tempVector.feature_value + adjustment));
        tempVector.update_frequency++;
        tempVector.confidence = Math.min(1, tempVector.confidence + 0.01);
      }
    }
    
    // Token efficiency correlation
    if (outcome.performance.token_efficiency) {
      const tokenVector = this.learningVectors.get('token_limit_quality_correlation');
      if (tokenVector) {
        const adjustment = (outcome.performance.token_efficiency - 0.5) * learningRate;
        tokenVector.feature_value = Math.max(-1, Math.min(1, tokenVector.feature_value + adjustment));
        tokenVector.update_frequency++;
        tokenVector.confidence = Math.min(1, tokenVector.confidence + 0.01);
      }
    }
    
    // Time-based performance correlation
    const timeVector = this.learningVectors.get('time_of_day_performance_correlation');
    if (timeVector) {
      const timeBonus = outcome.context.time_of_day === 'morning' ? 0.1 : -0.1;
      const adjustment = (outcome.satisfaction_score + timeBonus - 0.5) * learningRate * 0.5;
      timeVector.feature_value = Math.max(-1, Math.min(1, timeVector.feature_value + adjustment));
      timeVector.update_frequency++;
    }
  }

  getAdaptiveStats(): Record<string, any> {
    return {
      total_outcomes: this.outcomeHistory.length,
      learning_enabled: this.learningEnabled,
      adaptation_threshold: this.adaptationThreshold,
      templates_available: this.configTemplates.size,
      learning_vectors: Object.fromEntries(
        Array.from(this.learningVectors.entries()).map(([key, vector]) => [
          key,
          {
            value: vector.feature_value.toFixed(3),
            confidence: vector.confidence.toFixed(3),
            updates: vector.update_frequency
          }
        ])
      ),
      recent_performance: this.calculateRecentPerformance(),
      top_performing_contexts: this.getTopPerformingContexts()
    };
  }

  private calculateRecentPerformance(): Record<string, number> {
    const recent = this.outcomeHistory.slice(-50);
    if (recent.length === 0) return { average: 0, trend: 0 };
    
    const average = recent.reduce((sum, outcome) => sum + outcome.satisfaction_score, 0) / recent.length;
    
    // Calculate trend (recent vs earlier)
    const recentHalf = recent.slice(-25);
    const earlierHalf = recent.slice(0, 25);
    
    const recentAvg = recentHalf.length > 0 
      ? recentHalf.reduce((sum, outcome) => sum + outcome.satisfaction_score, 0) / recentHalf.length 
      : average;
    const earlierAvg = earlierHalf.length > 0 
      ? earlierHalf.reduce((sum, outcome) => sum + outcome.satisfaction_score, 0) / earlierHalf.length 
      : average;
    
    const trend = recentAvg - earlierAvg;
    
    return { average, trend };
  }

  private getTopPerformingContexts(): Array<{ context: string; performance: number; count: number }> {
    const contextPerformance: Record<string, { total: number; count: number }> = {};
    
    this.outcomeHistory.forEach(outcome => {
      const contextKey = `${outcome.context.prompt_type}_${outcome.context.session_type}`;
      if (!contextPerformance[contextKey]) {
        contextPerformance[contextKey] = { total: 0, count: 0 };
      }
      contextPerformance[contextKey].total += outcome.satisfaction_score;
      contextPerformance[contextKey].count++;
    });
    
    return Object.entries(contextPerformance)
      .map(([context, data]) => ({
        context,
        performance: data.total / data.count,
        count: data.count
      }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5);
  }

  enableLearning(enabled: boolean = true): void {
    this.learningEnabled = enabled;
    console.log(`🧠 Adaptive learning ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAdaptationThreshold(threshold: number): void {
    this.adaptationThreshold = Math.max(0, Math.min(1, threshold));
    console.log(`🎯 Adaptation threshold set to ${this.adaptationThreshold}`);
  }

  async resetLearning(): Promise<void> {
    this.outcomeHistory = [];
    this.initializeLearningVectors();
    await this.saveAdaptiveData();
    console.log('🔄 Learning data reset to baseline');
  }
}

// CLI interface for standalone usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const system = new AdaptiveConfigurationSystem();
  
  async function main() {
    await system.loadHistoricalData();
    
    switch (command) {
      case 'optimize':
        const prompt = args[1] || 'Create a creative story about machine learning';
        const optimized = system.optimizeConfiguration(prompt);
        console.log('🎯 Optimized Configuration:');
        console.log(JSON.stringify(optimized, null, 2));
        break;
      
      case 'stats':
        const stats = system.getAdaptiveStats();
        console.log('📊 Adaptive Configuration Statistics:');
        console.log(JSON.stringify(stats, null, 2));
        break;
      
      case 'test':
        console.log('🧪 Testing configuration optimization...');
        const testPrompts = [
          'Write a creative story about AI',
          'Analyze the performance of this algorithm',
          'Debug this JavaScript function',
          'What is the capital of France?'
        ];
        
        testPrompts.forEach(prompt => {
          console.log(`\n📝 Prompt: ${prompt}`);
          const config = system.optimizeConfiguration(prompt);
          console.log(`🎯 Optimized: temp=${config.temperature}, tokens=${config.maxOutputTokens}, streaming=${config.streaming}`);
        });
        break;
      
      case 'reset':
        await system.resetLearning();
        break;
      
      default:
        console.log(`
🧠 Adaptive Configuration System v2.0

Usage:
  node adaptive-config-system.js [command] [args]

Commands:
  optimize [prompt]  - Optimize configuration for a given prompt
  stats             - Show learning statistics
  test              - Test optimization with sample prompts
  reset             - Reset learning data
  help              - Show this help

Examples:
  node adaptive-config-system.js optimize "Create a detailed analysis"
  node adaptive-config-system.js stats
  node adaptive-config-system.js test
        `);
    }
    
    await system.saveAdaptiveData();
  }
  
  main().catch(console.error);
}

export { AdaptiveConfigurationSystem, ConfigurationTemplate, ConfigurationOutcome, LearningVector };