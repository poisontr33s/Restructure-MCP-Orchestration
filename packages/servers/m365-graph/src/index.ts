import { type IncomingMessage, type ServerResponse } from 'http';
import { URL } from 'url';
import BaseServer from '@mcp/server-base';
import { type ServerConfig } from '@mcp/shared';
import { M365GraphAgent, type M365AuthConfig } from '@mcp/agent-m365-graph';

/**
 * Microsoft 365 Graph API MCP Server Implementation
 * Provides Microsoft Graph API functionality through MCP protocol
 */
export class M365GraphServer extends BaseServer {
  private agent: M365GraphAgent | null = null;
  private authConfig: M365AuthConfig;

  /**
   * Constructor
   * @param config Server configuration
   */
  constructor(config: ServerConfig) {
    super(config);
    
    // Get M365 auth configuration from environment variables
    this.authConfig = {
      clientId: process.env.M365_CLIENT_ID || '',
      tenantId: process.env.M365_TENANT_ID || '',
      redirectUri: process.env.M365_REDIRECT_URI,
      scopes: process.env.M365_SCOPES ? process.env.M365_SCOPES.split(',') : undefined,
    };

    this.log('Microsoft 365 Graph API MCP Server created');
  }

  /**
   * Initialize the M365 agent
   */
  async initialize(): Promise<void> {
    try {
      if (!this.authConfig.clientId || !this.authConfig.tenantId) {
        throw new Error('M365_CLIENT_ID and M365_TENANT_ID environment variables are required');
      }

      this.agent = new M365GraphAgent(this.authConfig);
      await this.agent.initialize();
      
      this.log('Microsoft 365 Graph API agent initialized successfully');
    } catch (error) {
      this.log(`Failed to initialize M365 agent: ${error instanceof Error ? error.message : String(error)}`, 'ERROR');
      throw error;
    }
  }

  /**
   * Handle incoming HTTP requests
   * @param req HTTP request
   * @param res HTTP response
   */
  protected handleRequest(req: IncomingMessage, res: ServerResponse): void {
    try {
      // Set CORS headers for browser compatibility
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const path = url.pathname;

      switch (path) {
        case '/status':
          this.handleStatusRequest(res);
          break;
        case '/graph':
          this.handleGraphRequest(req, res);
          break;
        case '/user':
          this.handleUserRequest(req, res);
          break;
        case '/calendar':
          this.handleCalendarRequest(req, res);
          break;
        case '/mail':
          this.handleMailRequest(req, res);
          break;
        case '/drive':
          this.handleDriveRequest(req, res);
          break;
        case '/search':
          this.handleSearchRequest(req, res);
          break;
        default:
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
      }
    } catch (error) {
      this.log(`Request handling error: ${error instanceof Error ? error.message : String(error)}`, 'ERROR');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  /**
   * Handle status requests
   * @param res HTTP response
   */
  private handleStatusRequest(res: ServerResponse): void {
    const status = {
      service: 'Microsoft 365 Graph API MCP Server',
      status: 'running',
      agent: this.agent?.getStatus() || { name: 'Not initialized', authenticated: false },
      timestamp: new Date().toISOString(),
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
  }

  /**
   * Handle general Graph API requests
   */
  private handleGraphRequest(req: IncomingMessage, res: ServerResponse): void {
    if (!this.agent) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'M365 agent not initialized' }));
      return;
    }

    if (req.method === 'GET') {
      // Return available Graph operations
      const operations = {
        user: '/user - Get current user profile',
        calendar: '/calendar - Get calendar events',
        mail: '/mail - Get mail messages',
        drive: '/drive - Get OneDrive files',
        search: '/search?q=<query> - Search across M365',
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ operations }));
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
  }

  /**
   * Handle user profile requests
   */
  private async handleUserRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!this.agent) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'M365 agent not initialized' }));
      return;
    }

    try {
      const result = await this.agent.getCurrentUser();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: `Failed to get user profile: ${error instanceof Error ? error.message : String(error)}` 
      }));
    }
  }

  /**
   * Handle calendar requests
   */
  private async handleCalendarRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!this.agent) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'M365 agent not initialized' }));
      return;
    }

    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const startTime = url.searchParams.get('start');
      const endTime = url.searchParams.get('end');

      const result = await this.agent.getCalendarEvents(startTime || undefined, endTime || undefined);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: `Failed to get calendar events: ${error instanceof Error ? error.message : String(error)}` 
      }));
    }
  }

  /**
   * Handle mail requests
   */
  private async handleMailRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!this.agent) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'M365 agent not initialized' }));
      return;
    }

    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const top = parseInt(url.searchParams.get('top') || '25');
      const skip = parseInt(url.searchParams.get('skip') || '0');

      const result = await this.agent.getMessages(top, skip);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: `Failed to get messages: ${error instanceof Error ? error.message : String(error)}` 
      }));
    }
  }

  /**
   * Handle OneDrive requests
   */
  private async handleDriveRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!this.agent) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'M365 agent not initialized' }));
      return;
    }

    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const path = url.searchParams.get('path') || '';

      const result = await this.agent.getDriveFiles(path);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: `Failed to get drive files: ${error instanceof Error ? error.message : String(error)}` 
      }));
    }
  }

  /**
   * Handle search requests
   */
  private async handleSearchRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!this.agent) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'M365 agent not initialized' }));
      return;
    }

    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const query = url.searchParams.get('q');
      
      if (!query) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Query parameter "q" is required' }));
        return;
      }

      const entityTypes = url.searchParams.get('types')?.split(',') || undefined;
      const result = await this.agent.search(query, entityTypes);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: `Failed to search: ${error instanceof Error ? error.message : String(error)}` 
      }));
    }
  }
}

export default M365GraphServer;