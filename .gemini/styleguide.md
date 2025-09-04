# MCP Orchestration System - Code Style Guide

> _Style preferences for Gemini Code Assist in the MCP Orchestration System_

## Overview

This style guide defines coding standards and preferences for the MCP Orchestration System to ensure Gemini Code Assist provides consistent, high-quality suggestions aligned with our project's architecture and Captain Guthilda's patterns.

## 🎯 Code Style Preferences

### TypeScript/JavaScript Standards

- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, double quotes for JSX
- **Trailing Commas**: Always in multiline structures
- **Line Length**: 100 characters maximum

```typescript
// Preferred
export interface GuthildaConfig {
  aiServices: {
    gemini: GeminiConfig;
    openai: OpenAIConfig;
  };
  orchestration: OrchestrationConfig;
}

// Avoid
export interface GuthildaConfig {
  aiServices: {
    gemini: GeminiConfig;
    openai: OpenAIConfig;
  };
  orchestration: OrchestrationConfig;
}
```

### Naming Conventions

- **Variables/Functions**: camelCase (`getUserConfig`, `apiKey`)
- **Classes**: PascalCase (`GuthildaOrchestrator`, `MCPServer`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_TIMEOUT`, `API_VERSION`)
- **Files**: kebab-case (`user-config.ts`, `mcp-server.ts`)
- **Directories**: kebab-case (`packages/guthilda`, `scripts/automation`)

### Import Organization

```typescript
// External libraries first
import { z } from 'zod';
import express from 'express';

// Internal modules by scope
import { MCPOrchestrator } from '@mcp/core';
import { GuthildaConfig } from '@mcp/shared';

// Relative imports last
import { validateConfig } from './validation';
import type { LocalConfig } from '../types';
```

## 🏗️ Architecture Patterns

### Captain Guthilda Patterns

Follow established patterns for orchestration components:

```typescript
// Service Pattern
export class GeminiService extends BaseAIService {
  constructor(private config: GeminiConfig) {
    super('gemini', config);
  }

  async authenticate(): Promise<AuthResult> {
    // Implementation following Guthilda auth patterns
  }

  async orchestrate(workflow: Workflow): Promise<OrchestrationResult> {
    // Implementation following Guthilda orchestration patterns
  }
}
```

### Error Handling

Use consistent error handling across the system:

```typescript
// Preferred
try {
  const result = await geminiService.generateCode(prompt);
  return { success: true, data: result };
} catch (error) {
  logger.error('Gemini code generation failed', { error, prompt });
  return { success: false, error: error.message };
}

// Avoid bare throws or unhandled promises
```

### Configuration Patterns

Follow the established configuration hierarchy:

```typescript
// Environment variables
const config = {
  enabled: process.env.GUTHILDA_GEMINI_ENABLED === 'true',
  projectId: process.env.GUTHILDA_GEMINI_PROJECT_ID,
  region: process.env.GUTHILDA_GEMINI_REGION || 'us-central1',
};

// Validation with zod
const GeminiConfigSchema = z.object({
  enabled: z.boolean(),
  projectId: z.string(),
  region: z.string(),
});
```

## 📦 Package Structure Preferences

### Monorepo Organization

```
packages/
├── guthilda/           # Main orchestrator
├── core/              # Core MCP functionality
├── shared/            # Shared utilities
└── servers/           # MCP server implementations
    ├── base/          # Base server classes
    └── gemini/        # Gemini-specific server (if needed)
```

### File Naming

- **Implementation files**: `*.ts`
- **Type definitions**: `*.types.ts`
- **Configuration**: `*.config.ts`
- **Tests**: `*.test.ts`
- **Examples**: `*.example.ts`

## 🧪 Testing Preferences

### Test Structure

```typescript
describe('GeminiService', () => {
  let service: GeminiService;
  let mockConfig: GeminiConfig;

  beforeEach(() => {
    mockConfig = createMockConfig();
    service = new GeminiService(mockConfig);
  });

  describe('authenticate', () => {
    it('should successfully authenticate with valid credentials', async () => {
      // Test implementation
    });

    it('should handle authentication errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

### Mock Preferences

- Use `vitest` mocking utilities
- Mock external dependencies at module level
- Prefer dependency injection for testability

## 📝 Documentation Standards

### JSDoc Comments

````typescript
/**
 * Orchestrates Gemini Code Assist integration with Captain Guthilda's system.
 *
 * @param workflow - The workflow configuration to execute
 * @param options - Additional orchestration options
 * @returns Promise resolving to orchestration results
 *
 * @example
 * ```typescript
 * const result = await orchestrator.execute(workflow, { timeout: 30000 });
 * if (result.success) {
 *   console.log('Orchestration completed:', result.data);
 * }
 * ```
 */
async execute(workflow: Workflow, options?: OrchestrationOptions): Promise<Result> {
  // Implementation
}
````

### README Structure

Follow the established pattern:

1. Title with emoji and brief description
2. Features section with bullet points
3. Installation instructions
4. Usage examples
5. Configuration options
6. API reference
7. Contributing guidelines

## 🔧 Tooling Preferences

### Linting and Formatting

- **ESLint**: Use project's `.eslintrc.json` configuration
- **Prettier**: Use project's `.prettierrc` configuration
- **TypeScript**: Strict mode enabled

### Build and Development

- **Build Tool**: `tsup` for library builds
- **Package Manager**: `pnpm` (never `npm`)
- **Bundler**: `turbo` for monorepo coordination

## 🎼 Orchestration Integration

### Command Patterns

Follow Captain Guthilda's command structure:

```bash
# Service-specific commands
pnpm guthilda:gemini:status
pnpm guthilda:gemini:auth
pnpm guthilda:gemini:configure

# Integrated workflow commands
pnpm guthilda:orchestrate --ai=gemini
pnpm guthilda:review --providers=gemini,openai
```

### Configuration Integration

Integrate with the unified configuration system:

```json
{
  "aiServices": {
    "gemini": {
      "enabled": true,
      "model": "gemini-pro",
      "capabilities": ["code-completion", "code-generation"]
    }
  }
}
```

## 🏴‍☠️ Captain Guthilda Patterns

### Logging

```typescript
import { logger } from '@mcp/shared';

logger.info('Gemini service initialized', {
  projectId: config.projectId,
  region: config.region,
});

logger.error('Gemini API call failed', {
  error: error.message,
  statusCode: error.status,
});
```

### Event Patterns

```typescript
// Follow the established event system
this.emit('gemini:authenticated', { userId, capabilities });
this.emit('gemini:error', { error, context });
```

---

> _These style preferences ensure Gemini Code Assist provides suggestions that align with Captain Guthilda's unified orchestration patterns and maintain consistency across the MCP ecosystem._
