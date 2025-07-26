import { ServerConfig } from '@mcp/shared';
import { createLogger } from './logger';

// Create logger instance
const logger = createLogger('server-manager');

// Server class constructor type
type ServerConstructor = new (config: ServerConfig) => unknown;

/**
 * Server Manager class
 * Responsible for managing server instances and their lifecycle
 */
export class ServerManager {
  private serverRegistry: Map<string, ServerConstructor> = new Map();
  
  /**
   * Register a server with the manager
   * @param serverType - The type of server to register
   * @param serverClass - The server class constructor
   */
  public registerServerType(serverType: string, serverClass: ServerConstructor): void {
    if (this.serverRegistry.has(serverType)) {
      logger.warn(`Server type ${serverType} is already registered`);
      return;
    }
    
    this.serverRegistry.set(serverType, serverClass);
    logger.info(`Registered server type: ${serverType}`);
  }
  
  /**
   * Create a server instance
   * @param config - The server configuration
   */
  public createServer(config: ServerConfig): unknown {
    const serverType = config.type;
    
    if (!this.serverRegistry.has(serverType)) {
      throw new Error(`Server type ${serverType} is not registered`);
    }
    
    const ServerClass = this.serverRegistry.get(serverType);
    if (!ServerClass) {
      throw new Error(`Server class for type ${serverType} is not available`);
    }
    
    return new ServerClass(config);
  }
  
  /**
   * Get available server types
   */
  public getAvailableServerTypes(): string[] {
    return Array.from(this.serverRegistry.keys());
  }
  
  /**
   * Check if a server type is registered
   * @param serverType - The server type to check
   */
  public hasServerType(serverType: string): boolean {
    return this.serverRegistry.has(serverType);
  }
}

export default ServerManager;
