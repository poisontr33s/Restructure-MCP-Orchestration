export interface TaskClassification {
  primaryCategory: TaskCategory;
  secondaryCategories: TaskCategory[];
  complexityLevel: ComplexityLevel;
  urgencyLevel: UrgencyLevel;
  scopeLevel: ScopeLevel;
  collaborationStyle: CollaborationStyle;
  domainKeywords: string[];
  taskPatterns: TaskPattern[];
  confidence: number;
}

export enum TaskCategory {
  // Technical Categories
  ARCHITECTURE = 'architecture',
  INFRASTRUCTURE = 'infrastructure',
  PERFORMANCE = 'performance',
  CODE_ANALYSIS = 'code-analysis',
  UI_UX = 'ui-ux',
  TESTING = 'testing',
  SECURITY = 'security',

  // Process Categories
  PROJECT_MANAGEMENT = 'project-management',
  RESEARCH = 'research',
  DOCUMENTATION = 'documentation',
  DEBUGGING = 'debugging',

  // Creative Categories
  CREATIVE_PROBLEM_SOLVING = 'creative-problem-solving',
  BRAINSTORMING = 'brainstorming',
  INNOVATION = 'innovation',

  // Support Categories
  TEAM_COORDINATION = 'team-coordination',
  MENTORING = 'mentoring',
  TROUBLESHOOTING = 'troubleshooting',
}

export enum ComplexityLevel {
  TRIVIAL = 'trivial',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXPERT = 'expert',
  BREAKTHROUGH = 'breakthrough',
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

export enum ScopeLevel {
  MICRO = 'micro', // Single function/component
  FOCUSED = 'focused', // Single module/feature
  BROAD = 'broad', // Multiple modules/systems
  STRATEGIC = 'strategic', // Architectural/organizational
  ECOSYSTEM = 'ecosystem', // Cross-system/platform
}

export enum CollaborationStyle {
  SOLO = 'solo',
  PAIR = 'pair',
  SMALL_TEAM = 'small-team',
  LARGE_TEAM = 'large-team',
  CROSS_FUNCTIONAL = 'cross-functional',
}

export enum TaskPattern {
  ANALYSIS_THEN_ACTION = 'analysis-then-action',
  ITERATIVE_REFINEMENT = 'iterative-refinement',
  PARALLEL_EXECUTION = 'parallel-execution',
  SEQUENTIAL_PIPELINE = 'sequential-pipeline',
  EXPLORATION_DISCOVERY = 'exploration-discovery',
  VALIDATION_VERIFICATION = 'validation-verification',
  OPTIMIZATION_TUNING = 'optimization-tuning',
  INTEGRATION_SYNTHESIS = 'integration-synthesis',
}

export class TaskClassifier {
  private categoryKeywords: Map<TaskCategory, string[]> = new Map([
    [
      TaskCategory.ARCHITECTURE,
      [
        'design',
        'architecture',
        'system',
        'structure',
        'patterns',
        'scalability',
        'microservices',
        'monolith',
        'distributed',
        'components',
        'modules',
      ],
    ],
    [
      TaskCategory.INFRASTRUCTURE,
      [
        'deploy',
        'infrastructure',
        'server',
        'cloud',
        'docker',
        'kubernetes',
        'ci/cd',
        'pipeline',
        'environment',
        'hosting',
        'devops',
      ],
    ],
    [
      TaskCategory.PERFORMANCE,
      [
        'performance',
        'optimize',
        'speed',
        'slow',
        'bottleneck',
        'memory',
        'cpu',
        'cache',
        'latency',
        'throughput',
        'profiling',
      ],
    ],
    [
      TaskCategory.CODE_ANALYSIS,
      [
        'review',
        'analyze',
        'audit',
        'refactor',
        'quality',
        'maintainability',
        'code smell',
        'technical debt',
        'complexity',
        'metrics',
      ],
    ],
    [
      TaskCategory.UI_UX,
      [
        'ui',
        'ux',
        'interface',
        'design',
        'user',
        'frontend',
        'component',
        'responsive',
        'accessibility',
        'usability',
        'wireframe',
      ],
    ],
    [
      TaskCategory.TESTING,
      [
        'test',
        'testing',
        'unit',
        'integration',
        'e2e',
        'coverage',
        'qa',
        'quality',
        'validation',
        'verification',
        'mock',
      ],
    ],
    [
      TaskCategory.SECURITY,
      [
        'security',
        'vulnerability',
        'auth',
        'authorization',
        'encryption',
        'secure',
        'audit',
        'compliance',
        'privacy',
        'threat',
      ],
    ],
    [
      TaskCategory.PROJECT_MANAGEMENT,
      [
        'manage',
        'plan',
        'schedule',
        'timeline',
        'resource',
        'allocate',
        'priority',
        'milestone',
        'track',
        'coordinate',
      ],
    ],
    [
      TaskCategory.RESEARCH,
      [
        'research',
        'investigate',
        'explore',
        'study',
        'analyze',
        'understand',
        'learn',
        'discover',
        'evaluate',
        'compare',
      ],
    ],
    [
      TaskCategory.DOCUMENTATION,
      [
        'document',
        'documentation',
        'readme',
        'guide',
        'tutorial',
        'api',
        'spec',
        'specification',
        'manual',
        'wiki',
      ],
    ],
    [
      TaskCategory.DEBUGGING,
      [
        'debug',
        'bug',
        'error',
        'issue',
        'problem',
        'fix',
        'troubleshoot',
        'diagnose',
        'resolve',
        'investigate',
      ],
    ],
    [
      TaskCategory.CREATIVE_PROBLEM_SOLVING,
      [
        'creative',
        'innovative',
        'brainstorm',
        'ideate',
        'solution',
        'approach',
        'alternative',
        'novel',
        'unique',
        'breakthrough',
      ],
    ],
    [
      TaskCategory.TEAM_COORDINATION,
      [
        'team',
        'collaborate',
        'coordinate',
        'communicate',
        'sync',
        'align',
        'meeting',
        'standup',
        'retrospective',
        'planning',
      ],
    ],
    [
      TaskCategory.MENTORING,
      [
        'mentor',
        'teach',
        'guide',
        'help',
        'support',
        'training',
        'learning',
        'knowledge',
        'skill',
        'coaching',
      ],
    ],
  ]);

