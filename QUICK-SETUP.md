# 🚀 MCP v2 Quick Setup Guide - Container-First Approach

## 🎯 Philosophy: Zero Host Dependencies

This setup eliminates the need for **ANY** host OS installations while providing a consistent, cross-platform development experience.

### ✅ What This Solves:
- **Cross-OS Compatibility**: Same experience on Windows, macOS, Linux
- **No Duplicate Installations**: No host + container redundancy  
- **IDE-Centric Development**: VS Code handles everything
- **Zero Host Pollution**: Keep your OS clean
- **Instant Onboarding**: Clone and develop immediately

## 🛠️ Setup Instructions

### Option 1: VS Code Dev Containers (Recommended)

**Prerequisites (Any OS):**
- VS Code
- Dev Containers extension
- Docker Engine (can be Docker Desktop, Docker Engine, or Podman)

**Setup Steps:**
```bash
# 1. Clone repository
git clone <repository-url>
cd mcp-v2-project

# 2. Open in VS Code
code .

# 3. When prompted, click "Reopen in Container"
# 4. Wait for container build (first time only)
# 5. Start developing! 🎉
```

### Option 2: GitHub Codespaces (Zero Local Install)

**Prerequisites:**
- Web browser
- GitHub account

**Setup Steps:**
1. Go to repository on GitHub
2. Click "Code" → "Codespaces" → "Create codespace"
3. Wait for environment setup
4. Start developing in browser! 🎉

### Option 3: Manual Container Setup

**Prerequisites:**
- Docker or Podman

**Setup Steps:**
```bash
# 1. Clone repository
git clone <repository-url>
cd mcp-v2-project

# 2. Build and run development container
docker-compose -f .devcontainer/docker-compose-cross-os.yml up -d

# 3. Attach to container
docker exec -it mcp-v2-dev-environment bash

# 4. Start developing! 🎉
```

## 🔧 What's Included in the Container

### Programming Languages & Tools:
- **Go 1.21+** (complete toolchain)
- **Java 21 LTS** + Maven 3.9.9
- **Node.js 20** + pnpm
- **Python 3.11+** + Poetry
- **Rust** (for additional tooling)

### Development Environment:
- **Docker-in-Docker** (test orchestration without host Docker Desktop)
- **VS Code Extensions** (automatically installed and configured)
- **Git Configuration** (pre-configured)
- **Shell Aliases** (convenient shortcuts)

### MCP v2 Specific:
- **Protocol Validation Tools**
- **Client Library Dependencies**
- **Infrastructure Testing**
- **Cross-language Development Support**

## 🎯 Development Workflow

### Daily Development:
```bash
# Open project in container
code .  # VS Code will prompt to reopen in container

# Validate everything is working
mcp-validate

# Build all clients
pnpm build

# Run tests
pnpm test

# Test infrastructure
docker-compose up -d
```

### Language-Specific Commands:
```bash
# Go development
cd go-workspace
go mod tidy
go build
go test

# Java development  
cd packages/mcp-v2-java-client
mvn clean compile
mvn test

# TypeScript development
cd packages/mcp-v2-typescript-client
pnpm build
pnpm test

# Python development
cd packages/mcp-v2-python-client
python -m pytest
```

## 🌍 Cross-OS Benefits

### For Windows Users:
- No WSL2 complexity
- No Docker Desktop licensing concerns
- Works with any container runtime
- Consistent with Linux developers

### For macOS Users:
- No Homebrew dependency management
- Consistent ARM64/x86_64 experience
- Same environment as CI/CD

### For Linux Users:
- No package manager differences
- Works with Docker, Podman, or any OCI runtime
- Consistent across distributions

## 🔄 Migration from Host-Based Setup

If you previously installed tools on your host OS:

1. **Keep them** - no need to uninstall
2. **Use container for MCP v2** - avoid conflicts
3. **Gradually migrate** other projects to container-first
4. **Eventually clean up** host installations if desired

## 🆘 Troubleshooting

### Container Won't Start:
```bash
# Check Docker is running
docker info

# Rebuild container
docker-compose -f .devcontainer/docker-compose-cross-os.yml build --no-cache

# Check logs
docker-compose -f .devcontainer/docker-compose-cross-os.yml logs
```

### VS Code Extension Issues:
1. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Rebuild container: `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

### Performance Issues:
- Use `cached` or `delegated` volume mounts
- Consider using named volumes for node_modules
- Allocate more resources to Docker

## 📞 Support

- **Container Issues**: Check `.devcontainer/` configuration
- **Language Tools**: All pre-installed and configured
- **VS Code**: Extensions auto-configured for container paths
- **Docker**: Uses Docker-in-Docker for orchestration testing

**Remember**: This approach works identically on Windows, macOS, and Linux! 🌍
