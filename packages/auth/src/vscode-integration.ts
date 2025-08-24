/**
 * VS Code Extension Integration for Unified Authentication
 * Provides GitHub Copilot-like authentication experience
 */

import { logger } from '@mcp/shared';
import type { AccountCapabilities } from './content-discovery';
import { ContentDiscoveryEngine } from './content-discovery';
import type { AuthResult } from './index';
import { UnifiedAuthProvider } from './index';

export interface VSCodeIntegration {
  /**
   * Initialize authentication in VS Code context
   */
  initialize(): Promise<void>;
  
  /**
   * Show authentication notification similar to GitHub Copilot
   */
  showAuthNotification(): Promise<void>;
  
  /**
   * Handle authentication flow with VS Code UI
   */
  authenticateWithUI(provider: 'microsoft' | 'google' | 'x'): Promise<AuthResult>;
  
  /**
   * Get available content based on current authentication
   */
  getAvailableContent(): Promise<AccountCapabilities[]>;
  
  /**
   * Switch between accounts
   */
  switchAccount(provider: string, accountId: string): Promise<void>;
}

/**
 * VS Code-integrated authentication manager
 */
export class VSCodeAuthManager implements VSCodeIntegration {
  private authProvider: UnifiedAuthProvider;
  private contentDiscovery: ContentDiscoveryEngine;
  private authenticatedAccounts: Map<string, AuthResult> = new Map();
  private currentAccount?: string;

  constructor() {
    this.authProvider = new UnifiedAuthProvider({ provider: 'microsoft', accountType: 'personal' });
    this.contentDiscovery = new ContentDiscoveryEngine();
  }

  /**
   * Initialize the VS Code authentication system
   */
  async initialize(): Promise<void> {
    logger.info('🔧 Initializing VS Code Authentication Manager');
    
    // Check for existing sessions
    await this.loadExistingSessions();
    
    // Set up authentication event listeners
    this.setupEventListeners();
    
    logger.info('✅ VS Code Authentication Manager initialized');
  }

  /**
   * Show authentication notification similar to GitHub Copilot
   */
  async showAuthNotification(): Promise<void> {
    // In a real VS Code extension, this would use vscode.window.showInformationMessage
    logger.info('🔐 Authentication required for MCP Orchestration');
    logger.info('Click "Sign in" to authenticate with your Microsoft 365, Google Workspace, or X account');
    
    // Simulate VS Code notification
    const message = {
      message: 'MCP Orchestration: Sign in to access your accounts',
      options: [
        { title: 'Sign in with Microsoft 365', action: 'microsoft' },
        { title: 'Sign in with Google Workspace', action: 'google' },
        { title: 'Sign in with X', action: 'x' },
        { title: 'Not now', action: 'dismiss' }
      ]
    };
    
    logger.info(`Notification: ${JSON.stringify(message, null, 2)}`);
  }

  /**
   * Authenticate with VS Code UI integration
   */
  async authenticateWithUI(provider: 'microsoft' | 'google' | 'x'): Promise<AuthResult> {
    logger.info(`🔑 Starting ${provider} authentication...`);
    
    try {
      // Configure provider
      this.authProvider = new UnifiedAuthProvider({ 
        provider, 
        accountType: provider === 'x' ? 'personal' : 'business' 
      });
      
      // Perform authentication
      const authResult = await this.authProvider.authenticate();
      
      // Discover account capabilities
      const capabilities = await this.contentDiscovery.discoverCapabilities(
        provider,
        authResult.accessToken,
        authResult.account
      );
      
      // Store authenticated account
      const accountKey = `${provider}:${authResult.account.username || authResult.account.email}`;
      this.authenticatedAccounts.set(accountKey, authResult);
      this.currentAccount = accountKey;
      
      // Show success notification
      await this.showSuccessNotification(provider, capabilities);
      
      logger.info(`✅ Successfully authenticated ${provider} account`);
      return authResult;
      
    } catch (error) {
      logger.error(`❌ Authentication failed for ${provider}: ${error}`);
      await this.showErrorNotification(provider, error as Error);
      throw error;
    }
  }

  /**
   * Get available content across all authenticated accounts
   */
  async getAvailableContent(): Promise<AccountCapabilities[]> {
    const capabilities: AccountCapabilities[] = [];
    
    for (const [accountKey, authResult] of this.authenticatedAccounts) {
      const [provider, accountId] = accountKey.split(':');
      const accountCapabilities = this.contentDiscovery.getCapabilities(provider, accountId);
      
      if (accountCapabilities) {
        capabilities.push(accountCapabilities);
      }
    }
    
    return capabilities;
  }

  /**
   * Switch between authenticated accounts
   */
  async switchAccount(provider: string, accountId: string): Promise<void> {
    const accountKey = `${provider}:${accountId}`;
    
    if (!this.authenticatedAccounts.has(accountKey)) {
      throw new Error(`Account ${accountKey} is not authenticated`);
    }
    
    this.currentAccount = accountKey;
    logger.info(`🔄 Switched to account: ${accountKey}`);
    
    // Update VS Code status bar
    await this.updateStatusBar();
  }

  /**
   * Get current account information
   */
  getCurrentAccount(): AuthResult | undefined {
    if (!this.currentAccount) return undefined;
    return this.authenticatedAccounts.get(this.currentAccount);
  }

  /**
   * Get current account capabilities
   */
  getCurrentCapabilities(): AccountCapabilities | undefined {
    if (!this.currentAccount) return undefined;
    
    const [provider, accountId] = this.currentAccount.split(':');
    return this.contentDiscovery.getCapabilities(provider, accountId);
  }

