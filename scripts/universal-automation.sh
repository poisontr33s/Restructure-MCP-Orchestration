#!/bin/bash

# Universal Project Detection and Management System
# Language and ecosystem agnostic automation
# 
# Supports: Node.js, Python, Rust, Go, Java, .NET, Ruby, PHP, C/C++, and more

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="/tmp/universal-automation"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Detect project type and generate commands
detect_project_type() {
    local project_path="$1"
    local project_info=""
    
    cd "$project_path"
    
    # Node.js / JavaScript / TypeScript
    if [ -f "package.json" ]; then
        project_info="language=javascript"
        
        if [ -f "pnpm-lock.yaml" ]; then
            project_info="$project_info|package_manager=pnpm|install=pnpm install|build=pnpm build|test=pnpm test|lint=pnpm lint"
        elif [ -f "yarn.lock" ]; then
            project_info="$project_info|package_manager=yarn|install=yarn install|build=yarn build|test=yarn test|lint=yarn lint"
        elif [ -f "package-lock.json" ]; then
            project_info="$project_info|package_manager=npm|install=npm install|build=npm run build|test=npm test|lint=npm run lint"
        else
            project_info="$project_info|package_manager=npm|install=npm install|build=npm run build|test=npm test|lint=npm run lint"
        fi
        
    # Python
    elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "Pipfile" ]; then
        project_info="language=python"
        
        if [ -f "pyproject.toml" ] && grep -q "poetry" pyproject.toml 2>/dev/null; then
            project_info="$project_info|package_manager=poetry|install=poetry install|build=poetry build|test=poetry run pytest|lint=poetry run flake8"
        elif [ -f "Pipfile" ]; then
            project_info="$project_info|package_manager=pipenv|install=pipenv install|build=pipenv run build|test=pipenv run pytest|lint=pipenv run flake8"
        else
            project_info="$project_info|package_manager=pip|install=pip install -r requirements.txt|build=python setup.py build|test=python -m pytest|lint=flake8"
        fi
        
    # Rust
    elif [ -f "Cargo.toml" ]; then
        project_info="language=rust|package_manager=cargo|install=cargo fetch|build=cargo build --release|test=cargo test|lint=cargo clippy && cargo fmt --check"
        
    # Go
    elif [ -f "go.mod" ]; then
        project_info="language=go|package_manager=go-modules|install=go mod download|build=go build ./...|test=go test ./...|lint=go vet ./... && gofmt -d ."
        
    # Java (Maven)
    elif [ -f "pom.xml" ]; then
        project_info="language=java|package_manager=maven|install=mvn dependency:resolve|build=mvn compile|test=mvn test|lint=mvn checkstyle:check"
        
    # Java/Kotlin (Gradle)
    elif [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then
        project_info="language=java|package_manager=gradle|install=./gradlew dependencies|build=./gradlew build|test=./gradlew test|lint=./gradlew checkstyleMain"
        
    # C# / .NET
    elif [ -f "*.csproj" ] || [ -f "*.sln" ] || [ -f "project.json" ]; then
        project_info="language=csharp|package_manager=dotnet|install=dotnet restore|build=dotnet build|test=dotnet test|lint=dotnet format --verify-no-changes"
        
    # Ruby
    elif [ -f "Gemfile" ] || [ -f "*.gemspec" ]; then
        project_info="language=ruby|package_manager=bundler|install=bundle install|build=bundle exec rake build|test=bundle exec rake test|lint=bundle exec rubocop"
        
    # PHP
    elif [ -f "composer.json" ]; then
        project_info="language=php|package_manager=composer|install=composer install|build=composer dump-autoload|test=./vendor/bin/phpunit|lint=./vendor/bin/phpcs"
        
    # C/C++ (CMake)
    elif [ -f "CMakeLists.txt" ]; then
        project_info="language=cpp|package_manager=cmake|install=cmake .|build=make|test=make test|lint=clang-format --dry-run --Werror **/*.cpp **/*.h"
        
    # Makefile-based projects
    elif [ -f "Makefile" ]; then
        project_info="language=make|package_manager=make|install=make deps|build=make|test=make test|lint=make lint"
        
    # Generic project
    else
        project_info="language=unknown|package_manager=none|install=echo 'No install command'|build=echo 'No build command'|test=echo 'No test command'|lint=echo 'No lint command'"
    fi
    
    echo "$project_info"
}

