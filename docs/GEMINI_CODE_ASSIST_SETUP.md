# 🤖 Gemini Code Assist Integration Guide

This guide walks you through setting up Google Gemini Code Assist with Captain Guthilda's MCP Orchestration System.

## 🚀 Overview

Gemini Code Assist provides advanced AI-powered code assistance directly integrated with your GitHub repositories. This integration allows Captain Guthilda to leverage Gemini's capabilities for:

- **Code Generation & Completion**: AI-powered code suggestions and generation
- **Repository Analysis**: Cross-repository context and insights
- **Code Review Assistance**: Automated code review suggestions and improvements
- **Security Analysis**: Automated security vulnerability detection
- **Performance Optimization**: Code performance improvement suggestions
- **Documentation Generation**: Automated documentation creation and updates

## 📋 Prerequisites

Before setting up Gemini Code Assist, ensure you have:

1. **Google Cloud Project**: Active Google Cloud project with Gemini Code Assist API enabled
2. **GitHub Pro+ Account**: Required for advanced GitHub integrations
3. **API Access**: Valid Gemini Code Assist API key
4. **Repository Access**: Admin access to the repositories you want to integrate

## 🔧 Setup Instructions

### Step 1: Google Cloud Configuration

1. **Create or Select Google Cloud Project**:
   ```bash
   # Set your project ID
   export GOOGLE_CLOUD_PROJECT="your-project-id"
   ```

2. **Enable Gemini Code Assist API**:
   ```bash
   gcloud services enable geminiapi.googleapis.com --project=$GOOGLE_CLOUD_PROJECT
   ```

3. **Create API Key**:
   - Navigate to Google Cloud Console > APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Restrict the key to Gemini Code Assist API
   - Copy the API key for later use

### Step 2: Environment Configuration

Add the following environment variables to your system:

```bash
# Gemini Code Assist Configuration
export GUTHILDA_GEMINI_CODE_ASSIST_ENABLED=true
export GUTHILDA_GEMINI_CODE_ASSIST_API_KEY="your_api_key_here"
export GUTHILDA_GEMINI_CODE_ASSIST_PROJECT_ID="your-google-cloud-project"
export GUTHILDA_GEMINI_CODE_ASSIST_LOCATION="us-central1"
```

### Step 3: Repository Configuration

1. **GitHub Configuration File**: The `.github/gemini-code-assist.yml` file has been created with optimal settings for this repository.

2. **Repository List**: Update your Captain Guthilda configuration to include all repositories:

```typescript
const guthilda = new CaptainGuthilda({
  aiServices: {
    geminiCodeAssist: {
      enabled: true,
      projectId: 'your-google-cloud-project',
      location: 'us-central1',
      gitHubRepositories: [
        'poisontr33s/Restructure-MCP-Orchestration',
        'poisontr33s/poisontr33s',
        'poisontr33s/psychonoir-kontrapunkt'
      ],
      codeAssistanceEnabled: true,
      codeGenerationEnabled: true
    }
  }
});
```

### Step 4: Authentication & Testing

1. **Authenticate with Captain Guthilda**:
   ```bash
   pnpm guthilda:auth setup
   ```

2. **Verify Integration**:
   ```bash
   pnpm guthilda:status
   ```

3. **Test Discovery**:
   ```bash
   pnpm guthilda:discover
   ```

## 🎯 Features & Capabilities

### Code Assistance Features

- **Smart Code Completion**: Context-aware code suggestions
- **Function Generation**: Generate complete functions from comments
- **Bug Detection**: Automatically identify potential issues
- **Code Refactoring**: Suggest improvements and optimizations
- **Documentation**: Auto-generate JSDoc and README content

### GitHub Integration Features

- **Pull Request Analysis**: Automated code review and suggestions
- **Issue Triage**: Intelligent issue categorization and assignment
- **Workflow Optimization**: CI/CD pipeline improvement suggestions
- **Security Scanning**: Vulnerability detection and remediation

### Multi-Repository Support

- **Cross-Repository Context**: Understand relationships between projects
- **Consistent Patterns**: Maintain coding standards across repositories
- **Shared Components**: Identify reusable code across projects

## 🔒 Security & Best Practices

### API Key Management

- **Environment Variables**: Always use environment variables for API keys
- **Key Rotation**: Regularly rotate API keys for security
- **Scope Limitation**: Restrict API key permissions to minimum required
- **Access Logging**: Monitor API key usage and access patterns

### Repository Security

- **Code Scanning**: Enable automated security vulnerability scanning
- **Dependency Monitoring**: Track and update dependencies for security
- **Access Control**: Limit repository access to authorized personnel
- **Audit Logging**: Monitor all repository access and changes

### Privacy Considerations

- **Data Handling**: Understand how Gemini processes your code
- **Sensitive Data**: Exclude sensitive files and directories
- **Compliance**: Ensure compliance with your organization's policies

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication Failures**:
   ```bash
   # Check API key and project ID
   echo $GUTHILDA_GEMINI_CODE_ASSIST_API_KEY
   echo $GUTHILDA_GEMINI_CODE_ASSIST_PROJECT_ID
   
   # Verify Google Cloud authentication
   gcloud auth application-default login
   ```

2. **API Quota Exceeded**:
   - Check Google Cloud Console for quota limits
   - Request quota increase if necessary
   - Implement rate limiting in your integration

3. **Repository Access Issues**:
   - Verify GitHub repository permissions
   - Check GitHub App installation status
   - Ensure repository is not private without proper access

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
export GUTHILDA_DEBUG=true
export GUTHILDA_GEMINI_DEBUG=true
pnpm guthilda:status
```

## 📊 Monitoring & Analytics

### Usage Metrics

Captain Guthilda provides comprehensive monitoring for Gemini Code Assist:

- **API Usage**: Track API calls and quota consumption
- **Feature Adoption**: Monitor which features are most used
- **Performance Metrics**: Response times and success rates
- **Error Tracking**: Identify and resolve integration issues

### Reporting

Generate detailed reports on Gemini Code Assist usage:

```bash
pnpm guthilda:report
```

## 🔄 Maintenance

### Regular Tasks

- **Update Dependencies**: Keep Gemini integration libraries updated
- **Review Configurations**: Periodically review and update settings
- **Monitor Usage**: Track API usage and costs
- **Security Audits**: Regular security reviews and updates

### Updates

Stay current with Gemini Code Assist updates:

- **Feature Updates**: New capabilities and improvements
- **API Changes**: Breaking changes and deprecations
- **Security Patches**: Critical security updates

## 📚 Additional Resources

- **Official Documentation**: [Google Gemini Code Assist Docs](https://developers.google.com/gemini-code-assist/docs/customize-gemini-behavior-github)
- **GitHub Integration**: [GitHub Apps Documentation](https://docs.github.com/en/developers/apps)
- **Google Cloud**: [Google Cloud AI Documentation](https://cloud.google.com/ai)
- **Captain Guthilda**: [Main Documentation](./CAPTAIN_GUTHILDA_UNIFIED_GUIDE.md)

## 🤝 Support

For support with Gemini Code Assist integration:

1. **Check Documentation**: Review this guide and official documentation
2. **Check Logs**: Enable debug mode and review logs
3. **Community Support**: Check GitHub discussions and issues
4. **Professional Support**: Contact Google Cloud support for API issues

---

> **Captain Guthilda's Note**: "Ahoy! With Gemini Code Assist aboard, yer code will be sharper than a cutlass and faster than the wind in our sails! 🏴‍☠️⚓"