#!/bin/bash

# Enhanced Universal Cross-Repository Bridge System
# Comprehensive automation across multiple repositories with MCP protocol integration
# Based on ecosystem analysis of poisontr33s repositories

set -euo pipefail

# Configuration
REPOS=(
    "poisontr33s/poisontr33s"
    "poisontr33s/PsychoNoir-Kontrapunkt" 
    "poisontr33s/Restructure-MCP-Orchestration"
)

TEMP_DIR="/tmp/universal-bridge-$$"
LOG_FILE="$TEMP_DIR/bridge.log"
ANALYSIS_FILE="$TEMP_DIR/ecosystem-analysis.json"

# Enhanced language detection with ecosystem-specific patterns
detect_ecosystem() {
    local repo_path="$1"
    local ecosystem=()
    local package_managers=()
    local build_systems=()
    local frameworks=()
    
    # Node.js/JavaScript/TypeScript Ecosystem
    if [[ -f "$repo_path/package.json" ]]; then
        # Determine primary language
        if [[ -f "$repo_path/tsconfig.json" ]]; then
            ecosystem+=("typescript")
        else
            ecosystem+=("javascript")
        fi
        
        # Package manager detection
        if [[ -f "$repo_path/pnpm-lock.yaml" ]]; then
            package_managers+=("pnpm")
        elif [[ -f "$repo_path/package-lock.json" ]]; then
            package_managers+=("npm")
        elif [[ -f "$repo_path/yarn.lock" ]]; then
            package_managers+=("yarn")
        else
            package_managers+=("npm")
        fi
        
        # Framework/build system detection
        if [[ -f "$repo_path/turbo.json" ]]; then
            build_systems+=("turbo")
        fi
        
        if [[ -f "$repo_path/pnpm-workspace.yaml" ]]; then
            frameworks+=("monorepo")
        fi
        
        # Check for specific frameworks in package.json
        if command -v jq >/dev/null 2>&1; then
            local deps=$(jq -r '.dependencies // {} | keys[]' "$repo_path/package.json" 2>/dev/null || echo "")
            local devDeps=$(jq -r '.devDependencies // {} | keys[]' "$repo_path/package.json" 2>/dev/null || echo "")
            
            if echo "$deps $devDeps" | grep -q "tailwindcss"; then
                frameworks+=("tailwindcss")
            fi
            if echo "$deps $devDeps" | grep -q "jest"; then
                frameworks+=("jest")
            fi
            if echo "$deps $devDeps" | grep -q "vitest"; then
                frameworks+=("vitest")
            fi
        fi
    fi
    
    # Python Ecosystem
    if [[ -f "$repo_path/requirements.txt" ]] || [[ -f "$repo_path/pyproject.toml" ]] || [[ -f "$repo_path/setup.py" ]]; then
        ecosystem+=("python")
        
        if [[ -f "$repo_path/pyproject.toml" ]] && command -v poetry >/dev/null 2>&1; then
            package_managers+=("poetry")
        elif [[ -f "$repo_path/Pipfile" ]]; then
            package_managers+=("pipenv")
        else
            package_managers+=("pip")
        fi
        
        # Check for AI/ML frameworks
        if [[ -f "$repo_path/requirements.txt" ]]; then
            local reqs=$(cat "$repo_path/requirements.txt" 2>/dev/null || echo "")
            if echo "$reqs" | grep -q -E "(tensorflow|torch|pytorch|pandas|numpy|scikit-learn|nltk)"; then
                frameworks+=("ai-ml")
            fi
        fi
        
        # Check for specific Python files indicating AI/ML
        if find "$repo_path" -name "*.py" -exec grep -l -E "(neural|dialogue|analyzer|transmutator)" {} \; | head -1 >/dev/null 2>&1; then
            frameworks+=("neural-processing")
        fi
    fi
    
    # Ruby Ecosystem
    if [[ -f "$repo_path/Gemfile" ]] || find "$repo_path" -name "*.gemspec" | head -1 >/dev/null 2>&1; then
        ecosystem+=("ruby")
        package_managers+=("bundler")
        
        if [[ -d "$repo_path/arkiv_gamle_ruby_prosjekter" ]]; then
            frameworks+=("legacy-archive")
        fi
    fi
    
    # Go Ecosystem
    if [[ -f "$repo_path/go.mod" ]]; then
        ecosystem+=("go")
        package_managers+=("go-modules")
    fi
    
    # Rust Ecosystem
    if [[ -f "$repo_path/Cargo.toml" ]]; then
        ecosystem+=("rust")
        package_managers+=("cargo")
    fi
    
    # Docker Ecosystem
    if [[ -f "$repo_path/Dockerfile" ]] || [[ -f "$repo_path/docker-compose.yml" ]]; then
        ecosystem+=("docker")
        
        if [[ -f "$repo_path/docker-compose.yml" ]]; then
            build_systems+=("docker-compose")
        fi
    fi
    
    # MCP Protocol Detection
    if find "$repo_path" -name "*.py" -exec grep -l "mcp" {} \; | head -1 >/dev/null 2>&1 ||
       find "$repo_path" -name "*.js" -exec grep -l "mcp" {} \; | head -1 >/dev/null 2>&1 ||
       find "$repo_path" -name "*.ts" -exec grep -l "mcp" {} \; | head -1 >/dev/null 2>&1; then
        frameworks+=("mcp-protocol")
    fi
    
    # Large Dataset Detection
    if find "$repo_path" -name "*.csv" -size +10M | head -1 >/dev/null 2>&1 ||
       find "$repo_path" -name "*.db" -size +10M | head -1 >/dev/null 2>&1; then
        frameworks+=("big-data")
    fi
    
    # Generic Makefile
    if [[ -f "$repo_path/Makefile" ]]; then
        build_systems+=("make")
    fi
    
    # Output ecosystem analysis
    cat << EOF
{
  "languages": [$(printf '"%s",' "${ecosystem[@]}" | sed 's/,$//')],
  "package_managers": [$(printf '"%s",' "${package_managers[@]}" | sed 's/,$//')],
  "build_systems": [$(printf '"%s",' "${build_systems[@]}" | sed 's/,$//')],
  "frameworks": [$(printf '"%s",' "${frameworks[@]}" | sed 's/,$/')]
}
EOF
}

