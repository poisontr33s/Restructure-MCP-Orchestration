# 🤖 GPT (OpenAI) Integration Guide

> _Integrating OpenAI's GPT models with Captain Guthilda's MCP Orchestration System_

## Overview

OpenAI's GPT models provide powerful language understanding and generation capabilities. This guide covers secure integration with the MCP Orchestration System, emphasizing API key security, workflow automation, and best practices for production deployments.

## 🚀 Quick Start

### Prerequisites

- OpenAI API account and API key
- Organization ID (for team accounts)
- Node.js 18+ and pnpm package manager
- Access to MCP Orchestration System

### Installation & Setup

1. **Install OpenAI Integration**

   ```bash
   # Install OpenAI SDK
   pnpm add openai

   # Configure Captain Guthilda for OpenAI
   pnpm guthilda:configure --provider=openai
   ```

2. **Secure API Key Configuration**

   ```bash
   # CRITICAL: Never store API keys in code or commit to version control

   # Local development (.env.local - ensure it's in .gitignore)
   echo "GUTHILDA_OPENAI_API_KEY=sk-..." >> .env.local
   echo "GUTHILDA_OPENAI_ORG_ID=org-..." >> .env.local

   # Production environments - use secure secret management:
   # - GitHub Actions: Repository/Organization Secrets
   # - AWS: AWS Secrets Manager or Parameter Store
   # - Azure: Azure Key Vault
   # - GCP: Google Secret Manager
   # - Kubernetes: Sealed Secrets or External Secrets Operator
   ```

3. **Verify Integration**

   ```bash
   # Test OpenAI connection
   pnpm guthilda:status --provider=openai

   # Check quota and usage
   pnpm guthilda:usage --ai=openai
   ```

## 🔐 Security Best Practices

### API Key Management (CRITICAL)

**❌ NEVER DO THIS:**

```typescript
// SECURITY VIOLATION: Hardcoded API keys
const openai = new OpenAI({
  apiKey: 'sk-1234567890abcdef...', // EXPOSED IN CODE!
});

// SECURITY VIOLATION: Committed to git
const config = {
  openaiKey: 'sk-1234567890abcdef...', // WILL BE PUBLIC!
};

// SECURITY VIOLATION: Client-side exposure
window.OPENAI_KEY = 'sk-1234567890abcdef...'; // BROWSER ACCESSIBLE!
```

**✅ SECURE IMPLEMENTATION:**

```typescript
// Secure environment-based configuration
const openaiConfig = {
  apiKey: process.env.GUTHILDA_OPENAI_API_KEY,
  organization: process.env.GUTHILDA_OPENAI_ORG_ID,
  dangerouslyAllowBrowser: false, // Never allow browser access
};

// Validate configuration
if (!openaiConfig.apiKey) {
  throw new Error(
    'OpenAI API key not configured. Set GUTHILDA_OPENAI_API_KEY environment variable.'
  );
}

if (!openaiConfig.apiKey.startsWith('sk-')) {
  throw new Error('Invalid OpenAI API key format');
}

// Initialize with security headers
const openai = new OpenAI({
  ...openaiConfig,
  timeout: 30000,
  maxRetries: 3,
  defaultHeaders: {
    'User-Agent': 'Captain-Guthilda-MCP-System/1.0',
  },
});
```

### GitHub Actions Security

1. **Repository Secrets Configuration**

   ```
   GitHub Repository Settings > Secrets and variables > Actions

   Required secrets:
   - OPENAI_API_KEY: Your OpenAI API key (sk-...)
   - OPENAI_ORG_ID: Your organization ID (org-...)
   - GUTHILDA_OPENAI_MODEL: Preferred model (gpt-4-turbo, gpt-3.5-turbo)
   ```

