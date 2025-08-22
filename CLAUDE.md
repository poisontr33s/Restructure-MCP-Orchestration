# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Multi-Agent Arbitrage System

**IMPORTANT**: This repository operates with multiple AI agents (GPT-5/Copilot, Claude Code, Gemini CLI). Before any significant changes, consult `ARBITRAGE-BRIDGE.md` for:

- Cross-agent communication protocols
- Prerequisite thinking checkpoints  
- Systematic arbitrage decision framework
- Captain Guthilda's Sacred Laws (from `.github/copilot-instructions.md`)


## Unified Session State

This repository maintains a unified session state in `UNIFIED-SESSION-STATE.md` that consolidates multiple comprehensive Claude Code sessions into a single coherent context.

**Auto-Resume**: Always reference the unified session state for complete project context and continuity across fragmented sessions.

## Development Commands

### Primary Commands

- `pnpm dev` - Start development mode with hot reloading (uses Turbo for parallel execution)
- `pnpm build` - Build all packages (dependencies are built first due to Turbo configuration)
- `pnpm test` - Run all tests across packages
- `pnpm lint` - Run ESLint across all packages
- `pnpm format` - Format all code using Prettier

### Package Management (Critical)

- **ALWAYS use pnpm - NEVER use npm**
- If you see `package-lock.json` or rogue `node_modules`, delete them and run `pnpm install`
- Add dependencies to root for shared tools: `pnpm add -D <package>`
- Add package-specific dependencies: `pnpm add -D <package> --filter <package-folder>`

### MCP Orchestration System Commands

- `pnpm start` - Start the orchestration system (equivalent to `node packages/cli/dist/index.js start`)
- `mcp start` - CLI command to start the orchestration system
- `mcp status` - Check status of all MCP servers
- `mcp setup` - Interactive setup wizard

## Architecture Overview

This is a **monorepo** using PNPM workspaces and Turbo for build orchestration. The system provides centralized orchestration for Model Context Protocol (MCP) servers.

### Core Architecture Components

**OrchestrationHub** (`packages/core/src/orchestration-hub.ts`)

- Central management system for all MCP servers
- Handles server lifecycle (start, stop, health checks)
- Provides HTTP API for server management and monitoring
- Spawns server processes and manages their communication

**ServerManager** (`packages/core/src/server-manager.ts`)

- Registry pattern for server type management
- Handles server class registration and instantiation
- Dynamically creates server instances based on configuration

#### Monitor System

- React-based web dashboard (`packages/monitor/`)
- Real-time server status monitoring
- Built with Vite, TypeScript, and Tailwind CSS

### Package Structure

packages/
├── core/           # Core orchestration logic and server management
├── cli/            # Commander.js CLI with interactive commands
├── monitor/        # React dashboard for real-time monitoring
├── shared/         # Shared types, configuration, and utilities (Zod schemas)
└── servers/        # Individual MCP server implementations
    ├── base/               # Base server template
    ├── sequential-thinking/
    ├── duckduckgo/
    └── kraken/

### Key Patterns

#### Configuration Management

- Zod schemas in `packages/shared/src/types.ts` define all server and system types
- Default configuration in `packages/shared/src/config.ts`
- Server configurations include type, port, enabled status

#### Process Management

- Servers run as child processes spawned by OrchestrationHub
- Health checks via HTTP requests to `/status` endpoints
- Graceful shutdown with SIGTERM/SIGKILL fallback

#### Monorepo Dependencies

- Root `package.json` contains shared devDependencies (TypeScript, ESLint, Prettier, Turbo, Vitest)
- Package-specific dependencies only in their respective `package.json` files
- Cross-package imports use `@mcp/*` namespace aliases

## Critical Development Guidelines

### From Copilot Instructions

- All shared devDependencies and build tools live in root `package.json`
- Each package only contains unique dependencies
- Use Turbo for parallel builds and dependency management
- Never duplicate dependencies between root and packages unless different versions required
- Always clean up npm artifacts if they appear: delete `package-lock.json` and `node_modules`, then run `pnpm install`

### TypeScript Configuration

- Each package has its own `tsconfig.json`
- Build outputs to `dist/` directories
- Strong typing with Zod schemas for runtime validation

### Server Development

- New MCP servers go in `packages/servers/<server-type>/`
- Follow the pattern in existing servers (base, sequential-thinking, duckduckgo)
- Register new server types in `packages/core/src/bin/mcp.ts`
- Each server must implement a `/status` endpoint for health checks

### Build and Deployment

- Turbo handles build orchestration with dependency graphs
- CLI binary expects servers to be built in `packages/servers/<type>/dist/index.js`
- Monitor dashboard builds to static files that can be served

## Testing and Quality

- Tests run with Vitest
- ESLint configuration at repository root
- Prettier for code formatting with lint-staged pre-commit hooks
- Type checking with TypeScript compiler