# Enhanced universal install with ecosystem awareness
universal_install() {
    local repo_path="$1"
    local ecosystem_json=$(detect_ecosystem "$repo_path")
    local languages=($(echo "$ecosystem_json" | jq -r '.languages[]' 2>/dev/null || echo ""))
    local package_managers=($(echo "$ecosystem_json" | jq -r '.package_managers[]' 2>/dev/null || echo ""))
    
    echo "Installing dependencies for ecosystem: languages=[${languages[*]}] package_managers=[${package_managers[*]}]"
    
    # Python ecosystem
    if [[ " ${languages[*]} " =~ " python " ]]; then
        if [[ " ${package_managers[*]} " =~ " poetry " ]]; then
            echo "Installing Python dependencies with poetry..."
            (cd "$repo_path" && poetry install --no-interaction)
        elif [[ " ${package_managers[*]} " =~ " pipenv " ]]; then
            echo "Installing Python dependencies with pipenv..."
            (cd "$repo_path" && pipenv install)
        elif [[ -f "$repo_path/requirements.txt" ]]; then
            echo "Installing Python dependencies with pip..."
            (cd "$repo_path" && pip install -r requirements.txt --user)
        fi
    fi
    
    # Node.js/TypeScript ecosystem
    if [[ " ${languages[*]} " =~ " typescript " ]] || [[ " ${languages[*]} " =~ " javascript " ]]; then
        if [[ " ${package_managers[*]} " =~ " pnpm " ]]; then
            echo "Installing Node.js dependencies with pnpm..."
            (cd "$repo_path" && pnpm install --frozen-lockfile)
        elif [[ " ${package_managers[*]} " =~ " yarn " ]]; then
            echo "Installing Node.js dependencies with yarn..."
            (cd "$repo_path" && yarn install --frozen-lockfile)
        else
            echo "Installing Node.js dependencies with npm..."
            (cd "$repo_path" && npm ci)
        fi
    fi
    
    # Ruby ecosystem
    if [[ " ${languages[*]} " =~ " ruby " ]]; then
        if [[ -f "$repo_path/Gemfile" ]]; then
            echo "Installing Ruby dependencies with bundler..."
            (cd "$repo_path" && bundle install)
        fi
    fi
    
    # Other ecosystems
    if [[ " ${languages[*]} " =~ " go " ]]; then
        echo "Installing Go dependencies..."
        (cd "$repo_path" && go mod download)
    fi
    
    if [[ " ${languages[*]} " =~ " rust " ]]; then
        echo "Installing Rust dependencies..."
        (cd "$repo_path" && cargo fetch)
    fi
}

# Enhanced universal build with advanced framework support
universal_build() {
    local repo_path="$1"
    local ecosystem_json=$(detect_ecosystem "$repo_path")
    local languages=($(echo "$ecosystem_json" | jq -r '.languages[]' 2>/dev/null || echo ""))
    local build_systems=($(echo "$ecosystem_json" | jq -r '.build_systems[]' 2>/dev/null || echo ""))
    local frameworks=($(echo "$ecosystem_json" | jq -r '.frameworks[]' 2>/dev/null || echo ""))
    
    echo "Building with ecosystem: languages=[${languages[*]}] build_systems=[${build_systems[*]}] frameworks=[${frameworks[*]}]"
    
    # Turbo monorepo build
    if [[ " ${build_systems[*]} " =~ " turbo " ]]; then
        echo "Building with Turbo (monorepo)..."
        local package_manager="npm"
        if [[ " ${ecosystem_json} " =~ " pnpm " ]]; then
            package_manager="pnpm"
        fi
        (cd "$repo_path" && $package_manager run build)
        return
    fi
    
    # Docker build
    if [[ " ${build_systems[*]} " =~ " docker-compose " ]]; then
        echo "Building with docker-compose..."
        (cd "$repo_path" && docker-compose build)
        return
    elif [[ " ${languages[*]} " =~ " docker " ]]; then
        echo "Building Docker image..."
        (cd "$repo_path" && docker build -t "$(basename "$repo_path"):latest" .)
        return
    fi
    
    # Language-specific builds
    if [[ " ${languages[*]} " =~ " typescript " ]] || [[ " ${languages[*]} " =~ " javascript " ]]; then
        if [[ -f "$repo_path/package.json" ]]; then
            local build_script=$(jq -r '.scripts.build // empty' "$repo_path/package.json" 2>/dev/null || echo "")
            if [[ -n "$build_script" ]]; then
                echo "Building Node.js project..."
                if command -v pnpm >/dev/null 2>&1 && [[ -f "$repo_path/pnpm-lock.yaml" ]]; then
                    (cd "$repo_path" && pnpm build)
                else
                    (cd "$repo_path" && npm run build)
                fi
            fi
        fi
    fi
    
    if [[ " ${languages[*]} " =~ " python " ]]; then
        if [[ " ${frameworks[*]} " =~ " ai-ml " ]] || [[ " ${frameworks[*]} " =~ " neural-processing " ]]; then
            echo "Building Python AI/ML project..."
            # For AI/ML projects, we typically don't "build" but prepare the environment
            if [[ -f "$repo_path/setup.py" ]]; then
                (cd "$repo_path" && python setup.py build)
            fi
        elif [[ -f "$repo_path/pyproject.toml" ]]; then
            echo "Building Python project with poetry..."
            (cd "$repo_path" && poetry build)
        fi
    fi
    
    if [[ " ${languages[*]} " =~ " go " ]]; then
        echo "Building Go project..."
        (cd "$repo_path" && go build ./...)
    fi
    
    if [[ " ${languages[*]} " =~ " rust " ]]; then
        echo "Building Rust project..."
        (cd "$repo_path" && cargo build --release)
    fi
    
    # Makefile fallback
    if [[ " ${build_systems[*]} " =~ " make " ]]; then
        echo "Building with make..."
        (cd "$repo_path" && make)
    fi
}