2. **Secure Workflow Implementation**

   ```yaml
   # .github/workflows/openai-integration.yml
   name: OpenAI GPT Integration

   on:
     pull_request:
       branches: [main, develop]
     workflow_dispatch:
       inputs:
         model:
           description: 'GPT Model to use'
           required: false
           default: 'gpt-4-turbo'

   jobs:
     gpt-analysis:
       runs-on: ubuntu-latest

       # Security: Limit permissions
       permissions:
         contents: read
         pull-requests: write
         security-events: write

       steps:
         - name: Checkout code
           uses: actions/checkout@v4
           with:
             fetch-depth: 2 # For diff analysis

         - name: Setup secure environment
           env:
             GUTHILDA_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
             GUTHILDA_OPENAI_ORG_ID: ${{ secrets.OPENAI_ORG_ID }}
             GUTHILDA_OPENAI_MODEL: ${{ secrets.GUTHILDA_OPENAI_MODEL || 'gpt-4-turbo' }}
           run: |
             # Validate secrets are available
             if [ -z "$GUTHILDA_OPENAI_API_KEY" ]; then
               echo "Error: OpenAI API key not configured"
               exit 1
             fi

             # Mask sensitive values in logs
             echo "::add-mask::$GUTHILDA_OPENAI_API_KEY"
             echo "::add-mask::$GUTHILDA_OPENAI_ORG_ID"

         - name: Install dependencies
           run: pnpm install --frozen-lockfile

         - name: Run GPT code analysis
           env:
             GUTHILDA_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
             GUTHILDA_OPENAI_ORG_ID: ${{ secrets.OPENAI_ORG_ID }}
           run: |
             # Run secure analysis without exposing keys
             pnpm guthilda:analyze \
               --ai=openai \
               --model=${{ inputs.model || 'gpt-4-turbo' }} \
               --scope=security,performance \
               --output=analysis-results.md

         - name: Comment on PR (if applicable)
           if: github.event_name == 'pull_request'
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
           run: |
             pnpm guthilda:comment \
               --pr=${{ github.event.number }} \
               --file=analysis-results.md \
               --secure
   ```

### Production Security Measures

```typescript
// Comprehensive security implementation
export class SecureOpenAIService extends BaseAIService {
  private client: OpenAI;
  private rateLimiter: RateLimiter;
  private auditLogger: AuditLogger;

  constructor(config: OpenAIConfig) {
    super('openai', config);

    // Security validations
    this.validateConfiguration(config);

    // Initialize with security features
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
      timeout: config.timeout || 30000,
      maxRetries: 3,
      dangerouslyAllowBrowser: false,
    });

    // Rate limiting to prevent abuse
    this.rateLimiter = new RateLimiter({
      tokensPerMinute: 100000, // Adjust based on your plan
      requestsPerMinute: 500,
      burstLimit: 1000,
    });

    // Audit logging for security monitoring
    this.auditLogger = new AuditLogger({
      logLevel: 'INFO',
      includeRequestMetadata: true,
      excludeResponseContent: true, // Don't log response content for privacy
    });
  }

  private validateConfiguration(config: OpenAIConfig): void {
    if (!config.apiKey) {
      throw new SecurityError('OpenAI API key is required');
    }

    if (!config.apiKey.startsWith('sk-')) {
      throw new SecurityError('Invalid OpenAI API key format');
    }

    if (config.apiKey.length < 20) {
      throw new SecurityError('API key appears to be invalid');
    }

    // Warn about insecure configurations
    if (config.logRequests && process.env.NODE_ENV === 'production') {
      this.logger.warn(
        'Request logging enabled in production - ensure no sensitive data is logged'
      );
    }
  }

  async makeSecureRequest(params: RequestParams): Promise<Response> {
    // Rate limiting
    await this.rateLimiter.acquire(params.estimatedTokens);

    // Audit logging
    this.auditLogger.logRequest({
      timestamp: new Date().toISOString(),
      userId: params.userId,
      model: params.model,
      operation: params.operation,
      tokenEstimate: params.estimatedTokens,
    });

    try {
      const response = await this.client.chat.completions.create({
        model: params.model,
        messages: params.messages,
        max_tokens: Math.min(params.maxTokens, 4096), // Limit token usage
        temperature: params.temperature || 0.1,
        user: params.userId, // For abuse monitoring
      });

      // Log successful request (without content)
      this.auditLogger.logSuccess({
        requestId: response.id,
        model: response.model,
        tokensUsed: response.usage?.total_tokens,
        cost: this.calculateCost(response.usage, response.model),
      });

      return response;
    } catch (error) {
      // Security incident logging
      this.auditLogger.logError({
        error: error.message,
        statusCode: error.status,
        type: error.type,
        userId: params.userId,
      });

      // Handle rate limiting
      if (error.status === 429) {
        throw new RateLimitError('OpenAI rate limit exceeded', error);
      }

      // Handle authentication errors
      if (error.status === 401) {
        throw new AuthenticationError('Invalid OpenAI API key', error);
      }

      throw new ServiceError('OpenAI request failed', error);
    }
  }
}
```

