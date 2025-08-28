# 🚀 AUTONOMOUS ORCHESTRATION LAUNCHER
# Simple launcher for Captain Guthilda's 8-hour autonomous system
#
# Usage: ./scripts/launch-autonomous.ps1 [-Hours 8] [-DryRun] [-Aggressive]

[CmdletBinding()]
param(
    [Parameter(HelpMessage = "Hours to run autonomously (default: 8)")]
    [int]$Hours = 8,
    
    [Parameter(HelpMessage = "Perform dry run without making changes")]
    [switch]$DryRun,
    
    [Parameter(HelpMessage = "Enable aggressive fixes")]
    [switch]$Aggressive,
    
    [Parameter(HelpMessage = "Start monitoring in separate window")]
    [switch]$WithMonitor
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Check prerequisites
if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm not found. Please install pnpm first." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Host "❌ Not in a Node.js project directory. Please run from the project root." -ForegroundColor Red
    exit 1
}

# Ensure log directory exists
$logDir = "autonomous-logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Clear any existing emergency stop
$stopFile = Join-Path $logDir "EMERGENCY_STOP"
if (Test-Path $stopFile) {
    Remove-Item $stopFile -Force
    Write-Host "🔄 Cleared previous emergency stop" -ForegroundColor Yellow
}

Write-Host "🏴‍☠️ CAPTAIN GUTHILDA'S AUTONOMOUS ORCHESTRATION LAUNCHER" -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "⏰ Duration: $Hours hours" -ForegroundColor White
Write-Host "🔧 Mode: $(if ($DryRun) { 'DRY RUN (no changes)' } else { 'LIVE EXECUTION' })" -ForegroundColor $(if ($DryRun) { 'Yellow' } else { 'Green' })
Write-Host "⚡ Aggressiveness: $(if ($Aggressive) { 'AGGRESSIVE' } else { 'CONSERVATIVE' })" -ForegroundColor $(if ($Aggressive) { 'Red' } else { 'Green' })
Write-Host "📁 Logs: $logDir" -ForegroundColor Gray
Write-Host ""

if ($WithMonitor) {
    Write-Host "🖥️ Starting monitoring window..." -ForegroundColor Cyan
    Start-Process "pwsh.exe" -ArgumentList "-NoExit", "-Command", "& '.\scripts\autonomous-monitor.ps1' -Tail"
    Start-Sleep -Seconds 2
}

Write-Host "🚀 Launching autonomous orchestrator..." -ForegroundColor Green
Write-Host ""
Write-Host "To monitor progress:" -ForegroundColor Yellow
Write-Host "  .\scripts\autonomous-monitor.ps1 -Status" -ForegroundColor Gray
Write-Host "  .\scripts\autonomous-monitor.ps1 -Tail" -ForegroundColor Gray
Write-Host ""
Write-Host "To emergency stop:" -ForegroundColor Red
Write-Host "  .\scripts\autonomous-monitor.ps1 -EmergencyStop" -ForegroundColor Gray
Write-Host ""

# Build parameter hashtable for the autonomous orchestrator
$params = @{
    Hours = $Hours
    LogDir = $logDir
    Force = $true  # Skip confirmation since we're handling it here
}
if ($DryRun) { $params.DryRun = $true }
if ($Aggressive) { $params.Aggressive = $true }

try {
    # Launch the autonomous orchestrator
    & ".\scripts\autonomous-master-orchestrator.ps1" @params
}
catch {
    Write-Host "💥 Autonomous orchestrator failed to start: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🏁 Autonomous orchestration session complete!" -ForegroundColor Green
Write-Host "Check the logs in $logDir for detailed results." -ForegroundColor Gray
