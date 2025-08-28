#!/bin/bash

# MCP v2 Infrastructure Health Check Script
# Checks all services and reports status

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR/.."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMEOUT=10
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -t|--timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [-v|--verbose] [-t|--timeout SECONDS] [-h|--help]"
      echo "  -v, --verbose    Enable verbose output"
      echo "  -t, --timeout    Set timeout for health checks (default: 10s)"
      echo "  -h, --help       Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🏥 MCP v2 Infrastructure Health Check${NC}"
echo "======================================"

# Function to check if a service is running
check_service_running() {
    local service_name=$1
    local container_name="mcp-v2-shared-infrastructure-${service_name}-1"
    
    if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
        return 0
    else
        return 1
    fi
}

# Function to check HTTP endpoint
check_http_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    printf "  %-20s " "$name:"
    
    if curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" | grep -q "$expected_code"; then
        echo -e "${GREEN}✓ Healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy${NC}"
        return 1
    fi
}

# Function to check TCP port
check_tcp_port() {
    local name=$1
    local host=$2
    local port=$3
    
    printf "  %-20s " "$name:"
    
    if timeout $TIMEOUT bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
        echo -e "${GREEN}✓ Reachable${NC}"
        return 0
    else
        echo -e "${RED}✗ Unreachable${NC}"
        return 1
    fi
}

# Function to check Docker service
check_docker_service() {
    local service_name=$1
    local display_name=${2:-$service_name}
    
    printf "  %-20s " "$display_name:"
    
    if check_service_running "$service_name"; then
        local health=$(docker inspect "mcp-v2-shared-infrastructure-${service_name}-1" --format='{{.State.Health.Status}}' 2>/dev/null || echo "no-healthcheck")
        
        case $health in
            "healthy")
                echo -e "${GREEN}✓ Healthy${NC}"
                return 0
                ;;
            "unhealthy")
                echo -e "${RED}✗ Unhealthy${NC}"
                if [[ $VERBOSE == true ]]; then
                    docker inspect "mcp-v2-shared-infrastructure-${service_name}-1" --format='{{range .State.Health.Log}}{{.Output}}{{end}}' | tail -3
                fi
                return 1
                ;;
            "starting")
                echo -e "${YELLOW}⚠ Starting${NC}"
                return 1
                ;;
            "no-healthcheck")
                echo -e "${GREEN}✓ Running${NC}"
                return 0
                ;;
            *)
                echo -e "${RED}✗ Unknown status: $health${NC}"
                return 1
                ;;
        esac
    else
        echo -e "${RED}✗ Not running${NC}"
        return 1
    fi
}

# Initialize counters
total_checks=0
failed_checks=0

# Check Docker services
echo -e "\n${BLUE}📦 Docker Services${NC}"
echo "-------------------"

services=("redis" "postgres" "rabbitmq" "nginx" "prometheus" "grafana" "jaeger")
for service in "${services[@]}"; do
    check_docker_service "$service"
    total_checks=$((total_checks + 1))
    if [[ $? -ne 0 ]]; then
        failed_checks=$((failed_checks + 1))
    fi
done

# Check HTTP endpoints
echo -e "\n${BLUE}🌐 HTTP Endpoints${NC}"
echo "------------------"

http_checks=(
    "API Gateway|http://localhost:3000/health"
    "Prometheus|http://localhost:9090/-/healthy"
    "Grafana|http://localhost:3001/api/health"
    "Jaeger|http://localhost:16686/"
    "RabbitMQ Mgmt|http://localhost:15672/"
)

for check in "${http_checks[@]}"; do
    IFS='|' read -r name url <<< "$check"
    check_http_endpoint "$name" "$url"
    total_checks=$((total_checks + 1))
    if [[ $? -ne 0 ]]; then
        failed_checks=$((failed_checks + 1))
    fi
done

# Check TCP ports
echo -e "\n${BLUE}🔌 TCP Connectivity${NC}"
echo "--------------------"

tcp_checks=(
    "Redis|localhost|6379"
    "PostgreSQL|localhost|5432"
    "RabbitMQ|localhost|5672"
)

for check in "${tcp_checks[@]}"; do
    IFS='|' read -r name host port <<< "$check"
    check_tcp_port "$name" "$host" "$port"
    total_checks=$((total_checks + 1))
    if [[ $? -ne 0 ]]; then
        failed_checks=$((failed_checks + 1))
    fi
done

# Check database connectivity
echo -e "\n${BLUE}🗄️  Database Connectivity${NC}"
echo "--------------------------"

# PostgreSQL connection test
printf "  %-20s " "PostgreSQL Query:"
if docker exec mcp-v2-shared-infrastructure-postgres-1 pg_isready -h localhost -p 5432 -U mcp_user &>/dev/null; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    failed_checks=$((failed_checks + 1))
fi
total_checks=$((total_checks + 1))

# Redis connection test
printf "  %-20s " "Redis Ping:"
if docker exec mcp-v2-shared-infrastructure-redis-1 redis-cli ping 2>/dev/null | grep -q PONG; then
    echo -e "${GREEN}✓ PONG${NC}"
else
    echo -e "${RED}✗ No response${NC}"
    failed_checks=$((failed_checks + 1))
fi
total_checks=$((total_checks + 1))

# RabbitMQ connection test
printf "  %-20s " "RabbitMQ Status:"
if docker exec mcp-v2-shared-infrastructure-rabbitmq-1 rabbitmqctl status &>/dev/null; then
    echo -e "${GREEN}✓ Operational${NC}"
else
    echo -e "${RED}✗ Not operational${NC}"
    failed_checks=$((failed_checks + 1))
fi
total_checks=$((total_checks + 1))

# Resource usage checks
if [[ $VERBOSE == true ]]; then
    echo -e "\n${BLUE}📊 Resource Usage${NC}"
    echo "------------------"
    
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep mcp-v2
fi

# Summary
echo -e "\n${BLUE}📋 Summary${NC}"
echo "----------"

if [[ $failed_checks -eq 0 ]]; then
    echo -e "${GREEN}✅ All $total_checks checks passed! Infrastructure is healthy.${NC}"
    exit 0
else
    echo -e "${RED}❌ $failed_checks of $total_checks checks failed.${NC}"
    echo -e "${YELLOW}💡 Run with -v flag for verbose output to debug issues.${NC}"
    exit 1
fi
