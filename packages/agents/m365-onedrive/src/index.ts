import { M365Agent, type M365AuthConfig, type GraphResult } from '@mcp/agent-m365-graph';

/**
 * OneDrive file interface
 */
export interface OneDriveFile {
  id?: string;
  name: string;
  size?: number;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  webUrl?: string;
  downloadUrl?: string;
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
  };
}

/**
 * Microsoft OneDrive Agent
 * Provides OneDrive-specific operations for MCP integration
 */
export class M365OneDriveAgent extends M365Agent {
  constructor(authConfig: M365AuthConfig) {
    super(authConfig, 'Microsoft OneDrive');
  }

  /**
   * Get files from OneDrive root
   */
  async getFiles(path = ''): Promise<GraphResult> {
    const endpoint = path ? `/me/drive/root:/${path}:/children` : '/me/drive/root/children';
    
    return this.executeOperation({
      type: 'drive',
      action: 'list',
      endpoint,
    });
  }

  /**
   * Upload a file to OneDrive
   */
  async uploadFile(fileName: string, content: string, path = ''): Promise<GraphResult> {
    const endpoint = path 
      ? `/me/drive/root:/${path}/${fileName}:/content`
      : `/me/drive/root:/${fileName}:/content`;

    return this.executeOperation({
      type: 'drive',
      action: 'create',
      endpoint,
      data: content,
    });
  }

  /**
   * Download a file from OneDrive
   */
  async downloadFile(fileId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'drive',
      action: 'get',
      endpoint: `/me/drive/items/${fileId}/content`,
    });
  }

  /**
   * Create a folder in OneDrive
   */
  async createFolder(folderName: string, path = ''): Promise<GraphResult> {
    const parentEndpoint = path ? `/me/drive/root:/${path}` : '/me/drive/root';
    
    const folderData = {
      name: folderName,
      folder: {},
    };

    return this.executeOperation({
      type: 'drive',
      action: 'create',
      endpoint: `${parentEndpoint}/children`,
      data: folderData,
    });
  }

  /**
   * Delete a file or folder
   */
  async deleteItem(itemId: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'drive',
      action: 'delete',
      endpoint: `/me/drive/items/${itemId}`,
    });
  }

  /**
   * Search for files in OneDrive
   */
  async searchFiles(query: string): Promise<GraphResult> {
    return this.executeOperation({
      type: 'drive',
      action: 'list',
      endpoint: `/me/drive/root/search(q='${query}')`,
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

export default M365OneDriveAgent;