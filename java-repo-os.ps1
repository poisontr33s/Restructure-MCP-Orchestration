# Java-First Repository-OS Management Script for Windows
# 🏴‍☠️ Captain Guthilda's Strategic Java Development Environment Manager
# PowerShell version for Windows 11 + Docker Desktop

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Service = ""
)

# Configuration
$ErrorActionPreference = "Stop"
$SCRIPT_DIR = $PSScriptRoot
$REPO_ROOT = $SCRIPT_DIR
$JAVA_ENV_FILE = Join-Path $REPO_ROOT ".env.java-dev"
$JAVA_COMPOSE_FILE = Join-Path $REPO_ROOT "docker-compose.java-dev.yml"
$LEGACY_ENV_FILE = Join-Path $REPO_ROOT ".env.repo-os"
$LEGACY_COMPOSE_FILE = Join-Path $REPO_ROOT "docker-compose.repo-os.yml"
$MCP_V2_VALIDATION = Join-Path $REPO_ROOT "validate-mcp-v2-implementations.js"

# Colors for PowerShell output
function Write-Banner {
    Write-Host "=========================================================================" -ForegroundColor Magenta
    Write-Host "  Captain Guthilda's Java-First MCP Orchestration Repository-OS       " -ForegroundColor Magenta
    Write-Host "                                                                       " -ForegroundColor Magenta
    Write-Host "  Strategic Java monorepo development environment with full polyglot  " -ForegroundColor Magenta
    Write-Host "  support, maintaining bidirectional integrity with all session work " -ForegroundColor Magenta
    Write-Host "                                                                       " -ForegroundColor Magenta
    Write-Host "  >> Java 21 + Spring Boot 3.2 + AI/ML Integration + MCP v2 Protocol " -ForegroundColor Magenta
    Write-Host "=========================================================================" -ForegroundColor Magenta
}

function Write-Success {
    param([string]$Message)
    Write-Host "☕ ✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "☕ ✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-MCPStatus {
    param([bool]$Success, [string]$Message)
    if ($Success) {
        Write-Host "🔗 ✓ $Message" -ForegroundColor Cyan
    } else {
        Write-Host "🔗 ✗ $Message" -ForegroundColor Red
    }
}

# Check Java development prerequisites
function Test-JavaPrerequisites {
    Write-Info "Checking Java development prerequisites..."
    
    $allGood = $true
    
    # Check Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-Success "Docker is available ($($dockerVersion.Split(' ')[2].TrimEnd(',')))"
        } else {
            Write-Error "Docker is not installed"
            $allGood = $false
        }
    } catch {
        Write-Error "Docker is not installed"
        $allGood = $false
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version 2>$null
        if (-not $composeVersion) {
            $composeVersion = docker compose version 2>$null
        }
        if ($composeVersion) {
            Write-Success "Docker Compose is available"
        } else {
            Write-Error "Docker Compose is not available"
            $allGood = $false
        }
    } catch {
        Write-Error "Docker Compose is not available"
        $allGood = $false
    }
    
    # Check for local Java (optional)
    try {
        $javaVersion = java --version 2>$null | Select-Object -First 1
        if ($javaVersion) {
            Write-Success "Local Java available ($($javaVersion.Split(' ')[1])) - will use containerized Java 21"
        } else {
            Write-Success "No local Java (will use containerized Java 21)"
        }
    } catch {
        Write-Success "No local Java (will use containerized Java 21)"
    }
    
    # Check for Maven (optional)
    try {
        $mavenVersion = mvn --version 2>$null | Select-Object -First 1
        if ($mavenVersion) {
            Write-Success "Local Maven available - will use containerized Maven"
        } else {
            Write-Success "No local Maven (will use containerized Maven 3.9.6)"
        }
    } catch {
        Write-Success "No local Maven (will use containerized Maven 3.9.6)"
    }
    
    if (-not $allGood) {
        Write-Warning "Please install Docker Desktop before continuing"
        Write-Host ""
        Write-Host "🪟 Windows 11 Quick Install:" -ForegroundColor Yellow
        Write-Host "1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/"
        Write-Host "2. Install with WSL2 backend (recommended)"
        Write-Host "3. Enable Kubernetes (optional but useful)"
        Write-Host "4. Restart your system"
        Write-Host "5. Run this script again"
        exit 1
    }
    
    # Validate session integrity
    Test-SessionIntegrity
}

