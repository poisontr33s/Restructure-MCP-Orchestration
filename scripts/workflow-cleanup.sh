#!/bin/bash

# 🏴‍☠️ Cpt. Guthilda's Complete Workflow Cleanup Ritual 🏴‍☠️
# "When the ship is overrun with barnacles, ye need a proper scraping!"

set -euo pipefail

# Color codes for proper pirate messaging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🏴‍☠️ Ahoy! Cpt. Guthilda's Workflow Cleanup Ritual Begins! 🏴‍☠️${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKFLOWS_DIR="${REPO_ROOT}/.github/workflows"
GRAVEYARD_DIR="${REPO_ROOT}/.github/workflows-graveyard"

# Ensure graveyard exists
mkdir -p "${GRAVEYARD_DIR}"

# Define workflows to exile (obviously illegitimate)
EXILE_LIST=(
    "rubyonrails.yml:Ruby on Rails CI - Not our tech stack"
    "ruby.yml:Ruby workflow - Not our tech stack" 
    "gem-push.yml:Ruby gem publishing - Not our tech stack"
    "cmake-multi-platform.yml:CMake builds - C++ projects, not TypeScript"
    "jekyll-docker.yml:Jekyll static site - Not our tech stack"
    "generator-generic-ossf-slsa3-publish.yml:Generic OSSF publishing - Not specific to our needs"
)

# Define workflows to keep (definitely legitimate)
KEEP_LIST=(
    "ci.yml:Main CI/CD pipeline"
    "captain-guthilda.yml:The Captain's orchestration workflow"
    "agent-claude.yml:Claude agent integration"
    "agents-discovery.yml:Agent discovery systems"
    "agents-invoke.yml:Agent invocation workflows" 
    "claude-code-review.yml:Code review automation"
    "pages.yml:GitHub Pages documentation"
    "release.yml:Package release automation"
    "codeql.yml:Security scanning"
    "universal-branch-manager.yml:Branch management"
    "emergency-consolidation.yml:Emergency response"
    "artifact-v4-test.yml:Artifact handling tests"
)

# Define workflows that need manual review
REVIEW_LIST=(
    "static.yml"
    "performance.yml"
    "security.yml"
    "triage.yml"
    "stale.yml"
    "sub-issues.yml"
    "project-auto-add.yml"
    "label.yml"
    "summary.yml"
    "repo-hygiene-report.yml"
    "docker-image.yml"
)

exile_workflow() {
    local workflow_entry="$1"
    local workflow_file="${workflow_entry%%:*}"
    local reason="${workflow_entry#*:}"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local source_path="${WORKFLOWS_DIR}/${workflow_file}"
    local dest_path="${GRAVEYARD_DIR}/${timestamp}_${workflow_file}"
    
    if [[ -f "$source_path" ]]; then
        echo -e "${YELLOW}⚰️  Exiling: ${workflow_file}${NC}"
        echo -e "${CYAN}   Reason: ${reason}${NC}"
        
        # Add exile header to the file
        {
            echo "# EXILED WORKFLOW - $(date)"
            echo "# Original: .github/workflows/${workflow_file}"
            echo "# Reason: ${reason}"
            echo "# Recovery: This file can be restored if needed"
            echo ""
            cat "$source_path"
        } > "$dest_path"
        
        # Remove original (we'll do this in a separate step for safety)
        echo "   📋 Copied to: ${dest_path}"
    else
        echo -e "${RED}❌ Workflow not found: ${workflow_file}${NC}"
    fi
}

echo -e "${BLUE}📊 Phase 1: Exiling Obviously Illegitimate Workflows${NC}"
echo ""

for workflow_entry in "${EXILE_LIST[@]}"; do
    exile_workflow "$workflow_entry"
done

echo ""
echo -e "${GREEN}✅ Phase 1 Complete - Workflows Safely Exiled${NC}"
echo ""

echo -e "${YELLOW}📋 Phase 2: Workflows Marked for Manual Review${NC}"
for workflow in "${REVIEW_LIST[@]}"; do
    if [[ -f "${WORKFLOWS_DIR}/${workflow}" ]]; then
        echo -e "${CYAN}🔍 Review needed: ${workflow}${NC}"
    fi
done

echo ""
echo -e "${GREEN}📊 Phase 3: Confirmed Legitimate Workflows${NC}"
for workflow_entry in "${KEEP_LIST[@]}"; do
    workflow_file="${workflow_entry%%:*}"
    description="${workflow_entry#*:}"
    if [[ -f "${WORKFLOWS_DIR}/${workflow_file}" ]]; then
        echo -e "${GREEN}✅ Keeping: ${workflow_file} - ${description}${NC}"
    else
        echo -e "${RED}❌ Missing: ${workflow_file} - ${description}${NC}"
    fi
done

echo ""
echo -e "${PURPLE}📝 Creating Exile Report...${NC}"

# Create comprehensive report
cat > "${GRAVEYARD_DIR}/EXILE_REPORT.md" << EOF
# 🏴‍☠️ Cpt. Guthilda's Workflow Exile Report

**Generated:** $(date)
**Operation:** Workflow Disintegration and Consolidation

## Summary
- **Total workflows examined:** $(find "${WORKFLOWS_DIR}" -name "*.yml" -o -name "*.yaml" 2>/dev/null | wc -l)
- **Workflows exiled:** ${#EXILE_LIST[@]}
- **Workflows kept:** ${#KEEP_LIST[@]} 
- **Workflows requiring review:** ${#REVIEW_LIST[@]}

## Exiled Workflows
$(for entry in "${EXILE_LIST[@]}"; do
    workflow="${entry%%:*}"
    reason="${entry#*:}"
    echo "- **${workflow}**: ${reason}"
done)

## Kept Workflows  
$(for entry in "${KEEP_LIST[@]}"; do
    workflow="${entry%%:*}"
    description="${entry#*:}"
    echo "- **${workflow}**: ${description}"
done)

## Workflows Requiring Manual Review
$(for workflow in "${REVIEW_LIST[@]}"; do
    if [[ -f "${WORKFLOWS_DIR}/${workflow}" ]]; then
        echo "- **${workflow}**: Needs manual inspection"
    fi
done)

## Recovery Instructions
All exiled workflows are stored in this graveyard directory with timestamps.
To restore a workflow:
1. Locate the timestamped file in this directory
2. Remove the exile header (first 5 lines)
3. Copy back to .github/workflows/

## Next Steps
1. Manual review of flagged workflows
2. Remove original exiled workflow files
3. Create missing essential monorepo workflows
4. Test all remaining workflows

---
*"The ship be cleaned, but the voyage ain't over till all hands are tested!"* - Cpt. Guthilda
EOF

echo -e "${GREEN}📄 Report created: ${GRAVEYARD_DIR}/EXILE_REPORT.md${NC}"

echo ""
echo -e "${PURPLE}🏴‍☠️ Phase 1 Complete! 🏴‍☠️${NC}"
echo -e "${CYAN}Next steps:${NC}"
echo -e "${YELLOW}1. Review the exile report${NC}"
echo -e "${YELLOW}2. Manually inspect workflows requiring review${NC}"
echo -e "${YELLOW}3. Run the removal script to delete original exiled files${NC}"
echo -e "${YELLOW}4. Create essential monorepo workflows${NC}"

echo ""
echo -e "${GREEN}🚢 The workflow tempest has been tamed! Ready for consolidation! 🚢${NC}"
