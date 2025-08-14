#!/bin/bash

# Universal Branch Manager Script
# Provides local automation for branch management across multiple repositories

set -e

# Default configuration
DEFAULT_OPERATION="list"
DEFAULT_REPOSITORIES="ALL"
DEFAULT_PATTERN="copilot/*"
DEFAULT_EXCLUDE="main,master,develop,production"
DEFAULT_MIN_AGE_DAYS="7"
DEFAULT_ORG="poisontr33s"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help function
show_help() {
    cat << EOF
Universal Branch Manager

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --operation, -o         Operation to perform (list|dry-run|cleanup) [default: $DEFAULT_OPERATION]
    --repositories, -r      Target repositories (comma-separated or "ALL") [default: $DEFAULT_REPOSITORIES]
    --pattern, -p           Branch pattern to match (e.g., copilot/*, feature/*) [default: $DEFAULT_PATTERN]
    --exclude, -e           Patterns to exclude (comma-separated) [default: $DEFAULT_EXCLUDE]
    --min-age-days, -a      Minimum age in days before deletion [default: $DEFAULT_MIN_AGE_DAYS]
    --org                   GitHub organization [default: $DEFAULT_ORG]
    --force, -f             Skip confirmation prompts
    --help, -h              Show this help message

EXAMPLES:
    # List all copilot branches across all repositories
    $0 --operation list --pattern "copilot/*"
    
    # Dry run deletion of feature branches older than 14 days
    $0 --operation dry-run --pattern "feature/*" --min-age-days 14
    
    # Force cleanup copilot branches in specific repositories
    $0 --operation cleanup --repositories "repo1,repo2" --pattern "copilot/*" --force
    
    # Quick cleanup with force flag
    $0 --operation cleanup --force

ENVIRONMENT VARIABLES:
    GITHUB_TOKEN           GitHub personal access token (required)
    GH_TOKEN              Alternative to GITHUB_TOKEN

EOF
}

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed. Please install it first."
        log_info "Visit: https://cli.github.com/"
        exit 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated. Please run 'gh auth login' first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Discover repositories
discover_repositories() {
    local target_repos="$1"
    local org="$2"
    
    if [[ "$target_repos" == "ALL" ]]; then
        log_info "Discovering all repositories for organization: $org"
        gh repo list "$org" --json name --jq '.[].name' | tr '\n' ' '
    else
        echo "$target_repos" | tr ',' ' '
    fi
}

# Check if branch matches pattern
matches_pattern() {
    local branch="$1"
    local pattern="$2"
    
    if [[ "$pattern" == *"*" ]]; then
        # Wildcard pattern
        local prefix="${pattern%/*}"
        [[ "$branch" == "$prefix"* ]]
    else
        # Exact match
        [[ "$branch" == "$pattern" ]]
    fi
}

# Check if branch should be excluded
is_excluded() {
    local branch="$1"
    local exclude_patterns="$2"
    
    IFS=',' read -ra EXCLUDES <<< "$exclude_patterns"
    for exclude in "${EXCLUDES[@]}"; do
        if [[ "$branch" == "$exclude" ]]; then
            return 0
        fi
    done
    return 1
}

# Get branch age in days
get_branch_age_days() {
    local org="$1"
    local repo="$2"
    local branch="$3"
    
    local last_commit
    last_commit=$(gh api "repos/$org/$repo/branches/$branch" --jq '.commit.commit.committer.date' 2>/dev/null || echo "")
    
    if [[ -n "$last_commit" ]]; then
        local commit_date current_date age_days
        commit_date=$(date -d "$last_commit" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$last_commit" +%s 2>/dev/null || echo "0")
        current_date=$(date +%s)
        age_days=$(( (current_date - commit_date) / 86400 ))
        echo "$age_days"
    else
        echo "0"
    fi
}

# Check for open pull requests
has_open_prs() {
    local org="$1"
    local repo="$2"
    local branch="$3"
    
    local prs
    prs=$(gh api "repos/$org/$repo/pulls" --jq ".[] | select(.head.ref == \"$branch\") | .number" 2>/dev/null || echo "")
    [[ -n "$prs" ]]
}

# Process a single repository
process_repository() {
    local repo="$1"
    local org="$2"
    local operation="$3"
    local pattern="$4"
    local exclude_patterns="$5"
    local min_age_days="$6"
    local force="$7"
    
    log_info "Processing repository: $repo"
    
    # Get all branches
    local branches
    branches=$(gh api "repos/$org/$repo/branches" --jq '.[].name' 2>/dev/null || echo "")
    
    if [[ -z "$branches" ]]; then
        log_warning "No branches found or repository not accessible: $repo"
        return
    fi
    
    local filtered_branches=()
    local skipped_branches=()
    
    # Filter branches
    while read -r branch; do
        [[ -z "$branch" ]] && continue
        
        # Skip excluded branches
        if is_excluded "$branch" "$exclude_patterns"; then
            skipped_branches+=("$branch (excluded)")
            continue
        fi
        
        # Check pattern match
        if ! matches_pattern "$branch" "$pattern"; then
            continue
        fi
        
        # Check age
        if [[ "$min_age_days" -gt 0 ]]; then
            local age_days
            age_days=$(get_branch_age_days "$org" "$repo" "$branch")
            if [[ "$age_days" -lt "$min_age_days" ]]; then
                skipped_branches+=("$branch (age: ${age_days}d < ${min_age_days}d)")
                continue
            fi
        fi
        
        # Check for open PRs
        if has_open_prs "$org" "$repo" "$branch"; then
            skipped_branches+=("$branch (has open PRs)")
            continue
        fi
        
        filtered_branches+=("$branch")
    done <<< "$branches"
    
    # Show skipped branches
    if [[ ${#skipped_branches[@]} -gt 0 ]]; then
        log_info "Skipped branches in $repo:"
        for skipped in "${skipped_branches[@]}"; do
            echo "  - $skipped"
        done
    fi
    
    # Process filtered branches
    if [[ ${#filtered_branches[@]} -eq 0 ]]; then
        log_info "No branches to process in repository: $repo"
        return
    fi
    
    case "$operation" in
        "list")
            log_info "Branches matching criteria in $repo:"
            for branch in "${filtered_branches[@]}"; do
                echo "  - $branch"
            done
            ;;
            
        "dry-run")
            log_warning "DRY RUN - Would delete the following branches in $repo:"
            for branch in "${filtered_branches[@]}"; do
                echo "  - $branch"
            done
            ;;
            
        "cleanup")
            log_warning "Preparing to delete ${#filtered_branches[@]} branches in $repo:"
            for branch in "${filtered_branches[@]}"; do
                echo "  - $branch"
            done
            
            if [[ "$force" != "true" ]]; then
                echo -n "Are you sure you want to delete these branches? (y/N): "
                read -r confirmation
                if [[ "$confirmation" != "y" && "$confirmation" != "Y" ]]; then
                    log_info "Deletion cancelled for repository: $repo"
                    return
                fi
            fi
            
            log_info "Deleting branches in $repo..."
            for branch in "${filtered_branches[@]}"; do
                if gh api -X DELETE "repos/$org/$repo/git/refs/heads/$branch" &>/dev/null; then
                    log_success "Deleted: $branch"
                else
                    log_error "Failed to delete: $branch"
                fi
            done
            ;;
            
        *)
            log_error "Unknown operation: $operation"
            exit 1
            ;;
    esac
}

# Main function
main() {
    local operation="$DEFAULT_OPERATION"
    local repositories="$DEFAULT_REPOSITORIES"
    local pattern="$DEFAULT_PATTERN"
    local exclude_patterns="$DEFAULT_EXCLUDE"
    local min_age_days="$DEFAULT_MIN_AGE_DAYS"
    local org="$DEFAULT_ORG"
    local force="false"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --operation|-o)
                operation="$2"
                shift 2
                ;;
            --repositories|-r)
                repositories="$2"
                shift 2
                ;;
            --pattern|-p)
                pattern="$2"
                shift 2
                ;;
            --exclude|-e)
                exclude_patterns="$2"
                shift 2
                ;;
            --min-age-days|-a)
                min_age_days="$2"
                shift 2
                ;;
            --org)
                org="$2"
                shift 2
                ;;
            --force|-f)
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
    if [[ ! "$operation" =~ ^(list|dry-run|cleanup)$ ]]; then
        log_error "Invalid operation: $operation. Must be one of: list, dry-run, cleanup"
        exit 1
    fi
    
    # Show configuration
    log_info "Universal Branch Manager Configuration:"
    echo "  Operation: $operation"
    echo "  Organization: $org"
    echo "  Repositories: $repositories"
    echo "  Pattern: $pattern"
    echo "  Exclude: $exclude_patterns"
    echo "  Min Age: $min_age_days days"
    echo "  Force: $force"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Discover repositories
    log_info "Discovering target repositories..."
    local repo_list
    repo_list=$(discover_repositories "$repositories" "$org")
    
    if [[ -z "$repo_list" ]]; then
        log_error "No repositories found"
        exit 1
    fi
    
    log_info "Target repositories: $repo_list"
    echo ""
    
    # Process each repository
    for repo in $repo_list; do
        process_repository "$repo" "$org" "$operation" "$pattern" "$exclude_patterns" "$min_age_days" "$force"
        echo ""
    done
    
    log_success "Universal branch management completed"
}

# Run main function with all arguments
main "$@"