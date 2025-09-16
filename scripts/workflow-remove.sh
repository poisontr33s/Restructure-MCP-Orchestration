#!/bin/bash

# 🏴‍☠️ Cpt. Guthilda's Workflow Removal Script
# "After the exile comes the cleansing - remove the originals safely"

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🏴‍☠️ Cpt. Guthilda's Workflow Removal Ritual 🏴‍☠️${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKFLOWS_DIR="${REPO_ROOT}/.github/workflows"
GRAVEYARD_DIR="${REPO_ROOT}/.github/workflows-graveyard"

# Only remove workflows that have been safely exiled
REMOVAL_LIST=(
    "rubyonrails.yml"
    "ruby.yml"
    "gem-push.yml"
    "cmake-multi-platform.yml"
    "jekyll-docker.yml"
    "generator-generic-ossf-slsa3-publish.yml"
)

echo -e "${YELLOW}⚠️  WARNING: This will permanently remove workflow files!${NC}"
echo -e "${CYAN}Only workflows that have been safely exiled will be removed.${NC}"
echo ""

# Verify graveyard exists and has our exile files
if [[ ! -d "$GRAVEYARD_DIR" ]]; then
    echo -e "${RED}❌ Graveyard directory not found! Run workflow-cleanup.sh first.${NC}"
    exit 1
fi

exile_count=$(find "$GRAVEYARD_DIR" -name "*.yml" | wc -l)
if [[ $exile_count -eq 0 ]]; then
    echo -e "${RED}❌ No exiled workflows found! Run workflow-cleanup.sh first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found ${exile_count} exiled workflows in graveyard${NC}"
echo ""

# Ask for confirmation
echo -e "${YELLOW}The following workflows will be PERMANENTLY REMOVED:${NC}"
for workflow in "${REMOVAL_LIST[@]}"; do
    if [[ -f "${WORKFLOWS_DIR}/${workflow}" ]]; then
        # Check if it's been exiled
        exiled_file=$(find "$GRAVEYARD_DIR" -name "*_${workflow}" | head -1)
        if [[ -n "$exiled_file" ]]; then
            echo -e "${GREEN}  ✅ ${workflow} (safely exiled)${NC}"
        else
            echo -e "${RED}  ❌ ${workflow} (NOT EXILED - will skip)${NC}"
        fi
    else
        echo -e "${BLUE}  ➖ ${workflow} (already removed)${NC}"
    fi
done

echo ""
read -p "🏴‍☠️ Proceed with removal? (type 'aye' to confirm): " confirmation

if [[ "$confirmation" != "aye" ]]; then
    echo -e "${YELLOW}🚫 Removal cancelled. No files were harmed.${NC}"
    exit 0
fi

echo ""
echo -e "${PURPLE}🗑️  Beginning removal process...${NC}"

removed_count=0
skipped_count=0

for workflow in "${REMOVAL_LIST[@]}"; do
    workflow_path="${WORKFLOWS_DIR}/${workflow}"
    
    if [[ -f "$workflow_path" ]]; then
        # Verify it's been exiled
        exiled_file=$(find "$GRAVEYARD_DIR" -name "*_${workflow}" | head -1)
        
        if [[ -n "$exiled_file" ]]; then
            echo -e "${YELLOW}🗑️  Removing: ${workflow}${NC}"
            rm "$workflow_path"
            echo -e "${GREEN}  ✅ Removed successfully${NC}"
            ((removed_count++))
        else
            echo -e "${RED}  ❌ Skipping ${workflow} - not safely exiled${NC}"
            ((skipped_count++))
        fi
    else
        echo -e "${BLUE}  ➖ ${workflow} already removed${NC}"
    fi
done

echo ""
echo -e "${PURPLE}🏴‍☠️ Removal Ritual Complete! 🏴‍☠️${NC}"
echo -e "${GREEN}✅ Workflows removed: ${removed_count}${NC}"
echo -e "${YELLOW}⚠️  Workflows skipped: ${skipped_count}${NC}"

# Update the exile report
cat >> "${GRAVEYARD_DIR}/EXILE_REPORT.md" << EOF

## Removal Log
**Removal completed:** $(date)
- **Workflows removed:** ${removed_count}
- **Workflows skipped:** ${skipped_count}

### Removed Files
$(for workflow in "${REMOVAL_LIST[@]}"; do
    if [[ ! -f "${WORKFLOWS_DIR}/${workflow}" ]]; then
        exiled_file=$(find "$GRAVEYARD_DIR" -name "*_${workflow}" | head -1)
        if [[ -n "$exiled_file" ]]; then
            echo "- ${workflow} (backed up as $(basename "$exiled_file"))"
        fi
    fi
done)

*All removed workflows can be restored from their graveyard backups if needed.*
EOF

echo ""
echo -e "${CYAN}📝 Updated exile report with removal log${NC}"
echo -e "${GREEN}🚢 The ship is cleaner! Ready for proper workflows! 🚢${NC}"