# Enhanced universal test with framework detection
universal_test() {
    local repo_path="$1"
    local ecosystem_json=$(detect_ecosystem "$repo_path")
    local languages=($(echo "$ecosystem_json" | jq -r '.languages[]' 2>/dev/null || echo ""))
    local frameworks=($(echo "$ecosystem_json" | jq -r '.frameworks[]' 2>/dev/null || echo ""))
    
    echo "Testing with ecosystem: languages=[${languages[*]}] frameworks=[${frameworks[*]}]"
    
    # Node.js/TypeScript testing
    if [[ " ${languages[*]} " =~ " typescript " ]] || [[ " ${languages[*]} " =~ " javascript " ]]; then
        if [[ -f "$repo_path/package.json" ]]; then
            local test_script=$(jq -r '.scripts.test // empty' "$repo_path/package.json" 2>/dev/null || echo "")
            if [[ -n "$test_script" ]]; then
                echo "Running Node.js tests..."
                if [[ " ${frameworks[*]} " =~ " jest " ]]; then
                    echo "Using Jest test framework"
                elif [[ " ${frameworks[*]} " =~ " vitest " ]]; then
                    echo "Using Vitest test framework"
                fi
                
                if command -v pnpm >/dev/null 2>&1 && [[ -f "$repo_path/pnpm-lock.yaml" ]]; then
                    (cd "$repo_path" && pnpm test)
                else
                    (cd "$repo_path" && npm test)
                fi
            fi
        fi
    fi
    
    # Python testing
    if [[ " ${languages[*]} " =~ " python " ]]; then
        if command -v pytest >/dev/null 2>&1; then
            echo "Testing Python project with pytest..."
            (cd "$repo_path" && pytest -v)
        elif command -v python >/dev/null 2>&1; then
            echo "Testing Python project with unittest..."
            (cd "$repo_path" && python -m unittest discover -v)
        fi
    fi
    
    # Other language tests
    if [[ " ${languages[*]} " =~ " go " ]]; then
        echo "Testing Go project..."
        (cd "$repo_path" && go test -v ./...)
    fi
    
    if [[ " ${languages[*]} " =~ " rust " ]]; then
        echo "Testing Rust project..."
        (cd "$repo_path" && cargo test)
    fi
    
    if [[ " ${languages[*]} " =~ " ruby " ]]; then
        if command -v rspec >/dev/null 2>&1; then
            echo "Testing Ruby project with RSpec..."
            (cd "$repo_path" && rspec)
        fi
    fi
}

# Enhanced universal lint with advanced detection
universal_lint() {
    local repo_path="$1"
    local ecosystem_json=$(detect_ecosystem "$repo_path")
    local languages=($(echo "$ecosystem_json" | jq -r '.languages[]' 2>/dev/null || echo ""))
    
    echo "Linting with ecosystem: languages=[${languages[*]}]"
    
    # TypeScript/JavaScript linting
    if [[ " ${languages[*]} " =~ " typescript " ]] || [[ " ${languages[*]} " =~ " javascript " ]]; then
        if [[ -f "$repo_path/.eslintrc.json" ]] || [[ -f "$repo_path/.eslintrc.js" ]] || [[ -f "$repo_path/eslint.config.js" ]]; then
            echo "Linting with ESLint..."
            if command -v pnpm >/dev/null 2>&1 && [[ -f "$repo_path/pnpm-lock.yaml" ]]; then
                (cd "$repo_path" && pnpm lint 2>/dev/null || pnpm eslint .)
            else
                (cd "$repo_path" && npm run lint 2>/dev/null || npx eslint .)
            fi
        fi
        
        if [[ -f "$repo_path/.prettierrc" ]] || [[ -f "$repo_path/prettier.config.js" ]]; then
            echo "Checking code formatting with Prettier..."
            if command -v pnpm >/dev/null 2>&1 && [[ -f "$repo_path/pnpm-lock.yaml" ]]; then
                (cd "$repo_path" && pnpm format:check 2>/dev/null || pnpm prettier --check .)
            else
                (cd "$repo_path" && npm run format:check 2>/dev/null || npx prettier --check .)
            fi
        fi
    fi
    
    # Python linting
    if [[ " ${languages[*]} " =~ " python " ]]; then
        if command -v flake8 >/dev/null 2>&1; then
            echo "Linting Python with flake8..."
            (cd "$repo_path" && flake8 . --max-line-length=88 --extend-ignore=E203,W503)
        fi
        
        if command -v black >/dev/null 2>&1; then
            echo "Checking Python formatting with black..."
            (cd "$repo_path" && black --check .)
        fi
        
        if command -v pylint >/dev/null 2>&1; then
            echo "Linting Python with pylint..."
            (cd "$repo_path" && pylint $(find . -name "*.py" | head -10))
        fi
    fi
    
    # Other language linting
    if [[ " ${languages[*]} " =~ " go " ]]; then
        echo "Linting Go project..."
        (cd "$repo_path" && go vet ./... && go fmt ./...)
    fi
    
    if [[ " ${languages[*]} " =~ " rust " ]]; then
        echo "Linting Rust project..."
        (cd "$repo_path" && cargo clippy -- -D warnings)
        (cd "$repo_path" && cargo fmt --check)
    fi
    
    if [[ " ${languages[*]} " =~ " ruby " ]]; then
        if command -v rubocop >/dev/null 2>&1; then
            echo "Linting Ruby with RuboCop..."
            (cd "$repo_path" && rubocop)
        fi
    fi
}

