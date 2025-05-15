import { z } from 'zod';

/**
 * Logger level schema
 */
export const LogLevel = z.enum(['ERROR', 'WARN', 'INFO', 'DEBUG']);
export type LogLevel = z.infer<typeof LogLevel>;

/**
 * Logger configuration schema
 */
export const LoggerConfig = z.object({
  level: LogLevel.default('INFO'),
  logDir: z.string().default('./logs'),
  logFile: z.string().default('combined.log'),
  console: z.boolean().default(true),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB
  maxFiles: z.number().default(5),
});

export type LoggerConfig = z.infer<typeof LoggerConfig>;

/**
 * Log entry schema
 */
export const LogEntry = z.object({
  timestamp: z.string(),
  level: LogLevel,
  service: z.string(),
  message: z.string(),
});

export type LogEntry = z.infer<typeof LogEntry>;
