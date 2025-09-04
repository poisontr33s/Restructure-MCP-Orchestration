import { type IncomingMessage, type ServerResponse } from 'http';
import { URL } from 'url';
import fetch from 'node-fetch';
import BaseServer from '@mcp/server-base';
import { type ServerConfig } from '@mcp/shared';

/**
 * DuckDuckGo MCP Server Implementation
 * Provides web search functionality with privacy protection
 */
export class DuckDuckGoServer extends BaseServer {
  private MAX_RESULTS = 10;
  private SAFE_SEARCH = 'strict'; // Options: strict, moderate, off
  private REGION = 'us-en';

  /**
   * Constructor
   * @param config Server configuration
   */
  constructor(config: ServerConfig) {
    super(config);
    this.log('DuckDuckGo MCP Server created');
  }

  /**
   * Handle incoming HTTP requests
   * @param req HTTP request
   * @param res HTTP response
   */
  protected handleRequest(req: IncomingMessage, res: ServerResponse): void {
    try {
      // Set CORS headers for browser compatibility
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // Parse URL
      const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);

      // Handle different endpoints
      if (parsedUrl.pathname === '/search' && req.method === 'GET') {
        this.handleSearchRequest(parsedUrl.searchParams, res);
      } else if (parsedUrl.pathname === '/status' && req.method === 'GET') {
        this.handleStatusRequest(res);
      } else {
        // Default response for unknown endpoints
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (error) {
      this.log(`Request error: ${error instanceof Error ? error.message : String(error)}`, 'ERROR');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }

  /**
   * Handle search requests
   * @param searchParams URL search parameters
   * @param res HTTP response
   */
  private async handleSearchRequest(
    searchParams: URLSearchParams,
    res: ServerResponse
  ): Promise<void> {
    const query = searchParams.get('q');
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit') as string, 10)
      : this.MAX_RESULTS;
    const safeSearch = searchParams.get('safe') || this.SAFE_SEARCH;

    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing query parameter' }));
      return;
    }

    try {
      this.log(`Performing search: ${query}`);

      // In a real implementation, this would call the DuckDuckGo API
      // For now, we'll simulate search results
      const results = await this.simulateSearch(query, limit, safeSearch);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          query,
          results,
          meta: {
            resultCount: results.length,
            safeSearch,
            region: this.REGION,
          },
        })
      );
    } catch (error) {
      this.log(`Search error: ${error instanceof Error ? error.message : String(error)}`, 'ERROR');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to perform search' }));
    }
  }

  /**
   * Handle status requests
   * @param res HTTP response
   */
  private handleStatusRequest(res: ServerResponse): void {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: this.getStatus(),
        server: this.config.name,
        version: '1.0.0',
        time: new Date().toISOString(),
      })
    );
  }

  /**
   * Simulate DuckDuckGo search results
   * In a real implementation, this would call the DuckDuckGo API
   * @param query Search query
   * @param limit Maximum number of results
   * @param safeSearch Safe search level
   * @returns Array of search results
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async simulateSearch(query: string, _limit: number, _safeSearch: string): Promise<any[]> {
    // Enforce limit
    const actualLimit = Math.min(Math.max(1, _limit), this.MAX_RESULTS);

    // Generate fake results based on the query
    // In a real implementation, you would call the actual DuckDuckGo API

    return Array.from({ length: actualLimit }, (_, i) => ({
      title: `Result ${i + 1} for "${query}"`,
      url: `https://example.com/result-${i + 1}`,
      description: `This is a simulated search result for the query "${query}". This would contain a snippet of content from the webpage.`,
      position: i + 1,
      source: 'simulated',
    }));
  }

  /**
   * In a real implementation, this would call the DuckDuckGo API
   * @param query Search query
   * @param limit Maximum number of results
   * @param safeSearch Safe search level
   * @returns Search results
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async callDuckDuckGoApi(
    query: string,
    _limit: number,
    _safeSearch: string
  ): Promise<unknown> {
    try {
      // This is a simplified example and would need to be replaced with
      // the actual DuckDuckGo API integration in a production environment

      // For demo purposes, we're just showing how you might make an API call
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
      );

      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      this.log(
        `DuckDuckGo API error: ${error instanceof Error ? error.message : String(error)}`,
        'ERROR'
      );
      throw error;
    }
  }
}

export default DuckDuckGoServer;
