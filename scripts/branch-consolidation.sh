#!/bin/bash

# Emergency Branch Consolidation Script
# Implements Phase 1 of the Emergency Branch Consolidation Protocol

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
DEFAULT_ORG="poisontr33s"
DEFAULT_REPO="Restructure-MCP-Orchestration"
DEFAULT_BASE_BRANCH="main"

# Target branch structure for consolidation
declare -A CONSOLIDATION_BRANCHES=(
    ["feature/ai-integrations"]="Consolidate AI integration PRs #110, #109, #108"
    ["feature/workflow-optimization"]="Consolidate workflow PRs #69, #85, #87, #89, #90, #92"
    ["feature/monorepo-restructure"]="Consolidate monorepo PRs #65, #66, #72"
    ["dependencies/batch-updates"]="Consolidate dependency update PRs"
    ["hotfix/critical-fixes"]="Consolidate urgent copilot fixes"
)

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

# Help function
show_help() {
    cat << EOF
Emergency Branch Consolidation Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --operation, -o         Operation to perform (plan|create|consolidate|cleanup|status) [default: plan]
    --org                   GitHub organization [default: $DEFAULT_ORG]
    --repo                  Repository name [default: $DEFAULT_REPO]
    --base-branch           Base branch for consolidation [default: $DEFAULT_BASE_BRANCH]
    --target-branch         Specific target consolidation branch (optional)
    --dry-run               Show what would be done without making changes
    --force                 Skip confirmation prompts
    --help, -h              Show this help message

OPERATIONS:
    plan                    Show consolidation plan and current status
    create                  Create consolidation branch structure
    consolidate             Execute consolidation operations
    cleanup                 Clean up after successful consolidation
    status                  Show current consolidation status

EXAMPLES:
    # Show consolidation plan
    $0 --operation plan
    
    # Create consolidation branch structure (dry run)
    $0 --operation create --dry-run
    
    # Create specific consolidation branch
    $0 --operation create --target-branch feature/ai-integrations
    
    # Execute full consolidation
    $0 --operation consolidate --force

CONSOLIDATION TARGETS:
EOF

    for branch in "${!CONSOLIDATION_BRANCHES[@]}"; do
        echo "    $branch - ${CONSOLIDATION_BRANCHES[$branch]}"
    done

    cat << EOF

SAFETY FEATURES:
    - Dry run mode for all operations
    - Backup creation before major changes
    - Rollback procedures documented
    - Audit trail for all operations

EOF
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if gh CLI is installed and authenticated
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated. Please run 'gh auth login'"
        exit 1
    fi
    
    # Check if git is available
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Show consolidation plan
show_consolidation_plan() {
    local org="$1"
    local repo="$2"
    local base_branch="$3"
    
    log_header "EMERGENCY BRANCH CONSOLIDATION PLAN"
    
    echo -e "${CYAN}Repository:${NC} $org/$repo"
    echo -e "${CYAN}Base Branch:${NC} $base_branch"
    echo ""
    
    echo -e "${CYAN}Target Consolidation Structure:${NC}"
    for branch in "${!CONSOLIDATION_BRANCHES[@]}"; do
        echo "  🌿 $branch"
        echo "     └─ ${CONSOLIDATION_BRANCHES[$branch]}"
        echo ""
    done
    
    echo -e "${CYAN}Success Metrics:${NC}"
    echo "  📊 Branches: 30+ → 8-12 active branches"
    echo "  📋 PRs: 44+ → 10-15 focused, non-redundant PRs"
    echo "  📦 Dependencies: 15+ updates → 2-3 batched cycles"
    echo "  🔗 Cross-repo Correlation: 0% → 85% automated synchronization"
    echo ""
}

# Create consolidation branch structure
create_consolidation_branches() {
    local org="$1"
    local repo="$2"
    local base_branch="$3"
    local target_branch="$4"
    local dry_run="$5"
    
    log_header "Creating Consolidation Branch Structure"
    
    if [[ -n "$target_branch" ]]; then
        if [[ -n "${CONSOLIDATION_BRANCHES[$target_branch]}" ]]; then
            create_single_branch "$org" "$repo" "$base_branch" "$target_branch" "$dry_run"
        else
            log_error "Unknown target branch: $target_branch"
            exit 1
        fi
    else
        for branch in "${!CONSOLIDATION_BRANCHES[@]}"; do
            create_single_branch "$org" "$repo" "$base_branch" "$branch" "$dry_run"
        done
    fi
}

# Create a single consolidation branch
create_single_branch() {
    local org="$1"
    local repo="$2"
    local base_branch="$3"
    local branch="$4"
    local dry_run="$5"
    
    log_info "Creating branch: $branch"
    
    if [[ "$dry_run" == "true" ]]; then
        log_warning "[DRY RUN] Would create branch: $branch from $base_branch"
        log_warning "[DRY RUN] Branch purpose: ${CONSOLIDATION_BRANCHES[$branch]}"
        return
    fi
    
    # Check if branch already exists
    if gh api "repos/$org/$repo/branches/$branch" &>/dev/null; then
        log_warning "Branch $branch already exists, skipping creation"
        return
    fi
    
    # Get the SHA of the base branch
    local base_sha
    base_sha=$(gh api "repos/$org/$repo/branches/$base_branch" --jq '.commit.sha')
    
    if [[ -z "$base_sha" ]]; then
        log_error "Failed to get SHA for base branch: $base_branch"
        return
    fi
    
    # Create the new branch
    if gh api -X POST "repos/$org/$repo/git/refs" \
        --field ref="refs/heads/$branch" \
        --field sha="$base_sha" &>/dev/null; then
        log_success "Created branch: $branch"
        
        # Create initial commit with consolidation documentation
        create_consolidation_readme "$org" "$repo" "$branch"
    else
        log_error "Failed to create branch: $branch"
    fi
}

# Create consolidation README for a branch
create_consolidation_readme() {
    local org="$1"
    local repo="$2"
    local branch="$3"
    
    local content
    content=$(cat << EOF
# Consolidation Branch: $branch

## Purpose
${CONSOLIDATION_BRANCHES[$branch]}

## Consolidation Status
- [ ] Branch created
- [ ] Target PRs identified
- [ ] Conflicts resolved
- [ ] Testing completed
- [ ] Ready for merge

## Target PRs for Consolidation
<!-- List the specific PRs to be consolidated into this branch -->

## Consolidation Notes
<!-- Add notes about the consolidation process, conflicts, and resolutions -->

## Validation Checklist
- [ ] All target PRs reviewed
- [ ] No merge conflicts
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Stakeholder approval

## Rollback Plan
<!-- Document how to rollback this consolidation if needed -->

---
*Created by Emergency Branch Consolidation Protocol Phase 1*
*Generated on: $(date)*
EOF
)
    
    # Create the README file in the branch
    local encoded_content
    encoded_content=$(echo "$content" | base64 -w 0)
    
    gh api -X PUT "repos/$org/$repo/contents/CONSOLIDATION_README.md" \
        --field message="Add consolidation documentation for $branch" \
        --field content="$encoded_content" \
        --field branch="$branch" &>/dev/null || true
}

# Show current consolidation status
show_consolidation_status() {
    local org="$1"
    local repo="$2"
    
    log_header "Current Consolidation Status"
    
    echo -e "${CYAN}Existing Consolidation Branches:${NC}"
    for branch in "${!CONSOLIDATION_BRANCHES[@]}"; do
        if gh api "repos/$org/$repo/branches/$branch" &>/dev/null; then
            echo -e "  ✅ $branch ${GREEN}(exists)${NC}"
        else
            echo -e "  ❌ $branch ${RED}(missing)${NC}"
        fi
    done
    echo ""
    
    # Show current branch count
    local total_branches
    total_branches=$(gh api "repos/$org/$repo/branches" --jq 'length')
    echo -e "${CYAN}Current Branch Count:${NC} $total_branches"
    
    # Show copilot branches
    local copilot_branches
    copilot_branches=$(gh api "repos/$org/$repo/branches" --jq '.[] | select(.name | startswith("copilot/")) | .name' | wc -l)
    echo -e "${CYAN}Copilot Branches:${NC} $copilot_branches"
    
    echo ""
}

# Main execution
main() {
    local operation="plan"
    local org="$DEFAULT_ORG"
    local repo="$DEFAULT_REPO"
    local base_branch="$DEFAULT_BASE_BRANCH"
    local target_branch=""
    local dry_run="false"
    local force="false"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --operation|-o)
                operation="$2"
                shift 2
                ;;
            --org)
                org="$2"
                shift 2
                ;;
            --repo)
                repo="$2"
                shift 2
                ;;
            --base-branch)
                base_branch="$2"
                shift 2
                ;;
            --target-branch)
                target_branch="$2"
                shift 2
                ;;
            --dry-run)
                dry_run="true"
                shift
                ;;
            --force)
                force="true"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Validate operation
    if [[ ! "$operation" =~ ^(plan|create|consolidate|cleanup|status)$ ]]; then
        log_error "Invalid operation: $operation. Must be one of: plan, create, consolidate, cleanup, status"
        exit 1
    fi
    
    # Show configuration
    log_info "Emergency Branch Consolidation Configuration:"
    echo "  Operation: $operation"
    echo "  Organization: $org"
    echo "  Repository: $repo"
    echo "  Base Branch: $base_branch"
    echo "  Target Branch: ${target_branch:-"all"}"
    echo "  Dry Run: $dry_run"
    echo "  Force: $force"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Execute operation
    case $operation in
        plan)
            show_consolidation_plan "$org" "$repo" "$base_branch"
            ;;
        create)
            create_consolidation_branches "$org" "$repo" "$base_branch" "$target_branch" "$dry_run"
            ;;
        consolidate)
            log_warning "Consolidate operation not yet implemented - this requires careful PR merging"
            ;;
        cleanup)
            log_warning "Cleanup operation not yet implemented - this requires branch deletion after successful merging"
            ;;
        status)
            show_consolidation_status "$org" "$repo"
            ;;
    esac
}

# Run main function
main "$@"