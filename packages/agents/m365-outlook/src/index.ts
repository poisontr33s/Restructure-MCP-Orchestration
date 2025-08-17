/**
 * Microsoft Outlook Agent - VS Code Integrated
 * Email, calendar, contacts with simplified authentication
 */

import { M365GraphAgent, type M365Config, type GraphApiResponse } from '@mcp/agents-m365-graph';
import { logger } from '@mcp/shared';

/**
 * Email Message interface
 */
export interface EmailMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  importance: 'low' | 'normal' | 'high';
  isRead: boolean;
  receivedDateTime: string;
  sentDateTime?: string;
  hasAttachments: boolean;
  from: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  toRecipients: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
  }>;
  body: {
    content: string;
    contentType: 'text' | 'html';
  };
}

/**
 * Calendar Event interface
 */
export interface CalendarEvent {
  id: string;
  subject: string;
  bodyPreview: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
    address?: unknown;
  };
  organizer: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  attendees: Array<{
    emailAddress: {
      address: string;
      name: string;
    };
    status: {
      response: string;
      time: string;
    };
  }>;
}

/**
 * Contact interface
 */
export interface Contact {
  id: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  emailAddresses: Array<{
    address: string;
    name?: string;
  }>;
  businessPhones: string[];
  mobilePhone?: string;
  jobTitle?: string;
  companyName?: string;
}

/**
 * Microsoft Outlook Agent
 * Provides Outlook-specific functionality via Microsoft Graph API
 */
export class M365OutlookAgent {
  private graphAgent: M365GraphAgent;

  constructor(config: M365Config = {}) {
    this.graphAgent = new M365GraphAgent(config);
    logger.info('M365OutlookAgent initialized with VS Code-integrated authentication');
  }

  /**
   * Initialize the Outlook agent
   */
  public async initialize(): Promise<void> {
    try {
      await this.graphAgent.initialize();
      logger.info('M365OutlookAgent authenticated successfully');
    } catch (error) {
      logger.error(`M365OutlookAgent initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get user's emails
   */
  public async getEmails(folderId: string = 'inbox', limit?: number): Promise<GraphApiResponse<EmailMessage>> {
    const endpoint = `/me/mailFolders/${folderId}/messages${limit ? `?$top=${limit}` : ''}`;
    return this.graphAgent.makeRequest<EmailMessage>(endpoint);
  }

  /**
   * Send an email
   */
  public async sendEmail(
    to: string[],
    subject: string,
    body: string,
    bodyType: 'text' | 'html' = 'text',
    cc?: string[],
    bcc?: string[]
  ): Promise<GraphApiResponse<unknown>> {
    const message = {
      subject,
      body: {
        contentType: bodyType,
        content: body
      },
      toRecipients: to.map(email => ({
        emailAddress: {
          address: email
        }
      })),
      ccRecipients: cc?.map(email => ({
        emailAddress: {
          address: email
        }
      })),
      bccRecipients: bcc?.map(email => ({
        emailAddress: {
          address: email
        }
      }))
    };

    return this.graphAgent.makeRequest('/me/sendMail', 'POST', { message });
  }

  /**
   * Reply to an email
   */
  public async replyToEmail(
    messageId: string,
    replyBody: string,
    replyAll: boolean = false
  ): Promise<GraphApiResponse<unknown>> {
    const endpoint = `/me/messages/${messageId}/${replyAll ? 'replyAll' : 'reply'}`;
    const body = {
      message: {
        body: {
          contentType: 'text',
          content: replyBody
        }
      }
    };

    return this.graphAgent.makeRequest(endpoint, 'POST', body);
  }

  /**
   * Mark email as read/unread
   */
  public async markEmailAsRead(messageId: string, isRead: boolean = true): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.makeRequest(`/me/messages/${messageId}`, 'PATCH', { isRead });
  }

  /**
   * Delete an email
   */
  public async deleteEmail(messageId: string): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.makeRequest(`/me/messages/${messageId}`, 'DELETE');
  }

  /**
   * Get calendar events
   */
  public async getCalendarEvents(days: number = 30): Promise<GraphApiResponse<CalendarEvent>> {
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toISOString();
    
    const endpoint = `/me/calendar/calendarView?startDateTime=${startTime}&endDateTime=${endTime}`;
    return this.graphAgent.makeRequest<CalendarEvent>(endpoint);
  }

  /**
   * Create a calendar event
   */
  public async createCalendarEvent(
    subject: string,
    startTime: string,
    endTime: string,
    attendees: string[] = [],
    location?: string
  ): Promise<GraphApiResponse<CalendarEvent>> {
    const event = {
      subject,
      start: {
        dateTime: startTime,
        timeZone: 'UTC'
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC'
      },
      attendees: attendees.map(email => ({
        emailAddress: {
          address: email
        },
        type: 'required'
      })),
      location: location ? { displayName: location } : undefined
    };

    return this.graphAgent.makeRequest<CalendarEvent>('/me/events', 'POST', event);
  }

  /**
   * Update a calendar event
   */
  public async updateCalendarEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<GraphApiResponse<CalendarEvent>> {
    return this.graphAgent.makeRequest<CalendarEvent>(`/me/events/${eventId}`, 'PATCH', updates);
  }

  /**
   * Delete a calendar event
   */
  public async deleteCalendarEvent(eventId: string): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.makeRequest(`/me/events/${eventId}`, 'DELETE');
  }

  /**
   * Get contacts
   */
  public async getContacts(limit?: number): Promise<GraphApiResponse<Contact>> {
    const endpoint = `/me/contacts${limit ? `?$top=${limit}` : ''}`;
    return this.graphAgent.makeRequest<Contact>(endpoint);
  }

  /**
   * Create a new contact
   */
  public async createContact(contact: Partial<Contact>): Promise<GraphApiResponse<Contact>> {
    return this.graphAgent.makeRequest<Contact>('/me/contacts', 'POST', contact);
  }

  /**
   * Update a contact
   */
  public async updateContact(
    contactId: string,
    updates: Partial<Contact>
  ): Promise<GraphApiResponse<Contact>> {
    return this.graphAgent.makeRequest<Contact>(`/me/contacts/${contactId}`, 'PATCH', updates);
  }

  /**
   * Delete a contact
   */
  public async deleteContact(contactId: string): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.makeRequest(`/me/contacts/${contactId}`, 'DELETE');
  }

  /**
   * Search emails
   */
  public async searchEmails(query: string): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.search(query, ['message']);
  }

  /**
   * Get authentication status
   */
  public isAuthenticated(): boolean {
    return this.graphAgent.isAuthenticated();
  }
}

export default M365OutlookAgent;