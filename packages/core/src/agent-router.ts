import { Task } from '../../../shared/src/types';
import { AgentOrchestrator } from './agent-orchestrator';

export interface AgentDelegationResult {
  selectedAgent: string | null;
  team: string[];
  taskBreakdown: TaskFragment[];
  reasoning: string;
  executionPlan: ExecutionStep[];
}

export interface TaskFragment {
  id: string;
  description: string;
  assignedAgent: string;
  dependencies: string[];
  priority: number;
  estimatedComplexity: number;
}

export interface ExecutionStep {
  order: number;
  agent: string;
  action: string;
  expectedOutput: string;
  dependencies: string[];
  parallel: boolean;
}

export class AgentRouter {
  private orchestrator: AgentOrchestrator;
  private taskHistory: Map<string, AgentDelegationResult> = new Map();

  constructor() {
    this.orchestrator = new AgentOrchestrator();
  }

  public async delegateTask(
    taskDescription: string,
    context?: any,
    constraints?: {
      maxTeamSize?: number;
      preferredAgents?: string[];
      excludedAgents?: string[];
      timeConstraint?: 'immediate' | 'hours' | 'days';
    }
  ): Promise<AgentDelegationResult> {
    // Get agent recommendation from orchestrator
    const recommendation = this.orchestrator.getAgentRecommendation(taskDescription);

    // Apply constraints
    let filteredTeam = recommendation.team;
    if (constraints?.excludedAgents) {
      filteredTeam = filteredTeam.filter((agent) => !constraints.excludedAgents!.includes(agent));
    }
    if (constraints?.preferredAgents) {
      const preferred = filteredTeam.filter((agent) =>
        constraints.preferredAgents!.includes(agent)
      );
      if (preferred.length > 0) {
        filteredTeam = preferred.concat(
          filteredTeam.filter((agent) => !constraints.preferredAgents!.includes(agent))
        );
      }
    }
    if (constraints?.maxTeamSize) {
      filteredTeam = filteredTeam.slice(0, constraints.maxTeamSize);
    }

    // Break down task into fragments
    const taskBreakdown = this.decomposeTask(taskDescription, filteredTeam);

    // Create execution plan
    const executionPlan = this.createExecutionPlan(taskBreakdown, constraints?.timeConstraint);

    const result: AgentDelegationResult = {
      selectedAgent: recommendation.primaryAgent,
      team: filteredTeam,
      taskBreakdown,
      reasoning: this.enhanceReasoning(recommendation.reasoning, constraints),
      executionPlan,
    };

    // Store in history for learning
    this.taskHistory.set(this.generateTaskId(taskDescription), result);

    return result;
  }

  public getTaskPattern(taskDescription: string): string | null {
    // Analyze patterns in previous similar tasks
    const similarTasks = Array.from(this.taskHistory.entries())
      .filter(([id, result]) => this.calculateTaskSimilarity(taskDescription, id) > 0.7)
      .sort(
        (a, b) =>
          this.calculateTaskSimilarity(taskDescription, b[0]) -
          this.calculateTaskSimilarity(taskDescription, a[0])
      );

    if (similarTasks.length > 0) {
      return similarTasks[0][0];
    }

    return null;
  }

  public getPerformanceMetrics(): {
    totalTasks: number;
    agentUtilization: Map<string, number>;
    averageTeamSize: number;
    commonPatterns: string[];
  } {
    const totalTasks = this.taskHistory.size;
    const agentUtilization = new Map<string, number>();
    let totalTeamSize = 0;
    const patterns: string[] = [];

    for (const [taskId, result] of this.taskHistory) {
      totalTeamSize += result.team.length;

      result.team.forEach((agent) => {
        agentUtilization.set(agent, (agentUtilization.get(agent) || 0) + 1);
      });

      // Extract patterns
      if (result.team.length === 1) {
        patterns.push('solo-execution');
      } else if (result.team.length > 3) {
        patterns.push('large-team-collaboration');
      } else {
        patterns.push('small-team-collaboration');
      }
    }

    return {
      totalTasks,
      agentUtilization,
      averageTeamSize: totalTasks > 0 ? totalTeamSize / totalTasks : 0,
      commonPatterns: [...new Set(patterns)],
    };
  }

  private decomposeTask(taskDescription: string, team: string[]): TaskFragment[] {
    const fragments: TaskFragment[] = [];

    if (team.length === 1) {
      // Single agent - create one main fragment
      fragments.push({
        id: 'main',
        description: taskDescription,
        assignedAgent: team[0],
        dependencies: [],
        priority: 1,
        estimatedComplexity: this.estimateComplexity(taskDescription),
      });
    } else {
      // Multi-agent - decompose based on agent specializations
      const mainFragment = {
        id: 'coordination',
        description: `Coordinate and orchestrate: ${taskDescription}`,
        assignedAgent: this.findCoordinator(team),
        dependencies: [],
        priority: 1,
        estimatedComplexity: 3,
      };
      fragments.push(mainFragment);

      // Create specialized fragments
      team
        .filter((agent) => agent !== mainFragment.assignedAgent)
        .forEach((agent, index) => {
          const specialization = this.getAgentSpecialization(agent, taskDescription);
          fragments.push({
            id: `specialist-${index + 1}`,
            description: `${specialization} aspects of: ${taskDescription}`,
            assignedAgent: agent,
            dependencies: ['coordination'],
            priority: 2,
            estimatedComplexity: this.estimateComplexity(specialization),
          });
        });

      // Add integration fragment
      fragments.push({
        id: 'integration',
        description: `Integrate and finalize results for: ${taskDescription}`,
        assignedAgent: mainFragment.assignedAgent,
        dependencies: fragments.filter((f) => f.priority === 2).map((f) => f.id),
        priority: 3,
        estimatedComplexity: 2,
      });
    }

    return fragments;
  }

