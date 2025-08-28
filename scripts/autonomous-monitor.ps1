# 🚨 AUTONOMOUS ORCHESTRATION MONITOR
# Real-time monitoring and emergency controls for the autonomous system
#
# Usage: ./scripts/autonomous-monitor.ps1 [-LogDir "autonomous-logs"] [-EmergencyStop]

[CmdletBinding()]
param(
    [Parameter(HelpMessage = "Log directory to monitor")]
    [string]$LogDir = "autonomous-logs",
    
    [Parameter(HelpMessage = "Send emergency stop signal")]
    [switch]$EmergencyStop,
    
    [Parameter(HelpMessage = "Show real-time tail of logs")]
    [switch]$Tail,
    
    [Parameter(HelpMessage = "Generate status report")]
    [switch]$Status
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

# === EMERGENCY STOP MECHANISM ===
if ($EmergencyStop) {
    Write-Host "🚨 EMERGENCY STOP INITIATED" -ForegroundColor Red
    
    # Create emergency stop file
    $stopFile = Join-Path $LogDir "EMERGENCY_STOP"
    "Emergency stop requested at $(Get-Date)" | Out-File $stopFile
    
    # Try to gracefully stop autonomous processes
    $autonomousProcesses = Get-Process -Name "pwsh", "powershell" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*autonomous*" }
    
    foreach ($proc in $autonomousProcesses) {
        Write-Host "🛑 Stopping autonomous process $($proc.Id)" -ForegroundColor Yellow
        try {
            $proc.CloseMainWindow()
            Start-Sleep -Seconds 5
            if (-not $proc.HasExited) {
                $proc.Kill()
            }
        }
        catch {
            Write-Host "⚠️ Could not stop process $($proc.Id): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "✅ Emergency stop complete" -ForegroundColor Green
    exit 0
}

# === STATUS REPORTING ===
if ($Status) {
    Write-Host "📊 AUTONOMOUS ORCHESTRATION STATUS" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    
    if (-not (Test-Path $LogDir)) {
        Write-Host "❌ No log directory found: $LogDir" -ForegroundColor Red
        exit 1
    }
    
    # Check for running processes
    $autonomousProcesses = Get-Process -Name "pwsh", "powershell" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*autonomous*" }
    
    Write-Host "`n🤖 Active Processes: $($autonomousProcesses.Count)" -ForegroundColor White
    foreach ($proc in $autonomousProcesses) {
        $runtime = (Get-Date) - $proc.StartTime
        Write-Host "  - PID $($proc.Id): Running for $([math]::Round($runtime.TotalHours, 1))h" -ForegroundColor Gray
    }
    
    # Check log files
    $logFiles = Get-ChildItem $LogDir -Filter "*.log" | Sort-Object LastWriteTime -Descending
    Write-Host "`n📄 Recent Log Files:" -ForegroundColor White
    foreach ($log in $logFiles | Select-Object -First 5) {
        $age = (Get-Date) - $log.LastWriteTime
        $sizeKB = [math]::Round($log.Length / 1KB, 1)
        Write-Host "  - $($log.Name) ($($sizeKB)KB, $([math]::Round($age.TotalMinutes, 0))m ago)" -ForegroundColor Gray
    }
    
    # Check for emergency stop
    $stopFile = Join-Path $LogDir "EMERGENCY_STOP"
    if (Test-Path $stopFile) {
        Write-Host "`n🚨 EMERGENCY STOP ACTIVE" -ForegroundColor Red
        $stopTime = Get-Content $stopFile | Select-Object -First 1
        Write-Host "  $stopTime" -ForegroundColor Red
    }
    
    # Recent activity summary
    $masterLog = Get-ChildItem $LogDir -Filter "master-orchestrator-*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($masterLog) {
        Write-Host "`n📈 Recent Activity:" -ForegroundColor White
        $recentLines = Get-Content $masterLog.FullName | Select-Object -Last 10
        foreach ($line in $recentLines) {
            if ($line -match '\[(ERROR|WARN)\]') {
                Write-Host "  $line" -ForegroundColor Red
            }
            elseif ($line -match '\[SUCCESS\]') {
                Write-Host "  $line" -ForegroundColor Green
            }
            else {
                Write-Host "  $line" -ForegroundColor Gray
            }
        }
    }
    
    exit 0
}

# === REAL-TIME LOG MONITORING ===
if ($Tail) {
    Write-Host "👁️ REAL-TIME LOG MONITORING" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Gray
    Write-Host ""
    
    $masterLog = Get-ChildItem $LogDir -Filter "master-orchestrator-*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if (-not $masterLog) {
        Write-Host "❌ No master orchestrator log found in $LogDir" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📄 Monitoring: $($masterLog.Name)" -ForegroundColor White
    Write-Host ""
    
    # Show last few lines first
    $existingLines = Get-Content $masterLog.FullName
    foreach ($line in ($existingLines | Select-Object -Last 5)) {
        if ($line -match '\[(ERROR|WARN)\]') {
            Write-Host $line -ForegroundColor Red
        }
        elseif ($line -match '\[SUCCESS\]') {
            Write-Host $line -ForegroundColor Green
        }
        elseif ($line -match '\[PHASE\]') {
            Write-Host $line -ForegroundColor Magenta
        }
        elseif ($line -match '\[DECISION\]') {
            Write-Host $line -ForegroundColor Cyan
        }
        else {
            Write-Host $line -ForegroundColor White
        }
    }
    
    # Monitor for new lines
    $lastPosition = (Get-Item $masterLog.FullName).Length
    
    while ($true) {
        Start-Sleep -Seconds 2
        
        try {
            $currentLength = (Get-Item $masterLog.FullName).Length
            if ($currentLength -gt $lastPosition) {
                $stream = [System.IO.File]::OpenRead($masterLog.FullName)
                $stream.Seek($lastPosition, [System.IO.SeekOrigin]::Begin) | Out-Null
                $reader = New-Object System.IO.StreamReader($stream)
                
                while ($line = $reader.ReadLine()) {
                    if ($line -match '\[(ERROR|WARN)\]') {
                        Write-Host $line -ForegroundColor Red
                    }
                    elseif ($line -match '\[SUCCESS\]') {
                        Write-Host $line -ForegroundColor Green
                    }
                    elseif ($line -match '\[PHASE\]') {
                        Write-Host $line -ForegroundColor Magenta
                    }
                    elseif ($line -match '\[DECISION\]') {
                        Write-Host $line -ForegroundColor Cyan
                    }
                    else {
                        Write-Host $line -ForegroundColor White
                    }
                }
                
                $reader.Close()
                $stream.Close()
                $lastPosition = $currentLength
            }
        }
        catch {
            Write-Host "⚠️ Error reading log file: $($_.Exception.Message)" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
        
        # Check for emergency stop
        $stopFile = Join-Path $LogDir "EMERGENCY_STOP"
        if (Test-Path $stopFile) {
            Write-Host "`n🚨 EMERGENCY STOP DETECTED - Monitoring stopped" -ForegroundColor Red
            break
        }
    }
    
    exit 0
}

# === DEFAULT: QUICK STATUS ===
Write-Host "🔍 Autonomous Orchestration Monitor" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available commands:" -ForegroundColor White
Write-Host "  -Status          Show detailed status report" -ForegroundColor Gray
Write-Host "  -Tail            Monitor logs in real-time" -ForegroundColor Gray
Write-Host "  -EmergencyStop   Stop all autonomous processes" -ForegroundColor Gray
Write-Host ""

if (Test-Path $LogDir) {
    $autonomousProcesses = Get-Process -Name "pwsh", "powershell" -ErrorAction SilentlyContinue | 
        Where-Object { $_.CommandLine -like "*autonomous*" }
    
    if ($autonomousProcesses.Count -gt 0) {
        Write-Host "✅ Autonomous system is RUNNING ($($autonomousProcesses.Count) processes)" -ForegroundColor Green
    } else {
        Write-Host "⏸️ Autonomous system is STOPPED" -ForegroundColor Yellow
    }
    
    $stopFile = Join-Path $LogDir "EMERGENCY_STOP"
    if (Test-Path $stopFile) {
        Write-Host "🚨 Emergency stop is ACTIVE" -ForegroundColor Red
    }
} else {
    Write-Host "❌ No log directory found: $LogDir" -ForegroundColor Red
}
