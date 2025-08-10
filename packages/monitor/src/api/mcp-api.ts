/**
 * API utilities for the MCP dashboard
 */

import type { FullStatus } from '@mcp/shared';

// API base URL
const API_BASE_URL = process.env.API_URL || 'http://localhost:8080/api';

/**
 * Fetch MCP system status
 */
export async function fetchStatus(): Promise<FullStatus> {
  const response = await fetch(`${API_BASE_URL}/status`);

  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Start an MCP server
 * @param serverType - The type of server to start
 */
export async function startServer(
  serverType: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/servers/${serverType}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to start server: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Stop an MCP server
 * @param serverType - The type of server to stop
 */
export async function stopServer(
  serverType: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/servers/${serverType}/stop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to stop server: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Restart an MCP server
 * @param serverType - The type of server to restart
 */
export async function restartServer(
  serverType: string
): Promise<{ success: boolean; message: string }> {
  await stopServer(serverType);
  return startServer(serverType);
}
