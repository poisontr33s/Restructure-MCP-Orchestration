#!/bin/bash
# MCP v2 Repository-OS Management Script
# This script manages your repository as a complete operating system

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR" && pwd)"
ENV_FILE="$REPO_ROOT/.env.repo-os"
COMPOSE_FILE="$REPO_ROOT/docker-compose.repo-os.yml"

# Load environment variables
if [[ -f "$ENV_FILE" ]]; then
    source "$ENV_FILE"
fi

# Functions
print_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║               MCP v2 Repository-OS Manager                   ║"
    echo "║                                                              ║"
    echo "║  Transform your repository into a complete development OS    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    local all_good=true
    
    if ! command -v docker >/dev/null 2>&1; then
        print_status 1 "Docker is not installed"
        all_good=false
    else
        print_status 0 "Docker is installed ($(docker --version | cut -d' ' -f3 | cut -d',' -f1))"
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        print_status 1 "Docker Compose is not installed"
        all_good=false
    else
        print_status 0 "Docker Compose is installed ($(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1))"
    fi
    
    if [ "$all_good" = false ]; then
        print_warning "Please install Docker and Docker Compose before continuing"
        echo ""
        echo "Quick install (Windows 11):"
        echo "1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/"
        echo "2. Install with default settings"
        echo "3. Restart your system"
        echo "4. Run this script again"
        exit 1
    fi
}

# Initialize repository-OS
init_repo_os() {
    print_info "Initializing Repository-OS environment..."
    
    # Create necessary directories
    mkdir -p volumes/{postgres,redis,grafana,prometheus,registry}
    mkdir -p cache/{maven,npm,pip}
    mkdir -p logs/{app,system,monitoring}
    mkdir -p config/{postgres,redis,prometheus,grafana,nginx,caddy,rabbitmq,registry}
    
    # Copy environment file if it doesn't exist
    if [[ ! -f ".env" ]]; then
        cp "$ENV_FILE" .env
        print_status 0 "Created .env file from .env.repo-os"
    fi
    
    # Create basic configurations
    create_basic_configs
    
    print_status 0 "Repository-OS initialized"
}

