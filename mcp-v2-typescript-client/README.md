# MCP v2 TypeScript Client

> **Universal TypeScript client library for MCP v2 protocol**

## Overview

The MCP v2 TypeScript client provides a comprehensive, type-safe way to interact with MCP v2 servers across multiple transport protocols. It features intelligent context management, automatic reconnection, caching, and built-in monitoring.

## Features

🚀 **Multiple Transports**: HTTP JSON-RPC, WebSocket, gRPC  
🧠 **Context-Aware**: Automatic context management and session handling  
🔄 **Intelligent Reconnection**: Exponential backoff with configurable retry policies  
📊 **Built-in Metrics**: Performance monitoring and analytics  
🛡️ **Type Safety**: Full TypeScript support with Zod validation  
⚡ **Streaming Support**: Real-time bidirectional communication  
🗄️ **Caching**: Redis-backed caching for improved performance  
🔧 **Extensible**: Plugin architecture for custom capabilities

## Installation

```bash
npm install @mcp-v2/typescript-client
# or
pnpm add @mcp-v2/typescript-client
# or
yarn add @mcp-v2/typescript-client
```

## Quick Start

### Basic HTTP Client

```typescript
import { createHTTPClient } from '@mcp-v2/typescript-client';

const client = createHTTPClient('http://localhost:3000/mcp');

await client.connect();

// Execute a tool
const result = await client.executeTool('calculator', {
  operation: 'add',
  a: 5,
  b: 3,
});

console.log(result); // { result: 8 }

await client.disconnect();
```

### WebSocket Client with Reconnection

```typescript
import { createWebSocketClient } from '@mcp-v2/typescript-client';

const client = createWebSocketClient('ws://localhost:3000/mcp', {
  reconnect: {
    enabled: true,
    maxAttempts: 10,
    backoffMs: 1000,
    exponential: true,
  },
  logging: {
    level: 'info',
    format: 'json',
  },
});

// Handle connection events
client.on('connected', () => {
  console.log('Connected to MCP server');
});

client.on('error', (error) => {
  console.error('MCP error:', error);
});

await client.connect();
```

### Production Client with Caching

```typescript
import { createProductionClient } from '@mcp-v2/typescript-client';

const client = createProductionClient('https://api.example.com/mcp', {
  redis: {
    host: 'localhost',
    port: 6379,
    password: 'your-redis-password',
  },
  metrics: {
    endpoint: 'https://metrics.example.com',
    interval: 30000,
  },
  auth: {
    type: 'bearer',
    credentials: { token: 'your-api-token' },
  },
});

await client.connect();
```

## API Reference

### Client Factory Functions

#### `createMCPClient(options: MCPClientOptions): MCPClient`

Creates a fully configured MCP client with custom options.

#### `createHTTPClient(url: string, options?: Partial<MCPClientOptions>): MCPClient`

Creates an HTTP JSON-RPC client.

#### `createWebSocketClient(url: string, options?: Partial<MCPClientOptions>): MCPClient`

Creates a WebSocket client with real-time capabilities.

#### `createGRPCClient(url: string, options?: Partial<MCPClientOptions>): MCPClient`

Creates a high-performance gRPC client.

#### `createCachedClient(transport, redis, options?): MCPClient`

Creates a client with Redis caching enabled.

#### `createProductionClient(url, config, options?): MCPClient`

Creates a production-ready client with full monitoring.

### MCPClient Interface

#### Connection Management

```typescript
await client.connect();
await client.disconnect();
const isConnected = client.isConnected();
const state = client.getConnectionState();
```

#### Tool Execution

```typescript
const result = await client.executeTool('tool-name', {
  param1: 'value1',
  param2: 42,
});
```

#### Resource Management

```typescript
const resource = await client.getResource('file://path/to/file');
const resources = await client.listResources();
```

#### Context Management

```typescript
await client.updateContext({
  workspace: {
    id: 'my-workspace',
    name: 'My Project',
    path: '/path/to/project',
  },
});

const context = client.getContext();
```

#### Streaming

```typescript
for await (const item of client.stream('watch-files', { pattern: '**/*.ts' })) {
  console.log('File changed:', item);
}
```

#### Utilities

```typescript
const latency = await client.ping();
const serverInfo = await client.getServerInfo();
const capabilities = await client.getCapabilities();
```

### Event Handling

```typescript
client.on('connected', () => console.log('Connected'));
client.on('disconnected', (reason) => console.log('Disconnected:', reason));
client.on('reconnecting', (attempt) => console.log('Reconnecting...', attempt));
client.on('error', (error) => console.error('Error:', error));
client.on('message', (message) => console.log('Message:', message));
client.on('contextUpdate', (context) => console.log('Context updated:', context));
```

## Configuration

### Transport Options

