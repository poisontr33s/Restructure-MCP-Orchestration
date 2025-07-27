import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { promises as fs } from 'fs';
import os from 'os';
import { createLogger } from './logger';
import { 
  type ServerConfig, 
  type ServerInfo, 
  type FullStatus, 
  type SystemInfo
} from '@mcp/shared';

// Create logger instance
const logger = createLogger('orchestration-hub');

/**
 * MCP Orchestration Hub class
 * Centralizes server management, monitoring, and logging for all MCP servers
 */
export class OrchestrationHub {
  private servers: Map<string, ServerInfo>;
  private serverConfigs: ServerConfig[];
  private monitorPort: number;
  private monitorServer: http.Server | null = null;
  private checkInterval: number;
  private initialized: boolean = false;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  
  /**
   * Constructor
   * @param configs - Server configurations
   * @param options - Options for the orchestration hub
   */
  constructor(
    configs: ServerConfig[], 
    options: { 
      monitorPort?: number; 
      checkInterval?: number;
    } = {}
  ) {
    this.servers = new Map();
    this.serverConfigs = configs;
    this.monitorPort = options.monitorPort || 8080;
    this.checkInterval = options.checkInterval || 15000; // 15 seconds default
  }

  /**
   * Initialize the orchestration hub
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('Orchestration hub already initialized');
      return;
    }

    logger.info('Initializing MCP Orchestration Hub');
    
    try {
      // Create monitor server
      this.setupMonitorServer();
      
      // Start health check timer
      this.startHealthChecks();
      
      this.initialized = true;
      logger.info('MCP Orchestration Hub initialized successfully');
    } catch (error) {
      logger.error(`Failed to initialize orchestration hub: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Start all configured MCP servers
   */
  public async startAllServers(): Promise<void> {
    logger.info('Starting all MCP servers');
    
    for (const config of this.serverConfigs) {
      if (config.enabled !== false) {
        try {
          await this.startServer(config);
          logger.info(`Started server: ${config.name}`);
        } catch (error) {
          logger.error(`Failed to start server ${config.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        logger.info(`Skipping disabled server: ${config.name}`);
      }
    }
  }

  /**
   * Start a single MCP server
   * @param config - Server configuration
   */
  public async startServer(config: ServerConfig): Promise<void> {
    const serverType = config.type;
    
    // Check if server is already running
    if (this.servers.has(serverType)) {
      const serverInfo = this.servers.get(serverType)!;
      if (serverInfo.status === 'running') {
        logger.warn(`Server ${config.name} is already running`);
        return;
      }
    }
    
    try {
      // Get the path to the server script
      const serverScriptPath = path.resolve(process.cwd(), 'packages', 'servers', serverType, 'dist', 'index.js');
      
      // Check if the server script exists
      await fs.access(serverScriptPath);
      
      // Create environment variables for the server process
      const env = { ...process.env };
      env.PORT = config.port.toString();
      
      // Spawn the server process
      const serverProcess = spawn('node', [serverScriptPath], {
        env,
        stdio: 'pipe'
      });

      // Store server process info
      const serverInfo: ServerInfo = {
        config: { ...config },  // Clone config to prevent mutations
        process: serverProcess,
        status: 'starting',
        port: config.port,
        startTime: new Date(),
        pid: serverProcess.pid || undefined
      };
      
      this.servers.set(serverType, serverInfo);

      // Setup logging for server output
      serverProcess.stdout.on('data', (data) => {
        const message = data.toString().trim();
        logger.info(`[${config.type}] ${message}`);
      });

      serverProcess.stderr.on('data', (data) => {
        const message = data.toString().trim();
        logger.error(`[${config.type}] ${message}`);
      });

      serverProcess.on('close', (code) => {
        if (code !== 0) {
          logger.error(`[${config.type}] Server exited with code ${code}`);
        }
        
        // Update server status on close
        if (this.servers.has(serverType)) {
          const server = this.servers.get(serverType)!;
          server.status = 'stopped';
        }
      });

      // Wait for server to start
      await this.waitForServer(config.port);
      serverInfo.status = 'running';
      logger.info(`Server ${config.name} started successfully on port ${config.port}`);

    } catch (error) {
      logger.error(`Failed to start server ${config.name}: ${error instanceof Error ? error.message : String(error)}`);
      
      // Update server status on error
      if (this.servers.has(serverType)) {
        const server = this.servers.get(serverType)!;
        server.status = 'error';
      }
      
      throw error;
    }
  }

  /**
   * Stop a single MCP server
   * @param serverType - The type of server to stop
   */
  public async stopServer(serverType: string): Promise<void> {
    if (!this.servers.has(serverType)) {
      logger.warn(`Server ${serverType} is not registered`);
      return;
    }

    const serverInfo = this.servers.get(serverType)!;
    const process = serverInfo.process as ChildProcess;

    if (!process) {
      logger.warn(`Server ${serverType} has no process to stop`);
      serverInfo.status = 'stopped';
      return;
    }

    return new Promise<void>((resolve) => {
      // Set a timeout to forcefully kill the process if it doesn't exit
      const killTimeout = setTimeout(() => {
        logger.warn(`Server ${serverType} did not exit gracefully, killing process`);
        if (process.kill('SIGKILL')) {
          logger.info(`Server ${serverType} process killed forcefully`);
        }
        serverInfo.status = 'stopped';
        resolve();
      }, 5000);

      // Try to gracefully stop the process
      process.on('exit', () => {
        clearTimeout(killTimeout);
        serverInfo.status = 'stopped';
        logger.info(`Server ${serverType} stopped gracefully`);
        resolve();
      });

      // Send SIGTERM signal to gracefully stop the process
      if (process.kill('SIGTERM')) {
        logger.info(`SIGTERM signal sent to server ${serverType}`);
      } else {
        clearTimeout(killTimeout);
        logger.warn(`Failed to send SIGTERM to server ${serverType}`);
        serverInfo.status = 'stopped';
        resolve();
      }
    });
  }

  /**
   * Stop all running MCP servers
   */
  public async stopAllServers(): Promise<void> {
    logger.info('Stopping all MCP servers');
    
    const stopPromises: Promise<void>[] = [];
    
    for (const [serverType] of this.servers) {
      stopPromises.push(this.stopServer(serverType));
    }
    
    await Promise.all(stopPromises);
    logger.info('All servers stopped');
  }

  /**
   * Shutdown the orchestration hub and all servers
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down MCP Orchestration Hub');
    
    // Stop health check timer
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    // Stop all servers
    await this.stopAllServers();
    
    // Stop monitor server
    if (this.monitorServer) {
      await new Promise<void>((resolve) => {
        this.monitorServer!.close(() => {
          logger.info('Monitor server stopped');
          this.monitorServer = null;
          resolve();
        });
      });
    }
    
    this.initialized = false;
    logger.info('MCP Orchestration Hub shutdown complete');
  }

  /**
   * Wait for a server to start responding
   * @param port - The port to check
   */
  private async waitForServer(port: number): Promise<void> {
    const maxAttempts = 30;
    const delay = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        await new Promise<void>((resolve, reject) => {
          const req = http.get(`http://localhost:${port}/status`, (res) => {
            if (res.statusCode === 200) {
              resolve();
            } else {
              reject(new Error(`Server responded with status ${res.statusCode}`));
            }
          });
          req.on('error', reject);
          req.end();
        });
        return;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`Server on port ${port} failed to start after ${maxAttempts} attempts`);
  }

  /**
   * Check the health of all servers
   */
  private async checkServerHealth(): Promise<void> {
    logger.debug('Checking server health');
    
    for (const [serverType, serverInfo] of this.servers) {
      // Skip checking servers that are already known to be stopped
      if (serverInfo.status === 'stopped') {
        continue;
      }
      
      try {
        await this.checkServerStatus(serverInfo.port);
        serverInfo.status = 'running';
      } catch (error) {
        // Set server as 'not responding' if it was previously running
        if (serverInfo.status === 'running') {
          logger.warn(`Server ${serverType} is not responding`);
          serverInfo.status = 'not responding';
        }
      }
    }
  }

  /**
   * Check a server's status by making an HTTP request
   * @param port - The port to check
   */
  private async checkServerStatus(port: number): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port,
        path: '/status',
        method: 'GET',
        timeout: 5000,
      };

      const req = http.request(options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Server responded with status ${res.statusCode}`));
          return;
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response from server'));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      req.end();
    });
  }

  /**
   * Start health check timer
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    this.healthCheckTimer = setInterval(() => {
      this.checkServerHealth().catch((error) => {
        logger.error(`Error checking server health: ${error instanceof Error ? error.message : String(error)}`);
      });
    }, this.checkInterval);
    
    logger.info(`Health checks started with interval: ${this.checkInterval}ms`);
  }

  /**
   * Setup monitor server
   */
  private setupMonitorServer(): void {
    this.monitorServer = http.createServer((req, res) => {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      
      if (req.method !== 'GET' && req.method !== 'POST') {
        res.writeHead(405);
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }
      
      const url = req.url || '';
      
      // Handle API routes
      if (url === '/api/status') {
        const status = this.getFullStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
      } else if (url === '/api/servers') {
        const servers = Array.from(this.servers.values()).map(server => ({
          name: server.config.name,
          type: server.config.type,
          port: server.config.port,
          status: server.status,
          pid: server.pid
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(servers));
      } else if (url === '/api/start' && req.method === 'POST') {
        // This would be a more complex implementation with body parsing
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      } else {
        // Serve static files or index for other routes
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });
    
    this.monitorServer.listen(this.monitorPort, () => {
      logger.info(`Monitor server started on port ${this.monitorPort}`);
    });
  }
  
  /**
   * Get the full status of the orchestration hub and all servers
   */
  public getFullStatus(): FullStatus {
    // Get system info
    const systemInfo: SystemInfo = {
      hostname: os.hostname(),
      platform: os.platform(),
      uptime: os.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      cpus: os.cpus().length,
    };
    
    // Get server statuses
    const servers = Array.from(this.servers.values()).map(server => ({
      name: server.config.name,
      type: server.config.type,
      port: server.port,
      status: server.status,
      uptime: server.startTime 
        ? Math.floor((new Date().getTime() - server.startTime.getTime()) / 1000) 
        : undefined,
      pid: server.pid
    }));
    
    return {
      timestamp: new Date().toISOString(),
      servers,
      system: systemInfo,
    };
  }
}

export default OrchestrationHub;
