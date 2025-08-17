/**
 * Microsoft 365 Graph MCP Server
 * Unified MCP server for all Microsoft 365 services integration
 */

import { type IncomingMessage, type ServerResponse } from 'http';
import { URL } from 'url';
import BaseServer from '@mcp/server-base';
import { type ServerConfig } from '@mcp/shared';
import { M365GraphAgent, type M365AuthConfig } from '@mcp/agents-m365-graph';
import { M365TeamsAgent } from '@mcp/agents-m365-teams';
import { M365OutlookAgent } from '@mcp/agents-m365-outlook';
import { M365SharePointAgent } from '@mcp/agents-m365-sharepoint';
import { M365OneDriveAgent } from '@mcp/agents-m365-onedrive';

/**
 * M365 Server Configuration extending base server config
 */
export interface M365ServerConfig extends ServerConfig {
  m365?: M365AuthConfig;
}

/**
 * Microsoft 365 Graph MCP Server
 * Provides unified access to all M365 services through MCP protocol
 */
export class M365GraphServer extends BaseServer {
  private graphAgent: M365GraphAgent | null = null;
  private teamsAgent: M365TeamsAgent | null = null;
  private outlookAgent: M365OutlookAgent | null = null;
  private sharePointAgent: M365SharePointAgent | null = null;
  private oneDriveAgent: M365OneDriveAgent | null = null;

  constructor(config: M365ServerConfig) {
    super(config);
    this.log('Microsoft 365 Graph MCP Server created');
  }

  /**
   * Start the server and initialize M365 agents
   */
  public async start(): Promise<void> {
    await super.start();
    
    const m365Config = (this.config as M365ServerConfig).m365;
    if (m365Config) {
      try {
        // Initialize all M365 agents
        this.graphAgent = new M365GraphAgent(m365Config);
        this.teamsAgent = new M365TeamsAgent(m365Config);
        this.outlookAgent = new M365OutlookAgent(m365Config);
        this.sharePointAgent = new M365SharePointAgent(m365Config);
        this.oneDriveAgent = new M365OneDriveAgent(m365Config);

        // Initialize them all
        await Promise.all([
          this.graphAgent.initialize(),
          this.teamsAgent.initialize(),
          this.outlookAgent.initialize(),
          this.sharePointAgent.initialize(),
          this.oneDriveAgent.initialize()
        ]);

        this.log('All M365 agents initialized successfully');
      } catch (error) {
        this.log(`Failed to initialize M365 agents: ${error instanceof Error ? error.message : String(error)}`, 'ERROR');
      }
    } else {
      this.log('No M365 configuration provided', 'WARN');
    }
  }

  /**
   * Handle incoming HTTP requests
   */
  protected handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;

    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Route requests to appropriate handlers
    if (path.startsWith('/api/teams')) {
      this.handleTeamsRequest(req, res, path);
    } else if (path.startsWith('/api/outlook')) {
      this.handleOutlookRequest(req, res, path);
    } else if (path.startsWith('/api/sharepoint')) {
      this.handleSharePointRequest(req, res, path);
    } else if (path.startsWith('/api/onedrive')) {
      this.handleOneDriveRequest(req, res, path);
    } else if (path.startsWith('/api/graph')) {
      this.handleGraphRequest(req, res, path);
    } else if (path === '/api/status') {
      this.handleStatusRequest(req, res);
    } else if (path === '/api/health') {
      this.handleHealthRequest(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found', path }));
    }
  }

  /**
   * Handle Teams-related requests
   */
  private handleTeamsRequest(req: IncomingMessage, res: ServerResponse, path: string): void {
    if (!this.teamsAgent) {
      this.sendErrorResponse(res, 503, 'Teams agent not initialized');
      return;
    }

    const action = path.replace('/api/teams/', '');
    
    if (req.method === 'GET') {
      switch (action) {
        case 'teams':
          this.handleAsyncRequest(res, () => this.teamsAgent!.getTeams());
          break;
        case 'presence':
          this.handleAsyncRequest(res, () => this.teamsAgent!.getPresence());
          break;
        case 'meetings':
          this.handleAsyncRequest(res, () => this.teamsAgent!.getUpcomingMeetings());
          break;
        default:
          this.sendErrorResponse(res, 404, 'Teams endpoint not found');
      }
    } else if (req.method === 'POST') {
      this.handlePostRequest(req, res, async (data) => {
        switch (action) {
          case 'message':
            return this.teamsAgent!.sendChannelMessage(
              data.teamId as string, 
              data.channelId as string, 
              data.message as string, 
              data.messageType as 'text' | 'html'
            );
          case 'meeting':
            return this.teamsAgent!.createMeeting(
              data.subject as string,
              data.startTime as string,
              data.endTime as string,
              data.attendees as string[]
            );
          default:
            throw new Error('Teams action not found');
        }
      });
    }
  }

