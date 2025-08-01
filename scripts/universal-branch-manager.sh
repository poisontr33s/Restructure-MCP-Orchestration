#!/bin/bash

# Universal Multi-Repository Branch Management System
# Manages branches across multiple repositories from a central location

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/universal-branch-config.json"
DEFAULT_PATTERN="copilot/*"
DEFAULT_DAYS_THRESHOLD=7
DRY_RUN=false
OPERATION="cleanup"
REPOSITORIES="ALL"
EXCLUDE_REPOS=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
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

debug() {
    echo -e "${PURPLE}[DEBUG]${NC} $1"
}

header() {
    echo -e "${CYAN}===== $1 =====${NC}"
}

print_usage() {
    cat << 'EOF'
Universal Multi-Repository Branch Management System

USAGE:
    universal-branch-manager.sh [OPTIONS] [REPOSITORIES]

OPTIONS:
    -o, --operation OPERATION   Operation to perform (cleanup, list, delete-all, delete-pattern)
    -p, --pattern PATTERN       Branch pattern to match (supports wildcards)
    -t, --threshold DAYS        Days threshold for considering branches stale
    -d, --dry-run               Show what would be done without executing
    -r, --repositories REPOS    Repositories to manage (comma-separated or "ALL")
    -e, --exclude REPOS         Repositories to exclude (comma-separated)
    -c, --config FILE           Configuration file path
    -h, --help                  Show this help message

OPERATIONS:
    cleanup                     Delete stale branches based on age and PR status
    list                        List all matching branches across repositories
    delete-all                  Delete all matching branches (use with caution)
    delete-pattern              Delete branches matching specific pattern

REPOSITORY FORMATS:
    ALL                         Process all repositories in the organization
    owner/repo                  Specific repository
    owner/repo1,owner/repo2     Multiple specific repositories

EXAMPLES:
    # List all copilot branches across all repositories
    ./universal-branch-manager.sh --operation list --pattern "copilot/*"
    
    # Dry run cleanup of feature branches older than 14 days
    ./universal-branch-manager.sh --operation cleanup --pattern "feature/*" --threshold 14 --dry-run
    
    # Delete all copilot branches from specific repositories
    ./universal-branch-manager.sh --operation delete-pattern --pattern "copilot/*" --repositories "org/repo1,org/repo2"
    
    # Cleanup with exclusions
    ./universal-branch-manager.sh --operation cleanup --exclude "critical-repo,prod-repo"

AUTOMATION:
    # Trigger GitHub Actions workflow
    gh workflow run universal-branch-manager.yml --field operation=cleanup --field repositories=ALL
    
    # API trigger for external systems
    curl -X POST \
      -H "Authorization: token $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github.v3+json" \
      https://api.github.com/repos/OWNER/REPO/dispatches \
      -d '{"event_type":"universal-branch-cleanup","client_payload":{"operation":"cleanup","repositories":"ALL"}}'

CONFIGURATION:
    Create universal-branch-config.json in the same directory as this script:
    {
      "default_pattern": "copilot/*",
      "default_threshold": 7,
      "protected_branches": ["main", "master", "develop", "production"],
      "excluded_repositories": [],
      "github_token": "env:GITHUB_TOKEN"
    }

EOF
}

check_dependencies() {
    local missing_deps=()
    
    if ! command -v gh > /dev/null 2>&1; then
        missing_deps+=("gh (GitHub CLI)")
    fi
    
    if ! command -v jq > /dev/null 2>&1; then
        missing_deps+=("jq")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        error "Missing required dependencies:"
        printf '  %s\n' "${missing_deps[@]}"
        echo
        echo "Install with:"
        echo "  # GitHub CLI"
        echo "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
        echo "  echo \"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
        echo "  sudo apt update && sudo apt install gh"
        echo
        echo "  # jq"
        echo "  sudo apt install jq"
        exit 1
    fi
}

load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        log "Loading configuration from $CONFIG_FILE"
        
        # Extract values from JSON config
        if command -v jq > /dev/null 2>&1; then
            local config_pattern=$(jq -r '.default_pattern // empty' "$CONFIG_FILE" 2>/dev/null || echo "")
            local config_threshold=$(jq -r '.default_threshold // empty' "$CONFIG_FILE" 2>/dev/null || echo "")
            local config_excluded=$(jq -r '.excluded_repositories[]? // empty' "$CONFIG_FILE" 2>/dev/null | paste -sd ',' - || echo "")
            
            [ -n "$config_pattern" ] && DEFAULT_PATTERN="$config_pattern"
            [ -n "$config_threshold" ] && DEFAULT_DAYS_THRESHOLD="$config_threshold"
            [ -n "$config_excluded" ] && EXCLUDE_REPOS="$config_excluded"
        fi
    else
        debug "No configuration file found at $CONFIG_FILE, using defaults"
    fi
}

