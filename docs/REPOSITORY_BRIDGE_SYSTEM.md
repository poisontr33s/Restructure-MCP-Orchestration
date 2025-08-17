# Repository Bridge System

## Overview

The Repository Bridge System extends the MCP Orchestration System to provide a flexible, configurable way to connect and manage any main repository with its associated repositories. This system addresses the need for a universal bridge/route that can connect all branches of a main repository type to handle development workflows across multiple repositories.

## Key Features

### 🌉 **Universal Repository Bridge**
- **Flexible Main Repository**: Works with any GitHub repository as the orchestration hub
- **Dynamic Organization Support**: Automatically adapts to different GitHub organizations/users
- **Cross-Repository Routing**: Connects and manages branches across multiple related repositories
- **Type-Based Organization**: Categorize repositories by type (service, dependency, module, etc.)

### 🔧 **Configuration-Driven Management**
- **JSON Configuration**: Simple, version-controllable bridge configuration
- **CLI Management**: Easy-to-use command-line tools for bridge setup and management
- **Auto-Discovery**: Discover and connect repositories automatically
- **Validation**: Built-in configuration validation and error checking

### 🚀 **Enhanced Branch Management**
- **Bridge-Aware Operations**: Branch management operations that understand repository relationships
- **Unified Commands**: Single commands that work across all connected repositories
- **Smart Routing**: Intelligent routing of operations based on repository types and configurations
- **Safety Features**: All existing safety features plus bridge-specific protections

## Architecture

### Repository Bridge Configuration

The bridge configuration defines the relationship between a main repository and its connected repositories:

```json
{
  "mainRepository": {
    "owner": "myorg",
    "name": "main-orchestration-repo",
    "organization": "myorg"
  },
  "connectedRepositories": [
    {
      "owner": "myorg",
      "name": "service-api",
      "type": "service",
      "branchPatterns": ["copilot/*", "feature/*"],
      "enabled": true
    },
    {
      "owner": "myorg",
      "name": "shared-library",
      "type": "dependency",
      "branchPatterns": ["copilot/*", "hotfix/*"],
      "enabled": true
    }
  ],
  "bridgeConfig": {
    "defaultBranchPatterns": ["copilot/*", "feature/*", "hotfix/*"],
    "excludeBranches": ["main", "master", "develop", "production", "staging"],
    "defaultMinAgeDays": 7,
    "defaultOrganization": "myorg"
  }
}
```

### Repository Types

The system supports various repository types to help organize and manage different kinds of repositories:

- **`service`**: Microservices or standalone applications
- **`dependency`**: Shared libraries or utilities
- **`module`**: Plugin or extension modules
- **`infrastructure`**: Infrastructure as code repositories
- **`documentation`**: Documentation repositories
- **`template`**: Template or boilerplate repositories

## Getting Started

### 1. Initialize a Repository Bridge

```bash
# Using npm scripts
npm run bridge:init -- --main-repo "myorg/main-repo" --org "myorg"

# Using the script directly
./scripts/enhanced-branch-manager.sh --operation bridge-init \
  --main-repo "myorg/main-repo" --org "myorg"
```

This creates a `repository-bridge.json` configuration file in your project root.

### 2. Add Connected Repositories

```bash
# Add a service repository
npm run bridge:config -- --add-repo "myorg/api-service:service"

# Add a shared library
npm run bridge:config -- --add-repo "myorg/shared-utils:dependency"

# Add a documentation repository
npm run bridge:config -- --add-repo "myorg/project-docs:documentation"
```

### 3. View Bridge Configuration

```bash
# Show current bridge configuration
npm run bridge:config

# Validate configuration
./scripts/enhanced-branch-manager.sh --operation bridge-config
```

### 4. Manage Branches Across the Bridge

```bash
# List branches across all bridge repositories
npm run bridge:list

# Dry run branch cleanup
npm run bridge:dry-run

# Clean up old branches across all bridge repositories
npm run bridge:cleanup

# Force cleanup without confirmation
npm run bridge:cleanup-force
```

## Usage Examples

### Example 1: Setting Up a Microservices Bridge

```bash
# Initialize bridge with main orchestration repository
npm run bridge:init -- --main-repo "company/orchestration-hub" --org "company"

# Add microservices
npm run bridge:config -- --add-repo "company/user-service:service"
npm run bridge:config -- --add-repo "company/order-service:service"
npm run bridge:config -- --add-repo "company/payment-service:service"

# Add shared dependencies
npm run bridge:config -- --add-repo "company/shared-models:dependency"
npm run bridge:config -- --add-repo "company/common-utils:dependency"

# Add infrastructure
npm run bridge:config -- --add-repo "company/deployment-configs:infrastructure"

# List all repositories in the bridge
npm run bridge:list
```

### Example 2: Cleaning Up Feature Branches

```bash
# List feature branches across all bridge repositories
./scripts/enhanced-branch-manager.sh \
  --operation list \
  --repositories BRIDGE \
  --pattern "feature/*"

# Dry run cleanup for feature branches older than 14 days
./scripts/enhanced-branch-manager.sh \
  --operation dry-run \
  --repositories BRIDGE \
  --pattern "feature/*" \
  --min-age-days 14

# Execute cleanup
./scripts/enhanced-branch-manager.sh \
  --operation cleanup \
  --repositories BRIDGE \
  --pattern "feature/*" \
  --min-age-days 14 \
  --force
```

### Example 3: Cross-Organization Bridge

```bash
# Initialize bridge with external organization
npm run bridge:init -- --main-repo "external-org/main-project" --org "external-org"

# Add repositories from different organizations
npm run bridge:config -- --add-repo "external-org/core-service:service"
npm run bridge:config -- --add-repo "my-org/custom-plugin:module"
npm run bridge:config -- --add-repo "community/shared-tools:dependency"

# Manage branches across different organizations
npm run bridge:cleanup
```