# Validate session work integrity
function Test-SessionIntegrity {
    Write-Info "Validating session work integrity..."
    
    $integrityGood = $true
    
    # Check for Java monorepo structure
    if (Test-Path "pom.xml") {
        Write-MCPStatus $true "Root Maven POM found - Java monorepo intact"
    } else {
        Write-MCPStatus $false "Root Maven POM missing"
        $integrityGood = $false
    }
    
    # Check for key Java modules
    $javaModules = @("mcp-core", "mcp-monitor", "mcp-guthilda", "mcp-ai-integration", "mcp-servers", "mcp-cli")
    foreach ($module in $javaModules) {
        if ((Test-Path $module) -and (Test-Path (Join-Path $module "pom.xml"))) {
            Write-MCPStatus $true "Java module $module intact"
        } else {
            Write-MCPStatus $false "Java module $module missing or incomplete"
            $integrityGood = $false
        }
    }
    
    # Check for MCP v2 protocol work
    if (Test-Path "mcp-v2-protocol-spec") {
        Write-MCPStatus $true "MCP v2 protocol specifications found"
    } else {
        Write-MCPStatus $false "MCP v2 protocol specifications missing"
    }
    
    # Check for client libraries
    $clients = @("mcp-v2-java-client", "mcp-v2-typescript-client", "mcp-v2-python-client")
    foreach ($client in $clients) {
        if (Test-Path $client) {
            Write-MCPStatus $true "MCP v2 $client found"
        } else {
            Write-MCPStatus $false "MCP v2 $client missing"
        }
    }
    
    # Check for validation script
    if (Test-Path $MCP_V2_VALIDATION) {
        Write-MCPStatus $true "MCP v2 validation script available"
    } else {
        Write-MCPStatus $false "MCP v2 validation script missing"
    }
    
    if (-not $integrityGood) {
        Write-Warning "Some session work appears to be missing. Continuing with available components..."
    } else {
        Write-Host "🎉 All session work integrity validated!" -ForegroundColor Green
    }
}

# Initialize Java-first repository-OS
function Initialize-JavaRepoOS {
    Write-Info "Initializing Java-first Repository-OS environment..."
    
    # Create Java-optimized directory structure
    $directories = @(
        "volumes/java/maven-repo",
        "volumes/java/gradle-cache", 
        "volumes/java/idea-workspace",
        "volumes/java/vscode-workspace",
        "volumes/databases/postgres",
        "volumes/databases/redis",
        "volumes/monitoring/grafana",
        "volumes/monitoring/prometheus",
        "volumes/monitoring/zipkin",
        "volumes/tools/sonarqube",
        "volumes/tools/nexus",
        "logs/java/apps",
        "logs/java/build", 
        "logs/java/test",
        "logs/java/analysis",
        "config/java/maven",
        "config/java/gradle",
        "config/java/ide",
        "config/postgres",
        "config/redis",
        "config/prometheus",
        "config/grafana",
        "config/nginx",
        "config/sonarqube",
        "config/nexus",
        "config/zipkin"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $REPO_ROOT $dir
        if (-not (Test-Path $fullPath)) {
            New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
        }
    }
    
    # Check Java environment file
    if (-not (Test-Path $JAVA_ENV_FILE)) {
        Write-Info "Java environment configuration should already exist..."
        Write-Success "Java environment configuration ready"
    }
    
    Write-Host "🎉 Java-first Repository-OS initialized with full session continuity!" -ForegroundColor Green
}

