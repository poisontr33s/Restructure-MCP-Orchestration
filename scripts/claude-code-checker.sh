#!/bin/bash

# Claude Code Installation Checker Script
# Verifies Claude Code installation across repositories and branches

set -e

# Default configuration
DEFAULT_OPERATION="check"
DEFAULT_REPOSITORIES="ALL"
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
Claude Code Installation Checker

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --operation, -o         Operation to perform (check|install|report) [default: $DEFAULT_OPERATION]
    --repositories, -r      Target repositories (comma-separated or "ALL") [default: $DEFAULT_REPOSITORIES]
    --org                   GitHub organization [default: $DEFAULT_ORG]
    --test-mode             Run in test mode (no authentication required)
    --help, -h              Show this help message

EXAMPLES:
    # Check Claude Code installation across all repositories
    $0 --operation check
    
    # Check specific repositories
    $0 --operation check --repositories "repo1,repo2"
    
    # Generate installation report
    $0 --operation report

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
    
    # Check if authenticated (skip in test mode)
    if [[ "$test_mode" != "true" ]] && ! gh auth status &> /dev/null; then
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
        if [[ "$test_mode" == "true" ]]; then
            # Test mode: return some example repositories
            echo "Restructure-MCP-Orchestration poisontr33s PsychoNoir-Kontrapunkt"
        else
            log_info "Discovering all repositories for organization: $org"
            gh repo list "$org" --json name --jq '.[].name' | tr '\n' ' '
        fi
    else
        echo "$target_repos" | tr ',' ' '
    fi
}

# Check if Claude Code workflows exist in a repository
check_claude_workflows() {
    local repo="$1"
    local org="$2"
    local branch="$3"
    
    local claude_yml_exists=false
    local claude_review_yml_exists=false
    
    if [[ "$test_mode" == "true" ]]; then
        # Test mode: simulate some results
        if [[ "$repo" == "Restructure-MCP-Orchestration" ]]; then
            claude_yml_exists=true
            claude_review_yml_exists=true
        elif [[ "$repo" == "PsychoNoir-Kontrapunkt" ]]; then
            claude_yml_exists=true
            claude_review_yml_exists=false
        else
            claude_yml_exists=false
            claude_review_yml_exists=false
        fi
    else
        # Check for .github/workflows/claude.yml
        if gh api "repos/$org/$repo/contents/.github/workflows/claude.yml" --jq '.name' &>/dev/null; then
            claude_yml_exists=true
        fi
        
        # Check for .github/workflows/claude-code-review.yml
        if gh api "repos/$org/$repo/contents/.github/workflows/claude-code-review.yml" --jq '.name' &>/dev/null; then
            claude_review_yml_exists=true
        fi
    fi
    
    echo "$claude_yml_exists,$claude_review_yml_exists"
}

# Check if ANTHROPIC_API_KEY secret is configured
check_anthropic_secret() {
    local repo="$1"
    local org="$2"
    
    if [[ "$test_mode" == "true" ]]; then
        # Test mode: simulate some results
        if [[ "$repo" == "Restructure-MCP-Orchestration" ]]; then
            echo "true"
        elif [[ "$repo" == "PsychoNoir-Kontrapunkt" ]]; then
            echo "true"
        else
            echo "false"
        fi
    else
        # Check if ANTHROPIC_API_KEY secret exists
        if gh api "repos/$org/$repo/actions/secrets/ANTHROPIC_API_KEY" &>/dev/null; then
            echo "true"
        else
            echo "false"
        fi
    fi
}

