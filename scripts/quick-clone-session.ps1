# QUICK VS CODE SESSION CLONE - For rapid testing and backup
# This is a simplified version that focuses on the most important session elements

param(
    [switch]$LaunchImmediately,
    [switch]$Verbose
)

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "⚡ Quick VS Code Session Clone" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

try {
    # Get currently open files from recent VS Code workspace
    Write-Host "🔍 Detecting recent files..." -ForegroundColor Yellow
    
    # Key project files to always include
    $keyFiles = @(
        "$WorkspaceRoot\README.md",
        "$WorkspaceRoot\package.json", 
        "$WorkspaceRoot\pnpm-workspace.yaml",
        "$WorkspaceRoot\.vscode\settings.json",
        "$WorkspaceRoot\.vscode\tasks.json",
        "$WorkspaceRoot\scripts\clone-vscode-session.ps1",
        "$WorkspaceRoot\CURRENT-STATUS-REPORT.md",
        "$WorkspaceRoot\REPOSITORY-STRUCTURE-PLAN.md"
    ) | Where-Object { Test-Path $_ }
    
    # Recent development files (based on modification time)
    $recentFiles = @()
    $patterns = @("*.ts", "*.js", "*.json", "*.md", "*.yml", "*.ps1")
    
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem -Path $WorkspaceRoot -Filter $pattern -Recurse -File |
                 Where-Object { 
                     $_.FullName -notmatch "(node_modules|\.git|target|build|dist|session-backup)" -and
                     $_.LastWriteTime -gt (Get-Date).AddDays(-2)
                 } |
                 Sort-Object LastWriteTime -Descending |
                 Select-Object -First 3
        $recentFiles += $files
    }
    
    $allFiles = ($keyFiles + $recentFiles.FullName) | Select-Object -Unique | Sort-Object
    
    Write-Host "✅ Found $($allFiles.Count) files to restore" -ForegroundColor Green
    
    if ($Verbose) {
        Write-Host "Files to open:" -ForegroundColor Cyan
        $allFiles | ForEach-Object { Write-Host "  - $($_ -replace [regex]::Escape($WorkspaceRoot), '.')" -ForegroundColor White }
    }
    
    # Create simple workspace file
    $workspaceFile = "$WorkspaceRoot\quick-session-$timestamp.code-workspace"
    
    $workspace = @{
        folders = @(@{ path = "." })
        settings = @{
            "workbench.editor.restoreViewState" = $true
            "workbench.editor.enablePreview" = $false
        }
    }
    
    $workspaceJson = $workspace | ConvertTo-Json -Depth 5
    Set-Content -Path $workspaceFile -Value $workspaceJson -Encoding UTF8
    
    # Create quick launch script
    $quickLaunchScript = @"
# Quick Session Restore - Generated $(Get-Date)
Write-Host "🚀 Launching quick session clone..." -ForegroundColor Green

# Launch VS Code with workspace
Start-Process "code" -ArgumentList "--new-window", "$workspaceFile"
Start-Sleep -Seconds 2

# Open key files
"@
    
    foreach ($file in $allFiles | Select-Object -First 8) {
        $quickLaunchScript += "`nStart-Process `"code`" -ArgumentList `"--goto`", `"$file`""
        $quickLaunchScript += "`nStart-Sleep -Milliseconds 300"
    }
    
    $quickLaunchScript += @"

Write-Host "✅ Quick session restored!" -ForegroundColor Green
"@
    
    $launchScriptPath = "$WorkspaceRoot\scripts\quick-launch-$timestamp.ps1"
    Set-Content -Path $launchScriptPath -Value $quickLaunchScript -Encoding UTF8
    
    # Create reference file
    $reference = @"
# Quick Session Clone Reference
Generated: $(Get-Date)

## Files:
- Workspace: $workspaceFile
- Launch Script: $launchScriptPath

## Usage:
``````powershell
# Launch immediately:
& "$launchScriptPath"

# Or manually:
code --new-window "$workspaceFile"
``````

## Files in session:
"@
    
    foreach ($file in $allFiles) {
        $reference += "`n- $($file -replace [regex]::Escape($WorkspaceRoot), '.')"
    }
    
    $referenceFile = "$WorkspaceRoot\QUICK-SESSION-$timestamp.md"
    Set-Content -Path $referenceFile -Value $reference -Encoding UTF8
    
    # Summary
    Write-Host ""
    Write-Host "✅ QUICK CLONE COMPLETE!" -ForegroundColor Green
    Write-Host "========================" -ForegroundColor Green
    Write-Host "🎯 Workspace: $($workspaceFile -replace [regex]::Escape($WorkspaceRoot), '.')" -ForegroundColor Cyan
    Write-Host "🚀 Launch: $($launchScriptPath -replace [regex]::Escape($WorkspaceRoot), '.')" -ForegroundColor Cyan
    Write-Host "📄 Reference: $($referenceFile -replace [regex]::Escape($WorkspaceRoot), '.')" -ForegroundColor Cyan
    Write-Host ""
    
    if ($LaunchImmediately) {
        Write-Host "🔄 Launching now..." -ForegroundColor Blue
        & $launchScriptPath
    } else {
        Write-Host "💡 To launch: & `"$launchScriptPath`"" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
