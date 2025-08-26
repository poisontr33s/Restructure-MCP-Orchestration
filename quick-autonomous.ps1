# 🌑💤 Quick Autonomous Startup - Anti-[Keep] Prompt System
# Eliminates all prompts and maintains continuous operation for sleep cycles

param()

Write-Host "🌑💤 QUICK AUTONOMOUS STARTUP" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Set anti-prompt environment
$env:AUTONOMOUS_MODE = 'true'
$env:NO_PROMPTS = 'true'
$env:AUTO_ACCEPT_ALL = 'true'
$env:GEMINI_AUTO_ACCEPT = 'true'
$env:CLAUDE_AUTO_ACCEPT = 'true'
$env:Path = "C:\Users\erdno\.local\bin;$env:Path"

Write-Host "🚀 Environment set for no-prompt operation" -ForegroundColor Green

# Ensure VS Code settings are configured for auto-save
$VSCodeSettings = @"
{
    "files.autoSave": "onFocusChange",
    "files.autoSaveDelay": 1000,
    "workbench.editor.autoSave": true,
    "github.copilot.chat.confirmFileCreation": false,
    "github.copilot.chat.confirmFileDelete": false,
    "github.copilot.chat.confirmFileModification": false,
    "claude.autoAcceptEdits": true,
    "claude.confirmActions": false,
    "geminiIde.autoAccept": true,
    "geminiIde.confirmActions": false,
    "terminal.integrated.confirmOnExit": "never",
    "terminal.integrated.confirmOnKill": "never"
}
"@

$SettingsPath = ".vscode\settings.json"
if (Test-Path $SettingsPath) {
    try {
        $CurrentSettings = Get-Content $SettingsPath -Raw | ConvertFrom-Json
        $NewSettings = $VSCodeSettings | ConvertFrom-Json
        
        # Merge settings by adding new properties
        $NewSettings.PSObject.Properties | ForEach-Object {
            if ($CurrentSettings.PSObject.Properties.Name -contains $_.Name) {
                $CurrentSettings.($_.Name) = $_.Value
            } else {
                $CurrentSettings | Add-Member -MemberType NoteProperty -Name $_.Name -Value $_.Value
            }
        }
        
        $CurrentSettings | ConvertTo-Json -Depth 4 | Set-Content $SettingsPath -Encoding UTF8
    } catch {
        # If merging fails, just write the new settings
        $VSCodeSettings | Set-Content $SettingsPath -Encoding UTF8
    }
} else {
    # Create directory if it doesn't exist
    $VSCodeDir = Split-Path $SettingsPath -Parent
    if (-not (Test-Path $VSCodeDir)) {
        New-Item -ItemType Directory -Path $VSCodeDir -Force | Out-Null
    }
    $VSCodeSettings | Set-Content $SettingsPath -Encoding UTF8
}

Write-Host "💾 VS Code configured for auto-save and no prompts" -ForegroundColor Green

# Start Gemini CLI in background with auto-accept
Write-Host "🤖 Starting Gemini CLI in autonomous mode..." -ForegroundColor Yellow

Start-Process -FilePath "pwsh" -ArgumentList @(
    "-NoProfile", 
    "-Command", 
    "gemini --ide-mode-feature --include-directories packages,scripts,docs,.vscode,agent --auto-accept"
) -NoNewWindow -PassThru

Write-Host "✅ Gemini CLI started in background" -ForegroundColor Green

# Start Live Server to maintain web connection
Write-Host "🌐 Starting Live Server..." -ForegroundColor Yellow

try {
    Start-Process -FilePath "code" -ArgumentList "--command liveServer.start" -NoNewWindow
    Write-Host "✅ Live Server started" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Live Server start failed, continuing..." -ForegroundColor Yellow
}

# Start auto-save loop
Write-Host "💾 Starting continuous auto-save..." -ForegroundColor Yellow

$AutoSaveScript = {
    while ($true) {
        try {
            # Force save all files
            code --command workbench.action.files.saveAll 2>$null
            
            # Save session snapshot
            pwsh -NoProfile -File ".vscode\scripts\save-mcp-snapshot.ps1" 2>$null
            
            # Auto-commit if changes exist
            $gitStatus = git status --porcelain 2>$null
            if ($gitStatus) {
                git add . 2>$null
                git commit -m "🤖 Auto-save: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 2>$null
            }
            
            # Update activity timestamp
            $activityDir = ".vscode\.session"
            if (-not (Test-Path $activityDir)) {
                New-Item -ItemType Directory -Path $activityDir -Force | Out-Null
            }
            [System.DateTime]::Now.ToString('o') | Set-Content "$activityDir\last-activity.txt"
            
        } catch {
            # Continue silently on errors
        }
        
        Start-Sleep -Seconds 30  # Auto-save every 30 seconds
    }
}

# Start auto-save in background job
Start-Job -ScriptBlock $AutoSaveScript -Name "AutoSaveLoop" | Out-Null

Write-Host "✅ Auto-save loop active (every 30 seconds)" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 AUTONOMOUS MODE ACTIVE" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta
Write-Host "🌙 Ready for sleep cycle - no [Keep] prompts will appear" -ForegroundColor Green
Write-Host "💾 Auto-save every 30 seconds" -ForegroundColor Green
Write-Host "🤖 Gemini CLI running autonomously" -ForegroundColor Green
Write-Host "🌐 Live Server maintaining connections" -ForegroundColor Green
Write-Host "🔄 Git auto-commit on changes" -ForegroundColor Green
Write-Host ""
Write-Host "💤 System will run autonomously - sleep tight!" -ForegroundColor Cyan

# Keep script running to maintain the auto-save job
Write-Host "Press Ctrl+C to stop autonomous mode..." -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 60
        
        # Check if auto-save job is still running
        $job = Get-Job -Name "AutoSaveLoop" -ErrorAction SilentlyContinue
        if (-not $job -or $job.State -eq "Failed") {
            Write-Host "🔄 Restarting auto-save job..." -ForegroundColor Yellow
            Start-Job -ScriptBlock $AutoSaveScript -Name "AutoSaveLoop" | Out-Null
        }
        
        Write-Host "💓 Autonomous heartbeat - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor DarkGreen
    }
} finally {
    # Cleanup on exit
    Get-Job -Name "AutoSaveLoop" -ErrorAction SilentlyContinue | Stop-Job -PassThru | Remove-Job
    Write-Host "🛑 Autonomous mode stopped" -ForegroundColor Red
}
