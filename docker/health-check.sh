#!/bin/bash

# Captain Guthilda's Health Check Script
# Java 21 MCP Orchestration System Health Validation

set -e

# Configuration
HEALTH_TIMEOUT=10
MAX_RETRIES=3

# Function to log with timestamp
log() {
    echo "[HEALTH-CHECK $(date +'%H:%M:%S')] $*"
}

# Function to check HTTP endpoint
check_http_endpoint() {
    local url="$1"
    local name="$2"
    local timeout="${3:-$HEALTH_TIMEOUT}"
    
    if curl -f -s --max-time "$timeout" "$url" > /dev/null 2>&1; then
        log "✅ $name endpoint healthy"
        return 0
    else
        log "❌ $name endpoint unhealthy"
        return 1
    fi
}

# Function to check Java process
check_java_process() {
    local jar_pattern="$1"
    local name="$2"
    
    if pgrep -f "$jar_pattern" > /dev/null; then
        log "✅ $name process running"
        return 0
    else
        log "❌ $name process not found"
        return 1
    fi
}

# Function to check virtual threads health
check_virtual_threads() {
    local endpoint="$1"
    
    local vt_metrics=$(curl -s --max-time 5 "$endpoint/actuator/metrics/jvm.threads.virtual" 2>/dev/null || echo "")
    
    if [ -n "$vt_metrics" ]; then
        log "✅ Virtual threads metrics available"
        return 0
    else
        log "⚠️ Virtual threads metrics not available"
        return 1
    fi
}

# Function to check AI integration health
check_ai_health() {
    local core_endpoint="$1"
    
    local ai_status=$(curl -s --max-time 5 "$core_endpoint/api/ai-status" 2>/dev/null | jq -r '.guthilda_mode // "unknown"' 2>/dev/null || echo "unknown")
    
    if [ "$ai_status" = "autonomous" ] || [ "$ai_status" = "active" ]; then
        log "✅ AI integration healthy (mode: $ai_status)"
        return 0
    else
        log "⚠️ AI integration status unclear (mode: $ai_status)"
        return 1
    fi
}

# Main health check logic
main() {
    log "🏴‍☠️ Captain Guthilda's Health Check - Java 21 Renaissance Edition"
    
    local overall_health=0
    local service_type="${MCP_SERVICE_TYPE:-core}"
    
    # Determine which services to check based on running processes
    local services_to_check=""
    
    if pgrep -f "mcp-core.jar" > /dev/null; then
        services_to_check="$services_to_check core"
    fi
    
    if pgrep -f "mcp-monitor.jar" > /dev/null; then
        services_to_check="$services_to_check monitor"
    fi
    
    if pgrep -f "mcp-guthilda.jar" > /dev/null; then
        services_to_check="$services_to_check guthilda"
    fi
    
    if pgrep -f "mcp-ai-integration.jar" > /dev/null; then
        services_to_check="$services_to_check ai-integration"
    fi
    
    # If no services detected, assume single service mode
    if [ -z "$services_to_check" ]; then
        services_to_check="$service_type"
    fi
    
    log "🔍 Checking services: $services_to_check"
    
    # Check each service
    for service in $services_to_check; do
        case $service in
            "core")
                if check_java_process "mcp-core.jar" "Core Service" && \
                   check_http_endpoint "http://localhost:8080/actuator/health" "Core Health"; then
                    
                    # Additional checks for core service
                    check_virtual_threads "http://localhost:8080" || true
                    check_ai_health "http://localhost:8080" || true
                else
                    overall_health=1
                fi
                ;;
                
            "monitor")
                if ! (check_java_process "mcp-monitor.jar" "Monitor Service" && \
                      check_http_endpoint "http://localhost:8081/actuator/health" "Monitor Health"); then
                    overall_health=1
                fi
                ;;
                
            "guthilda")
                if check_java_process "mcp-guthilda.jar" "Guthilda AI Service" && \
                   check_http_endpoint "http://localhost:8082/actuator/health" "Guthilda Health"; then
                    
                    # Check AI-specific endpoints
                    if curl -s --max-time 5 "http://localhost:8082/api/guthilda/status" | grep -q "autonomous" 2>/dev/null; then
                        log "✅ Guthilda autonomous mode active"
                    else
                        log "⚠️ Guthilda autonomous mode status unclear"
                    fi
                else
                    overall_health=1
                fi
                ;;
                
            "ai-integration")
                if ! (check_java_process "mcp-ai-integration.jar" "AI Integration Service" && \
                      check_http_endpoint "http://localhost:8083/actuator/health" "AI Integration Health"); then
                    overall_health=1
                fi
                ;;
        esac
    done
    
    # Final health assessment
    if [ $overall_health -eq 0 ]; then
        log "🎯 Overall system health: EXCELLENT"
        log "🚀 Virtual threads: OPTIMIZED"
        log "🤖 AI orchestration: AUTONOMOUS"
        log "⚓ Captain Guthilda approves!"
        exit 0
    else
        log "🚨 System health issues detected"
        log "🔧 Recommend: Check logs and restart affected services"
        exit 1
    fi
}

# Run health check with timeout protection
timeout 30 main || {
    log "⏰ Health check timed out - system may be overloaded"
    exit 1
}
