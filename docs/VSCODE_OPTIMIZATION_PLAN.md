# VS Code Extension Optimization Plan for MCP Orchestration System

> _Following the Monorepo Ritual guidelines for optimal developer experience_ 🔥😈🏴‍☠️

## Current State Analysis

**Total Extensions:** 96 extensions installed

**Heavy Resource Consumers Identified:**

- Azure ecosystem (15+ extensions)
- Jupyter/Notebook ecosystem (6 extensions)
- .NET/C# ecosystem (6 extensions)
- Remote development (7 extensions - WSL already disabled)
- C++ development tools
- Windows AI Studio
- Multiple language servers running simultaneously

## Optimization Strategy

### Phase 1: Core MCP Development Extensions (KEEP)

#### Essential for Monorepo Development

- `dbaeumer.vscode-eslint@3.0.16` - ESLint integration for TypeScript/JavaScript
- `esbenp.prettier-vscode@11.0.0` - Code formatting (monorepo consistency)
- `ms-python.python@2025.12.0` - Python language support
- `ms-python.vscode-pylance@2025.7.1` - Python IntelliSense
- `github.copilot@1.363.1763` - AI assistance (optional but useful)
- `github.copilot-chat@0.28.5` - AI chat for development

#### Java Development (Primary Focus)

- `redhat.java@1.44.0` - Java language support
- `vscjava.vscode-java-pack@0.29.2` - Java extension pack
- `vscjava.vscode-java-debug@0.58.2` - Java debugging
- `vscjava.vscode-java-test@0.43.1` - Java testing
- `vscjava.vscode-maven@0.44.0` - Maven support
- `vscjava.vscode-gradle@3.16.4` - Gradle support
- `vscjava.vscode-spring-boot@1.63.0` - Spring Boot (if using)

#### Package Management & Monorepo

- `jacano.vscode-pnpm@0.0.3` - pnpm support (critical for monorepo)
- `linbudu.pnpm-vscode-helper@0.3.0` - Additional pnpm utilities
- `christian-kohler.npm-intellisense@1.4.5` - Package IntelliSense

#### Docker & Containers

- `ms-azuretools.vscode-containers@2.1.0` - Docker support
- `ms-vscode-remote.remote-containers@0.422.1` - Dev Containers

#### Git & Version Control

- `github.vscode-pull-request-github@0.113.2025062404` - GitHub integration
- `github.vscode-github-actions@0.27.2` - GitHub Actions
- `donjayamanne.githistory@0.6.20` - Git history visualization

#### Documentation & Markdown

- `davidanson.vscode-markdownlint@0.60.0` - Markdown linting
- `yzhang.markdown-all-in-one@3.6.3` - Markdown tooling

#### TypeScript Development

- `ms-vscode.vscode-typescript-next@6.0.20250825` - Latest TypeScript features

#### Go Support (for MCP servers)

- `golang.go@0.48.0` - Go language support

### Phase 2: Extensions to DISABLE/REMOVE

#### Azure Ecosystem (Not needed for MCP development)
```
ms-azure-load-testing.microsoft-testing
ms-azuretools.azure-dev
ms-azuretools.vscode-azure-github-copilot
ms-azuretools.vscode-azure-mcp-server
ms-azuretools.vscode-azureappservice
ms-azuretools.vscode-azurecontainerapps
ms-azuretools.vscode-azurefunctions
ms-azuretools.vscode-azureresourcegroups
ms-azuretools.vscode-azurestaticwebapps
ms-azuretools.vscode-azurestorage
ms-azuretools.vscode-azurevirtualmachines
ms-azuretools.vscode-cosmosdb
ms-vscode.azure-repos
ms-vscode.vscode-node-azure-pack
```

#### .NET/C# Ecosystem (Not needed)
```
ms-dotnettools.csdevkit
ms-dotnettools.csharp
ms-dotnettools.dotnet-maui
ms-dotnettools.vscode-dotnet-runtime
```

#### C++ Development (Not needed)
```
ms-vscode.cpptools
ms-vscode.cpptools-extension-pack
ms-vscode.cpptools-themes
ms-vscode.makefile-tools
```

#### Jupyter/Notebook Ecosystem (Resource heavy, not needed)
```
ms-toolsai.jupyter
ms-toolsai.jupyter-keymap
ms-toolsai.jupyter-renderers
ms-toolsai.vscode-jupyter-cell-tags
ms-toolsai.vscode-jupyter-slideshow
```