## Available Commands

### npm Scripts

| Command | Description |
|---------|-------------|
| `npm run bridge` | Run enhanced branch manager (help) |
| `npm run bridge:init` | Initialize a new repository bridge |
| `npm run bridge:config` | Show bridge configuration |
| `npm run bridge:list` | List branches across bridge repositories |
| `npm run bridge:dry-run` | Show what would be deleted (safe) |
| `npm run bridge:cleanup` | Delete branches with confirmation |
| `npm run bridge:cleanup-force` | Delete branches without confirmation |

### Direct Script Usage

```bash
# Initialize bridge
./scripts/enhanced-branch-manager.sh --operation bridge-init \
  --main-repo "owner/repo" --org "organization"

# Manage bridge configuration
./scripts/enhanced-branch-manager.sh --operation bridge-config \
  --add-repo "owner/repo:type"

# Remove repository from bridge
./scripts/enhanced-branch-manager.sh --operation bridge-config \
  --remove-repo "owner/repo"

# Advanced branch management
./scripts/enhanced-branch-manager.sh \
  --operation cleanup \
  --repositories BRIDGE \
  --pattern "copilot/*" \
  --min-age-days 7 \
  --force
```

## Bridge Operations vs Traditional Operations

### Bridge Mode (`--repositories BRIDGE`)
- Uses repositories defined in bridge configuration
- Respects repository-specific branch patterns
- Applies bridge-wide settings and exclusions
- Understands repository relationships and types

### Traditional Mode (`--repositories ALL` or specific repos)
- Uses organization-wide repository discovery
- Applies uniform settings across all repositories
- Compatible with existing workflows
- No configuration file required

### Mixed Mode
- Use bridge configuration for organization discovery
- Override specific settings per operation
- Combine bridge and traditional approaches as needed

## Configuration Management

### Bridge Configuration File

The bridge configuration is stored in `repository-bridge.json` by default. You can specify a different location:

```bash
./scripts/enhanced-branch-manager.sh \
  --bridge-config "/path/to/custom-bridge.json" \
  --operation bridge-config
```

### Environment Variables

- `GITHUB_TOKEN`: GitHub personal access token for API access
- `DEBUG`: Enable debug logging (`true`/`false`)

### Configuration Validation

```bash
# Validate bridge configuration
./scripts/enhanced-branch-manager.sh --operation bridge-config

# The system will report any configuration errors:
# - Missing required fields
# - Invalid repository specifications
# - Duplicate repository entries
```

## Integration with Existing Workflows

### Backward Compatibility

The enhanced branch manager maintains full compatibility with existing workflows:

```bash
# Traditional organization-wide operations still work
./scripts/enhanced-branch-manager.sh --operation cleanup --org "myorg"

# Original universal branch manager still available
./scripts/universal-branch-manager.sh --operation cleanup
```

### CI/CD Integration

The bridge system works seamlessly with existing CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Cleanup old branches
  run: |
    npm run bridge:cleanup-force
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Migration from Universal Branch Manager

1. **Keep existing workflows**: No changes needed for current operations
2. **Gradually adopt bridge mode**: Start by initializing a bridge configuration
3. **Add repositories incrementally**: Add repositories to the bridge as needed
4. **Test with dry runs**: Use `bridge:dry-run` to verify bridge operations
5. **Switch to bridge mode**: Use `--repositories BRIDGE` when ready

## Troubleshooting

### Common Issues

#### Bridge Configuration Not Found
```
Error: Bridge configuration file not found: repository-bridge.json
```
**Solution**: Initialize the bridge first with `npm run bridge:init`

#### Invalid Repository Format
```
Error: Invalid repository format. Use: owner/name
```
**Solution**: Ensure repository specifications follow the `owner/name` format

#### No Repositories in Bridge
```
No repositories found
```
**Solution**: Add repositories to the bridge using `--add-repo`

### Debug Mode

Enable debug logging for detailed operation information:

```bash
DEBUG=true ./scripts/enhanced-branch-manager.sh --operation list --repositories BRIDGE
```

### Validation

Validate your bridge configuration:

```bash
./scripts/enhanced-branch-manager.sh --operation bridge-config
```

## Best Practices

### 1. Repository Organization
- Use descriptive repository types
- Group related repositories in the same bridge
- Keep bridge configurations in version control

### 2. Branch Patterns
- Use consistent branch naming across repositories
- Configure repository-specific patterns when needed
- Exclude production and staging branches

### 3. Safety
- Always test with dry run first
- Use appropriate minimum age thresholds
- Review configuration before major cleanups

### 4. Maintenance
- Regularly review and update bridge configurations
- Remove obsolete repositories from bridges
- Validate configurations after changes

## Advanced Usage

### Custom Bridge Configurations

```bash
# Use custom configuration file
./scripts/enhanced-branch-manager.sh \
  --bridge-config "./configs/production-bridge.json" \
  --operation list

# Override organization for specific operations
./scripts/enhanced-branch-manager.sh \
  --repositories BRIDGE \
  --org "different-org" \
  --operation dry-run
```

### Programmatic Access

```typescript
import { RepositoryBridge } from '@mcp/core';

const bridge = new RepositoryBridge('./my-bridge.json');
await bridge.initialize();

// Add repository programmatically
bridge.addConnectedRepository('myorg', 'new-service', 'service');
await bridge.saveConfig();

// Get all repositories
const repos = bridge.getAllRepositories();
console.log('Managed repositories:', repos);
```

This repository bridge system provides the foundation for creating flexible, scalable repository management workflows that can adapt to any organizational structure while maintaining the safety and control features you need for production environments.