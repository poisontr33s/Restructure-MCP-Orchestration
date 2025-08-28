# 🏴‍☠️ Quick VS Code Surgical Reset
# Immediate action to eliminate process chaos and service worker conflicts

Write-Host "🏴‍☠️ QUICK SURGICAL RESET - IMMEDIATE ACTION MODE" -ForegroundColor Cyan

# 1. Backup recent workspaces
$recentWorkspaces = "$env:APPDATA\Code\User\globalStorage\storage.json"
$backupFile = "$env:TEMP\vscode-recent-backup.json"

if (Test-Path $recentWorkspaces) {
    Copy-Item $recentWorkspaces $backupFile -Force
    Write-Host "✅ Recent workspaces backed up" -ForegroundColor Green
}

# 2. Nuclear stop all VS Code processes
Write-Host "⚔️ Stopping all VS Code processes..." -ForegroundColor Red
Get-Process | Where-Object { 
    $_.ProcessName -like "*code*" -or 
    $_.MainWindowTitle -like "*Visual Studio Code*" 
} | Stop-Process -Force -ErrorAction SilentlyContinue

# 3. Clear service worker cache that causes the registration errors
Write-Host "🔧 Clearing service worker cache..." -ForegroundColor Yellow
Remove-Item "$env:APPDATA\Code\Service Worker" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:APPDATA\Code\CachedData" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Restore recent workspaces
if (Test-Path $backupFile) {
    $targetDir = Split-Path $recentWorkspaces -Parent
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    }
    Copy-Item $backupFile $recentWorkspaces -Force
    Remove-Item $backupFile -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Recent workspaces restored" -ForegroundColor Green
}

# 5. Start VS Code with current workspace
Write-Host "🚀 Starting clean VS Code..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

$currentPath = (Get-Location).Path
$workspaceFile = Get-ChildItem -Path $currentPath -Filter "*.code-workspace" | Select-Object -First 1

if ($workspaceFile) {
    Start-Process "code" -ArgumentList "`"$($workspaceFile.FullName)`""
    Write-Host "✅ Opened workspace: $($workspaceFile.Name)" -ForegroundColor Green
} else {
    Start-Process "code" -ArgumentList "`"$currentPath`""
    Write-Host "✅ Opened current directory" -ForegroundColor Green
}

Write-Host "`n🎉 SURGICAL RESET COMPLETE!" -ForegroundColor Green
Write-Host "🏴‍☠️ Service worker conflicts eliminated, workspace context preserved!" -ForegroundColor Cyan
