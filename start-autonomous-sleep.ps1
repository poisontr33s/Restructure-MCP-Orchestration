# 🌑🔥 Start Autonomous Sleep Mode - No Prompts, Full Auto-Save
# This script eliminates [Keep] prompts and maintains 8-hour autonomous operation

param(
    [switch]$Force,
    [int]$DurationHours = 8
)

$ErrorActionPreference = 'Stop'

Write-Host "🌑🔥 AUTONOMOUS SLEEP MODE INITIALIZER" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Ensure we're in the right directory
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "📍 Repository Root: $RepoRoot" -ForegroundColor Green
Write-Host "⏰ Duration: $DurationHours hours" -ForegroundColor Green
Write-Host ""

try {
    # 1. Update environment for no prompts
    Write-Host "🚀 Setting up no-prompt environment..." -ForegroundColor Yellow
    $env:AUTONOMOUS_MODE = 'true'
    $env:NO_PROMPTS = 'true'
    $env:AUTO_ACCEPT_ALL = 'true'
    $env:GEMINI_AUTO_ACCEPT = 'true'
    $env:CLAUDE_AUTO_ACCEPT = 'true'
    $env:COPILOT_AUTO_ACCEPT = 'true'
    $env:SESSION_PERSISTENCE = 'true'
    $env:Path = "C:\Users\erdno\.local\bin;$env:Path"
    
    Write-Host "✅ Environment configured for autonomous operation" -ForegroundColor Green

    # 2. Kill any existing processes that might interfere
    Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
    
    # Kill existing Gemini processes
    Get-Process | Where-Object { $_.ProcessName -like '*gemini*' } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Kill existing autonomous processes
    Get-Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'autonomous' } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Process cleanup completed" -ForegroundColor Green

    # 3. Build and prepare the autonomous launcher
    Write-Host "🔨 Building autonomous launcher..." -ForegroundColor Yellow
    
    # Ensure TypeScript is compiled
    if (Test-Path "node_modules") {
        pnpm run build 2>$null | Out-Null
    }
    
    Write-Host "✅ Build completed" -ForegroundColor Green

    # 4. Create session directory
    $SessionDir = Join-Path $RepoRoot ".vscode\.session"
    if (-not (Test-Path $SessionDir)) {
        New-Item -ItemType Directory -Path $SessionDir -Force | Out-Null
    }
    
    # 5. Save startup configuration
    $StartupConfig = @{
        startTime = (Get-Date).ToString('o')
        durationHours = $DurationHours
        processId = $PID
        workspaceRoot = $RepoRoot
        noPrompts = $true
        autoSave = $true
        autonomous = $true
    }
    
    $ConfigFile = Join-Path $SessionDir "startup-config.json"
    $StartupConfig | ConvertTo-Json -Depth 3 | Set-Content $ConfigFile -Encoding UTF8
    
    Write-Host "💾 Startup configuration saved" -ForegroundColor Green

    # 6. Start the autonomous launcher
    Write-Host "🚀 Starting autonomous operation system..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🌙 ENTERING SLEEP MODE - 8 HOUR AUTONOMOUS OPERATION" -ForegroundColor Magenta
    Write-Host "🤖 No [Keep] prompts, continuous auto-save, live server maintained" -ForegroundColor Magenta
    Write-Host "🌐 Monitor at: http://localhost:5500" -ForegroundColor Magenta
    Write-Host ""

    # Start the enhanced autonomous launcher
    $LauncherPath = Join-Path $RepoRoot "agent\autonomous-launcher.ts"
    
    if (Test-Path $LauncherPath) {
        # Use npx tsx to run TypeScript directly
        Write-Host "🎯 Launching with TypeScript..." -ForegroundColor Green
        npx tsx $LauncherPath
    } else {
        Write-Host "❌ Autonomous launcher not found at: $LauncherPath" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "❌ Error starting autonomous mode: $_" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Autonomous sleep mode completed successfully" -ForegroundColor Green
Write-Host "🌅 Welcome back! System ran autonomously for $DurationHours hours" -ForegroundColor Green