```typescript
{
  transport: {
    type: 'http' | 'websocket' | 'grpc',
    url: 'protocol://host:port/path',
    options: {
      timeout: 30000,
      retries: 3,
      compression: true,
      authentication: {
        type: 'bearer' | 'basic' | 'api-key' | 'oauth2',
        credentials: { token: 'your-token' }
      },
      tls: {
        enabled: true,
        cert: '/path/to/cert.pem',
        key: '/path/to/key.pem',
        ca: '/path/to/ca.pem'
      }
    }
  }
}
```

### Reconnection Options

```typescript
{
  reconnect: {
    enabled: true,
    maxAttempts: 5,
    backoffMs: 1000,
    exponential: true
  }
}
```

### Caching Options

```typescript
{
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    redis: {
      host: 'localhost',
      port: 6379,
      password: 'optional-password',
      db: 0
    }
  }
}
```

### Logging Options

```typescript
{
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error',
    transport: 'console' | 'file' | 'remote',
    format: 'json' | 'text'
  }
}
```

### Metrics Options

```typescript
{
  metrics: {
    enabled: true,
    endpoint: 'https://metrics.example.com',
    interval: 30000
  }
}
```

## Error Handling

The client provides typed error classes for different scenarios:

```typescript
import {
  MCPError,
  MCPConnectionError,
  MCPTimeoutError,
  MCPValidationError,
} from '@mcp-v2/typescript-client';

try {
  await client.request('some-method');
} catch (error) {
  if (error instanceof MCPConnectionError) {
    console.error('Connection failed:', error.message);
  } else if (error instanceof MCPTimeoutError) {
    console.error('Request timed out:', error.message);
  } else if (error instanceof MCPValidationError) {
    console.error('Validation failed:', error.message);
  } else if (error instanceof MCPError) {
    console.error('MCP error:', error.code, error.message);
  }
}
```

## Advanced Usage

### Custom Request Options

```typescript
const result = await client.request(
  'method-name',
  {
    param: 'value',
  },
  {
    timeout: 10000,
    retries: 5,
    priority: 'high',
    cache: false,
    traceId: 'custom-trace-id',
  }
);
```

### Batch Requests

```typescript
// Note: Batch support is planned for future versions
const batch = await client.batch([
  { method: 'tool1', params: { a: 1 } },
  { method: 'tool2', params: { b: 2 } },
]);
```

### Custom Context

```typescript
const client = createMCPClient({
  transport: { type: 'http', url: 'http://localhost:3000' },
  context: {
    workspace: {
      id: 'my-workspace',
      name: 'My Project',
      type: 'typescript',
    },
    environment: {
      platform: 'node',
      version: '18.0.0',
      capabilities: ['fs', 'network', 'crypto'],
    },
  },
});
```

## Integration Examples

### Express.js Middleware

```typescript
import express from 'express';
import { createHTTPClient } from '@mcp-v2/typescript-client';

const app = express();
const mcpClient = createHTTPClient('http://localhost:3001/mcp');

app.use(async (req, res, next) => {
  req.mcp = mcpClient;
  next();
});

app.get('/api/tools/:name', async (req, res) => {
  try {
    const result = await req.mcp.executeTool(req.params.name, req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### React Hook

```typescript
import { useEffect, useState } from 'react';
import { createWebSocketClient, MCPClient } from '@mcp-v2/typescript-client';

export function useMCPClient(url: string) {
  const [client, setClient] = useState<MCPClient | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const mcpClient = createWebSocketClient(url);

    mcpClient.on('connected', () => setConnected(true));
    mcpClient.on('disconnected', () => setConnected(false));

    mcpClient.connect();
    setClient(mcpClient);

    return () => {
      mcpClient.disconnect();
    };
  }, [url]);

  return { client, connected };
}
```

## TypeScript Support

The library is built with TypeScript and provides full type safety:

```typescript
import type { MCPClient, MCPContext, ServerInfo, ToolDefinition } from '@mcp-v2/typescript-client';

// Type-safe tool execution
interface CalculatorParams {
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  a: number;
  b: number;
}

interface CalculatorResult {
  result: number;
}

const result = await client.executeTool<CalculatorResult>('calculator', {
  operation: 'add',
  a: 5,
  b: 3,
} as CalculatorParams);

console.log(result.result); // TypeScript knows this is a number
```

## Development

### Building

```bash
pnpm install
pnpm build
```

### Testing

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

### Type Checking

```bash
pnpm typecheck
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run type checking and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [MCP v2 Protocol Spec](../mcp-v2-protocol-spec/README.md)
- Issues: [GitHub Issues](https://github.com/your-org/mcp-v2-orchestration/issues)
- Discussions: [GitHub Discussions](https://github.com/your-org/mcp-v2-orchestration/discussions)
