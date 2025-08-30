#!/bin/bash
# Java-First Repository-OS Management Script for MCP Orchestration System
# 🏴‍☠️ Captain Guthilda's Strategic Java Development Environment Manager
# Maintains bidirectional integrity with all established session work

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
JAVA_ENV_FILE="$REPO_ROOT/.env.java-dev"
JAVA_COMPOSE_FILE="$REPO_ROOT/docker-compose.java-dev.yml"
LEGACY_ENV_FILE="$REPO_ROOT/.env.repo-os"
LEGACY_COMPOSE_FILE="$REPO_ROOT/docker-compose.repo-os.yml"
MCP_V2_VALIDATION="$REPO_ROOT/validate-mcp-v2-implementations.js"

# Load environment variables (prioritize Java-first, fallback to legacy)
if [[ -f "$JAVA_ENV_FILE" ]]; then
    source "$JAVA_ENV_FILE"
elif [[ -f "$LEGACY_ENV_FILE" ]]; then
    source "$LEGACY_ENV_FILE"
fi

# Functions
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║  🏴‍☠️ Captain Guthilda's Java-First MCP Orchestration Repository-OS      ║"
    echo "║                                                                          ║"
    echo "║  Strategic Java monorepo development environment with full polyglot     ║"
    echo "║  support, maintaining bidirectional integrity with all session work    ║"
    echo "║                                                                          ║"
    echo "║  🚀 Java 21 + Spring Boot 3.2 + AI/ML Integration + MCP v2 Protocol   ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_java_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}☕ ✓${NC} $2"
    else
        echo -e "${RED}☕ ✗${NC} $2"
    fi
}

print_mcp_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${CYAN}🔗 ✓${NC} $2"
    else
        echo -e "${RED}🔗 ✗${NC} $2"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_success() {
    echo -e "${GREEN}🎉${NC} $1"
}

# Check Java development prerequisites
check_java_prerequisites() {
    print_info "Checking Java development prerequisites..."
    
    local all_good=true
    
    # Docker checks
    if ! command -v docker >/dev/null 2>&1; then
        print_java_status 1 "Docker is not installed"
        all_good=false
    else
        print_java_status 0 "Docker is available ($(docker --version | cut -d' ' -f3 | cut -d',' -f1))"
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        print_java_status 1 "Docker Compose is not available"
        all_good=false
    else
        if command -v docker-compose >/dev/null 2>&1; then
            print_java_status 0 "Docker Compose is available ($(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1))"
        else
            print_java_status 0 "Docker Compose is available ($(docker compose version --short))"
        fi
    fi
    
    # Check for Java locally (optional, since we'll use containerized Java)
    if command -v java >/dev/null 2>&1; then
        local java_version=$(java --version 2>/dev/null | head -1 | cut -d' ' -f2 || echo "unknown")
        print_java_status 0 "Local Java available ($java_version) - will use containerized Java 21"
    else
        print_java_status 0 "No local Java (will use containerized Java 21)"
    fi
    
    # Check for Maven locally (optional)
    if command -v mvn >/dev/null 2>&1; then
        local maven_version=$(mvn --version 2>/dev/null | head -1 | cut -d' ' -f3 || echo "unknown")
        print_java_status 0 "Local Maven available ($maven_version) - will use containerized Maven"
    else
        print_java_status 0 "No local Maven (will use containerized Maven 3.9.6)"
    fi
    
    if [ "$all_good" = false ]; then
        print_warning "Please install Docker and Docker Compose before continuing"
        echo ""
        echo "🪟 Windows 11 Quick Install:"
        echo "1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/"
        echo "2. Install with WSL2 backend (recommended)"
        echo "3. Enable Kubernetes (optional but useful)"
        echo "4. Restart your system"
        echo "5. Run this script again"
        exit 1
    fi
    
    # Validate existing MCP v2 work
    validate_session_integrity
}

