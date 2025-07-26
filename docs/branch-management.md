# Branch Management & Automation

The MCP Orchestration System now includes comprehensive branch management automation to eliminate manual cleanup tasks and provide unified control over repository maintenance.

## 🚀 Automated Branch Cleanup System

### GitHub Actions Workflow
- **File**: `.github/workflows/branch-cleanup.yml`
- **Triggers**:
  - Manual dispatch with customizable patterns
  - Automatic cleanup when PRs are merged
  - Weekly scheduled cleanup of stale branches

### Command Line Utility
- **File**: `scripts/cleanup-branches.sh`
- **Usage**: `./scripts/cleanup-branches.sh [OPTIONS] [PATTERN]`

## 🔧 Usage Examples

### Manual Cleanup (Immediate)
```bash
# Dry run to see what would be deleted
./scripts/cleanup-branches.sh --dry-run

# Delete all copilot branches older than 7 days
./scripts/cleanup-branches.sh --force copilot/*

# Delete specific branch
./scripts/cleanup-branches.sh --force my-old-branch

# Interactive cleanup with custom threshold
./scripts/cleanup-branches.sh --threshold 14 copilot/*
```

### GitHub Actions (Remote Automation)
```bash
# Trigger manual cleanup via GitHub CLI
gh workflow run branch-cleanup.yml

# Trigger with custom pattern (dry run)
gh workflow run branch-cleanup.yml \
  --field branch_pattern="feature/*" \
  --field dry_run=true

# Delete specific branch immediately
gh workflow run branch-cleanup.yml \
  --field branch_pattern="my-old-branch" \
  --field dry_run=false
```

## 🛡️ Safety Features

### Protected Branch Detection
- Automatically skips `main` and `master` branches
- Prevents accidental deletion of critical branches

### PR Integration
- Checks for open pull requests before deletion
- Automatically cleans up merged PR branches

### Age-Based Protection
- Configurable age threshold (default: 7 days)
- Only deletes branches older than threshold

### Dry Run Mode
- Preview deletions before executing
- Test patterns and thresholds safely

## ⚙️ Configuration Options

### Command Line Options
- `--dry-run`: Preview mode without actual deletion
- `--force`: Skip confirmation prompts
- `--threshold N`: Set age threshold in days
- `--help`: Show usage information

### GitHub Actions Inputs
- `branch_pattern`: Branch pattern to match (supports wildcards)
- `dry_run`: Boolean flag for preview mode

## 🔄 Automation Triggers

### Automatic Triggers
1. **PR Merge**: Immediately cleans up merged branch
2. **Weekly Schedule**: Sunday midnight UTC cleanup
3. **Manual Dispatch**: On-demand via GitHub Actions

### Pattern Matching
- `copilot/*` - All copilot branches (default)
- `feature/*` - All feature branches
- `hotfix/*` - All hotfix branches
- `specific-branch` - Exact branch name

## 📊 Monitoring & Reporting

### Command Line Output
- Color-coded status messages
- Detailed deletion reports
- Skip reasons and statistics

### GitHub Actions Logs
- Complete audit trail
- Deletion summaries
- Error reporting

## 🚦 Implementation Status

✅ **Complete Automation Coverage**
- Manual command-line tool for immediate use
- GitHub Actions workflow for remote automation
- Multiple trigger mechanisms for different scenarios
- Comprehensive safety checks and dry-run capabilities

✅ **Zero Manual Intervention Required**
- Automated detection and cleanup of stale branches
- Integration with PR lifecycle management
- Configurable policies for different branch types

This unified branch management system eliminates the need for manual branch cleanup while providing multiple interfaces for different automation scenarios. The system is now fully operational and ready for immediate use.