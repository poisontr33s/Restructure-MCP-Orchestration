# 🤖 Claude (Anthropic) Integration Guide

> _Integrating Anthropic's Claude AI with Captain Guthilda's MCP Orchestration System_

## Overview

Claude is Anthropic's AI assistant designed for safe, beneficial AI interactions. This guide covers integration with the MCP Orchestration System, emphasizing security best practices, ethical AI usage, and seamless workflow automation.

## 🚀 Quick Start

### Prerequisites

- Anthropic API account and API key
- VS Code or supported development environment
- Node.js 18+ and pnpm package manager
- Access to MCP Orchestration System

### Installation & Setup

1. **Install Claude Integration**

   ```bash
   # Install Claude SDK
   pnpm add @anthropic-ai/sdk

   # Configure Captain Guthilda for Claude
   pnpm guthilda:configure --provider=claude
   ```

2. **Secure API Key Setup**

   ```bash
   # NEVER store API keys in code or version control
   # Use environment variables or secure key management

   # For local development (.env.local - add to .gitignore)
   echo "GUTHILDA_CLAUDE_API_KEY=your_api_key_here" >> .env.local

   # For production - use secure secret management
   # GitHub Actions: Repository Settings > Secrets
   # AWS: AWS Secrets Manager
   # Azure: Azure Key Vault
   # GCP: Secret Manager
   ```

3. **Verify Integration**

   ```bash
   # Test Claude connection
   pnpm guthilda:status --provider=claude

   # Run health check
   pnpm guthilda:health --ai=claude
   ```

## 🔐 Security Best Practices

### API Key Management

**❌ NEVER DO THIS:**

```typescript
// DON'T hardcode API keys
const apiKey = 'sk-ant-api03-...'; // SECURITY RISK!

// DON'T commit keys to git
const config = {
  claudeApiKey: 'sk-ant-api03-...', // WILL BE EXPOSED!
};
```

**✅ SECURE APPROACH:**

```typescript
// Use environment variables
const apiKey = process.env.GUTHILDA_CLAUDE_API_KEY;
if (!apiKey) {
  throw new Error('Claude API key not configured');
}

// Validate key format
if (!apiKey.startsWith('sk-ant-api')) {
  throw new Error('Invalid Claude API key format');
}
```

### GitHub Secrets Configuration

1. **Add Secrets to Repository**

   ```
   Repository Settings > Secrets and variables > Actions

   Add new repository secrets:
   - CLAUDE_API_KEY: Your Anthropic API key
   - GUTHILDA_CLAUDE_ORG_ID: Your organization ID (if applicable)
   ```

2. **Use in GitHub Actions**

   ```yaml
   # .github/workflows/claude-integration.yml
   name: Claude AI Integration

   on:
     pull_request:
       branches: [main]

   jobs:
     claude-review:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Setup Claude Integration
           env:
             GUTHILDA_CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
             GUTHILDA_CLAUDE_ORG_ID: ${{ secrets.GUTHILDA_CLAUDE_ORG_ID }}
           run: |
             pnpm guthilda:auth --provider=claude
             pnpm guthilda:review --ai=claude --secure
   ```

### Rate Limiting and Quotas

```typescript
// Implement proper rate limiting
const claudeConfig = {
  maxRequestsPerMinute: 50,
  maxTokensPerDay: 100000,
  retryConfig: {
    maxRetries: 3,
    backoffBase: 1000,
    backoffMultiplier: 2,
  },
};

// Monitor usage and implement circuit breakers
class ClaudeService extends BaseAIService {
  private rateLimiter = new RateLimiter(claudeConfig.maxRequestsPerMinute);

  async makeRequest(prompt: string): Promise<Response> {
    await this.rateLimiter.acquire();

    try {
      return await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      });
    } catch (error) {
      if (error.status === 429) {
        // Handle rate limiting
        await this.backoff();
        throw new RetryableError('Rate limit exceeded');
      }
      throw error;
    }
  }
}
```

## 🔧 Configuration

### Captain Guthilda Integration

```json
{
  "aiServices": {
    "claude": {
      "enabled": true,
      "model": "claude-3-sonnet-20240229",
      "maxTokens": 4096,
      "temperature": 0.1,
      "capabilities": ["code-review", "documentation", "analysis", "refactoring"],
      "security": {
        "sanitizeInputs": true,
        "validateOutputs": true,
        "logInteractions": false,
        "enableAuditTrail": true
      }
    }
  },
  "workflows": {
    "claude": {
      "codeReview": {
        "enabled": true,
        "triggerOnPR": true,
        "focusAreas": ["security", "performance", "maintainability"]
      },
      "documentation": {
        "enabled": true,
        "autoGenerate": false,
        "reviewLevel": "thorough"
      }
    }
  }
}
```

