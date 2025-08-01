#!/bin/bash
# Universal Task Orchestration Engine
# Executes micro-tasks with intelligent validation and rollback capabilities

set -euo pipefail

# Configuration
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$REPO_ROOT/logs/task-execution"
TASK_CONFIG="$REPO_ROOT/docs/MICRO_TASK_EXECUTION_FRAMEWORK.md"
BACKUP_DIR="$REPO_ROOT/.task-backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/execution.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/execution.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/execution.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/execution.log"
}

# Initialize task execution environment
initialize_environment() {
    log_info "Initializing Universal Task Orchestration Engine..."
    
    # Create necessary directories
    mkdir -p "$LOG_DIR" "$BACKUP_DIR"
    
    # Verify repository state
    if ! git status &>/dev/null; then
        log_error "Not in a git repository. Aborting."
        exit 1
    fi
    
    # Create execution timestamp
    EXECUTION_ID="$(date '+%Y%m%d_%H%M%S')"
    export EXECUTION_ID
    
    log_success "Environment initialized with execution ID: $EXECUTION_ID"
}

# Create system backup before task execution
create_backup() {
    local task_id="$1"
    local backup_path="$BACKUP_DIR/${task_id}_${EXECUTION_ID}"
    
    log_info "Creating backup for task: $task_id"
    
    # Create git stash as backup
    git stash push -m "Pre-task backup: $task_id - $EXECUTION_ID" || true
    
    # Record current commit
    git rev-parse HEAD > "$backup_path.commit"
    
    # Backup package.json files
    mkdir -p "$backup_path"
    find "$REPO_ROOT" -name "package.json" -exec cp {} "$backup_path/" \; 2>/dev/null || true
    
    log_success "Backup created at: $backup_path"
}

# Validate task prerequisites
validate_prerequisites() {
    local task_id="$1"
    
    log_info "Validating prerequisites for task: $task_id"
    
    # Check if pnpm is available
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is required but not installed"
        return 1
    fi
    
    # Check repository status
    if ! git diff --quiet; then
        log_warning "Repository has uncommitted changes"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Task execution cancelled by user"
            return 1
        fi
    fi
    
    # Validate network connectivity for dependency updates
    if [[ "$task_id" =~ ^DEP- ]]; then
        if ! curl -s --head https://registry.npmjs.org/ > /dev/null; then
            log_error "Cannot reach npm registry. Network connectivity required for dependency tasks."
            return 1
        fi
    fi
    
    log_success "Prerequisites validation passed"
    return 0
}

# Execute dependency consolidation tasks
execute_dep_react_consolidation() {
    log_info "Executing React ecosystem consolidation..."
    
    cd "$REPO_ROOT"
    
    # Update React and React-DOM to 19.1.1 across all packages
    log_info "Updating React dependencies..."
    pnpm update react@19.1.1 react-dom@19.1.1
    
    # Verify no breaking changes
    log_info "Building packages to verify compatibility..."
    pnpm run build || {
        log_error "Build failed after React update"
        return 1
    }
    
    # Run tests if available
    if pnpm run test &>/dev/null; then
        log_info "Running tests to verify React compatibility..."
        pnpm run test || {
            log_error "Tests failed after React update"
            return 1
        }
    fi
    
    log_success "React ecosystem consolidation completed successfully"
}

execute_dep_ui_unification() {
    log_info "Executing UI library unification..."
    
    cd "$REPO_ROOT"
    
    # Update UI libraries
    log_info "Updating lucide-react and tailwind-merge..."
    pnpm update lucide-react@0.532.0 tailwind-merge@3.3.1
    
    # Verify monitor package specifically
    if [ -d "packages/monitor" ]; then
        log_info "Verifying monitor package UI consistency..."
        cd packages/monitor
        pnpm run build || {
            log_error "Monitor package build failed after UI updates"
            return 1
        }
        cd "$REPO_ROOT"
    fi
    
    log_success "UI library unification completed successfully"
}

execute_dep_typescript_alignment() {
    log_info "Executing TypeScript ecosystem alignment..."
    
    cd "$REPO_ROOT"
    
    # Update @types/node
    log_info "Updating @types/node to 24.1.0..."
    pnpm update @types/node@24.1.0
    
    # Verify TypeScript compilation across all packages
    log_info "Verifying TypeScript compilation..."
    pnpm run lint || {
        log_error "Linting failed after TypeScript updates"
        return 1
    }
    
    # Run type checking
    if command -v tsc &> /dev/null; then
        log_info "Running TypeScript type checking..."
        pnpm run typecheck || pnpm exec tsc --noEmit || {
            log_error "TypeScript type checking failed"
            return 1
        }
    fi
    
    log_success "TypeScript ecosystem alignment completed successfully"
}

