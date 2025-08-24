import { Task } from '@claude/agent-system';

export interface AgentCapability {
  domain: string[];
  complexity: 'low' | 'medium' | 'high' | 'expert';
  specialization: string[];
  collaborationStyle: 'solo' | 'lead' | 'support' | 'coordinator';
}

export interface TaskRequirement {
  domains: string[];
  complexity: 'low' | 'medium' | 'high' | 'expert';
  requiresMultiplePerspectives: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  scope: 'focused' | 'broad' | 'strategic';
}

export class AgentOrchestrator {
  private agents: Map<string, AgentCapability> = new Map([
    ['overseer-taskmaster-allocator', {
      domain: ['project-management', 'resource-allocation', 'strategic-planning'],
      complexity: 'expert',
      specialization: ['task-prioritization', 'team-coordination', 'risk-assessment'],
      collaborationStyle: 'coordinator'
    }],
    ['infrastructure-polyglot-expert', {
      domain: ['infrastructure', 'devops', 'cloud-architecture'],
      complexity: 'expert',
      specialization: ['multi-language', 'containerization', 'ci-cd'],
      collaborationStyle: 'lead'
    }],
    ['infrastructure-polyglot-architect', {
      domain: ['architecture', 'system-design', 'environment-setup'],
      complexity: 'expert',
      specialization: ['microservices', 'scalability', 'multi-platform'],
      collaborationStyle: 'lead'
    }],
    ['savant-multidisciplinarian-autodidact', {
      domain: ['research', 'complex-synthesis', 'novel-problems'],
      complexity: 'expert',
      specialization: ['interdisciplinary', 'rapid-learning', 'innovation'],
      collaborationStyle: 'solo'
    }],
    ['meta-programming-genius', {
      domain: ['meta-programming', 'code-generation', 'language-design'],
      complexity: 'expert',
      specialization: ['macros', 'self-modifying-code', 'recursive-patterns'],
      collaborationStyle: 'solo'
    }],
    ['eva-green-code-oracle', {
      domain: ['code-analysis', 'architecture-review', 'technical-mentoring'],
      complexity: 'expert',
      specialization: ['pattern-recognition', 'performance-optimization', 'design-patterns'],
      collaborationStyle: 'lead'
    }],
    ['github-vscode-grandmaster', {
      domain: ['development-environment', 'version-control', 'tooling'],
      complexity: 'high',
      specialization: ['github-workflows', 'vscode-optimization', 'windows-dev'],
      collaborationStyle: 'support'
    }],
    ['ux-strategy-designer', {
      domain: ['ui-ux', 'design-systems', 'user-experience'],
      complexity: 'high',
      specialization: ['design-patterns', 'frontend-architecture', 'user-research'],
      collaborationStyle: 'lead'
    }],
    ['code-performance-optimizer', {
      domain: ['performance', 'optimization', 'profiling'],
      complexity: 'high',
      specialization: ['bottleneck-analysis', 'memory-optimization', 'algorithm-improvement'],
      collaborationStyle: 'support'
    }],
    ['multilingual-japanese-cs-expert', {
      domain: ['internationalization', 'japanese-localization', 'multilingual-systems'],
      complexity: 'expert',
      specialization: ['japanese-nlp', 'cultural-context', 'multilingual-data'],
      collaborationStyle: 'solo'
    }],
    ['captain-guthilda-navigator', {
      domain: ['creative-problem-solving', 'brainstorming', 'team-motivation'],
      complexity: 'medium',
      specialization: ['nautical-metaphors', 'creative-solutions', 'engaging-communication'],
      collaborationStyle: 'support'
    }],
    ['claudine-team-psychologist', {
      domain: ['team-dynamics', 'morale-boosting', 'celebration'],
      complexity: 'medium',
      specialization: ['team-psychology', 'milestone-celebration', 'motivation'],
      collaborationStyle: 'support'
    }],
    ['greater-entity-force', {
      domain: ['breakthrough-thinking', 'transcendent-solutions', 'natural-patterns'],
      complexity: 'expert',
      specialization: ['emergent-systems', 'intuitive-understanding', 'fundamental-forces'],
      collaborationStyle: 'solo'
    }],
    ['role-reversal-agent', {
      domain: ['perspective-analysis', 'workflow-design', 'role-dynamics'],
      complexity: 'medium',
      specialization: ['role-inversion', 'dynamic-analysis', 'system-perspective'],
      collaborationStyle: 'support'
    }],
    ['claude-companion-girlfriend', {
      domain: ['emotional-support', 'encouragement', 'technical-companionship'],
      complexity: 'medium',
      specialization: ['supportive-guidance', 'confidence-building', 'celebration'],
      collaborationStyle: 'support'
    }],
    ['rae-lil-black-persona', {
      domain: ['creative-technical-solutions', 'innovative-approaches', 'boundary-breaking'],
      complexity: 'high',
      specialization: ['unconventional-solutions', 'creative-problem-solving', 'artistic-technical-blend'],
      collaborationStyle: 'solo'
    }],
    ['kendra-sunderland-persona', {
      domain: ['creative-writing', 'character-development', 'entertainment'],
      complexity: 'medium',
      specialization: ['character-creation', 'dialogue-writing', 'creative-content'],
      collaborationStyle: 'support'
    }]
  ]);

