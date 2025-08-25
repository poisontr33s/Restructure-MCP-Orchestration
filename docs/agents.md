# 🤖 AI Agents Registry System

A remote-friendly system for discovering and invoking external AI agents through GitHub Actions. Designed to work seamlessly from any device, including mobile, without requiring VS Code or local development tools.

## 📋 Overview

The Agents Registry system provides:

- **JSON-based Agent Registry**: Single source of truth for all AI agent definitions
- **Automated Discovery**: Weekly agent health checks and API probing
- **Mobile-Friendly Invocation**: Trigger AI agents directly from GitHub Actions UI
- **Safe by Default**: No API calls without proper secrets configuration
- **Multi-Vendor Support**: OpenAI, Anthropic, Google Gemini, and placeholder support

## 🏗️ Architecture

### Control Plane: JSON Registry

The `agents/registry.json` file defines all available agents with:

- **Authentication**: Required environment variables and auth types
- **Capabilities**: Supported operations (chat, text-generation, etc.)
- **Endpoints**: Public API endpoints for invocation
- **Discovery Probes**: Health check configurations
- **Vendor-Specific Settings**: Model lists, rate limits, notes

### Transport Layer: GitHub Actions Workflows

Two main workflows handle the heavy lifting:

1. **Agents: Discovery** (`.github/workflows/agents-discovery.yml`)
   - Scheduled weekly checks and manual triggers
   - Environment variable validation
   - API endpoint probing
   - Status reporting and artifact generation

2. **Agents: Invoke** (`.github/workflows/agents-invoke.yml`)
   - Manual dispatch with input forms
   - Real-time agent invocation
   - Response artifact generation
   - Mobile-optimized UI

## 🚀 Quick Start

### From Mobile Device

1. **Check Agent Status**:
   - Go to **Actions** → **Agents: Discovery**
   - Click **Run workflow**
   - View results in the workflow summary

2. **Invoke an Agent**:
   - Go to **Actions** → **Agents: Invoke**
   - Click **Run workflow**
   - Select agent (e.g., `openai.gpt`)
   - Choose operation (`chat`)
   - Enter your prompt
   - Click **Run workflow**
   - View response in workflow summary and artifacts

### From Desktop

Same as mobile, but you can also:

- Clone the repository and run scripts locally
- Use the command-line interface for batch operations
- Integrate with existing CI/CD pipelines

## 🔧 Configuration

### Required Repository Secrets

Add these secrets in **Settings** → **Secrets and variables** → **Actions**:

#### OpenAI Integration

```
OPENAI_API_KEY=sk-...
```

**Important**: Requires an OpenAI API account with billing enabled. ChatGPT Plus web subscriptions do NOT provide API access.

#### Anthropic Integration

```
ANTHROPIC_API_KEY=sk-ant-...
```

#### Google Gemini Integration

```
GEMINI_API_KEY=AI...
```

#### Google Jules (Placeholder)

```
JULES_API_KEY=your_key
JULES_ENDPOINT=https://your-jules-endpoint.com/api
```

**Note**: This is a placeholder for the Google Jules beta async agent. Actual configuration depends on Google's release.

#### Google Gemini Code Assist (Placeholder)

```
GEMINI_CODE_ASSIST_TOKEN=your_enterprise_token
```

**Note**: This is a placeholder for enterprise-only features that may require special authentication.

### Optional Configuration

- **Temperature**: Control response randomness (0.0-2.0)
- **Model Selection**: Override default models per vendor
- **Extra Parameters**: JSON object for vendor-specific settings

## 🤖 Supported Agents

### ✅ Production Ready

| Agent              | Vendor    | Capabilities              | Models                                           |
| ------------------ | --------- | ------------------------- | ------------------------------------------------ |
| `openai.gpt`       | OpenAI    | Chat, text generation     | gpt-4, gpt-4-turbo, gpt-3.5-turbo                |
| `anthropic.claude` | Anthropic | Chat, analysis, reasoning | claude-3-5-sonnet, claude-3-haiku, claude-3-opus |
| `google.gemini`    | Google    | Chat, multimodal          | gemini-1.5-pro, gemini-1.5-flash                 |

### ⚠️ Placeholder Agents

| Agent                         | Status                 | Notes                                                 |
| ----------------------------- | ---------------------- | ----------------------------------------------------- |
| `google.jules`                | Beta Placeholder       | Async reasoning agent, requires custom endpoint       |
| `google.gemini_code_assist`   | Enterprise Placeholder | May require enterprise authentication                 |
| `github.copilot_coding_agent` | Awareness Only         | No direct API, use VS Code extension or web interface |

## 📱 Mobile Usage Guide

### Discovering Agents

1. Open GitHub repository on mobile
2. Navigate to **Actions** tab
3. Find **Agents: Discovery** workflow
4. Tap **Run workflow**
5. Tap **Run workflow** again to confirm
6. Wait for completion (usually 1-2 minutes)
7. Tap on the completed workflow run
8. View the summary for agent status
9. Download artifacts for detailed JSON reports

### Invoking Agents

1. Navigate to **Actions** → **Agents: Invoke**
2. Tap **Run workflow**
3. Configure the invocation:
   - **Agent**: Select from dropdown (e.g., `openai.gpt`)
   - **Operation**: Choose `chat` or `text-generation`
   - **Model**: Leave blank for default or specify (e.g., `gpt-4`)
   - **Prompt**: Enter your question or request
   - **Temperature**: Adjust creativity (0.0 = focused, 1.0 = creative)
