#!/bin/bash

# Universal Cross-Repository Bridge CLI
# Language and package manager agnostic automation system

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_TS="$SCRIPT_DIR/cross-repo-bridge.ts"
BRIDGE_JS="$SCRIPT_DIR/dist/cross-repo-bridge.js"

# Ensure TypeScript is compiled
if [ ! -f "$BRIDGE_JS" ] || [ "$BRIDGE_TS" -nt "$BRIDGE_JS" ]; then
    echo "Compiling cross-repo-bridge..."
    npx tsc "$BRIDGE_TS" --target es2020 --module commonjs --outDir "$SCRIPT_DIR/dist"
fi

# Run the bridge
node "$BRIDGE_JS" "$@"