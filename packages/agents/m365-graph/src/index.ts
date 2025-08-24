import { M365Agent, type M365AuthConfig } from './base.js';

/**
 * Microsoft Graph API operations interface
 */
export interface GraphOperation {
  type: 'user' | 'calendar' | 'mail' | 'drive' | 'contacts' | 'groups' | 'teams';
  action: 'get' | 'list' | 'create' | 'update' | 'delete';
  endpoint: string;
  data?: unknown;
}

/**
 * Microsoft Graph API result
 */
export interface GraphResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    endpoint: string;
    timestamp: string;
    operation: GraphOperation;
  };
}

/**
 * Microsoft 365 Graph API Agent
 * Provides general Microsoft Graph API operations for MCP integration
 */
export class M365GraphAgent extends M365Agent {
  constructor(authConfig: M365AuthConfig) {
    super(authConfig, 'Microsoft Graph API');
  }

  /**
   * Execute a Graph API operation
   */
  async executeOperation<T = unknown>(operation: GraphOperation): Promise<GraphResult<T>> {
    const timestamp = new Date().toISOString();
    
    try {
      let result: T;

      switch (operation.action) {
        case 'get':
          result = await this.graphClient.api(operation.endpoint).get();
          break;
        case 'list':
          result = await this.graphClient.api(operation.endpoint).get();
          break;
        case 'create':
          result = await this.graphClient.api(operation.endpoint).post(operation.data);
          break;
        case 'update':
          result = await this.graphClient.api(operation.endpoint).patch(operation.data);
          break;
        case 'delete':
          result = await this.graphClient.api(operation.endpoint).delete();
          break;
        default:
          throw new Error(`Unsupported operation action: ${operation.action}`);
      }

      return {
        success: true,
        data: result,
        metadata: {
          endpoint: operation.endpoint,
          timestamp,
          operation,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          endpoint: operation.endpoint,
          timestamp,
          operation,
        },
      };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<GraphResult> {
    return this.executeOperation({
      type: 'user',
      action: 'get',
      endpoint: '/me',
    });
  }

  /**
   * Get user's calendar events
   */
  async getCalendarEvents(startTime?: string, endTime?: string): Promise<GraphResult> {
    let endpoint = '/me/events';
    
    if (startTime && endTime) {
      endpoint += `?$filter=start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`;
    }

    return this.executeOperation({
      type: 'calendar',
      action: 'list',
      endpoint,
    });
  }

  /**
   * Get user's mail messages
   */
  async getMessages(top = 25, skip = 0): Promise<GraphResult> {
    return this.executeOperation({
      type: 'mail',
      action: 'list',
      endpoint: `/me/messages?$top=${top}&$skip=${skip}&$orderby=receivedDateTime desc`,
    });
  }

  /**
   * Get user's OneDrive files
   */
  async getDriveFiles(path = ''): Promise<GraphResult> {
    const endpoint = path ? `/me/drive/root:/${path}:/children` : '/me/drive/root/children';
    
    return this.executeOperation({
      type: 'drive',
      action: 'list',
      endpoint,
    });
  }

  /**
   * Get user's contacts
   */
  async getContacts(): Promise<GraphResult> {
    return this.executeOperation({
      type: 'contacts',
      action: 'list',
      endpoint: '/me/contacts',
    });
  }

  /**
   * Get user's groups/teams
   */
  async getGroups(): Promise<GraphResult> {
    return this.executeOperation({
      type: 'groups',
      action: 'list',
      endpoint: '/me/memberOf',
    });
  }

  /**
   * Search across Microsoft 365
   */
  async search(query: string, entityTypes: string[] = ['message', 'event', 'driveItem']): Promise<GraphResult> {
    const searchData = {
      requests: [
        {
          entityTypes,
          query: {
            queryString: query,
          },
          from: 0,
          size: 25,
        },
      ],
    };

    return this.executeOperation({
      type: 'user',
      action: 'create',
      endpoint: '/search/query',
      data: searchData,
    });
  }
}

export * from './base.js';
export default M365GraphAgent;