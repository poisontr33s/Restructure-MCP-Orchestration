/**
 * Microsoft Teams Agent - VS Code Integrated
 * Teams messages, meetings, channels with simplified authentication
 */

import { M365GraphAgent, type M365Config, type GraphApiResponse } from '@mcp/agents-m365-graph';
import { logger } from '@mcp/shared';

/**
 * Teams Message interface
 */
export interface TeamsMessage {
  id: string;
  messageType: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  subject?: string;
  body: {
    content: string;
    contentType: string;
  };
  from: {
    user: {
      id: string;
      displayName: string;
      userIdentityType: string;
    };
  };
}

/**
 * Teams Channel interface
 */
export interface TeamsChannel {
  id: string;
  displayName: string;
  description?: string;
  membershipType: string;
  createdDateTime: string;
}

/**
 * Teams Meeting interface
 */
export interface TeamsMeeting {
  id: string;
  subject: string;
  startTime: {
    dateTime: string;
    timeZone: string;
  };
  endTime: {
    dateTime: string;
    timeZone: string;
  };
  organizer: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
}

/**
 * Microsoft Teams Agent
 * Provides Teams-specific functionality via Microsoft Graph API
 */
export class M365TeamsAgent {
  private graphAgent: M365GraphAgent;

  constructor(config: M365Config = {}) {
    this.graphAgent = new M365GraphAgent(config);
    logger.info('M365TeamsAgent initialized with VS Code-integrated authentication');
  }

  /**
   * Initialize the Teams agent
   */
  public async initialize(): Promise<void> {
    try {
      await this.graphAgent.initialize();
      logger.info('M365TeamsAgent authenticated successfully');
    } catch (error) {
      logger.error(`M365TeamsAgent initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get all teams the user is a member of
   */
  public async getTeams(): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.makeRequest('/me/joinedTeams');
  }

  /**
   * Get channels for a specific team
   */
  public async getChannels(teamId: string): Promise<GraphApiResponse<TeamsChannel>> {
    return this.graphAgent.makeRequest<TeamsChannel>(`/teams/${teamId}/channels`);
  }

  /**
   * Get messages from a channel
   */
  public async getChannelMessages(teamId: string, channelId: string, limit?: number): Promise<GraphApiResponse<TeamsMessage>> {
    const endpoint = `/teams/${teamId}/channels/${channelId}/messages${limit ? `?$top=${limit}` : ''}`;
    return this.graphAgent.makeRequest<TeamsMessage>(endpoint);
  }

  /**
   * Send a message to a channel
   */
  public async sendChannelMessage(
    teamId: string, 
    channelId: string, 
    message: string,
    messageType: 'text' | 'html' = 'text'
  ): Promise<GraphApiResponse<TeamsMessage>> {
    const endpoint = `/teams/${teamId}/channels/${channelId}/messages`;
    const body = {
      body: {
        content: message,
        contentType: messageType
      }
    };
    return this.graphAgent.makeRequest<TeamsMessage>(endpoint, 'POST', body);
  }

  /**
   * Get user's presence status
   */
  public async getPresence(userId?: string): Promise<GraphApiResponse<unknown>> {
    const endpoint = userId ? `/users/${userId}/presence` : '/me/presence';
    return this.graphAgent.makeRequest(endpoint);
  }

  /**
   * Set user's presence status
   */
  public async setPresence(
    availability: 'Available' | 'Busy' | 'DoNotDisturb' | 'BeRightBack' | 'Away',
    activity: string
  ): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.makeRequest('/me/presence/setPresence', 'POST', {
      sessionId: Date.now().toString(),
      availability,
      activity
    });
  }

  /**
   * Get upcoming meetings for the user
   */
  public async getUpcomingMeetings(days: number = 7): Promise<GraphApiResponse<TeamsMeeting>> {
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toISOString();
    
    const endpoint = `/me/calendar/calendarView?startDateTime=${startTime}&endDateTime=${endTime}&$filter=isOnlineMeeting eq true`;
    return this.graphAgent.makeRequest<TeamsMeeting>(endpoint);
  }

  /**
   * Create a new Teams meeting
   */
  public async createMeeting(
    subject: string,
    startTime: string,
    endTime: string,
    attendees: string[] = []
  ): Promise<GraphApiResponse<TeamsMeeting>> {
    const body = {
      subject,
      start: {
        dateTime: startTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC'
      },
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
      attendees: attendees.map(email => ({
        emailAddress: {
          address: email,
          name: email
        },
        type: 'required'
      }))
    };

    return this.graphAgent.makeRequest<TeamsMeeting>('/me/events', 'POST', body);
  }

  /**
   * Search for Teams content
   */
  public async searchTeams(query: string): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.search(query, ['chatMessage']);
  }

  /**
   * Get authentication status
   */
  public isAuthenticated(): boolean {
    return this.graphAgent.isAuthenticated();
  }
}

export default M365TeamsAgent;