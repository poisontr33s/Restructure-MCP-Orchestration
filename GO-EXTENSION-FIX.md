# 🔧 Immediate Fix: VS Code Go Extension Configuration

## 🎯 Problem Identified

VS Code's Go extension is:
1. **Treating root directory as Go workspace** (causing crashes)
2. **Pointing to Windows system Go** instead of project Go
3. **Missing Go tools** for the specific workspace

## ✅ Solution: Workspace-Specific Go Configuration

### Step 1: Configure VS Code Settings

Create/update `.vscode/settings.json` with Go-specific settings:

```json
{
  "go.goroot": "C:\\Users\\erdno\\go",
  "go.gopath": "C:\\Users\\erdno\\go",
  "go.toolsGopath": "C:\\Users\\erdno\\go",
  "go.inferGopath": false,
  "go.buildOnSave": "off",
  "go.lintOnSave": "off",
  "go.vetOnSave": "off",
  "go.useLanguageServer": true,
  "go.languageServerExperimentalFeatures": {
    "diagnostics": true,
    "documentLink": true
  },
  "go.alternateTools": {
    "go": "C:\\Users\\erdno\\go\\bin\\go.exe"
  },
  "files.exclude": {
    "**/go-workspace/mcp-v2-go.exe": true,
    "**/go-tools/**": true
  }
}
```

### Step 2: Exclude Go Directories from Root Workspace

Update workspace configuration to treat Go as a separate project:

```json
{
  "folders": [
    {
      "name": "MCP v2 Main",
      "path": "."
    },
    {
      "name": "Go Client",
      "path": "./go-workspace"
    }
  ],
  "settings": {
    "go.inferGopath": false,
    "files.exclude": {
      "go-workspace": false,
      "go-tools": true
    }
  }
}
```

### Step 3: Install Go Tools for Workspace

In the `go-workspace` directory, install required tools:

```bash
cd go-workspace
go install golang.org/x/tools/gopls@latest
go install github.com/ramya-rao-a/go-outline@latest
go install github.com/stamblerre/gocode@latest
```

## 🎯 Immediate Actions Needed

1. **Create proper .vscode/settings.json**
2. **Update workspace configuration**
3. **Test Go extension in go-workspace only**
4. **Verify no conflicts with root workspace**

This should resolve the Go extension issues without breaking the main workspace.