# MCP Protocol Integration
mcp_integration_check() {
    local repo_path="$1"
    local ecosystem_json=$(detect_ecosystem "$repo_path")
    local frameworks=($(echo "$ecosystem_json" | jq -r '.frameworks[]' 2>/dev/null || echo ""))
    
    if [[ " ${frameworks[*]} " =~ " mcp-protocol " ]]; then
        echo "🔗 MCP Protocol integration detected"
        
        # Check for server/client patterns
        if find "$repo_path" -name "*server*.py" | head -1 >/dev/null 2>&1; then
            echo "  └─ Python MCP server found"
        fi
        
        if find "$repo_path" -name "*client*.js" -o -name "*client*.ts" | head -1 >/dev/null 2>&1; then
            echo "  └─ JavaScript/TypeScript MCP client found"
        fi
        
        # Check for cross-language communication setup
        if [[ -f "$repo_path/package.json" ]] && [[ -f "$repo_path/requirements.txt" ]]; then
            echo "  └─ Cross-language MCP setup detected"
        fi
    fi
}

# Data Pipeline Integration
data_pipeline_check() {
    local repo_path="$1"
    local ecosystem_json=$(detect_ecosystem "$repo_path")
    local frameworks=($(echo "$ecosystem_json" | jq -r '.frameworks[]' 2>/dev/null || echo ""))
    
    if [[ " ${frameworks[*]} " =~ " big-data " ]]; then
        echo "📊 Large dataset processing detected"
        
        # Check for CSV files
        local csv_files=$(find "$repo_path" -name "*.csv" -size +1M | wc -l)
        if [[ $csv_files -gt 0 ]]; then
            echo "  └─ Found $csv_files large CSV files"
        fi
        
        # Check for database files
        local db_files=$(find "$repo_path" -name "*.db" -o -name "*.sqlite" | wc -l)
        if [[ $db_files -gt 0 ]]; then
            echo "  └─ Found $db_files database files"
        fi
    fi
    
    if [[ " ${frameworks[*]} " =~ " ai-ml " ]] || [[ " ${frameworks[*]} " =~ " neural-processing " ]]; then
        echo "🧠 AI/ML processing pipeline detected"
        
        # Check for specific AI/ML files
        if find "$repo_path" -name "*neural*" -o -name "*dialogue*" -o -name "*analyzer*" | head -1 >/dev/null 2>&1; then
            echo "  └─ Neural processing modules found"
        fi
    fi
}