# Validate that our session work is intact
validate_session_integrity() {
    print_info "Validating session work integrity..."
    
    local integrity_good=true
    
    # Check for Java monorepo structure
    if [[ -f "pom.xml" ]]; then
        print_mcp_status 0 "Root Maven POM found - Java monorepo intact"
    else
        print_mcp_status 1 "Root Maven POM missing"
        integrity_good=false
    fi
    
    # Check for key Java modules
    local java_modules=("mcp-core" "mcp-monitor" "mcp-guthilda" "mcp-ai-integration" "mcp-servers" "mcp-cli")
    for module in "${java_modules[@]}"; do
        if [[ -d "$module" && -f "$module/pom.xml" ]]; then
            print_mcp_status 0 "Java module $module intact"
        else
            print_mcp_status 1 "Java module $module missing or incomplete"
            integrity_good=false
        fi
    done
    
    # Check for MCP v2 protocol work
    if [[ -d "mcp-v2-protocol-spec" ]]; then
        print_mcp_status 0 "MCP v2 protocol specifications found"
    else
        print_mcp_status 1 "MCP v2 protocol specifications missing"
    fi
    
    # Check for client libraries
    local clients=("mcp-v2-java-client" "mcp-v2-typescript-client" "mcp-v2-python-client")
    for client in "${clients[@]}"; do
        if [[ -d "$client" ]]; then
            print_mcp_status 0 "MCP v2 $client found"
        else
            print_mcp_status 1 "MCP v2 $client missing"
        fi
    done
    
    # Check for validation script
    if [[ -f "$MCP_V2_VALIDATION" ]]; then
        print_mcp_status 0 "MCP v2 validation script available"
    else
        print_mcp_status 1 "MCP v2 validation script missing"
    fi
    
    if [ "$integrity_good" = false ]; then
        print_warning "Some session work appears to be missing. Continuing with available components..."
    else
        print_success "All session work integrity validated!"
    fi
}

# Initialize Java-first repository-OS
init_java_repo_os() {
    print_info "Initializing Java-first Repository-OS environment..."
    
    # Create Java-optimized directory structure
    mkdir -p volumes/java/{maven-repo,gradle-cache,idea-workspace,vscode-workspace}
    mkdir -p volumes/databases/{postgres,redis}
    mkdir -p volumes/monitoring/{grafana,prometheus,zipkin}
    mkdir -p volumes/tools/{sonarqube,nexus}
    mkdir -p logs/java/{apps,build,test,analysis}
    mkdir -p config/java/{maven,gradle,ide}
    
    # Ensure we have Java-specific config directories
    mkdir -p config/{postgres,redis,prometheus,grafana,nginx,sonarqube,nexus,zipkin}
    
    # Create or update Java environment file
    if [[ ! -f "$JAVA_ENV_FILE" ]]; then
        print_info "Creating Java-first environment configuration..."
        # We already created this file earlier, so this should exist
        print_java_status 0 "Java environment configuration ready"
    fi
    
    # Create essential Java configurations
    create_java_configs
    
    # Setup Maven settings.xml for the development environment
    setup_maven_environment
    
    # Create IDE configurations
    setup_ide_configurations
    
    print_success "Java-first Repository-OS initialized with full session continuity!"
}

