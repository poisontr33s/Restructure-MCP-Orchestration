/**
 * MCP v2 Core Types
 * Type definitions for the Model Context Protocol v2
 */

import { z } from 'zod';

// === Core Protocol Types ===

export const MCPRequestSchema = z.object({
  id: z.string().uuid(),
  method: z.string(),
  params: z.record(z.any()).optional(),
  context: z.record(z.any()).optional(),
  metadata: z.object({
    timestamp: z.number(),
    version: z.string().default('2.0'),
    source: z.string(),
    traceId: z.string().optional(),
    sessionId: z.string().optional(),
    capabilities: z.array(z.string()).optional(),
    priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
    timeout: z.number().optional(),
    retryPolicy: z.object({
      maxRetries: z.number().default(3),
      backoffMs: z.number().default(1000),
      exponential: z.boolean().default(true)
    }).optional()
  })
});

export const MCPResponseSchema = z.object({
  id: z.string().uuid(),
  result: z.record(z.any()).optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.record(z.any()).optional(),
    type: z.string().optional(),
    stack: z.string().optional()
  }).optional(),
  context: z.record(z.any()).optional(),
  metadata: z.object({
    timestamp: z.number(),
    version: z.string().default('2.0'),
    processingTime: z.number().optional(),
    serverInfo: z.object({
      name: z.string(),
      version: z.string(),
      capabilities: z.array(z.string())
    }).optional(),
    learning: z.object({
      signals: z.array(z.record(z.any())),
      feedback: z.record(z.any()).optional(),
      analytics: z.record(z.any()).optional()
    }).optional()
  })
});

export const MCPContextSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().optional(),
  workspace: z.object({
    id: z.string(),
    name: z.string(),
    path: z.string().optional(),
    type: z.string().optional()
  }).optional(),
  environment: z.object({
    platform: z.string(),
    version: z.string(),
    capabilities: z.array(z.string()),
    limits: z.object({
      maxMemory: z.number().optional(),
      maxCpu: z.number().optional(),
      timeout: z.number().optional()
    }).optional()
  }),
  conversation: z.object({
    id: z.string(),
    messages: z.array(z.record(z.any())),
    metadata: z.record(z.any()).optional()
  }).optional(),
  tools: z.array(z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.record(z.any()),
    capabilities: z.array(z.string()).optional()
  })).optional(),
  resources: z.array(z.object({
    uri: z.string(),
    name: z.string(),
    type: z.string(),
    metadata: z.record(z.any()).optional()
  })).optional()
});

// Infer TypeScript types from Zod schemas
export type MCPRequest = z.infer<typeof MCPRequestSchema>;
export type MCPResponse = z.infer<typeof MCPResponseSchema>;
export type MCPContext = z.infer<typeof MCPContextSchema>;

// === Transport Types ===

export type TransportType = 'http' | 'websocket' | 'grpc' | 'tcp' | 'unix';

export interface TransportConfig {
  type: TransportType;
  url: string;
  options?: {
    timeout?: number;
    retries?: number;
    compression?: boolean;
    authentication?: {
      type: 'bearer' | 'basic' | 'api-key' | 'oauth2';
      credentials: Record<string, string>;
    };
    tls?: {
      enabled: boolean;
      cert?: string;
      key?: string;
      ca?: string;
      insecure?: boolean;
    };
    headers?: Record<string, string>;
    proxy?: {
      host: string;
      port: number;
      auth?: { username: string; password: string };
    };
  };
}

// === Client Types ===

export type ConnectionState = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting' 
  | 'error' 
  | 'closed';

export interface MCPClientOptions {
  transport: TransportConfig;
  context?: Partial<MCPContext>;
  reconnect?: {
    enabled: boolean;
    maxAttempts: number;
    backoffMs: number;
    exponential: boolean;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
    redis?: {
      host: string;
      port: number;
      password?: string;
      db?: number;
    };
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    transport?: 'console' | 'file' | 'remote';
    format?: 'json' | 'text';
  };
  metrics?: {
    enabled: boolean;
    endpoint?: string;
    interval?: number;
  };
}

export interface MCPClient {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnectionState(): ConnectionState;
  
  // Request/response
  request<T = any>(method: string, params?: Record<string, any>, options?: RequestOptions): Promise<T>;
  
  // Streaming
  stream<T = any>(method: string, params?: Record<string, any>): AsyncIterableIterator<T>;
  
  // Tool execution
  executeTool(name: string, parameters: Record<string, any>): Promise<any>;
  
  // Resource management
  getResource(uri: string): Promise<any>;
  listResources(): Promise<Array<{ uri: string; name: string; type: string }>>;
  
