#!/bin/bash

# 🏴‍☠️ Cpt. Guthilda's Workflow Disintegrator & Consolidator 🏴‍☠️
# "When workflows multiply like barnacles, ye need a proper scraping tool!"

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOWS_DIR="${REPO_ROOT}/.github/workflows"
GRAVEYARD_DIR="${REPO_ROOT}/.github/workflows-graveyard"

# Colors for the ritual
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🏴‍☠️ Ahoy! Cpt. Guthilda's Workflow Disintegrator Ready for Battle! 🏴‍☠️${NC}"
echo -e "${CYAN}⚓ Preparing to clean up the workflow tempest...${NC}"

# Create graveyard if it doesn't exist
mkdir -p "${GRAVEYARD_DIR}"

# Function to identify legitimate workflows for a TypeScript/Node.js monorepo
is_legitimate_workflow() {
    local workflow_file="$1"
    local filename=$(basename "$workflow_file")
    
    # Read first 20 lines to check content
    local content=$(head -20 "$workflow_file" 2>/dev/null || echo "")
    
    # Legitimate patterns for our MCP orchestration system
    if [[ "$content" =~ (node|pnpm|typescript|turbo|mcp|orchestr|monitor) ]] || \
       [[ "$filename" =~ ^(ci|build|test|deploy|release|pages|dependabot)\.ya?ml$ ]] || \
       [[ "$filename" =~ ^(agent-|claude-|guthilda) ]] && [[ "$content" =~ (mcp|orchestr|guthilda) ]]; then
        return 0  # Legitimate
    fi
    
    # Check for specific illegitimate patterns
    if [[ "$content" =~ (ruby|rails|cmake|python|java|go|rust|docker|postgres|mysql) ]] && \
       [[ ! "$content" =~ (mcp|orchestr) ]]; then
        return 1  # Illegitimate
    fi
    
    # Default to legitimate if uncertain (we'll review manually)
    return 0
}

# Function to move workflow to graveyard
exile_workflow() {
    local workflow_file="$1"
    local filename=$(basename "$workflow_file")
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local new_name="${timestamp}_${filename}"
    
    echo -e "${YELLOW}  ⚰️  Exiling: ${filename}${NC}"
    mv "$workflow_file" "${GRAVEYARD_DIR}/${new_name}"
}

# Main workflow analysis and cleanup
echo -e "${BLUE}📊 Analyzing workflows...${NC}"

if [[ ! -d "$WORKFLOWS_DIR" ]]; then
    echo -e "${RED}❌ No .github/workflows directory found!${NC}"
    exit 1
fi

cd "$WORKFLOWS_DIR"

total_workflows=$(find . -name "*.yml" -o -name "*.yaml" | wc -l)
echo -e "${CYAN}🔍 Found ${total_workflows} workflow files to examine...${NC}"

illegitimate_count=0
legitimate_count=0

for workflow in *.yml *.yaml 2>/dev/null; do
    [[ -f "$workflow" ]] || continue
    
    echo -e "${CYAN}🔍 Examining: ${workflow}${NC}"
    
    if is_legitimate_workflow "$workflow"; then
        echo -e "${GREEN}  ✅ Legitimate: ${workflow}${NC}"
        ((legitimate_count++))
    else
        echo -e "${RED}  ❌ Illegitimate: ${workflow}${NC}"
        exile_workflow "$workflow"
        ((illegitimate_count++))
    fi
done

echo -e "${PURPLE}🏴‍☠️ Workflow Cleanup Complete! 🏴‍☠️${NC}"
echo -e "${GREEN}✅ Legitimate workflows: ${legitimate_count}${NC}"
echo -e "${RED}⚰️  Exiled workflows: ${illegitimate_count}${NC}"
echo -e "${YELLOW}📁 Exiled workflows stored in: ${GRAVEYARD_DIR}${NC}"

# Create a summary report
cat > "${GRAVEYARD_DIR}/exile_report.md" << EOF
# Workflow Exile Report
## Generated: $(date)

### Summary
- **Total workflows examined:** ${total_workflows}
- **Legitimate workflows kept:** ${legitimate_count}
- **Workflows exiled:** ${illegitimate_count}

### Exiled Workflows
$(ls -la "${GRAVEYARD_DIR}" | grep -E '\.ya?ml$' | awk '{print "- " $9}')

### Reasoning
Workflows were exiled if they contained technology patterns incompatible with our TypeScript/Node.js/pnpm MCP orchestration system, such as:
- Ruby on Rails
- CMake
- Python-specific workflows
- Docker builds unrelated to MCP
- Database-specific workflows (Postgres, MySQL) without MCP context

### Recovery
If any exiled workflow is needed, it can be restored from this graveyard directory.
EOF

echo -e "${CYAN}📝 Exile report created: ${GRAVEYARD_DIR}/exile_report.md${NC}"

# Now let's create the essential workflows for our monorepo
echo -e "${PURPLE}🔧 Creating essential monorepo workflows...${NC}"

# We'll create these in the next step
echo -e "${GREEN}🏁 Workflow disintegration complete! Ready for reconstruction...${NC}"