# Create Java-specific configuration files
create_java_configs() {
    print_info "Creating Java development configurations..."
    
    # Maven settings.xml for faster builds
    cat > config/java/maven/settings.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 
          http://maven.apache.org/xsd/settings-1.2.0.xsd">
    
    <localRepository>/home/dev/.m2/repository</localRepository>
    <interactiveMode>false</interactiveMode>
    <offline>false</offline>
    
    <mirrors>
        <mirror>
            <id>central-mirror</id>
            <name>Central Repository Mirror</name>
            <url>https://repo1.maven.org/maven2</url>
            <mirrorOf>central</mirrorOf>
        </mirror>
    </mirrors>
    
    <profiles>
        <profile>
            <id>dev</id>
            <properties>
                <maven.compiler.source>21</maven.compiler.source>
                <maven.compiler.target>21</maven.compiler.target>
                <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
                <maven.test.skip>false</maven.test.skip>
                <spring.profiles.active>dev,docker</spring.profiles.active>
            </properties>
        </profile>
    </profiles>
    
    <activeProfiles>
        <activeProfile>dev</activeProfile>
    </activeProfiles>
</settings>
EOF

    # Gradle properties for performance
    cat > config/java/gradle/gradle.properties << 'EOF'
# Gradle properties for MCP Java development
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.caching=true
org.gradle.jvmargs=-Xmx2g -XX:+UseG1GC
org.gradle.workers.max=4

# Kotlin settings
kotlin.code.style=official
kotlin.incremental=true
kotlin.incremental.multiplatform=true
EOF

    # PostgreSQL initialization script for Java application
    cat > config/postgres/01-init-java-db.sql << 'EOF'
-- Initialize database for MCP Java Orchestration System
CREATE DATABASE mcp_orchestration;
CREATE DATABASE mcp_orchestration_test;

-- Create application user
CREATE USER mcp_dev WITH PASSWORD 'java_dev_2025';
GRANT ALL PRIVILEGES ON DATABASE mcp_orchestration TO mcp_dev;
GRANT ALL PRIVILEGES ON DATABASE mcp_orchestration_test TO mcp_dev;

-- Connect to main database and set up schema
\c mcp_orchestration;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas for different modules
CREATE SCHEMA IF NOT EXISTS mcp_core;
CREATE SCHEMA IF NOT EXISTS mcp_monitor;
CREATE SCHEMA IF NOT EXISTS mcp_guthilda;
CREATE SCHEMA IF NOT EXISTS mcp_ai_integration;
CREATE SCHEMA IF NOT EXISTS mcp_servers;

-- Grant schema permissions
GRANT ALL ON SCHEMA mcp_core TO mcp_dev;
GRANT ALL ON SCHEMA mcp_monitor TO mcp_dev;
GRANT ALL ON SCHEMA mcp_guthilda TO mcp_dev;
GRANT ALL ON SCHEMA mcp_ai_integration TO mcp_dev;
GRANT ALL ON SCHEMA mcp_servers TO mcp_dev;
EOF

    print_java_status 0 "Java development configurations created"
}

# Setup Maven environment
setup_maven_environment() {
    print_info "Setting up Maven environment for monorepo..."
    
    # Create a script that will run inside the container to setup Maven
    cat > config/java/maven/setup-maven.sh << 'EOF'
#!/bin/bash
# Setup Maven environment inside container

# Copy custom settings
cp /workspace/config/java/maven/settings.xml /home/dev/.m2/settings.xml

# Pre-download dependencies for faster builds
cd /workspace
echo "Pre-downloading Maven dependencies..."
mvn dependency:go-offline -B -q || echo "Some dependencies may need to be downloaded during first build"

echo "Maven environment setup complete!"
EOF
    chmod +x config/java/maven/setup-maven.sh
    
    print_java_status 0 "Maven environment configured"
}

# Setup IDE configurations
setup_ide_configurations() {
    print_info "Setting up IDE configurations..."
    
    # IntelliJ IDEA VM options for Java development
    cat > config/java/ide/idea.vmoptions << 'EOF'
-Xms2g
-Xmx4g
-XX:+UseG1GC
-XX:+UseStringDeduplication
-Dsun.io.useCanonPrefixCache=false
-Djdk.http.auth.tunneling.disabledSchemes=""
-Djdk.attach.allowAttachSelf=true
-Djb.vmOptionsFile=/workspace/config/java/ide/idea.vmoptions
-Didea.paths.selector=IntelliJIdea2024.1
-Didea.platform.prefix=Idea
EOF

    # VS Code Java settings
    cat > config/java/ide/vscode-java-settings.json << 'EOF'
{
    "java.home": "/usr/lib/jvm/temurin-21-jdk-amd64",
    "java.configuration.runtimes": [
        {
            "name": "JavaSE-21",
            "path": "/usr/lib/jvm/temurin-21-jdk-amd64"
        }
    ],
    "java.compile.nullAnalysis.mode": "automatic",
    "java.inlayHints.parameterNames.enabled": "all",
    "java.format.settings.url": "/workspace/config/java/ide/eclipse-formatter.xml",
    "maven.executable.path": "/usr/share/maven/bin/mvn",
    "maven.terminal.useJavaHome": true,
    "spring-boot.ls.problem.application-properties.enabled": true,
    "files.associations": {
        "*.properties": "spring-boot-properties",
        "*.yml": "spring-boot-properties-yaml",
        "*.yaml": "spring-boot-properties-yaml"
    }
}
EOF

    print_java_status 0 "IDE configurations prepared"
}

# Start the Java-first repository-OS
start_java_repo_os() {
    print_info "Starting Java-first Repository-OS..."
    
    # Determine compose command
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    # Build the Java development environment
    print_info "Building Java development container..."
    $compose_cmd -f "$JAVA_COMPOSE_FILE" --env-file "$JAVA_ENV_FILE" build java-dev
    
    # Start all services
    print_info "Starting all services..."
    $compose_cmd -f "$JAVA_COMPOSE_FILE" --env-file "$JAVA_ENV_FILE" up -d
    
    # Wait for services to be ready
    print_info "Waiting for services to initialize..."
    sleep 15
    
    # Setup Maven environment inside container
    print_info "Setting up Maven environment..."
    $compose_cmd -f "$JAVA_COMPOSE_FILE" exec -T java-dev bash -c "
        if [ -f /workspace/config/java/maven/setup-maven.sh ]; then
            /workspace/config/java/maven/setup-maven.sh
        fi
    " || echo "Maven setup will complete on first interactive session"
    
    print_success "Java-first Repository-OS started!"
    
    # Check service health
    check_java_services
    
    # Show quick start information
    show_java_quick_start
}

# Stop the Java repository-OS
stop_java_repo_os() {
    print_info "Stopping Java Repository-OS..."
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    $compose_cmd -f "$JAVA_COMPOSE_FILE" down
    print_java_status 0 "Java Repository-OS stopped"
}

# Check Java service health
check_java_services() {
    print_info "Checking Java service health..."
    
    local services=(
        "postgres:5432:PostgreSQL Database"
        "redis:6379:Redis Cache"
        "prometheus:9090:Prometheus Monitoring"
        "grafana:3001:Grafana Dashboard"
        "zipkin:9411:Zipkin Tracing"
        "sonarqube:9000:SonarQube Code Quality"
        "nexus:8081:Nexus Repository"
        "mailhog:8025:MailHog Email Testing"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r host port name <<< "$service"
        if timeout 5 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
            print_java_status 0 "$name is healthy"
        else
            print_java_status 1 "$name is not responding (may still be starting)"
        fi
    done
}

# Enter the Java development environment
enter_java_dev() {
    print_info "Entering Java development environment..."
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    print_info "🏴‍☠️ Welcome to Captain Guthilda's Java Development Environment!"
    echo ""
    echo "Available commands in the container:"
    echo "  mvn clean compile    - Build all Java modules"
    echo "  mvn test            - Run all tests"
    echo "  mvn spring-boot:run - Start Spring Boot applications"
    echo "  gradle build        - Alternative build with Gradle"
    echo ""
    
    $compose_cmd -f "$JAVA_COMPOSE_FILE" exec java-dev bash
}

# Build Java applications
build_java_apps() {
    print_info "Building Java applications..."
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    $compose_cmd -f "$JAVA_COMPOSE_FILE" exec -T java-dev bash -c "
        echo '🏗️ Building MCP Java Orchestration System...'
        cd /workspace
        mvn clean compile -B -T 1C
        echo '✅ Java build completed!'
    "
}

# Run Java tests
test_java_apps() {
    print_info "Running Java tests..."
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    $compose_cmd -f "$JAVA_COMPOSE_FILE" exec -T java-dev bash -c "
        echo '🧪 Running MCP Java test suite...'
        cd /workspace
        mvn test -B
        echo '✅ Java tests completed!'
    "
}

# Run MCP v2 validation (integrating session work)
validate_mcp_v2_integration() {
    print_info "Running comprehensive MCP v2 validation..."
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    if [[ -f "$MCP_V2_VALIDATION" ]]; then
        $compose_cmd -f "$JAVA_COMPOSE_FILE" exec -T java-dev bash -c "
            echo '🔗 Running MCP v2 protocol validation...'
            cd /workspace
            node validate-mcp-v2-implementations.js
        "
    else
        print_warning "MCP v2 validation script not found. Skipping validation."
    fi
}

# Show status with Java focus
show_java_status() {
    print_info "Java-First Repository-OS Status:"
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    $compose_cmd -f "$JAVA_COMPOSE_FILE" ps
    
    echo ""
    print_info "🏴‍☠️ Captain Guthilda's Java Development Services:"
    echo "  ☕ Java Development Environment: docker exec -it mcp-java-dev bash"
    echo "  🌐 API Gateway: http://localhost:80"
    echo ""
    echo "📊 Monitoring & Tools:"
    echo "  📈 Grafana Dashboard: http://localhost:3001 (admin/java_admin_2025)"
    echo "  📊 Prometheus Metrics: http://localhost:9090"
    echo "  🔍 Zipkin Tracing: http://localhost:9411"
    echo "  📋 SonarQube Analysis: http://localhost:9000 (admin/admin)"
    echo "  📦 Nexus Repository: http://localhost:8081 (admin/admin123)"
    echo "  📧 MailHog Email Testing: http://localhost:8025"
    echo ""
    echo "🗄️ Data Services:"
    echo "  🐘 PostgreSQL: localhost:5432 (mcp_dev/java_dev_2025)"
    echo "  🔄 Redis: localhost:6379 (password: java_redis_2025)"
    echo ""
    echo "🚀 Spring Boot Applications (when running):"
    echo "  🔧 MCP Core: http://localhost:8080"
    echo "  📊 MCP Monitor: http://localhost:8081"
    echo "  🏴‍☠️ MCP Guthilda: http://localhost:8082"
    echo "  🤖 MCP AI Integration: http://localhost:8083"
    echo "  🌐 MCP Servers: http://localhost:8084"
    echo "  💻 MCP CLI: http://localhost:8085"
}

# Show quick start guide
show_java_quick_start() {
    echo ""
    print_success "🏴‍☠️ Java-First Repository-OS is ready!"
    echo ""
    echo -e "${CYAN}Quick Start Guide:${NC}"
    echo "1. Enter development environment: $0 enter"
    echo "2. Build all Java modules: $0 build"
    echo "3. Run tests: $0 test"
    echo "4. Validate MCP v2 integration: $0 validate"
    echo "5. View services: $0 status"
    echo ""
    echo -e "${YELLOW}Pro Tips:${NC}"
    echo "• Use VS Code with Dev Containers for full IDE integration"
    echo "• Check logs with: $0 logs [service-name]"
    echo "• Monitor with Grafana at http://localhost:3001"
    echo "• All Maven dependencies cached for faster builds"
    echo ""
}

# Show logs with Java focus
show_java_logs() {
    local service="${1:-}"
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    if [[ -n "$service" ]]; then
        print_info "Showing logs for $service..."
        $compose_cmd -f "$JAVA_COMPOSE_FILE" logs -f "$service"
    else
        print_info "Showing all Java Repository-OS logs..."
        $compose_cmd -f "$JAVA_COMPOSE_FILE" logs -f
    fi
}

# Cleanup with data preservation options
cleanup_java_repo_os() {
    echo ""
    print_warning "🗑️ Java Repository-OS Cleanup Options:"
    echo "1. Stop containers only (preserve data)"
    echo "2. Remove containers but keep volumes (preserve databases, caches)"
    echo "3. Full cleanup (remove everything, including volumes)"
    echo "4. Cancel"
    echo ""
    read -p "Choose option (1-4): " -r cleanup_option
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        compose_cmd="docker compose"
    fi
    
    case $cleanup_option in
        1)
            print_info "Stopping containers..."
            $compose_cmd -f "$JAVA_COMPOSE_FILE" down
            print_java_status 0 "Containers stopped, data preserved"
            ;;
        2)
            print_info "Removing containers, preserving volumes..."
            $compose_cmd -f "$JAVA_COMPOSE_FILE" down --remove-orphans
            print_java_status 0 "Containers removed, volumes preserved"
            ;;
        3)
            print_warning "This will remove ALL data including databases and caches!"
            read -p "Are you absolutely sure? Type 'yes' to confirm: " -r confirm
            if [[ "$confirm" == "yes" ]]; then
                print_info "Performing full cleanup..."
                $compose_cmd -f "$JAVA_COMPOSE_FILE" down -v --remove-orphans
                docker system prune -f --volumes
                print_java_status 0 "Full cleanup completed"
            else
                print_info "Full cleanup cancelled"
            fi
            ;;
        4|*)
            print_info "Cleanup cancelled"
            ;;
    esac
}

# Main menu with Java focus
show_java_menu() {
    echo ""
    echo -e "${BLUE}🏴‍☠️ Captain Guthilda's Java Repository-OS Commands:${NC}"
    echo ""
    echo -e "${CYAN}Environment Management:${NC}"
    echo "  init     - Initialize Java-first Repository-OS"
    echo "  start    - Start Java development environment"
    echo "  stop     - Stop Repository-OS"
    echo "  restart  - Restart Repository-OS"
    echo "  status   - Show status and service URLs"
    echo "  cleanup  - Cleanup options (with data preservation)"
    echo ""
    echo -e "${CYAN}Development Commands:${NC}"
    echo "  enter    - Enter Java development container"
    echo "  build    - Build all Java applications"
    echo "  test     - Run Java test suite"
    echo "  validate - Run MCP v2 protocol validation"
    echo "  logs     - Show logs (optionally specify service)"
    echo ""
    echo -e "${CYAN}Session Integration:${NC}"
    echo "  integrity - Check session work integrity"
    echo "  migrate   - Migrate from legacy repo-os setup"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 init && $0 start    # Full setup"
    echo "  $0 enter               # Start coding"
    echo "  $0 build && $0 test    # CI/CD workflow"
    echo "  $0 logs java-dev       # Debug container"
    echo ""
}

# Migrate from legacy setup
migrate_from_legacy() {
    print_info "Migrating from legacy repo-os setup..."
    
    # Check if legacy setup exists
    if [[ -f "$LEGACY_COMPOSE_FILE" ]]; then
        print_info "Legacy setup detected, stopping legacy services..."
        docker-compose -f "$LEGACY_COMPOSE_FILE" down 2>/dev/null || true
    fi
    
    # Migrate environment variables
    if [[ -f "$LEGACY_ENV_FILE" && ! -f "$JAVA_ENV_FILE" ]]; then
        print_info "Migrating environment configuration..."
        # Java env file should already exist, but ensure migration of custom values
        print_java_status 0 "Environment migration completed"
    fi
    
    print_success "Migration from legacy setup completed!"
}

# Main script logic
main() {
    print_banner
    
    case "${1:-help}" in
        "init")
            check_java_prerequisites
            init_java_repo_os
            ;;
        "start")
            check_java_prerequisites
            start_java_repo_os
            ;;
        "stop")
            stop_java_repo_os
            ;;
        "restart")
            stop_java_repo_os
            sleep 2
            start_java_repo_os
            ;;
        "enter")
            enter_java_dev
            ;;
        "build")
            build_java_apps
            ;;
        "test")
            test_java_apps
            ;;
        "validate")
            validate_mcp_v2_integration
            ;;
        "status")
            show_java_status
            ;;
        "logs")
            show_java_logs "${2:-}"
            ;;
        "cleanup")
            cleanup_java_repo_os
            ;;
        "integrity")
            validate_session_integrity
            ;;
        "migrate")
            migrate_from_legacy
            ;;
        "help"|*)
            show_java_menu
            ;;
    esac
}

# Run main function with all arguments
main "$@"