  private complexityIndicators: Map<ComplexityLevel, string[]> = new Map([
    [ComplexityLevel.TRIVIAL, ['simple', 'basic', 'trivial', 'easy', 'quick']],
    [ComplexityLevel.LOW, ['straightforward', 'minor', 'small', 'light']],
    [ComplexityLevel.MEDIUM, ['moderate', 'standard', 'typical', 'normal']],
    [ComplexityLevel.HIGH, ['complex', 'advanced', 'sophisticated', 'challenging']],
    [ComplexityLevel.EXPERT, ['expert', 'deep', 'specialized', 'intricate', 'masterful']],
    [ComplexityLevel.BREAKTHROUGH, ['breakthrough', 'revolutionary', 'groundbreaking', 'novel']],
  ]);

  private urgencyIndicators: Map<UrgencyLevel, string[]> = new Map([
    [UrgencyLevel.LOW, ['eventually', 'when possible', 'low priority', 'nice to have']],
    [UrgencyLevel.MEDIUM, ['soon', 'normal priority', 'standard timeline']],
    [UrgencyLevel.HIGH, ['urgent', 'important', 'high priority', 'needed soon']],
    [UrgencyLevel.CRITICAL, ['critical', 'asap', 'immediately', 'blocking']],
    [UrgencyLevel.EMERGENCY, ['emergency', 'outage', 'down', 'broken', 'production']],
  ]);

  private scopeIndicators: Map<ScopeLevel, string[]> = new Map([
    [ScopeLevel.MICRO, ['function', 'method', 'single', 'small fix', 'line']],
    [ScopeLevel.FOCUSED, ['component', 'module', 'feature', 'specific', 'isolated']],
    [ScopeLevel.BROAD, ['system', 'multiple', 'across', 'comprehensive', 'wide']],
    [ScopeLevel.STRATEGIC, ['strategy', 'vision', 'architecture', 'roadmap', 'planning']],
    [ScopeLevel.ECOSYSTEM, ['platform', 'entire', 'all', 'ecosystem', 'organization']],
  ]);

  public classify(taskDescription: string, context?: any): TaskClassification {
    const taskLower = taskDescription.toLowerCase();
    const words = taskLower.split(/\s+/);

    // Classify primary and secondary categories
    const categoryScores = this.calculateCategoryScores(taskLower, words);
    const primaryCategory = this.getPrimaryCategory(categoryScores);
    const secondaryCategories = this.getSecondaryCategories(categoryScores, primaryCategory);

    // Determine complexity level
    const complexityLevel = this.determineComplexity(taskLower, words, categoryScores);

    // Determine urgency level
    const urgencyLevel = this.determineUrgency(taskLower, words);

    // Determine scope level
    const scopeLevel = this.determineScope(taskLower, words);

    // Determine collaboration style
    const collaborationStyle = this.determineCollaborationStyle(
      taskLower,
      complexityLevel,
      scopeLevel,
      secondaryCategories.length
    );

    // Extract domain keywords
    const domainKeywords = this.extractDomainKeywords(taskLower);

    // Identify task patterns
    const taskPatterns = this.identifyTaskPatterns(taskLower, primaryCategory, complexityLevel);

    // Calculate confidence
    const confidence = this.calculateConfidence(categoryScores, taskLower);

    return {
      primaryCategory,
      secondaryCategories,
      complexityLevel,
      urgencyLevel,
      scopeLevel,
      collaborationStyle,
      domainKeywords,
      taskPatterns,
      confidence,
    };
  }

  public getRecommendedAgents(classification: TaskClassification): string[] {
    const agents: string[] = [];

    // Map categories to preferred agents
    const categoryAgentMap: Map<TaskCategory, string[]> = new Map([
      [
        TaskCategory.ARCHITECTURE,
        [
          'eva-green-code-oracle',
          'infrastructure-polyglot-architect',
          'savant-multidisciplinarian-autodidact',
        ],
      ],
      [
        TaskCategory.INFRASTRUCTURE,
        [
          'infrastructure-polyglot-expert',
          'infrastructure-polyglot-architect',
          'github-vscode-grandmaster',
        ],
      ],
      [
        TaskCategory.PERFORMANCE,
        ['code-performance-optimizer', 'eva-green-code-oracle', 'meta-programming-genius'],
      ],
      [
        TaskCategory.CODE_ANALYSIS,
        ['eva-green-code-oracle', 'code-performance-optimizer', 'meta-programming-genius'],
      ],
      [TaskCategory.UI_UX, ['ux-strategy-designer', 'rae-lil-black-persona']],
      [
        TaskCategory.PROJECT_MANAGEMENT,
        ['overseer-taskmaster-allocator', 'claudine-team-psychologist'],
      ],
      [TaskCategory.RESEARCH, ['savant-multidisciplinarian-autodidact', 'greater-entity-force']],
      [
        TaskCategory.CREATIVE_PROBLEM_SOLVING,
        ['captain-guthilda-navigator', 'rae-lil-black-persona', 'greater-entity-force'],
      ],
      [
        TaskCategory.TEAM_COORDINATION,
        ['claudine-team-psychologist', 'overseer-taskmaster-allocator'],
      ],
      [TaskCategory.MENTORING, ['claude-companion-girlfriend', 'eva-green-code-oracle']],
    ]);

    // Add agents for primary category
    const primaryAgents = categoryAgentMap.get(classification.primaryCategory) || [];
    agents.push(...primaryAgents);

    // Add agents for secondary categories
    classification.secondaryCategories.forEach((category) => {
      const secondaryAgents = categoryAgentMap.get(category) || [];
      secondaryAgents.forEach((agent) => {
        if (!agents.includes(agent)) {
          agents.push(agent);
        }
      });
    });

    // Add complexity-specific agents
    if (
      classification.complexityLevel === ComplexityLevel.EXPERT ||
      classification.complexityLevel === ComplexityLevel.BREAKTHROUGH
    ) {
      const expertAgents = [
        'savant-multidisciplinarian-autodidact',
        'meta-programming-genius',
        'greater-entity-force',
      ];
      expertAgents.forEach((agent) => {
        if (!agents.includes(agent)) {
          agents.push(agent);
        }
      });
    }

    return agents.slice(0, 5); // Limit to top 5 recommendations
  }

  private calculateCategoryScores(taskLower: string, words: string[]): Map<TaskCategory, number> {
    const scores = new Map<TaskCategory, number>();

    for (const [category, keywords] of this.categoryKeywords) {
      let score = 0;

      keywords.forEach((keyword) => {
        if (taskLower.includes(keyword)) {
          // Exact match gets higher score
          score += keyword.split(' ').length;

          // Boost for word boundary matches
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          if (regex.test(taskLower)) {
            score += 1;
          }
        }
      });

      scores.set(category, score);
    }

    return scores;
  }

  private getPrimaryCategory(categoryScores: Map<TaskCategory, number>): TaskCategory {
    let maxScore = 0;
    let primaryCategory = TaskCategory.RESEARCH; // default

    for (const [category, score] of categoryScores) {
      if (score > maxScore) {
        maxScore = score;
        primaryCategory = category;
      }
    }

    return primaryCategory;
  }

  private getSecondaryCategories(
    categoryScores: Map<TaskCategory, number>,
    primaryCategory: TaskCategory
  ): TaskCategory[] {
    const secondary: TaskCategory[] = [];
    const sortedCategories = Array.from(categoryScores.entries())
      .filter(([category, score]) => category !== primaryCategory && score > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return sortedCategories.map(([category]) => category);
  }

  private determineComplexity(
    taskLower: string,
    words: string[],
    categoryScores: Map<TaskCategory, number>
  ): ComplexityLevel {
    for (const [level, indicators] of this.complexityIndicators) {
      if (indicators.some((indicator) => taskLower.includes(indicator))) {
        return level;
      }
    }

    // Infer complexity from category overlap and task length
    const categoryCount = Array.from(categoryScores.values()).filter((score) => score > 0).length;
    const wordCount = words.length;

    if (categoryCount > 3 || wordCount > 50) return ComplexityLevel.EXPERT;
    if (categoryCount > 2 || wordCount > 20) return ComplexityLevel.HIGH;
    if (categoryCount > 1 || wordCount > 10) return ComplexityLevel.MEDIUM;
    return ComplexityLevel.LOW;
  }

  private determineUrgency(taskLower: string, words: string[]): UrgencyLevel {
    for (const [level, indicators] of this.urgencyIndicators) {
      if (indicators.some((indicator) => taskLower.includes(indicator))) {
        return level;
      }
    }
    return UrgencyLevel.MEDIUM; // default
  }

  private determineScope(taskLower: string, words: string[]): ScopeLevel {
    for (const [level, indicators] of this.scopeIndicators) {
      if (indicators.some((indicator) => taskLower.includes(indicator))) {
        return level;
      }
    }

    // Infer from task description length and keywords
    const wordCount = words.length;
    if (wordCount < 5) return ScopeLevel.MICRO;
    if (wordCount < 15) return ScopeLevel.FOCUSED;
    if (wordCount < 30) return ScopeLevel.BROAD;
    return ScopeLevel.STRATEGIC;
  }

  private determineCollaborationStyle(
    taskLower: string,
    complexity: ComplexityLevel,
    scope: ScopeLevel,
    secondaryCategoryCount: number
  ): CollaborationStyle {
    // Explicit indicators
    if (taskLower.includes('team') || taskLower.includes('collaborate')) {
      return scope === ScopeLevel.STRATEGIC
        ? CollaborationStyle.CROSS_FUNCTIONAL
        : CollaborationStyle.SMALL_TEAM;
    }

    if (taskLower.includes('solo') || taskLower.includes('individual')) {
      return CollaborationStyle.SOLO;
    }

    // Infer from complexity and scope
    if (complexity === ComplexityLevel.EXPERT && scope === ScopeLevel.STRATEGIC) {
      return CollaborationStyle.CROSS_FUNCTIONAL;
    }

    if (secondaryCategoryCount > 2 || scope === ScopeLevel.BROAD) {
      return CollaborationStyle.SMALL_TEAM;
    }

    if (complexity === ComplexityLevel.HIGH) {
      return CollaborationStyle.PAIR;
    }

    return CollaborationStyle.SOLO;
  }

  private extractDomainKeywords(taskLower: string): string[] {
    const technicalTerms = [
      'react',
      'vue',
      'angular',
      'typescript',
      'javascript',
      'python',
      'java',
      'docker',
      'kubernetes',
      'aws',
      'azure',
      'gcp',
      'terraform',
      'microservices',
      'api',
      'database',
      'sql',
      'nosql',
      'redis',
      'machine learning',
      'ai',
      'blockchain',
      'iot',
      'mobile',
    ];

    return technicalTerms.filter((term) => taskLower.includes(term));
  }

  private identifyTaskPatterns(
    taskLower: string,
    primaryCategory: TaskCategory,
    complexity: ComplexityLevel
  ): TaskPattern[] {
    const patterns: TaskPattern[] = [];

    // Pattern identification based on keywords and context
    if (taskLower.includes('analyze') || taskLower.includes('review')) {
      patterns.push(TaskPattern.ANALYSIS_THEN_ACTION);
    }

    if (
      taskLower.includes('iterate') ||
      taskLower.includes('refine') ||
      taskLower.includes('improve')
    ) {
      patterns.push(TaskPattern.ITERATIVE_REFINEMENT);
    }

    if (
      taskLower.includes('parallel') ||
      taskLower.includes('simultaneous') ||
      taskLower.includes('concurrent')
    ) {
      patterns.push(TaskPattern.PARALLEL_EXECUTION);
    }

    if (
      taskLower.includes('step') ||
      taskLower.includes('phase') ||
      taskLower.includes('sequence')
    ) {
      patterns.push(TaskPattern.SEQUENTIAL_PIPELINE);
    }

    if (
      taskLower.includes('explore') ||
      taskLower.includes('discover') ||
      taskLower.includes('research')
    ) {
      patterns.push(TaskPattern.EXPLORATION_DISCOVERY);
    }

    if (
      taskLower.includes('test') ||
      taskLower.includes('validate') ||
      taskLower.includes('verify')
    ) {
      patterns.push(TaskPattern.VALIDATION_VERIFICATION);
    }

    if (primaryCategory === TaskCategory.PERFORMANCE || taskLower.includes('optimize')) {
      patterns.push(TaskPattern.OPTIMIZATION_TUNING);
    }

    if (
      taskLower.includes('integrate') ||
      taskLower.includes('combine') ||
      taskLower.includes('merge')
    ) {
      patterns.push(TaskPattern.INTEGRATION_SYNTHESIS);
    }

    // Default pattern based on complexity
    if (patterns.length === 0) {
      if (complexity === ComplexityLevel.HIGH || complexity === ComplexityLevel.EXPERT) {
        patterns.push(TaskPattern.ANALYSIS_THEN_ACTION);
      } else {
        patterns.push(TaskPattern.SEQUENTIAL_PIPELINE);
      }
    }

    return patterns;
  }

  private calculateConfidence(
    categoryScores: Map<TaskCategory, number>,
    taskLower: string
  ): number {
    const maxScore = Math.max(...Array.from(categoryScores.values()));
    const totalScore = Array.from(categoryScores.values()).reduce((sum, score) => sum + score, 0);

    // Base confidence on score distribution
    let confidence = maxScore / Math.max(totalScore, 1);

    // Boost confidence for longer, more detailed descriptions
    if (taskLower.length > 100) confidence += 0.1;
    if (taskLower.length > 200) confidence += 0.1;

    // Reduce confidence for very short descriptions
    if (taskLower.length < 20) confidence -= 0.2;

    return Math.max(0.1, Math.min(0.95, confidence));
  }
}
