/**
 * Microsoft SharePoint Agent
 * Access documents, lists, sites, and search functionality
 */

import { M365GraphAgent, type M365AuthConfig, type GraphApiResponse } from '@mcp/agents-m365-graph';
import { logger } from '@mcp/shared';

/**
 * SharePoint Site interface
 */
export interface SharePointSite {
  id: string;
  displayName: string;
  name: string;
  webUrl: string;
  description?: string;
  createdDateTime: string;
}

/**
 * SharePoint List interface
 */
export interface SharePointList {
  id: string;
  displayName: string;
  name: string;
  description?: string;
  webUrl: string;
  createdDateTime: string;
}

/**
 * SharePoint Document interface
 */
export interface SharePointDocument {
  id: string;
  name: string;
  webUrl: string;
  size: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
  createdBy: {
    user: {
      displayName: string;
      email: string;
    };
  };
}

/**
 * Microsoft SharePoint Agent
 * Provides SharePoint-specific functionality via Microsoft Graph API
 */
export class M365SharePointAgent {
  private graphAgent: M365GraphAgent;

  constructor(authConfig: M365AuthConfig) {
    this.graphAgent = new M365GraphAgent(authConfig);
    logger.info('M365SharePointAgent initialized');
  }

  /**
   * Initialize the SharePoint agent
   */
  public async initialize(): Promise<void> {
    try {
      await this.graphAgent.initialize();
      logger.info('M365SharePointAgent authenticated successfully');
    } catch (error) {
      logger.error(`M365SharePointAgent initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get all SharePoint sites
   */
  public async getSites(): Promise<GraphApiResponse<SharePointSite>> {
    return this.graphAgent.makeRequest<SharePointSite>('/sites?search=*');
  }

  /**
   * Get a specific site by ID
   */
  public async getSite(siteId: string): Promise<GraphApiResponse<SharePointSite>> {
    return this.graphAgent.makeRequest<SharePointSite>(`/sites/${siteId}`);
  }

  /**
   * Get lists from a site
   */
  public async getLists(siteId: string): Promise<GraphApiResponse<SharePointList>> {
    return this.graphAgent.makeRequest<SharePointList>(`/sites/${siteId}/lists`);
  }

  /**
   * Get documents from a document library
   */
  public async getDocuments(siteId: string, libraryId?: string): Promise<GraphApiResponse<SharePointDocument>> {
    const endpoint = libraryId 
      ? `/sites/${siteId}/lists/${libraryId}/items`
      : `/sites/${siteId}/drive/root/children`;
    return this.graphAgent.makeRequest<SharePointDocument>(endpoint);
  }

  /**
   * Upload a document to SharePoint
   */
  public async uploadDocument(
    siteId: string,
    fileName: string,
    content: string | Buffer,
    folderPath?: string
  ): Promise<GraphApiResponse<SharePointDocument>> {
    const encodedContent = typeof content === 'string' ? Buffer.from(content).toString('base64') : content.toString('base64');
    const endpoint = folderPath 
      ? `/sites/${siteId}/drive/root:/${folderPath}/${fileName}:/content`
      : `/sites/${siteId}/drive/root/children/${fileName}/content`;
    
    return this.graphAgent.makeRequest<SharePointDocument>(endpoint, 'PUT', encodedContent);
  }

  /**
   * Search SharePoint content
   */
  public async searchContent(query: string, siteId?: string): Promise<GraphApiResponse<unknown>> {
    if (siteId) {
      return this.graphAgent.makeRequest(`/sites/${siteId}/drive/search(q='${query}')`);
    }
    return this.graphAgent.search(query, ['driveItem', 'list', 'listItem']);
  }

  /**
   * Get authentication status
   */
  public isAuthenticated(): boolean {
    return this.graphAgent.isAuthenticated();
  }
}

export default M365SharePointAgent;