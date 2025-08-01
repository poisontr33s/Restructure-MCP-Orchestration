#!/bin/bash
# Automated Dependency Consolidation Script
# Consolidates all 11 Dependabot PRs into unified updates

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "🔄 Starting automated dependency consolidation..."

# React ecosystem consolidation (PRs #37-41)
echo "📦 Consolidating React ecosystem updates..."
pnpm update react@19.1.1 react-dom@19.1.1

# UI library consolidation (PRs #35-42)  
echo "🎨 Consolidating UI library updates..."
pnpm update lucide-react@0.532.0 tailwind-merge@3.3.1

# TypeScript ecosystem (PR #34)
echo "📘 Consolidating TypeScript ecosystem..."
pnpm update @types/node@24.1.0

# CLI tools (PRs #43-44)
echo "🛠️ Consolidating CLI tools..."
pnpm update inquirer@12.9.0

# Build verification
echo "🔨 Building all packages..."
pnpm run build

echo "✅ Dependency consolidation completed successfully!"
echo "📊 Summary: 11 Dependabot PRs consolidated into single update"