get_organization() {
    # Try to determine organization from current git repo or GitHub CLI
    local org=""
    
    if git remote get-url origin > /dev/null 2>&1; then
        local remote_url=$(git remote get-url origin)
        if [[ "$remote_url" =~ github\.com[:/]([^/]+)/ ]]; then
            org="${BASH_REMATCH[1]}"
        fi
    fi
    
    if [ -z "$org" ] && command -v gh > /dev/null 2>&1; then
        org=$(gh api user --jq '.login' 2>/dev/null || echo "")
    fi
    
    echo "$org"
}

get_repositories() {
    local repos_input="$1"
    local exclude_list="$2"
    
    if [ "$repos_input" = "ALL" ]; then
        local org=$(get_organization)
        if [ -z "$org" ]; then
            error "Cannot determine organization. Please specify repositories explicitly."
            exit 1
        fi
        
        log "Fetching all repositories from organization: $org"
        local all_repos=$(gh repo list "$org" --limit 1000 --json name,owner --jq '.[] | "\(.owner.login)/\(.name)"')
        
        if [ -n "$exclude_list" ]; then
            log "Applying exclusion filters: $exclude_list"
            local filtered_repos=""
            IFS=',' read -ra EXCLUDES <<< "$exclude_list"
            
            for repo in $all_repos; do
                local exclude=false
                for exclude_pattern in "${EXCLUDES[@]}"; do
                    exclude_pattern=$(echo "$exclude_pattern" | tr -d ' ')
                    if [[ "$repo" == *"$exclude_pattern"* ]]; then
                        exclude=true
                        debug "Excluding repository: $repo (matches pattern: $exclude_pattern)"
                        break
                    fi
                done
                
                if [ "$exclude" = false ]; then
                    filtered_repos="$filtered_repos $repo"
                fi
            done
            
            echo "$filtered_repos"
        else
            echo "$all_repos"
        fi
    else
        # Process comma-separated list
        echo "$repos_input" | tr ',' '\n' | tr -d ' ' | grep -v '^$'
    fi
}

get_branches_for_repo() {
    local repo="$1"
    local pattern="$2"
    
    if [[ "$pattern" == *"*"* ]]; then
        # Pattern with wildcards - convert to regex
        local pattern_regex=$(echo "$pattern" | sed 's/\*/.*/')
        gh api "repos/$repo/branches" --paginate --jq '.[].name' 2>/dev/null | grep -E "$pattern_regex" || true
    else
        # Specific branch name
        gh api "repos/$repo/branches" --paginate --jq '.[].name' 2>/dev/null | grep -x "$pattern" || true
    fi
}

check_branch_protection() {
    local repo="$1"
    local branch="$2"
    
    # Check against common protected branch names
    if [[ "$branch" == "main" || "$branch" == "master" || "$branch" == "develop" || "$branch" == "production" ]]; then
        echo "protected"
        return
    fi
    
    # Check GitHub branch protection
    if gh api "repos/$repo/branches/$branch/protection" > /dev/null 2>&1; then
        echo "protected"
    else
        echo "unprotected"
    fi
}

get_branch_info() {
    local repo="$1"
    local branch="$2"
    local days_threshold="$3"
    
    local info=""
    
    # Check protection status
    local protection=$(check_branch_protection "$repo" "$branch")
    if [ "$protection" = "protected" ]; then
        echo "status:protected"
        return
    fi
    
    # Check for open PRs
    local pr_count=$(gh pr list --repo "$repo" --head "$branch" --state open --json number --jq length 2>/dev/null || echo "0")
    if [ "$pr_count" -gt 0 ]; then
        echo "status:has_open_pr,pr_count:$pr_count"
        return
    fi
    
    # Get branch age
    local branch_date=$(gh api "repos/$repo/commits/$branch" --jq '.commit.committer.date' 2>/dev/null || echo "")
    if [ -n "$branch_date" ]; then
        local branch_timestamp=$(date -d "$branch_date" +%s 2>/dev/null || echo "0")
        local current_timestamp=$(date +%s)
        local days_old=$(( (current_timestamp - branch_timestamp) / 86400 ))
        
        if [ "$days_old" -lt "$days_threshold" ]; then
            echo "status:too_recent,days:$days_old"
        else
            echo "status:deletable,days:$days_old"
        fi
    else
        echo "status:no_commit_info"
    fi
}

