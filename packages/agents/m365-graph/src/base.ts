import { PublicClientApplication, type AuthenticationResult, type Configuration } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { type AuthenticationProvider } from '@microsoft/microsoft-graph-client';

/**
 * Configuration for Microsoft 365 authentication
 */
export interface M365AuthConfig {
  clientId: string;
  tenantId: string;
  redirectUri?: string;
  scopes?: string[];
}

/**
 * Microsoft 365 authentication and Graph client provider
 */
export class M365AuthProvider implements AuthenticationProvider {
  private pca: PublicClientApplication;
  private config: M365AuthConfig;
  private authResult: AuthenticationResult | null = null;

  constructor(config: M365AuthConfig) {
    this.config = config;
    
    const msalConfig: Configuration = {
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
      },
    };

    this.pca = new PublicClientApplication(msalConfig);
  }

  /**
   * Get access token for Microsoft Graph API
   */
  async getAccessToken(): Promise<string> {
    try {
      if (this.authResult?.account) {
        // Try to acquire token silently
        const silentRequest = {
          account: this.authResult.account,
          scopes: this.config.scopes || ['https://graph.microsoft.com/.default'],
        };

        try {
          const response = await this.pca.acquireTokenSilent(silentRequest);
          return response.accessToken;
        } catch (error) {
          // Silent acquisition failed, fall through to interactive
          console.info('Silent token acquisition failed, attempting interactive flow');
        }
      }

      // Interactive token acquisition (simplified for server environment)
      // In a real implementation, this would need proper OAuth flow handling
      throw new Error('Interactive authentication not implemented for server environment. Please use service principal authentication.');
    } catch (error) {
      throw new Error(`Failed to acquire access token: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create authenticated Microsoft Graph client
   */
  createGraphClient(): Client {
    return Client.initWithMiddleware({
      authProvider: this,
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authResult !== null && this.authResult.account !== null;
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    if (this.authResult?.account) {
      await this.pca.getTokenCache().removeAccount(this.authResult.account);
      this.authResult = null;
    }
  }
}

/**
 * Base class for Microsoft 365 agents
 */
export abstract class M365Agent {
  protected authProvider: M365AuthProvider;
  protected graphClient: Client;
  protected agentName: string;

  constructor(authConfig: M365AuthConfig, agentName: string) {
    this.authProvider = new M365AuthProvider(authConfig);
    this.graphClient = this.authProvider.createGraphClient();
    this.agentName = agentName;
  }

  /**
   * Initialize the agent (authenticate and validate permissions)
   */
  async initialize(): Promise<void> {
    try {
      await this.authProvider.getAccessToken();
      console.info(`${this.agentName} agent initialized successfully`);
    } catch (error) {
      throw new Error(`Failed to initialize ${this.agentName} agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check agent health and connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test Graph API connectivity by getting user profile
      await this.graphClient.api('/me').get();
      return true;
    } catch (error) {
      console.error(`${this.agentName} health check failed:`, error);
      return false;
    }
  }

  /**
   * Get agent status information
   */
  getStatus(): { name: string; authenticated: boolean } {
    return {
      name: this.agentName,
      authenticated: this.authProvider.isAuthenticated(),
    };
  }
}