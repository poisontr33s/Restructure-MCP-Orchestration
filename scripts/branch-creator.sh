#!/bin/bash

# Branch Creator Script
# Simple branch creation utility following Captain Guthilda's conventions
# Provides straightforward branch creation for feature development

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

# Branch type prefixes following repository conventions
declare -A BRANCH_TYPES=(
    ["feature"]="New feature development"
    ["bugfix"]="Bug fixes and patches"
    ["hotfix"]="Critical urgent fixes"
    ["enhancement"]="Improvements to existing features"
    ["refactor"]="Code refactoring and restructuring"
    ["docs"]="Documentation updates"
    ["test"]="Testing improvements"
    ["copilot"]="AI-assisted development (follows existing pattern)"
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

# Show usage information
show_usage() {
    cat << EOF
🏴‍☠️ Captain Guthilda's Branch Creator

Usage: $0 [OPTIONS] [BRANCH_NAME]

Creates a new Git branch following repository conventions and Captain Guthilda's patterns.

OPTIONS:
  --type TYPE           Branch type: feature, bugfix, hotfix, enhancement, refactor, docs, test, copilot
  --base-branch BRANCH  Base branch to create from (default: main)
  --org ORG            GitHub organization (default: $DEFAULT_ORG)
  --repo REPO          Repository name (default: $DEFAULT_REPO)
  --description DESC   Branch description for documentation
  --local-only         Create branch locally only (no GitHub API)
  --list-types         Show available branch types
  --interactive        Interactive mode for branch creation
  --dry-run            Show what would be created without making changes
  --help               Show this help message

BRANCH_NAME:
  If not provided, will be generated based on type and description
  If provided, will be used as-is (with type prefix if --type is specified)

Examples:
  $0 --type feature --description "user authentication"
  $0 --type bugfix login-validation-fix
  $0 --interactive
  $0 --list-types
  $0 feature/user-dashboard

Branch Naming Conventions:
  - feature/descriptive-name
  - bugfix/issue-description  
  - hotfix/critical-fix
  - copilot/ai-feature-name
  - etc.

Captain Guthilda's Laws:
  1. All branches follow consistent naming patterns
  2. Branch purposes are clearly documented
  3. Integration with existing workflow systems
  4. Respect for the monorepo structure
EOF
}

# List available branch types
list_branch_types() {
    log_header "Available Branch Types"
    echo ""
    for type in "${!BRANCH_TYPES[@]}"; do
        echo -e "${CYAN}$type${NC}: ${BRANCH_TYPES[$type]}"
    done
    echo ""
}

# Interactive branch creation
interactive_mode() {
    log_header "Interactive Branch Creation"
    
    # Select branch type
    echo -e "${CYAN}Select branch type:${NC}"
    local i=1
    local types=()
    for type in "${!BRANCH_TYPES[@]}"; do
        types+=("$type")
        echo "$i) $type - ${BRANCH_TYPES[$type]}"
        ((i++))
    done
    
    echo -n "Enter choice (1-${#types[@]}): "
    read -r choice
    
    if [[ "$choice" -gt 0 && "$choice" -le "${#types[@]}" ]]; then
        local selected_type="${types[$((choice-1))]}"
        echo -e "${GREEN}Selected: $selected_type${NC}"
    else
        log_error "Invalid choice"
        exit 1
    fi
    
    # Get description
    echo -n "Enter branch description (e.g., 'user-authentication', 'fix-login-bug'): "
    read -r description
    
    if [[ -z "$description" ]]; then
        log_error "Description is required"
        exit 1
    fi
    
    # Generate branch name
    local branch_name="${selected_type}/${description}"
    
    # Get base branch
    echo -n "Base branch (default: main): "
    read -r base_branch
    base_branch=${base_branch:-main}
    
    # Confirm creation
    echo ""
    log_info "Branch to create: $branch_name"
    log_info "Base branch: $base_branch"
    echo -n "Create this branch? (y/N): "
    read -r confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        create_branch "$DEFAULT_ORG" "$DEFAULT_REPO" "$base_branch" "$branch_name" "$description" "false"
    else
        log_info "Branch creation cancelled"
    fi
}

# Validate branch name format
validate_branch_name() {
    local branch_name="$1"
    
    # Check for valid characters
    if [[ ! "$branch_name" =~ ^[a-zA-Z0-9/_-]+$ ]]; then
        log_error "Branch name contains invalid characters. Use only letters, numbers, /, -, and _"
        return 1
    fi
    
    # Check for reserved names
    case "$branch_name" in
        main|master|develop|production|staging)
            log_error "Cannot create branch with reserved name: $branch_name"
            return 1
            ;;
    esac
    
    return 0
}

