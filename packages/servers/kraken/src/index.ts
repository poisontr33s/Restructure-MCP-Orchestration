import http from 'http';
import { type ServerConfig, type ServerStatus } from '@mcp/shared';

/**
 * Base Server Options interface
 */
export interface BaseServerOptions {
  port?: number;
  host?: string;
}

/**
 * Base Server class for all MCP servers
 */
export abstract class BaseServer {
  protected server: http.Server;
  protected port: number;
  protected host: string;
  protected status: ServerStatus = 'starting';
  protected startTime: Date = new Date();
  
  /**
   * Constructor
   * @param config Server configuration
   * @param options Additional server options
   */
  constructor(protected config: ServerConfig, options: BaseServerOptions = {}) {
    this.port = options.port || config.port;
    this.host = options.host || 'localhost';
    this.server = http.createServer(this.handleRequest.bind(this));
    
    // Setup error handling
    this.server.on('error', this.handleServerError.bind(this));
  }
  
  /**
   * Start the server
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(this.port, () => {
          this.status = 'running';
          this.log(`Server started successfully on port ${this.port}`);
          resolve();
        });
      } catch (error) {
        this.status = 'error';
        reject(error);
      }
    });
  }
  
  /**
   * Stop the server
   */
  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }
      
      this.server.close(() => {
        this.status = 'stopped';
        this.log('Server stopped');
        resolve();
      });
    });
  }
  
  /**
   * Get server status
   */
  public getStatus(): ServerStatus {
    return this.status;
  }
  
  /**
   * Get server info
   */
  public getInfo() {
    return {
      type: this.config.type,
      name: this.config.name,
      port: this.port,
      status: this.status,
      startTime: this.startTime,
      uptime: Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000)
    };
  }
  
  /**
   * Handle incoming HTTP requests
   * Must be implemented by subclasses
   */
  protected abstract handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void;
  
  /**
   * Handle server errors
   */
  protected handleServerError(error: Error & { code?: string }): void {
    this.status = 'error';
    this.log(`Server error: ${error.message}`, 'ERROR');
    
    if (error.code === 'EADDRINUSE') {
      this.log(`Port ${this.port} is already in use`, 'ERROR');
    }
  }
  
  /**
   * Log a message
   */
  protected log(message: string, level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG' = 'INFO'): void {
    console.log(`[${new Date().toISOString()}] [${level}] [${this.config.type}] ${message}`);
  }
}

export default BaseServer;