#### AI/ML Tools (Heavy resource usage)
```
ms-windows-ai-studio.windows-ai-studio
nvidia.nsight-vscode-edition
teamsdevapp.vscode-ai-foundry
```

#### Remote Development (WSL already disabled)
```
ms-vscode-remote.remote-ssh
ms-vscode-remote.remote-ssh-edit
ms-vscode-remote.remote-wsl (already disabled)
ms-vscode-remote.vscode-remote-extensionpack
ms-vscode.remote-explorer
ms-vscode.remote-repositories
ms-vscode.remote-server
```

#### Specialized Languages/Frameworks (Not needed for MCP)
```
shopify.ruby-lsp
batisteo.vscode-django
vmware.vscode-boot-dev-pack
vmware.vscode-spring-boot-dashboard
vmware.vscode-spring-initializr
```

#### Misc/Redundant Extensions
```
github.codespaces
ms-vscode.vscode-copilot-vision
ms-vscode.vscode-speech
ms-vscode.vscode-websearchforcopilot
google.gemini-cli-vscode-ide-companion
anthropic.claude-code
```

### Phase 3: Workspace-Specific Configuration

Create `.vscode/extensions.json` in your MCP monorepo to recommend only essential extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "redhat.java",
    "vscjava.vscode-java-pack",
    "jacano.vscode-pnpm",
    "ms-azuretools.vscode-containers",
    "ms-vscode-remote.remote-containers",
    "github.vscode-pull-request-github",
    "davidanson.vscode-markdownlint",
    "yzhang.markdown-all-in-one",
    "golang.go"
  ],
  "unwantedRecommendations": [
    "ms-toolsai.jupyter",
    "ms-dotnettools.csharp",
    "ms-vscode.cpptools",
    "ms-windows-ai-studio.windows-ai-studio"
  ]
}
```

## Implementation Plan

### Step 1: Disable Heavy Resource Extensions
```powershell
# Disable Azure extensions
code --disable-extension ms-azuretools.azure-dev
code --disable-extension ms-azuretools.vscode-azureappservice
code --disable-extension ms-azuretools.vscode-azurefunctions
# ... (continue with all Azure extensions)

# Disable .NET extensions
code --disable-extension ms-dotnettools.csdevkit
code --disable-extension ms-dotnettools.csharp

# Disable C++ extensions
code --disable-extension ms-vscode.cpptools
code --disable-extension ms-vscode.cpptools-extension-pack

# Disable AI/ML heavy extensions
code --disable-extension ms-windows-ai-studio.windows-ai-studio
code --disable-extension nvidia.nsight-vscode-edition
```

### Step 2: Configure Workspace Settings
Add to `.vscode/settings.json`:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "java.configuration.updateBuildConfiguration": "automatic",
  "java.saveActions.organizeImports": true,
  "eslint.workingDirectories": ["packages/cli", "packages/core", "packages/monitor"],
  "python.defaultInterpreterPath": "./venv/bin/python",
  "pnpm.enable": true,
  "npm.packageManager": "pnpm",
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false
}
```

### Step 3: Performance Optimizations
```json
{
  "editor.semanticHighlighting.enabled": true,
  "editor.minimap.enabled": false,
  "workbench.colorTheme": "Default Dark Modern",
  "window.titleBarStyle": "custom",
  "workbench.iconTheme": "vs-minimal",
  "editor.renderWhitespace": "none",
  "breadcrumbs.enabled": false
}
```

## Expected Benefits

1. **Memory Usage**: Reduce from ~2GB to ~800MB with active extensions
2. **Startup Time**: Faster VS Code startup (50%+ improvement)
3. **CPU Usage**: Reduced background language server overhead
4. **Focus**: Only MCP-relevant tooling and IntelliSense
5. **Monorepo Efficiency**: Optimized for pnpm workspace workflow

## Monitoring & Validation

After implementation:
1. Check VS Code memory usage in Task Manager
2. Measure startup time with `code --status`
3. Verify essential extensions still work
4. Test monorepo workflow (build, lint, test across packages)

## Emergency Rollback

If issues arise, re-enable extensions:
```powershell
code --enable-extension <extension-id>
```

Keep this optimization plan as living documentation and update as MCP system evolves.