## 🔧 Configuration

### Captain Guthilda Integration

```json
{
  "aiServices": {
    "openai": {
      "enabled": true,
      "model": "gpt-4-turbo",
      "fallbackModel": "gpt-3.5-turbo",
      "maxTokens": 4096,
      "temperature": 0.1,
      "capabilities": [
        "code-generation",
        "code-review",
        "documentation",
        "analysis",
        "refactoring",
        "testing"
      ],
      "security": {
        "apiKeyRotation": true,
        "requestLogging": false,
        "auditTrail": true,
        "rateLimiting": true,
        "costMonitoring": true
      },
      "rateLimits": {
        "requestsPerMinute": 500,
        "tokensPerMinute": 100000,
        "dailyBudget": 100.0
      }
    }
  },
  "workflows": {
    "openai": {
      "codeGeneration": {
        "enabled": true,
        "requireApproval": true,
        "templates": ["function", "class", "test", "documentation"]
      },
      "codeReview": {
        "enabled": true,
        "autoComment": false,
        "focusAreas": ["security", "performance", "best-practices"]
      }
    }
  }
}
```

### Environment Variables

```bash
# OpenAI API Configuration
GUTHILDA_OPENAI_ENABLED=true
GUTHILDA_OPENAI_API_KEY=sk-your-api-key-here
GUTHILDA_OPENAI_ORG_ID=org-your-org-id-here
GUTHILDA_OPENAI_MODEL=gpt-4-turbo
GUTHILDA_OPENAI_FALLBACK_MODEL=gpt-3.5-turbo

# Usage and Rate Limiting
GUTHILDA_OPENAI_MAX_TOKENS=4096
GUTHILDA_OPENAI_TEMPERATURE=0.1
GUTHILDA_OPENAI_REQUESTS_PER_MINUTE=500
GUTHILDA_OPENAI_DAILY_BUDGET=100.00

# Security Settings
GUTHILDA_OPENAI_AUDIT_ENABLED=true
GUTHILDA_OPENAI_REQUEST_LOGGING=false
GUTHILDA_OPENAI_COST_MONITORING=true
GUTHILDA_OPENAI_TIMEOUT=30000

# Integration Settings
GUTHILDA_OPENAI_AUTO_REVIEW=false
GUTHILDA_OPENAI_REQUIRE_APPROVAL=true
GUTHILDA_OPENAI_WORKFLOW_TIMEOUT=300000
```

## 🎯 Integration Commands

### Captain Guthilda Commands

```bash
# Service Management
pnpm guthilda:status --provider=openai
pnpm guthilda:health --ai=openai
pnpm guthilda:usage --provider=openai --period=daily

# Authentication and Configuration
pnpm guthilda:auth --provider=openai
pnpm guthilda:configure --ai=openai --interactive
pnpm guthilda:validate --provider=openai

# Code Operations
pnpm guthilda:generate --ai=openai --type=function --spec="async user authentication"
pnpm guthilda:review --ai=openai --files="src/**/*.ts" --focus=security
pnpm guthilda:refactor --provider=openai --target="improve performance"
pnpm guthilda:test --ai=openai --generate --coverage=80

# Documentation
pnpm guthilda:docs --ai=openai --type=api --package=@mcp/core
pnpm guthilda:explain --provider=openai --function=complexAlgorithm
pnpm guthilda:readme --ai=openai --update

# Advanced Workflows
pnpm guthilda:orchestrate --workflow=full-review --ai=openai
pnpm guthilda:batch --ai=openai --operation=documentation --parallel=3
pnpm guthilda:optimize --provider=openai --target=performance
```

### Cost and Usage Monitoring

```bash
# Monitor usage and costs
pnpm guthilda:usage --provider=openai --detailed
pnpm guthilda:cost --ai=openai --period=week --breakdown
pnpm guthilda:budget --provider=openai --set=150.00 --alert=80

# Usage analytics
pnpm guthilda:analytics --ai=openai --report=monthly
pnpm guthilda:trends --provider=openai --metric=tokens
```

## 📋 Workflow Documentation

### Automated Code Generation Workflow