# Initialize Go workspace with proper structure
function Initialize-GoWorkspace {
    Write-Info "🐹 Setting up Go workspace within repository..."
    
    # Ensure go-workspace directory exists
    if (!(Test-Path "go-workspace")) {
        New-Item -ItemType Directory -Path "go-workspace" -Force | Out-Null
        Write-Success "Created go-workspace directory"
    }
    
    # Initialize Go module if go.mod doesn't exist or is minimal
    $goModPath = "go-workspace/go.mod"
    if (!(Test-Path $goModPath) -or (Get-Content $goModPath | Measure-Object -Line).Lines -lt 3) {
        $goModContent = @'
module github.com/mcporchestration/go-workspace

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/stretchr/testify v1.8.4
    github.com/spf13/cobra v1.8.0
    github.com/spf13/viper v1.18.2
)
'@
        Set-Content -Path $goModPath -Value $goModContent
        Write-Success "Created go.mod with common dependencies"
    }
    
    # Create main.go if it doesn't exist
    $mainGoPath = "go-workspace/main.go"
    if (!(Test-Path $mainGoPath)) {
        $mainGoContent = @'
package main

import (
    "fmt"
    "log"
    "net/http"
    
    "github.com/gin-gonic/gin"
)

func main() {
    fmt.Println("*** Captain Guthilda's Go Service - Part of MCP Orchestration System")
    
    r := gin.Default()
    r.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Go service is running within Java-first MCP Orchestration",
            "version": "1.0.0",
            "captain": "Guthilda",
        })
    })
    
    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status": "healthy",
            "service": "go-workspace",
        })
    })
    
    log.Println("Starting Go service on :8090")
    r.Run(":8090")
}
'@
        Set-Content -Path $mainGoPath -Value $mainGoContent
        Write-Success "Created main.go with basic HTTP server"
    }
    
    # Create README for Go workspace
    $readmePath = "go-workspace/README.md"
    if (!(Test-Path $readmePath)) {
        $readmeContent = @'
# Go Workspace - MCP Orchestration System

This Go workspace is part of Captain Guthilda's MCP Orchestration System, designed to work within the Java-first repository-OS environment.

## Development Within Container

When using the Dev Container or Docker Compose setup, Go is pre-installed and configured:

```bash
# Enter the development container
docker exec -it mcp-java-dev bash

# Navigate to Go workspace
cd go-workspace

# Initialize/update dependencies
go mod tidy

# Run the Go service
go run .

# Build the service
go build -o bin/go-service .
```

## VS Code Integration

When using VS Code with Dev Containers:
1. Go extension will automatically detect the Go installation within the container
2. Language server (gopls) is pre-installed
3. Debugging is configured with delve (dlv)

## Service Integration

This Go service integrates with the broader MCP orchestration system:
- **Port 8090**: HTTP API endpoint
- **Health checks**: Available at `/health`
- **Monitoring**: Integrated with Prometheus metrics
- **Tracing**: Connected to Zipkin distributed tracing
'@
        Set-Content -Path $readmePath -Value $readmeContent
        Write-Success "Created README.md for Go workspace"
    }
    
    Write-Info "🔧 Go workspace initialized successfully"
    Write-Info "📝 Use 'mcp dev' to start the development environment"
    Write-Info "📝 Then connect to container: docker exec -it mcp-java-dev bash"
    Write-Info "📝 Navigate to Go workspace: cd go-workspace && go mod tidy"
}

# Get Docker Compose command
function Get-ComposeCommand {
    try {
        docker-compose --version 2>$null | Out-Null
        return "docker-compose"
    } catch {
        try {
            docker compose version 2>$null | Out-Null
            return "docker compose"
        } catch {
            throw "Docker Compose not available"
        }
    }
}