# Enhanced cross-repository operations with ecosystem awareness
cross_repo_operation() {
    local operation="$1"
    shift
    local additional_args=("$@")
    
    mkdir -p "$TEMP_DIR"
    echo "🌉 Enhanced Universal Cross-Repository Bridge System" | tee "$LOG_FILE"
    echo "Operation: $operation" | tee -a "$LOG_FILE"
    echo "Timestamp: $(date)" | tee -a "$LOG_FILE"
    echo "================================================" | tee -a "$LOG_FILE"
    
    # Initialize analysis file
    echo "[]" > "$ANALYSIS_FILE"
    
    for repo in "${REPOS[@]}"; do
        echo "" | tee -a "$LOG_FILE"
        echo "🔍 Processing repository: $repo" | tee -a "$LOG_FILE"
        
        local repo_name=$(basename "$repo")
        local repo_path="$TEMP_DIR/$repo_name"
        
        # Clone or update repository
        if [[ ! -d "$repo_path" ]]; then
            echo "📥 Cloning $repo..." | tee -a "$LOG_FILE"
            if git clone "https://github.com/$repo.git" "$repo_path" 2>>"$LOG_FILE"; then
                echo "✅ Clone successful" | tee -a "$LOG_FILE"
            else
                echo "❌ Clone failed" | tee -a "$LOG_FILE"
                continue
            fi
        else
            echo "🔄 Updating $repo..." | tee -a "$LOG_FILE"
            if (cd "$repo_path" && git pull origin main) 2>>"$LOG_FILE"; then
                echo "✅ Update successful" | tee -a "$LOG_FILE"
            else
                echo "❌ Update failed" | tee -a "$LOG_FILE"
            fi
        fi
        
        # Execute operation
        case "$operation" in
            "analyze")
                echo "🔬 Analyzing $repo_name ecosystem:"
                local ecosystem_json=$(detect_ecosystem "$repo_path")
                echo "$ecosystem_json" | jq '.' 2>/dev/null || echo "$ecosystem_json"
                
                # Store analysis
                local current_analysis=$(cat "$ANALYSIS_FILE")
                echo "$current_analysis" | jq ". += [{\"repository\": \"$repo\", \"analysis\": $ecosystem_json}]" > "$ANALYSIS_FILE" 2>/dev/null || true
                
                # Additional checks
                mcp_integration_check "$repo_path"
                data_pipeline_check "$repo_path"
                ;;
            "install")
                echo "📦 Installing dependencies for $repo_name..."
                if universal_install "$repo_path"; then
                    echo "✅ Installation successful for $repo_name" | tee -a "$LOG_FILE"
                else
                    echo "❌ Installation failed for $repo_name" | tee -a "$LOG_FILE"
                fi
                ;;
            "build")
                echo "🔨 Building $repo_name..."
                if universal_build "$repo_path"; then
                    echo "✅ Build successful for $repo_name" | tee -a "$LOG_FILE"
                else
                    echo "❌ Build failed for $repo_name" | tee -a "$LOG_FILE"
                fi
                ;;
            "test")
                echo "🧪 Testing $repo_name..."
                if universal_test "$repo_path"; then
                    echo "✅ Tests passed for $repo_name" | tee -a "$LOG_FILE"
                else
                    echo "❌ Tests failed for $repo_name" | tee -a "$LOG_FILE"
                fi
                ;;
            "lint")
                echo "🔍 Linting $repo_name..."
                if universal_lint "$repo_path"; then
                    echo "✅ Linting passed for $repo_name" | tee -a "$LOG_FILE"
                else
                    echo "⚠️  Linting issues found in $repo_name" | tee -a "$LOG_FILE"
                fi
                ;;
            "status")
                echo "📊 Git status for $repo_name:"
                (cd "$repo_path" && git status --porcelain | head -20)
                echo "📈 Repository statistics:"
                echo "  Commits: $(cd "$repo_path" && git rev-list --count HEAD 2>/dev/null || echo "unknown")"
                echo "  Branches: $(cd "$repo_path" && git branch -r | wc -l 2>/dev/null || echo "unknown")"
                echo "  Size: $(du -sh "$repo_path" 2>/dev/null | cut -f1 || echo "unknown")"
                ;;
            "sync")
                echo "🔄 Synchronizing $repo_name..."
                # Custom sync logic can be added here
                (cd "$repo_path" && git fetch --all)
                echo "✅ Sync completed for $repo_name"
                ;;
        esac
        
        echo "✅ Completed $operation for $repo_name" | tee -a "$LOG_FILE"
        echo "─────────────────────────────────────────────────" | tee -a "$LOG_FILE"
    done
    
    # Summary
    echo "" | tee -a "$LOG_FILE"
    echo "📋 Operation Summary:" | tee -a "$LOG_FILE"
    echo "  Operation: $operation" | tee -a "$LOG_FILE"
    echo "  Repositories processed: ${#REPOS[@]}" | tee -a "$LOG_FILE"
    echo "  Log file: $LOG_FILE" | tee -a "$LOG_FILE"
    
    if [[ "$operation" == "analyze" ]]; then
        echo "  Analysis file: $ANALYSIS_FILE" | tee -a "$LOG_FILE"
        echo "" | tee -a "$LOG_FILE"
        echo "🎯 Ecosystem Overview:" | tee -a "$LOG_FILE"
        if command -v jq >/dev/null 2>&1; then
            jq -r '.[] | "  \(.repository): \(.analysis.languages | join(", "))"' "$ANALYSIS_FILE" 2>/dev/null | tee -a "$LOG_FILE" || true
        fi
    fi
}