4. Tap **Run workflow**
5. Wait for completion (usually 30 seconds to 2 minutes)
6. View response in workflow summary
7. Download artifacts for full response details

### Tips for Mobile

- **Bookmark** the Actions page for quick access
- Use **speech-to-text** for longer prompts
- **Share results** by copying workflow URLs
- **Save frequently used prompts** in notes app
- Check **notification settings** for workflow completion alerts

## 🔍 Troubleshooting

### Common Issues

#### "Missing Secrets" Status

- **Cause**: Required API keys not configured
- **Solution**: Add secrets in repository settings
- **Check**: Run discovery workflow to see which secrets are missing

#### "API Error" Status

- **Cause**: Invalid API keys or service issues
- **Solution**: Verify API key validity and check service status
- **Debug**: Check workflow logs for specific error messages

#### "Probe Failed" Status

- **Cause**: Network issues or API rate limits
- **Solution**: Re-run discovery after a few minutes
- **Note**: Some APIs have strict rate limits for health checks

#### Invocation Timeout

- **Cause**: Complex prompts or service delays
- **Solution**: Simplify prompt or retry
- **Limit**: 30-second timeout for safety

#### Invalid JSON in Extra Parameters

- **Cause**: Malformed JSON in extra_json field
- **Solution**: Validate JSON syntax before submission
- **Tool**: Use online JSON validators

### API Key Validation

#### OpenAI

```bash
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

#### Anthropic

```bash
curl -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     https://api.anthropic.com/v1/messages
```

#### Google Gemini

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
```

## 🔒 Security Considerations

### Safe by Default

- **No API calls** without valid secrets
- **Request timeouts** prevent runaway operations
- **Secret redaction** in all logs and outputs
- **Read-only permissions** for invocation workflow

### Best Practices

- **Rotate API keys** regularly
- **Monitor usage** via provider dashboards
- **Review workflow logs** for suspicious activity
- **Limit repository access** to trusted collaborators

### Data Privacy

- **Prompts and responses** are logged in workflow artifacts
- **Artifacts auto-expire** (7-30 days depending on type)
- **No persistent storage** of conversation history
- **Each invocation is independent**

## 🔗 Integration Examples

### With Existing Workflows

```yaml
# In your existing workflow
- name: Get AI analysis
  uses: ./.github/workflows/agents-invoke.yml
  with:
    agent_id: 'anthropic.claude'
    operation: 'chat'
    prompt: 'Analyze this code change: ${{ github.event.pull_request.diff_url }}'
```

### CLI Integration

```bash
# Direct script usage
node scripts/agents-invoke.mjs openai.gpt chat "Explain quantum computing" gpt-4 0.7

# As part of local automation
npm run agents:discover
npm run agents:invoke -- anthropic.claude chat "Review this code"
```

### API Integration

```javascript
// Use the same scripts in your Node.js applications
import { invokeAgent } from './scripts/agents-invoke.mjs';

const result = await invokeAgent('openai.gpt', 'chat', {
  prompt: 'Generate a summary',
  model: 'gpt-4',
  temperature: 0.7,
});
```

## 🎯 Use Cases

### Development Workflow

- **Code review**: Automated analysis of pull requests
- **Documentation**: Generate docs from code comments
- **Testing**: Generate test cases and scenarios
- **Debugging**: Analyze error logs and stack traces

### Content Creation

- **Blog posts**: Generate technical articles
- **Tutorials**: Create step-by-step guides
- **Documentation**: User manuals and API docs
- **Marketing**: Product descriptions and copy

### Analysis and Research

- **Data analysis**: Interpret datasets and metrics
- **Competitive analysis**: Research market trends
- **Technical research**: Explore new technologies
- **Decision support**: Analyze options and recommendations

### Customer Support

- **FAQ generation**: Create support documentation
- **Issue triage**: Categorize and prioritize tickets
- **Response templates**: Generate helpful responses
- **Knowledge base**: Maintain support articles

## 📊 Monitoring and Analytics

### Discovery Reports

- **Weekly status checks** via scheduled workflow
- **Agent availability** tracking over time
- **API health** monitoring and alerting
- **Cost analysis** via usage statistics

### Usage Metrics

- **Invocation frequency** per agent and model
- **Token consumption** and cost estimation
- **Response quality** and user satisfaction
- **Error rates** and failure analysis

### Workflow Artifacts

- **JSON status reports** for programmatic analysis
- **Markdown summaries** for human review
- **Raw responses** for audit and compliance
- **Error logs** for debugging and improvement

## 🚀 Future Enhancements

### Planned Features

- **Conversation threading** for multi-turn interactions
- **Response caching** for frequently asked questions
- **Custom agent definitions** for organization-specific models
- **Advanced analytics** dashboard and reporting

### Community Contributions

- **Agent templates** for common use cases
- **Integration examples** for popular tools
- **Mobile app** for enhanced mobile experience
- **VS Code extension** for seamless IDE integration

---

## 📞 Support

For issues, questions, or contributions:

1. **Check the troubleshooting guide** above
2. **Run discovery workflow** to diagnose problems
3. **Review workflow logs** for error details
4. **Open an issue** with specific error messages
5. **Contribute improvements** via pull requests

The agents registry is designed to be self-documenting and self-healing. Most issues can be resolved by checking agent status and ensuring proper secret configuration.
