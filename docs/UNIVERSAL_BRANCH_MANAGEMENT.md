# Universal Cross-Repository Branch Management

This system provides automated branch management across all repositories in the organization from this central location.

## 🚀 Quick Start

### Immediate Usage

```bash
# List all copilot branches across all repositories
npm run branch-manager:copilot

# Clean up copilot branches immediately (with confirmation)
npm run branch-manager:copilot-cleanup

# Dry run to see what would be deleted
npm run branch-manager:dry-run
```

### GitHub Actions (Remote Automation)

#### Manual Trigger

```bash
# Via GitHub CLI
gh workflow run universal-branch-manager.yml \
  --field operation=cleanup \
  --field repositories=ALL \
  --field branch_pattern="copilot/*"

# Via GitHub web interface
# Go to Actions → Universal Branch Manager → Run workflow
```

#### Automatic Triggers

- **Weekly scheduled cleanup**: Every Sunday at 2 AM UTC
- **Post-PR merge cleanup**: Automatically cleans up the merged branch
- **Pattern-based filtering**: Configurable branch patterns and exclusions

## 📋 Available Operations

### Local Commands (npm scripts)

| Command                                  | Description                             |
| ---------------------------------------- | --------------------------------------- |
| `npm run branch-manager:list`            | List branches matching default criteria |
| `npm run branch-manager:dry-run`         | Show what would be deleted (safe)       |
| `npm run branch-manager:cleanup`         | Delete branches with confirmation       |
| `npm run branch-manager:cleanup-force`   | Delete branches without confirmation    |
| `npm run branch-manager:copilot`         | List all copilot/\* branches            |
| `npm run branch-manager:copilot-cleanup` | Force cleanup copilot/\* branches       |

### Direct Script Usage

```bash
# Basic usage
./scripts/universal-branch-manager.sh --operation list --pattern "copilot/*"

# Advanced usage with custom settings
./scripts/universal-branch-manager.sh \
  --operation cleanup \
  --repositories "repo1,repo2,repo3" \
  --pattern "feature/*" \
  --exclude "main,master,develop,production,staging" \
  --min-age-days 14 \
  --force
```

## ⚙️ Configuration Options

### Operation Types

- **`list`**: Display branches matching criteria (safe, read-only)
- **`dry-run`**: Show what would be deleted without making changes
- **`cleanup`**: Actually delete the matching branches

### Repository Targeting

- **`ALL`**: Process all repositories in the organization (default)
- **`repo1,repo2,repo3`**: Comma-separated list of specific repositories

### Branch Patterns

- **`copilot/*`**: All branches starting with "copilot/" (default)
- **`feature/*`**: All feature branches
- **`bugfix/*`**: All bugfix branches
- **`exact-branch-name`**: Target a specific branch

### Safety Mechanisms

- **Exclude patterns**: Protected branches (main, master, develop, production)
- **Age-based filtering**: Only delete branches older than specified days
- **Open PR detection**: Skip branches with open pull requests
- **Confirmation prompts**: Ask before deletion (unless `--force`)

## 🛡️ Safety Features

### Built-in Protection

1. **Protected branch detection**: Never deletes main, master, develop, production
2. **Open PR checking**: Skips branches with active pull requests
3. **Age thresholds**: Only deletes branches older than specified days
4. **Dry run mode**: Test your configuration safely
5. **Audit logging**: Complete records of all operations

### Repository Access

- Uses GitHub CLI authentication
- Respects repository permissions
- Fails gracefully for inaccessible repositories
- Provides detailed error messages

## 📊 Monitoring & Auditing

### Audit Logs

All operations generate detailed audit logs including:

- Timestamp and trigger source
- Repository and branch details
- Operation type and parameters
- Success/failure status

### GitHub Actions Artifacts

- Individual repository audit logs (30 days retention)
- Consolidated summary reports (90 days retention)
- Downloadable for compliance and review

## 🔧 Prerequisites

### Local Usage

1. **GitHub CLI**: Install from https://cli.github.com/
2. **Authentication**: Run `gh auth login`
3. **Permissions**: Repository admin access for branch deletion

### GitHub Actions

- Repository permissions configured in workflow
- Uses `GITHUB_TOKEN` for authentication
- Works across all organization repositories

## 💡 Examples

### Common Scenarios

#### 1. Clean up all copilot branches older than 7 days

```bash
npm run branch-manager:copilot-cleanup
```

#### 2. List feature branches across specific repositories

```bash
./scripts/universal-branch-manager.sh \
  --operation list \
  --repositories "MCP-Orchestration,PsychoNoir-Kontrapunkt" \
  --pattern "feature/*"
```

#### 3. Safe cleanup with age filter

```bash
./scripts/universal-branch-manager.sh \
  --operation cleanup \
  --pattern "copilot/*" \
  --min-age-days 14 \
  --exclude "main,master,develop,production,staging"
```

#### 4. Emergency cleanup of specific branch across all repos

```bash
./scripts/universal-branch-manager.sh \
  --operation cleanup \
  --pattern "emergency-branch-name" \
  --force
```

### GitHub Actions Triggers

#### Manual with custom parameters

```bash
gh workflow run universal-branch-manager.yml \
  --field operation=dry-run \
  --field repositories="repo1,repo2" \
  --field branch_pattern="hotfix/*" \
  --field min_age_days="3"
```

#### Scheduled automation

The workflow runs automatically every Sunday at 2 AM UTC with these defaults:

- Operation: cleanup
- Pattern: copilot/\*
- Exclude: main,master,develop,production
- Min age: 7 days

## 🆘 Troubleshooting

### Common Issues

#### 1. "gh: command not found"

Install GitHub CLI: https://cli.github.com/

#### 2. "GitHub CLI is not authenticated"

Run: `gh auth login`

#### 3. "Failed to delete branch"

- Check repository permissions
- Verify branch isn't protected
- Ensure no open pull requests

#### 4. "No repositories found"

- Verify organization name
- Check authentication and permissions
- Test with specific repository list

### Getting Help

```bash
./scripts/universal-branch-manager.sh --help
```

## 🔄 Integration with Existing Workflows

This system integrates seamlessly with your existing automation:

- Preserves all existing CI/CD workflows
- Works alongside existing GitHub Actions
- Maintains audit trails for compliance
- Respects repository-specific configurations

The universal branch manager provides the unified automation you requested while maintaining complete safety and control over the process.