# Cleanup function
cleanup() {
    if [[ -d "$TEMP_DIR" ]]; then
        echo "🧹 Cleaning up temporary files..."
        rm -rf "$TEMP_DIR"
    fi
}

trap cleanup EXIT

# Main execution
main() {
    local command="${1:-help}"
    shift || true
    
    echo "🌉 Enhanced Universal Cross-Repository Bridge System"
    echo "Based on comprehensive ecosystem analysis"
    echo ""
    
    case "$command" in
        "analyze")
            echo "🔬 Analyzing complete repository ecosystem..."
            cross_repo_operation "analyze" "$@"
            ;;
        "install")
            echo "📦 Installing dependencies across all ecosystems..."
            cross_repo_operation "install" "$@"
            ;;
        "build")
            echo "🔨 Building all projects with appropriate tools..."
            cross_repo_operation "build" "$@"
            ;;
        "test")
            echo "🧪 Running tests across all frameworks..."
            cross_repo_operation "test" "$@"
            ;;
        "lint")
            echo "🔍 Linting code across all languages..."
            cross_repo_operation "lint" "$@"
            ;;
        "status")
            echo "📊 Checking status across all repositories..."
            cross_repo_operation "status" "$@"
            ;;
        "sync")
            echo "🔄 Synchronizing all repositories..."
            cross_repo_operation "sync" "$@"
            ;;
        "all")
            echo "🚀 Running complete automation pipeline..."
            echo "This will analyze, install, build, test, and lint all repositories"
            cross_repo_operation "analyze" "$@"
            cross_repo_operation "install" "$@"
            cross_repo_operation "build" "$@"
            cross_repo_operation "test" "$@"
            cross_repo_operation "lint" "$@"
            ;;
        "help"|*)
            cat << 'EOF'
🌉 Enhanced Universal Cross-Repository Bridge System
===============================================

Based on comprehensive ecosystem analysis of:
- poisontr33s/poisontr33s (Python automation, landing page)
- poisontr33s/PsychoNoir-Kontrapunkt (Multi-language AI/ML, Ruby archives)
- poisontr33s/Restructure-MCP-Orchestration (TypeScript monorepo, TailwindCSS v4)

Usage: ./cross-repo-bridge.sh [command] [options]

Commands:
  🔬 analyze    - Deep ecosystem analysis with MCP/AI-ML detection
  📦 install    - Install dependencies (pip, pnpm, npm, bundler, etc.)
  🔨 build      - Build projects (Turbo, Docker, AI/ML, etc.)
  🧪 test       - Run tests (Jest, Vitest, pytest, RSpec, etc.)
  🔍 lint       - Lint code (ESLint, Prettier, flake8, RuboCop, etc.)
  📊 status     - Git status and repository statistics
  🔄 sync       - Synchronize all repositories
  🚀 all        - Complete automation pipeline
  ❓ help       - Show this help message

Features:
- Language detection: Python, TypeScript, JavaScript, Ruby, Go, Rust
- Package managers: pip, poetry, pnpm, npm, yarn, bundler, cargo
- Frameworks: MCP protocol, AI/ML, TailwindCSS v4, Jest, Docker
- Monorepo support: Turbo, pnpm workspaces
- Data pipeline: Large CSV/database processing
- Legacy support: Ruby archives, migration paths

The system automatically detects and handles the complexity of your
multi-language, multi-framework repository ecosystem.
EOF
            ;;
    esac
}

main "$@"