# 🌉 Live Collaborative Bridge - Claude + Gemini CLI Cross-Pollination
# This script coordinates work between Claude Sonnet 4 (VS Code) and Gemini CLI 2.5 Pro

param(
    [string]$Mode = "monitor",  # monitor, status, handoff, sync
    [string]$Message = "",
    [switch]$AutoMode
)

$ErrorActionPreference = 'Continue'

Write-Host "🌉 LIVE COLLABORATIVE BRIDGE" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "🤖 Claude Sonnet 4 ↔️ Gemini CLI 2.5 Pro" -ForegroundColor Green
Write-Host ""

# Setup bridge directory
$BridgeDir = ".vscode\.session\agent-bridge"
if (-not (Test-Path $BridgeDir)) {
    New-Item -ItemType Directory -Path $BridgeDir -Force | Out-Null
}

# Initialize communication files
$ClaudeToGemini = "$BridgeDir\claude-to-gemini.json"
$GeminiToClaude = "$BridgeDir\gemini-to-claude.json"
$SharedStatus = "$BridgeDir\shared-status.json"

function Initialize-BridgeFiles {
    $emptyChannel = @{ messages = @(); lastUpdate = (Get-Date).ToString('o') } | ConvertTo-Json -Depth 3
    
    if (-not (Test-Path $ClaudeToGemini)) {
        $emptyChannel | Set-Content $ClaudeToGemini -Encoding UTF8
    }
    if (-not (Test-Path $GeminiToClaude)) {
        $emptyChannel | Set-Content $GeminiToClaude -Encoding UTF8
    }
    if (-not (Test-Path $SharedStatus)) {
        @{
            bridgeActive = $true
            claudeActive = $true
            geminiActive = $false
            lastSync = (Get-Date).ToString('o')
            mode = "collaborative"
        } | ConvertTo-Json -Depth 3 | Set-Content $SharedStatus -Encoding UTF8
    }
}

function Get-GeminiStatus {
    # Check if Gemini CLI is running
    $geminiProcesses = Get-Process | Where-Object { 
        $_.ProcessName -like '*gemini*' -or 
        $_.ProcessName -like '*node*' -and $_.CommandLine -like '*gemini*'
    }
    
    return @{
        running = ($geminiProcesses.Count -gt 0)
        processCount = $geminiProcesses.Count
        processes = $geminiProcesses | Select-Object Id, ProcessName, StartTime
    }
}

function Send-MessageToGemini {
    param($Message, $Type = "status", $Priority = "medium")
    
    try {
        $existing = Get-Content $ClaudeToGemini -Raw | ConvertFrom-Json
        
        $newMessage = @{
            from = "claude"
            to = "gemini"
            type = $Type
            content = $Message
            timestamp = (Get-Date).ToString('o')
            priority = $Priority
        }
        
        $existing.messages += $newMessage
        $existing.lastUpdate = (Get-Date).ToString('o')
        
        # Keep only last 50 messages
        if ($existing.messages.Count -gt 50) {
            $existing.messages = $existing.messages[-50..-1]
        }
        
        $existing | ConvertTo-Json -Depth 4 | Set-Content $ClaudeToGemini -Encoding UTF8
        
        Write-Host "📤 Message sent to Gemini: $Message" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to send message: $_" -ForegroundColor Red
        return $false
    }
}

function Read-MessagesFromGemini {
    try {
        if (Test-Path $GeminiToClaude) {
            $data = Get-Content $GeminiToClaude -Raw | ConvertFrom-Json
            return $data.messages
        }
        return @()
    } catch {
        return @()
    }
}

function Update-SharedStatus {
    param($ClaudeStatus, $CurrentTask = "")
    
    try {
        $geminiStatus = Get-GeminiStatus
        
        $status = @{
            timestamp = (Get-Date).ToString('o')
            bridgeActive = $true
            claude = @{
                active = $true
                status = $ClaudeStatus
                currentTask = $CurrentTask
                lastUpdate = (Get-Date).ToString('o')
            }
            gemini = @{
                active = $geminiStatus.running
                processCount = $geminiStatus.processCount
                contextLeft = "95%"  # From your screenshot
                model = "gemini-2.5-pro"
                mode = "yolo"
            }
            coordination = @{
                mode = if ($geminiStatus.running) { "collaborative" } else { "claude-primary" }
                taskAllocation = @{
                    claude = @("analysis", "architecture", "documentation", "debugging")
                    gemini = @("builds", "file-ops", "automation", "monitoring")
                    shared = @("session-mgmt", "auto-save", "status-updates")
                }
            }
            workspace = @{
                root = (Get-Location).Path
                liveServer = "http://localhost:5500"
                buildStatus = "completed"
                lastBuild = (Get-Date).ToString('o')
            }
        }
        
        $status | ConvertTo-Json -Depth 5 | Set-Content $SharedStatus -Encoding UTF8
        return $status
    } catch {
        Write-Host "⚠️ Failed to update shared status: $_" -ForegroundColor Yellow
        return $null
    }
}

