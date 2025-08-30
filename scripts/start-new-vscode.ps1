# Start New VS Code Instance - Backup Protection Script
# Opens a new VS Code window while preserving the current workspace

param(
    [switch]$NewWindow,
    [switch]$OpenWorkspace,
    [string]$WorkspacePath = "."
)

Write-Host "🚀 Starting New VS Code Instance..." -ForegroundColor Green
Write-Host "This preserves your current workspace and opens a backup instance" -ForegroundColor Gray
Write-Host ""

# Get current VS Code processes for reference
$existingVSCode = Get-Process -Name "Code" -ErrorAction SilentlyContinue
if ($existingVSCode) {
    $processCount = $existingVSCode.Count
    $memoryUsage = [math]::Round(($existingVSCode | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB, 1)
    Write-Host "📊 Current VS Code: $processCount processes using $memoryUsage MB" -ForegroundColor Cyan
}

# VS Code executable path
$vscodeExe = "${env:LOCALAPPDATA}\Programs\Microsoft VS Code\Code.exe"

if (-not (Test-Path $vscodeExe)) {
    Write-Host "❌ VS Code not found at: $vscodeExe" -ForegroundColor Red
    Write-Host "Please check your VS Code installation" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ VS Code found: $vscodeExe" -ForegroundColor Green

# Determine the correct workspace path (find the parent directory with .vscode folder)
$currentDir = Get-Location
$workspaceRoot = $currentDir
while ($workspaceRoot -and -not (Test-Path (Join-Path $workspaceRoot ".vscode"))) {
    $parent = Split-Path -Parent $workspaceRoot
    if ($parent -eq $workspaceRoot) { break }  # Avoid infinite loop at root
    $workspaceRoot = $parent
}

if (-not $workspaceRoot -or -not (Test-Path (Join-Path $workspaceRoot ".vscode"))) {
    # Fallback: assume we're in scripts subfolder
    $workspaceRoot = Split-Path -Parent $currentDir
}

Write-Host "🎯 Detected workspace root: $workspaceRoot" -ForegroundColor Gray

# Determine startup options
if ($NewWindow) {
    Write-Host "🎯 Opening new window (separate instance)" -ForegroundColor Cyan
    $arguments = @("--new-window")
} elseif ($OpenWorkspace) {
    Write-Host "🎯 Opening workspace in new instance" -ForegroundColor Cyan
    $arguments = @("--new-window", $WorkspacePath)
} else {
    Write-Host "🎯 Opening main workspace in new window" -ForegroundColor Cyan
    $arguments = @("--new-window", $workspaceRoot)
}

# Add performance flags (the real ones we verified earlier)
$arguments += @(
    "--disable-extensions"  # Start clean without extensions for safety
    "--no-sandbox"          # Reduce startup overhead
    "--disable-gpu-sandbox" # Faster startup
)

try {
    Write-Host "`n🚀 Launching new VS Code instance..." -ForegroundColor Yellow
    
    # Start new VS Code process
    $process = Start-Process -FilePath $vscodeExe -ArgumentList $arguments -PassThru
    
    if ($process) {
        Write-Host "✅ New VS Code instance started successfully!" -ForegroundColor Green
        Write-Host "Process ID: $($process.Id)" -ForegroundColor Gray
        
        # Wait a moment and check if it's running
        Start-Sleep -Seconds 2
        $newVSCode = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
        if ($newVSCode) {
            Write-Host "✅ Confirmed: New instance is running" -ForegroundColor Green
        }
    }
    
} catch {
    Write-Host "❌ Failed to start VS Code: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Show updated process information
Write-Host "`n📊 VS Code Instances After Launch:" -ForegroundColor Cyan
$allVSCode = Get-Process -Name "Code" -ErrorAction SilentlyContinue
if ($allVSCode) {
    $totalProcesses = $allVSCode.Count
    $totalMemory = [math]::Round(($allVSCode | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB, 1)
    Write-Host "Total processes: $totalProcesses" -ForegroundColor White
    Write-Host "Total memory: $totalMemory MB" -ForegroundColor White
    
    Write-Host "`n🎯 Process Details:" -ForegroundColor Gray
    $allVSCode | ForEach-Object {
        $memMB = [math]::Round($_.WorkingSet64 / 1MB, 1)
        $startTime = $_.StartTime.ToString("HH:mm:ss")
        Write-Host "  PID $($_.Id): $memMB MB (started $startTime)" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Success!" -ForegroundColor Green
Write-Host "Your original VS Code workspace is preserved" -ForegroundColor White
Write-Host "New instance is running as backup/testing environment" -ForegroundColor White

Write-Host "`n💡 Usage Tips:" -ForegroundColor Yellow
Write-Host "• Use new instance for testing changes" -ForegroundColor White
Write-Host "• Keep original instance for stable work" -ForegroundColor White
Write-Host "• Close new instance when done testing" -ForegroundColor White

Write-Host "`n🔄 Alternative Launch Options:" -ForegroundColor Cyan
Write-Host "• .\start-new-vscode.ps1 -NewWindow     # Empty new window" -ForegroundColor Gray
Write-Host "• .\start-new-vscode.ps1 -OpenWorkspace # Current workspace in new window" -ForegroundColor Gray
