# 🏴‍☠️ Captain Guthilda's Branch Creator

A simple, streamlined branch creation utility that follows repository conventions and integrates with the existing MCP Orchestration workflow.

## Overview

While the repository has sophisticated branch management tools for consolidation and cleanup, this utility fills the gap for everyday branch creation needs. It provides a straightforward way to create new branches for feature development without requiring the full Emergency Branch Consolidation Protocol.

## Features

- **Interactive Mode**: Guided branch creation with prompts
- **Branch Type Templates**: Predefined types following repository conventions
- **Automatic Documentation**: Creates branch info files for tracking
- **GitHub Integration**: Pushes branches to remote when possible
- **Validation**: Ensures branch names follow conventions
- **Dry Run Mode**: Preview changes before creation
- **Captain Guthilda Integration**: Follows all established patterns

## Quick Start

### Using npm Scripts (Recommended)

```bash
# Interactive mode - guided creation
pnpm branch-creator:interactive

# Create a feature branch
pnpm branch-creator:feature --description "user-authentication"

# Create a bugfix branch
pnpm branch-creator:bugfix --description "login-validation"

# Create a hotfix branch
pnpm branch-creator:hotfix --description "security-patch"

# List available branch types
pnpm branch-creator:types

# Direct script access
pnpm create-branch --help
```

### Using the Script Directly

```bash
# Interactive mode
./scripts/branch-creator.sh --interactive

# Create with type and description
./scripts/branch-creator.sh --type feature --description "user-dashboard"

# Create with explicit branch name
./scripts/branch-creator.sh feature/api-integration

# Dry run to preview
./scripts/branch-creator.sh --type bugfix --description "memory-leak" --dry-run

# Local only (no remote push)
./scripts/branch-creator.sh --type feature --description "offline-mode" --local-only
```

## Branch Types

| Type          | Purpose                            | Example                             |
| ------------- | ---------------------------------- | ----------------------------------- |
| `feature`     | New feature development            | `feature/user-authentication`       |
| `bugfix`      | Bug fixes and patches              | `bugfix/login-validation-fix`       |
| `hotfix`      | Critical urgent fixes              | `hotfix/security-patch`             |
| `enhancement` | Improvements to existing features  | `enhancement/dashboard-performance` |
| `refactor`    | Code refactoring and restructuring | `refactor/api-client-cleanup`       |
| `docs`        | Documentation updates              | `docs/api-reference-update`         |
| `test`        | Testing improvements               | `test/integration-test-suite`       |
| `copilot`     | AI-assisted development            | `copilot/feature-implementation`    |

## Interactive Mode Example

```bash
$ pnpm branch-creator:interactive

🏴‍☠️ Captain Guthilda's Branch Creator

=== Interactive Branch Creation ===
Select branch type:
1) feature - New feature development
2) bugfix - Bug fixes and patches
3) hotfix - Critical urgent fixes
4) enhancement - Improvements to existing features
5) refactor - Code refactoring and restructuring
6) docs - Documentation updates
7) test - Testing improvements
8) copilot - AI-assisted development

Enter choice (1-8): 1
Selected: feature

Enter branch description (e.g., 'user-authentication', 'fix-login-bug'): user-dashboard
Base branch (default: main):

Branch to create: feature/user-dashboard
Base branch: main
Create this branch? (y/N): y
```

## Command Line Options

```bash
./scripts/branch-creator.sh [OPTIONS] [BRANCH_NAME]

OPTIONS:
  --type TYPE           Branch type: feature, bugfix, hotfix, enhancement, refactor, docs, test, copilot
  --base-branch BRANCH  Base branch to create from (default: main)
  --org ORG            GitHub organization (default: poisontr33s)
  --repo REPO          Repository name (default: Restructure-MCP-Orchestration)
  --description DESC   Branch description for documentation
  --local-only         Create branch locally only (no GitHub API)
  --list-types         Show available branch types
  --interactive        Interactive mode for branch creation
  --dry-run            Show what would be created without making changes
  --help               Show this help message
```

## Integration with Existing Systems

### Captain Guthilda Framework