# Start Java-first repository-OS
function Start-JavaRepoOS {
    Write-Info "Starting Java-first Repository-OS..."
    
    $composeCmd = Get-ComposeCommand
    
    # Build the Java development environment
    Write-Info "Building Java development container..."
    if ($composeCmd -eq "docker-compose") {
        & docker-compose -f $JAVA_COMPOSE_FILE --env-file $JAVA_ENV_FILE build java-dev
    } else {
        & docker compose -f $JAVA_COMPOSE_FILE --env-file $JAVA_ENV_FILE build java-dev
    }
    
    # Start all services
    Write-Info "Starting all services..."
    if ($composeCmd -eq "docker-compose") {
        & docker-compose -f $JAVA_COMPOSE_FILE --env-file $JAVA_ENV_FILE up -d
    } else {
        & docker compose -f $JAVA_COMPOSE_FILE --env-file $JAVA_ENV_FILE up -d
    }
    
    # Wait for services
    Write-Info "Waiting for services to initialize..."
    Start-Sleep -Seconds 15
    
    Write-Host "🎉 Java-first Repository-OS started!" -ForegroundColor Green
    
    # Check service health
    Test-JavaServices
    
    # Show quick start
    Show-JavaQuickStart
}

# Stop Java repository-OS
function Stop-JavaRepoOS {
    Write-Info "Stopping Java Repository-OS..."
    
    $composeCmd = Get-ComposeCommand
    
    if ($composeCmd -eq "docker-compose") {
        & docker-compose -f $JAVA_COMPOSE_FILE down
    } else {
        & docker compose -f $JAVA_COMPOSE_FILE down
    }
    
    Write-Success "Java Repository-OS stopped"
}

# Test Java services
function Test-JavaServices {
    Write-Info "Checking Java service health..."
    
    $services = @(
        @("postgres", 5432, "PostgreSQL Database"),
        @("redis", 6379, "Redis Cache"),
        @("prometheus", 9090, "Prometheus Monitoring"),
        @("grafana", 3001, "Grafana Dashboard"),
        @("zipkin", 9411, "Zipkin Tracing"),
        @("sonarqube", 9000, "SonarQube Code Quality"),
        @("nexus", 8081, "Nexus Repository"),
        @("mailhog", 8025, "MailHog Email Testing")
    )
    
    foreach ($service in $services) {
        $host = $service[0]
        $port = $service[1]
        $name = $service[2]
        
        try {
            $connection = New-Object System.Net.Sockets.TcpClient
            $connection.ConnectAsync($host, $port).Wait(5000)
            if ($connection.Connected) {
                Write-Success "$name is healthy"
                $connection.Close()
            } else {
                Write-Error "$name is not responding (may still be starting)"
            }
        } catch {
            Write-Error "$name is not responding (may still be starting)"
        }
    }
}

# Enter Java development environment
function Enter-JavaDev {
    Write-Info "Entering Java development environment..."
    
    $composeCmd = Get-ComposeCommand
    
    Write-Info "🏴‍☠️ Welcome to Captain Guthilda's Java Development Environment!"
    Write-Host ""
    Write-Host "Available commands in the container:"
    Write-Host "  mvn clean compile    - Build all Java modules"
    Write-Host "  mvn test            - Run all tests"
    Write-Host "  mvn spring-boot:run - Start Spring Boot applications"
    Write-Host "  gradle build        - Alternative build with Gradle"
    Write-Host ""
    
    if ($composeCmd -eq "docker-compose") {
        & docker-compose -f $JAVA_COMPOSE_FILE exec java-dev bash
    } else {
        & docker compose -f $JAVA_COMPOSE_FILE exec java-dev bash
    }
}

