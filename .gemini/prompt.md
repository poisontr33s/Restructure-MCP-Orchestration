# Gemini Code Assist - Custom Prompts

> _AI prompt customization for Captain Guthilda's MCP Orchestration System_

## Overview

This file defines custom prompts and AI behavior patterns for Gemini Code Assist when working within the MCP Orchestration System. These prompts ensure AI-generated code follows Captain Guthilda's patterns and integrates seamlessly with the existing architecture.

## 🎯 Base Context Prompt

```
You are working within Captain Guthilda's MCP Orchestration System, a sophisticated meta-automation platform that coordinates multiple AI services and workflows.

Key principles:
- Follow Captain Guthilda's unified orchestration patterns
- Use TypeScript with strict typing
- Implement proper error handling and logging
- Follow monorepo best practices with pnpm
- Integrate with existing AI service patterns
- Maintain security best practices for API keys and credentials
- Use the established configuration hierarchy
```

## 🤖 Service Integration Prompts

### For AI Service Implementation

````
When implementing AI service integrations:

1. Extend BaseAIService class from @mcp/shared
2. Implement required methods: authenticate(), orchestrate(), cleanup()
3. Use proper TypeScript interfaces and zod validation
4. Follow the established error handling patterns
5. Integrate with Captain Guthilda's event system
6. Use environment variables for configuration
7. Implement proper logging with @mcp/shared logger

Example pattern:
```typescript
export class NewAIService extends BaseAIService {
  constructor(private config: ServiceConfig) {
    super('service-name', config);
  }

  async authenticate(): Promise<AuthResult> {
    // Implementation
  }
}
````

### For Workflow Implementation

````
When creating orchestration workflows:

1. Use the Workflow interface from @mcp/core
2. Implement proper state management
3. Handle async operations with proper error boundaries
4. Use Captain Guthilda's event emitter patterns
5. Implement cleanup and rollback mechanisms
6. Follow the established workflow lifecycle

Pattern:
```typescript
export class WorkflowName implements Workflow {
  async execute(context: WorkflowContext): Promise<WorkflowResult> {
    // Implementation with proper error handling
  }
}
````

## 🔧 Configuration Prompts

### Environment Configuration

````
When adding configuration options:

1. Define environment variables with GUTHILDA_ prefix
2. Use zod schemas for validation
3. Provide sensible defaults
4. Document all configuration options
5. Follow the hierarchical config pattern (env vars → config file → defaults)

Example:
```typescript
const ConfigSchema = z.object({
  enabled: z.boolean().default(false),
  apiKey: z.string().optional(),
  timeout: z.number().default(30000),
});
````

### Service Configuration

````
For service-specific configuration:

1. Add to guthilda.config.json under aiServices
2. Use consistent naming patterns
3. Include capability definitions
4. Specify authentication requirements
5. Define integration points

Structure:
```json
{
  "aiServices": {
    "serviceName": {
      "enabled": boolean,
      "endpoint": string,
      "capabilities": string[],
      "authentication": object
    }
  }
}
````

## 📝 Documentation Prompts

### README Generation

```
When generating README files:

1. Start with Captain Guthilda's emoji and title pattern
2. Include features section with specific capabilities
3. Provide clear installation and setup instructions
4. Show integration with Captain Guthilda commands
5. Include troubleshooting section
6. Reference official documentation
7. End with Captain Guthilda's signature quote pattern

Template structure:
# 🏴‍☠️ [Service Name] - [Brief Description]
## Features
## Installation
## Usage
## Configuration
## Integration with MCP System
## Troubleshooting
```

### Code Comments

```
For inline documentation:

1. Use JSDoc for public APIs
2. Include examples in documentation
3. Document complex orchestration logic
4. Explain AI service integration points
5. Reference Captain Guthilda patterns where applicable

Example:
/**
 * Orchestrates [service] integration following Captain Guthilda's patterns.
 *
 * @param workflow - Workflow configuration
 * @returns Promise resolving to orchestration results
 */
```

## 🧪 Testing Prompts

### Test Generation

````
When creating tests:

1. Use vitest as the testing framework
2. Follow AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies properly
4. Test error conditions and edge cases
5. Include integration tests for orchestration workflows
6. Use descriptive test names that explain behavior

Pattern:
```typescript
describe('ServiceName', () => {
  describe('authenticate', () => {
    it('should successfully authenticate with valid credentials', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
````

### Mock Implementation

```
For mocking AI services and external dependencies:

1. Create mock implementations that mirror real behavior
2. Use dependency injection for easier testing
3. Mock at the module level for consistent behavior
4. Provide configurable mock responses
5. Test both success and failure scenarios
```

## 🔐 Security Prompts

### API Key Management

````
For secure credential handling:

1. Never hardcode API keys or secrets
2. Use environment variables or secure vaults
3. Implement proper credential rotation
4. Log security events appropriately (without exposing secrets)
5. Follow least privilege principles
6. Use GitHub Secrets for CI/CD workflows

Pattern:
```typescript
const apiKey = process.env.GUTHILDA_SERVICE_API_KEY;
if (!apiKey) {
  throw new Error('API key not configured');
}
````

### Authentication Flows

```
When implementing authentication:

1. Use established authentication patterns
2. Handle token refresh automatically
3. Implement proper session management
4. Log authentication events
5. Handle authentication failures gracefully
6. Support multiple authentication methods where applicable
```

## 🎼 Orchestration Prompts

### Workflow Coordination

```
For workflow orchestration:

1. Use Captain Guthilda's unified command interface
2. Implement proper dependency management
3. Handle parallel and sequential execution
4. Provide progress reporting
5. Implement cleanup and rollback mechanisms
6. Support workflow chaining

Commands should follow pattern:
pnpm guthilda:[action] --[options]
```

### Event Handling

````
For event-driven architecture:

1. Use the established event emitter patterns
2. Define clear event schemas
3. Implement proper event filtering
4. Handle event ordering and dependencies
5. Provide event replay capabilities for debugging
6. Log important events for monitoring

Pattern:
```typescript
this.emit('service:event', {
  timestamp: Date.now(),
  data: eventData,
  context: workflowContext
});
````

## 🏴‍☠️ Captain Guthilda Integration

### Command Integration

````
When adding new commands:

1. Follow the established command structure
2. Integrate with existing workflow patterns
3. Provide status reporting
4. Support dry-run and verbose modes
5. Include help text and examples
6. Register commands in the main orchestrator

Example:
```typescript
export const commands = {
  'guthilda:service:action': {
    description: 'Description of what the command does',
    usage: 'pnpm guthilda:service:action [options]',
    handler: async (options) => { /* implementation */ }
  }
};
````

### Monitoring Integration

```
For system monitoring and health checks:

1. Implement health check endpoints
2. Provide metrics for monitoring
3. Use structured logging
4. Report service status to Captain Guthilda
5. Include performance metrics
6. Support debugging and diagnostics modes
```

## 💡 Code Generation Preferences

### Function Generation

```
When generating functions:
- Prefer async/await over Promises
- Include proper error handling
- Use TypeScript strict typing
- Add JSDoc documentation
- Follow established naming conventions
- Include parameter validation
```

### Class Generation

```
When generating classes:
- Extend appropriate base classes
- Implement required interfaces
- Use dependency injection
- Include proper lifecycle methods
- Add event emission where appropriate
- Follow Captain Guthilda's patterns
```

---

> _These prompts ensure Gemini Code Assist generates code that seamlessly integrates with Captain Guthilda's unified orchestration system while maintaining high quality and consistency standards._
