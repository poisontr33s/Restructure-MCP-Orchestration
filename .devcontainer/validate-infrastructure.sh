#!/bin/bash

# MCP v2 Infrastructure Validation Script
# This script validates the infrastructure configuration files

echo "🔍 MCP v2 Infrastructure Validation (Syntax Check)"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Check if we're in the right directory
if [ ! -f "../mcp-v2-shared-infrastructure/docker-compose.yml" ]; then
    echo -e "${RED}Error: Run this script from the .devcontainer directory${NC}"
    exit 1
fi

echo "1. Validating Docker Compose files..."

# Validate dev container docker-compose
if command -v docker-compose >/dev/null 2>&1; then
    docker-compose config >/dev/null 2>&1
    print_status $? "Dev container docker-compose.yml syntax"
else
    echo -e "${YELLOW}⚠${NC} Docker Compose not available - checking YAML syntax"
    
    # Basic YAML syntax check (if available)
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "import yaml; yaml.safe_load(open('docker-compose.yml'))" 2>/dev/null
        print_status $? "Dev container docker-compose.yml YAML syntax"
    else
        echo -e "${YELLOW}⚠${NC} Python not available for YAML validation"
    fi
fi

# Validate main infrastructure files
cd ../mcp-v2-shared-infrastructure

for file in docker-compose.yml docker-compose.dev.yml docker-compose.prod.yml; do
    if [ -f "$file" ]; then
        if command -v docker-compose >/dev/null 2>&1; then
            docker-compose -f "$file" config >/dev/null 2>&1
            print_status $? "$file syntax"
        elif command -v python3 >/dev/null 2>&1; then
            python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null
            print_status $? "$file YAML syntax"
        else
            echo -e "${YELLOW}⚠${NC} Cannot validate $file (no tools available)"
        fi
    else
        print_status 1 "$file exists"
    fi
done

echo ""
echo "2. Checking configuration files..."

# Check environment files
files_to_check=(
    ".env.example"
    "DEPLOYMENT_GUIDE.md"
    "README.md"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "$file exists"
    else
        print_status 1 "$file exists"
    fi
done

echo ""
echo "3. Checking scripts..."

script_files=(
    "scripts/health-check.sh"
    "scripts/backup.sh"
)

for script in "${script_files[@]}"; do
    if [ -f "$script" ]; then
        print_status 0 "$script exists"
        # Check if script is executable
        if [ -x "$script" ]; then
            print_status 0 "$script is executable"
        else
            print_status 1 "$script is executable"
        fi
    else
        print_status 1 "$script exists"
    fi
done

echo ""
echo "4. Development environment status..."

cd ..

# Check if we have client libraries built
clients=(
    "mcp-v2-typescript-client"
    "mcp-v2-java-client"
    "mcp-v2-python-client"
)

for client in "${clients[@]}"; do
    if [ -d "$client" ]; then
        print_status 0 "$client directory exists"
        
        # Check specific build artifacts
        case $client in
            "mcp-v2-typescript-client")
                if [ -d "$client/dist" ]; then
                    print_status 0 "$client built (dist/ exists)"
                else
                    print_status 1 "$client built (dist/ missing)"
                fi
                ;;
            "mcp-v2-java-client")
                if [ -d "$client/target" ]; then
                    print_status 0 "$client compiled (target/ exists)"
                else
                    print_status 1 "$client compiled (target/ missing)"
                fi
                ;;
            "mcp-v2-python-client")
                if [ -f "$client/pyproject.toml" ]; then
                    print_status 0 "$client configuration exists"
                else
                    print_status 1 "$client configuration missing"
                fi
                ;;
        esac
    else
        print_status 1 "$client directory exists"
    fi
done

echo ""
echo "=================================================="
echo -e "${GREEN}Infrastructure validation complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Install VS Code Dev Containers extension"
echo "2. Open this workspace in VS Code"
echo "3. Use 'Dev Containers: Reopen in Container' command"
echo "4. Everything will be automatically set up!"