- Follows all established naming conventions
- Respects monorepo structure
- Integrates with existing pnpm scripts
- Maintains compatibility with consolidation tools

### Branch Management Ecosystem

- Works alongside `scripts/branch-consolidation.sh`
- Compatible with `scripts/universal-branch-manager.sh`
- Follows the same patterns as `scripts/dependency-batch.sh`
- Integrates with GitHub Actions workflows

### Documentation Generation

- Automatically creates `.branch-info.md` for feature branches
- Tracks branch purpose and status
- Provides template for implementation tracking
- Links with overall project documentation

## Examples

### Feature Development

```bash
# Create a new feature branch for user authentication
pnpm branch-creator:feature --description "user-authentication-system"

# Result: Creates feature/user-authentication-system branch
# Includes: Branch documentation, remote tracking, clean checkout
```

### Bug Fixes

```bash
# Create a bugfix branch for a specific issue
./scripts/branch-creator.sh --type bugfix login-timeout-issue

# Result: Creates bugfix/login-timeout-issue branch
```

### Emergency Hotfixes

```bash
# Create a hotfix branch for urgent security fix
pnpm branch-creator:hotfix --description "xss-vulnerability-patch"

# Result: Creates hotfix/xss-vulnerability-patch branch
# Ready for immediate deployment pipeline
```

### Documentation Updates

```bash
# Create a docs branch for API documentation
./scripts/branch-creator.sh --type docs --description "api-reference-v2"
```

## Branch Documentation

For feature branches, the script automatically creates a `.branch-info.md` file:

```markdown
# Branch: feature/user-authentication

## Description

user-authentication

## Base Branch

main

## Branch Information

- **Created**: Mon Aug 27 17:30:00 UTC 2025
- **Purpose**: Implementation branch for user-authentication
- **Type**: feature

## Status

- [ ] Implementation started
- [ ] Tests written
- [ ] Documentation updated
- [ ] Ready for review

## Notes

<!-- Add any relevant notes about this branch -->

---

_Created by Captain Guthilda's Branch Creator_
```

## Workflow Integration

### With Existing Scripts

```bash
# Create branch
pnpm create-branch --type feature --description "new-feature"

# Work on feature...

# Use consolidation when ready
pnpm consolidation:plan

# Use branch manager for cleanup
pnpm branch-manager:cleanup
```

### With GitHub Actions

The created branches automatically integrate with existing GitHub Actions workflows:

- CI/CD pipelines trigger on branch creation
- Pull request templates are available
- Branch protection rules apply
- Cross-repository automation works

## Error Handling

The script includes comprehensive error handling:

- Validates branch names for invalid characters
- Prevents creation of reserved branch names
- Checks for existing branches (local and remote)
- Handles network failures gracefully
- Provides clear error messages and suggestions

## Captain Guthilda's Laws

Following the established repository principles:

1. **Consistent Naming**: All branches follow the established type/description pattern
2. **Clear Documentation**: Branch purposes are documented and tracked
3. **Workflow Integration**: Works seamlessly with existing systems
4. **Monorepo Respect**: Understands and works with the monorepo structure
5. **pnpm Only**: Integrates with the pnpm-only policy

## Troubleshooting

### Common Issues

**Branch already exists**

```bash
# The script will detect this and offer to switch to existing branch
Branch feature/user-auth already exists locally
Switch to existing branch? (y/N): y
```

**No GitHub CLI access**

```bash
# Use local-only mode
./scripts/branch-creator.sh --type feature --description "my-feature" --local-only
```

**Permission issues**

```bash
# Ensure GitHub CLI is authenticated
gh auth login
```

### Debug Mode

```bash
# Use dry-run to see what would happen
./scripts/branch-creator.sh --type feature --description "test" --dry-run
```

## Future Enhancements

Planned improvements:

- Integration with issue tracking
- Template-based branch creation
- Branch lifecycle management
- Automated PR creation
- Cross-repository branch synchronization

---

_Part of Captain Guthilda's MCP Orchestration System_  
_Integrates with the Emergency Branch Consolidation Protocol and Universal Branch Management System_
