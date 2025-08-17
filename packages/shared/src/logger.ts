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
class Logger {
  private logLevel: LogLevel = 'INFO';

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Check if a level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex <= currentIndex;
  }

  /**
   * Format a log message
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  /**
   * Log an error message
   */
  error(message: string): void {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message));
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string): void {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message));
    }
  }

  /**
   * Log an info message
   */
  info(message: string): void {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage('INFO', message));
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string): void {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage('DEBUG', message));
    }
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();
