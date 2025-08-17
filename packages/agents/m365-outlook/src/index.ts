import { M365Agent, type M365AuthConfig, type GraphResult } from '@mcp/agent-m365-graph';

/**
 * Email message interface
 */
export interface EmailMessage {
  id?: string;
  subject: string;
  body: {
    content: string;
    contentType?: 'text' | 'html';
  };
  toRecipients: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
  }>;
  ccRecipients?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
  }>;
  bccRecipients?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
  }>;
  importance?: 'low' | 'normal' | 'high';
  attachments?: Array<{
    name: string;
    contentBytes: string;
    contentType: string;
  }>;
}

/**
 * Calendar event interface
 */
export interface CalendarEvent {
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
  location?: {
    displayName: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
    type?: 'required' | 'optional' | 'resource';
  }>;
  isReminderOn?: boolean;
  reminderMinutesBeforeStart?: number;
}

/**
 * Contact interface
 */
export interface Contact {
  id?: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  emailAddresses?: Array<{
    address: string;
    name?: string;
  }>;
  businessPhones?: string[];
  homePhones?: string[];
  mobilePhone?: string;
  jobTitle?: string;
  companyName?: string;
}

/**
 * Microsoft Outlook Agent
 * Provides Outlook-specific operations for email, calendar, and contacts
 */
export class M365OutlookAgent extends M365Agent {
  constructor(authConfig: M365AuthConfig) {
    super(authConfig, 'Microsoft Outlook');
  }

  // Email Operations

  /**
   * Get messages from user's mailbox
   */
  async getMessages(top = 25, skip = 0, folder = 'inbox'): Promise<GraphResult> {
    return this.executeOperation({
      type: 'mail',
      action: 'list',
      endpoint: `/me/mailFolders/${folder}/messages?$top=${top}&$skip=${skip}&$orderby=receivedDateTime desc`,
    });
  }

  /**
   * Send an email message
   */
  async sendMessage(message: EmailMessage): Promise<GraphResult> {
    const emailData = {
      message,
      saveToSentItems: true,
    };

    return this.executeOperation({
      type: 'mail',
      action: 'create',
      endpoint: '/me/sendMail',
      data: emailData,
    });
  }

  /**
   * Reply to an email message
   */
  async replyToMessage(messageId: string, replyMessage: Partial<EmailMessage>): Promise<GraphResult> {
    return this.executeOperation({
      type: 'mail',
      action: 'create',
      endpoint: `/me/messages/${messageId}/reply`,
      data: { message: replyMessage },
    });
  }

  /**
   * Mark message as read/unread
   */
  async markMessageAsRead(messageId: string, isRead = true): Promise<GraphResult> {
    return this.executeOperation({
      type: 'mail',
      action: 'update',
      endpoint: `/me/messages/${messageId}`,
      data: { isRead },
    });
  }

  /**
   * Move message to folder
   */
  async moveMessage(messageId: string, destinationFolderId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'mail',
      action: 'create',
      endpoint: `/me/messages/${messageId}/move`,
      data: { destinationId: destinationFolderId },
    });
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, top = 25): Promise<GraphResult> {
    return this.executeOperation({
      type: 'mail',
      action: 'list',
      endpoint: `/me/messages?$search="${query}"&$top=${top}&$orderby=receivedDateTime desc`,
    });
  }

  // Calendar Operations

  /**
   * Get calendar events
   */
  async getCalendarEvents(startTime?: string, endTime?: string, top = 25): Promise<GraphResult> {
    let endpoint = `/me/events?$top=${top}&$orderby=start/dateTime`;
    
    if (startTime && endTime) {
      endpoint += `&$filter=start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`;
    }

    return this.executeOperation({
      type: 'calendar',
      action: 'list',
      endpoint,
    });
  }

  /**
   * Create a calendar event
   */
  async createCalendarEvent(event: CalendarEvent): Promise<GraphResult> {
    return this.executeOperation({
      type: 'calendar',
      action: 'create',
      endpoint: '/me/events',
      data: event,
    });
  }

  /**
   * Update a calendar event
   */
  async updateCalendarEvent(eventId: string, eventUpdate: Partial<CalendarEvent>): Promise<GraphResult> {
    return this.executeOperation({
      type: 'calendar',
      action: 'update',
      endpoint: `/me/events/${eventId}`,
      data: eventUpdate,
    });
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(eventId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'calendar',
      action: 'delete',
      endpoint: `/me/events/${eventId}`,
    });
  }

  /**
   * Get free/busy information
   */
  async getFreeBusy(emails: string[], startTime: string, endTime: string): Promise<GraphResult> {
    const freeBusyData = {
      schedules: emails,
      startTime: {
        dateTime: startTime,
        timeZone: 'UTC',
      },
      endTime: {
        dateTime: endTime,
        timeZone: 'UTC',
      },
      availabilityViewInterval: 60,
    };

    return this.executeOperation({
      type: 'calendar',
      action: 'create',
      endpoint: '/me/calendar/getSchedule',
      data: freeBusyData,
    });
  }

  // Contact Operations

  /**
   * Get contacts
   */
  async getContacts(top = 25, skip = 0): Promise<GraphResult> {
    return this.executeOperation({
      type: 'contacts',
      action: 'list',
      endpoint: `/me/contacts?$top=${top}&$skip=${skip}&$orderby=displayName`,
    });
  }

  /**
   * Create a contact
   */
  async createContact(contact: Contact): Promise<GraphResult> {
    return this.executeOperation({
      type: 'contacts',
      action: 'create',
      endpoint: '/me/contacts',
      data: contact,
    });
  }

  /**
   * Update a contact
   */
  async updateContact(contactId: string, contactUpdate: Partial<Contact>): Promise<GraphResult> {
    return this.executeOperation({
      type: 'contacts',
      action: 'update',
      endpoint: `/me/contacts/${contactId}`,
      data: contactUpdate,
    });
  }

  /**
   * Delete a contact
   */
  async deleteContact(contactId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'contacts',
      action: 'delete',
      endpoint: `/me/contacts/${contactId}`,
    });
  }

  /**
   * Search contacts
   */
  async searchContacts(query: string, top = 25): Promise<GraphResult> {
    return this.executeOperation({
      type: 'contacts',
      action: 'list',
      endpoint: `/me/contacts?$search="${query}"&$top=${top}`,
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
}

export default M365OutlookAgent;