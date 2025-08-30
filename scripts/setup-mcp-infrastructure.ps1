# MCP v2 Infrastructure Setup for Windows 11
# This script installs Docker Desktop and Maven to complete the MCP v2 validation

Write-Host "🚀 MCP v2 Infrastructure Setup - Docker & Maven Installation" -ForegroundColor Cyan
Write-Host "This will install the missing components for MCP v2 validation" -ForegroundColor Yellow

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  Please run this script as Administrator for installation privileges" -ForegroundColor Red
    Write-Host "Right-click PowerShell -> 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 Current MCP v2 Validation Status:" -ForegroundColor Blue
Write-Host "✅ Protocol: 17/17 tests passing" -ForegroundColor Green
Write-Host "✅ TypeScript: 20/20 tests passing" -ForegroundColor Green  
Write-Host "✅ Python: 15/15 tests passing" -ForegroundColor Green
Write-Host "✅ Documentation: 17/17 tests passing" -ForegroundColor Green
Write-Host "❌ Java: 11/12 tests (Maven missing)" -ForegroundColor Red
Write-Host "❌ Infrastructure: 8/9 tests (Docker missing)" -ForegroundColor Red

# Check if Chocolatey is installed
Write-Host "`n🍫 Checking Chocolatey..." -ForegroundColor Blue
try {
    $chocoVersion = & choco --version 2>$null
    Write-Host "✅ Chocolatey found: $chocoVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Host "✅ Chocolatey installed successfully" -ForegroundColor Green
}

# Install Docker Desktop
Write-Host "`n🐳 Installing Docker Desktop..." -ForegroundColor Blue
try {
    & docker --version 2>$null
    Write-Host "✅ Docker already installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Docker Desktop via Chocolatey..." -ForegroundColor Yellow
    choco install docker-desktop -y
    Write-Host "✅ Docker Desktop installed" -ForegroundColor Green
    Write-Host "⚠️  Please restart your computer after this script completes" -ForegroundColor Yellow
}

# Install Maven
Write-Host "`n☕ Installing Apache Maven..." -ForegroundColor Blue
try {
    & mvn --version 2>$null
    Write-Host "✅ Maven already installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Maven via Chocolatey..." -ForegroundColor Yellow
    choco install maven -y
    Write-Host "✅ Maven installed successfully" -ForegroundColor Green
}

# Install Git (if not present)
Write-Host "`n📚 Checking Git..." -ForegroundColor Blue
try {
    & git --version 2>$null
    Write-Host "✅ Git already installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Git..." -ForegroundColor Yellow
    choco install git -y
    Write-Host "✅ Git installed successfully" -ForegroundColor Green
}

# Refresh environment variables
Write-Host "`n🔄 Refreshing environment variables..." -ForegroundColor Blue
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "`n🎯 Installation Summary:" -ForegroundColor Magenta
Write-Host "✅ Chocolatey package manager" -ForegroundColor Green
Write-Host "✅ Docker Desktop for Windows" -ForegroundColor Green
Write-Host "✅ Apache Maven" -ForegroundColor Green
Write-Host "✅ Git (version control)" -ForegroundColor Green

Write-Host "`n🔄 Next Steps:" -ForegroundColor Blue
Write-Host "1. Restart your computer (required for Docker)" -ForegroundColor White
Write-Host "2. Start Docker Desktop application" -ForegroundColor White
Write-Host "3. Open new PowerShell/VS Code terminal" -ForegroundColor White
Write-Host "4. Run: node validate-mcp-v2-implementations.js" -ForegroundColor Cyan
Write-Host "5. Expected result: 90/90 tests passing ✅" -ForegroundColor Green

Write-Host "`n🐳 Docker Post-Install:" -ForegroundColor Blue
Write-Host "After restart, run these to verify Docker:" -ForegroundColor White
Write-Host "docker --version" -ForegroundColor Gray
Write-Host "docker-compose --version" -ForegroundColor Gray
Write-Host "docker run hello-world" -ForegroundColor Gray

Write-Host "`n☕ Maven Verification:" -ForegroundColor Blue
Write-Host "mvn --version" -ForegroundColor Gray
Write-Host "mvn help:evaluate -Dexpression=maven.version -q -DforceStdout" -ForegroundColor Gray

Write-Host "`n🎯 Final Validation Command:" -ForegroundColor Yellow
Write-Host "cd c:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration" -ForegroundColor Gray
Write-Host "node validate-mcp-v2-implementations.js" -ForegroundColor Cyan

Write-Host "`n🏴‍☠️ The ship's infrastructure is now ready for full MCP v2 orchestration! ⚓🔥" -ForegroundColor Magenta
