/**
 * Microsoft 365 Graph API Agent
 * Core authentication and Graph API operations
 */

import fetch from 'node-fetch';
import { logger } from '@mcp/shared';

/**
 * M365 Authentication Configuration
 */
export interface M365AuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  scopes?: string[];
}

/**
 * Graph API Response interface
 */
export interface GraphApiResponse<T = unknown> {
  '@odata.context'?: string;
  '@odata.nextLink'?: string;
  value?: T[];
  error?: {
    code: string;
    message: string;
    innerError?: unknown;
  };
}

/**
 * Microsoft 365 Graph API Agent
 * Provides core authentication and API access for all M365 services
 */
export class M365GraphAgent {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private readonly baseUrl = 'https://graph.microsoft.com/v1.0';
  private readonly authUrl = 'https://login.microsoftonline.com';

  constructor(private config: M365AuthConfig) {
    logger.info('M365GraphAgent initialized');
  }

  /**
   * Initialize the agent and authenticate
   */
  public async initialize(): Promise<void> {
    try {
      await this.authenticate();
      logger.info('M365GraphAgent authenticated successfully');
    } catch (error) {
      logger.error(`M365GraphAgent initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Authenticate with Microsoft Graph API using client credentials flow
   */
  private async authenticate(): Promise<void> {
    const tokenUrl = `${this.authUrl}/${this.config.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: this.config.scopes?.join(' ') || 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials'
    });

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json() as {
        access_token: string;
        expires_in: number;
        token_type: string;
      };

      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
      
      logger.info('M365 authentication successful');
    } catch (error) {
      logger.error(`M365 authentication error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Check if token needs renewal and refresh if necessary
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || this.tokenExpiry < new Date()) {
      await this.authenticate();
    }
  }

  /**
   * Make a request to Microsoft Graph API
   */
  public async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    body?: unknown
  ): Promise<GraphApiResponse<T>> {
    await this.ensureValidToken();

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json() as GraphApiResponse<T>;

      if (!response.ok) {
        throw new Error(`Graph API error: ${data.error?.message || response.statusText}`);
      }

      return data;
    } catch (error) {
      logger.error(`Graph API request failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get current user information
   */
  public async getCurrentUser(): Promise<GraphApiResponse<unknown>> {
    return this.makeRequest('/me');
  }

  /**
   * Search across Microsoft 365
   */
  public async search(query: string, entityTypes: string[] = ['message', 'event', 'driveItem']): Promise<GraphApiResponse<unknown>> {
    return this.makeRequest('/search/query', 'POST', {
      requests: [{
        entityTypes,
        query: {
          queryString: query
        }
      }]
    });
  }

  /**
   * Get authentication status
   */
  public isAuthenticated(): boolean {
    return this.accessToken !== null && this.tokenExpiry !== null && this.tokenExpiry > new Date();
  }
}

export default M365GraphAgent;