  /**
   * Sign out from specific account
   */
  async signOut(provider: string, accountId: string): Promise<void> {
    const accountKey = `${provider}:${accountId}`;
    
    if (this.authenticatedAccounts.has(accountKey)) {
      this.authenticatedAccounts.delete(accountKey);
      
      if (this.currentAccount === accountKey) {
        // Switch to another account or clear current
        const remainingAccounts = Array.from(this.authenticatedAccounts.keys());
        this.currentAccount = remainingAccounts.length > 0 ? remainingAccounts[0] : undefined;
      }
      
      logger.info(`🚪 Signed out from account: ${accountKey}`);
      await this.updateStatusBar();
    }
  }

  /**
   * Sign out from all accounts
   */
  async signOutAll(): Promise<void> {
    this.authenticatedAccounts.clear();
    this.currentAccount = undefined;
    
    logger.info('🚪 Signed out from all accounts');
    await this.updateStatusBar();
  }

  /**
   * Load existing authentication sessions
   */
  private async loadExistingSessions(): Promise<void> {
    // In a real implementation, this would load from VS Code's secret storage
    logger.info('🔍 Checking for existing authentication sessions...');
    
    // Simulate loading saved sessions
    try {
      // This would be replaced with actual VS Code secret storage API calls
      const savedSessions = await this.loadFromSecretStorage();
      
      for (const session of savedSessions) {
        if (await this.validateSession(session)) {
          const accountKey = `${session.provider}:${session.account.username || session.account.email}`;
          this.authenticatedAccounts.set(accountKey, session);
          
          // Re-discover capabilities for existing session
          await this.contentDiscovery.discoverCapabilities(
            session.provider as any,
            session.accessToken,
            session.account
          );
        }
      }
      
      // Set current account to first valid session
      const accounts = Array.from(this.authenticatedAccounts.keys());
      if (accounts.length > 0) {
        this.currentAccount = accounts[0];
        logger.info(`🔄 Restored session for: ${this.currentAccount}`);
      }
      
    } catch (error) {
      logger.warn(`Failed to load existing sessions: ${error}`);
    }
  }

  /**
   * Load sessions from secret storage (placeholder)
   */
  private async loadFromSecretStorage(): Promise<AuthResult[]> {
    // In a real VS Code extension, this would use:
    // const secrets = vscode.extensions.getExtension('your-extension-id')?.extensionContext.secrets;
    // return await secrets.get('mcp-auth-sessions');
    
    return []; // Placeholder - no saved sessions
  }

  /**
   * Validate an existing session
   */
  private async validateSession(session: AuthResult): Promise<boolean> {
    try {
      // Test if the token is still valid by making a simple API call
      if (session.provider === 'microsoft') {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });
        return response.ok;
      } else if (session.provider === 'google') {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });
        return response.ok;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Set up event listeners for authentication changes
   */
  private setupEventListeners(): void {
    // In a real VS Code extension, this would set up event listeners for:
    // - Extension activation/deactivation
    // - Authentication provider changes
    // - Token refresh events
    
    logger.info('📡 Authentication event listeners configured');
  }

  /**
   * Show success notification after authentication
   */
  private async showSuccessNotification(provider: string, capabilities: AccountCapabilities): Promise<void> {
    const serviceCount = capabilities.availableServices.filter(s => s.available).length;
    const message = `✅ Successfully signed in to ${provider}! Found ${serviceCount} available services.`;
    
    logger.info(message);
    
    // Show available services
    logger.info('📋 Available services:');
    capabilities.availableServices.forEach(service => {
      if (service.available) {
        logger.info(`  • ${service.displayName}: ${service.description}`);
      }
    });
  }

  /**
   * Show error notification
   */
  private async showErrorNotification(provider: string, error: Error): Promise<void> {
    const message = `❌ Failed to sign in to ${provider}: ${error.message}`;
    logger.error(message);
    
    // In VS Code, this would show an error notification with retry options
  }

  /**
   * Update VS Code status bar
   */
  private async updateStatusBar(): Promise<void> {
    if (this.currentAccount) {
      const [provider, accountId] = this.currentAccount.split(':');
      const capabilities = this.contentDiscovery.getCapabilities(provider, accountId);
      const serviceCount = capabilities?.availableServices.filter(s => s.available).length || 0;
      
      // In VS Code, this would update the status bar item
      const statusText = `🔐 MCP: ${provider} (${serviceCount} services)`;
      logger.info(`Status: ${statusText}`);
    } else {
      logger.info('Status: 🔐 MCP: Not signed in');
    }
  }
}

/**
 * VS Code Task Integration
 * Provides tasks for testing authentication flows
 */
export class VSCodeTasks {
  /**
   * Get VS Code tasks for authentication testing
   */
  static getAuthenticationTasks() {
    return {
      "version": "2.0.0",
      "tasks": [
        {
          "label": "MCP: Test Microsoft 365 Authentication",
          "type": "shell",
          "command": "node",
          "args": ["-e", "require('./dist/index.js').testMicrosoftAuth()"],
          "group": "test",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared"
          },
          "problemMatcher": []
        },
        {
          "label": "MCP: Test Google Workspace Authentication",
          "type": "shell",
          "command": "node",
          "args": ["-e", "require('./dist/index.js').testGoogleAuth()"],
          "group": "test",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared"
          },
          "problemMatcher": []
        },
        {
          "label": "MCP: Discover Account Capabilities",
          "type": "shell",
          "command": "node",
          "args": ["-e", "require('./dist/index.js').discoverCapabilities()"],
          "group": "test",
          "presentation": {
            "echo": true,
            "reveal": "always",
            "focus": false,
            "panel": "shared"
          },
          "problemMatcher": []
        }
      ]
    };
  }
}