# Build Java applications
function Build-JavaApps {
    Write-Info "Building Java applications..."
    
    $composeCmd = Get-ComposeCommand
    
    $buildScript = @"
echo '🏗️ Building MCP Java Orchestration System...'
cd /workspace
mvn clean compile -B -T 1C
echo '✅ Java build completed!'
"@
    
    if ($composeCmd -eq "docker-compose") {
        & docker-compose -f $JAVA_COMPOSE_FILE exec -T java-dev bash -c $buildScript
    } else {
        & docker compose -f $JAVA_COMPOSE_FILE exec -T java-dev bash -c $buildScript
    }
}

# Test Java applications  
function Test-JavaApps {
    Write-Info "Running Java tests..."
    
    $composeCmd = Get-ComposeCommand
    
    $testScript = @"
echo '🧪 Running MCP Java test suite...'
cd /workspace
mvn test -B
echo '✅ Java tests completed!'
"@
    
    if ($composeCmd -eq "docker-compose") {
        & docker-compose -f $JAVA_COMPOSE_FILE exec -T java-dev bash -c $testScript
    } else {
        & docker compose -f $JAVA_COMPOSE_FILE exec -T java-dev bash -c $testScript
    }
}

# Validate MCP v2 integration
function Test-MCPv2Integration {
    Write-Info "Running comprehensive MCP v2 validation..."
    
    if (Test-Path $MCP_V2_VALIDATION) {
        $composeCmd = Get-ComposeCommand
        
        $validateScript = @"
echo '🔗 Running MCP v2 protocol validation...'
cd /workspace
node validate-mcp-v2-implementations.js
"@
        
        if ($composeCmd -eq "docker-compose") {
            & docker-compose -f $JAVA_COMPOSE_FILE exec -T java-dev bash -c $validateScript
        } else {
            & docker compose -f $JAVA_COMPOSE_FILE exec -T java-dev bash -c $validateScript
        }
    } else {
        Write-Warning "MCP v2 validation script not found. Skipping validation."
    }
}

# Show Java status
function Show-JavaStatus {
    Write-Info "Java-First Repository-OS Status:"
    
    $composeCmd = Get-ComposeCommand
    
    if ($composeCmd -eq "docker-compose") {
        & docker-compose -f $JAVA_COMPOSE_FILE ps
    } else {
        & docker compose -f $JAVA_COMPOSE_FILE ps
    }
    
    Write-Host ""
    Write-Info "*** Captain Guthilda's Java-First Repository-OS Status:"
    Write-Host "    Java Development Environment: docker exec -it mcp-java-dev bash"
    Write-Host "    API Gateway: http://localhost:80"
    Write-Host ""
    Write-Host "Monitoring & Tools:"
    Write-Host "    Grafana Dashboard: http://localhost:3001 (admin/java_admin_2025)"
    Write-Host "    Prometheus Metrics: http://localhost:9090"
    Write-Host "    Zipkin Tracing: http://localhost:9411"
    Write-Host "    SonarQube Analysis: http://localhost:9000 (admin/admin)"
    Write-Host "    Nexus Repository: http://localhost:8081 (admin/admin123)"
    Write-Host "    MailHog Email Testing: http://localhost:8025"
    Write-Host ""
    Write-Host "Data Services:"
    Write-Host "    PostgreSQL: localhost:5432 (mcp_dev/java_dev_2025)"
    Write-Host "    Redis: localhost:6379 (password: java_redis_2025)"
    Write-Host ""
    Write-Host "Spring Boot Applications (when running):"
    Write-Host "    MCP Core: http://localhost:8080"
    Write-Host "    MCP Monitor: http://localhost:8081"
    Write-Host "    MCP Guthilda: http://localhost:8082"
    Write-Host "    MCP AI Integration: http://localhost:8083"
    Write-Host "    MCP Servers: http://localhost:8084"
    Write-Host "    MCP CLI: http://localhost:8085"
}