# Create basic configuration files
create_basic_configs() {
    # Redis configuration
    cat > config/redis/redis.conf << 'EOF'
# Redis configuration for MCP v2 Repository-OS
bind 0.0.0.0
port 6379
protected-mode yes
tcp-backlog 511
timeout 0
tcp-keepalive 300
daemonize no
supervised no
pidfile /var/run/redis_6379.pid
loglevel notice
logfile ""
databases 16
always-show-logo yes
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir ./
maxmemory 256mb
maxmemory-policy allkeys-lru
EOF

    # Prometheus configuration
    cat > config/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'mcp-v2-services'
    static_configs:
      - targets: ['dev-env:3000', 'dev-env:8080', 'dev-env:8000']

  - job_name: 'infrastructure'
    static_configs:
      - targets: ['redis-repo-os:6379', 'postgres-repo-os:5432']
EOF

    # Caddy configuration (API Gateway)
    cat > config/caddy/Caddyfile << 'EOF'
{
    admin :8443
}

:80 {
    # Main development server
    handle /api/* {
        reverse_proxy dev-env:3000
    }
    
    # Java backend
    handle /java/* {
        reverse_proxy dev-env:8080
    }
    
    # Python API
    handle /python/* {
        reverse_proxy dev-env:8000
    }
    
    # Grafana
    handle /grafana/* {
        reverse_proxy grafana-repo-os:3000
    }
    
    # Prometheus
    handle /prometheus/* {
        reverse_proxy prometheus-repo-os:9090
    }
    
    # RabbitMQ Management
    handle /rabbitmq/* {
        reverse_proxy rabbitmq-repo-os:15672
    }
    
    # Container Registry
    handle /registry/* {
        reverse_proxy registry-repo-os:5000
    }
    
    # Default: serve static files or redirect to main app
    handle {
        reverse_proxy dev-env:3000
    }
}
EOF

    print_status 0 "Basic configurations created"
}

# Start the repository-OS
start_repo_os() {
    print_info "Starting Repository-OS..."
    
    # Build and start services
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build dev-env
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    print_status 0 "Repository-OS started"
    
    # Wait for services to be ready
    print_info "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    check_services
}

# Stop the repository-OS
stop_repo_os() {
    print_info "Stopping Repository-OS..."
    docker-compose -f "$COMPOSE_FILE" down
    print_status 0 "Repository-OS stopped"
}

# Restart the repository-OS
restart_repo_os() {
    print_info "Restarting Repository-OS..."
    stop_repo_os
    start_repo_os
}

# Check service health
check_services() {
    print_info "Checking service health..."
    
    local services=(
        "postgres-repo-os:5432:PostgreSQL"
        "redis-repo-os:6379:Redis"
        "prometheus-repo-os:9090:Prometheus"
        "grafana-repo-os:3000:Grafana"
        "rabbitmq-repo-os:15672:RabbitMQ"
        "registry-repo-os:5000:Registry"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r host port name <<< "$service"
        if timeout 5 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
            print_status 0 "$name is healthy"
        else
            print_status 1 "$name is not responding"
        fi
    done
}

# Enter the repository-OS development environment
enter_repo_os() {
    print_info "Entering Repository-OS development environment..."
    docker-compose -f "$COMPOSE_FILE" exec dev-env bash
}

# Show status
show_status() {
    print_info "Repository-OS Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    print_info "Available Services:"
    echo "  🔶 TypeScript Development: http://localhost:3000"
    echo "  ☕ Java Development: http://localhost:8080"
    echo "  🐍 Python Development: http://localhost:8000"
    echo "  📊 Grafana Dashboard: http://localhost:3001"
    echo "  📈 Prometheus Metrics: http://localhost:9090"
    echo "  🗄️ PostgreSQL Database: localhost:5432"
    echo "  🔄 Redis Cache: localhost:6379"
    echo "  📮 RabbitMQ Management: http://localhost:15672"
    echo "  📦 Container Registry: http://localhost:5000"
    echo "  🌐 API Gateway: http://localhost:80"
}

# Run validation
validate_repo_os() {
    print_info "Running MCP v2 validation in Repository-OS..."
    docker-compose -f "$COMPOSE_FILE" exec dev-env bash -c "cd /workspace && node validate-mcp-v2-implementations.js"
}

# Show logs
show_logs() {
    local service="${1:-}"
    if [[ -n "$service" ]]; then
        docker-compose -f "$COMPOSE_FILE" logs -f "$service"
    else
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Cleanup
cleanup_repo_os() {
    print_warning "This will remove all containers, volumes, and data. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_info "Cleaning up Repository-OS..."
        docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans
        docker system prune -f
        print_status 0 "Repository-OS cleaned up"
    else
        print_info "Cleanup cancelled"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo -e "${BLUE}Repository-OS Commands:${NC}"
    echo "  init     - Initialize Repository-OS environment"
    echo "  start    - Start Repository-OS"
    echo "  stop     - Stop Repository-OS"
    echo "  restart  - Restart Repository-OS"
    echo "  enter    - Enter development environment"
    echo "  status   - Show status and available services"
    echo "  validate - Run MCP v2 validation"
    echo "  logs     - Show logs (optionally specify service)"
    echo "  cleanup  - Remove all containers and data"
    echo "  help     - Show this menu"
    echo ""
}

# Main script logic
main() {
    print_banner
    
    case "${1:-help}" in
        "init")
            check_prerequisites
            init_repo_os
            ;;
        "start")
            check_prerequisites
            start_repo_os
            ;;
        "stop")
            stop_repo_os
            ;;
        "restart")
            restart_repo_os
            ;;
        "enter")
            enter_repo_os
            ;;
        "status")
            show_status
            ;;
        "validate")
            validate_repo_os
            ;;
        "logs")
            show_logs "${2:-}"
            ;;
        "cleanup")
            cleanup_repo_os
            ;;
        "help"|*)
            show_menu
            ;;
    esac
}

# Run main function with all arguments
main "$@"
