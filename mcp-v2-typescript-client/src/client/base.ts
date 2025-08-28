/**
 * MCP v2 Base Client Implementation
 * Core client implementation with full MCP v2 protocol support
 */

import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  MCPError,
  MCPConnectionError,
  MCPTimeoutError
} from '../types/index.js';
import type {
  MCPClient,
  MCPClientOptions,
  MCPRequest,
  MCPResponse,
  MCPContext,
  ConnectionState,
  RequestOptions,
  ServerInfo,
  StreamOptions
} from '../types/index.js';

export interface BaseMCPClientDependencies {
  transport: any; // Will be properly typed when transport module is created
  contextManager: any; // Will be properly typed when context module is created
  logger: any; // Will be properly typed when logger module is created
  metrics?: any; // Will be properly typed when metrics module is created
  options: MCPClientOptions;
}

export class BaseMCPClient extends EventEmitter implements MCPClient {
  private transport: any;
  private contextManager: any;
  private logger: any;
  private metrics?: any;
  private options: MCPClientOptions;
  private connectionState: ConnectionState = 'disconnected';
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: MCPError) => void;
    timeout?: NodeJS.Timeout;
  }>();
  private reconnectAttempts = 0;
  private serverInfo?: ServerInfo;

  constructor(dependencies: BaseMCPClientDependencies) {
    super();
    
    this.transport = dependencies.transport;
    this.contextManager = dependencies.contextManager;
    this.logger = dependencies.logger;
    this.metrics = dependencies.metrics;
    this.options = dependencies.options;

    this.setupTransportEvents();
  }

  // === Connection Management ===

  async connect(): Promise<void> {
    if (this.connectionState === 'connected') {
      return;
    }

    this.setConnectionState('connecting');
    this.logger.info('Connecting to MCP server...', { url: this.options.transport.url });

    try {
      await this.transport.connect();
      this.setConnectionState('connected');
      this.reconnectAttempts = 0;

      // Get server info after connection
      try {
        this.serverInfo = await this.getServerInfo();
        this.emit('serverInfo', this.serverInfo);
      } catch (error) {
        this.logger.warn('Failed to get server info', { error });
      }

      this.emit('connected');
      this.logger.info('Connected to MCP server');
    } catch (error) {
      this.setConnectionState('error');
      const errorMessage = error instanceof Error ? error.message : String(error);
      const mcpError = new MCPConnectionError(`Failed to connect: ${errorMessage}`, { error });
      this.emit('error', mcpError);
      throw mcpError;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectionState === 'disconnected') {
      return;
    }

    this.setConnectionState('disconnected');
    this.logger.info('Disconnecting from MCP server...');

    // Clear pending requests
    for (const [, request] of this.pendingRequests) {
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
      request.reject(new MCPConnectionError('Client disconnected'));
    }
    this.pendingRequests.clear();

    await this.transport.disconnect();
    this.emit('disconnected');
    this.logger.info('Disconnected from MCP server');
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // === Request/Response ===

  async request<T = any>(
    method: string, 
    params?: Record<string, any>, 
    options?: RequestOptions
  ): Promise<T> {
    if (!this.isConnected()) {
      throw new MCPConnectionError('Client is not connected');
    }

    const requestId = uuidv4();
    const request: MCPRequest = {
      id: requestId,
      method,
      params,
      context: await this.contextManager.getRequestContext(),
      metadata: {
        timestamp: Date.now(),
        version: '2.0',
        source: 'typescript-client',
        traceId: options?.traceId || uuidv4(),
        sessionId: this.contextManager.getSessionId(),
        priority: options?.priority || 'normal',
        timeout: options?.timeout || this.options.transport.options?.timeout,
        retryPolicy: options?.retries ? {
          maxRetries: options.retries,
          backoffMs: 1000,
          exponential: true
        } : undefined
      }
    };

    return new Promise<T>((resolve, reject) => {
      // Set up timeout
      let timeoutHandle: NodeJS.Timeout | undefined;
      const timeoutMs = options?.timeout || this.options.transport.options?.timeout || 30000;
      
      if (timeoutMs > 0) {
        timeoutHandle = setTimeout(() => {
          this.pendingRequests.delete(requestId);
          reject(new MCPTimeoutError(`Request timeout after ${timeoutMs}ms`, { requestId, method }));
        }, timeoutMs);
      }

      // Store the request
      this.pendingRequests.set(requestId, {
        resolve: (value: any) => {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          resolve(value);
        },
        reject: (error: MCPError) => {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          reject(error);
        },
        timeout: timeoutHandle
      });

      // Send the request
      this.transport.send(request).catch((error: Error) => {
        this.pendingRequests.delete(requestId);
        if (timeoutHandle) clearTimeout(timeoutHandle);
        reject(new MCPConnectionError(`Failed to send request: ${error.message}`, { error, requestId }));
      });

      // Emit request event
      this.emit('request', request);
      this.logger.debug('Sent request', { requestId, method, params });
    });
  }

  // === Streaming ===

  async* stream<T = any>(
    method: string, 
    params?: Record<string, any>,
    options?: StreamOptions
  ): AsyncIterableIterator<T> {
    if (!this.isConnected()) {
      throw new MCPConnectionError('Client is not connected');
    }

    // For HTTP transport, this would use Server-Sent Events or chunked responses
    // For WebSocket transport, this would use the streaming protocol
    const streamId = uuidv4();
    
    try {
      const response = await this.request(method, {
        ...params,
        _stream: true,
        _streamId: streamId,
        _streamOptions: options
      });

      // This is a simplified implementation
      // In reality, we'd handle the streaming protocol properly
      if (Array.isArray(response)) {
        for (const item of response) {
          yield item as T;
        }
      } else {
        yield response as T;
      }
    } catch (error) {
      throw error;
    }
  }

  // === Tool Execution ===

  async executeTool(name: string, parameters: Record<string, any>): Promise<any> {
    return this.request('tools/execute', {
      name,
      parameters
    });
  }

  // === Resource Management ===

  async getResource(uri: string): Promise<any> {
    return this.request('resources/get', { uri });
  }

  async listResources(): Promise<Array<{ uri: string; name: string; type: string }>> {
    return this.request('resources/list');
  }

  // === Context Management ===

  async updateContext(context: Partial<MCPContext>): Promise<void> {
    await this.contextManager.updateContext(context);
    this.emit('contextUpdate', context);
  }

  getContext(): MCPContext {
    return this.contextManager.getContext();
  }

  // === Utilities ===

  async ping(): Promise<number> {
    const start = Date.now();
    await this.request('ping');
    return Date.now() - start;
  }

  async getServerInfo(): Promise<ServerInfo> {
    return this.request('server/info');
  }

  async getCapabilities(): Promise<string[]> {
    const info = await this.getServerInfo();
    return info.capabilities || [];
  }

  // === Private Methods ===

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      const previousState = this.connectionState;
      this.connectionState = state;
      this.logger.debug('Connection state changed', { from: previousState, to: state });
      
      // Emit state-specific events
      if (state === 'connected') {
        this.emit('connected');
      } else if (state === 'disconnected') {
        this.emit('disconnected');
      } else if (state === 'error') {
        this.emit('error', new MCPConnectionError('Connection error'));
      }
    }
  }

  private setupTransportEvents(): void {
    this.transport.on('message', (message: MCPResponse) => {
      this.handleResponse(message);
    });

    this.transport.on('error', (error: Error) => {
      const mcpError = new MCPConnectionError(`Transport error: ${error.message}`, { error });
      this.emit('error', mcpError);
      this.logger.error('Transport error', { error });
    });

    this.transport.on('disconnect', (reason?: string) => {
      this.setConnectionState('disconnected');
      this.emit('disconnected', reason);
      
      // Handle reconnection
      if (this.options.reconnect?.enabled && this.reconnectAttempts < (this.options.reconnect.maxAttempts || 5)) {
        this.handleReconnection();
      }
    });
  }

  private handleResponse(response: MCPResponse): void {
    this.emit('response', response);
    this.logger.debug('Received response', { responseId: response.id });

    const pendingRequest = this.pendingRequests.get(response.id);
    if (!pendingRequest) {
      this.logger.warn('Received response for unknown request', { responseId: response.id });
      return;
    }

    this.pendingRequests.delete(response.id);

    if (response.error) {
      const error = new MCPError(
        response.error.message,
        response.error.code,
        response.error.type || 'ServerError',
        response.error.data
      );
      pendingRequest.reject(error);
    } else {
      pendingRequest.resolve(response.result);
    }

    // Update context if provided
    if (response.context) {
      this.contextManager.updateContext(response.context);
    }

    // Process learning signals
    if (response.metadata?.learning) {
      this.metrics?.recordLearning(response.metadata.learning);
    }
  }

  private async handleReconnection(): Promise<void> {
    this.reconnectAttempts++;
    this.setConnectionState('reconnecting');
    this.emit('reconnecting', this.reconnectAttempts);

    const backoffMs = this.options.reconnect?.exponential 
      ? (this.options.reconnect.backoffMs || 1000) * Math.pow(2, this.reconnectAttempts - 1)
      : this.options.reconnect?.backoffMs || 1000;

    this.logger.info('Attempting to reconnect', { 
      attempt: this.reconnectAttempts, 
      backoffMs 
    });

    await new Promise(resolve => setTimeout(resolve, backoffMs));

    try {
      await this.connect();
    } catch (error) {
      this.logger.error('Reconnection failed', { 
        attempt: this.reconnectAttempts, 
        error 
      });
      
      if (this.reconnectAttempts < (this.options.reconnect?.maxAttempts || 5)) {
        this.handleReconnection();
      } else {
        this.setConnectionState('error');
        this.emit('error', new MCPConnectionError('Max reconnection attempts reached'));
      }
    }
  }
}