  // Context management
  updateContext(context: Partial<MCPContext>): Promise<void>;
  getContext(): MCPContext;
  
  // Event handling
  on(event: string, listener: (...args: any[]) => void): void;
  off(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  
  // Utilities
  ping(): Promise<number>;
  getServerInfo(): Promise<ServerInfo>;
  getCapabilities(): Promise<string[]>;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  traceId?: string;
  cache?: boolean;
  streaming?: boolean;
}

export interface ServerInfo {
  name: string;
  version: string;
  protocol_version: string;
  capabilities: string[];
  description?: string;
  author?: string;
  license?: string;
}

// === Error Types ===

export class MCPError extends Error {
  public readonly code: number;
  public readonly type: string;
  public readonly data?: Record<string, any>;

  constructor(message: string, code: number, type: string = 'MCPError', data?: Record<string, any>) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.type = type;
    this.data = data;
  }
}

export class MCPConnectionError extends MCPError {
  constructor(message: string, data?: Record<string, any>) {
    super(message, -32003, 'ConnectionError', data);
    this.name = 'MCPConnectionError';
  }
}

export class MCPTimeoutError extends MCPError {
  constructor(message: string, data?: Record<string, any>) {
    super(message, -32004, 'TimeoutError', data);
    this.name = 'MCPTimeoutError';
  }
}

export class MCPValidationError extends MCPError {
  constructor(message: string, data?: Record<string, any>) {
    super(message, -32602, 'ValidationError', data);
    this.name = 'MCPValidationError';
  }
}

// === Event Types ===

export interface MCPClientEvents {
  connected: () => void;
  disconnected: (reason?: string) => void;
  reconnecting: (attempt: number) => void;
  error: (error: MCPError) => void;
  message: (message: MCPResponse) => void;
  request: (request: MCPRequest) => void;
  response: (response: MCPResponse) => void;
  contextUpdate: (context: Partial<MCPContext>) => void;
  serverInfo: (info: ServerInfo) => void;
}

// === Tool Types ===

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
      default?: any;
    }>;
    required?: string[];
  };
  capabilities?: string[];
  examples?: Array<{
    parameters: Record<string, any>;
    result: any;
    description?: string;
  }>;
}

export interface ToolExecution {
  id: string;
  name: string;
  parameters: Record<string, any>;
  startTime: number;
  endTime?: number;
  result?: any;
  error?: MCPError;
  metadata?: Record<string, any>;
}

// === Resource Types ===

export interface ResourceDefinition {
  uri: string;
  name: string;
  type: string;
  description?: string;
  metadata?: Record<string, any>;
  content?: {
    mimeType: string;
    encoding?: 'utf8' | 'base64';
    data: string;
  };
  capabilities?: string[];
}

// === Batch Operation Types ===

export interface BatchRequest {
  id: string;
  requests: MCPRequest[];
  options?: {
    parallel?: boolean;
    stopOnError?: boolean;
    timeout?: number;
  };
}

export interface BatchResponse {
  id: string;
  responses: MCPResponse[];
  metadata: {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    processingTime: number;
  };
}

// === Streaming Types ===

export interface StreamOptions {
  bufferSize?: number;
  timeout?: number;
  maxItems?: number;
  filter?: (item: any) => boolean;
  transform?: (item: any) => any;
}

export interface StreamMetadata {
  id: string;
  startTime: number;
  itemCount: number;
  bytesReceived: number;
  isComplete: boolean;
  error?: MCPError;
}

// === Intelligence & Learning Types ===

export interface LearningSignal {
  type: 'performance' | 'error' | 'usage' | 'feedback' | 'outcome';
  timestamp: number;
  data: Record<string, any>;
  context?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high';
}

export interface IntelligenceCapabilities {
  contextAwareness: boolean;
  adaptiveBehavior: boolean;
  performanceOptimization: boolean;
  errorPrediction: boolean;
  resourceOptimization: boolean;
  userPersonalization: boolean;
}

// === Cache Types ===

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  metadata?: Record<string, any>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  memory: number;
}

// === Monitoring Types ===

export interface MetricsData {
  requests: {
    total: number;
    success: number;
    errors: number;
    latency: {
      min: number;
      max: number;
      avg: number;
      p95: number;
      p99: number;
    };
  };
  connections: {
    active: number;
    total: number;
    failed: number;
  };
  resources: {
    memory: number;
    cpu: number;
    network: {
      in: number;
      out: number;
    };
  };
  cache?: CacheStats;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: number;
  checks: Record<string, {
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    timestamp: number;
  }>;
  metrics?: MetricsData;
}
