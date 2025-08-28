# 🏴‍☠️ Captain Guthilda's Go Environment Emergency Fix
# Stops VS Code Go extension popups immediately

param(
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🚑 EMERGENCY GO ENVIRONMENT FIX" -ForegroundColor Red
Write-Host "🎯 Stopping VS Code Go popup sabotage..." -ForegroundColor Yellow

# Get paths
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$DevToolsDir = Join-Path $RepoRoot "dev-tools"
$GoPath = Join-Path $DevToolsDir "go"
$GoBinary = Join-Path $GoPath "bin\go.exe"

# Verify Go installation
if (-not (Test-Path $GoBinary)) {
    Write-Host "❌ Go binary not found at: $GoBinary" -ForegroundColor Red
    Write-Host "📥 Installing Go first..." -ForegroundColor Yellow
    
    # Quick Go installation
    $GoUrl = "https://go.dev/dl/go1.21.12.windows-amd64.zip"
    $TempDir = Join-Path $DevToolsDir "temp"
    $GoZip = Join-Path $TempDir "go.zip"
    
    New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
    
    Write-Host "⬇️ Downloading Go..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $GoUrl -OutFile $GoZip -UseBasicParsing
    
    Write-Host "📦 Extracting Go..." -ForegroundColor Yellow
    Expand-Archive -Path $GoZip -DestinationPath $DevToolsDir -Force
    
    # Cleanup
    Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    
    if (-not (Test-Path $GoBinary)) {
        Write-Host "❌ Go installation failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Go binary found: $GoBinary" -ForegroundColor Green

# Create emergency VS Code settings
$VSCodeDir = Join-Path $RepoRoot ".vscode"
$SettingsPath = Join-Path $VSCodeDir "settings.json"

New-Item -ItemType Directory -Force -Path $VSCodeDir | Out-Null

# Read existing settings or create new
$Settings = @{}
if (Test-Path $SettingsPath) {
    try {
        $Settings = Get-Content $SettingsPath -Raw | ConvertFrom-Json -AsHashtable
    } catch {
        Write-Host "⚠️ Invalid settings.json, creating new..." -ForegroundColor Yellow
        $Settings = @{}
    }
}

# Fix Go paths (escape backslashes for JSON)
$GoRootPath = $GoPath.Replace('\', '\\')
$GoBinPath = (Join-Path $GoPath "bin").Replace('\', '\\')
$GoWorkspace = (Join-Path $RepoRoot "go-workspace").Replace('\', '\\')

# Essential Go settings to stop popups
$Settings["go.goroot"] = $GoRootPath
$Settings["go.gopath"] = $GoWorkspace
$Settings["go.toolsGopath"] = Join-Path $RepoRoot "go-tools" | ForEach-Object { $_.Replace('\', '\\') }
$Settings["go.useLanguageServer"] = $true
$Settings["go.alternateTools"] = @{
    "go" = "$GoRootPath\\bin\\go.exe"
}

# Terminal environment (crucial for VS Code)
if (-not $Settings["terminal.integrated.env.windows"]) {
    $Settings["terminal.integrated.env.windows"] = @{}
}

$Settings["terminal.integrated.env.windows"]["GOROOT"] = $GoRootPath
$Settings["terminal.integrated.env.windows"]["GOPATH"] = $GoWorkspace

# Update PATH in terminal
$currentTerminalPath = $Settings["terminal.integrated.env.windows"]["PATH"]
if (-not $currentTerminalPath) {
    $currentTerminalPath = '${env:PATH}'
}

# Prepend Go bin to PATH
$Settings["terminal.integrated.env.windows"]["PATH"] = "$GoBinPath;$currentTerminalPath"

# Save settings
$settingsJson = $Settings | ConvertTo-Json -Depth 10
$settingsJson | Out-File -FilePath $SettingsPath -Encoding UTF8

Write-Host "✅ Emergency VS Code settings applied!" -ForegroundColor Green

# Create go-workspace directories
$GoWorkspaceDir = Join-Path $RepoRoot "go-workspace"
$GoToolsDir = Join-Path $RepoRoot "go-tools"

New-Item -ItemType Directory -Force -Path $GoWorkspaceDir | Out-Null
New-Item -ItemType Directory -Force -Path $GoToolsDir | Out-Null

# Create simple go.mod for the workspace
$GoModPath = Join-Path $GoWorkspaceDir "go.mod"
if (-not (Test-Path $GoModPath)) {
    @"
module workspace

go 1.21
"@ | Out-File -FilePath $GoModPath -Encoding UTF8
}

Write-Host "✅ Go workspace configured" -ForegroundColor Green

# Test Go installation
Write-Host "🔍 Testing Go installation..." -ForegroundColor Yellow

# Store original environment variables
$originalGOROOT = $env:GOROOT
$originalGOPATH = $env:GOPATH
$originalPATH = $env:PATH

try {
    $env:GOROOT = $GoPath
    $env:GOPATH = $GoWorkspaceDir
    $env:PATH = "$GoBinPath;$env:PATH"
    
    $goVersion = & $GoBinary version 2>&1
    Write-Host "✅ Go Version: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go test failed: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Restore original environment variables
    $env:GOROOT = $originalGOROOT
    $env:GOPATH = $originalGOPATH
    $env:PATH = $originalPATH
}

# Update .gitignore
$GitIgnorePath = Join-Path $RepoRoot ".gitignore"
$gitIgnoreEntries = @"

# Go workspace and tools
go-workspace/
go-tools/
"@

if (Test-Path $GitIgnorePath) {
    $currentContent = Get-Content $GitIgnorePath -Raw
    if ($currentContent -notlike "*go-workspace*") {
        Add-Content -Path $GitIgnorePath -Value $gitIgnoreEntries
    }
} else {
    $gitIgnoreEntries | Out-File -FilePath $GitIgnorePath -Encoding UTF8
}

Write-Host ""
Write-Host "🎉 EMERGENCY GO FIX COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What was fixed:" -ForegroundColor Cyan
Write-Host "✅ Go binary path configured in VS Code" -ForegroundColor White
Write-Host "✅ GOROOT and GOPATH environment variables set" -ForegroundColor White
Write-Host "✅ Terminal PATH updated to include Go" -ForegroundColor White
Write-Host "✅ Go workspace directories created" -ForegroundColor White
Write-Host "✅ Basic go.mod file created" -ForegroundColor White
Write-Host ""
Write-Host "🚨 CRITICAL: Restart VS Code now!" -ForegroundColor Red
Write-Host "📝 Then run: setup-dev-env.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎯 Popup should be eliminated!" -ForegroundColor Green
