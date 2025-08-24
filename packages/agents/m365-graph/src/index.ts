/**
 * Microsoft 365 Graph API Agent - VS Code Integrated
 * Simplified authentication using unified auth provider
 */

import fetch from 'node-fetch';
import { logger } from '@mcp/shared';
import { UnifiedAuthProvider, createMicrosoft365Auth } from '@mcp/auth';
import type { AccountType, AuthResult } from '@mcp/auth';

/**
 * Simple M365 Configuration for VS Code Integration
 */
export interface M365Config {
  accountType?: AccountType;
  domain?: string; // For business accounts (.onmicrosoft.com domain)
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
 * Microsoft 365 Graph API Agent - VS Code Integrated
 * Provides simple authentication similar to GitHub Copilot
 */
export class M365GraphAgent {
  private authProvider: UnifiedAuthProvider;
  private readonly baseUrl = 'https://graph.microsoft.com/v1.0';

  constructor(config: M365Config = {}) {
    this.authProvider = createMicrosoft365Auth(
      config.accountType || 'personal',
      config.domain
    );
    
    logger.info('M365GraphAgent initialized with VS Code-integrated authentication');
  }

  /**
   * Initialize the agent with user-friendly authentication
   * Similar to how GitHub Copilot works in VS Code
   */
  public async initialize(): Promise<void> {
    try {
      if (!this.authProvider.isAuthenticated()) {
        logger.info('🔐 Microsoft 365 authentication required...');
        logger.info('📱 This will open a device authentication flow (like GitHub Copilot)');
        
        await this.authProvider.authenticate();
        
        const authInfo = this.authProvider.getCurrentAuth();
        logger.info(`✅ Successfully authenticated as ${authInfo?.displayName} (${authInfo?.email})`);
      } else {
        const authInfo = this.authProvider.getCurrentAuth();
        logger.info(`✅ Already authenticated as ${authInfo?.displayName}`);
      }
    } catch (error) {
      logger.error(`❌ M365GraphAgent authentication failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Make a request to Microsoft Graph API with automatic token management
   */
  public async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    body?: unknown
  ): Promise<GraphApiResponse<T>> {
    try {
      const accessToken = await this.authProvider.getAccessToken();
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

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
    return this.authProvider.isAuthenticated();
  }

  /**
   * Get current authentication info
   */
  public getAuthInfo(): AuthResult | undefined {
    return this.authProvider.getCurrentAuth();
  }

  /**
   * Sign out (useful for switching accounts)
   */
  public async signOut(): Promise<void> {
    await this.authProvider.signOut();
    logger.info('🔓 Signed out from Microsoft 365');
  }

  /**
   * Quick setup helper for personal accounts
   */
  public static async createPersonalAccount(): Promise<M365GraphAgent> {
    const agent = new M365GraphAgent({ accountType: 'personal' });
    await agent.initialize();
    return agent;
  }

  /**
   * Quick setup helper for business accounts
   */
  public static async createBusinessAccount(domain?: string): Promise<M365GraphAgent> {
    const agent = new M365GraphAgent({ 
      accountType: 'business',
      domain 
    });
    await agent.initialize();
    return agent;
  }
}

export default M365GraphAgent;