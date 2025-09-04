# Claude Code Installation Checker

This system provides automated checking of Claude Code installation status across all repositories and branches in the organization.

## Overview

Claude Code is Anthropic's GitHub Actions integration that allows Claude to assist with code development directly in GitHub repositories. This checker verifies that Claude Code is properly installed and configured across your organization.

## Features

### 🔍 **Comprehensive Verification**

- **Cross-Repository**: Checks all repositories in the organization
- **Workflow Detection**: Identifies Claude Code and Claude Code Review workflows
- **Secret Verification**: Confirms ANTHROPIC_API_KEY is configured
- **Branch Analysis**: Analyzes configuration across all branches
- **Status Classification**: Categorizes repositories as fully-configured, partially-configured, or not-configured

### 🛡️ **Safety & Compatibility**

- **Test Mode**: Safe testing without GitHub authentication required
- **Error Handling**: Graceful handling of inaccessible repositories
- **Detailed Logging**: Comprehensive audit trail of all checks
- **Configurable Scope**: Check all repositories or specific ones

## Usage

### Via Captain Guthilda (Recommended)

```bash
# Check all repositories in the organization
pnpm guthilda:claude-code

# Check specific repositories
pnpm guthilda claude-code repo1,repo2,repo3

# Alternative command aliases
pnpm guthilda claude
```

### Direct Script Usage

```bash
# Check all repositories (requires GitHub authentication)
./scripts/claude-code-checker.sh --operation check

# Generate CSV report
./scripts/claude-code-checker.sh --operation report

# Test mode (no authentication required)
./scripts/claude-code-checker.sh --operation check --test-mode

# Check specific repositories
./scripts/claude-code-checker.sh --repositories "repo1,repo2" --operation check
```

### Package Scripts

```bash
# Use the direct script with report output
pnpm claude-code-check:report

# Use the direct script with default settings
pnpm claude-code-check
```

## Configuration Detection

The checker looks for the following Claude Code components:

### Required Workflows

1. **Claude Code Workflow** (`.github/workflows/claude.yml`)
   - Enables @claude mentions in issues and PRs
   - Provides interactive Claude assistance

2. **Claude Code Review Workflow** (`.github/workflows/claude-code-review.yml`)
   - Automated code review on pull requests
   - Proactive code quality feedback

### Required Secrets

- **ANTHROPIC_API_KEY**: Repository secret for Claude API access

### Status Classification

- **Fully Configured**: Has Claude workflow + ANTHROPIC_API_KEY
- **Partially Configured**: Has some components but not all
- **Not Configured**: Missing all Claude Code components

## Output Examples

### Captain Guthilda Output

```
📊 Claude Code Installation Summary:
   Total Repositories: 4
   Fully Configured: ✅ 2
   Partially Configured: ⚠️ 1
   Not Configured: ❌ 1
   Configuration Rate: 50%

📋 Repository Details:
   ✅ Restructure-MCP-Orchestration (fully-configured)
      Claude Workflow: ✅
      Claude Review Workflow: ✅
      ANTHROPIC_API_KEY: ✅
      Total Branches: 3

💡 Recommendations:
   • Configure Claude Code in 1 repositories: example-repo
   • Add ANTHROPIC_API_KEY secret to 2 repositories
```

### CSV Report Output

```csv
Repository,Claude Workflow,Claude Review Workflow,ANTHROPIC_API_KEY,Total Branches
Restructure-MCP-Orchestration,true,true,true,3
poisontr33s,false,false,false,3
PsychoNoir-Kontrapunkt,true,false,true,3
```

## Prerequisites

### For Production Use

1. **GitHub CLI**: Install from https://cli.github.com/
2. **Authentication**: Run `gh auth login`
3. **Permissions**: Repository admin access for secret verification

### For Testing

- No authentication required when using `--test-mode`
- Uses simulated data for demonstration

## Integration

### With Existing Workflows

- Works alongside existing CI/CD automation
- Respects repository-specific configurations
- Maintains compatibility with monorepo structure

### With Captain Guthilda System

- Integrated into the meta-automation orchestrator
- Part of the unified command system
- Consistent with other Guthilda operations

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure `gh auth login` has been run
   - Verify GitHub token has sufficient permissions
   - Use `--test-mode` for testing without authentication

2. **Repository Access**
   - Some repositories may be private or restricted
   - Script gracefully handles inaccessible repositories
   - Check organization membership and permissions

3. **API Rate Limits**
   - GitHub API has rate limits for unauthenticated requests
   - Authentication typically provides higher limits
   - Script includes timeout handling

## Security Considerations

- Script only reads repository configuration, never modifies
- Secrets verification checks existence, not values
- All operations respect GitHub permissions and access controls
- No sensitive data is logged or exposed

## Related Documentation

- [Claude Code Official Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Captain Guthilda Documentation](../packages/guthilda/README.md)
- [Universal Branch Management](UNIVERSAL_BRANCH_MANAGEMENT.md)
- [Automation Summary](AUTOMATION_SUMMARY.md)