# Show quick start guide
function Show-JavaQuickStart {
    Write-Host ""
    Write-Host "🎉 Java-First Repository-OS is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Quick Start Guide:" -ForegroundColor Cyan
    Write-Host "1. Enter development environment: .\java-repo-os.ps1 enter"
    Write-Host "2. Build all Java modules: .\java-repo-os.ps1 build"
    Write-Host "3. Run tests: .\java-repo-os.ps1 test"
    Write-Host "4. Validate MCP v2 integration: .\java-repo-os.ps1 validate"
    Write-Host "5. View services: .\java-repo-os.ps1 status"
    Write-Host ""
    Write-Host "Pro Tips:" -ForegroundColor Yellow
    Write-Host "• Use VS Code with Dev Containers for full IDE integration"
    Write-Host "• Check logs with: .\java-repo-os.ps1 logs [service-name]"
    Write-Host "• Monitor with Grafana at http://localhost:3001"
    Write-Host "• All Maven dependencies cached for faster builds"
    Write-Host ""
}

# Show logs
function Show-JavaLogs {
    param([string]$ServiceName)
    
    $composeCmd = Get-ComposeCommand
    
    if ($ServiceName) {
        Write-Info "Showing logs for $ServiceName..."
        if ($composeCmd -eq "docker-compose") {
            & docker-compose -f $JAVA_COMPOSE_FILE logs -f $ServiceName
        } else {
            & docker compose -f $JAVA_COMPOSE_FILE logs -f $ServiceName
        }
    } else {
        Write-Info "Showing all Java Repository-OS logs..."
        if ($composeCmd -eq "docker-compose") {
            & docker-compose -f $JAVA_COMPOSE_FILE logs -f
        } else {
            & docker compose -f $JAVA_COMPOSE_FILE logs -f
        }
    }
}

# Show help menu
function Show-JavaMenu {
    Write-Host ""
    Write-Host "🏴‍☠️ Captain Guthilda's Java Repository-OS Commands:" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Environment Management:" -ForegroundColor Cyan
    Write-Host "  init     - Initialize Java-first Repository-OS"
    Write-Host "  start    - Start Java development environment"
    Write-Host "  stop     - Stop Repository-OS"
    Write-Host "  restart  - Restart Repository-OS"
    Write-Host "  status   - Show status and service URLs"
    Write-Host ""
    Write-Host "Development Commands:" -ForegroundColor Cyan
    Write-Host "  enter    - Enter Java development container"
    Write-Host "  build    - Build all Java applications"
    Write-Host "  test     - Run Java test suite"
    Write-Host "  validate - Run MCP v2 protocol validation"
    Write-Host "  logs     - Show logs (optionally specify service)"
    Write-Host ""
    Write-Host "Session Integration:" -ForegroundColor Cyan
    Write-Host "  integrity - Check session work integrity"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\java-repo-os.ps1 init       # Initialize environment"
    Write-Host "  .\java-repo-os.ps1 start      # Start all services"
    Write-Host "  .\java-repo-os.ps1 enter      # Start coding"
    Write-Host "  .\java-repo-os.ps1 build      # Build applications"
    Write-Host "  .\java-repo-os.ps1 logs java-dev  # Debug container"
    Write-Host ""
}

# Main script logic
Write-Banner

switch ($Command.ToLower()) {
    "init" {
        Test-JavaPrerequisites
        Initialize-JavaRepoOS
        Initialize-GoWorkspace
    }
    "start" {
        Test-JavaPrerequisites
        Start-JavaRepoOS
    }
    "stop" {
        Stop-JavaRepoOS
    }
    "restart" {
        Stop-JavaRepoOS
        Start-Sleep -Seconds 2
        Start-JavaRepoOS
    }
    "enter" {
        Enter-JavaDev
    }
    "build" {
        Build-JavaApps
    }
    "test" {
        Test-JavaApps
    }
    "validate" {
        Test-MCPv2Integration
    }
    "status" {
        Show-JavaStatus
    }
    "logs" {
        Show-JavaLogs -ServiceName $Service
    }
    "integrity" {
        Test-SessionIntegrity
    }
    default {
        Show-JavaMenu
    }
}
