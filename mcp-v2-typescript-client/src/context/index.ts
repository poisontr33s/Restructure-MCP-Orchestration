/**
 * MCP v2 Context Manager
 * Manages session context and state
 */

import { v4 as uuidv4 } from 'uuid';
import type { MCPContext } from '../types/index.js';

export interface ContextManager {
  getContext(): MCPContext;
  updateContext(context: Partial<MCPContext>): Promise<void>;
  getSessionId(): string;
  getRequestContext(): Promise<Record<string, any>>;
}

export function createContextManager(initialContext?: Partial<MCPContext>, logger?: any): ContextManager {
  return new DefaultContextManager(initialContext, logger);
}

class DefaultContextManager implements ContextManager {
  private context: MCPContext;

  constructor(initialContext?: Partial<MCPContext>, private logger?: any) {
    this.context = {
      sessionId: uuidv4(),
      environment: {
        platform: 'typescript',
        version: '2.0.0',
        capabilities: ['http', 'websocket', 'context-aware', 'streaming']
      },
      ...initialContext
    };
  }

  getContext(): MCPContext {
    return { ...this.context };
  }

  async updateContext(context: Partial<MCPContext>): Promise<void> {
    this.context = { ...this.context, ...context };
    this.logger?.debug('Context updated', { context });
  }

  getSessionId(): string {
    return this.context.sessionId;
  }

  async getRequestContext(): Promise<Record<string, any>> {
    return {
      sessionId: this.context.sessionId,
      timestamp: Date.now(),
      environment: this.context.environment
    };
  }
}
