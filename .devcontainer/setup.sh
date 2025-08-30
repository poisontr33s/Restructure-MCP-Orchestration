#!/bin/bash

# MCP v2 Cross-OS Development Environment Setup
# Runs inside container - no host dependencies

set -e

echo "🚀 Setting up MCP v2 Cross-OS Development Environment..."

# ===============================================
# Verify All Tools Are Available
# ===============================================
echo "📦 Verifying development tools..."

# Go
if command -v go &> /dev/null; then
    echo "✅ Go: $(go version)"
else
    echo "❌ Go not found"
    exit 1
fi

# Java
if command -v java &> /dev/null; then
    echo "✅ Java: $(java -version 2>&1 | head -n 1)"
else
    echo "❌ Java not found"
    exit 1
fi

# Maven
if command -v mvn &> /dev/null; then
    echo "✅ Maven: $(mvn -version | head -n 1)"
else
    echo "❌ Maven not found"
    exit 1
fi

# Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

# pnpm
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm: $(pnpm --version)"
else
    echo "❌ pnpm not found"
    exit 1
fi

# Python
if command -v python3 &> /dev/null; then
    echo "✅ Python: $(python3 --version)"
else
    echo "❌ Python not found"
    exit 1
fi

# Docker (Docker-in-Docker)
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version)"
else
    echo "❌ Docker not found"
    exit 1
fi

# ===============================================
# Install Project Dependencies
# ===============================================
echo "📚 Installing project dependencies..."

# Install Go dependencies if go.mod exists
if [ -f "go-workspace/go.mod" ]; then
    echo "Installing Go dependencies..."
    cd go-workspace
    go mod tidy
    go mod download
    cd ..
fi

# Install Node.js dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies..."
    pnpm install
fi

# Install Python dependencies for each client
if [ -d "packages/mcp-v2-python-client" ]; then
    echo "Installing Python dependencies..."
    cd packages/mcp-v2-python-client
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt
    fi
    if [ -f "pyproject.toml" ]; then
        pip3 install -e .
    fi
    cd ../..
fi

# ===============================================
# Configure Git (if not already configured)
# ===============================================
if [ ! -f "$HOME/.gitconfig" ]; then
    echo "⚙️  Configuring Git..."
    git config --global user.name "MCP v2 Developer"
    git config --global user.email "developer@mcp-v2.local"
    git config --global init.defaultBranch main
    git config --global pull.rebase false
fi

# ===============================================
# Set up Docker-in-Docker
# ===============================================
echo "🐳 Configuring Docker-in-Docker..."

# Start Docker daemon if not running
if ! docker info > /dev/null 2>&1; then
    echo "Starting Docker daemon..."
    sudo dockerd-rootless-setuptool.sh install || true
fi

# ===============================================
# Validate MCP v2 Setup
# ===============================================
echo "🧪 Running MCP v2 validation..."

if [ -f "validate-mcp-v2-implementations.js" ]; then
    echo "Running comprehensive validation..."
    node validate-mcp-v2-implementations.js || echo "⚠️  Some validation tests failed - this is normal for first setup"
else
    echo "⚠️  Validation script not found"
fi

# ===============================================
# Setup Complete
# ===============================================
echo ""
echo "🎉 MCP v2 Cross-OS Development Environment Ready!"
echo ""
echo "📋 Available Commands:"
echo "  • mcp-validate     - Run MCP v2 validation suite"
echo "  • pnpm build      - Build all packages"
echo "  • pnpm test       - Run all tests"
echo "  • docker-compose up - Start infrastructure services"
echo ""
echo "📁 Project Structure:"
echo "  • packages/mcp-v2-protocol/        - Protocol specifications"
echo "  • packages/mcp-v2-typescript-client/ - TypeScript client"
echo "  • packages/mcp-v2-java-client/     - Java client"
echo "  • packages/mcp-v2-python-client/   - Python client"
echo "  • packages/mcp-v2-infrastructure/  - Docker infrastructure"
echo "  • go-workspace/                     - Go client workspace"
echo ""
echo "🌍 This environment works on any OS - Windows, macOS, Linux!"
echo "💡 No host installations required - everything runs in container!"
echo ""
