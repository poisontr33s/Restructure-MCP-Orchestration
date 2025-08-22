# 🤖 Gemini Code Assist Integration Guide

> _Integrating Google's Gemini Code Assist with Captain Guthilda's MCP Orchestration System_

## Overview

Gemini Code Assist is Google's AI-powered code completion and generation service that provides intelligent suggestions and code assistance within your development environment. This guide covers integration with the MCP Orchestration System following Google's official best practices.

## 🚀 Quick Start

### Prerequisites

- Google Cloud Account with Gemini Code Assist enabled
- VS Code or supported IDE
- Google Cloud CLI installed and authenticated
- Access to Gemini Code Assist API

### Installation & Setup

1. **Install Gemini Code Assist Extension**

   ```bash
   # For VS Code
   code --install-extension GoogleCloudPlatform.gemini-code-assist
   ```

2. **Authenticate with Google Cloud**

   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   gcloud auth application-default login
   ```

3. **Configure Environment Variables**
   ```bash
   # Add to your .env or shell profile
   export GOOGLE_CLOUD_PROJECT="your-project-id"
   export GEMINI_CODE_ASSIST_ENABLED=true
   export GUTHILDA_GEMINI_INTEGRATION=true
   ```

## 🔧 Configuration

### Captain Guthilda Integration

Add Gemini configuration to your `guthilda.config.json`:

```json
{
  "aiServices": {
    "geminiCodeAssist": {
      "enabled": true,
      "projectId": "your-google-cloud-project",
      "region": "us-central1",
      "model": "gemini-pro",
      "capabilities": ["code-completion", "code-generation", "documentation"]
    }
  }
}
```

### Environment Configuration

```bash
# Gemini Code Assist Configuration
GUTHILDA_GEMINI_ENABLED=true
GUTHILDA_GEMINI_PROJECT_ID=your_project_id
GUTHILDA_GEMINI_REGION=us-central1
GUTHILDA_GEMINI_MODEL=gemini-pro

# Integration Settings
GUTHILDA_GEMINI_AUTO_COMPLETE=true
GUTHILDA_GEMINI_CODE_REVIEW=true
GUTHILDA_GEMINI_DOCUMENTATION=true
```

## 📋 Code Review Customization

Gemini Code Assist supports customization through configuration files in the `.gemini/` directory:

- **`.gemini/styleguide.md`** - Define your coding style preferences
- **`.gemini/prompt.md`** - Customize AI prompts and behavior

These files are automatically detected and used by Gemini to provide context-aware suggestions aligned with your project's standards.

## 🔐 Security Best Practices

### API Key Management

- **Never commit API keys** to version control
- Use environment variables or secure secret management
- Leverage `.github/secrets` for CI/CD workflows
- Rotate credentials regularly

### GitHub Actions Integration

```yaml
# .github/workflows/gemini-integration.yml
name: Gemini Code Assist Integration

on:
  pull_request:
    branches: [main]

jobs:
  gemini-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Gemini
        env:
          GOOGLE_CLOUD_PROJECT: ${{ secrets.GOOGLE_CLOUD_PROJECT }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          # Setup Gemini for automated code review
          pnpm guthilda:gemini:setup
```

## 🎯 Integration Commands

### Captain Guthilda Commands

```bash
# Status check
pnpm guthilda:status --service=gemini

# Authentication
pnpm guthilda:auth --provider=gemini

# Code review
pnpm guthilda:review --ai=gemini

# Documentation generation
pnpm guthilda:docs --ai=gemini
```

### Direct Gemini Commands

```bash
# Initialize Gemini in project
gemini init

# Run code analysis
gemini analyze src/

# Generate documentation
gemini docs --output=docs/
```

## 📚 Official Resources

- **Gemini Code Assist Documentation**: [Google Cloud Gemini Docs](https://cloud.google.com/gemini/docs/code-assist)
- **VS Code Extension**: [Marketplace](https://marketplace.visualstudio.com/items?itemName=GoogleCloudPlatform.gemini-code-assist)
- **API Reference**: [Gemini API Docs](https://cloud.google.com/gemini/docs/api)
- **Best Practices**: [Google AI Best Practices](https://ai.google.dev/docs/best_practices)

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication Failures**

   ```bash
   # Reset authentication
   gcloud auth revoke --all
   gcloud auth login
   gcloud auth application-default login
   ```

2. **API Quota Exceeded**
   - Check Google Cloud Console for quota limits
   - Monitor usage in Cloud Monitoring
   - Consider upgrading service plan

3. **Extension Not Working**
   ```bash
   # Reload VS Code window
   # Check extension logs in Output panel
   # Verify Google Cloud project permissions
   ```

### Debug Mode

```bash
# Enable debug logging
export GEMINI_DEBUG=true
export GUTHILDA_LOG_LEVEL=DEBUG

# Run with verbose output
pnpm guthilda:status --verbose --service=gemini
```

## 🎼 Workflow Integration

### Development Workflow

```bash
# Morning setup
pnpm guthilda:status
pnpm guthilda:auth --provider=gemini

# During development
# Gemini provides real-time suggestions in IDE

# Before commit
pnpm guthilda:review --ai=gemini
pnpm guthilda:docs --ai=gemini
```

### Automation Workflows

Gemini integrates with Captain Guthilda's automation workflows:

- **Branch Intelligence**: AI-powered branch analysis
- **Content Discovery**: Automated documentation scanning
- **Code Quality**: Intelligent code review assistance
- **Cleanup**: Smart artifact and dependency management

## 🏴‍☠️ Captain Guthilda Integration

This integration follows Captain Guthilda's unified orchestration patterns:

- **Unified Authentication**: Single sign-on across all AI services
- **Centralized Configuration**: Managed through `guthilda.config.json`
- **Workflow Orchestration**: Automated task coordination
- **Security Standards**: Enterprise-grade credential management

For more information, see the [Captain Guthilda Unified Guide](docs/CAPTAIN_GUTHILDA_UNIFIED_GUIDE.md).

---

> _"Code with the wisdom of AI, the security of a fortress, and the efficiency of a well-oiled ship."_ — Captain Guthilda
