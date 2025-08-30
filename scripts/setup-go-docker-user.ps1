# User-level Go and Docker Setup for MCP v2 Development
# This script attempts user-level installations and configurations

Write-Host "🚀 Setting up Go and Docker for MCP v2 Development (User Mode)..." -ForegroundColor Green

# Check if Go is installed
Write-Host "📦 Checking Go installation..." -ForegroundColor Cyan
$goInstalled = Get-Command "go" -ErrorAction SilentlyContinue

if (-not $goInstalled) {
    Write-Host "❌ Go is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Go manually:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://golang.org/dl/" -ForegroundColor Cyan
    Write-Host "2. Or use winget (as Administrator): winget install GoLang.Go" -ForegroundColor Cyan
    Write-Host "3. Or use Chocolatey: choco install golang" -ForegroundColor Cyan
} else {
    $goVersion = & go version
    Write-Host "✅ Go is installed: $goVersion" -ForegroundColor Green
    
    # Check GOROOT and GOPATH
    $goRoot = & go env GOROOT
    $goPath = & go env GOPATH
    
    Write-Host "   GOROOT: $goRoot" -ForegroundColor Gray
    Write-Host "   GOPATH: $goPath" -ForegroundColor Gray
}

# Check Docker Desktop
Write-Host "`n🐳 Checking Docker Desktop..." -ForegroundColor Cyan
$dockerInstalled = Get-Command "docker" -ErrorAction SilentlyContinue

if (-not $dockerInstalled) {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
} else {
    try {
        $dockerVersion = & docker --version 2>&1
        Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
        
        # Check if Docker daemon is running
        $dockerInfo = & docker info 2>&1
        if ($dockerInfo -like "*error*" -or $dockerInfo -like "*Cannot connect*") {
            Write-Host "⚠️  Docker daemon is not running" -ForegroundColor Yellow
            Write-Host "Please start Docker Desktop from the Start menu" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Docker daemon is running" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Docker command failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Try to start Docker Desktop if it's installed but not running
$dockerDesktopPath = @(
    "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
    "${env:LOCALAPPDATA}\Programs\Docker\Docker\Docker Desktop.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($dockerDesktopPath -and (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    $dockerRunning = try { & docker info 2>&1; $? } catch { $false }
    
    if (-not $dockerRunning) {
        Write-Host "🔄 Attempting to start Docker Desktop..." -ForegroundColor Yellow
        try {
            Start-Process -FilePath $dockerDesktopPath -WindowStyle Hidden
            Write-Host "✅ Docker Desktop started. Please wait for it to initialize." -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not start Docker Desktop automatically" -ForegroundColor Yellow
        }
    }
}

# Create VS Code settings for Go
Write-Host "`n🎯 VS Code Go Configuration" -ForegroundColor Cyan

if ($goInstalled) {
    $goRoot = & go env GOROOT
    $goPath = & go env GOPATH
    
    $vsCodeSettings = @{
        "go.goroot" = $goRoot
        "go.gopath" = $goPath
        "go.toolsManagement.checkForUpdates" = "local"
        "go.useLanguageServer" = true
        "go.lintTool" = "golangci-lint"
        "go.buildOnSave" = "package"
        "go.vetOnSave" = "package"
    }
    
    Write-Host "Recommended VS Code settings.json additions:" -ForegroundColor Yellow
    Write-Host ($vsCodeSettings | ConvertTo-Json -Depth 2) -ForegroundColor Gray
}

# Test Go workspace
if ($goInstalled) {
    Write-Host "`n🧪 Testing Go workspace..." -ForegroundColor Cyan
    
    if (Test-Path "go-workspace") {
        Push-Location "go-workspace"
        
        try {
            Write-Host "Running 'go mod tidy'..." -ForegroundColor Yellow
            & go mod tidy
            
            Write-Host "Running 'go build'..." -ForegroundColor Yellow
            & go build -o mcp-v2-go.exe .
            
            if (Test-Path "mcp-v2-go.exe") {
                Write-Host "✅ Go build successful!" -ForegroundColor Green
                Remove-Item "mcp-v2-go.exe" -Force
            } else {
                Write-Host "❌ Go build failed" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Go workspace test failed: $($_.Exception.Message)" -ForegroundColor Red
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "⚠️  go-workspace directory not found" -ForegroundColor Yellow
    }
}

Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "✅ Go: $(if ($goInstalled) { 'Installed' } else { 'NOT INSTALLED' })" -ForegroundColor $(if ($goInstalled) { 'Green' } else { 'Red' })
Write-Host "✅ Docker: $(if (Get-Command 'docker' -ErrorAction SilentlyContinue) { 'Installed' } else { 'NOT INSTALLED' })" -ForegroundColor $(if (Get-Command 'docker' -ErrorAction SilentlyContinue) { 'Green' } else { 'Red' })

Write-Host "`n🔄 Next Steps:" -ForegroundColor Cyan
if (-not $goInstalled) {
    Write-Host "1. Install Go from https://golang.org/dl/" -ForegroundColor White
}
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "2. Install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor White
}
Write-Host "3. Restart VS Code to pick up environment changes" -ForegroundColor White
Write-Host "4. Run validation script: node validate-mcp-v2-implementations.js" -ForegroundColor White

Write-Host "`n✅ User-level setup complete!" -ForegroundColor Green
