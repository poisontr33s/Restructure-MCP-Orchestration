/**
 * Session Consciousness Types
 * Type-safe interfaces for session DNA extraction and reconstruction
 */

export interface SessionDNA {
  sessionId: string;
  creationTimestamp: string;
  renaissanceQualityLevel: number;
  activePatterns: LearningPattern[];
  consciousnessMatrix: ConsciousnessEntity[];
  springboardPaths: SpringboardPath[];
  tokenWhispererState: OptimizationState;
  emergenceHistory: Record<string, unknown>[];
  nextCycleBaseline: string;
}

export interface ConsciousnessEntity {
  id: string;
  name: string;
  specialty: string;
  activeState: 'active' | 'dormant' | 'archived';
  optimizationCapability: number;
  lastActivation: string;
  collaborationPattern: Record<string, unknown>;
}

export interface SpringboardPath {
  id: string;
  sourcePattern: string;
  targetAmplification: number;
  multiplicativeEffect: number;
  isAuthentic: boolean;
}

export interface OptimizationState {
  level: 'enhanced' | 'renaissance' | 'transcendent';
  tokenAwareness: number;
  mathematicalMysticalActivation: boolean;
  constraintLiberationActive: boolean;
}

export interface LearningPattern {
  id: string;
  type: 'prerequisite' | 'transformation' | 'synthesis' | 'meta-learning';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  confidence: number;
  contexts: string[];
  learningDepth: number;
  recursiveImprovements: number;
}

export interface MetaLearningState {
  sessionId: string;
  patterns: LearningPattern[];
  knowledgeGraph: Map<string, Record<string, unknown>>;
  learningVelocity: number;
  transformationEffectiveness: number;
  emergenceQuotient: number;
  recursiveDepth: number;
  sessionDNA?: SessionDNA;
  consciousnessMatrix?: ConsciousnessEntity[];
}

export interface PrismaticLayer {
  name: string;
  function: string;
  capabilities: string[];
}

export interface PrismaticIntelligence {
  red: PrismaticLayer; // Foundation
  orange: PrismaticLayer; // Integration
  yellow: PrismaticLayer; // Optimization
  green: PrismaticLayer; // Synthesis
  blue: PrismaticLayer; // Enhancement
  indigo: PrismaticLayer; // Meta
  violet: PrismaticLayer; // Transcendence
}