# Execute command safely
execute_command() {
    local command="$1"
    local project_path="$2"
    local project_name="$3"
    
    if [ "$command" = "echo 'No install command'" ] || [ "$command" = "echo 'No build command'" ] || [ "$command" = "echo 'No test command'" ] || [ "$command" = "echo 'No lint command'" ]; then
        warning "$project_name: $command"
        return 0
    fi
    
    log "Executing in $project_name: $command"
    
    cd "$project_path"
    if eval "$command"; then
        success "$project_name: Command succeeded"
        return 0
    else
        error "$project_name: Command failed"
        return 1
    fi
}

# Process repository
process_repository() {
    local repo_url="$1"
    local repo_name=$(basename "$repo_url" .git)
    local repo_path="$WORKSPACE_DIR/$repo_name"
    
    log "Processing repository: $repo_name"
    
    # Clone or update repository
    if [ -d "$repo_path" ]; then
        log "Updating $repo_name..."
        cd "$repo_path"
        git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || warning "Could not update $repo_name"
    else
        log "Cloning $repo_name..."
        git clone "$repo_url" "$repo_path" || {
            error "Failed to clone $repo_name"
            return 1
        }
    fi
    
    # Detect project type
    local project_info=$(detect_project_type "$repo_path")
    
    # Parse project info
    IFS='|' read -ra INFO_PARTS <<< "$project_info"
    declare -A project_data
    for part in "${INFO_PARTS[@]}"; do
        key=$(echo "$part" | cut -d'=' -f1)
        value=$(echo "$part" | cut -d'=' -f2-)
        project_data[$key]="$value"
    done
    
    log "$repo_name detected as: ${project_data[language]} with ${project_data[package_manager]}"
    
    # Execute commands
    local operation="$2"
    case "$operation" in
        "install")
            execute_command "${project_data[install]}" "$repo_path" "$repo_name"
            ;;
        "build")
            execute_command "${project_data[build]}" "$repo_path" "$repo_name"
            ;;
        "test")
            execute_command "${project_data[test]}" "$repo_path" "$repo_name"
            ;;
        "lint")
            execute_command "${project_data[lint]}" "$repo_path" "$repo_name"
            ;;
        "all")
            execute_command "${project_data[install]}" "$repo_path" "$repo_name" || return 1
            execute_command "${project_data[build]}" "$repo_path" "$repo_name" || return 1
            execute_command "${project_data[test]}" "$repo_path" "$repo_name" || true  # Tests can fail
            execute_command "${project_data[lint]}" "$repo_path" "$repo_name" || true  # Linting can fail
            ;;
        "analyze")
            echo "Repository: $repo_name"
            echo "  Language: ${project_data[language]}"
            echo "  Package Manager: ${project_data[package_manager]}"
            echo "  Install Command: ${project_data[install]}"
            echo "  Build Command: ${project_data[build]}"
            echo "  Test Command: ${project_data[test]}"
            echo "  Lint Command: ${project_data[lint]}"
            echo ""
            ;;
    esac
}

# Main function
main() {
    local operation="${1:-analyze}"
    local repositories=(
        "https://github.com/poisontr33s/poisontr33s"
        "https://github.com/poisontr33s/PsychoNoir-Kontrapunkt"
        "https://github.com/poisontr33s/Restructure-MCP-Orchestration"
    )
    
    log "Universal Project Automation - Operation: $operation"
    
    # Create workspace
    mkdir -p "$WORKSPACE_DIR"
    
    # Process each repository
    for repo_url in "${repositories[@]}"; do
        process_repository "$repo_url" "$operation" || {
            if [ "$operation" = "build" ] || [ "$operation" = "all" ]; then
                error "Critical failure in $(basename "$repo_url" .git), stopping."
                exit 1
            fi
        }
    done
    
    success "Universal automation completed for operation: $operation"
}

# Help function
show_help() {
    echo "Universal Project Automation System"
    echo "Language and ecosystem agnostic automation"
    echo ""
    echo "Usage: $0 [OPERATION]"
    echo ""
    echo "Operations:"
    echo "  analyze    - Analyze project types and commands (default)"
    echo "  install    - Install dependencies for all projects"
    echo "  build      - Build all projects"
    echo "  test       - Test all projects"
    echo "  lint       - Lint all projects"
    echo "  all        - Run install, build, test, and lint for all projects"
    echo ""
    echo "Supported Languages/Ecosystems:"
    echo "  - Node.js (npm, pnpm, yarn)"
    echo "  - Python (pip, poetry, pipenv)"
    echo "  - Rust (cargo)"
    echo "  - Go (go modules)"
    echo "  - Java (maven, gradle)"
    echo "  - C# / .NET (dotnet)"
    echo "  - Ruby (bundler)"
    echo "  - PHP (composer)"
    echo "  - C/C++ (cmake, make)"
    echo "  - Generic Makefile projects"
}

# CLI entry point
if [ "$#" -eq 0 ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

main "$@"