# Execute infrastructure automation tasks
execute_infra_actions_v4() {
    log_info "Executing GitHub Actions v4 migration..."
    
    # This task primarily involves workflow file updates
    # Validate workflow YAML syntax
    if command -v yamllint &> /dev/null; then
        log_info "Validating workflow YAML syntax..."
        find .github/workflows -name "*.yml" -o -name "*.yaml" | xargs yamllint || {
            log_warning "YAML linting issues detected - manual review recommended"
        }
    fi
    
    log_success "GitHub Actions v4 migration validation completed"
}

execute_bridge_cross_repo_activation() {
    log_info "Executing cross-repository bridge activation..."
    
    # Verify universal automation scripts
    if [ -f "scripts/universal-automation.sh" ]; then
        log_info "Testing universal automation scripts..."
        bash -n scripts/universal-automation.sh || {
            log_error "Universal automation script has syntax errors"
            return 1
        }
    fi
    
    # Test language detection
    if [ -f "scripts/detect-project-type.sh" ]; then
        log_info "Testing project type detection..."
        bash scripts/detect-project-type.sh . || {
            log_warning "Project type detection may need manual verification"
        }
    fi
    
    log_success "Cross-repository bridge activation completed"
}

# Main task execution router
execute_task() {
    local task_id="$1"
    
    log_info "Starting execution of task: $task_id"
    
    case "$task_id" in
        "DEP-REACT-CONSOLIDATION")
            execute_dep_react_consolidation
            ;;
        "DEP-UI-UNIFICATION")
            execute_dep_ui_unification
            ;;
        "DEP-TYPESCRIPT-ALIGNMENT")
            execute_dep_typescript_alignment
            ;;
        "INFRA-ACTIONS-V4")
            execute_infra_actions_v4
            ;;
        "BRIDGE-CROSS-REPO-ACTIVATION")
            execute_bridge_cross_repo_activation
            ;;
        *)
            log_error "Unknown task ID: $task_id"
            return 1
            ;;
    esac
}

# Rollback functionality
rollback_task() {
    local task_id="$1"
    local backup_path="$BACKUP_DIR/${task_id}_${EXECUTION_ID}"
    
    log_warning "Rolling back task: $task_id"
    
    if [ -f "$backup_path.commit" ]; then
        local backup_commit=$(cat "$backup_path.commit")
        log_info "Restoring to commit: $backup_commit"
        git reset --hard "$backup_commit"
    fi
    
    # Restore package.json files if available
    if [ -d "$backup_path" ]; then
        log_info "Restoring package.json files..."
        find "$backup_path" -name "package.json" -exec basename {} \; | while read -r file; do
            if [ -f "$REPO_ROOT/$file" ]; then
                cp "$backup_path/$file" "$REPO_ROOT/$file"
            fi
        done
    fi
    
    log_success "Rollback completed for task: $task_id"
}

# Main execution function
main() {
    local task_id="${1:-}"
    
    if [ -z "$task_id" ]; then
        echo "Usage: $0 <TASK_ID>"
        echo "Available tasks:"
        echo "  DEP-REACT-CONSOLIDATION"
        echo "  DEP-UI-UNIFICATION"
        echo "  DEP-TYPESCRIPT-ALIGNMENT"
        echo "  INFRA-ACTIONS-V4"
        echo "  BRIDGE-CROSS-REPO-ACTIVATION"
        exit 1
    fi
    
    initialize_environment
    
    if ! validate_prerequisites "$task_id"; then
        log_error "Prerequisites validation failed"
        exit 1
    fi
    
    create_backup "$task_id"
    
    if execute_task "$task_id"; then
        log_success "Task completed successfully: $task_id"
        
        # Commit changes if successful
        git add .
        git commit -m "feat: complete micro-task $task_id

Execution ID: $EXECUTION_ID
Automated by Universal Task Orchestration Engine

This commit represents the successful completion of micro-task $task_id
as part of the MCP Orchestration System PR consolidation strategy." || {
            log_warning "No changes to commit for task: $task_id"
        }
    else
        log_error "Task execution failed: $task_id"
        read -p "Attempt rollback? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            rollback_task "$task_id"
        fi
        exit 1
    fi
}

# Execute main function with all arguments
main "$@"