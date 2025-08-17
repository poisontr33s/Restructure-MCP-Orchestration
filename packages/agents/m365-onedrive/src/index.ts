/**
 * Microsoft OneDrive Agent
 * File operations including upload, download, folder management
 */

import { M365GraphAgent, type M365AuthConfig, type GraphApiResponse } from '@mcp/agents-m365-graph';
import { logger } from '@mcp/shared';

/**
 * OneDrive Item interface
 */
export interface OneDriveItem {
  id: string;
  name: string;
  size?: number;
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
    hashes: Record<string, string>;
  };
  createdBy: {
    user: {
      displayName: string;
      email: string;
    };
  };
}

/**
 * Microsoft OneDrive Agent
 * Provides OneDrive-specific functionality via Microsoft Graph API
 */
export class M365OneDriveAgent {
  private graphAgent: M365GraphAgent;

  constructor(authConfig: M365AuthConfig) {
    this.graphAgent = new M365GraphAgent(authConfig);
    logger.info('M365OneDriveAgent initialized');
  }

  /**
   * Initialize the OneDrive agent
   */
  public async initialize(): Promise<void> {
    try {
      await this.graphAgent.initialize();
      logger.info('M365OneDriveAgent authenticated successfully');
    } catch (error) {
      logger.error(`M365OneDriveAgent initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get root folder contents
   */
  public async getRootItems(): Promise<GraphApiResponse<OneDriveItem>> {
    return this.graphAgent.makeRequest<OneDriveItem>('/me/drive/root/children');
  }

  /**
   * Get folder contents by ID
   */
  public async getFolderItems(folderId: string): Promise<GraphApiResponse<OneDriveItem>> {
    return this.graphAgent.makeRequest<OneDriveItem>(`/me/drive/items/${folderId}/children`);
  }

  /**
   * Get item by path
   */
  public async getItemByPath(path: string): Promise<GraphApiResponse<OneDriveItem>> {
    return this.graphAgent.makeRequest<OneDriveItem>(`/me/drive/root:/${path}`);
  }

  /**
   * Upload a file
   */
  public async uploadFile(
    fileName: string,
    content: string | Buffer,
    folderPath?: string
  ): Promise<GraphApiResponse<OneDriveItem>> {
    const endpoint = folderPath 
      ? `/me/drive/root:/${folderPath}/${fileName}:/content`
      : `/me/drive/root:/${fileName}:/content`;
    
    return this.graphAgent.makeRequest<OneDriveItem>(endpoint, 'PUT', content);
  }

  /**
   * Download a file
   */
  public async downloadFile(itemId: string): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.makeRequest(`/me/drive/items/${itemId}/content`);
  }

  /**
   * Create a folder
   */
  public async createFolder(
    folderName: string,
    parentFolderId?: string
  ): Promise<GraphApiResponse<OneDriveItem>> {
    const endpoint = parentFolderId 
      ? `/me/drive/items/${parentFolderId}/children`
      : '/me/drive/root/children';
    
    const folder = {
      name: folderName,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    };

    return this.graphAgent.makeRequest<OneDriveItem>(endpoint, 'POST', folder);
  }

  /**
   * Delete an item
   */
  public async deleteItem(itemId: string): Promise<GraphApiResponse<unknown>> {
    return this.graphAgent.makeRequest(`/me/drive/items/${itemId}`, 'DELETE');
  }

  /**
   * Move an item
   */
  public async moveItem(
    itemId: string,
    targetFolderId: string,
    newName?: string
  ): Promise<GraphApiResponse<OneDriveItem>> {
    const updates = {
      parentReference: {
        id: targetFolderId
      },
      name: newName
    };

    return this.graphAgent.makeRequest<OneDriveItem>(`/me/drive/items/${itemId}`, 'PATCH', updates);
  }

  /**
   * Copy an item
   */
  public async copyItem(
    itemId: string,
    targetFolderId: string,
    newName?: string
  ): Promise<GraphApiResponse<unknown>> {
    const copyData = {
      parentReference: {
        id: targetFolderId
      },
      name: newName
    };

    return this.graphAgent.makeRequest(`/me/drive/items/${itemId}/copy`, 'POST', copyData);
  }

  /**
   * Search files
   */
  public async searchFiles(query: string): Promise<GraphApiResponse<OneDriveItem>> {
    return this.graphAgent.makeRequest<OneDriveItem>(`/me/drive/search(q='${query}')`);
  }

  /**
   * Get recent files
   */
  public async getRecentFiles(limit?: number): Promise<GraphApiResponse<OneDriveItem>> {
    const endpoint = `/me/drive/recent${limit ? `?$top=${limit}` : ''}`;
    return this.graphAgent.makeRequest<OneDriveItem>(endpoint);
  }

  /**
   * Get authentication status
   */
  public isAuthenticated(): boolean {
    return this.graphAgent.isAuthenticated();
  }
}

export default M365OneDriveAgent;