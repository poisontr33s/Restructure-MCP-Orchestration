/**
 * Google Workspace Integration Agent - VS Code Integrated
 * Simplified authentication for Google Workspace services
 */

import { google } from 'googleapis';
import { logger } from '@mcp/shared';
import { UnifiedAuthProvider, createGoogleWorkspaceAuth } from '@mcp/auth';
import type { AccountType, AuthResult } from '@mcp/auth';

/**
 * Simple Google Workspace Configuration
 */
export interface GoogleWorkspaceConfig {
  accountType?: AccountType;
  domain?: string; // For workspace accounts (company.com)
}

/**
 * Google Workspace Agent - VS Code Integrated
 * Provides simple authentication similar to GitHub Copilot
 */
export class GoogleWorkspaceAgent {
  private authProvider: UnifiedAuthProvider;
  private auth: any;

  constructor(config: GoogleWorkspaceConfig = {}) {
    this.authProvider = createGoogleWorkspaceAuth(
      config.accountType || 'personal',
      config.domain
    );
    
    logger.info('GoogleWorkspaceAgent initialized with VS Code-integrated authentication');
  }

  /**
   * Initialize the agent with user-friendly authentication
   */
  public async initialize(): Promise<void> {
    try {
      if (!this.authProvider.isAuthenticated()) {
        logger.info('🔐 Google Workspace authentication required...');
        logger.info('📱 This will open a device authentication flow (like GitHub Copilot)');
        
        await this.authProvider.authenticate();
        
        const authInfo = this.authProvider.getCurrentAuth();
        logger.info(`✅ Successfully authenticated as ${authInfo?.displayName} (${authInfo?.email})`);
      } else {
        const authInfo = this.authProvider.getCurrentAuth();
        logger.info(`✅ Already authenticated as ${authInfo?.displayName}`);
      }

      // Set up Google API client
      this.auth = google.auth.fromJSON({
        type: 'authorized_user',
        client_id: 'your-google-client-id',
        refresh_token: 'managed-by-auth-provider'
      });
      
    } catch (error) {
      logger.error(`❌ GoogleWorkspaceAgent authentication failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get Gmail service
   */
  public getGmailService() {
    return google.gmail({ version: 'v1', auth: this.auth });
  }

  /**
   * Get Google Drive service
   */
  public getDriveService() {
    return google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * Get Google Calendar service
   */
  public getCalendarService() {
    return google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Get Google Sheets service
   */
  public getSheetsService() {
    return google.sheets({ version: 'v4', auth: this.auth });
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
   * Sign out
   */
  public async signOut(): Promise<void> {
    await this.authProvider.signOut();
    logger.info('🔓 Signed out from Google Workspace');
  }

  /**
   * Quick setup helper for personal Google accounts
   */
  public static async createPersonalAccount(): Promise<GoogleWorkspaceAgent> {
    const agent = new GoogleWorkspaceAgent({ accountType: 'personal' });
    await agent.initialize();
    return agent;
  }

  /**
   * Quick setup helper for Google Workspace accounts
   */
  public static async createWorkspaceAccount(domain?: string): Promise<GoogleWorkspaceAgent> {
    const agent = new GoogleWorkspaceAgent({ 
      accountType: 'business',
      domain 
    });
    await agent.initialize();
    return agent;
  }

  /**
   * List recent emails
   */
  public async getRecentEmails(maxResults: number = 10) {
    const gmail = this.getGmailService();
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults
    });
    return response.data;
  }

  /**
   * List Drive files
   */
  public async getDriveFiles(maxResults: number = 10) {
    const drive = this.getDriveService();
    const response = await drive.files.list({
      pageSize: maxResults,
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)'
    });
    return response.data;
  }

  /**
   * List calendar events
   */
  public async getCalendarEvents(maxResults: number = 10) {
    const calendar = this.getCalendarService();
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime'
    });
    return response.data;
  }
}

export default GoogleWorkspaceAgent;