  private createExecutionPlan(fragments: TaskFragment[], timeConstraint?: string): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    let order = 1;

    // Group fragments by priority (dependencies)
    const fragmentsByPriority = new Map<number, TaskFragment[]>();
    fragments.forEach((fragment) => {
      const priority = fragment.priority;
      if (!fragmentsByPriority.has(priority)) {
        fragmentsByPriority.set(priority, []);
      }
      fragmentsByPriority.get(priority)!.push(fragment);
    });

    // Create execution steps
    for (const [priority, priorityFragments] of fragmentsByPriority) {
      const canRunInParallel =
        priorityFragments.length > 1 && timeConstraint !== 'immediate' && priority > 1;

      priorityFragments.forEach((fragment) => {
        steps.push({
          order: order++,
          agent: fragment.assignedAgent,
          action: fragment.description,
          expectedOutput: this.generateExpectedOutput(fragment),
          dependencies: fragment.dependencies,
          parallel: canRunInParallel,
        });
      });
    }

    return steps;
  }

  private findCoordinator(team: string[]): string {
    // Priority order for coordinators
    const coordinatorPriority = [
      'overseer-taskmaster-allocator',
      'eva-green-code-oracle',
      'infrastructure-polyglot-architect',
      'savant-multidisciplinarian-autodidact',
    ];

    for (const coordinator of coordinatorPriority) {
      if (team.includes(coordinator)) {
        return coordinator;
      }
    }

    // Fallback to first agent
    return team[0];
  }

  private getAgentSpecialization(agent: string, taskDescription: string): string {
    const agentSpecializations: { [key: string]: string } = {
      'infrastructure-polyglot-expert': 'Infrastructure and deployment',
      'ux-strategy-designer': 'User experience and interface design',
      'code-performance-optimizer': 'Performance optimization and bottleneck analysis',
      'github-vscode-grandmaster': 'Development environment and tooling setup',
      'meta-programming-genius': 'Code generation and meta-programming',
      'multilingual-japanese-cs-expert': 'Internationalization and Japanese localization',
      'captain-guthilda-navigator': 'Creative problem-solving and navigation',
      'claudine-team-psychologist': 'Team dynamics and morale',
      'greater-entity-force': 'Breakthrough thinking and natural patterns',
      'role-reversal-agent': 'Perspective analysis and role dynamics',
      'claude-companion-girlfriend': 'Supportive guidance and encouragement',
      'rae-lil-black-persona': 'Creative technical solutions',
      'kendra-sunderland-persona': 'Creative content and character development',
    };

    return agentSpecializations[agent] || 'Specialized analysis';
  }

  private estimateComplexity(description: string): number {
    const complexityIndicators = [
      'architecture',
      'system',
      'complex',
      'advanced',
      'sophisticated',
      'multiple',
      'integrate',
      'optimize',
      'performance',
      'scalable',
    ];

    const matches = complexityIndicators.filter((indicator) =>
      description.toLowerCase().includes(indicator)
    ).length;

    return Math.min(5, Math.max(1, matches + 1));
  }

  private generateExpectedOutput(fragment: TaskFragment): string {
    const outputTypes = {
      coordination: 'Strategic plan and task delegation',
      analysis: 'Detailed analysis report with recommendations',
      implementation: 'Working code implementation with documentation',
      review: 'Code review with improvement suggestions',
      design: 'Design specifications and wireframes',
      optimization: 'Performance improvements and metrics',
    };

    const fragmentType = this.categorizeFragment(fragment.description);
    return outputTypes[fragmentType as keyof typeof outputTypes] || 'Comprehensive deliverable';
  }

  private categorizeFragment(description: string): string {
    const desc = description.toLowerCase();
    if (desc.includes('coordinate') || desc.includes('orchestrate')) return 'coordination';
    if (desc.includes('analyze') || desc.includes('review')) return 'analysis';
    if (desc.includes('implement') || desc.includes('build')) return 'implementation';
    if (desc.includes('design') || desc.includes('ui')) return 'design';
    if (desc.includes('optimize') || desc.includes('performance')) return 'optimization';
    return 'analysis';
  }

  private calculateTaskSimilarity(task1: string, task2: string): number {
    const words1 = new Set(task1.toLowerCase().split(/\s+/));
    const words2 = new Set(task2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((word) => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private generateTaskId(taskDescription: string): string {
    const timestamp = Date.now();
    const hash = taskDescription
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 30);
    return `${hash}-${timestamp}`;
  }

  private enhanceReasoning(baseReasoning: string, constraints?: any): string {
    let enhanced = baseReasoning;

    if (constraints) {
      enhanced += '\nConstraints Applied:\n';
      if (constraints.maxTeamSize) {
        enhanced += `- Maximum team size: ${constraints.maxTeamSize}\n`;
      }
      if (constraints.timeConstraint) {
        enhanced += `- Time constraint: ${constraints.timeConstraint}\n`;
      }
      if (constraints.preferredAgents) {
        enhanced += `- Preferred agents: ${constraints.preferredAgents.join(', ')}\n`;
      }
      if (constraints.excludedAgents) {
        enhanced += `- Excluded agents: ${constraints.excludedAgents.join(', ')}\n`;
      }
    }

    return enhanced;
  }
}
