import { describe, it, expect } from 'vitest';
import { BaseServer } from './index.js';
import type { ServerConfig } from '@mcp/shared';

// Create a concrete implementation for testing
class TestServer extends BaseServer {
  async initialize(): Promise<void> {
    // Test implementation
  }

  async handleRequest(_req: unknown, _res: unknown): Promise<void> {
    // Test implementation
  }
}

describe('BaseServer', () => {
  it('should create a TestServer instance', () => {
    const config: ServerConfig = {
      id: 'test',
      name: 'test-server',
      type: 'sequential-thinking',
      version: '1.0.0',
      description: 'Test server',
      port: 3000,
      enabled: true
    };
    const server = new TestServer(config);
    expect(server).toBeInstanceOf(BaseServer);
  });

  it('should have correct initial status', () => {
    const config: ServerConfig = {
      id: 'test',
      name: 'test-server',
      type: 'sequential-thinking',
      version: '1.0.0',
      description: 'Test server',
      port: 3000,
      enabled: true
    };
    const server = new TestServer(config);
    expect(server.getStatus()).toBe('starting');
  });
});