### Environment Configuration

```bash
# Claude API Configuration
GUTHILDA_CLAUDE_ENABLED=true
GUTHILDA_CLAUDE_API_KEY=sk-ant-api03-your-key-here
GUTHILDA_CLAUDE_MODEL=claude-3-sonnet-20240229
GUTHILDA_CLAUDE_MAX_TOKENS=4096
GUTHILDA_CLAUDE_TEMPERATURE=0.1

# Security Settings
GUTHILDA_CLAUDE_AUDIT_ENABLED=true
GUTHILDA_CLAUDE_LOG_LEVEL=INFO
GUTHILDA_CLAUDE_SANITIZE_INPUTS=true

# Integration Settings
GUTHILDA_CLAUDE_AUTO_REVIEW=false
GUTHILDA_CLAUDE_WORKFLOW_TIMEOUT=300000
GUTHILDA_CLAUDE_RETRY_ATTEMPTS=3
```

## 🎯 Integration Commands

### Captain Guthilda Commands

```bash
# Service status and health
pnpm guthilda:status --provider=claude
pnpm guthilda:health --ai=claude

# Authentication and setup
pnpm guthilda:auth --provider=claude
pnpm guthilda:configure --ai=claude

# Code review and analysis
pnpm guthilda:review --ai=claude --files="src/**/*.ts"
pnpm guthilda:analyze --provider=claude --scope=security

# Documentation generation
pnpm guthilda:docs --ai=claude --output=docs/
pnpm guthilda:explain --provider=claude --function=complexAlgorithm

# Workflow orchestration
pnpm guthilda:orchestrate --workflow=claude-review
pnpm guthilda:workflow --name="security-audit" --ai=claude
```

### Direct Claude Integration

```typescript
// Example service implementation
import { Anthropic } from '@anthropic-ai/sdk';
import { BaseAIService } from '@mcp/shared';

export class ClaudeService extends BaseAIService {
  private client: Anthropic;

  constructor(config: ClaudeConfig) {
    super('claude', config);

    this.client = new Anthropic({
      apiKey: config.apiKey,
      maxRetries: 3,
      timeout: 30000,
    });
  }

  async reviewCode(code: string, context?: ReviewContext): Promise<ReviewResult> {
    const prompt = this.buildCodeReviewPrompt(code, context);

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4096,
        temperature: 0.1,
      });

      return this.parseReviewResponse(response);
    } catch (error) {
      this.logger.error('Claude code review failed', { error, code: code.slice(0, 100) });
      throw new ServiceError('Code review failed', error);
    }
  }

  private buildCodeReviewPrompt(code: string, context?: ReviewContext): string {
    return `
Please review this code following Captain Guthilda's standards:

${context?.guidelines || 'Focus on security, performance, and maintainability.'}

Code to review:
\`\`\`typescript
${code}
\`\`\`

Please provide:
1. Security issues and recommendations
2. Performance optimizations
3. Code quality improvements
4. Integration with MCP patterns
5. Documentation suggestions
    `;
  }
}
```

## 📋 Workflow Documentation

### Code Review Workflow

```yaml
# .github/workflows/claude-code-review.yml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'packages/**/*.ts'
      - 'packages/**/*.js'

jobs:
  claude-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Claude code review
        env:
          GUTHILDA_CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # Get changed files
          git diff --name-only origin/main...HEAD > changed-files.txt

          # Run Claude review on changed files
          pnpm guthilda:review \
            --ai=claude \
            --files-from=changed-files.txt \
            --output=review-results.md \
            --pr-comment=true

      - name: Upload review results
        uses: actions/upload-artifact@v4
        with:
          name: claude-review-results
          path: review-results.md
```

### Documentation Generation

```bash
# Generate comprehensive documentation
pnpm guthilda:docs --ai=claude --comprehensive

# Generate API documentation
pnpm guthilda:docs --ai=claude --type=api --package=@mcp/core

