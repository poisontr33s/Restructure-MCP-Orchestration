# CLAUDE UNIFIED RESUME SCRIPT
# Automatically resumes Claude Code with unified session state
# Perfect for creative thinkers who need seamless session continuity

param(
    [switch]$Update,
    [switch]$Fresh,
    [string]$Context = "multi-agent arbitrage system active"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Claude Code Unified Resume System" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check if unified session state exists
$unifiedState = "UNIFIED-SESSION-STATE.md"
if (-not (Test-Path $unifiedState)) {
    Write-Host "⚠️  Unified session state not found. Creating..." -ForegroundColor Yellow
    node scripts/unified-session-extractor.js
    Write-Host "✅ Unified session state created" -ForegroundColor Green
}

# Update unified state if requested or if it's older than 1 hour
if ($Update -or $Fresh) {
    Write-Host "🔄 Updating unified session state..." -ForegroundColor Yellow
    node scripts/unified-session-extractor.js
    Write-Host "✅ Session state updated with latest context" -ForegroundColor Green
}

# Check when unified state was last updated
$stateAge = (Get-Date) - (Get-Item $unifiedState).LastWriteTime
if ($stateAge.TotalHours -gt 1 -and -not $Update) {
    Write-Host "⏰ Unified state is $([math]::Round($stateAge.TotalHours, 1)) hours old. Consider updating with -Update flag" -ForegroundColor Yellow
}

# Prepare resume command based on session preference
$resumeCmd = if ($Fresh) {
    # Start completely fresh but with unified context loaded
    "claude --print `"Resume from UNIFIED-SESSION-STATE.md - $Context - Starting fresh with full historical context`""
} else {
    # Continue most recent session but reference unified state
    "claude --continue --print `"Resume from UNIFIED-SESSION-STATE.md - $Context - Continuing with unified context awareness`""
}

Write-Host ""
Write-Host "📄 Unified State Summary:" -ForegroundColor Green
Write-Host "  • Sessions Unified: $((Select-String -Path $unifiedState -Pattern "Sessions Unified:" | ForEach-Object { $_.Line -split ':' })[1].Trim())" -ForegroundColor White
Write-Host "  • Total Messages: $((Select-String -Path $unifiedState -Pattern "Total Messages:" | ForEach-Object { $_.Line -split ':' })[1].Trim())" -ForegroundColor White
Write-Host "  • Last Updated: $((Get-Item $unifiedState).LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Starting Claude Code with unified session awareness..." -ForegroundColor Green
Write-Host "Command: $resumeCmd" -ForegroundColor Gray

# Add to session log
try {
    . .\.vscode\scripts\append-session-log.ps1 -Topic "unified-resume" -Summary "Auto-resumed with unified session state" -Details "Context: $Context, Fresh: $Fresh, Update: $Update" -Actor "automation"
} catch {
    Write-Host "⚠️  Could not append to session log: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Execute the resume command
Write-Host ""
Invoke-Expression $resumeCmd