#!/bin/bash

# Branch Cleanup Utility Script
# Provides unified branch management for the MCP Orchestration System

set -e

# Configuration
DEFAULT_PATTERN="copilot/*"
DRY_RUN=false
FORCE=false
DAYS_THRESHOLD=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_usage() {
    cat << EOF
Branch Cleanup Utility for MCP Orchestration System

USAGE:
    $0 [OPTIONS] [PATTERN]

OPTIONS:
    -d, --dry-run       Show what would be deleted without actually deleting
    -f, --force         Force deletion without confirmation
    -t, --threshold     Days threshold for considering branches stale (default: 7)
    -h, --help          Show this help message

PATTERN:
    Branch pattern to match (supports wildcards)
    Examples:
        copilot/*           - All copilot branches (default)
        feature/*           - All feature branches
        my-specific-branch  - Specific branch name
        
EXAMPLES:
    # Dry run to see what would be deleted
    $0 --dry-run
    
    # Delete all copilot branches older than 7 days
    $0 --force copilot/*
    
    # Delete specific branch
    $0 --force my-old-branch
    
    # Interactive cleanup with 14-day threshold
    $0 --threshold 14 copilot/*

AUTOMATION:
    This script integrates with GitHub Actions for automated cleanup.
    Use 'gh workflow run branch-cleanup.yml' to trigger automated cleanup.

EOF
}

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

confirm() {
    if [ "$FORCE" = true ]; then
        return 0
    fi
    
    read -p "$(echo -e "${YELLOW}Continue? [y/N]:${NC} ")" -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
        exit 1
    fi
}

get_matching_branches() {
    local pattern="$1"
    
    if [[ "$pattern" == *"*"* ]]; then
        # Pattern with wildcards
        git ls-remote --heads origin | grep -E "${pattern//\*/.*}" | awk '{print $2}' | sed 's/refs\/heads\///' || true
    else
        # Specific branch name
        if git ls-remote --heads origin "$pattern" | grep -q "$pattern"; then
            echo "$pattern"
        fi
    fi
}

check_branch_status() {
    local branch="$1"
    local status=""
    
    # Check if it's a protected branch
    if [[ "$branch" == "main" || "$branch" == "master" ]]; then
        echo "protected"
        return
    fi
    
    # Check for open PRs (requires gh CLI)
    if command -v gh > /dev/null 2>&1; then
        local pr_count=$(gh pr list --head "$branch" --state open --json number --jq length 2>/dev/null || echo "0")
        if [ "$pr_count" -gt 0 ]; then
            echo "has_open_pr"
            return
        fi
    fi
    
    # Check branch age
    local branch_date=$(git log -1 --format=%ct "origin/$branch" 2>/dev/null || echo "0")
    local current_date=$(date +%s)
    local days_old=$(( (current_date - branch_date) / 86400 ))
    
    if [ "$days_old" -lt "$DAYS_THRESHOLD" ]; then
        echo "too_recent:$days_old"
        return
    fi
    
    echo "deletable:$days_old"
}

cleanup_branches() {
    local pattern="${1:-$DEFAULT_PATTERN}"
    
    log "Starting branch cleanup with pattern: $pattern"
    log "Dry run: $DRY_RUN, Force: $FORCE, Days threshold: $DAYS_THRESHOLD"
    
    # Fetch latest remote info
    log "Fetching latest remote information..."
    git fetch --prune origin
    
    # Get matching branches
    local branches=$(get_matching_branches "$pattern")
    
    if [ -z "$branches" ]; then
        warn "No branches found matching pattern: $pattern"
        return 0
    fi
    
    log "Found branches matching pattern:"
    echo "$branches" | sed 's/^/  /'
    echo
    
    local deletable_branches=()
    local skipped_branches=()
    
    # Analyze each branch
    for branch in $branches; do
        local status=$(check_branch_status "$branch")
        
        case "$status" in
            "protected")
                skipped_branches+=("$branch (protected)")
                ;;
            "has_open_pr")
                skipped_branches+=("$branch (has open PR)")
                ;;
            "too_recent:"*)
                local days=${status#too_recent:}
                skipped_branches+=("$branch (only $days days old)")
                ;;
            "deletable:"*)
                local days=${status#deletable:}
                deletable_branches+=("$branch:$days")
                ;;
        esac
    done
    
    # Show what will be skipped
    if [ ${#skipped_branches[@]} -gt 0 ]; then
        warn "Skipping branches:"
        printf '  %s\n' "${skipped_branches[@]}"
        echo
    fi
    
    # Show what will be deleted
    if [ ${#deletable_branches[@]} -eq 0 ]; then
        success "No branches to delete"
        return 0
    fi
    
    if [ "$DRY_RUN" = true ]; then
        warn "DRY RUN - Would delete these branches:"
    else
        warn "Will delete these branches:"
    fi
    
    for branch_info in "${deletable_branches[@]}"; do
        local branch="${branch_info%:*}"
        local days="${branch_info#*:}"
        echo "  $branch (age: $days days)"
    done
    echo
    
    if [ "$DRY_RUN" = true ]; then
        success "Dry run completed - no branches were actually deleted"
        return 0
    fi
    
    # Confirm deletion
    if ! confirm; then
        log "Cleanup cancelled"
        return 0
    fi
    
    # Delete branches
    local deleted_count=0
    local failed_count=0
    
    for branch_info in "${deletable_branches[@]}"; do
        local branch="${branch_info%:*}"
        
        log "Deleting branch: $branch"
        if git push origin --delete "$branch" 2>/dev/null; then
            success "Deleted: $branch"
            ((deleted_count++))
        else
            error "Failed to delete: $branch"
            ((failed_count++))
        fi
    done
    
    # Summary
    echo
    success "Cleanup completed: $deleted_count deleted, $failed_count failed"
    
    if [ $failed_count -gt 0 ]; then
        warn "Some branches could not be deleted. Check permissions or if they were already deleted."
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -t|--threshold)
            DAYS_THRESHOLD="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        -*)
            error "Unknown option $1"
            print_usage
            exit 1
            ;;
        *)
            DEFAULT_PATTERN="$1"
            shift
            ;;
    esac
done

# Main execution
main() {
    check_git_repo
    cleanup_branches "$DEFAULT_PATTERN"
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi