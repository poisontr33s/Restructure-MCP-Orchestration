# Quick VS Code Backup Launcher
# Simple one-click script to open a new VS Code instance

Write-Host "🚀 Quick VS Code Backup Instance" -ForegroundColor Green

$vscode = "${env:LOCALAPPDATA}\Programs\Microsoft VS Code\Code.exe"

# Find workspace root by looking for .vscode folder
$currentDir = Get-Location
$workspaceRoot = $currentDir
while ($workspaceRoot -and -not (Test-Path (Join-Path $workspaceRoot ".vscode"))) {
    $parent = Split-Path -Parent $workspaceRoot
    if ($parent -eq $workspaceRoot) { break }
    $workspaceRoot = $parent
}

if (-not $workspaceRoot -or -not (Test-Path (Join-Path $workspaceRoot ".vscode"))) {
    $workspaceRoot = Split-Path -Parent $currentDir
}

if (Test-Path $vscode) {
    Write-Host "Opening new VS Code window with main workspace..." -ForegroundColor Cyan
    Write-Host "Workspace: $workspaceRoot" -ForegroundColor Gray
    Start-Process -FilePath $vscode -ArgumentList @("--new-window", $workspaceRoot)
    Write-Host "✅ New VS Code instance started!" -ForegroundColor Green
    Write-Host "Your original workspace is safe" -ForegroundColor Gray
} else {
    Write-Host "❌ VS Code not found" -ForegroundColor Red
}
