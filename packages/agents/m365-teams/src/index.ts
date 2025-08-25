import { M365Agent, type M365AuthConfig, type GraphResult } from '@mcp/agent-m365-graph';
import * as microsoftTeams from '@microsoft/teams-js';

/**
 * Teams message interface
 */
export interface TeamsMessage {
  id?: string;
  body: {
    content: string;
    contentType?: 'text' | 'html';
  };
  from?: {
    user?: {
      id: string;
      displayName: string;
    };
  };
  createdDateTime?: string;
  subject?: string;
}

/**
 * Teams channel interface
 */
export interface TeamsChannel {
  id?: string;
  displayName: string;
  description?: string;
  membershipType?: 'standard' | 'private';
}

/**
 * Teams meeting interface
 */
export interface TeamsMeeting {
  id?: string;
  subject: string;
  body?: {
    content: string;
    contentType?: 'text' | 'html';
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type?: 'required' | 'optional' | 'resource';
  }>;
}

/**
 * Microsoft Teams Agent
 * Provides Teams-specific operations for MCP integration
 */
export class M365TeamsAgent extends M365Agent {
  private isTeamsInitialized = false;

  constructor(authConfig: M365AuthConfig) {
    super(authConfig, 'Microsoft Teams');
  }

  /**
   * Initialize Teams SDK (for Teams app context)
   */
  async initializeTeamsSDK(): Promise<void> {
    try {
      await microsoftTeams.app.initialize();
      this.isTeamsInitialized = true;
      console.info('Teams SDK initialized successfully');
    } catch (error) {
      console.warn('Teams SDK initialization failed (may not be in Teams context):', error);
      // Not being in Teams context is not necessarily an error
      this.isTeamsInitialized = false;
    }
  }

  /**
   * Get user's teams
   */
  async getTeams(): Promise<GraphResult> {
    return this.executeOperation({
      type: 'teams',
      action: 'list',
      endpoint: '/me/joinedTeams',
    });
  }

  /**
   * Get channels for a specific team
   */
  async getTeamChannels(teamId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'teams',
      action: 'list',
      endpoint: `/teams/${teamId}/channels`,
    });
  }

  /**
   * Get messages from a team channel
   */
  async getChannelMessages(teamId: string, channelId: string, top = 20): Promise<GraphResult> {
    return this.executeOperation({
      type: 'teams',
      action: 'list',
      endpoint: `/teams/${teamId}/channels/${channelId}/messages?$top=${top}&$orderby=createdDateTime desc`,
    });
  }

  /**
   * Send a message to a team channel
   */
  async sendChannelMessage(teamId: string, channelId: string, message: TeamsMessage): Promise<GraphResult> {
    return this.executeOperation({
      type: 'teams',
      action: 'create',
      endpoint: `/teams/${teamId}/channels/${channelId}/messages`,
      data: message,
    });
  }

  /**
   * Create a new channel in a team
   */
  async createChannel(teamId: string, channel: TeamsChannel): Promise<GraphResult> {
    return this.executeOperation({
      type: 'teams',
      action: 'create',
      endpoint: `/teams/${teamId}/channels`,
      data: channel,
    });
  }

  /**
   * Schedule a Teams meeting
   */
  async scheduleMeeting(meeting: TeamsMeeting): Promise<GraphResult> {
    const eventData = {
      subject: meeting.subject,
      body: meeting.body,
      start: meeting.start,
      end: meeting.end,
      attendees: meeting.attendees,
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    };

    return this.executeOperation({
      type: 'teams',
      action: 'create',
      endpoint: '/me/events',
      data: eventData,
    });
  }

  /**
   * Get user's Teams meetings
   */
  async getMeetings(startTime?: string, endTime?: string): Promise<GraphResult> {
    let endpoint = '/me/events?$filter=isOnlineMeeting eq true';
    
    if (startTime && endTime) {
      endpoint += ` and start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`;
    }

    return this.executeOperation({
      type: 'teams',
      action: 'list',
      endpoint,
    });
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'teams',
      action: 'list',
      endpoint: `/teams/${teamId}/members`,
    });
  }

  /**
   * Get user's presence status
   */
  async getPresence(userId?: string): Promise<GraphResult> {
    const endpoint = userId ? `/users/${userId}/presence` : '/me/presence';
    
    return this.executeOperation({
      type: 'teams',
      action: 'get',
      endpoint,
    });
  }

  /**
   * Update user's presence status
   */
  async updatePresence(availability: string, activity: string): Promise<GraphResult> {
    const presenceData = {
      availability,
      activity,
    };

    return this.executeOperation({
      type: 'teams',
      action: 'update',
      endpoint: '/me/presence/setUserPreferredPresence',
      data: presenceData,
    });
  }

  /**
   * Execute a Graph API operation (inherited from base class)
   */
  private async executeOperation(operation: { type: string; action: string; endpoint: string; data?: unknown }): Promise<GraphResult> {
    const timestamp = new Date().toISOString();
    
    try {
      let result: unknown;

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
   * Get Teams agent status
   */
  getStatus(): { name: string; authenticated: boolean; teamsContext: boolean } {
    const baseStatus = super.getStatus();
    return {
      ...baseStatus,
      teamsContext: this.isTeamsInitialized,
    };
  }
}

export default M365TeamsAgent;