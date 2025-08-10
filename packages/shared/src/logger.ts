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

/**
 * Simple logger implementation
 */
export class Logger {
  constructor(private service: string, private config: Partial<LoggerConfig> = {}) {
    this.config = { ...LoggerConfig.parse({}), ...config };
  }

  private log(level: LogLevel, message: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
    };

    if (this.config.console) {
      // Use appropriate console method based on level
      const consoleMethod = level === 'ERROR' ? 'error' : 
                           level === 'WARN' ? 'warn' : 
                           level === 'DEBUG' ? 'debug' : 'info';
      // eslint-disable-next-line no-console -- Logger console output
      console[consoleMethod](`[${entry.timestamp}] [${entry.level}] [${entry.service}] ${entry.message}`);
    }
  }

  info(message: string): void {
    this.log('INFO', message);
  }

  warn(message: string): void {
    this.log('WARN', message);
  }

  error(message: string): void {
    this.log('ERROR', message);
  }

  debug(message: string): void {
    this.log('DEBUG', message);
  }
}
