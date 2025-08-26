# 🔍 Autonomous System Status Monitor
# Check the status of all autonomous components

Write-Host "🔍 AUTONOMOUS SYSTEM STATUS" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check environment variables
Write-Host "🌱 Environment Variables:" -ForegroundColor Yellow
Write-Host "  AUTONOMOUS_MODE: $env:AUTONOMOUS_MODE"
Write-Host "  NO_PROMPTS: $env:NO_PROMPTS"
Write-Host "  AUTO_ACCEPT_ALL: $env:AUTO_ACCEPT_ALL"
Write-Host "  GEMINI_AUTO_ACCEPT: $env:GEMINI_AUTO_ACCEPT"
Write-Host ""

# Check VS Code settings
Write-Host "⚙️ VS Code Settings:" -ForegroundColor Yellow
if (Test-Path ".vscode\settings.json") {
    $settings = Get-Content ".vscode\settings.json" -Raw | ConvertFrom-Json
    $autoSave = $settings.'files.autoSave'
    $confirmCreation = $settings.'github.copilot.chat.confirmFileCreation'
    $confirmModification = $settings.'github.copilot.chat.confirmFileModification'
    
    Write-Host "  Auto-save: $autoSave"
    Write-Host "  Confirm file creation: $confirmCreation"
    Write-Host "  Confirm file modification: $confirmModification"
} else {
    Write-Host "  VS Code settings not found"
}
Write-Host ""

# Check running processes
Write-Host "🔄 Running Processes:" -ForegroundColor Yellow
$geminiProcesses = Get-Process | Where-Object { $_.ProcessName -like '*gemini*' -or $_.CommandLine -like '*gemini*' }
if ($geminiProcesses) {
    Write-Host "  ✅ Gemini CLI: Running ($($geminiProcesses.Count) process(es))"
} else {
    Write-Host "  ❌ Gemini CLI: Not running"
}

$autoSaveJob = Get-Job -Name "AutoSaveLoop" -ErrorAction SilentlyContinue
if ($autoSaveJob -and $autoSaveJob.State -eq "Running") {
    Write-Host "  ✅ Auto-save loop: Running"
} else {
    Write-Host "  ❌ Auto-save loop: Not running"
}
Write-Host ""

# Check Live Server
Write-Host "🌐 Live Server Status:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5500" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  ✅ Live Server: Running (Status: $($response.StatusCode))"
} catch {
    Write-Host "  ❌ Live Server: Not accessible"
}
Write-Host ""

# Check session files
Write-Host "📁 Session Files:" -ForegroundColor Yellow
$sessionDir = ".vscode\.session"
if (Test-Path $sessionDir) {
    $files = Get-ChildItem $sessionDir -File
    Write-Host "  📂 Session directory: Exists ($($files.Count) files)"
    
    $activityFile = "$sessionDir\last-activity.txt"
    if (Test-Path $activityFile) {
        $lastActivity = Get-Content $activityFile
        $activityTime = [DateTime]::Parse($lastActivity)
        $timeSince = (Get-Date) - $activityTime
        Write-Host "  ⏰ Last activity: $($timeSince.TotalMinutes.ToString('F1')) minutes ago"
    }
} else {
    Write-Host "  📂 Session directory: Not found"
}
Write-Host ""

# Git status
Write-Host "📊 Git Status:" -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        $changes = ($gitStatus | Measure-Object).Count
        Write-Host "  📝 Uncommitted changes: $changes file(s)"
    } else {
        Write-Host "  ✅ Working directory clean"
    }
} catch {
    Write-Host "  ❓ Git status unavailable"
}
Write-Host ""

# Overall status
Write-Host "📋 OVERALL STATUS:" -ForegroundColor Magenta
$issues = 0

if (-not $env:AUTONOMOUS_MODE) { $issues++ }
if (-not $autoSaveJob -or $autoSaveJob.State -ne "Running") { $issues++ }

if ($issues -eq 0) {
    Write-Host "  🎉 ALL SYSTEMS OPERATIONAL" -ForegroundColor Green
    Write-Host "  💤 Ready for autonomous operation" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ $issues issue(s) detected" -ForegroundColor Yellow
    Write-Host "  🔧 Run quick-autonomous.ps1 to fix" -ForegroundColor Yellow
}
