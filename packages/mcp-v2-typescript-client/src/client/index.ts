/**
 * MCP v2 Client Module
 * Exports all client-related functionality
 */

export * from './factory.js';
export * from './base.js';

// Re-export key types for convenience
export type { MCPClient, MCPClientOptions } from '../types/index.js';
