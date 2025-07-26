# Universal Multi-Repository Branch Management System

A comprehensive automation system for managing git branches across multiple repositories from a central location. This system provides complete automation for branch cleanup, monitoring, and management at an organizational scale.

## 🌟 Key Features

### ✨ Universal Repository Management
- **Multi-Repository Support**: Manage branches across ALL repositories in your organization
- **Pattern-Based Filtering**: Use wildcards to target specific branch types (`copilot/*`, `feature/*`, etc.)
- **Repository Exclusions**: Protect critical repositories from automated operations
- **Centralized Configuration**: Single configuration file controls all repositories

### 🤖 Multiple Automation Interfaces
- **GitHub Actions Workflow**: Fully automated cloud-based execution
- **Command Line Tool**: Local control and testing capabilities
- **API Integration**: External system triggers via GitHub API
- **Scheduled Operations**: Automatic weekly cleanup runs

### 🛡️ Advanced Safety Features
- **Protected Branch Detection**: Automatically skips main/master/develop branches
- **Pull Request Awareness**: Never deletes branches with open PRs
- **Age-Based Filtering**: Only processes branches older than specified thresholds
- **Dry Run Mode**: Test operations without making changes
- **Comprehensive Logging**: Full audit trails for all operations

## 🚀 Quick Start

### 1. GitHub Actions (Recommended)

**Manual Trigger**:
```bash
gh workflow run universal-branch-manager.yml \
  --field operation=cleanup \
  --field repositories=ALL \
  --field branch_pattern="copilot/*" \
  --field dry_run=true
```

**API Trigger**:
```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/dispatches \
  -d '{
    "event_type": "universal-branch-cleanup",
    "client_payload": {
      "operation": "cleanup",
      "repositories": "ALL",
      "branch_pattern": "copilot/*",
      "dry_run": false
    }
  }'
```

### 2. Command Line Tool

**List all copilot branches across all repositories**:
```bash
./scripts/universal-branch-manager.sh --operation list --pattern "copilot/*"
```

**Dry run cleanup of feature branches**:
```bash
./scripts/universal-branch-manager.sh \
  --operation cleanup \
  --pattern "feature/*" \
  --threshold 14 \
  --dry-run
```

**Delete branches from specific repositories**:
```bash
./scripts/universal-branch-manager.sh \
  --operation delete-pattern \
  --pattern "copilot/*" \
  --repositories "org/repo1,org/repo2"
```

### 3. Package Manager Integration

```bash
# Quick universal cleanup (dry run)
pnpm universal-cleanup:dry

# List all branches across all repositories
pnpm universal-list

# Full cleanup across all repositories
pnpm universal-cleanup:all
```

## ⚙️ Configuration

### Configuration File: `scripts/universal-branch-config.json`

```json
{
  "default_pattern": "copilot/*",
  "default_threshold": 7,
  "protected_branches": ["main", "master", "develop", "production"],
  "excluded_repositories": ["critical-repo", "production-repo"],
  "organization_settings": {
    "auto_cleanup_enabled": true,
    "max_repositories_per_run": 100
  },
  "advanced_patterns": {
    "feature_branches": "feature/*",
    "hotfix_branches": "hotfix/*",
    "experimental_branches": "experiment/*"
  },
  "age_thresholds": {
    "copilot_branches": 7,
    "feature_branches": 14,
    "hotfix_branches": 3,
    "experimental_branches": 30
  }
}
```

## 🎯 Operations

### Cleanup Operations
- **`cleanup`**: Age-based cleanup with PR and protection checks
- **`delete-pattern`**: Delete all branches matching a specific pattern
- **`delete-all`**: Nuclear option - delete all matching branches
- **`list`**: Non-destructive listing of matching branches

### Repository Targeting
- **`ALL`**: Process all repositories in the organization
- **`owner/repo`**: Target a specific repository
- **`owner/repo1,owner/repo2`**: Multiple specific repositories
- **Exclusions**: Use `--exclude` to skip critical repositories

### Pattern Matching
- **Wildcards**: `copilot/*`, `feature/*`, `hotfix/*`
- **Specific Branches**: `my-specific-branch`
- **Multiple Patterns**: Configure different thresholds per pattern type

## 🔧 Advanced Usage

### Multi-Organization Management
```bash
# Manage repositories across different organizations
./scripts/universal-branch-manager.sh \
  --repositories "org1/repo1,org2/repo2,org3/repo3" \
  --operation cleanup
```

### Conditional Cleanup with Age Thresholds
```bash
# Different thresholds for different branch types
./scripts/universal-branch-manager.sh --pattern "copilot/*" --threshold 7
./scripts/universal-branch-manager.sh --pattern "feature/*" --threshold 14
./scripts/universal-branch-manager.sh --pattern "experiment/*" --threshold 30
```

### Batch Operations
```bash
# Process multiple patterns in sequence
for pattern in "copilot/*" "feature/*" "hotfix/*"; do
  ./scripts/universal-branch-manager.sh \
    --operation cleanup \
    --pattern "$pattern" \
    --dry-run
done
```

