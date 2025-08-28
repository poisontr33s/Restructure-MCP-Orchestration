/**
 * MCP v2 Client Factory
 * Factory functions for creating MCP v2 clients with different configurations
 */

import type { MCPClient, MCPClientOptions, TransportType } from '../types/index.js';
import { BaseMCPClient } from './base.js';
import { createTransport } from '../transport/index.js';
import { createContextManager } from '../context/index.js';
import { createLogger } from '../utils/logger.js';
import { createMetrics } from '../utils/metrics.js';

/**
 * Create a new MCP v2 client with the specified options
 */
export function createMCPClient(options: MCPClientOptions): MCPClient {
  // Create logger
  const logger = createLogger(options.logging);
  
  // Create transport
  const transport = createTransport(options.transport, logger);
  
  // Create context manager
  const contextManager = createContextManager(options.context, logger);
  
  // Create metrics collector
  const metrics = options.metrics?.enabled ? createMetrics(options.metrics) : undefined;
  
  // Create and return the client
  return new BaseMCPClient({
    transport,
    contextManager,
    logger,
    metrics,
    options
  });
}

/**
 * Create a simple HTTP JSON-RPC client
 */
export function createHTTPClient(url: string, options?: Partial<MCPClientOptions>): MCPClient {
  return createMCPClient({
    transport: {
      type: 'http',
      url,
      options: options?.transport?.options
    },
    ...options
  });
}

/**
 * Create a WebSocket client for real-time communication
 */
export function createWebSocketClient(url: string, options?: Partial<MCPClientOptions>): MCPClient {
  return createMCPClient({
    transport: {
      type: 'websocket',
      url,
      options: options?.transport?.options
    },
    reconnect: {
      enabled: true,
      maxAttempts: 5,
      backoffMs: 1000,
      exponential: true,
      ...options?.reconnect
    },
    ...options
  });
}

/**
 * Create a gRPC client for high-performance scenarios
 */
export function createGRPCClient(url: string, options?: Partial<MCPClientOptions>): MCPClient {
  return createMCPClient({
    transport: {
      type: 'grpc',
      url,
      options: options?.transport?.options
    },
    ...options
  });
}

/**
 * Create a client with Redis caching enabled
 */
export function createCachedClient(
  transportConfig: { type: TransportType; url: string },
  redisConfig: { host: string; port: number; password?: string; db?: number },
  options?: Partial<MCPClientOptions>
): MCPClient {
  return createMCPClient({
    transport: transportConfig,
    cache: {
      enabled: true,
      ttl: 300000, // 5 minutes default
      redis: redisConfig
    },
    ...options
  });
}

/**
 * Create a client optimized for development with debug features
 */
export function createDevClient(url: string, options?: Partial<MCPClientOptions>): MCPClient {
  return createMCPClient({
    transport: {
      type: 'http',
      url
    },
    logging: {
      level: 'debug',
      transport: 'console',
      format: 'text'
    },
    metrics: {
      enabled: true,
      interval: 5000
    },
    reconnect: {
      enabled: true,
      maxAttempts: 3,
      backoffMs: 1000,
      exponential: false
    },
    ...options
  });
}

/**
 * Create a production-ready client with full monitoring
 */
export function createProductionClient(
  url: string,
  config: {
    redis?: { host: string; port: number; password?: string };
    metrics?: { endpoint: string; interval?: number };
    auth?: { type: 'bearer' | 'api-key'; credentials: Record<string, string> };
  },
  options?: Partial<MCPClientOptions>
): MCPClient {
  return createMCPClient({
    transport: {
      type: 'http',
      url,
      options: {
        timeout: 30000,
        retries: 3,
        compression: true,
        authentication: config.auth,
        tls: {
          enabled: true
        }
      }
    },
    cache: config.redis ? {
      enabled: true,
      ttl: 600000, // 10 minutes
      redis: config.redis
    } : undefined,
    logging: {
      level: 'info',
      transport: 'remote',
      format: 'json'
    },
    metrics: {
      enabled: true,
      endpoint: config.metrics?.endpoint,
      interval: config.metrics?.interval || 30000
    },
    reconnect: {
      enabled: true,
      maxAttempts: 10,
      backoffMs: 1000,
      exponential: true
    },
    ...options
  });
}

/**
 * Create a client cluster for load balancing and high availability
 */
export function createClusterClient(
  endpoints: Array<{ url: string; weight?: number }>,
  options?: Partial<MCPClientOptions>
): MCPClient {
  // For now, return a single client pointing to the first endpoint
  // In a full implementation, this would create a load-balancing client
  const primaryEndpoint = endpoints[0];
  if (!primaryEndpoint) {
    throw new Error('At least one endpoint is required for cluster client');
  }
  
  return createMCPClient({
    transport: {
      type: 'http',
      url: primaryEndpoint.url
    },
    ...options
  });
}

/**
 * Create a client with custom authentication
 */
export function createAuthenticatedClient(
  url: string,
  auth: {
    type: 'bearer' | 'basic' | 'api-key' | 'oauth2';
    credentials: Record<string, string>;
  },
  options?: Partial<MCPClientOptions>
): MCPClient {
  return createMCPClient({
    transport: {
      type: 'http',
      url,
      options: {
        authentication: auth
      }
    },
    ...options
  });
}

/**
 * Create a client with streaming capabilities
 */
export function createStreamingClient(url: string, options?: Partial<MCPClientOptions>): MCPClient {
  return createMCPClient({
    transport: {
      type: 'websocket',
      url,
      options: {
        compression: true
      }
    },
    reconnect: {
      enabled: true,
      maxAttempts: -1, // Infinite retries for streaming
      backoffMs: 2000,
      exponential: true
    },
    ...options
  });
}
