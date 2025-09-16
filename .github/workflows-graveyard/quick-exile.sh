#!/bin/bash

# Cpt. Guthilda's Quick Workflow Exile List
# These workflows are clearly not for our TypeScript/Node.js/pnpm MCP system

ILLEGITIMATE_WORKFLOWS=(
    "rubyonrails.yml"
    "ruby.yml" 
    "gem-push.yml"
    "cmake-multi-platform.yml"
    "jekyll-docker.yml"
    "docker-image.yml"
    "generator-generic-ossf-slsa3-publish.yml"
)

WORKFLOWS_DIR="/workspaces/Restructure-MCP-Orchestration/.github/workflows"
GRAVEYARD_DIR="/workspaces/Restructure-MCP-Orchestration/.github/workflows-graveyard"

echo "🏴‍☠️ Moving illegitimate workflows to graveyard..."

for workflow in "${ILLEGITIMATE_WORKFLOWS[@]}"; do
    if [[ -f "${WORKFLOWS_DIR}/${workflow}" ]]; then
        timestamp=$(date +"%Y%m%d_%H%M%S")
        new_name="${timestamp}_${workflow}"
        echo "⚰️ Exiling: ${workflow} -> ${new_name}"
        mv "${WORKFLOWS_DIR}/${workflow}" "${GRAVEYARD_DIR}/${new_name}"
    else
        echo "⚠️ Workflow not found: ${workflow}"
    fi
done

echo "✅ Exile complete!"
