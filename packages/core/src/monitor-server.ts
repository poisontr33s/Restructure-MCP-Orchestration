import express from 'express';
import RateLimit from 'express-rate-limit';
import http from 'http';
import path from 'path';
import { OrchestrationHub } from './orchestration-hub';
import { createLogger } from './logger';

// Create logger instance
const logger = createLogger('monitor-server');

/**
 * Monitor Server options
 */
export interface MonitorServerOptions {
  port?: number;
  staticDir?: string;
}

/**
 * Monitor Server class
 * Provides a web-based dashboard and API for monitoring MCP servers
 */
export class MonitorServer {
  private app: express.Application;
  private server: http.Server | null = null;
  private port: number;
  private staticDir: string;

  /**
   * Constructor
   * @param orchestrationHub - The orchestration hub instance
   * @param options - Monitor server options
   */
  constructor(
    private orchestrationHub: OrchestrationHub,
    options: MonitorServerOptions = {}
  ) {
    this.port = options.port || 8080;

    // Determine the static directory for the dashboard
    if (options.staticDir) {
      this.staticDir = options.staticDir;
    } else {
      // Default to the 'monitor' package's dist directory
      this.staticDir = path.resolve(process.cwd(), 'packages', 'monitor', 'dist');
    }

    // Create Express app
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Start the monitor server
   */
  public async start(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server = this.app.listen(this.port, () => {
        logger.info(`Monitor server started on port ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Stop the monitor server
   */
  public async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close(() => {
        logger.info('Monitor server stopped');
        this.server = null;
        resolve();
      });
    });
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // JSON body parser
    this.app.use(express.json());

    // CORS middleware
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }

      next();
    });

    // Logging middleware
    this.app.use((req, res, next) => {
      logger.debug(`${req.method} ${req.url}`);
      next();
    });
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    // API routes
    const apiRouter = express.Router();

    // Get full status
    apiRouter.get('/status', (req, res) => {
      const status = this.orchestrationHub.getFullStatus();
      res.json(status);
    });

    // Get servers
    apiRouter.get('/servers', (req, res) => {
      const status = this.orchestrationHub.getFullStatus();
      res.json(status.servers);
    });

    // Start server
    apiRouter.post('/servers/:type/start', async (req, res) => {
      try {
        const serverType = req.params.type;
        // Need to find the config for this server type
        const status = this.orchestrationHub.getFullStatus();
        const server = status.servers.find((s) => s.type === serverType);

        if (!server) {
          res.status(404).json({ error: `Server type ${serverType} not found` });
          return;
        }

        // This would call the orchestration hub's startServer method
        // await this.orchestrationHub.startServer(...);

        res.json({ success: true, message: `Server ${serverType} is starting` });
      } catch (error) {
        logger.error(
          `Error starting server: ${error instanceof Error ? error.message : String(error)}`
        );
        res.status(500).json({
          error: 'Failed to start server',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Stop server
    apiRouter.post('/servers/:type/stop', async (req, res) => {
      try {
        const serverType = req.params.type;
        // This would call the orchestration hub's stopServer method
        // await this.orchestrationHub.stopServer(serverType);

        res.json({ success: true, message: `Server ${serverType} is stopping` });
      } catch (error) {
        logger.error(
          `Error stopping server: ${error instanceof Error ? error.message : String(error)}`
        );
        res.status(500).json({
          error: 'Failed to stop server',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Health check
    apiRouter.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Register API router
    this.app.use('/api', apiRouter);

    // Serve static files
    this.app.use(express.static(this.staticDir));

    // Fallback route for SPA (Single Page Application)
    const fallbackRateLimiter = RateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // max 100 requests per windowMs
    });
    this.app.get('*', fallbackRateLimiter, (req, res) => {
      res.sendFile(path.join(this.staticDir, 'index.html'));
    });
  }
}

export default MonitorServer;
