/**
 * Simple logger utility for session consciousness system
 */

export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export function getLogger(_service: string): Logger {
  return {
    info: (_message: string) => {
      // Silent logger for session consciousness
      // Can be enhanced with actual logging implementation
    },
    warn: (_message: string) => {
      // Silent logger for session consciousness
    },
    error: (_message: string) => {
      // Silent logger for session consciousness
    },
  };
}
