/**
 * MCP v2 Logger Utility
 * Configurable logging for MCP client
 */

export interface Logger {
  debug(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
}

export interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  transport?: 'console' | 'file' | 'remote';
  format?: 'json' | 'text';
}

export function createLogger(options?: LoggerOptions): Logger {
  return new ConsoleLogger(options?.level || 'info', options?.format || 'text');
}

class ConsoleLogger implements Logger {
  private levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(
    private level: 'debug' | 'info' | 'warn' | 'error',
    private format: 'json' | 'text'
  ) {}

  debug(message: string, meta?: Record<string, any>): void {
    if (this.levels.debug >= this.levels[this.level]) {
      this.log('debug', message, meta);
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    if (this.levels.info >= this.levels[this.level]) {
      this.log('info', message, meta);
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (this.levels.warn >= this.levels[this.level]) {
      this.log('warn', message, meta);
    }
  }

  error(message: string, meta?: Record<string, any>): void {
    if (this.levels.error >= this.levels[this.level]) {
      this.log('error', message, meta);
    }
  }

  private log(level: string, message: string, meta?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    
    if (this.format === 'json') {
      console.log(JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
      }));
    } else {
      const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
      console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
    }
  }
}
