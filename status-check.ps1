# 🔍 Quick Status Check - No Process Interference
# Simple status check without starting any new processes

Write-Host "🔍 AUTONOMOUS SYSTEM STATUS" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check Live Server
Write-Host "🌐 Live Server Status:" -ForegroundColor Yellow
$serverFound = $false
@("http://127.0.0.1:5500", "http://127.0.0.1:5173", "http://localhost:5500", "http://localhost:5173") | ForEach-Object {
    try {
        $response = Invoke-WebRequest -Uri $_ -TimeoutSec 2 -Method HEAD -ErrorAction Stop
        Write-Host "  ✅ $_" -ForegroundColor Green
        $serverFound = $true
    } catch {
        # Silent fail
    }
}
if (-not $serverFound) {
    Write-Host "  ❌ No Live Server detected" -ForegroundColor Red
}

# Check Gemini CLI
Write-Host ""
Write-Host "🤖 Gemini CLI Status:" -ForegroundColor Yellow
$geminiProcesses = Get-Process | Where-Object { $_.ProcessName -like '*gemini*' }
if ($geminiProcesses) {
    Write-Host "  ✅ Running ($($geminiProcesses.Count) process(es))" -ForegroundColor Green
    $geminiProcesses | ForEach-Object {
        Write-Host "    PID: $($_.Id), CPU: $($_.CPU.ToString('F1'))s" -ForegroundColor DarkGreen
    }
} else {
    Write-Host "  ❌ Not running" -ForegroundColor Red
}

# Check autonomous jobs
Write-Host ""
Write-Host "🔄 Autonomous Jobs:" -ForegroundColor Yellow
$jobs = Get-Job | Where-Object { $_.Name -like '*Auto*' -or $_.Name -like '*Clean*' }
if ($jobs) {
    $jobs | ForEach-Object {
        $status = if ($_.State -eq "Running") { "✅" } else { "❌" }
        Write-Host "  $status $($_.Name): $($_.State)" -ForegroundColor $(if ($_.State -eq "Running") { "Green" } else { "Red" })
    }
} else {
    Write-Host "  ❌ No autonomous jobs running" -ForegroundColor Red
}

# Check session activity
Write-Host ""
Write-Host "📁 Session Activity:" -ForegroundColor Yellow
$activityFile = ".vscode\.session\autonomous-activity.json"
if (Test-Path $activityFile) {
    try {
        $activity = Get-Content $activityFile | ConvertFrom-Json
        $activityTime = [DateTime]::Parse($activity.timestamp)
        $timeSince = (Get-Date) - $activityTime
        Write-Host "  ✅ Last activity: $($timeSince.TotalMinutes.ToString('F1')) minutes ago" -ForegroundColor Green
        Write-Host "  📊 Activity counter: $($activity.counter)" -ForegroundColor DarkGreen
    } catch {
        Write-Host "  ⚠️ Activity file corrupted" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ No activity file found" -ForegroundColor Red
}

# Check git status
Write-Host ""
Write-Host "📊 Git Status:" -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus -and $gitStatus.Trim()) {
        $changes = ($gitStatus -split "`n" | Where-Object { $_.Trim() }).Count
        Write-Host "  📝 Uncommitted changes: $changes file(s)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Working directory clean" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❓ Git status unavailable" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 SUMMARY:" -ForegroundColor Magenta
if ($serverFound -and $jobs -and ($jobs | Where-Object { $_.State -eq "Running" })) {
    Write-Host "  🎉 AUTONOMOUS MODE OPERATIONAL" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Some components may need attention" -ForegroundColor Yellow
}