execute_operation() {
    local operation="$1"
    local pattern="$2"
    local repositories="$3"
    local exclude_repos="$4"
    local days_threshold="$5"
    local dry_run="$6"
    
    header "Universal Branch Management - $operation"
    log "Operation: $operation"
    log "Pattern: $pattern"
    log "Days Threshold: $days_threshold"
    log "Dry Run: $dry_run"
    
    # Get target repositories
    local target_repos=$(get_repositories "$repositories" "$exclude_repos")
    
    if [ -z "$target_repos" ]; then
        error "No repositories found to process"
        exit 1
    fi
    
    local repo_count=$(echo "$target_repos" | wc -w)
    log "Target repositories ($repo_count):"
    echo "$target_repos" | sed 's/^/  /'
    echo
    
    # Statistics
    local total_repos_processed=0
    local total_branches_found=0
    local total_branches_deleted=0
    local failed_operations=0
    
    # Process each repository
    for repo in $target_repos; do
        if [ -z "$repo" ]; then continue; fi
        
        header "Repository: $repo"
        total_repos_processed=$((total_repos_processed + 1))
        
        # Get branches
        local branches=$(get_branches_for_repo "$repo" "$pattern")
        
        if [ -z "$branches" ]; then
            warn "No branches found matching pattern in $repo"
            echo
            continue
        fi
        
        local branch_count=$(echo "$branches" | wc -w)
        total_branches_found=$((total_branches_found + branch_count))
        log "Found $branch_count branches matching pattern:"
        echo "$branches" | sed 's/^/  /'
        
        local repo_deleted=0
        
        # Process each branch
        for branch in $branches; do
            debug "Analyzing branch: $branch"
            
            local branch_info=$(get_branch_info "$repo" "$branch" "$days_threshold")
            local status=$(echo "$branch_info" | grep -o 'status:[^,]*' | cut -d: -f2)
            
            case "$status" in
                "protected")
                    warn "  🛡️  Skipping protected branch: $branch"
                    ;;
                "has_open_pr")
                    local pr_count=$(echo "$branch_info" | grep -o 'pr_count:[^,]*' | cut -d: -f2)
                    warn "  📋 Skipping branch with $pr_count open PR(s): $branch"
                    ;;
                "too_recent")
                    local days=$(echo "$branch_info" | grep -o 'days:[^,]*' | cut -d: -f2)
                    warn "  ⏰ Skipping recent branch: $branch (age: $days days)"
                    ;;
                "deletable")
                    local days=$(echo "$branch_info" | grep -o 'days:[^,]*' | cut -d: -f2)
                    
                    case "$operation" in
                        "list")
                            success "  📝 Listed: $branch (age: $days days)"
                            ;;
                        "cleanup"|"delete-pattern"|"delete-all")
                            if [ "$dry_run" = "true" ]; then
                                success "  🔄 [DRY RUN] Would delete: $branch (age: $days days)"
                                repo_deleted=$((repo_deleted + 1))
                            else
                                log "  🗑️  Deleting branch: $branch (age: $days days)"
                                if gh api "repos/$repo/git/refs/heads/$branch" -X DELETE > /dev/null 2>&1; then
                                    success "  ✅ Successfully deleted: $branch"
                                    repo_deleted=$((repo_deleted + 1))
                                    total_branches_deleted=$((total_branches_deleted + 1))
                                else
                                    error "  ❌ Failed to delete: $branch"
                                    failed_operations=$((failed_operations + 1))
                                fi
                            fi
                            ;;
                    esac
                    ;;
                *)
                    warn "  ❓ Unknown status for branch: $branch"
                    ;;
            esac
        done
        
        log "Repository summary: $branch_count found, $repo_deleted processed"
        echo
    done
    
    # Final summary
    header "Final Summary"
    success "Repositories processed: $total_repos_processed"
    success "Branches found: $total_branches_found"
    success "Branches deleted: $total_branches_deleted"
    
    if [ "$failed_operations" -gt 0 ]; then
        error "Failed operations: $failed_operations"
    fi
    
    if [ "$dry_run" = "true" ]; then
        warn "This was a dry run - no actual deletions were performed"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--operation)
            OPERATION="$2"
            shift 2
            ;;
        -p|--pattern)
            DEFAULT_PATTERN="$2"
            shift 2
            ;;
        -t|--threshold)
            DEFAULT_DAYS_THRESHOLD="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -r|--repositories)
            REPOSITORIES="$2"
            shift 2
            ;;
        -e|--exclude)
            EXCLUDE_REPOS="$2"
            shift 2
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        -*)
            error "Unknown option: $1"
            print_usage
            exit 1
            ;;
        *)
            # Treat remaining arguments as repositories if not already set
            if [ "$REPOSITORIES" = "ALL" ]; then
                REPOSITORIES="$1"
            fi
            shift
            ;;
    esac
done

# Validate operation
case "$OPERATION" in
    "cleanup"|"list"|"delete-all"|"delete-pattern")
        ;;
    *)
        error "Invalid operation: $OPERATION"
        echo "Valid operations: cleanup, list, delete-all, delete-pattern"
        exit 1
        ;;
esac

# Main execution
main() {
    header "Universal Multi-Repository Branch Manager"
    
    check_dependencies
    load_config
    
    # Verify GitHub authentication
    if ! gh auth status > /dev/null 2>&1; then
        error "GitHub CLI not authenticated. Run 'gh auth login' first."
        exit 1
    fi
    
    execute_operation "$OPERATION" "$DEFAULT_PATTERN" "$REPOSITORIES" "$EXCLUDE_REPOS" "$DEFAULT_DAYS_THRESHOLD" "$DRY_RUN"
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi