#!/bin/bash

# Branch Intelligence System
# Provides cross-repository branch analysis, PR/Issue correlation, and deviation detection
# Builds on the Universal Branch Manager for advanced branch management and chaos prevention

set -e

# Default configuration
DEFAULT_OPERATION="analyze"
DEFAULT_REPOSITORIES="ALL"
DEFAULT_COMPARE_WITH="main"
DEFAULT_MAX_COMPLEXITY="10"
DEFAULT_ORG="poisontr33s"
DEFAULT_OUTPUT_FORMAT="table"
DEFAULT_THRESHOLD_COMMITS="50"
DEFAULT_THRESHOLD_FILES="20"
DEFAULT_ESCALATION_SCORE="8"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Help function
show_help() {
    cat << EOF
Branch Intelligence System - Advanced Branch Analysis & Chaos Prevention

USAGE:
    $0 [OPTIONS]

OPERATIONS:
    analyze         Analyze branches for complexity, deviation, and progression
    report          Generate comprehensive branch health report
    correlate       Cross-reference branches with PRs and Issues
    escalate        Identify branches requiring immediate attention
    compare         Compare branch progression against base branch
    chaos-check     Detect "branches gone wild" scenarios

OPTIONS:
    --operation, -o           Operation to perform [default: $DEFAULT_OPERATION]
    --repositories, -r        Target repositories (comma-separated or "ALL") [default: $DEFAULT_REPOSITORIES]
    --compare-with, -c        Base branch for comparison [default: $DEFAULT_COMPARE_WITH]
    --max-complexity, -m      Maximum complexity score before escalation [default: $DEFAULT_MAX_COMPLEXITY]
    --org                     GitHub organization [default: $DEFAULT_ORG]
    --output-format, -f       Output format (table|json|markdown) [default: $DEFAULT_OUTPUT_FORMAT]
    --threshold-commits       Commit count threshold for complexity scoring [default: $DEFAULT_THRESHOLD_COMMITS]
    --threshold-files         File count threshold for complexity scoring [default: $DEFAULT_THRESHOLD_FILES]
    --escalation-score        Score threshold for automatic escalation [default: $DEFAULT_ESCALATION_SCORE]
    --help, -h                Show this help message

EXAMPLES:
    # Analyze all branches across all repositories
    $0 --operation analyze
    
    # Generate markdown report for specific repositories
    $0 --operation report --repositories "repo1,repo2" --output-format markdown
    
    # Check for chaos scenarios with custom thresholds
    $0 --operation chaos-check --threshold-commits 30 --threshold-files 15
    
    # Compare branches against develop instead of main
    $0 --operation compare --compare-with develop
    
    # Correlate branches with PRs and Issues
    $0 --operation correlate --repositories "MCP-Orchestration"

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

log_analysis() {
    echo -e "${PURPLE}[ANALYSIS]${NC} $1"
}

log_correlation() {
    echo -e "${CYAN}[CORRELATION]${NC} $1"
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
    
    # Check if jq is available (for JSON processing)
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed. Some advanced features may be limited."
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

# Calculate branch complexity score
calculate_complexity_score() {
    local org="$1"
    local repo="$2"
    local branch="$3"
    local base_branch="$4"
    local threshold_commits="$5"
    local threshold_files="$6"
    
    local score=0
    
    # Get commit count ahead of base
    local commits_ahead
    commits_ahead=$(gh api "repos/$org/$repo/compare/$base_branch...$branch" --jq '.ahead_by' 2>/dev/null || echo "0")
    
    # Get file changes
    local files_changed
    files_changed=$(gh api "repos/$org/$repo/compare/$base_branch...$branch" --jq '.files | length' 2>/dev/null || echo "0")
    
    # Get branch age in days
    local branch_age
    branch_age=$(get_branch_age_days "$org" "$repo" "$branch")
    
    # Calculate complexity score based on multiple factors
    if [[ "$commits_ahead" -gt "$threshold_commits" ]]; then
        score=$((score + 3))
    elif [[ "$commits_ahead" -gt $(($threshold_commits / 2)) ]]; then
        score=$((score + 2))
    elif [[ "$commits_ahead" -gt $(($threshold_commits / 4)) ]]; then
        score=$((score + 1))
    fi
    
    if [[ "$files_changed" -gt "$threshold_files" ]]; then
        score=$((score + 3))
    elif [[ "$files_changed" -gt $(($threshold_files / 2)) ]]; then
        score=$((score + 2))
    elif [[ "$files_changed" -gt $(($threshold_files / 4)) ]]; then
        score=$((score + 1))
    fi
    
    # Age factor (older branches get higher scores)
    if [[ "$branch_age" -gt 30 ]]; then
        score=$((score + 2))
    elif [[ "$branch_age" -gt 14 ]]; then
        score=$((score + 1))
    fi
    
    echo "$score"
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
        commit_date=$(date -d "$last_commit" +%s)
        current_date=$(date +%s)
        age_days=$(( (current_date - commit_date) / 86400 ))
        echo "$age_days"
    else
        echo "0"
    fi
}

# Get branch correlation with PRs and Issues
get_branch_correlations() {
    local org="$1"
    local repo="$2"
    local branch="$3"
    
    local correlations=""
    
    # Check for open PRs
    local prs
    prs=$(gh api "repos/$org/$repo/pulls" --jq ".[] | select(.head.ref == \"$branch\") | .number" 2>/dev/null || echo "")
    if [[ -n "$prs" ]]; then
        correlations="$correlations PR:$prs"
    fi
    
    # Check for related issues (simple heuristic: branch name contains issue number)
    if [[ "$branch" =~ issue-([0-9]+) ]] || [[ "$branch" =~ ([0-9]+)-fix ]] || [[ "$branch" =~ fix-([0-9]+) ]]; then
        local issue_num="${BASH_REMATCH[1]}"
        local issue_exists
        issue_exists=$(gh api "repos/$org/$repo/issues/$issue_num" --jq '.number' 2>/dev/null || echo "")
        if [[ -n "$issue_exists" ]]; then
            correlations="$correlations Issue:$issue_num"
        fi
    fi
    
    echo "$correlations"
}

# Analyze a single branch
analyze_branch() {
    local org="$1"
    local repo="$2"
    local branch="$3"
    local base_branch="$4"
    local threshold_commits="$5"
    local threshold_files="$6"
    local escalation_score="$7"
    
    local complexity_score
    complexity_score=$(calculate_complexity_score "$org" "$repo" "$branch" "$base_branch" "$threshold_commits" "$threshold_files")
    
    local correlations
    correlations=$(get_branch_correlations "$org" "$repo" "$branch")
    
    local branch_age
    branch_age=$(get_branch_age_days "$org" "$repo" "$branch")
    
    # Get commit and file counts
    local commits_ahead files_changed
    commits_ahead=$(gh api "repos/$org/$repo/compare/$base_branch...$branch" --jq '.ahead_by' 2>/dev/null || echo "0")
    files_changed=$(gh api "repos/$org/$repo/compare/$base_branch...$branch" --jq '.files | length' 2>/dev/null || echo "0")
    
    # Determine status
    local status="NORMAL"
    if [[ "$complexity_score" -ge "$escalation_score" ]]; then
        status="ESCALATION_REQUIRED"
    elif [[ "$complexity_score" -ge $(($escalation_score - 2)) ]]; then
        status="ATTENTION_NEEDED"
    fi
    
    # Return structured data
    echo "REPO:$repo|BRANCH:$branch|COMPLEXITY:$complexity_score|STATUS:$status|AGE:$branch_age|COMMITS:$commits_ahead|FILES:$files_changed|CORRELATIONS:$correlations"
}

# Process repositories for analysis
process_analysis() {
    local repositories="$1"
    local org="$2"
    local base_branch="$3"
    local threshold_commits="$4"
    local threshold_files="$5"
    local escalation_score="$6"
    local output_format="$7"
    
    log_analysis "Starting branch intelligence analysis..."
    
    local repo_list
    repo_list=$(discover_repositories "$repositories" "$org")
    
    if [[ -z "$repo_list" ]]; then
        log_error "No repositories found"
        exit 1
    fi
    
    local analysis_results=()
    local total_branches=0
    local escalation_branches=0
    local attention_branches=0
    
    # Process each repository
    for repo in $repo_list; do
        log_info "Analyzing repository: $repo"
        
        # Get all branches except the base branch
        local branches
        branches=$(gh api "repos/$org/$repo/branches" --jq '.[].name' 2>/dev/null || echo "")
        
        if [[ -z "$branches" ]]; then
            log_warning "No branches found or repository not accessible: $repo"
            continue
        fi
        
        # Analyze each branch
        while read -r branch; do
            [[ -z "$branch" ]] && continue
            [[ "$branch" == "$base_branch" ]] && continue
            
            local result
            result=$(analyze_branch "$org" "$repo" "$branch" "$base_branch" "$threshold_commits" "$threshold_files" "$escalation_score")
            analysis_results+=("$result")
            
            total_branches=$((total_branches + 1))
            
            # Count status types
            if [[ "$result" == *"STATUS:ESCALATION_REQUIRED"* ]]; then
                escalation_branches=$((escalation_branches + 1))
            elif [[ "$result" == *"STATUS:ATTENTION_NEEDED"* ]]; then
                attention_branches=$((attention_branches + 1))
            fi
            
        done <<< "$branches"
    done
    
    # Output results in requested format
    output_analysis_results "${analysis_results[@]}" "$output_format" "$total_branches" "$escalation_branches" "$attention_branches"
}

# Output analysis results in specified format
output_analysis_results() {
    local results=("$@")
    local output_format="${@: -4:1}"
    local total_branches="${@: -3:1}"
    local escalation_branches="${@: -2:1}"
    local attention_branches="${@: -1}"
    
    case "$output_format" in
        "table")
            output_table_format "${results[@]}" "$total_branches" "$escalation_branches" "$attention_branches"
            ;;
        "json")
            output_json_format "${results[@]}" "$total_branches" "$escalation_branches" "$attention_branches"
            ;;
        "markdown")
            output_markdown_format "${results[@]}" "$total_branches" "$escalation_branches" "$attention_branches"
            ;;
        *)
            log_error "Unknown output format: $output_format"
            exit 1
            ;;
    esac
}

# Output in table format
output_table_format() {
    local results=("$@")
    local total_branches="${@: -3:1}"
    local escalation_branches="${@: -2:1}"
    local attention_branches="${@: -1}"
    
    echo ""
    log_success "Branch Intelligence Analysis Complete"
    echo ""
    printf "%-20s %-25s %-12s %-18s %-6s %-8s %-7s %-15s\n" "REPOSITORY" "BRANCH" "COMPLEXITY" "STATUS" "AGE" "COMMITS" "FILES" "CORRELATIONS"
    printf "%-20s %-25s %-12s %-18s %-6s %-8s %-7s %-15s\n" "────────────────────" "─────────────────────────" "────────────" "──────────────────" "──────" "────────" "───────" "───────────────"
    
    for result in "${results[@]:0:${#results[@]}-3}"; do
        if [[ -n "$result" ]]; then
            local repo branch complexity status age commits files correlations
            repo=$(echo "$result" | cut -d'|' -f1 | cut -d':' -f2)
            branch=$(echo "$result" | cut -d'|' -f2 | cut -d':' -f2)
            complexity=$(echo "$result" | cut -d'|' -f3 | cut -d':' -f2)
            status=$(echo "$result" | cut -d'|' -f4 | cut -d':' -f2)
            age=$(echo "$result" | cut -d'|' -f5 | cut -d':' -f2)
            commits=$(echo "$result" | cut -d'|' -f6 | cut -d':' -f2)
            files=$(echo "$result" | cut -d'|' -f7 | cut -d':' -f2)
            correlations=$(echo "$result" | cut -d'|' -f8 | cut -d':' -f2-)
            
            # Truncate long branch names
            if [[ ${#branch} -gt 24 ]]; then
                branch="${branch:0:21}..."
            fi
            
            # Color code based on status
            case "$status" in
                "ESCALATION_REQUIRED")
                    printf "${RED}%-20s %-25s %-12s %-18s %-6s %-8s %-7s %-15s${NC}\n" "$repo" "$branch" "$complexity" "$status" "${age}d" "$commits" "$files" "$correlations"
                    ;;
                "ATTENTION_NEEDED")
                    printf "${YELLOW}%-20s %-25s %-12s %-18s %-6s %-8s %-7s %-15s${NC}\n" "$repo" "$branch" "$complexity" "$status" "${age}d" "$commits" "$files" "$correlations"
                    ;;
                *)
                    printf "%-20s %-25s %-12s %-18s %-6s %-8s %-7s %-15s\n" "$repo" "$branch" "$complexity" "$status" "${age}d" "$commits" "$files" "$correlations"
                    ;;
            esac
        fi
    done
    
    echo ""
    log_analysis "Summary:"
    echo "  Total branches analyzed: $total_branches"
    echo "  Branches requiring escalation: $escalation_branches"
    echo "  Branches needing attention: $attention_branches"
    echo "  Branches in normal state: $((total_branches - escalation_branches - attention_branches))"
}

# Output in JSON format
output_json_format() {
    local results=("$@")
    local total_branches="${@: -3:1}"
    local escalation_branches="${@: -2:1}"
    local attention_branches="${@: -1}"
    
    echo "{"
    echo "  \"timestamp\": \"$(date -u +"%Y-%m-%d %H:%M:%S UTC")\","
    echo "  \"summary\": {"
    echo "    \"total_branches\": $total_branches,"
    echo "    \"escalation_required\": $escalation_branches,"
    echo "    \"attention_needed\": $attention_branches,"
    echo "    \"normal_state\": $((total_branches - escalation_branches - attention_branches))"
    echo "  },"
    echo "  \"branches\": ["
    
    local first=true
    for result in "${results[@]:0:${#results[@]}-3}"; do
        if [[ -n "$result" ]]; then
            if [[ "$first" == "false" ]]; then
                echo ","
            fi
            first=false
            
            local repo branch complexity status age commits files correlations
            repo=$(echo "$result" | cut -d'|' -f1 | cut -d':' -f2)
            branch=$(echo "$result" | cut -d'|' -f2 | cut -d':' -f2)
            complexity=$(echo "$result" | cut -d'|' -f3 | cut -d':' -f2)
            status=$(echo "$result" | cut -d'|' -f4 | cut -d':' -f2)
            age=$(echo "$result" | cut -d'|' -f5 | cut -d':' -f2)
            commits=$(echo "$result" | cut -d'|' -f6 | cut -d':' -f2)
            files=$(echo "$result" | cut -d'|' -f7 | cut -d':' -f2)
            correlations=$(echo "$result" | cut -d'|' -f8 | cut -d':' -f2-)
            
            echo -n "    {"
            echo -n "\"repository\": \"$repo\", "
            echo -n "\"branch\": \"$branch\", "
            echo -n "\"complexity_score\": $complexity, "
            echo -n "\"status\": \"$status\", "
            echo -n "\"age_days\": $age, "
            echo -n "\"commits_ahead\": $commits, "
            echo -n "\"files_changed\": $files, "
            echo -n "\"correlations\": \"$correlations\""
            echo -n "}"
        fi
    done
    
    echo ""
    echo "  ]"
    echo "}"
}

# Output in markdown format
output_markdown_format() {
    local results=("$@")
    local total_branches="${@: -3:1}"
    local escalation_branches="${@: -2:1}"
    local attention_branches="${@: -1}"
    
    echo "# Branch Intelligence Analysis Report"
    echo ""
    echo "**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
    echo ""
    echo "## Summary"
    echo ""
    echo "| Metric | Count |"
    echo "|--------|-------|"
    echo "| Total branches analyzed | $total_branches |"
    echo "| Branches requiring escalation | $escalation_branches |"
    echo "| Branches needing attention | $attention_branches |"
    echo "| Branches in normal state | $((total_branches - escalation_branches - attention_branches)) |"
    echo ""
    echo "## Branch Analysis Details"
    echo ""
    echo "| Repository | Branch | Complexity | Status | Age | Commits | Files | Correlations |"
    echo "|------------|--------|------------|--------|-----|---------|-------|--------------|"
    
    for result in "${results[@]:0:${#results[@]}-3}"; do
        if [[ -n "$result" ]]; then
            local repo branch complexity status age commits files correlations
            repo=$(echo "$result" | cut -d'|' -f1 | cut -d':' -f2)
            branch=$(echo "$result" | cut -d'|' -f2 | cut -d':' -f2)
            complexity=$(echo "$result" | cut -d'|' -f3 | cut -d':' -f2)
            status=$(echo "$result" | cut -d'|' -f4 | cut -d':' -f2)
            age=$(echo "$result" | cut -d'|' -f5 | cut -d':' -f2)
            commits=$(echo "$result" | cut -d'|' -f6 | cut -d':' -f2)
            files=$(echo "$result" | cut -d'|' -f7 | cut -d':' -f2)
            correlations=$(echo "$result" | cut -d'|' -f8 | cut -d':' -f2-)
            
            # Add emoji indicators based on status
            case "$status" in
                "ESCALATION_REQUIRED")
                    status="🚨 $status"
                    ;;
                "ATTENTION_NEEDED")
                    status="⚠️ $status"
                    ;;
                *)
                    status="✅ $status"
                    ;;
            esac
            
            echo "| $repo | $branch | $complexity | $status | ${age}d | $commits | $files | $correlations |"
        fi
    done
    
    echo ""
    echo "## Legend"
    echo ""
    echo "- 🚨 **Escalation Required**: High complexity branches that need immediate attention"
    echo "- ⚠️ **Attention Needed**: Moderate complexity branches that should be reviewed"
    echo "- ✅ **Normal State**: Branches operating within normal parameters"
}

# Main function
main() {
    local operation="$DEFAULT_OPERATION"
    local repositories="$DEFAULT_REPOSITORIES"
    local compare_with="$DEFAULT_COMPARE_WITH"
    local max_complexity="$DEFAULT_MAX_COMPLEXITY"
    local org="$DEFAULT_ORG"
    local output_format="$DEFAULT_OUTPUT_FORMAT"
    local threshold_commits="$DEFAULT_THRESHOLD_COMMITS"
    local threshold_files="$DEFAULT_THRESHOLD_FILES"
    local escalation_score="$DEFAULT_ESCALATION_SCORE"
    
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
            --compare-with|-c)
                compare_with="$2"
                shift 2
                ;;
            --max-complexity|-m)
                max_complexity="$2"
                shift 2
                ;;
            --org)
                org="$2"
                shift 2
                ;;
            --output-format|-f)
                output_format="$2"
                shift 2
                ;;
            --threshold-commits)
                threshold_commits="$2"
                shift 2
                ;;
            --threshold-files)
                threshold_files="$2"
                shift 2
                ;;
            --escalation-score)
                escalation_score="$2"
                shift 2
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
    if [[ ! "$operation" =~ ^(analyze|report|correlate|escalate|compare|chaos-check)$ ]]; then
        log_error "Invalid operation: $operation. Must be one of: analyze, report, correlate, escalate, compare, chaos-check"
        exit 1
    fi
    
    # Validate output format
    if [[ ! "$output_format" =~ ^(table|json|markdown)$ ]]; then
        log_error "Invalid output format: $output_format. Must be one of: table, json, markdown"
        exit 1
    fi
    
    # Show configuration
    log_info "Branch Intelligence System Configuration:"
    echo "  Operation: $operation"
    echo "  Organization: $org"
    echo "  Repositories: $repositories"
    echo "  Compare with: $compare_with"
    echo "  Output format: $output_format"
    echo "  Complexity thresholds: commits=$threshold_commits, files=$threshold_files"
    echo "  Escalation score: $escalation_score"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Execute operation
    case "$operation" in
        "analyze"|"report"|"correlate"|"escalate"|"compare"|"chaos-check")
            process_analysis "$repositories" "$org" "$compare_with" "$threshold_commits" "$threshold_files" "$escalation_score" "$output_format"
            ;;
        *)
            log_error "Operation not yet implemented: $operation"
            exit 1
            ;;
    esac
    
    log_success "Branch intelligence analysis completed"
}

# Run main function with all arguments
main "$@"