import { z } from 'zod';
import { ServerConfig } from './types';

/**
 * Main configuration schema
 */
export const AppConfig = z.object({
  servers: z.array(ServerConfig),
  monitor: z.object({
    port: z.number().int().positive().default(8080),
    refreshInterval: z.number().int().positive().default(5000), // 5 seconds
  }),
  logger: z.object({
    level: z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG']).default('INFO'),
    logDir: z.string().default('./logs'),
    logFile: z.string().default('combined.log'),
  }),
  healthCheck: z.object({
    interval: z.number().int().positive().default(15000), // 15 seconds
    timeout: z.number().int().positive().default(5000), // 5 seconds
  }),
});

export type AppConfig = z.infer<typeof AppConfig>;

/**
 * Default configuration
 */
export const defaultConfig: AppConfig = {
  servers: [
    { name: 'Sequential Thinking MCP', type: 'sequential-thinking', port: 3000, enabled: true },
    { name: 'DuckDuckGo MCP', type: 'duckduckgo', port: 3001, enabled: true },
    { name: 'Puppeteer MCP', type: 'puppeteer', port: 3002, enabled: true },
    { name: 'Memory Bank MCP', type: 'memory-bank', port: 3003, enabled: true },
    { name: 'GitHub MCP', type: 'github', port: 3004, enabled: true },
    { name: 'Knowledge Graph MCP', type: 'knowledge-graph-memory', port: 3005, enabled: true },
    { name: 'Compass MCP', type: 'compass', port: 3007, enabled: true },
    { name: 'Playwright MCP', type: 'playwright', port: 3008, enabled: true },
    { name: 'Microsoft 365 Graph MCP', type: 'm365-graph', port: 3009, enabled: true },
    { name: 'Microsoft Teams MCP', type: 'm365-teams', port: 3010, enabled: true },
    { name: 'Microsoft Outlook MCP', type: 'm365-outlook', port: 3011, enabled: true },
    { name: 'Microsoft SharePoint MCP', type: 'm365-sharepoint', port: 3012, enabled: true },
    { name: 'Microsoft OneDrive MCP', type: 'm365-onedrive', port: 3013, enabled: true },
  ],
  monitor: {
    port: 8080,
    refreshInterval: 5000,
  },
  logger: {
    level: 'INFO',
    logDir: './logs',
    logFile: 'combined.log',
  },
  healthCheck: {
    interval: 15000,
    timeout: 5000,
  },
};
