# DEPRECATED: Host-based Go and Docker Desktop Setup Script
# 
# ⚠️  This script installs tools on the HOST OS (Windows 11)
# 
# 🎯 RECOMMENDED APPROACH: Use Container-First Development instead!
# 
# Benefits of Container-First:
# ✅ Cross-OS compatibility (Windows, macOS, Linux)
# ✅ No host OS pollution or duplicate installations
# ✅ Consistent environment across all developers
# ✅ IDE handles all toolchain management
# ✅ Zero configuration - just open in VS Code Dev Container
#
# To use Container-First approach:
# 1. Install VS Code + Dev Containers extension
# 2. Open this repository in VS Code  
# 3. Click "Reopen in Container" when prompted
# 4. Everything is automatically configured!
#
# This script is kept for legacy compatibility only.
# For new setups, use the .devcontainer configuration instead.

param(
    [switch]$SkipGo,
    [switch]$SkipDocker,
    [switch]$Force
)

Write-Host "⚠️  DEPRECATED: Host-based installation approach" -ForegroundColor Yellow
Write-Host "🎯 RECOMMENDED: Use Container-First Development instead!" -ForegroundColor Green
Write-Host "   See: .devcontainer/ or CONTAINER-FIRST-DEVELOPMENT.md" -ForegroundColor Cyan
Write-Host ""

$continue = Read-Host "Continue with host installation? (y/N)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "✅ Smart choice! Use the container approach for better cross-OS compatibility." -ForegroundColor Green
    exit 0
}

Write-Host "🚀 Setting up Go and Docker Desktop for MCP v2 Development..." -ForegroundColor Green

# Ensure running as Administrator for system-level installations
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  This script requires Administrator privileges for system installations." -ForegroundColor Yellow
    Write-Host "Re-launching as Administrator..." -ForegroundColor Yellow
    Start-Process PowerShell -Verb RunAs -ArgumentList "-File", $PSCommandPath, "-SkipGo:$SkipGo", "-SkipDocker:$SkipDocker", "-Force:$Force"
    exit
}

# Function to refresh environment variables
function Update-Environment {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    refreshenv 2>$null -or $true
}

# Install Go if not present or forced
if (-not $SkipGo) {
    Write-Host "📦 Checking Go installation..." -ForegroundColor Cyan
    
    $goVersion = & where.exe go 2>$null
    if (-not $goVersion -or $Force) {
        Write-Host "Installing Go via winget..." -ForegroundColor Yellow
        
        try {
            winget install --id=GoLang.Go --source=winget --accept-package-agreements --accept-source-agreements
            
            # Refresh environment
            Update-Environment
            
            # Set GOROOT and GOPATH
            $goRoot = (Get-ChildItem -Path "C:\Program Files\Go" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
            if (-not $goRoot) {
                $goRoot = "C:\Program Files\Go"
            }
            
            [Environment]::SetEnvironmentVariable("GOROOT", $goRoot, "Machine")
            [Environment]::SetEnvironmentVariable("GOPATH", "$env:USERPROFILE\go", "User")
            
            # Add Go to PATH if not already there
            $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
            if ($currentPath -notlike "*$goRoot\bin*") {
                [Environment]::SetEnvironmentVariable("Path", "$currentPath;$goRoot\bin", "Machine")
            }
            
            Update-Environment
            $env:GOROOT = $goRoot
            $env:GOPATH = "$env:USERPROFILE\go"
            
            Write-Host "✅ Go installed successfully!" -ForegroundColor Green
            Write-Host "   GOROOT: $env:GOROOT" -ForegroundColor Gray
            Write-Host "   GOPATH: $env:GOPATH" -ForegroundColor Gray
            
        } catch {
            Write-Host "❌ Failed to install Go: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ Go is already installed: $goVersion" -ForegroundColor Green
    }
    
    # Verify Go installation
    try {
        $goVersionOutput = & go version 2>&1
        Write-Host "Go version: $goVersionOutput" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Go installed but not accessible. Please restart your terminal." -ForegroundColor Yellow
    }
}

# Start Docker Desktop if not running
if (-not $SkipDocker) {
    Write-Host "🐳 Checking Docker Desktop..." -ForegroundColor Cyan
    
    $dockerService = Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue
    if ($dockerService -and $dockerService.Status -eq "Stopped") {
        Write-Host "Starting Docker Desktop service..." -ForegroundColor Yellow
        
        try {
            Start-Service -Name "com.docker.service"
            Write-Host "✅ Docker Desktop service started!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Failed to start Docker service: $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host "Please start Docker Desktop manually from the Start menu." -ForegroundColor Yellow
        }
    } elseif ($dockerService -and $dockerService.Status -eq "Running") {
        Write-Host "✅ Docker Desktop service is already running!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Docker Desktop service not found. Please install Docker Desktop." -ForegroundColor Yellow
        Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    }
    
    # Try to start Docker Desktop application
    $dockerExe = Get-Command "Docker Desktop.exe" -ErrorAction SilentlyContinue
    if (-not $dockerExe) {
        $dockerExe = Get-ChildItem -Path "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
    }
    
    if ($dockerExe) {
        Write-Host "Starting Docker Desktop application..." -ForegroundColor Yellow
        Start-Process -FilePath $dockerExe.Source -WindowStyle Hidden
        
        # Wait for Docker to be ready
        Write-Host "Waiting for Docker engine to start..." -ForegroundColor Yellow
        $timeout = 60
        $elapsed = 0
        
        do {
            Start-Sleep -Seconds 5
            $elapsed += 5
            try {
                $dockerInfo = & docker info 2>&1
                if ($dockerInfo -notlike "*error*" -and $dockerInfo -notlike "*Cannot connect*") {
                    Write-Host "✅ Docker engine is ready!" -ForegroundColor Green
                    break
                }
            } catch {}
            
            if ($elapsed -ge $timeout) {
                Write-Host "⚠️  Docker engine did not start within $timeout seconds." -ForegroundColor Yellow
                Write-Host "Please check Docker Desktop manually." -ForegroundColor Yellow
                break
            }
        } while ($elapsed -lt $timeout)
    }
}

Write-Host "`n🎯 VS Code Go Extension Configuration" -ForegroundColor Cyan
Write-Host "Add these settings to your VS Code settings.json:" -ForegroundColor Yellow
Write-Host @"
{
    "go.goroot": "$env:GOROOT",
    "go.gopath": "$env:GOPATH",
    "go.toolsManagement.checkForUpdates": "local",
    "go.useLanguageServer": true
}
"@ -ForegroundColor Gray

Write-Host "`n🔄 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Restart VS Code to pick up environment changes" -ForegroundColor White
Write-Host "2. Open the MCP v2 workspace" -ForegroundColor White
Write-Host "3. Run validation script to verify setup" -ForegroundColor White

Write-Host "`n✅ Setup complete! Remember to restart your terminal/VS Code." -ForegroundColor Green