# Check Claude Code installation for a single repository
check_repository_claude_code() {
    local repo="$1"
    local org="$2"
    local operation="$3"
    
    log_info "Checking Claude Code installation in repository: $repo"
    
    # Get all branches
    local branches
    if [[ "$test_mode" == "true" ]]; then
        # Test mode: simulate some branches
        branches="main develop copilot/feature-branch"
    else
        branches=$(gh api "repos/$org/$repo/branches" --jq '.[].name' 2>/dev/null || echo "")
    fi
    
    if [[ -z "$branches" ]]; then
        log_warning "No branches found or repository not accessible: $repo"
        return
    fi
    
    local main_branch_workflow_status=""
    local secret_status=""
    local total_branches=0
    local branches_with_claude=0
    
    # Check secret configuration
    secret_status=$(check_anthropic_secret "$repo" "$org")
    
    # Check each branch for Claude Code workflows
    for branch in $branches; do
        [[ -z "$branch" ]] && continue
        total_branches=$((total_branches + 1))
        
        # For main/master/develop branches, check more thoroughly
        if [[ "$branch" == "main" || "$branch" == "master" || "$branch" == "develop" ]]; then
            local workflow_status
            workflow_status=$(check_claude_workflows "$repo" "$org" "$branch")
            main_branch_workflow_status="$workflow_status"
            
            IFS=',' read -ra WORKFLOWS <<< "$workflow_status"
            if [[ "${WORKFLOWS[0]}" == "true" || "${WORKFLOWS[1]}" == "true" ]]; then
                branches_with_claude=$((branches_with_claude + 1))
            fi
        fi
    done
    
    # Report results
    case "$operation" in
        "check")
            echo "Repository: $repo"
            echo "  Total branches: $total_branches"
            echo "  ANTHROPIC_API_KEY configured: $([[ "$secret_status" == "true" ]] && echo "✅" || echo "❌")"
            
            if [[ -n "$main_branch_workflow_status" ]]; then
                IFS=',' read -ra WORKFLOWS <<< "$main_branch_workflow_status"
                echo "  Claude workflow (.github/workflows/claude.yml): $([[ "${WORKFLOWS[0]}" == "true" ]] && echo "✅" || echo "❌")"
                echo "  Claude review workflow (.github/workflows/claude-code-review.yml): $([[ "${WORKFLOWS[1]}" == "true" ]] && echo "✅" || echo "❌")"
            else
                echo "  No main/master/develop branch found"
            fi
            echo ""
            ;;
            
        "report")
            # Output in a format suitable for aggregation
            IFS=',' read -ra WORKFLOWS <<< "$main_branch_workflow_status"
            echo "$repo,${WORKFLOWS[0]:-false},${WORKFLOWS[1]:-false},$secret_status,$total_branches"
            ;;
    esac
}

# Main function
main() {
    local operation="$DEFAULT_OPERATION"
    local repositories="$DEFAULT_REPOSITORIES"
    local org="$DEFAULT_ORG"
    local test_mode="false"
    
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
            --org)
                org="$2"
                shift 2
                ;;
            --test-mode)
                test_mode="true"
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
    if [[ ! "$operation" =~ ^(check|install|report)$ ]]; then
        log_error "Invalid operation: $operation. Must be one of: check, install, report"
        exit 1
    fi
    
    # Show configuration
    log_info "Claude Code Checker Configuration:"
    echo "  Operation: $operation"
    echo "  Organization: $org"
    echo "  Repositories: $repositories"
    echo "  Test Mode: $test_mode"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Discover repositories
    log_info "Discovering target repositories..."
    local repo_list
    repo_list=$(discover_repositories "$repositories" "$org")
    
    if [[ -z "$repo_list" ]]; then
        log_error "No repositories found matching criteria"
        exit 1
    fi
    
    log_info "Found repositories: $repo_list"
    echo ""
    
    # Process each repository
    if [[ "$operation" == "report" ]]; then
        echo "Repository,Claude Workflow,Claude Review Workflow,ANTHROPIC_API_KEY,Total Branches"
    fi
    
    for repo in $repo_list; do
        check_repository_claude_code "$repo" "$org" "$operation"
    done
    
    log_success "Claude Code check completed"
}

# Run the main function
main "$@"