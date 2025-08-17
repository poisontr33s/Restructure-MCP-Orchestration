/**
 * Content Discovery System for VS Code IDE Integration
 * Intelligently detects available content and capabilities based on account login
 */

import { logger } from '@mcp/shared';

export interface AccountCapabilities {
  provider: 'microsoft' | 'google' | 'x';
  accountType: 'personal' | 'business' | 'workspace' | 'premium';
  domain?: string;
  permissions: string[];
  availableServices: ServiceInfo[];
  contentAccess: ContentAccessInfo;
}

export interface ServiceInfo {
  name: string;
  displayName: string;
  available: boolean;
  requiresPermission?: string;
  description: string;
  icon?: string;
}

export interface ContentAccessInfo {
  emails: {
    available: boolean;
    count?: number;
    mailboxes?: string[];
  };
  calendar: {
    available: boolean;
    calendars?: string[];
  };
  files: {
    available: boolean;
    drives?: DriveInfo[];
    totalStorage?: number;
    usedStorage?: number;
  };
  contacts: {
    available: boolean;
    count?: number;
  };
  teams: {
    available: boolean;
    teams?: TeamInfo[];
  };
  sites: {
    available: boolean;
    sites?: SiteInfo[];
  };
}

export interface DriveInfo {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'shared';
  quota?: {
    total: number;
    used: number;
    remaining: number;
  };
}

export interface TeamInfo {
  id: string;
  displayName: string;
  description?: string;
  memberCount?: number;
}

export interface SiteInfo {
  id: string;
  displayName: string;
  webUrl: string;
  description?: string;
}

/**
 * Content Discovery Engine
 * Discovers what content and services are available based on authenticated account
 */
export class ContentDiscoveryEngine {
  private capabilities: Map<string, AccountCapabilities> = new Map();

