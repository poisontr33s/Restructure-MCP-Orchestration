import { type IncomingMessage, type ServerResponse } from 'http';
import { URL } from 'url';
import BaseServer from '@mcp/server-base';
import { type ServerConfig } from '@mcp/shared';

/**
 * Sequential Thinking MCP Server Implementation
 * This server helps break down complex problems into logical steps
 */
export class SequentialThinkingServer extends BaseServer {
  /**
   * Constructor
   * @param config Server configuration
   */
  constructor(config: ServerConfig) {
    super(config);
    this.log('Sequential Thinking MCP Server created');
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
      if (parsedUrl.pathname === '/breakdown' && req.method === 'POST') {
        this.handleBreakdownRequest(req, res);
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
   * Handle problem breakdown requests
   * @param req HTTP request
   * @param res HTTP response
   */
  private handleBreakdownRequest(req: IncomingMessage, res: ServerResponse): void {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        if (!data.problem) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing problem description' }));
          return;
        }

        this.log(`Breaking down problem: ${data.problem}`);

        // Generate sequential steps
        const steps = this.generateSteps(data.problem);

        const response = {
          problem: data.problem,
          steps: steps,
          createdAt: new Date().toISOString(),
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
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
   * Generate sequential steps for solving a problem
   * @param problem Problem description
   * @returns Array of steps
   */
  private generateSteps(problem: string): Array<{
    id: number;
    title: string;
    description: string;
    estimatedTime: string;
  }> {
    // In a real implementation, this would use more sophisticated logic
    // For now, we'll return a predefined set of steps

    return [
      {
        id: 1,
        title: 'Define the problem',
        description: `Clearly articulate what "${problem}" means and what solving it would look like.`,
        estimatedTime: '10-15 minutes',
      },
      {
        id: 2,
        title: 'Break down into components',
        description: 'Identify the major components or aspects of the problem.',
        estimatedTime: '20-30 minutes',
      },
      {
        id: 3,
        title: 'Research existing solutions',
        description: 'Look for how others have solved similar problems.',
        estimatedTime: '30-45 minutes',
      },
      {
        id: 4,
        title: 'Design solution approach',
        description: 'Outline a step-by-step approach to solving the problem.',
        estimatedTime: '45-60 minutes',
      },
      {
        id: 5,
        title: 'Implement solution',
        description: 'Execute the planned solution approach.',
        estimatedTime: '1-3 hours',
      },
      {
        id: 6,
        title: 'Test and validate',
        description: 'Verify that the solution actually solves the problem.',
        estimatedTime: '30-60 minutes',
      },
      {
        id: 7,
        title: 'Refine and optimize',
        description: 'Improve the solution based on testing results.',
        estimatedTime: '30-60 minutes',
      },
    ];
  }
}

export default SequentialThinkingServer;
