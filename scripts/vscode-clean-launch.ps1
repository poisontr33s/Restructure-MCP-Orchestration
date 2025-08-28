# 🏴‍☠️ Captain Guthilda's Clean VS Code Session Launcher
# Closes existing instances and launches a clean isolated session

param(
    [string]$SessionName = "MCP-Orchestration-Fixed"
)

Write-Host "🏴‍☠️ CLEAN SESSION LAUNCHER" -ForegroundColor Cyan
Write-Host "🎯 Preparing clean launch for: $SessionName" -ForegroundColor Yellow

# Step 1: Close all VS Code instances to avoid conflicts
Write-Host "🧹 Closing existing VS Code instances..." -ForegroundColor Yellow
Get-Process | Where-Object { 
    $_.ProcessName -like "*code*" -or 
    $_.MainWindowTitle -like "*Visual Studio Code*" 
} | ForEach-Object {
    Write-Host "  🔫 Stopping: $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Gray
    $_ | Stop-Process -Force -ErrorAction SilentlyContinue
}

# Wait for processes to fully terminate
Start-Sleep -Seconds 2

# Step 2: Launch the session
Write-Host "🚀 Launching clean session..." -ForegroundColor Cyan
& ".\scripts\vscode-session-master.ps1" -Launch $SessionName

Write-Host "✅ Clean session launch complete!" -ForegroundColor Green