```typescript
// Secure code generation with approval process
export class OpenAICodeGenerator {
  private openai: SecureOpenAIService;
  private approvalManager: ApprovalManager;

  async generateCode(spec: GenerationSpec): Promise<GenerationResult> {
    // Validate generation request
    await this.validateSpec(spec);

    // Generate code with security context
    const prompt = this.buildSecurePrompt(spec);
    const response = await this.openai.makeSecureRequest({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content:
            "You are a senior developer working on Captain Guthilda's MCP system. Generate secure, well-documented TypeScript code following established patterns.",
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      maxTokens: 2048,
      temperature: 0.1,
      userId: spec.requesterId,
    });

    // Parse and validate generated code
    const generatedCode = this.parseCodeResponse(response);
    const validationResult = await this.validateGeneratedCode(generatedCode);

    // Require approval for production code
    if (spec.environment === 'production') {
      await this.approvalManager.requestApproval({
        type: 'code-generation',
        spec: spec,
        generatedCode: generatedCode,
        validation: validationResult,
        requester: spec.requesterId,
      });
    }

    return {
      code: generatedCode,
      validation: validationResult,
      metadata: {
        model: response.model,
        tokensUsed: response.usage?.total_tokens,
        timestamp: new Date().toISOString(),
      },
    };
  }

  private buildSecurePrompt(spec: GenerationSpec): string {
    return `
Generate TypeScript code for: ${spec.description}

Requirements:
- Follow Captain Guthilda's coding patterns
- Use proper TypeScript types
- Include error handling
- Add JSDoc documentation
- Follow security best practices
- Integrate with existing MCP patterns

Context:
- Package: ${spec.packageName}
- Dependencies: ${spec.dependencies.join(', ')}
- Environment: ${spec.environment}

Please provide only the code implementation.
    `;
  }
}
```

### Automated Testing Workflow

```yaml
# .github/workflows/openai-testing.yml
name: OpenAI-Powered Testing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  gpt-test-generation:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate tests with GPT
        env:
          GUTHILDA_OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GUTHILDA_OPENAI_ORG_ID: ${{ secrets.OPENAI_ORG_ID }}
        run: |
          # Find files without tests
          pnpm guthilda:find-untested --output=untested-files.json

          # Generate tests for untested files
          pnpm guthilda:test \
            --ai=openai \
            --generate \
            --files-from=untested-files.json \
            --coverage-target=80 \
            --output=generated-tests/

      - name: Run generated tests
        run: |
          # Run all tests including generated ones
          pnpm test --coverage

          # Validate test quality
          pnpm guthilda:validate-tests --generated-only

      - name: Upload test results
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: |
            coverage/
            generated-tests/
            test-results.xml
```

## 🛠️ Advanced Features

### Custom Model Fine-tuning

```typescript
// Prepare training data for Captain Guthilda patterns
export class GuthildaModelTrainer {
  async prepareTrainingData(): Promise<TrainingData> {
    const trainingExamples = [
      {
        messages: [
          {
            role: 'system',
            content: "You are working on Captain Guthilda's MCP Orchestration System.",
          },
          {
            role: 'user',
            content: 'Create a new AI service integration',
          },
          {
            role: 'assistant',
            content:
              "I'll create a new AI service integration following Captain Guthilda's patterns...",
          },
        ],
      },
      // More examples...
    ];

    return {
      examples: trainingExamples,
      validation: await this.validateTrainingData(trainingExamples),
    };
  }

  async uploadTrainingData(data: TrainingData): Promise<string> {
    const file = await this.openai.files.create({
      file: this.convertToJSONL(data.examples),
      purpose: 'fine-tune',
    });

    return file.id;
  }

  async createFineTune(trainingFileId: string): Promise<FineTune> {
    return await this.openai.fineTuning.jobs.create({
      training_file: trainingFileId,
      model: 'gpt-3.5-turbo',
      suffix: 'captain-guthilda-mcp',
    });
  }
}
```

### Cost Optimization