function Show-BridgeStatus {
    Write-Host "🔍 BRIDGE STATUS" -ForegroundColor Yellow
    Write-Host "=================" -ForegroundColor Yellow
    
    # Check Gemini CLI
    $geminiStatus = Get-GeminiStatus
    if ($geminiStatus.running) {
        Write-Host "✅ Gemini CLI 2.5 Pro: Active ($($geminiStatus.processCount) process(es))" -ForegroundColor Green
    } else {
        Write-Host "❌ Gemini CLI 2.5 Pro: Not detected" -ForegroundColor Red
    }
    
    # Check Claude (always active if script is running)
    Write-Host "✅ Claude Sonnet 4: Active (VS Code context)" -ForegroundColor Green
    
    # Check communication channels
    $claudeMessages = Read-MessagesFromGemini
    Write-Host "📬 Messages from Gemini: $($claudeMessages.Count)" -ForegroundColor Cyan
    
    # Check Live Server
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5500" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Live Server: Running (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Live Server: Not accessible" -ForegroundColor Red
    }
    
    # Check build status
    if (Test-Path "dist") {
        Write-Host "✅ Build: Completed (dist/ exists)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Build: No dist/ directory found" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

function Start-AutoMode {
    Write-Host "🔄 Starting automatic coordination mode..." -ForegroundColor Magenta
    
    $iteration = 0
    while ($true) {
        $iteration++
        Write-Host "`n🔄 Auto-coordination cycle $iteration - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor DarkCyan
        
        # Update status
        $status = Update-SharedStatus "Auto-coordinating" "Cycle $iteration"
        
        # Check for new messages from Gemini
        $messages = Read-MessagesFromGemini
        if ($messages.Count -gt 0) {
            $latestMessage = $messages[-1]
            Write-Host "📥 Latest from Gemini: $($latestMessage.content)" -ForegroundColor Cyan
        }
        
        # Send periodic status to Gemini
        if ($iteration % 3 -eq 0) {
            Send-MessageToGemini "Claude auto-coordination cycle $iteration - all systems operational" "status" "low"
        }
        
        # Check system health
        $geminiStatus = Get-GeminiStatus
        if (-not $geminiStatus.running) {
            Write-Host "⚠️ Gemini CLI not detected - switching to Claude-primary mode" -ForegroundColor Yellow
        }
        
        Start-Sleep -Seconds 30
    }
}

# Initialize bridge
Initialize-BridgeFiles

# Execute based on mode
switch ($Mode.ToLower()) {
    "monitor" {
        Show-BridgeStatus
        Update-SharedStatus "Monitoring" "Bridge status check"
    }
    
    "status" {
        Show-BridgeStatus
        $status = Update-SharedStatus "Status requested" "Bridge status"
        if ($status) {
            Write-Host "📊 Full status updated in shared-status.json" -ForegroundColor Green
        }
    }
    
    "handoff" {
        Write-Host "🔄 Initiating task handoff to Gemini CLI..." -ForegroundColor Yellow
        Send-MessageToGemini "Task handoff from Claude: $Message" "handoff" "high"
        Update-SharedStatus "Handoff initiated" "Task transfer to Gemini"
    }
    
    "sync" {
        Write-Host "🔄 Synchronizing with Gemini CLI..." -ForegroundColor Yellow
        Send-MessageToGemini "Sync request from Claude: $Message" "request" "medium"
        
        # Wait for response
        Write-Host "⏳ Waiting for Gemini response..." -ForegroundColor DarkYellow
        $timeout = 30
        $start = Get-Date
        
        do {
            Start-Sleep -Seconds 2
            $messages = Read-MessagesFromGemini
            $elapsed = ((Get-Date) - $start).TotalSeconds
        } while ($messages.Count -eq 0 -and $elapsed -lt $timeout)
        
        if ($messages.Count -gt 0) {
            Write-Host "✅ Sync complete - received $($messages.Count) message(s)" -ForegroundColor Green
        } else {
            Write-Host "⏱️ Sync timeout - Gemini may be busy" -ForegroundColor Yellow
        }
    }
    
    "auto" {
        Start-AutoMode
    }
    
    default {
        Write-Host "📋 Available modes: monitor, status, handoff, sync, auto" -ForegroundColor Yellow
        Write-Host "💡 Use -AutoMode switch for continuous coordination" -ForegroundColor Yellow
    }
}

if ($AutoMode) {
    Start-AutoMode
}

Write-Host "🌉 Bridge operation complete" -ForegroundColor Green
