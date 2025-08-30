# 🏴‍☠️ Captain Guthilda's Monorepo Restructure Plan

## 🎯 Current State Analysis

### Existing Structure (Mixed Legacy + MCP v2)
```
repo-root/
├── package.json ✅             # Root with shared deps
├── pnpm-workspace.yaml ✅      # Workspace config
├── packages/ ✅                # Legacy MCP structure
│   ├── cli/
│   ├── core/
│   ├── guthilda/
│   ├── monitor/
│   ├── servers/
│   └── shared/
├── mcp-v2-*/                   # New MCP v2 implementations
│   ├── mcp-v2-protocol-spec/
│   ├── mcp-v2-java-client/
│   ├── mcp-v2-typescript-client/
│   ├── mcp-v2-python-client/
│   └── mcp-v2-shared-infrastructure/
└── Docker infrastructure ✅    # Repository-OS ready
```

## 🚀 Target Structure (Monorepo Ritual Compliant)

### Phase 1: Consolidate into `packages/`
```
repo-root/
├── package.json                # All shared devDependencies & scripts
├── pnpm-workspace.yaml         # Points to 'packages/*'
├── .github/
│   └── dependabot.yml         # Watches all packages
├── .eslintrc.json             # Root linting config
├── .prettierrc                # Root formatting config
├── docker-compose.*.yml       # Repository-OS infrastructure
├── packages/
│   ├── core/                  # Legacy MCP core (keep)
│   ├── cli/                   # Legacy MCP CLI (keep)
│   ├── monitor/               # Legacy MCP monitor (keep)
│   ├── guthilda/             # Captain Guthilda's orchestrator
│   ├── shared/               # Legacy shared utilities
│   ├── servers/              # MCP server implementations
│   │   ├── base/
│   │   ├── duckduckgo/
│   │   └── sequential-thinking/
│   ├── mcp-v2-protocol/      # ← Move mcp-v2-protocol-spec here
│   ├── mcp-v2-java-client/   # ← Move here
│   ├── mcp-v2-typescript-client/ # ← Move here
│   ├── mcp-v2-python-client/ # ← Move here
│   └── mcp-v2-infrastructure/ # ← Move mcp-v2-shared-infrastructure here
└── .vscode/
    └── tasks.json            # VS Code tasks
```

## 🔧 Implementation Strategy

### Step 1: Move MCP v2 Components into `packages/`
1. Move `mcp-v2-protocol-spec/` → `packages/mcp-v2-protocol/`
2. Move `mcp-v2-java-client/` → `packages/mcp-v2-java-client/`
3. Move `mcp-v2-typescript-client/` → `packages/mcp-v2-typescript-client/`
4. Move `mcp-v2-python-client/` → `packages/mcp-v2-python-client/`
5. Move `mcp-v2-shared-infrastructure/` → `packages/mcp-v2-infrastructure/`

### Step 2: Update package.json Dependencies
1. Audit all `packages/*/package.json` files
2. Move shared devDependencies to root
3. Keep only package-specific dependencies in sub-packages
4. Update scripts to use turbo for coordinated builds

### Step 3: Update Workspace Configuration
1. Update `pnpm-workspace.yaml` to include new structure
2. Update `.github/dependabot.yml` to watch all packages
3. Validate all packages build and test correctly

### Step 4: Docker Integration
1. Update Docker files to work with new structure
2. Ensure Java-first dev container works with consolidated packages
3. Test Repository-OS workflow with new structure

## 🎯 Benefits of This Restructure

### 1. Single Source of Truth
- All packages in one `packages/` directory
- Unified dependency management
- Consistent build and test workflows

### 2. Preserved Legacy + Modern MCP v2
- Keep existing working packages/ structure
- Integrate advanced MCP v2 protocol work
- Maintain Docker Repository-OS infrastructure

### 3. Developer Experience
- Single `pnpm install` for entire project
- Unified scripts: `pnpm build`, `pnpm test`, `pnpm lint`
- Clear package boundaries and dependencies

### 4. Repository-OS Ready
- All packages work within Docker containers
- Java-first development with polyglot support
- VS Code Dev Containers integration

## ⚡ Next Steps

1. **Execute the move operations** (preserve git history)
2. **Clean up dependencies** according to monorepo ritual
3. **Test the entire system** end-to-end
4. **Validate Docker workflow** with new structure
5. **Update documentation** to reflect new organization

Would you like me to proceed with this restructure plan?
