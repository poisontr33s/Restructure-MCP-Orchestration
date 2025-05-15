# MCP Orchestration System

A modern Orchestration System for Model Context Protocol (MCP) servers, designed for 2025.

## Overview

The MCP Orchestration System provides a centralized management platform for various MCP servers, including:

- Sequential Thinking MCP
- DuckDuckGo MCP
- Puppeteer MCP
- Memory Bank MCP
- GitHub MCP
- Knowledge Graph MCP
- Compass MCP
- Playwright MCP

The system is built using a modern TypeScript monorepo architecture, with clear separation of concerns and modular design.

## Features

- **Centralized Management**: Start, stop, and monitor all MCP servers from a single interface
- **Real-time Monitoring**: Dashboard for monitoring server status, system resources, and logs
- **Health Checks**: Automatic health checks and status updates for all servers
- **Modular Architecture**: Add new server types easily with a plugin-based architecture
- **TypeScript Support**: Full TypeScript support with strong typing
- **Modern Tooling**: ESLint, Prettier, Vite, Tailwind CSS, and more
- **CLI Support**: Command-line interface for server management

## Project Structure

The project is organized as a PNPM workspace with the following packages:

- **@mcp/core**: Core orchestration system and server management
- **@mcp/shared**: Shared types, utilities, and configuration
- **@mcp/monitor**: Modern React dashboard with Tailwind CSS
- **@mcp/cli**: Command-line interface for the orchestration system
- **@mcp/server-base**: Base server class for all MCP servers
- **@mcp/server-***: Individual server implementations

## Getting Started

### Prerequisites

- Node.js 18 or later
- PNPM 8 or later

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build all packages:

```bash
pnpm build
```

### Running the System

Start the complete system:

```bash
pnpm start
```

This will start the orchestration hub, all enabled MCP servers, and the monitor dashboard.

For development, you can use:

```bash
pnpm start:dev
```

This will run all packages in watch mode, allowing for real-time code updates.

### Accessing the Dashboard

Once the system is running, you can access the monitor dashboard at:

```
http://localhost:8080
```

## Using the CLI

The MCP Orchestration System includes a CLI for managing servers:

```bash
# Start the system
pnpm exec mcp start

# Check server status
pnpm exec mcp status

# Start a specific server
pnpm exec mcp server start sequential-thinking

# Stop a specific server
pnpm exec mcp server stop sequential-thinking

# Run interactive setup
pnpm exec mcp setup
```

## Developing New Servers

To create a new server implementation:

1. Create a new package in `packages/servers/your-server-name`
2. Extend the `BaseServer` class from `@mcp/server-base`
3. Implement the required methods
4. Register your server in the orchestration hub

See the existing server implementations for examples.

## License

MIT
