#!/bin/bash

# Enhanced Universal Branch Manager Script
# Provides local automation for branch management across multiple repositories
# with support for repository bridge configuration

set -e

# Default configuration
DEFAULT_OPERATION="list"
DEFAULT_REPOSITORIES="ALL"
DEFAULT_PATTERN="copilot/*"
DEFAULT_EXCLUDE="main,master,develop,production"
DEFAULT_MIN_AGE_DAYS="7"
DEFAULT_ORG="poisontr33s"
DEFAULT_BRIDGE_CONFIG="repository-bridge.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${PURPLE}[DEBUG]${NC} $1"
    fi
}

log_bridge() {
    echo -e "${CYAN}[BRIDGE]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
Enhanced Universal Branch Manager with Repository Bridge Support

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --operation, -o         Operation to perform (list|dry-run|cleanup|bridge-init|bridge-config) [default: $DEFAULT_OPERATION]
    --repositories, -r      Target repositories (comma-separated, "ALL", or "BRIDGE") [default: $DEFAULT_REPOSITORIES]
    --pattern, -p           Branch pattern to match (e.g., copilot/*, feature/*) [default: $DEFAULT_PATTERN]
    --exclude, -e           Patterns to exclude (comma-separated) [default: $DEFAULT_EXCLUDE]
    --min-age-days, -a      Minimum age in days before deletion [default: $DEFAULT_MIN_AGE_DAYS]
    --org                   GitHub organization [default: $DEFAULT_ORG or from bridge config]
    --bridge-config, -b     Path to repository bridge configuration file [default: $DEFAULT_BRIDGE_CONFIG]
    --main-repo             Main repository in format "owner/name" (for bridge-init)
    --add-repo              Add repository to bridge in format "owner/name:type" (for bridge-config)
    --remove-repo           Remove repository from bridge in format "owner/name" (for bridge-config)
    --force, -f             Skip confirmation prompts
    --debug                 Enable debug logging
    --help, -h              Show this help message

BRIDGE OPERATIONS:
    bridge-init             Initialize a new repository bridge configuration
    bridge-config           Manage bridge configuration (add/remove repositories)

REPOSITORY TARGETING:
    ALL                     Process all repositories in the organization
    BRIDGE                  Process repositories defined in bridge configuration
    repo1,repo2,repo3       Comma-separated list of specific repositories

EXAMPLES:
    # Initialize a bridge with a main repository
    $0 --operation bridge-init --main-repo "myorg/main-repo" --org "myorg"
    
    # Add repositories to the bridge
    $0 --operation bridge-config --add-repo "myorg/service1:service"
    $0 --operation bridge-config --add-repo "myorg/library1:dependency"
    
    # List branches across bridge repositories
    $0 --operation list --repositories BRIDGE --pattern "copilot/*"
    
    # Cleanup using bridge configuration
    $0 --operation cleanup --repositories BRIDGE --pattern "feature/*" --min-age-days 14
    
    # Traditional organization-wide cleanup
    $0 --operation cleanup --org "myorg" --pattern "copilot/*" --force

ENVIRONMENT VARIABLES:
    GITHUB_TOKEN            GitHub token for API access
    DEBUG                   Enable debug logging (true/false)

BRIDGE CONFIGURATION:
    The bridge configuration file (repository-bridge.json) defines:
    - Main repository that serves as the orchestration hub
    - Connected repositories and their types
    - Default branch patterns and exclusions
    - Organization settings

EOF
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/"
        exit 1
    fi
    
    # Check if gh is authenticated
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated. Please run 'gh auth login'"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Load bridge configuration
load_bridge_config() {
    local bridge_config_file="$1"
    
    if [[ -f "$bridge_config_file" ]]; then
        log_bridge "Loading bridge configuration from: $bridge_config_file"
        
        # Check if the file is valid JSON
        if jq empty "$bridge_config_file" 2>/dev/null; then
            log_success "Bridge configuration loaded successfully"
            return 0
        else
            log_error "Invalid JSON in bridge configuration file: $bridge_config_file"
            return 1
        fi
    else
        log_warning "Bridge configuration file not found: $bridge_config_file"
        return 1
    fi
}

# Get repositories from bridge configuration
get_bridge_repositories() {
    local bridge_config_file="$1"
    
    if [[ ! -f "$bridge_config_file" ]]; then
        log_error "Bridge configuration file not found: $bridge_config_file"
        return 1
    fi
    
    # Extract repository names from bridge configuration
    local main_repo=$(jq -r '.mainRepository.name' "$bridge_config_file" 2>/dev/null)
    local connected_repos=$(jq -r '.connectedRepositories[]? | select(.enabled != false) | .name' "$bridge_config_file" 2>/dev/null)
    
    # Combine main and connected repositories
    local all_repos=""
    if [[ -n "$main_repo" && "$main_repo" != "null" ]]; then
        all_repos="$main_repo"
    fi
    
    if [[ -n "$connected_repos" ]]; then
        if [[ -n "$all_repos" ]]; then
            all_repos="$all_repos $connected_repos"
        else
            all_repos="$connected_repos"
        fi
    fi
    
    echo "$all_repos"
}

# Get organization from bridge configuration
get_bridge_organization() {
    local bridge_config_file="$1"
    
    if [[ ! -f "$bridge_config_file" ]]; then
        echo "$DEFAULT_ORG"
        return
    fi
    
    # Try different organization fields in order of preference
    local org=$(jq -r '.mainRepository.organization // .bridgeConfig.defaultOrganization // .mainRepository.owner' "$bridge_config_file" 2>/dev/null)
    
    if [[ -n "$org" && "$org" != "null" ]]; then
        echo "$org"
    else
        echo "$DEFAULT_ORG"
    fi
}

# Initialize bridge configuration
init_bridge_config() {
    local bridge_config_file="$1"
    local main_repo="$2"
    local org="$3"
    
    if [[ -z "$main_repo" ]]; then
        log_error "Main repository is required for bridge initialization"
        log_info "Example: --main-repo \"myorg/main-repo\""
        return 1
    fi
    
    # Parse owner/name from main_repo
    local owner=$(echo "$main_repo" | cut -d'/' -f1)
    local name=$(echo "$main_repo" | cut -d'/' -f2)
    
    if [[ -z "$owner" || -z "$name" ]]; then
        log_error "Invalid main repository format. Use: owner/name"
        return 1
    fi
    
    # Create bridge configuration
    cat > "$bridge_config_file" << EOF
{
  "mainRepository": {
    "owner": "$owner",
    "name": "$name",
    "organization": "$org"
  },
  "connectedRepositories": [],
  "bridgeConfig": {
    "defaultBranchPatterns": ["copilot/*", "feature/*", "hotfix/*"],
    "excludeBranches": ["main", "master", "develop", "production", "staging"],
    "defaultMinAgeDays": 7,
    "defaultOrganization": "$org"
  }
}
EOF
    
    log_success "Bridge configuration initialized: $bridge_config_file"
    log_bridge "Main repository: $owner/$name"
    log_bridge "Organization: $org"
    
    return 0
}

# Add repository to bridge configuration
add_bridge_repository() {
    local bridge_config_file="$1"
    local repo_spec="$2"
    
    if [[ ! -f "$bridge_config_file" ]]; then
        log_error "Bridge configuration file not found: $bridge_config_file"
        log_info "Initialize the bridge first with: --operation bridge-init"
        return 1
    fi
    
    # Parse owner/name:type from repo_spec
    local repo_part=$(echo "$repo_spec" | cut -d':' -f1)
    local repo_type=$(echo "$repo_spec" | cut -d':' -f2)
    local owner=$(echo "$repo_part" | cut -d'/' -f1)
    local name=$(echo "$repo_part" | cut -d'/' -f2)
    
    if [[ -z "$owner" || -z "$name" || -z "$repo_type" ]]; then
        log_error "Invalid repository specification. Use: owner/name:type"
        log_info "Example: --add-repo \"myorg/service1:service\""
        return 1
    fi
    
    # Create temporary file with updated configuration
    local temp_file=$(mktemp)
    
    # Add repository to connected repositories array
    jq --arg owner "$owner" --arg name "$name" --arg type "$repo_type" '
        .connectedRepositories += [{
            "owner": $owner,
            "name": $name,
            "type": $type,
            "branchPatterns": .bridgeConfig.defaultBranchPatterns,
            "enabled": true
        }] | 
        .connectedRepositories |= unique_by(.owner + "/" + .name)
    ' "$bridge_config_file" > "$temp_file"
    
    if mv "$temp_file" "$bridge_config_file"; then
        log_success "Added repository to bridge: $owner/$name (type: $repo_type)"
    else
        log_error "Failed to update bridge configuration"
        rm -f "$temp_file"
        return 1
    fi
}

# Remove repository from bridge configuration
remove_bridge_repository() {
    local bridge_config_file="$1"
    local repo_spec="$2"
    
    if [[ ! -f "$bridge_config_file" ]]; then
        log_error "Bridge configuration file not found: $bridge_config_file"
        return 1
    fi
    
    # Parse owner/name from repo_spec
    local owner=$(echo "$repo_spec" | cut -d'/' -f1)
    local name=$(echo "$repo_spec" | cut -d'/' -f2)
    
    if [[ -z "$owner" || -z "$name" ]]; then
        log_error "Invalid repository specification. Use: owner/name"
        return 1
    fi
    
    # Create temporary file with updated configuration
    local temp_file=$(mktemp)
    
    # Remove repository from connected repositories array
    jq --arg owner "$owner" --arg name "$name" '
        .connectedRepositories |= map(select(.owner != $owner or .name != $name))
    ' "$bridge_config_file" > "$temp_file"
    
    if mv "$temp_file" "$bridge_config_file"; then
        log_success "Removed repository from bridge: $owner/$name"
    else
        log_error "Failed to update bridge configuration"
        rm -f "$temp_file"
        return 1
    fi
}

# Discover repositories
discover_repositories() {
    local target_repos="$1"
    local org="$2"
    local bridge_config_file="$3"
    
    if [[ "$target_repos" == "BRIDGE" ]]; then
        log_bridge "Discovering repositories from bridge configuration..."
        get_bridge_repositories "$bridge_config_file"
    elif [[ "$target_repos" == "ALL" ]]; then
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
        if matches_pattern "$branch" "$exclude"; then
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
    
    local last_commit_date
    last_commit_date=$(gh api "repos/$org/$repo/branches/$branch" --jq '.commit.commit.committer.date' 2>/dev/null || echo "")
    
    if [[ -z "$last_commit_date" ]]; then
        echo "0"
        return
    fi
    
    local commit_timestamp
    commit_timestamp=$(date -d "$last_commit_date" +%s 2>/dev/null || echo "0")
    local current_timestamp
    current_timestamp=$(date +%s)
    
    local age_seconds=$((current_timestamp - commit_timestamp))
    local age_days=$((age_seconds / 86400))
    
    echo "$age_days"
}

# Check if branch has open PRs
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
                echo ""
                read -p "Continue with deletion? (y/N): " -n 1 -r
                echo ""
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    log_info "Skipping deletion for $repo"
                    return
                fi
            fi
            
            for branch in "${filtered_branches[@]}"; do
                log_info "Deleting branch: $branch"
                if gh api -X DELETE "repos/$org/$repo/git/refs/heads/$branch" >/dev/null 2>&1; then
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

# Show bridge configuration summary
show_bridge_config() {
    local bridge_config_file="$1"
    
    if [[ ! -f "$bridge_config_file" ]]; then
        log_warning "No bridge configuration found at: $bridge_config_file"
        return
    fi
    
    log_bridge "Repository Bridge Configuration:"
    echo ""
    
    # Main repository
    local main_owner=$(jq -r '.mainRepository.owner' "$bridge_config_file" 2>/dev/null)
    local main_name=$(jq -r '.mainRepository.name' "$bridge_config_file" 2>/dev/null)
    local main_org=$(jq -r '.mainRepository.organization // "none"' "$bridge_config_file" 2>/dev/null)
    
    echo "  Main Repository: $main_owner/$main_name"
    echo "  Organization: $main_org"
    echo ""
    
    # Connected repositories
    local connected_count=$(jq -r '.connectedRepositories | length' "$bridge_config_file" 2>/dev/null)
    echo "  Connected Repositories ($connected_count):"
    
    if [[ "$connected_count" -gt 0 ]]; then
        jq -r '.connectedRepositories[] | "    - \(.owner)/\(.name) (\(.type)) [\(if .enabled != false then "enabled" else "disabled" end)]"' "$bridge_config_file" 2>/dev/null
    else
        echo "    (none)"
    fi
    
    echo ""
    
    # Bridge configuration
    local default_patterns=$(jq -r '.bridgeConfig.defaultBranchPatterns | join(", ")' "$bridge_config_file" 2>/dev/null)
    local exclude_branches=$(jq -r '.bridgeConfig.excludeBranches | join(", ")' "$bridge_config_file" 2>/dev/null)
    local min_age=$(jq -r '.bridgeConfig.defaultMinAgeDays' "$bridge_config_file" 2>/dev/null)
    
    echo "  Bridge Settings:"
    echo "    Default Branch Patterns: $default_patterns"
    echo "    Excluded Branches: $exclude_branches"
    echo "    Default Min Age: $min_age days"
    echo ""
}

# Main function
main() {
    local operation="$DEFAULT_OPERATION"
    local repositories="$DEFAULT_REPOSITORIES"
    local pattern="$DEFAULT_PATTERN"
    local exclude_patterns="$DEFAULT_EXCLUDE"
    local min_age_days="$DEFAULT_MIN_AGE_DAYS"
    local org="$DEFAULT_ORG"
    local bridge_config_file="$DEFAULT_BRIDGE_CONFIG"
    local main_repo=""
    local add_repo=""
    local remove_repo=""
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
            --bridge-config|-b)
                bridge_config_file="$2"
                shift 2
                ;;
            --main-repo)
                main_repo="$2"
                shift 2
                ;;
            --add-repo)
                add_repo="$2"
                shift 2
                ;;
            --remove-repo)
                remove_repo="$2"
                shift 2
                ;;
            --force|-f)
                force="true"
                shift
                ;;
            --debug)
                export DEBUG="true"
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
    if [[ ! "$operation" =~ ^(list|dry-run|cleanup|bridge-init|bridge-config)$ ]]; then
        log_error "Invalid operation: $operation. Must be one of: list, dry-run, cleanup, bridge-init, bridge-config"
        exit 1
    fi
    
    # Handle bridge operations
    case "$operation" in
        "bridge-init")
            init_bridge_config "$bridge_config_file" "$main_repo" "$org"
            exit $?
            ;;
        "bridge-config")
            if [[ -n "$add_repo" ]]; then
                add_bridge_repository "$bridge_config_file" "$add_repo"
            elif [[ -n "$remove_repo" ]]; then
                remove_bridge_repository "$bridge_config_file" "$remove_repo"
            else
                show_bridge_config "$bridge_config_file"
            fi
            exit $?
            ;;
    esac
    
    # Load bridge configuration if using BRIDGE repositories or if bridge config exists
    if [[ "$repositories" == "BRIDGE" || -f "$bridge_config_file" ]]; then
        if load_bridge_config "$bridge_config_file"; then
            # Override org with bridge configuration if not explicitly provided
            if [[ "$org" == "$DEFAULT_ORG" ]]; then
                org=$(get_bridge_organization "$bridge_config_file")
            fi
            
            # Show bridge configuration summary
            show_bridge_config "$bridge_config_file"
        fi
    fi
    
    # Show configuration
    log_info "Enhanced Universal Branch Manager Configuration:"
    echo "  Operation: $operation"
    echo "  Organization: $org"
    echo "  Repositories: $repositories"
    echo "  Pattern: $pattern"
    echo "  Exclude: $exclude_patterns"
    echo "  Min Age: $min_age_days days"
    echo "  Bridge Config: $bridge_config_file"
    echo "  Force: $force"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Discover repositories
    log_info "Discovering target repositories..."
    local repo_list
    repo_list=$(discover_repositories "$repositories" "$org" "$bridge_config_file")
    
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
    
    log_success "Enhanced universal branch management completed"
}

# Run main function with all arguments
main "$@"