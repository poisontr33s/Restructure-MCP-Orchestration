#!/bin/bash

# Captain Guthilda's Docker Entrypoint Script
# Java 21 MCP Orchestration System Renaissance Edition

set -e

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# Function to wait for dependencies
wait_for_dependencies() {
    local service_name="$1"
    local dependencies="$2"
    
    log "🏴‍☠️ Captain Guthilda checking dependencies for $service_name..."
    
    for dep in $dependencies; do
        local host=$(echo $dep | cut -d: -f1)
        local port=$(echo $dep | cut -d: -f2)
        
        log "Waiting for $host:$port..."
        while ! nc -z "$host" "$port"; do
            sleep 2
        done
        log "✅ $host:$port is ready!"
    done
}

# Function to configure JVM for virtual threads
configure_jvm() {
    local service_type="$1"
    
    case $service_type in
        "core")
            export JAVA_OPTS="$JAVA_OPTS -Dspring.application.name=mcp-core"
            export JAVA_OPTS="$JAVA_OPTS -Dserver.port=8080"
            export JAVA_OPTS="$JAVA_OPTS -Dmcp.orchestration.virtual-threads.pool-size=1000"
            ;;
        "cli")
            export JAVA_OPTS="$JAVA_OPTS -Dspring.application.name=mcp-cli"
            export JAVA_OPTS="$JAVA_OPTS -Dmcp.cli.virtual-threads.enabled=true"
            ;;
        "monitor")
            export JAVA_OPTS="$JAVA_OPTS -Dspring.application.name=mcp-monitor"
            export JAVA_OPTS="$JAVA_OPTS -Dserver.port=8081"
            export JAVA_OPTS="$JAVA_OPTS -Dmcp.monitor.websocket.virtual-threads=true"
            ;;
        "guthilda")
            export JAVA_OPTS="$JAVA_OPTS -Dspring.application.name=mcp-guthilda"
            export JAVA_OPTS="$JAVA_OPTS -Dserver.port=8082"
            export JAVA_OPTS="$JAVA_OPTS -Dmcp.guthilda.ai.virtual-threads.pool-size=500"
            export JAVA_OPTS="$JAVA_OPTS -Dmcp.guthilda.autonomous-mode=true"
            ;;
        "ai-integration")
            export JAVA_OPTS="$JAVA_OPTS -Dspring.application.name=mcp-ai-integration"
            export JAVA_OPTS="$JAVA_OPTS -Dserver.port=8083"
            export JAVA_OPTS="$JAVA_OPTS -Dmcp.ai.ml.virtual-threads.enabled=true"
            ;;
    esac
    
    log "🚀 JVM configured for $service_type with virtual threads"
}

# Function to start service
start_service() {
    local service_type="$1"
    local jar_file=""
    local dependencies=""
    
    case $service_type in
        "core")
            jar_file="mcp-core.jar"
            dependencies=""
            ;;
        "cli")
            jar_file="mcp-cli.jar"
            dependencies="mcp-core:8080"
            ;;
        "monitor")
            jar_file="mcp-monitor.jar"
            dependencies="mcp-core:8080"
            ;;
        "guthilda")
            jar_file="mcp-guthilda.jar"
            dependencies="mcp-core:8080"
            ;;
        "ai-integration")
            jar_file="mcp-ai-integration.jar"
            dependencies="mcp-core:8080 mcp-guthilda:8082"
            ;;
        *)
            log "❌ Unknown service type: $service_type"
            exit 1
            ;;
    esac
    
    # Wait for dependencies if specified
    if [ -n "$dependencies" ]; then
        wait_for_dependencies "$service_type" "$dependencies"
    fi
    
    # Configure JVM for the service
    configure_jvm "$service_type"
    
    log "🏴‍☠️ Captain Guthilda starting $service_type service..."
    log "📦 JAR: $jar_file"
    log "⚙️ JAVA_OPTS: $JAVA_OPTS"
    
    # Start the service
    exec java $JAVA_OPTS -jar "$jar_file"
}

# Function to run all services (development mode)
start_all_services() {
    log "🏴‍☠️ Captain Guthilda starting complete MCP orchestration fleet!"
    
    # Start core service in background
    configure_jvm "core"
    java $JAVA_OPTS -jar mcp-core.jar &
    CORE_PID=$!
    
    # Wait for core to be ready
    sleep 10
    wait_for_dependencies "all-services" "localhost:8080"
    
    # Start Guthilda AI service in background
    configure_jvm "guthilda"
    java $JAVA_OPTS -jar mcp-guthilda.jar &
    GUTHILDA_PID=$!
    
    # Wait for Guthilda to be ready
    sleep 5
    wait_for_dependencies "all-services" "localhost:8082"
    
    # Start monitor service in background
    configure_jvm "monitor"
    java $JAVA_OPTS -jar mcp-monitor.jar &
    MONITOR_PID=$!
    
    # Start AI integration service in background
    configure_jvm "ai-integration"
    java $JAVA_OPTS -jar mcp-ai-integration.jar &
    AI_PID=$!
    
    log "🎯 All services started! PIDs: Core=$CORE_PID, Guthilda=$GUTHILDA_PID, Monitor=$MONITOR_PID, AI=$AI_PID"
    
    # Trap to handle shutdown gracefully
    trap 'log "🛑 Shutting down all services..."; kill $CORE_PID $GUTHILDA_PID $MONITOR_PID $AI_PID; wait' SIGTERM SIGINT
    
    # Wait for all background processes
    wait
}

# Main execution logic
SERVICE_TYPE="${1:-core}"

log "🏴‍☠️ Captain Guthilda's MCP Orchestration System - Java 21 Renaissance Edition"
log "🚀 Virtual Threads: ENABLED"
log "🤖 AI Integration: ACTIVE"
log "⚓ Service Type: $SERVICE_TYPE"

# Validate Java version
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 21 ]; then
    log "❌ Java 21 or higher required. Current version: $JAVA_VERSION"
    exit 1
fi

log "✅ Java $JAVA_VERSION detected - Virtual threads ready!"

# Create necessary directories
mkdir -p "$MCP_LOGS_PATH" "$MCP_DATA_PATH"

# Start the requested service
case $SERVICE_TYPE in
    "all")
        start_all_services
        ;;
    "core"|"cli"|"monitor"|"guthilda"|"ai-integration")
        start_service "$SERVICE_TYPE"
        ;;
    *)
        log "❌ Invalid service type: $SERVICE_TYPE"
        log "Valid options: core, cli, monitor, guthilda, ai-integration, all"
        exit 1
        ;;
esac