# Create the actual branch
create_branch() {
    local org="$1"
    local repo="$2"
    local base_branch="$3"
    local branch_name="$4"
    local description="$5"
    local dry_run="$6"
    local local_only="$7"
    
    log_header "Creating Branch: $branch_name"
    
    # Validate branch name
    if ! validate_branch_name "$branch_name"; then
        exit 1
    fi
    
    if [[ "$dry_run" == "true" ]]; then
        log_warning "[DRY RUN] Would create branch: $branch_name from $base_branch"
        log_warning "[DRY RUN] Description: $description"
        return
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
    
    # Check if branch already exists locally
    if git show-ref --verify --quiet "refs/heads/$branch_name"; then
        log_warning "Branch $branch_name already exists locally"
        echo -n "Switch to existing branch? (y/N): "
        read -r switch_confirm
        if [[ "$switch_confirm" =~ ^[Yy]$ ]]; then
            git checkout "$branch_name"
            log_success "Switched to existing branch: $branch_name"
        fi
        return
    fi
    
    # If not local-only, check GitHub API
    if [[ "$local_only" != "true" ]] && command -v gh >/dev/null 2>&1; then
        # Check if branch exists on remote
        if gh api "repos/$org/$repo/branches/$branch_name" &>/dev/null; then
            log_warning "Branch $branch_name already exists on remote"
            echo -n "Create local tracking branch? (y/N): "
            read -r track_confirm
            if [[ "$track_confirm" =~ ^[Yy]$ ]]; then
                git fetch origin "$branch_name:$branch_name"
                git checkout "$branch_name"
                log_success "Created local tracking branch: $branch_name"
            fi
            return
        fi
    fi
    
    # Ensure we have the latest base branch
    log_info "Fetching latest $base_branch..."
    git fetch origin "$base_branch" || log_warning "Could not fetch $base_branch from remote"
    
    # Create and switch to new branch
    log_info "Creating branch $branch_name from $base_branch..."
    if git checkout -b "$branch_name" "origin/$base_branch" 2>/dev/null || git checkout -b "$branch_name" "$base_branch"; then
        log_success "Created and switched to branch: $branch_name"
    else
        log_error "Failed to create branch: $branch_name"
        exit 1
    fi
    
    # Create branch documentation if description provided
    if [[ -n "$description" && "$local_only" != "true" ]]; then
        create_branch_documentation "$branch_name" "$description" "$base_branch"
    fi
    
    # Push to remote if not local-only and gh is available
    if [[ "$local_only" != "true" ]] && command -v gh >/dev/null 2>&1; then
        log_info "Pushing branch to remote..."
        if git push -u origin "$branch_name"; then
            log_success "Branch pushed to remote: $branch_name"
        else
            log_warning "Could not push to remote (you may need to push manually later)"
        fi
    fi
    
    log_success "Branch creation complete!"
    log_info "Current branch: $(git branch --show-current)"
    
    # Show next steps
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "1. Make your changes"
    echo "2. Commit your work: git add . && git commit -m 'Your commit message'"
    echo "3. Push changes: git push"
    echo "4. Create a Pull Request when ready"
}

# Create branch documentation
create_branch_documentation() {
    local branch_name="$1"
    local description="$2"
    local base_branch="$3"
    
    # Only create documentation for feature branches or if in packages directory
    if [[ "$branch_name" == feature/* ]] || [[ -d "packages" ]]; then
        local doc_file=".branch-info.md"
        
        cat > "$doc_file" << EOF
# Branch: $branch_name

## Description
$description

## Base Branch
$base_branch

## Branch Information
- **Created**: $(date)
- **Purpose**: Implementation branch for $description
- **Type**: $(echo "$branch_name" | cut -d'/' -f1)

## Status
- [ ] Implementation started
- [ ] Tests written
- [ ] Documentation updated
- [ ] Ready for review

## Notes
<!-- Add any relevant notes about this branch -->

---
*Created by Captain Guthilda's Branch Creator*
EOF
        
        git add "$doc_file"
        git commit -m "Add branch documentation for $branch_name"
        log_info "Created branch documentation: $doc_file"
    fi
}

# Parse command line arguments
parse_arguments() {
    local branch_type=""
    local branch_name=""
    local description=""
    local base_branch="$DEFAULT_BASE_BRANCH"
    local org="$DEFAULT_ORG"
    local repo="$DEFAULT_REPO"
    local dry_run="false"
    local local_only="false"
    local interactive="false"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --type)
                branch_type="$2"
                shift 2
                ;;
            --base-branch)
                base_branch="$2"
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
            --description)
                description="$2"
                shift 2
                ;;
            --local-only)
                local_only="true"
                shift
                ;;
            --list-types)
                list_branch_types
                exit 0
                ;;
            --interactive)
                interactive="true"
                shift
                ;;
            --dry-run)
                dry_run="true"
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                if [[ -z "$branch_name" ]]; then
                    branch_name="$1"
                else
                    log_error "Too many arguments"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Handle interactive mode
    if [[ "$interactive" == "true" ]]; then
        interactive_mode
        return
    fi
    
    # Validate branch type if provided
    if [[ -n "$branch_type" ]] && [[ -z "${BRANCH_TYPES[$branch_type]}" ]]; then
        log_error "Invalid branch type: $branch_type"
        log_info "Use --list-types to see available types"
        exit 1
    fi
    
    # Generate branch name if not provided
    if [[ -z "$branch_name" ]]; then
        if [[ -n "$branch_type" && -n "$description" ]]; then
            branch_name="${branch_type}/${description}"
        elif [[ -n "$branch_type" ]]; then
            log_error "Description required when using --type without branch name"
            exit 1
        else
            log_error "Either provide a branch name or use --type with --description"
            show_usage
            exit 1
        fi
    elif [[ -n "$branch_type" && "$branch_name" != "$branch_type"/* ]]; then
        # Add type prefix if not already present
        branch_name="${branch_type}/${branch_name}"
    fi
    
    # Use branch name as description if not provided
    if [[ -z "$description" ]]; then
        description="$(echo "$branch_name" | sed 's|.*/||' | tr '-' ' ')"
    fi
    
    # Create the branch
    create_branch "$org" "$repo" "$base_branch" "$branch_name" "$description" "$dry_run" "$local_only"
}

# Main execution
main() {
    # Show header
    echo -e "${PURPLE}🏴‍☠️ Captain Guthilda's Branch Creator${NC}"
    echo ""
    
    # Parse arguments or show usage if none provided
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 0
    fi
    
    parse_arguments "$@"
}

# Run main function
main "$@"