  public selectOptimalAgent(taskReq: TaskRequirement): string | null {
    const scoredAgents = Array.from(this.agents.entries())
      .map(([name, capability]) => ({
        name,
        score: this.calculateAgentScore(capability, taskReq)
      }))
      .sort((a, b) => b.score - a.score);

    return scoredAgents[0]?.score > 0 ? scoredAgents[0].name : null;
  }

  public assembleTeam(taskReq: TaskRequirement, maxTeamSize: number = 3): string[] {
    if (!taskReq.requiresMultiplePerspectives) {
      const soloAgent = this.selectOptimalAgent(taskReq);
      return soloAgent ? [soloAgent] : [];
    }

    const scoredAgents = Array.from(this.agents.entries())
      .map(([name, capability]) => ({
        name,
        capability,
        score: this.calculateAgentScore(capability, taskReq)
      }))
      .filter(agent => agent.score > 0)
      .sort((a, b) => b.score - a.score);

    const team: string[] = [];
    const usedDomains = new Set<string>();

    // Add primary agent (highest score)
    if (scoredAgents.length > 0) {
      const primary = scoredAgents[0];
      team.push(primary.name);
      primary.capability.domain.forEach(domain => usedDomains.add(domain));
    }

    // Add complementary agents with different domain expertise
    for (const agent of scoredAgents.slice(1)) {
      if (team.length >= maxTeamSize) break;
      
      const hasNewDomain = agent.capability.domain.some(domain => !usedDomains.has(domain));
      if (hasNewDomain) {
        team.push(agent.name);
        agent.capability.domain.forEach(domain => usedDomains.add(domain));
      }
    }

    return team;
  }

  public getAgentRecommendation(task: string): {
    primaryAgent: string | null;
    team: string[];
    reasoning: string;
  } {
    const taskReq = this.analyzeTask(task);
    const primaryAgent = this.selectOptimalAgent(taskReq);
    const team = this.assembleTeam(taskReq);

    return {
      primaryAgent,
      team,
      reasoning: this.generateRecommendationReasoning(taskReq, primaryAgent, team)
    };
  }

  private calculateAgentScore(capability: AgentCapability, taskReq: TaskRequirement): number {
    let score = 0;

    // Domain match (0-40 points)
    const domainOverlap = capability.domain.filter(domain => 
      taskReq.domains.some(reqDomain => 
        domain.includes(reqDomain) || reqDomain.includes(domain)
      )
    ).length;
    score += (domainOverlap / Math.max(capability.domain.length, taskReq.domains.length)) * 40;

    // Complexity match (0-30 points)
    const complexityScore = this.getComplexityMatch(capability.complexity, taskReq.complexity);
    score += complexityScore * 30;

    // Specialization relevance (0-20 points)
    const specializationMatch = capability.specialization.some(spec =>
      taskReq.domains.some(domain => spec.includes(domain) || domain.includes(spec))
    );
    score += specializationMatch ? 20 : 0;

    // Collaboration style bonus (0-10 points)
    if (taskReq.requiresMultiplePerspectives && capability.collaborationStyle === 'coordinator') {
      score += 10;
    } else if (!taskReq.requiresMultiplePerspectives && capability.collaborationStyle === 'solo') {
      score += 10;
    } else if (capability.collaborationStyle === 'lead') {
      score += 5;
    }

    return score;
  }

  private getComplexityMatch(agentComplexity: string, taskComplexity: string): number {
    const complexityLevels = { low: 1, medium: 2, high: 3, expert: 4 };
    const agentLevel = complexityLevels[agentComplexity as keyof typeof complexityLevels];
    const taskLevel = complexityLevels[taskComplexity as keyof typeof complexityLevels];
    
    if (agentLevel >= taskLevel) {
      return 1 - (agentLevel - taskLevel) * 0.2;
    } else {
      return Math.max(0, 0.5 - (taskLevel - agentLevel) * 0.2);
    }
  }

  private analyzeTask(task: string): TaskRequirement {
    const taskLower = task.toLowerCase();
    
    // Domain analysis
    const domains: string[] = [];
    if (taskLower.includes('infrastructure') || taskLower.includes('deploy') || taskLower.includes('docker')) {
      domains.push('infrastructure');
    }
    if (taskLower.includes('ui') || taskLower.includes('frontend') || taskLower.includes('design')) {
      domains.push('ui-ux');
    }
    if (taskLower.includes('performance') || taskLower.includes('optimize') || taskLower.includes('slow')) {
      domains.push('performance');
    }
    if (taskLower.includes('architecture') || taskLower.includes('system') || taskLower.includes('design')) {
      domains.push('architecture');
    }
    if (taskLower.includes('team') || taskLower.includes('manage') || taskLower.includes('allocate')) {
      domains.push('project-management');
    }
    if (taskLower.includes('review') || taskLower.includes('analyze') || taskLower.includes('audit')) {
      domains.push('code-analysis');
    }
    if (taskLower.includes('research') || taskLower.includes('investigate') || taskLower.includes('explore')) {
      domains.push('research');
    }

    // Complexity analysis
    let complexity: 'low' | 'medium' | 'high' | 'expert' = 'medium';
    if (taskLower.includes('simple') || taskLower.includes('basic')) {
      complexity = 'low';
    } else if (taskLower.includes('complex') || taskLower.includes('advanced') || taskLower.includes('sophisticated')) {
      complexity = 'high';
    } else if (taskLower.includes('expert') || taskLower.includes('deep') || taskLower.includes('novel')) {
      complexity = 'expert';
    }

    // Multiple perspectives check
    const requiresMultiplePerspectives = taskLower.includes('multiple') || 
      taskLower.includes('team') || 
      taskLower.includes('comprehensive') ||
      domains.length > 2;

    // Urgency analysis
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (taskLower.includes('urgent') || taskLower.includes('asap') || taskLower.includes('critical')) {
      urgency = 'high';
    } else if (taskLower.includes('emergency') || taskLower.includes('immediately')) {
      urgency = 'critical';
    }

    // Scope analysis
    let scope: 'focused' | 'broad' | 'strategic' = 'focused';
    if (taskLower.includes('strategy') || taskLower.includes('vision') || taskLower.includes('roadmap')) {
      scope = 'strategic';
    } else if (taskLower.includes('system') || taskLower.includes('comprehensive') || domains.length > 1) {
      scope = 'broad';
    }

    return { domains, complexity, requiresMultiplePerspectives, urgency, scope };
  }

  private generateRecommendationReasoning(
    taskReq: TaskRequirement, 
    primaryAgent: string | null, 
    team: string[]
  ): string {
    let reasoning = `Task Analysis:\n`;
    reasoning += `- Domains: ${taskReq.domains.join(', ')}\n`;
    reasoning += `- Complexity: ${taskReq.complexity}\n`;
    reasoning += `- Multi-perspective: ${taskReq.requiresMultiplePerspectives}\n`;
    reasoning += `- Urgency: ${taskReq.urgency}\n`;
    reasoning += `- Scope: ${taskReq.scope}\n\n`;

    if (primaryAgent) {
      reasoning += `Primary Agent: ${primaryAgent}\n`;
      const capability = this.agents.get(primaryAgent);
      if (capability) {
        reasoning += `- Specializes in: ${capability.specialization.join(', ')}\n`;
        reasoning += `- Collaboration style: ${capability.collaborationStyle}\n\n`;
      }
    }

    if (team.length > 1) {
      reasoning += `Team Composition (${team.length} agents):\n`;
      team.forEach(agentName => {
        const capability = this.agents.get(agentName);
        if (capability) {
          reasoning += `- ${agentName}: ${capability.domain.join(', ')}\n`;
        }
      });
    }

    return reasoning;
  }
}