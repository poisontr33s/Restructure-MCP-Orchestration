/**
 * Unified Authentication Provider for VS Code IDE Integration
 * Simplified authentication for both Microsoft 365 and Google Workspace
 */

import type { PublicClientApplication, DeviceCodeRequest, AuthenticationResult } from '@azure/msal-node';
import { PublicClientApplication as MSALApp } from '@azure/msal-node';
import { google } from 'googleapis';
import { logger } from '@mcp/shared';

/**
 * Authentication Provider Types
 */
export type AuthProvider = 'microsoft' | 'google';

/**
 * Account Types
 */
export type AccountType = 'personal' | 'business';

/**
 * Authentication Configuration
 */
export interface AuthConfig {
  provider: AuthProvider;
  accountType: AccountType;
  clientId?: string;
  domain?: string; // For business accounts (.onmicrosoft.com or custom domain)
}

/**
 * Authentication Result
 */
export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  userId: string;
  displayName: string;
  email: string;
  provider: AuthProvider;
  accountType: AccountType;
}

/**
 * VS Code-integrated Authentication Manager
 * Provides simple authentication flow similar to GitHub Copilot
 */
export class UnifiedAuthProvider {
  private microsoftApp?: PublicClientApplication;
  private googleOAuth2Client?: unknown; // TODO: Replace with proper Google Auth types
  private currentAuth?: AuthResult;

  constructor(private config: AuthConfig) {
    this.initializeProvider();
  }

  /**
   * Initialize the authentication provider based on configuration
   */
  private initializeProvider(): void {
    if (this.config.provider === 'microsoft') {
      this.initializeMicrosoft();
    } else if (this.config.provider === 'google') {
      this.initializeGoogle();
    }
  }

  /**
   * Initialize Microsoft authentication
   */
  private initializeMicrosoft(): void {
    const clientId = this.config.clientId || this.getDefaultMicrosoftClientId();
    
    this.microsoftApp = new MSALApp({
      auth: {
        clientId,
        authority: this.getMicrosoftAuthority()
      }
    });

    logger.info('Microsoft authentication provider initialized');
  }

  /**
   * Initialize Google authentication
   */
  private initializeGoogle(): void {
    const clientId = this.config.clientId || this.getDefaultGoogleClientId();
    
    this.googleOAuth2Client = new google.auth.OAuth2(
      clientId,
      undefined, // No client secret for device flow
      'urn:ietf:wg:oauth:2.0:oob' // Device flow redirect
    );

    logger.info('Google authentication provider initialized');
  }

  /**
   * Get Microsoft authority URL based on account type
   */
  private getMicrosoftAuthority(): string {
    if (this.config.accountType === 'business' && this.config.domain) {
      return `https://login.microsoftonline.com/${this.config.domain}`;
    }
    return this.config.accountType === 'business' 
      ? 'https://login.microsoftonline.com/organizations'
      : 'https://login.microsoftonline.com/consumers';
  }

  /**
   * Get default Microsoft client ID (VS Code-like application)
   */
  private getDefaultMicrosoftClientId(): string {
    // This would be a registered public client application similar to VS Code
    return process.env.VSCODE_MICROSOFT_CLIENT_ID || '04b07795-8ddb-461a-bbee-02f9e1bf7b46'; // VS Code Azure AD app
  }

  /**
   * Get default Google client ID
   */
  private getDefaultGoogleClientId(): string {
    return process.env.VSCODE_GOOGLE_CLIENT_ID || 'your-google-client-id';
  }

