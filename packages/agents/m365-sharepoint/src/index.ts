import { M365Agent, type M365AuthConfig, type GraphResult } from '@mcp/agent-m365-graph';

/**
 * SharePoint site interface
 */
export interface SharePointSite {
  id?: string;
  displayName: string;
  webUrl?: string;
  description?: string;
  createdDateTime?: string;
}

/**
 * SharePoint list interface
 */
export interface SharePointList {
  id?: string;
  displayName: string;
  description?: string;
  webUrl?: string;
  createdDateTime?: string;
}

/**
 * SharePoint list item interface
 */
export interface SharePointListItem {
  id?: string;
  fields: Record<string, unknown>;
  webUrl?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

/**
 * Microsoft SharePoint Agent
 * Provides SharePoint-specific operations for MCP integration
 */
export class M365SharePointAgent extends M365Agent {
  constructor(authConfig: M365AuthConfig) {
    super(authConfig, 'Microsoft SharePoint');
  }

  /**
   * Get SharePoint sites
   */
  async getSites(search?: string): Promise<GraphResult> {
    const endpoint = search 
      ? `/sites?search=${encodeURIComponent(search)}`
      : '/sites?select=id,displayName,webUrl,description,createdDateTime';

    return this.executeOperation({
      type: 'sharepoint',
      action: 'list',
      endpoint,
    });
  }

  /**
   * Get a specific SharePoint site
   */
  async getSite(siteId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'sharepoint',
      action: 'get',
      endpoint: `/sites/${siteId}`,
    });
  }

  /**
   * Get lists from a SharePoint site
   */
  async getSiteLists(siteId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'sharepoint',
      action: 'list',
      endpoint: `/sites/${siteId}/lists`,
    });
  }

  /**
   * Get items from a SharePoint list
   */
  async getListItems(siteId: string, listId: string, top = 25): Promise<GraphResult> {
    return this.executeOperation({
      type: 'sharepoint',
      action: 'list',
      endpoint: `/sites/${siteId}/lists/${listId}/items?expand=fields&$top=${top}`,
    });
  }

  /**
   * Create a new list item
   */
  async createListItem(siteId: string, listId: string, fields: Record<string, unknown>): Promise<GraphResult> {
    const itemData = {
      fields,
    };

    return this.executeOperation({
      type: 'sharepoint',
      action: 'create',
      endpoint: `/sites/${siteId}/lists/${listId}/items`,
      data: itemData,
    });
  }

  /**
   * Update a list item
   */
  async updateListItem(
    siteId: string, 
    listId: string, 
    itemId: string, 
    fields: Record<string, unknown>
  ): Promise<GraphResult> {
    const itemData = {
      fields,
    };

    return this.executeOperation({
      type: 'sharepoint',
      action: 'update',
      endpoint: `/sites/${siteId}/lists/${listId}/items/${itemId}/fields`,
      data: itemData,
    });
  }

  /**
   * Delete a list item
   */
  async deleteListItem(siteId: string, listId: string, itemId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'sharepoint',
      action: 'delete',
      endpoint: `/sites/${siteId}/lists/${listId}/items/${itemId}`,
    });
  }

  /**
   * Get files from a SharePoint document library
   */
  async getDocumentLibraryFiles(siteId: string, libraryId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'sharepoint',
      action: 'list',
      endpoint: `/sites/${siteId}/drives/${libraryId}/root/children`,
    });
  }

  /**
   * Upload a file to SharePoint document library
   */
  async uploadFile(
    siteId: string, 
    libraryId: string, 
    fileName: string, 
    content: string
  ): Promise<GraphResult> {
    return this.executeOperation({
      type: 'sharepoint',
      action: 'create',
      endpoint: `/sites/${siteId}/drives/${libraryId}/root:/${fileName}:/content`,
      data: content,
    });
  }

  /**
   * Search SharePoint content
   */
  async searchContent(query: string, siteId?: string): Promise<GraphResult> {
    const searchData = {
      requests: [
        {
          entityTypes: ['site', 'list', 'listItem', 'driveItem'],
          query: {
            queryString: siteId ? `${query} site:${siteId}` : query,
          },
          from: 0,
          size: 25,
        },
      ],
    };

    return this.executeOperation({
      type: 'sharepoint',
      action: 'create',
      endpoint: '/search/query',
      data: searchData,
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

export default M365SharePointAgent;