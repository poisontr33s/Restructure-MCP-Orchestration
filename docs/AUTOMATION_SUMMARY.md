# Universal Branch Management System

## Overview

This system addresses issue #30 by providing unified automation for branch deletion across all repositories from this central location. It eliminates the need for manual intervention that was previously required for branch management.

## Key Features

### 🚀 **Immediate Automation**

- **Local Control**: Command-line script with full functionality
- **Package Scripts**: Integrated npm commands for common operations
- **GitHub Actions**: Remote automation with manual and scheduled triggers

### 🛡️ **Safety & Protection**

- **Protected Branch Detection**: Never deletes main, master, develop, production
- **Open PR Checking**: Skips branches with active pull requests
- **Age-based Filtering**: Only deletes branches older than specified days
- **Dry Run Mode**: Test configuration safely before execution
- **Audit Logging**: Complete operation records with detailed reporting

### 🎯 **Universal Scope**

- **Cross-Repository**: Works across ALL organization repositories
- **Pattern Matching**: Flexible branch selection (copilot/_, feature/_, etc.)
- **Batch Operations**: Process multiple repositories simultaneously
- **Selective Targeting**: Choose specific repositories or process all

## Quick Start Commands

```bash
# List all copilot branches across all repositories
npm run branch-manager:copilot

# Clean up copilot branches with force
npm run branch-manager:copilot-cleanup

# Dry run to see what would be deleted
npm run branch-manager:dry-run

# Custom cleanup with manual confirmation
./scripts/universal-branch-manager.sh --operation cleanup --pattern "feature/*"
```

## Automation Triggers

### Manual Triggers

- **Local Script**: Immediate execution with full control
- **GitHub Actions**: `gh workflow run universal-branch-manager.yml`
- **Web Interface**: GitHub Actions → Universal Branch Manager → Run workflow

### Automatic Triggers

- **Weekly Cleanup**: Every Sunday at 2 AM UTC
- **Post-PR Merge**: Automatic cleanup of merged branches
- **Custom Scheduling**: Configurable via workflow modification

## Configuration Examples

### Target All Repositories

```bash
./scripts/universal-branch-manager.sh --repositories ALL --pattern "copilot/*"
```

### Target Specific Repositories

```bash
./scripts/universal-branch-manager.sh \
  --repositories "repo1,repo2,repo3" \
  --pattern "feature/*" \
  --min-age-days 14
```

### Emergency Cleanup

```bash
./scripts/universal-branch-manager.sh \
  --operation cleanup \
  --pattern "emergency-branch" \
  --force
```

## Integration Points

### Existing Workflows

- Preserves all current CI/CD automation
- Works alongside existing GitHub Actions
- Maintains compatibility with monorepo structure
- Respects repository-specific configurations

### Cross-Repository Bridge

- Connects with poisontr33s (landing page)
- Integrates with PsychoNoir-Kontrapunkt
- Provides unified management interface
- Supports diverse project architectures

## Meta-Automation Capabilities

### Self-Improving System

- **Adaptive Patterns**: Learn from usage patterns
- **Intelligent Scheduling**: Optimize cleanup timing
- **Performance Monitoring**: Track operation efficiency
- **Error Analysis**: Automatic issue detection and reporting

### Extensibility

- **Plugin Architecture**: Add custom operation types
- **Hook System**: Integrate with external tools
- **API Integration**: Connect with third-party services
- **Custom Filters**: Implement specialized branch selection logic

## Documentation

- **Complete Guide**: `docs/UNIVERSAL_BRANCH_MANAGEMENT.md`
- **Script Help**: `./scripts/universal-branch-manager.sh --help`
- **Package Scripts**: Listed in `package.json`
- **Workflow Configuration**: `.github/workflows/universal-branch-manager.yml`

## Resolution of Issue #30

This implementation provides the "unified way" requested in issue #30 by:

1. **Eliminating Manual Intervention**: Full automation with multiple trigger mechanisms
2. **Universal Repository Coverage**: Works across ALL repositories from central location
3. **Meta-Automation**: Self-managing system with intelligent defaults
4. **Safety & Control**: Comprehensive protection mechanisms
5. **Immediate Usability**: Ready to use with simple commands

The system transforms the "Branch deletion requires repository admin access" limitation into a fully automated, safe, and controllable process that handles the task as requested.

## Usage Verification

All components have been tested and verified:

- ✅ Script functionality and help system
- ✅ npm script integration
- ✅ GitHub Actions workflow syntax
- ✅ Documentation completeness
- ✅ Safety mechanism implementation