  /**
   * Authenticate user with device code flow (similar to GitHub Copilot)
   */
  public async authenticate(): Promise<AuthResult> {
    try {
      if (this.config.provider === 'microsoft') {
        return await this.authenticateMicrosoft();
      } else if (this.config.provider === 'google') {
        return await this.authenticateGoogle();
      }
      throw new Error(`Unsupported authentication provider: ${this.config.provider}`);
    } catch (error) {
      logger.error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Microsoft device code authentication
   */
  private async authenticateMicrosoft(): Promise<AuthResult> {
    if (!this.microsoftApp) {
      throw new Error('Microsoft authentication not initialized');
    }

    const scopes = this.getMicrosoftScopes();
    
    const deviceCodeRequest: DeviceCodeRequest = {
      scopes,
      deviceCodeCallback: (response) => {
        // Display device code to user (in VS Code, this would be a notification)
        logger.info(`Please visit ${response.verificationUri} and enter code: ${response.userCode}`);
        logger.info(`🔐 Authentication Required`);
        logger.info(`👉 Visit: ${response.verificationUri}`);
        logger.info(`🔑 Enter code: ${response.userCode}`);
        logger.info(`⏱️  Code expires in ${Math.round(response.expiresIn / 60)} minutes`);
      }
    };

    const response = await this.microsoftApp.acquireTokenByDeviceCode(deviceCodeRequest);
    
    if (!response) {
      throw new Error('Authentication failed - no response received');
    }

    return this.createAuthResult(response, 'microsoft');
  }

  /**
   * Google device code authentication
   */
  private async authenticateGoogle(): Promise<AuthResult> {
    if (!this.googleOAuth2Client) {
      throw new Error('Google authentication not initialized');
    }

    const scopes = this.getGoogleScopes();
    
    // Generate device code
    // Placeholder implementation - in real implementation this would use Google's OAuth2 client
    const deviceCodeResponse = 'https://accounts.google.com/oauth/device';

    // In a real implementation, this would use Google's device flow
    // For now, we'll simulate the process
    logger.info(`Please visit: ${deviceCodeResponse}`);
    logger.info(`🔐 Google Authentication Required`);
    logger.info(`👉 Visit: ${deviceCodeResponse}`);
    logger.info(`⏱️  Complete authentication in your browser`);

    // This would be replaced with actual device flow implementation
    throw new Error('Google device flow implementation pending');
  }

  /**
   * Get Microsoft scopes based on account type
   */
  private getMicrosoftScopes(): string[] {
    const baseScopes = [
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Calendars.Read',
      'https://graph.microsoft.com/Files.Read'
    ];

    if (this.config.accountType === 'business') {
      return [
        ...baseScopes,
        'https://graph.microsoft.com/Team.ReadBasic.All',
        'https://graph.microsoft.com/Channel.ReadBasic.All',
        'https://graph.microsoft.com/Sites.Read.All'
      ];
    }

    return baseScopes;
  }

  /**
   * Get Google scopes based on account type
   */
  private getGoogleScopes(): string[] {
    const baseScopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ];

    if (this.config.accountType === 'business') {
      return [
        ...baseScopes,
        'https://www.googleapis.com/auth/admin.directory.user.readonly',
        'https://www.googleapis.com/auth/admin.directory.group.readonly'
      ];
    }

    return baseScopes;
  }

  /**
   * Create unified auth result from provider-specific response
   */
  private createAuthResult(response: AuthenticationResult, provider: AuthProvider): AuthResult {
    const account = response.account;
    if (!account) {
      throw new Error('No account information in authentication response');
    }

    return {
      accessToken: response.accessToken,
      refreshToken: undefined, // MSAL handles refresh tokens internally
      expiresAt: response.expiresOn || new Date(Date.now() + 3600000), // 1 hour default
      userId: account.localAccountId || account.homeAccountId,
      displayName: account.name || 'Unknown User',
      email: account.username,
      provider,
      accountType: this.config.accountType
    };
  }

  /**
   * Refresh access token
   */
  public async refreshToken(): Promise<AuthResult> {
    if (!this.currentAuth?.refreshToken) {
      return this.authenticate();
    }

    try {
      if (this.config.provider === 'microsoft') {
        return await this.refreshMicrosoftToken();
      } else if (this.config.provider === 'google') {
        return await this.refreshGoogleToken();
      }
      throw new Error(`Unsupported provider for token refresh: ${this.config.provider}`);
    } catch (error) {
      logger.error(`Token refresh failed: ${error instanceof Error ? error.message : String(error)}`);
      // Fall back to re-authentication
      return this.authenticate();
    }
  }

  /**
   * Refresh Microsoft token
   */
  private async refreshMicrosoftToken(): Promise<AuthResult> {
    if (!this.microsoftApp || !this.currentAuth) {
      throw new Error('Cannot refresh token - not authenticated');
    }

    // MSAL handles token refresh automatically
    // This is a simplified implementation
    const accounts = await this.microsoftApp.getTokenCache().getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No cached accounts found');
    }

    const silentRequest = {
      account: accounts[0],
      scopes: this.getMicrosoftScopes()
    };

    const response = await this.microsoftApp.acquireTokenSilent(silentRequest);
    
    if (!response) {
      throw new Error('Silent token acquisition failed');
    }

    this.currentAuth = this.createAuthResult(response, 'microsoft');
    return this.currentAuth;
  }

  /**
   * Refresh Google token
   */
  private async refreshGoogleToken(): Promise<AuthResult> {
    // Google token refresh implementation would go here
    throw new Error('Google token refresh not yet implemented');
  }

  /**
   * Check if currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentAuth !== undefined && 
           this.currentAuth.expiresAt > new Date();
  }

  /**
   * Get current authentication info
   */
  public getCurrentAuth(): AuthResult | undefined {
    return this.currentAuth;
  }

  /**
   * Sign out
   */
  public async signOut(): Promise<void> {
    this.currentAuth = undefined;
    
    if (this.config.provider === 'microsoft' && this.microsoftApp) {
      const accounts = await this.microsoftApp.getTokenCache().getAllAccounts();
      for (const account of accounts) {
        await this.microsoftApp.getTokenCache().removeAccount(account);
      }
    }
    
    logger.info('User signed out successfully');
  }

  /**
   * Get access token (refresh if needed)
   */
  public async getAccessToken(): Promise<string> {
    if (!this.isAuthenticated()) {
      const authResult = await this.authenticate();
      this.currentAuth = authResult;
      return authResult.accessToken;
    }

    // Check if token is close to expiry (refresh 5 minutes before)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (this.currentAuth!.expiresAt < fiveMinutesFromNow) {
      const refreshedAuth = await this.refreshToken();
      this.currentAuth = refreshedAuth;
      return refreshedAuth.accessToken;
    }

    return this.currentAuth!.accessToken;
  }
}

/**
 * Create authentication provider for Microsoft 365
 */
export function createMicrosoft365Auth(accountType: AccountType = 'personal', domain?: string): UnifiedAuthProvider {
  return new UnifiedAuthProvider({
    provider: 'microsoft',
    accountType,
    domain
  });
}

/**
 * Create authentication provider for Google Workspace
 */
export function createGoogleWorkspaceAuth(accountType: AccountType = 'personal', domain?: string): UnifiedAuthProvider {
  return new UnifiedAuthProvider({
    provider: 'google',
    accountType,
    domain
  });
}

export * from './types';