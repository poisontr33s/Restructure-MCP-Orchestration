import { AgentRouter, AgentDelegationResult, TaskFragment, ExecutionStep } from './agent-router';
import { TaskClassifier, TaskClassification } from './task-classifier';
import { Task } from '../../../shared/src/types';

export interface CoordinationSession {
  id: string;
  taskDescription: string;
  classification: TaskClassification;
  delegation: AgentDelegationResult;
  currentStep: number;
  status: SessionStatus;
  results: Map<string, AgentResult>;
  startTime: Date;
  lastUpdate: Date;
  metadata: SessionMetadata;
}

export interface AgentResult {
  agentName: string;
  fragmentId: string;
  output: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  confidence: number;
  dependencies: string[];
  followUpTasks: string[];
}

export interface SessionMetadata {
  priority: number;
  estimatedDuration: number;
  actualDuration?: number;
  resourceUtilization: number;
  complexityFactors: string[];
  riskAssessment: RiskLevel;
}

export enum SessionStatus {
  INITIALIZING = 'initializing',
  PLANNING = 'planning',
  EXECUTING = 'executing',
  COORDINATING = 'coordinating',
  INTEGRATING = 'integrating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class MultiAgentCoordinator {
  private router: AgentRouter;
  private classifier: TaskClassifier;
  private activeSessions: Map<string, CoordinationSession> = new Map();
  private sessionHistory: CoordinationSession[] = [];
  private maxConcurrentSessions: number = 5;

  constructor() {
    this.router = new AgentRouter();
    this.classifier = new TaskClassifier();
  }

  public async coordinateTask(
    taskDescription: string,
    options?: {
      priority?: number;
      maxAgents?: number;
      timeConstraint?: 'immediate' | 'hours' | 'days';
      riskTolerance?: RiskLevel;
      preferredAgents?: string[];
      excludedAgents?: string[];
    }
  ): Promise<CoordinationSession> {
    // Check capacity
    if (this.activeSessions.size >= this.maxConcurrentSessions) {
      throw new Error(
        'Maximum concurrent sessions reached. Please wait for completion or increase capacity.'
      );
    }

    // Create session
    const sessionId = this.generateSessionId();
    const classification = this.classifier.classify(taskDescription);
    const delegation = await this.router.delegateTask(taskDescription, null, {
      maxTeamSize: options?.maxAgents,
      preferredAgents: options?.preferredAgents,
      excludedAgents: options?.excludedAgents,
      timeConstraint: options?.timeConstraint,
    });

    const session: CoordinationSession = {
      id: sessionId,
      taskDescription,
      classification,
      delegation,
      currentStep: 0,
      status: SessionStatus.INITIALIZING,
      results: new Map(),
      startTime: new Date(),
      lastUpdate: new Date(),
      metadata: this.calculateSessionMetadata(classification, delegation, options),
    };

    this.activeSessions.set(sessionId, session);

    // Begin coordination
    this.beginCoordination(sessionId);

    return session;
  }