# Generate troubleshooting guides
pnpm guthilda:docs --ai=claude --type=troubleshooting --interactive
```

## 🛠️ Advanced Features

### Custom Prompt Engineering

```typescript
// Advanced prompt configuration
const claudePrompts = {
  codeReview: {
    systemPrompt: `You are a senior software engineer reviewing code for Captain Guthilda's MCP Orchestration System. Focus on:
    
    1. Security vulnerabilities and best practices
    2. Performance implications
    3. Integration with existing MCP patterns
    4. TypeScript type safety
    5. Error handling and logging
    6. Documentation completeness`,

    userPromptTemplate: `
    Review this {{fileType}} file from the {{packageName}} package:
    
    Context: {{context}}
    
    Code:
    \`\`\`{{language}}
    {{code}}
    \`\`\`
    
    Please provide detailed feedback following the style guide.
    `,
  },

  documentation: {
    systemPrompt: `Generate comprehensive documentation following Captain Guthilda's patterns and the established documentation style.`,

    focusAreas: [
      'API endpoints and usage',
      'Configuration options',
      'Integration examples',
      'Troubleshooting guides',
      'Security considerations',
    ],
  },
};
```

### Integration Monitoring

```typescript
// Monitor Claude integration health
export class ClaudeMonitor {
  private metrics = new MetricsCollector();

  async healthCheck(): Promise<HealthStatus> {
    try {
      const startTime = Date.now();

      // Test basic API connectivity
      const response = await this.claude.messages.create({
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 10,
      });

      const responseTime = Date.now() - startTime;

      this.metrics.record('claude.response_time', responseTime);
      this.metrics.increment('claude.health_check.success');

      return {
        status: 'healthy',
        responseTime,
        model: 'claude-3-sonnet-20240229',
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      this.metrics.increment('claude.health_check.failure');
      this.logger.error('Claude health check failed', { error });

      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date().toISOString(),
      };
    }
  }
}
```

## 📚 Official Resources

- **Anthropic Claude Documentation**: [docs.anthropic.com](https://docs.anthropic.com/)
- **Claude API Reference**: [docs.anthropic.com/claude/reference](https://docs.anthropic.com/claude/reference)
- **Safety and Usage Guidelines**: [docs.anthropic.com/claude/docs/safety-best-practices](https://docs.anthropic.com/claude/docs/safety-best-practices)
- **Rate Limits and Pricing**: [docs.anthropic.com/claude/docs/rate-limits](https://docs.anthropic.com/claude/docs/rate-limits)
- **SDK Documentation**: [github.com/anthropics/anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript)

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication Errors**

   ```bash
   # Check API key configuration
   echo $GUTHILDA_CLAUDE_API_KEY | grep -o "^sk-ant-api.*"

   # Test connection
   pnpm guthilda:auth --provider=claude --test
   ```

2. **Rate Limiting**

   ```typescript
   // Monitor and handle rate limits
   if (error.status === 429) {
     const retryAfter = error.headers['retry-after'];
     await sleep(retryAfter * 1000);
     return this.retry(request);
   }
   ```

3. **Token Limits**

   ```bash
   # Check token usage
   pnpm guthilda:usage --provider=claude --period=daily

   # Optimize prompts
   pnpm guthilda:optimize --ai=claude --prompts
   ```

### Debug Mode

```bash
# Enable detailed logging
export GUTHILDA_LOG_LEVEL=DEBUG
export GUTHILDA_CLAUDE_DEBUG=true

# Run with verbose output
pnpm guthilda:status --provider=claude --verbose

# Generate debug report
pnpm guthilda:debug --ai=claude > claude-debug.json
```

## 🏴‍☠️ Captain Guthilda Integration

This Claude integration follows Captain Guthilda's unified orchestration patterns:

- **Security-First Approach**: Enterprise-grade credential management and audit trails
- **Unified Command Interface**: Consistent commands across all AI services
- **Workflow Orchestration**: Automated task coordination and dependency management
- **Monitoring and Health Checks**: Comprehensive system health tracking
- **Configuration Management**: Hierarchical configuration with environment overrides

### Integration with Existing Services

```typescript
// Multi-AI workflow coordination
export class MultiAIOrchestrator {
  async performComprehensiveReview(code: string): Promise<ReviewResult> {
    const results = await Promise.allSettled([
      this.claude.reviewCode(code, { focus: 'security' }),
      this.gemini.reviewCode(code, { focus: 'performance' }),
      this.openai.reviewCode(code, { focus: 'maintainability' }),
    ]);

    return this.synthesizeResults(results);
  }
}
```

For more information, see the [Captain Guthilda Unified Guide](docs/CAPTAIN_GUTHILDA_UNIFIED_GUIDE.md).

---

> _"Secure AI integration is not just about protecting keys—it's about building trust through transparency, monitoring, and responsible usage."_ — Captain Guthilda
