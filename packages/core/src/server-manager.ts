import { ServerConfig } from '@mcp/shared';
import { createLogger } from './logger';

// Create logger instance
const logger = createLogger('server-manager');

/**
 * Server Manager class
 * Responsible for managing server instances and their lifecycle
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ServerManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serverRegistry: Map<string, any> = new Map();

  /**
   * Register a server with the manager
   * @param serverType - The type of server to register
   * @param serverClass - The server class constructor
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerServerType(serverType: string, serverClass: any): void {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createServer(config: ServerConfig): any {
    const serverType = config.type;

    if (!this.serverRegistry.has(serverType)) {
      throw new Error(`Server type ${serverType} is not registered`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ServerClass = this.serverRegistry.get(serverType) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
