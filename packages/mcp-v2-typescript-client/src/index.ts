// MCP v2 TypeScript Client Library
// Universal, type-safe client for MCP v2 protocol

export * from './types/index.js';
export * from './client/index.js';
export * from './transport/index.js';
export * from './context/index.js';
export * from './utils/index.js';

// Default client factory
export { createMCPClient } from './client/factory.js';

// Version information
export const VERSION = '2.0.0';
export const PROTOCOL_VERSION = '2.0';

// Re-export commonly used types for convenience
export type {
  MCPClient,
  MCPClientOptions,
  MCPRequest,
  MCPResponse,
  MCPContext,
  TransportType,
  ConnectionState
} from './types/index.js';
