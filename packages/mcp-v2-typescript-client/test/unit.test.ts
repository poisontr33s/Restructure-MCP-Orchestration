/**
 * Unit tests for MCP v2 TypeScript Client
 * These tests verify functionality without requiring network connections
 */

import { describe, it, expect } from 'vitest';
import { createHTTPClient, createWebSocketClient, createMCPClient } from '../src/index.js';

describe('MCP v2 TypeScript Client', () => {
  it('should create HTTP client with valid URL', () => {
    expect(() => {
      const client = createHTTPClient('http://localhost:3000/mcp');
      expect(client).toBeDefined();
      expect(typeof client.connect).toBe('function');
      expect(typeof client.disconnect).toBe('function');
      expect(typeof client.request).toBe('function');
    }).not.toThrow();
  });

  it('should create WebSocket client with valid URL', () => {
    expect(() => {
      const client = createWebSocketClient('ws://localhost:3000/mcp');
      expect(client).toBeDefined();
      expect(typeof client.connect).toBe('function');
      expect(typeof client.disconnect).toBe('function');
      expect(typeof client.request).toBe('function');
    }).not.toThrow();
  });

  it('should create custom client with configuration', () => {
    expect(() => {
      const client = createMCPClient({
        transport: {
          type: 'http',
          url: 'http://localhost:3000/mcp'
        },
        logging: {
          level: 'info'
        }
      });
      expect(client).toBeDefined();
      expect(typeof client.connect).toBe('function');
      expect(typeof client.disconnect).toBe('function');
      expect(typeof client.request).toBe('function');
    }).not.toThrow();
  });

  it('should have all required client methods', () => {
    const client = createHTTPClient('http://localhost:3000/mcp');
    
    const expectedMethods = [
      'connect', 'disconnect', 'isConnected', 'getConnectionState',
      'request', 'stream', 'executeTool', 'getResource', 'listResources',
      'updateContext', 'getContext', 'ping', 'getServerInfo', 'getCapabilities',
      'on', 'off', 'emit'
    ];

    for (const method of expectedMethods) {
      expect(typeof (client as any)[method]).toBe('function');
    }
  });

  it('should create clients with various URLs', () => {
    // Test that clients can be created with different URL formats
    expect(() => {
      createHTTPClient('http://example.com/mcp');
    }).not.toThrow();

    expect(() => {
      createWebSocketClient('ws://example.com/mcp');
    }).not.toThrow();
  });

  it('should validate configuration options', () => {
    expect(() => {
      createMCPClient({
        transport: {
          type: 'http',
          url: 'http://localhost:3000/mcp'
        },
        metrics: {
          enabled: true
        },
        logging: {
          level: 'debug'
        }
      });
    }).not.toThrow();
  });
});
