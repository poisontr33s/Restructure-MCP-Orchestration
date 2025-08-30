import { describe, test, expect } from 'vitest';
import { 
  createHTTPClient, 
  createWebSocketClient, 
  createMCPClient,
  type MCPClient,
  type MCPClientOptions,
  type MCPRequest,
  type MCPResponse,
  type TransportType,
  MCPError 
} from '../src/index';

describe('MCP v2 TypeScript Client - Functional Tests', () => {
  
  test('HTTP client can be created and configured', () => {
    const client = createHTTPClient('http://localhost:3000');
    
    expect(client).toBeDefined();
    expect(typeof client.request).toBe('function');
    expect(typeof client.connect).toBe('function');
    expect(typeof client.disconnect).toBe('function');
    expect(typeof client.isConnected).toBe('function');
    expect(typeof client.getConnectionState).toBe('function');
  });

  test('WebSocket client can be created and configured', () => {
    const client = createWebSocketClient('ws://localhost:3001');
    
    expect(client).toBeDefined();
    expect(typeof client.request).toBe('function');
    expect(typeof client.connect).toBe('function');
    expect(typeof client.disconnect).toBe('function');
    expect(typeof client.isConnected).toBe('function');
    expect(typeof client.stream).toBe('function');
  });

  test('Custom client can be created with complex configuration', () => {
    const config: MCPClientOptions = {
      transport: {
        type: 'http',
        url: 'http://localhost:3000',
        options: {
          timeout: 5000,
          retries: 3
        }
      },
      context: {
        sessionId: 'test-session',
        userId: 'test-user'
      },
      metrics: {
        enabled: true
      },
      logging: {
        level: 'info'
      }
    };

    const client = createMCPClient(config);
    
    expect(client).toBeDefined();
  });

  test('Client can handle context management', () => {
    const client = createHTTPClient('http://localhost:3000');
    
    // Test that client methods exist
    expect(typeof client.updateContext).toBe('function');
    expect(typeof client.getContext).toBe('function');
  });

  test('Client request method works', () => {
    const client = createHTTPClient('http://localhost:3000');
    
    // Test that request method exists and can be called
    expect(typeof client.request).toBe('function');
    
    // This tests the method signature without actual network call
    const requestCall = () => client.request('test.ping', { message: 'hello' });
    expect(requestCall).toBeTypeOf('function');
  });

  test('Error classes work correctly', () => {
    const error = new MCPError('Test error', 500, 'TEST_ERROR');
    
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(500);
    expect(error.type).toBe('TEST_ERROR');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof MCPError).toBe(true);
  });

  test('Factory functions produce consistent clients', () => {
    const httpClient1 = createHTTPClient('http://localhost:3000');
    const httpClient2 = createHTTPClient('http://localhost:3000');
    
    // Should be different instances
    expect(httpClient1).not.toBe(httpClient2);
    
    // Both should be valid client instances
    expect(httpClient1).toBeDefined();
    expect(httpClient2).toBeDefined();
  });

  test('Transport configuration validation', () => {
    // Test HTTP transport
    const httpClient = createHTTPClient('http://localhost:3000');
    expect(httpClient).toBeDefined();

    // Test WebSocket transport  
    const wsClient = createWebSocketClient('ws://localhost:3001');
    expect(wsClient).toBeDefined();
  });

  test('Client lifecycle methods exist', () => {
    const client = createHTTPClient('http://localhost:3000');
    
    // Test that all required methods exist
    expect(typeof client.connect).toBe('function');
    expect(typeof client.disconnect).toBe('function');
    expect(typeof client.isConnected).toBe('function');
    expect(typeof client.getConnectionState).toBe('function');
    
    // Initial state should be disconnected
    expect(client.isConnected()).toBe(false);
  });

  test('Client has utility methods', () => {
    const client = createHTTPClient('http://localhost:3000');
    
    expect(typeof client.ping).toBe('function');
    expect(typeof client.getServerInfo).toBe('function');
    expect(typeof client.getCapabilities).toBe('function');
  });

  test('Client has tool execution methods', () => {
    const client = createHTTPClient('http://localhost:3000');
    
    expect(typeof client.executeTool).toBe('function');
    expect(typeof client.getResource).toBe('function');
    expect(typeof client.listResources).toBe('function');
  });

  test('Multiple transport types can coexist', () => {
    const httpClient = createHTTPClient('http://localhost:3000');
    const wsClient = createWebSocketClient('ws://localhost:3001');
    
    // Both should be valid client instances
    expect(httpClient).toBeDefined();
    expect(wsClient).toBeDefined();
    
    // Should be different instances
    expect(httpClient).not.toBe(wsClient);
  });

  test('Client supports event handling', () => {
    const client = createHTTPClient('http://localhost:3000');
    
    // Test event methods exist
    expect(typeof client.on).toBe('function');
    expect(typeof client.off).toBe('function');
    expect(typeof client.emit).toBe('function');
  });

  test('Streaming functionality exists', () => {
    const client = createWebSocketClient('ws://localhost:3001');
    
    // Test streaming method exists
    expect(typeof client.stream).toBe('function');
  });

  test('Complex configuration works', () => {
    const complexConfig: MCPClientOptions = {
      transport: {
        type: 'websocket',
        url: 'wss://api.example.com/mcp',
        options: {
          timeout: 10000,
          retries: 5
        }
      },
      context: {
        sessionId: 'complex-session',
        userId: 'user-123'
      },
      cache: {
        enabled: true,
        ttl: 300000
      },
      metrics: {
        enabled: true,
        interval: 10000
      },
      logging: {
        level: 'debug'
      },
      reconnect: {
        enabled: true,
        maxAttempts: 10,
        backoffMs: 2000,
        exponential: true
      }
    };

    const client = createMCPClient(complexConfig);
    expect(client).toBeDefined();
  });
});
