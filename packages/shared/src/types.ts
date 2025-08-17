import { z } from 'zod';

/**
 * Server type enumeration
 */
export const ServerType = z.enum([
  'sequential-thinking',
  'duckduckgo',
  'puppeteer',
  'memory-bank',
  'github',
  'knowledge-graph-memory',
  'compass',
  'playwright',
  'm365-graph',
  'm365-teams',
  'm365-outlook',
  'm365-sharepoint',
  'm365-onedrive',
]);

export type ServerType = z.infer<typeof ServerType>;

/**
 * Server status type
 */
export const ServerStatus = z.enum([
  'starting',
  'running',
  'error',
  'stopped',
  'not responding',
  'timeout',
]);

export type ServerStatus = z.infer<typeof ServerStatus>;

/**
 * Server configuration schema
 */
export const ServerConfig = z.object({
  name: z.string(),
  type: ServerType,
  port: z.number().int().positive(),
  enabled: z.boolean().default(true),
});

export type ServerConfig = z.infer<typeof ServerConfig>;

/**
 * Server info schema
 */
export const ServerInfo = z.object({
  config: ServerConfig,
  status: ServerStatus,
  startTime: z.date().optional(),
  process: z.any().optional(), // Can't strongly type the Node.js process
  pid: z.number().int().positive().optional(),
  port: z.number().int().positive(),
});

export type ServerInfo = z.infer<typeof ServerInfo>;

/**
 * System info schema
 */
export const SystemInfo = z.object({
  hostname: z.string(),
  platform: z.string(),
  uptime: z.number(),
  memory: z.object({
    total: z.number(),
    free: z.number(),
  }),
  cpus: z.number().int().positive(),
});

export type SystemInfo = z.infer<typeof SystemInfo>;

/**
 * Full status schema
 */
export const FullStatus = z.object({
  timestamp: z.string(),
  servers: z.array(
    z.object({
      name: z.string(),
      type: ServerType,
      port: z.number().int().positive(),
      status: ServerStatus,
      uptime: z.number().optional(),
      pid: z.number().int().positive().optional(),
    })
  ),
  system: SystemInfo,
});

export type FullStatus = z.infer<typeof FullStatus>;