  public async getSessionStatus(sessionId: string): Promise<CoordinationSession | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  public async pauseSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === SessionStatus.EXECUTING) {
      session.status = SessionStatus.PAUSED;
      session.lastUpdate = new Date();
      return true;
    }
    return false;
  }

  public async resumeSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === SessionStatus.PAUSED) {
      session.status = SessionStatus.EXECUTING;
      session.lastUpdate = new Date();
      this.continueExecution(sessionId);
      return true;
    }
    return false;
  }

  public async cancelSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = SessionStatus.FAILED;
      session.lastUpdate = new Date();
      this.archiveSession(sessionId);
      return true;
    }
    return false;
  }

  public getActiveSessionsSummary(): {
    total: number;
    byStatus: Map<SessionStatus, number>;
    avgProgress: number;
    resourceUtilization: number;
  } {
    const sessions = Array.from(this.activeSessions.values());
    const total = sessions.length;

    const byStatus = new Map<SessionStatus, number>();
    let totalProgress = 0;
    let totalUtilization = 0;

    sessions.forEach((session) => {
      byStatus.set(session.status, (byStatus.get(session.status) || 0) + 1);
      totalProgress += this.calculateSessionProgress(session);
      totalUtilization += session.metadata.resourceUtilization;
    });

    return {
      total,
      byStatus,
      avgProgress: total > 0 ? totalProgress / total : 0,
      resourceUtilization: total > 0 ? totalUtilization / total : 0,
    };
  }

  public async optimizeResourceAllocation(): Promise<{
    recommendations: string[];
    redistributions: AgentRedistribution[];
    efficiency: number;
  }> {
    const sessions = Array.from(this.activeSessions.values());
    const recommendations: string[] = [];
    const redistributions: AgentRedistribution[] = [];

    // Analyze agent utilization
    const agentWorkload = new Map<string, number>();
    sessions.forEach((session) => {
      session.delegation.team.forEach((agent) => {
        agentWorkload.set(agent, (agentWorkload.get(agent) || 0) + 1);
      });
    });

    // Identify overutilized agents
    const avgWorkload =
      Array.from(agentWorkload.values()).reduce((a, b) => a + b, 0) / agentWorkload.size;
    const overutilized = Array.from(agentWorkload.entries()).filter(
      ([agent, workload]) => workload > avgWorkload * 1.5
    );

    if (overutilized.length > 0) {
      recommendations.push(
        `Consider redistributing workload from overutilized agents: ${overutilized.map(([agent]) => agent).join(', ')}`
      );
    }

    // Look for efficiency improvements
    const stagnantSessions = sessions.filter(
      (session) => Date.now() - session.lastUpdate.getTime() > 30 * 60 * 1000 // 30 minutes
    );

    if (stagnantSessions.length > 0) {
      recommendations.push(
        `${stagnantSessions.length} sessions appear stagnant - consider intervention or reassignment`
      );
    }

    const efficiency = this.calculateOverallEfficiency(sessions);

    return { recommendations, redistributions, efficiency };
  }

  private async beginCoordination(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      session.status = SessionStatus.PLANNING;
      session.lastUpdate = new Date();

      // Initialize agent results
      session.delegation.taskBreakdown.forEach((fragment) => {
        session.results.set(fragment.id, {
          agentName: fragment.assignedAgent,
          fragmentId: fragment.id,
          output: '',
          status: 'pending',
          confidence: 0,
          dependencies: fragment.dependencies,
          followUpTasks: [],
        });
      });

      // Begin execution
      session.status = SessionStatus.EXECUTING;
      await this.executeNextSteps(sessionId);
    } catch (error) {
      session.status = SessionStatus.FAILED;
      console.error(`Coordination failed for session ${sessionId}:`, error);
    }
  }

  private async executeNextSteps(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Find executable steps (dependencies satisfied)
    const executableSteps = session.delegation.executionPlan.filter((step) => {
      const result = session.results.get(this.findFragmentIdForStep(step, session));
      const dependenciesSatisfied = step.dependencies.every((depId) => {
        const depResult = session.results.get(depId);
        return depResult && depResult.status === 'completed';
      });

      return result && result.status === 'pending' && dependenciesSatisfied;
    });

    // Execute parallel steps
    const parallelSteps = executableSteps.filter((step) => step.parallel);
    const sequentialSteps = executableSteps.filter((step) => !step.parallel);

    // Process parallel steps concurrently
    if (parallelSteps.length > 0) {
      await Promise.all(parallelSteps.map((step) => this.executeStep(sessionId, step)));
    }

    // Process sequential steps one by one
    for (const step of sequentialSteps) {
      await this.executeStep(sessionId, step);
    }

    // Check if session is complete
    await this.checkSessionCompletion(sessionId);
  }

  private async executeStep(sessionId: string, step: ExecutionStep): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const fragmentId = this.findFragmentIdForStep(step, session);
    const result = session.results.get(fragmentId);
    if (!result) return;

    result.status = 'in-progress';
    result.startTime = new Date();
    session.lastUpdate = new Date();

    try {
      // Simulate agent execution (in real implementation, this would call the actual agent)
      const agentOutput = await this.simulateAgentExecution(step.agent, step.action);

      result.output = agentOutput.output;
      result.confidence = agentOutput.confidence;
      result.followUpTasks = agentOutput.followUpTasks;
      result.status = 'completed';
      result.endTime = new Date();

      session.lastUpdate = new Date();

      // Continue with next steps
      setTimeout(() => this.executeNextSteps(sessionId), 100);
    } catch (error) {
      result.status = 'failed';
      result.output = `Execution failed: ${error}`;
      result.endTime = new Date();
      session.lastUpdate = new Date();
    }
  }

  private async simulateAgentExecution(
    agent: string,
    action: string
  ): Promise<{
    output: string;
    confidence: number;
    followUpTasks: string[];
  }> {
    // In real implementation, this would delegate to the actual agent
    // For now, simulate with realistic delays and outputs
    const delay = Math.random() * 2000 + 1000; // 1-3 second delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    return {
      output: `${agent} completed: ${action}`,
      confidence: 0.8 + Math.random() * 0.2,
      followUpTasks: [],
    };
  }

  private async checkSessionCompletion(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const allResults = Array.from(session.results.values());
    const completedCount = allResults.filter((result) => result.status === 'completed').length;
    const failedCount = allResults.filter((result) => result.status === 'failed').length;
    const totalCount = allResults.length;

    if (completedCount + failedCount === totalCount) {
      if (failedCount === 0) {
        session.status = SessionStatus.INTEGRATING;
        await this.integrateResults(sessionId);
      } else {
        session.status = SessionStatus.FAILED;
        this.archiveSession(sessionId);
      }
    }
  }

  private async integrateResults(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      // Simulate result integration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      session.status = SessionStatus.COMPLETED;
      session.metadata.actualDuration = Date.now() - session.startTime.getTime();
      session.lastUpdate = new Date();

      this.archiveSession(sessionId);
    } catch (error) {
      session.status = SessionStatus.FAILED;
      this.archiveSession(sessionId);
    }
  }

  private findFragmentIdForStep(step: ExecutionStep, session: CoordinationSession): string {
    return (
      session.delegation.taskBreakdown.find(
        (fragment) => fragment.assignedAgent === step.agent && fragment.description === step.action
      )?.id || 'unknown'
    );
  }

  private calculateSessionProgress(session: CoordinationSession): number {
    const allResults = Array.from(session.results.values());
    const totalSteps = allResults.length;
    const completedSteps = allResults.filter((result) => result.status === 'completed').length;
    const inProgressSteps = allResults.filter((result) => result.status === 'in-progress').length;

    return totalSteps > 0 ? (completedSteps + inProgressSteps * 0.5) / totalSteps : 0;
  }

  private calculateSessionMetadata(
    classification: TaskClassification,
    delegation: AgentDelegationResult,
    options?: any
  ): SessionMetadata {
    const estimatedDuration = this.estimateSessionDuration(classification, delegation);
    const priority = options?.priority || this.calculatePriority(classification);
    const resourceUtilization = delegation.team.length / this.maxConcurrentSessions;
    const complexityFactors = this.identifyComplexityFactors(classification);
    const riskAssessment = options?.riskTolerance || this.assessRisk(classification, delegation);

    return {
      priority,
      estimatedDuration,
      resourceUtilization,
      complexityFactors,
      riskAssessment,
    };
  }

  private estimateSessionDuration(
    classification: TaskClassification,
    delegation: AgentDelegationResult
  ): number {
    const baseTime = 30 * 60 * 1000; // 30 minutes base
    const complexityMultiplier =
      {
        trivial: 0.5,
        low: 0.75,
        medium: 1,
        high: 1.5,
        expert: 2,
        breakthrough: 3,
      }[classification.complexityLevel] || 1;

    const teamSizeMultiplier = delegation.team.length > 1 ? 1.2 : 1;

    return Math.round(baseTime * complexityMultiplier * teamSizeMultiplier);
  }

  private calculatePriority(classification: TaskClassification): number {
    const urgencyWeight =
      {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4,
        emergency: 5,
      }[classification.urgencyLevel] || 2;

    const complexityWeight =
      {
        trivial: 1,
        low: 1,
        medium: 2,
        high: 3,
        expert: 4,
        breakthrough: 5,
      }[classification.complexityLevel] || 2;

    return Math.min(10, urgencyWeight + complexityWeight);
  }

  private identifyComplexityFactors(classification: TaskClassification): string[] {
    const factors: string[] = [];

    if (classification.secondaryCategories.length > 2) {
      factors.push('multi-domain');
    }

    if (classification.collaborationStyle === 'cross-functional') {
      factors.push('cross-functional-coordination');
    }

    if (
      classification.complexityLevel === 'expert' ||
      classification.complexityLevel === 'breakthrough'
    ) {
      factors.push('high-expertise-required');
    }

    if (classification.taskPatterns.includes('parallel-execution' as any)) {
      factors.push('parallel-coordination');
    }

    return factors;
  }

  private assessRisk(
    classification: TaskClassification,
    delegation: AgentDelegationResult
  ): RiskLevel {
    let riskScore = 0;

    if (
      classification.complexityLevel === 'expert' ||
      classification.complexityLevel === 'breakthrough'
    ) {
      riskScore += 2;
    }

    if (delegation.team.length > 4) {
      riskScore += 1;
    }

    if (classification.urgencyLevel === 'critical' || classification.urgencyLevel === 'emergency') {
      riskScore += 1;
    }

    if (classification.confidence < 0.6) {
      riskScore += 2;
    }

    if (riskScore >= 4) return RiskLevel.CRITICAL;
    if (riskScore >= 3) return RiskLevel.HIGH;
    if (riskScore >= 2) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private calculateOverallEfficiency(sessions: CoordinationSession[]): number {
    if (sessions.length === 0) return 1.0;

    const completedSessions = sessions.filter((s) => s.status === SessionStatus.COMPLETED);
    const totalProgress = sessions.reduce(
      (sum, session) => sum + this.calculateSessionProgress(session),
      0
    );

    return sessions.length > 0 ? totalProgress / sessions.length : 0;
  }

  private continueExecution(sessionId: string): void {
    setTimeout(() => this.executeNextSteps(sessionId), 100);
  }

  private archiveSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.sessionHistory.push(session);
      this.activeSessions.delete(sessionId);

      // Keep only last 100 sessions in history
      if (this.sessionHistory.length > 100) {
        this.sessionHistory = this.sessionHistory.slice(-100);
      }
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface AgentRedistribution {
  fromAgent: string;
  toAgent: string;
  taskFragments: string[];
  reason: string;
}
