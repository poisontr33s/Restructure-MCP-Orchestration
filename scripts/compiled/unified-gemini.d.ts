#!/usr/bin/env node
/**
 * Unified Gemini TypeScript Implementation
 * Combines AI Studio, Google Gemini Pro 2.5, and CLI capabilities
 * Cross-compatible with JS/TS/TSX using pnpm workspace
 */
interface GeminiConfig {
  model: string;
  apiKey?: string;
  streaming?: boolean;
  tools?: Array<'googleSearch' | 'codeExecution'>;
  thinkingBudget?: number;
  temperature?: number;
  maxOutputTokens?: number;
  fallbackToCli?: boolean;
  includeDirectories?: string[];
  ideMode?: boolean;
}
interface GeminiResponse {
  text: string;
  chunks?: number;
  tokens?: {
    input: number;
    output: number;
    total: number;
  };
  method: 'sdk' | 'cli' | 'direct-api';
  model: string;
  streaming: boolean;
  tools: string[];
}
/**
 * Unified Gemini Client
 */
declare class UnifiedGeminiClient {
  private providers;
  generate(prompt: string, config?: Partial<GeminiConfig>): Promise<GeminiResponse>;
  listProviders(): Promise<
    Array<{
      name: string;
      available: boolean;
    }>
  >;
}
export { UnifiedGeminiClient, GeminiConfig, GeminiResponse };
