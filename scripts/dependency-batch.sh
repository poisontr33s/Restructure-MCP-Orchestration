#!/bin/bash

# Dependency Batch Consolidation Script
# Consolidates multiple dependency update PRs into batched cycles

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
DEFAULT_TARGET_BRANCH="dependencies/batch-updates"

# Dependency update patterns to consolidate
DEPENDENCY_PATTERNS=(
    "dependabot"
    "bump"
    "update.*dependencies"
    "upgrade.*packages"
    "security.*update"
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
Dependency Batch Consolidation Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --operation, -o         Operation to perform (analyze|batch|consolidate|cleanup) [default: analyze]
    --org                   GitHub organization [default: $DEFAULT_ORG]
    --repo                  Repository name [default: $DEFAULT_REPO]
    --base-branch           Base branch [default: $DEFAULT_BASE_BRANCH]
    --target-branch         Target consolidation branch [default: $DEFAULT_TARGET_BRANCH]
    --max-age-days          Maximum age of PRs to include [default: 30]
    --dry-run               Show what would be done without making changes
    --force                 Skip confirmation prompts
    --help, -h              Show this help message

OPERATIONS:
    analyze                 Analyze dependency PRs for consolidation
    batch                   Create batched dependency updates
    consolidate             Execute dependency consolidation
    cleanup                 Clean up after successful consolidation

EXAMPLES:
    # Analyze dependency PRs
    $0 --operation analyze
    
    # Create batch consolidation (dry run)
    $0 --operation batch --dry-run
    
    # Execute consolidation
    $0 --operation consolidate --force

EOF
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Find dependency PRs
find_dependency_prs() {
    local org="$1"
    local repo="$2"
    local max_age_days="$3"
    
    log_info "Finding dependency update PRs..."
    
    local cutoff_date
    cutoff_date=$(date -d "$max_age_days days ago" -Iseconds)
    
    # Get all open PRs
    local prs
    prs=$(gh api "repos/$org/$repo/pulls" \
        --field state=open \
        --field per_page=100 \
        --jq ".[] | select(.created_at >= \"$cutoff_date\")")
    
    # Filter for dependency PRs
    local dependency_prs=()
    while IFS= read -r pr; do
        local title
        title=$(echo "$pr" | jq -r '.title // ""' | tr '[:upper:]' '[:lower:]')
        
        for pattern in "${DEPENDENCY_PATTERNS[@]}"; do
            if [[ "$title" =~ $pattern ]]; then
                dependency_prs+=("$pr")
                break
            fi
        done
    done <<< "$prs"
    
    echo "${dependency_prs[@]}"
}

# Analyze dependency PRs
analyze_dependency_prs() {
    local org="$1"
    local repo="$2"
    local max_age_days="$3"
    
    log_header "Dependency PR Analysis"
    
    # Get all open PRs and filter for dependency updates
    local prs_json
    prs_json=$(gh api "repos/$org/$repo/pulls" \
        --field state=open \
        --field per_page=100)
    
    local total_prs
    total_prs=$(echo "$prs_json" | jq 'length')
    echo -e "${CYAN}Total Open PRs:${NC} $total_prs"
    
    # Count dependency PRs
    local dependency_count=0
    local dependency_prs=()
    
    while IFS= read -r pr_line; do
        [[ -z "$pr_line" ]] && continue
        
        local pr_number title author created_at
        pr_number=$(echo "$pr_line" | jq -r '.number')
        title=$(echo "$pr_line" | jq -r '.title')
        author=$(echo "$pr_line" | jq -r '.user.login')
        created_at=$(echo "$pr_line" | jq -r '.created_at')
        
        local title_lower
        title_lower=$(echo "$title" | tr '[:upper:]' '[:lower:]')
        
        for pattern in "${DEPENDENCY_PATTERNS[@]}"; do
            if [[ "$title_lower" =~ $pattern ]]; then
                dependency_count=$((dependency_count + 1))
                dependency_prs+=("#$pr_number: $title (by $author)")
                break
            fi
        done
    done <<< "$(echo "$prs_json" | jq -c '.[]')"
    
    echo -e "${CYAN}Dependency Update PRs:${NC} $dependency_count"
    echo ""
    
    if [[ $dependency_count -gt 0 ]]; then
        echo -e "${CYAN}Identified Dependency PRs:${NC}"
        for pr_info in "${dependency_prs[@]}"; do
            echo "  📦 $pr_info"
        done
        echo ""
        
        if [[ $dependency_count -ge 3 ]]; then
            log_success "Ready for batch consolidation ($dependency_count PRs identified)"
        else
            log_warning "Only $dependency_count dependency PRs found - consider waiting for more updates"
        fi
    else
        log_info "No dependency update PRs found matching patterns"
    fi
    
    # Show consolidation benefit
    if [[ $dependency_count -gt 2 ]]; then
        echo -e "${CYAN}Consolidation Benefit:${NC}"
        echo "  📊 Current: $dependency_count individual PRs"
        echo "  📊 Target: 1-2 batched PRs"
        echo "  📊 Reduction: $((dependency_count - 2)) fewer PRs"
    fi
}

# Create batch consolidation branch
create_batch_branch() {
    local org="$1"
    local repo="$2"
    local base_branch="$3"
    local target_branch="$4"
    local dry_run="$5"
    
    log_header "Creating Dependency Batch Branch"
    
    if [[ "$dry_run" == "true" ]]; then
        log_warning "[DRY RUN] Would create branch: $target_branch from $base_branch"
        return
    fi
    
    # Check if branch already exists
    if gh api "repos/$org/$repo/branches/$target_branch" &>/dev/null; then
        log_warning "Branch $target_branch already exists"
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
        --field ref="refs/heads/$target_branch" \
        --field sha="$base_sha" &>/dev/null; then
        log_success "Created branch: $target_branch"
        
        # Create batch consolidation documentation
        create_batch_documentation "$org" "$repo" "$target_branch"
    else
        log_error "Failed to create branch: $target_branch"
    fi
}

# Create batch consolidation documentation
create_batch_documentation() {
    local org="$1"
    local repo="$2"
    local branch="$3"
    
    local content
    content=$(cat << EOF
# Dependency Batch Updates

## Overview
This branch consolidates multiple dependency update PRs into a single, coordinated update cycle.

## Consolidation Strategy
- Batch related dependency updates together
- Reduce PR overhead from individual updates
- Maintain security and stability through coordinated testing
- Streamline review and approval process

## Included Updates
<!-- List the specific dependency updates included in this batch -->

## Testing Checklist
- [ ] All packages build successfully
- [ ] Test suites pass across all packages
- [ ] No breaking changes introduced
- [ ] Security vulnerabilities addressed
- [ ] Performance impact assessed

## Validation Steps
1. **Build Verification**: \`pnpm build\`
2. **Test Execution**: \`pnpm test\`
3. **Lint Checking**: \`pnpm lint\`
4. **Security Audit**: \`pnpm audit\`
5. **Integration Testing**: Verify MCP server functionality

## Rollback Plan
If issues are discovered:
1. Revert to previous stable versions
2. Create targeted fixes for critical issues
3. Re-batch updates with fixes applied

## Success Metrics
- Reduced PR count from individual updates
- Maintained code quality and security
- Faster review and merge cycle
- No regression in functionality

---
*Generated by Dependency Batch Consolidation Script*
*Created on: $(date)*
EOF
)
    
    # Create the documentation file
    local encoded_content
    encoded_content=$(echo "$content" | base64 -w 0)
    
    gh api -X PUT "repos/$org/$repo/contents/DEPENDENCY_BATCH.md" \
        --field message="Add dependency batch consolidation documentation" \
        --field content="$encoded_content" \
        --field branch="$branch" &>/dev/null || true
}

# Execute dependency consolidation
execute_consolidation() {
    local org="$1"
    local repo="$2"
    local target_branch="$3"
    local dry_run="$4"
    
    log_header "Executing Dependency Consolidation"
    
    if [[ "$dry_run" == "true" ]]; then
        log_warning "[DRY RUN] Would execute dependency consolidation"
        log_warning "[DRY RUN] Would update pnpm-lock.yaml"
        log_warning "[DRY RUN] Would run security audit"
        log_warning "[DRY RUN] Would execute test suite"
        return
    fi
    
    log_warning "Dependency consolidation execution requires manual PR merging and testing"
    log_warning "This script provides the framework - actual consolidation should be done through GitHub UI"
    
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo "1. Review identified dependency PRs"
    echo "2. Merge compatible updates into $target_branch"
    echo "3. Test consolidated changes"
    echo "4. Create consolidated PR for review"
}

# Main execution
main() {
    local operation="analyze"
    local org="$DEFAULT_ORG"
    local repo="$DEFAULT_REPO"
    local base_branch="$DEFAULT_BASE_BRANCH"
    local target_branch="$DEFAULT_TARGET_BRANCH"
    local max_age_days="30"
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
            --max-age-days)
                max_age_days="$2"
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
    if [[ ! "$operation" =~ ^(analyze|batch|consolidate|cleanup)$ ]]; then
        log_error "Invalid operation: $operation"
        exit 1
    fi
    
    # Show configuration
    log_info "Dependency Batch Consolidation Configuration:"
    echo "  Operation: $operation"
    echo "  Organization: $org"
    echo "  Repository: $repo"
    echo "  Base Branch: $base_branch"
    echo "  Target Branch: $target_branch"
    echo "  Max Age: $max_age_days days"
    echo "  Dry Run: $dry_run"
    echo "  Force: $force"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Execute operation
    case $operation in
        analyze)
            analyze_dependency_prs "$org" "$repo" "$max_age_days"
            ;;
        batch)
            create_batch_branch "$org" "$repo" "$base_branch" "$target_branch" "$dry_run"
            ;;
        consolidate)
            execute_consolidation "$org" "$repo" "$target_branch" "$dry_run"
            ;;
        cleanup)
            log_warning "Cleanup operation not yet implemented"
            ;;
    esac
}

# Run main function
main "$@"