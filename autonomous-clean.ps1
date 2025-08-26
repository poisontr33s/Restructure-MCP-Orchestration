# 🌑💤 Clean Autonomous Mode - No Window Spam Edition
# Fixed version that prevents VS Code window popups and uses correct server address

param()

Write-Host "🌑💤 CLEAN AUTONOMOUS MODE" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Set environment variables for autonomous operation
$env:AUTONOMOUS_MODE = 'true'
$env:NO_PROMPTS = 'true'
$env:AUTO_ACCEPT_ALL = 'true'
$env:GEMINI_AUTO_ACCEPT = 'true'
$env:CLAUDE_AUTO_ACCEPT = 'true'
$env:Path = "C:\Users\erdno\.local\bin;$env:Path"

Write-Host "🚀 Environment configured for autonomous operation" -ForegroundColor Green

# Check Live Server status (don't start new windows)
Write-Host "🌐 Checking Live Server..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "http://127.0.0.1:5500" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  ✅ Live Server running on http://127.0.0.1:5500" -ForegroundColor Green
    $LiveServerUrl = "http://127.0.0.1:5500"
} catch {
    try {
        $null = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "  ✅ Live Server running on http://127.0.0.1:5173" -ForegroundColor Green
        $LiveServerUrl = "http://127.0.0.1:5173"
    } catch {
        Write-Host "  ⚠️ No Live Server detected" -ForegroundColor Yellow
        $LiveServerUrl = $null
    }
}

# Check Gemini CLI status (don't start if already running)
Write-Host "🤖 Checking Gemini CLI..." -ForegroundColor Yellow
$GeminiProcesses = Get-Process | Where-Object { $_.ProcessName -like '*gemini*' -or $_.CommandLine -like '*gemini*' }
if ($GeminiProcesses) {
    Write-Host "  ✅ Gemini CLI already running ($($GeminiProcesses.Count) process(es))" -ForegroundColor Green
} else {
    Write-Host "  ℹ️ Gemini CLI not detected" -ForegroundColor Yellow
}

# Clean Auto-Save Loop (no VS Code commands that spawn windows)
Write-Host "💾 Starting clean auto-save loop..." -ForegroundColor Yellow

$CleanAutoSaveScript = {
    param($ServerUrl)
    
    $counter = 0
    while ($true) {
        try {
            $counter++
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Update activity file
            $activityDir = ".vscode\.session"
            if (-not (Test-Path $activityDir)) {
                New-Item -ItemType Directory -Path $activityDir -Force | Out-Null
            }
            
            $activityData = @{
                timestamp = $timestamp
                counter = $counter
                serverUrl = $ServerUrl
                autonomous = $true
            }
            
            $activityData | ConvertTo-Json | Set-Content "$activityDir\autonomous-activity.json" -Force
            
            # Silent git operations
            try {
                $gitStatus = git status --porcelain 2>$null
                if ($gitStatus -and $gitStatus.Trim()) {
                    git add . 2>$null | Out-Null
                    git commit -m "🤖 Clean auto-save: $timestamp" 2>$null | Out-Null
                }
            } catch { }
            
            # Keep-alive ping to server (if available)
            if ($ServerUrl) {
                try {
                    Invoke-WebRequest -Uri "$ServerUrl" -TimeoutSec 2 -Method HEAD -ErrorAction SilentlyContinue | Out-Null
                } catch { }
            }
            
            # Save MCP snapshot (silent)
            try {
                if (Test-Path ".vscode\scripts\save-mcp-snapshot.ps1") {
                    pwsh -NoProfile -File ".vscode\scripts\save-mcp-snapshot.ps1" 2>$null | Out-Null
                }
            } catch { }
            
        } catch {
            # Continue silently on any errors
        }
        
        Start-Sleep -Seconds 90  # Every 90 seconds for lighter operation
    }
}

# Start the clean auto-save job
$job = Start-Job -ScriptBlock $CleanAutoSaveScript -ArgumentList $LiveServerUrl -Name "CleanAutoSave"

Write-Host "✅ Clean auto-save loop started (every 90 seconds)" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 CLEAN AUTONOMOUS MODE ACTIVE" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Magenta
Write-Host "🌙 No VS Code window spam" -ForegroundColor Green
Write-Host "💾 Clean auto-save every 90 seconds" -ForegroundColor Green
Write-Host "🌐 Live Server: $($LiveServerUrl ?? 'Not detected')" -ForegroundColor Green
Write-Host "🤖 Gemini CLI: $(if ($GeminiProcesses) { 'Running' } else { 'Not detected' })" -ForegroundColor Green
Write-Host "🔄 Git auto-commit on changes" -ForegroundColor Green
Write-Host ""
Write-Host "💤 Clean autonomous mode ready - no window popups!" -ForegroundColor Cyan

# Monitor loop (much lighter)
Write-Host "Press Ctrl+C to stop autonomous mode..." -ForegroundColor Yellow
try {
    $heartbeatCounter = 0
    while ($true) {
        Start-Sleep -Seconds 300  # Check every 5 minutes
        $heartbeatCounter++
        
        # Check if job is still running
        $currentJob = Get-Job -Name "CleanAutoSave" -ErrorAction SilentlyContinue
        if (-not $currentJob -or $currentJob.State -ne "Running") {
            Write-Host "🔄 Restarting clean auto-save job..." -ForegroundColor Yellow
            $job = Start-Job -ScriptBlock $CleanAutoSaveScript -ArgumentList $LiveServerUrl -Name "CleanAutoSave"
        }
        
        # Light heartbeat
        $timestamp = Get-Date -Format 'HH:mm:ss'
        Write-Host "💓 Clean autonomous heartbeat #$heartbeatCounter - $timestamp" -ForegroundColor DarkGreen
        
        # Quick status check
        if ($heartbeatCounter % 4 -eq 0) {  # Every 20 minutes
            Write-Host "📊 Status check..." -ForegroundColor DarkCyan
            if ($LiveServerUrl) {
                try {
                    $null = Invoke-WebRequest -Uri $LiveServerUrl -TimeoutSec 3 -Method HEAD
                    Write-Host "  ✅ Live Server still responsive" -ForegroundColor DarkGreen
                } catch {
                    Write-Host "  ⚠️ Live Server not responding" -ForegroundColor DarkYellow
                }
            }
        }
    }
} finally {
    # Cleanup on exit
    Get-Job -Name "CleanAutoSave" -ErrorAction SilentlyContinue | Stop-Job -PassThru | Remove-Job
    Write-Host ""
    Write-Host "🛑 Clean autonomous mode stopped" -ForegroundColor Red
    Write-Host "📊 Final activity saved in .vscode\.session\autonomous-activity.json" -ForegroundColor Yellow
}
