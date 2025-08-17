# Universal Branch Management & Intelligence System

## Overview

This system provides comprehensive branch management automation across all repositories from this central location, including advanced branch intelligence, chaos prevention, and cross-repository analysis capabilities. It addresses the need for both reactive cleanup and proactive branch health monitoring.

## Key Features

### 🚀 **Immediate Automation**

- **Local Control**: Command-line script with full functionality
- **Package Scripts**: Integrated npm commands for common operations
- **GitHub Actions**: Remote automation with manual and scheduled triggers

### 🧠 **Branch Intelligence & Analysis**

- **Complexity Scoring**: Multi-factor analysis of branch complexity and deviation
- **PR/Issue Correlation**: Automatic linking of branches with related PRs and Issues
- **Chaos Prevention**: Detect "branches gone wild" scenarios before they become problems
- **Cross-Repository Intelligence**: Unified analysis across all organization repositories
- **Predictive Analytics**: Identify branches likely to become problematic

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

### Branch Management (Cleanup & Maintenance)

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

### Branch Intelligence & Analysis

```bash
# Analyze all branches for complexity and health
npm run branch-intelligence:analyze

# Generate comprehensive markdown report
npm run branch-intelligence:report

# Check for "branches gone wild" chaos scenarios
npm run branch-intelligence:chaos-check

# Get structured JSON output for automation
npm run branch-intelligence:json

# Focus on PR/Issue correlation analysis
npm run branch-intelligence:correlate
```

## Automation Triggers

### Manual Triggers

- **Local Script**: Immediate execution with full control
- **GitHub Actions**: `gh workflow run universal-branch-manager.yml`
- **Web Interface**: GitHub Actions → Universal Branch Manager → Run workflow

### Automatic Triggers

#### Branch Management

- **Weekly Cleanup**: Every Sunday at 2 AM UTC
- **Post-PR Merge**: Automatic cleanup of merged branches
- **Custom Scheduling**: Configurable via workflow modification

#### Branch Intelligence

- **Daily Analysis**: Every day at 6 AM UTC for proactive monitoring
- **PR Analysis**: Automatic complexity analysis on PR creation/updates
- **Chaos Detection**: Scheduled chaos prevention scans
- **Escalation Alerts**: Automatic issue creation for high-complexity branches

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

### Branch Intelligence Integration

- **Proactive Analysis**: Intelligence-driven cleanup decisions
- **Chaos Prevention**: Early detection of problematic branches
- **Correlation Tracking**: Links branch health to PR/Issue workflow
- **Automated Escalation**: Smart alerts for branches requiring attention
- **Cross-Repository Learning**: Pattern recognition across all repositories

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

- **Branch Management Guide**: `docs/UNIVERSAL_BRANCH_MANAGEMENT.md`
- **Branch Intelligence System**: `docs/BRANCH_INTELLIGENCE_SYSTEM.md`
- **Script Help**: `./scripts/universal-branch-manager.sh --help`
- **Intelligence Help**: `./scripts/branch-intelligence-system.sh --help`
- **Package Scripts**: Listed in `package.json`
- **Workflows**: `.github/workflows/universal-branch-manager.yml` and `.github/workflows/branch-intelligence.yml`

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