  /**
   * Discover account capabilities after authentication
   */
  async discoverCapabilities(
    provider: 'microsoft' | 'google' | 'x',
    accessToken: string,
    accountInfo: any
  ): Promise<AccountCapabilities> {
    logger.info(`Discovering capabilities for ${provider} account: ${accountInfo.username || accountInfo.email}`);

    switch (provider) {
      case 'microsoft':
        return this.discoverMicrosoftCapabilities(accessToken, accountInfo);
      case 'google':
        return this.discoverGoogleCapabilities(accessToken, accountInfo);
      case 'x':
        return this.discoverXCapabilities(accessToken, accountInfo);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Discover Microsoft 365 capabilities
   */
  private async discoverMicrosoftCapabilities(
    accessToken: string,
    accountInfo: any
  ): Promise<AccountCapabilities> {
    const capabilities: AccountCapabilities = {
      provider: 'microsoft',
      accountType: this.determineMicrosoftAccountType(accountInfo),
      domain: this.extractDomain(accountInfo.username),
      permissions: [],
      availableServices: [],
      contentAccess: {
        emails: { available: false },
        calendar: { available: false },
        files: { available: false },
        contacts: { available: false },
        teams: { available: false },
        sites: { available: false }
      }
    };

    try {
      // Check what Microsoft Graph endpoints are accessible
      const graphTests = await this.testMicrosoftGraphAccess(accessToken);
      
      // Discover available services based on actual API responses
      if (graphTests.me) {
        capabilities.availableServices.push({
          name: 'profile',
          displayName: 'User Profile',
          available: true,
          description: 'Access to user profile information'
        });
      }

      if (graphTests.mail) {
        capabilities.availableServices.push({
          name: 'outlook',
          displayName: 'Outlook Mail',
          available: true,
          description: 'Access to email messages and folders'
        });
        capabilities.contentAccess.emails.available = true;
        capabilities.contentAccess.emails.count = graphTests.mailCount;
        capabilities.contentAccess.emails.mailboxes = graphTests.mailboxes;
      }

      if (graphTests.calendar) {
        capabilities.availableServices.push({
          name: 'calendar',
          displayName: 'Calendar',
          available: true,
          description: 'Access to calendar events and scheduling'
        });
        capabilities.contentAccess.calendar.available = true;
        capabilities.contentAccess.calendar.calendars = graphTests.calendars;
      }

      if (graphTests.files) {
        capabilities.availableServices.push({
          name: 'onedrive',
          displayName: 'OneDrive',
          available: true,
          description: 'Access to files and documents'
        });
        capabilities.contentAccess.files.available = true;
        capabilities.contentAccess.files.drives = graphTests.drives;
      }

      if (graphTests.contacts) {
        capabilities.availableServices.push({
          name: 'contacts',
          displayName: 'Contacts',
          available: true,
          description: 'Access to personal and organizational contacts'
        });
        capabilities.contentAccess.contacts.available = true;
        capabilities.contentAccess.contacts.count = graphTests.contactCount;
      }

      if (graphTests.teams) {
        capabilities.availableServices.push({
          name: 'teams',
          displayName: 'Microsoft Teams',
          available: true,
          description: 'Access to Teams conversations and files'
        });
        capabilities.contentAccess.teams.available = true;
        capabilities.contentAccess.teams.teams = graphTests.teamsList;
      }

      if (graphTests.sharepoint) {
        capabilities.availableServices.push({
          name: 'sharepoint',
          displayName: 'SharePoint',
          available: true,
          description: 'Access to SharePoint sites and content'
        });
        capabilities.contentAccess.sites.available = true;
        capabilities.contentAccess.sites.sites = graphTests.sites;
      }

    } catch (error) {
      logger.warn(`Error discovering Microsoft capabilities: ${error}`);
    }

    this.capabilities.set(`microsoft:${accountInfo.username}`, capabilities);
    return capabilities;
  }

  /**
   * Test Microsoft Graph API access
   */
  private async testMicrosoftGraphAccess(accessToken: string) {
    const results = {
      me: false,
      mail: false,
      calendar: false,
      files: false,
      contacts: false,
      teams: false,
      sharepoint: false,
      mailCount: 0,
      mailboxes: [] as string[],
      calendars: [] as string[],
      drives: [] as DriveInfo[],
      contactCount: 0,
      teamsList: [] as TeamInfo[],
      sites: [] as SiteInfo[]
    };

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // Test endpoints and gather real data
    try {
      // Test /me endpoint
      const meResponse = await fetch('https://graph.microsoft.com/v1.0/me', { headers });
      if (meResponse.ok) {
        results.me = true;
      }

      // Test mail access
      const mailResponse = await fetch('https://graph.microsoft.com/v1.0/me/messages?$top=1', { headers });
      if (mailResponse.ok) {
        results.mail = true;
        const mailData = await mailResponse.json();
        results.mailCount = mailData['@odata.count'] || 0;
        
        // Get mailboxes
        const mailboxResponse = await fetch('https://graph.microsoft.com/v1.0/me/mailFolders', { headers });
        if (mailboxResponse.ok) {
          const mailboxData = await mailboxResponse.json();
          results.mailboxes = mailboxData.value?.map((f: any) => f.displayName) || [];
        }
      }

      // Test calendar access
      const calendarResponse = await fetch('https://graph.microsoft.com/v1.0/me/calendars', { headers });
      if (calendarResponse.ok) {
        results.calendar = true;
        const calendarData = await calendarResponse.json();
        results.calendars = calendarData.value?.map((c: any) => c.name) || [];
      }

      // Test OneDrive access
      const driveResponse = await fetch('https://graph.microsoft.com/v1.0/me/drives', { headers });
      if (driveResponse.ok) {
        results.files = true;
        const driveData = await driveResponse.json();
        results.drives = driveData.value?.map((d: any) => ({
          id: d.id,
          name: d.name || 'OneDrive',
          type: d.driveType === 'business' ? 'business' : 'personal',
          quota: d.quota ? {
            total: d.quota.total,
            used: d.quota.used,
            remaining: d.quota.remaining
          } : undefined
        })) || [];
      }

      // Test contacts access
      const contactsResponse = await fetch('https://graph.microsoft.com/v1.0/me/contacts?$top=1', { headers });
      if (contactsResponse.ok) {
        results.contacts = true;
        const contactsData = await contactsResponse.json();
        results.contactCount = contactsData['@odata.count'] || 0;
      }

      // Test Teams access
      const teamsResponse = await fetch('https://graph.microsoft.com/v1.0/me/joinedTeams', { headers });
      if (teamsResponse.ok) {
        results.teams = true;
        const teamsData = await teamsResponse.json();
        results.teamsList = teamsData.value?.map((t: any) => ({
          id: t.id,
          displayName: t.displayName,
          description: t.description
        })) || [];
      }

      // Test SharePoint access
      const sitesResponse = await fetch('https://graph.microsoft.com/v1.0/sites?search=*', { headers });
      if (sitesResponse.ok) {
        results.sharepoint = true;
        const sitesData = await sitesResponse.json();
        results.sites = sitesData.value?.map((s: any) => ({
          id: s.id,
          displayName: s.displayName,
          webUrl: s.webUrl,
          description: s.description
        })) || [];
      }

    } catch (error) {
      logger.warn(`Error testing Graph API endpoints: ${error}`);
    }

    return results;
  }

  /**
   * Discover Google Workspace capabilities
   */
  private async discoverGoogleCapabilities(
    accessToken: string,
    accountInfo: any
  ): Promise<AccountCapabilities> {
    const capabilities: AccountCapabilities = {
      provider: 'google',
      accountType: accountInfo.hd ? 'workspace' : 'personal',
      domain: accountInfo.hd,
      permissions: [],
      availableServices: [],
      contentAccess: {
        emails: { available: false },
        calendar: { available: false },
        files: { available: false },
        contacts: { available: false },
        teams: { available: false },
        sites: { available: false }
      }
    };

    try {
      // Test Google API access
      const googleTests = await this.testGoogleAPIAccess(accessToken);
      
      if (googleTests.gmail) {
        capabilities.availableServices.push({
          name: 'gmail',
          displayName: 'Gmail',
          available: true,
          description: 'Access to Gmail messages and labels'
        });
        capabilities.contentAccess.emails.available = true;
      }

      if (googleTests.calendar) {
        capabilities.availableServices.push({
          name: 'calendar',
          displayName: 'Google Calendar',
          available: true,
          description: 'Access to calendar events'
        });
        capabilities.contentAccess.calendar.available = true;
      }

      if (googleTests.drive) {
        capabilities.availableServices.push({
          name: 'drive',
          displayName: 'Google Drive',
          available: true,
          description: 'Access to Google Drive files'
        });
        capabilities.contentAccess.files.available = true;
      }

      if (googleTests.contacts) {
        capabilities.availableServices.push({
          name: 'contacts',
          displayName: 'Google Contacts',
          available: true,
          description: 'Access to contacts'
        });
        capabilities.contentAccess.contacts.available = true;
      }

    } catch (error) {
      logger.warn(`Error discovering Google capabilities: ${error}`);
    }

    this.capabilities.set(`google:${accountInfo.email}`, capabilities);
    return capabilities;
  }

  /**
   * Test Google API access
   */
  private async testGoogleAPIAccess(accessToken: string) {
    const results = {
      gmail: false,
      calendar: false,
      drive: false,
      contacts: false
    };

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    try {
      // Test Gmail API
      const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', { headers });
      results.gmail = gmailResponse.ok;

      // Test Calendar API
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', { headers });
      results.calendar = calendarResponse.ok;

      // Test Drive API
      const driveResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', { headers });
      results.drive = driveResponse.ok;

      // Test Contacts API
      const contactsResponse = await fetch('https://people.googleapis.com/v1/people/me?personFields=names', { headers });
      results.contacts = contactsResponse.ok;

    } catch (error) {
      logger.warn(`Error testing Google API endpoints: ${error}`);
    }

    return results;
  }

  /**
   * Discover X/Twitter capabilities
   */
  private async discoverXCapabilities(
    accessToken: string,
    accountInfo: any
  ): Promise<AccountCapabilities> {
    const capabilities: AccountCapabilities = {
      provider: 'x',
      accountType: accountInfo.verified ? 'premium' : 'personal',
      permissions: [],
      availableServices: [
        {
          name: 'tweets',
          displayName: 'X Posts',
          available: true,
          description: 'Access to X posts and interactions'
        },
        {
          name: 'dm',
          displayName: 'Direct Messages',
          available: true,
          description: 'Access to direct messages'
        }
      ],
      contentAccess: {
        emails: { available: false },
        calendar: { available: false },
        files: { available: false },
        contacts: { available: false },
        teams: { available: false },
        sites: { available: false }
      }
    };

    this.capabilities.set(`x:${accountInfo.username}`, capabilities);
    return capabilities;
  }

  /**
   * Get cached capabilities for an account
   */
  getCapabilities(provider: string, accountId: string): AccountCapabilities | undefined {
    return this.capabilities.get(`${provider}:${accountId}`);
  }

  /**
   * Determine Microsoft account type
   */
  private determineMicrosoftAccountType(accountInfo: any): 'personal' | 'business' {
    // Business accounts typically have tenantId and organizational domains
    if (accountInfo.tenantId && accountInfo.tenantId !== '9188040d-6c67-4c5b-b112-36a304b66dad') {
      return 'business';
    }
    return 'personal';
  }

  /**
   * Extract domain from username/email
   */
  private extractDomain(username: string): string | undefined {
    if (username.includes('@')) {
      return username.split('@')[1];
    }
    return undefined;
  }
}