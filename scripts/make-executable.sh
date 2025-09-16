#!/bin/bash

# Make all workflow scripts executable
chmod +x /workspaces/Restructure-MCP-Orchestration/scripts/workflow-*.sh

echo "🏴‍☠️ All workflow scripts are now executable!"
echo ""
echo "Available commands:"
echo "  pnpm workflows:analyze     - Analyze current workflow chaos"
echo "  pnpm workflows:exile       - Move bad workflows to graveyard"  
echo "  pnpm workflows:remove      - Remove exiled workflows"
echo "  pnpm workflows:consolidate - Create proper workflows"
echo "  pnpm workflows:all         - Complete consolidation"
echo ""
echo "Ready to clean up the workflow tempest! 🌊"