  /**
   * Handle Outlook-related requests
   */
  private handleOutlookRequest(req: IncomingMessage, res: ServerResponse, path: string): void {
    if (!this.outlookAgent) {
      this.sendErrorResponse(res, 503, 'Outlook agent not initialized');
      return;
    }

    const action = path.replace('/api/outlook/', '');
    
    if (req.method === 'GET') {
      switch (action) {
        case 'emails':
          this.handleAsyncRequest(res, () => this.outlookAgent!.getEmails());
          break;
        case 'calendar':
          this.handleAsyncRequest(res, () => this.outlookAgent!.getCalendarEvents());
          break;
        case 'contacts':
          this.handleAsyncRequest(res, () => this.outlookAgent!.getContacts());
          break;
        default:
          this.sendErrorResponse(res, 404, 'Outlook endpoint not found');
      }
    } else if (req.method === 'POST') {
      this.handlePostRequest(req, res, async (data) => {
        switch (action) {
          case 'send':
            return this.outlookAgent!.sendEmail(
              data.to as string[],
              data.subject as string,
              data.body as string,
              data.bodyType as 'text' | 'html',
              data.cc as string[],
              data.bcc as string[]
            );
          case 'event':
            return this.outlookAgent!.createCalendarEvent(
              data.subject as string,
              data.startTime as string,
              data.endTime as string,
              data.attendees as string[],
              data.location as string
            );
          default:
            throw new Error('Outlook action not found');
        }
      });
    }
  }

  /**
   * Handle SharePoint-related requests
   */
  private handleSharePointRequest(req: IncomingMessage, res: ServerResponse, path: string): void {
    if (!this.sharePointAgent) {
      this.sendErrorResponse(res, 503, 'SharePoint agent not initialized');
      return;
    }

    const action = path.replace('/api/sharepoint/', '');
    
    if (req.method === 'GET') {
      switch (action) {
        case 'sites':
          this.handleAsyncRequest(res, () => this.sharePointAgent!.getSites());
          break;
        default:
          this.sendErrorResponse(res, 404, 'SharePoint endpoint not found');
      }
    }
  }

  /**
   * Handle OneDrive-related requests
   */
  private handleOneDriveRequest(req: IncomingMessage, res: ServerResponse, path: string): void {
    if (!this.oneDriveAgent) {
      this.sendErrorResponse(res, 503, 'OneDrive agent not initialized');
      return;
    }

    const action = path.replace('/api/onedrive/', '');
    
    if (req.method === 'GET') {
      switch (action) {
        case 'files':
          this.handleAsyncRequest(res, () => this.oneDriveAgent!.getRootItems());
          break;
        case 'recent':
          this.handleAsyncRequest(res, () => this.oneDriveAgent!.getRecentFiles());
          break;
        default:
          this.sendErrorResponse(res, 404, 'OneDrive endpoint not found');
      }
    }
  }

  /**
   * Handle Graph API requests
   */
  private handleGraphRequest(req: IncomingMessage, res: ServerResponse, path: string): void {
    if (!this.graphAgent) {
      this.sendErrorResponse(res, 503, 'Graph agent not initialized');
      return;
    }

    const action = path.replace('/api/graph/', '');
    
    if (req.method === 'GET') {
      switch (action) {
        case 'me':
          this.handleAsyncRequest(res, () => this.graphAgent!.getCurrentUser());
          break;
        default:
          this.sendErrorResponse(res, 404, 'Graph endpoint not found');
      }
    }
  }

  /**
   * Handle status requests
   */
  private handleStatusRequest(req: IncomingMessage, res: ServerResponse): void {
    const status = {
      server: 'M365 Graph MCP Server',
      status: this.getStatus(),
      agents: {
        graph: this.graphAgent?.isAuthenticated() || false,
        teams: this.teamsAgent?.isAuthenticated() || false,
        outlook: this.outlookAgent?.isAuthenticated() || false,
        sharepoint: this.sharePointAgent?.isAuthenticated() || false,
        onedrive: this.oneDriveAgent?.isAuthenticated() || false
      },
      endpoints: [
        '/api/teams/*',
        '/api/outlook/*',
        '/api/sharepoint/*',
        '/api/onedrive/*',
        '/api/graph/*'
      ]
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status, null, 2));
  }

  /**
   * Handle health check requests
   */
  private handleHealthRequest(req: IncomingMessage, res: ServerResponse): void {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000)
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health));
  }

  /**
   * Helper to handle async requests
   */
  private async handleAsyncRequest(res: ServerResponse, operation: () => Promise<unknown>): Promise<void> {
    try {
      const result = await operation();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result, null, 2));
    } catch (error) {
      this.sendErrorResponse(res, 500, error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * Helper to handle POST requests with JSON body
   */
  private handlePostRequest(
    req: IncomingMessage, 
    res: ServerResponse, 
    operation: (data: Record<string, unknown>) => Promise<unknown>
  ): void {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = JSON.parse(body) as Record<string, unknown>;
        const result = await operation(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result, null, 2));
      } catch (error) {
        this.sendErrorResponse(res, 400, error instanceof Error ? error.message : String(error));
      }
    });
  }

  /**
   * Helper to send error responses
   */
  private sendErrorResponse(res: ServerResponse, statusCode: number, message: string): void {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }
}

export default M365GraphServer;