## 📊 Monitoring & Reporting

### Execution Reports
Each run generates detailed reports including:
- Total repositories processed
- Branches found vs. deleted
- Skipped branches with reasons
- Failed operations and error details
- Execution time and performance metrics

### Audit Trails
- Complete logging of all operations
- Timestamps for all branch deletions
- Reason codes for skipped branches
- Integration with GitHub Actions logs

## 🔐 Security & Permissions

### Required Permissions
- **Repository Access**: Read access to all target repositories
- **Branch Management**: Write access to delete branches
- **Pull Request Read**: To check for open PRs
- **Organization Metadata**: To list organization repositories

### Token Configuration
```bash
# Set GitHub token for authentication
export GITHUB_TOKEN="your_github_token_here"

# Or use GitHub CLI authentication
gh auth login
```

## 🚨 Safety Mechanisms

### Protected Branch Detection
- Automatically detects and skips protected branches
- Respects GitHub branch protection rules
- Configurable list of always-protected branch names

### Pull Request Integration
- Never deletes branches with open pull requests
- Checks both draft and active PRs
- Maintains referential integrity

### Age-Based Filtering
- Only processes branches older than specified thresholds
- Prevents accidental deletion of recent work
- Configurable thresholds per branch type

## 🔄 Automation Scheduling

### Weekly Automated Cleanup
The GitHub Actions workflow automatically runs every Sunday at 2 AM UTC to:
- Clean up stale copilot branches across all repositories
- Remove branches older than 7 days without open PRs
- Generate cleanup reports
- Maintain organizational repository hygiene

### Custom Scheduling
Modify the cron expression in `.github/workflows/universal-branch-manager.yml`:
```yaml
schedule:
  - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM UTC
  - cron: '0 2 * * *'  # Daily at 2 AM UTC
  - cron: '0 */6 * * *'  # Every 6 hours
```

## 🛠️ Integration Examples

### CI/CD Pipeline Integration
```yaml
# In your CI/CD pipeline
- name: Cleanup feature branches after merge
  run: |
    ./scripts/universal-branch-manager.sh \
      --operation cleanup \
      --pattern "feature/*" \
      --threshold 1
```

### Webhook Integration
```javascript
// Express.js webhook handler
app.post('/cleanup-branches', (req, res) => {
  const payload = {
    event_type: 'universal-branch-cleanup',
    client_payload: {
      operation: 'cleanup',
      repositories: req.body.repositories || 'ALL',
      branch_pattern: req.body.pattern || 'copilot/*'
    }
  };
  
  // Trigger GitHub Actions workflow
  github.repos.createDispatchEvent({
    owner: 'your-org',
    repo: 'your-repo',
    ...payload
  });
});
```

## 📈 Performance Optimization

### Parallel Processing
For large organizations with many repositories:
```json
{
  "organization_settings": {
    "parallel_processing": true,
    "max_concurrent_repos": 10,
    "batch_size": 50
  }
}
```

### Rate Limiting
Automatic rate limiting prevents GitHub API throttling:
- Intelligent backoff strategies
- Request queuing and batching
- Progress monitoring and resumption

## 🔍 Troubleshooting

### Common Issues

**Authentication Errors**:
```bash
# Verify GitHub CLI authentication
gh auth status

# Re-authenticate if needed
gh auth login
```

**Permission Denied**:
```bash
# Check repository permissions
gh api repos/OWNER/REPO --jq '.permissions'

# Verify organization membership
gh api user/orgs --jq '.[].login'
```

**Large Organization Timeouts**:
```bash
# Use pagination and smaller batches
./scripts/universal-branch-manager.sh --repositories "org/repo1,org/repo2"
```

### Debug Mode
Enable verbose logging for troubleshooting:
```bash
export DEBUG=1
./scripts/universal-branch-manager.sh --operation list --dry-run
```

## 🎉 Benefits

### Organizational Scale
- **Complete Automation**: No manual branch management required
- **Consistent Policies**: Uniform cleanup rules across all repositories
- **Reduced Maintenance**: Automatic removal of stale development branches
- **Improved Performance**: Cleaner repositories with fewer unnecessary branches

### Developer Experience
- **No Interruption**: Automated cleanup happens transparently
- **Safety First**: Multiple protection layers prevent accidental deletions
- **Flexibility**: Configurable patterns and thresholds per project
- **Transparency**: Complete audit trails and reporting

### Infrastructure Benefits
- **Reduced Storage**: Fewer branches mean smaller repository sizes
- **Faster Operations**: Git operations are faster with fewer refs
- **Better Organization**: Clean branch namespaces improve navigation
- **Compliance**: Automated cleanup supports governance policies

---

**The Universal Multi-Repository Branch Management System provides complete automation for branch lifecycle management across your entire organization, eliminating manual overhead while maintaining safety and flexibility.**