```typescript
// Intelligent cost management
export class OpenAICostOptimizer {
  private costTracker = new CostTracker();
  private budgetManager = new BudgetManager();

  async optimizeRequest(params: RequestParams): Promise<OptimizedParams> {
    // Check budget constraints
    const currentCost = await this.costTracker.getCurrentPeriodCost();
    const dailyBudget = this.budgetManager.getDailyBudget();

    if (currentCost >= dailyBudget * 0.9) {
      // Near budget limit - use cheaper model
      params.model = 'gpt-3.5-turbo';
      params.maxTokens = Math.min(params.maxTokens, 1000);
    }

    // Optimize prompt for token efficiency
    params.messages = await this.optimizePrompt(params.messages);

    // Use caching for repeated requests
    const cacheKey = this.generateCacheKey(params);
    const cachedResponse = await this.cache.get(cacheKey);

    if (cachedResponse) {
      return { ...params, useCache: true, cacheKey };
    }

    return params;
  }

  private async optimizePrompt(messages: Message[]): Promise<Message[]> {
    // Remove redundant content
    // Compress examples
    // Use efficient formatting
    return messages.map((msg) => ({
      ...msg,
      content: this.compressContent(msg.content),
    }));
  }
}
```

## 📚 Official Resources

- **OpenAI API Documentation**: [platform.openai.com/docs](https://platform.openai.com/docs)
- **GPT-4 Technical Report**: [arxiv.org/abs/2303.08774](https://arxiv.org/abs/2303.08774)
- **OpenAI Cookbook**: [github.com/openai/openai-cookbook](https://github.com/openai/openai-cookbook)
- **Rate Limits Guide**: [platform.openai.com/docs/guides/rate-limits](https://platform.openai.com/docs/guides/rate-limits)
- **Best Practices**: [platform.openai.com/docs/guides/production-best-practices](https://platform.openai.com/docs/guides/production-best-practices)
- **Safety Guidelines**: [platform.openai.com/docs/guides/safety-best-practices](https://platform.openai.com/docs/guides/safety-best-practices)

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Issues**

   ```bash
   # Validate API key format
   echo $GUTHILDA_OPENAI_API_KEY | grep -q "^sk-" && echo "Valid format" || echo "Invalid format"

   # Test API key
   pnpm guthilda:auth --provider=openai --test

   # Check organization access
   pnpm guthilda:validate --provider=openai --org-check
   ```

2. **Rate Limiting**

   ```typescript
   // Handle rate limits gracefully
   if (error.status === 429) {
     const retryAfter = parseInt(error.headers['retry-after']) || 60;
     this.logger.warn(`Rate limited, retrying after ${retryAfter} seconds`);
     await sleep(retryAfter * 1000);
     return this.retryRequest(params);
   }
   ```

3. **Cost Overruns**

   ```bash
   # Monitor costs in real-time
   pnpm guthilda:cost --provider=openai --monitor --alert-threshold=0.8

   # Set up cost alerts
   pnpm guthilda:budget --provider=openai --daily=50 --alert=80 --stop=100
   ```

### Debug Mode

```bash
# Enable comprehensive debugging
export GUTHILDA_LOG_LEVEL=DEBUG
export GUTHILDA_OPENAI_DEBUG=true
export GUTHILDA_OPENAI_LOG_REQUESTS=true

# Run with detailed output
pnpm guthilda:status --provider=openai --verbose --debug

# Generate debug report
pnpm guthilda:debug --ai=openai --include-usage > openai-debug-report.json
```

## 🏴‍☠️ Captain Guthilda Integration

This OpenAI integration is a core component of Captain Guthilda's unified AI orchestration system:

- **Security-First Design**: Enterprise-grade API key management and audit trails
- **Cost Management**: Intelligent budget monitoring and optimization
- **Workflow Integration**: Seamless coordination with other AI services
- **Quality Assurance**: Automated validation and approval processes
- **Monitoring**: Comprehensive usage analytics and performance tracking

### Multi-AI Coordination

```typescript
// Coordinate multiple AI services for comprehensive analysis
export class AIOrchestrationWorkflow {
  async performComprehensiveAnalysis(code: string): Promise<AnalysisResult> {
    const tasks = [
      this.openai.analyzeCode(code, { focus: 'architecture' }),
      this.claude.reviewSecurity(code),
      this.gemini.optimizePerformance(code),
    ];

    const results = await Promise.allSettled(tasks);
    return this.synthesizeResults(results);
  }
}
```

For more information, see the [Captain Guthilda Unified Guide](docs/CAPTAIN_GUTHILDA_UNIFIED_GUIDE.md).

---

> _"The power of AI lies not in the model itself, but in how securely and intelligently we orchestrate its capabilities."_ — Captain Guthilda
