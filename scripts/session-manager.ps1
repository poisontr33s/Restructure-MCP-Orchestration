# VS CODE SESSION MANAGER - Manage multiple session clones
# List, restore, and clean up session backups

param(
    [ValidateSet("list", "restore", "clean", "create")]
    [string]$Action = "list",
    [string]$SessionId = "",
    [switch]$Interactive,
    [int]$KeepLast = 5
)

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot

Write-Host "🎭 VS Code Session Manager" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta

function Get-SessionBackups {
    $backups = @()
    
    # Find session backup directories
    $backupDirs = Get-ChildItem -Path $WorkspaceRoot -Directory -Filter "session-backup-*" | Sort-Object LastWriteTime -Descending
    foreach ($dir in $backupDirs) {
        $timestamp = $dir.Name -replace "session-backup-", ""
        $restoreGuide = "$($dir.FullName)\RESTORATION_GUIDE.md"
        $workspaceFiles = Get-ChildItem -Path $WorkspaceRoot -Filter "session-clone-$timestamp.code-workspace"
        $launchScripts = Get-ChildItem -Path "$WorkspaceRoot\scripts" -Filter "launch-cloned-session-$timestamp.ps1" -ErrorAction SilentlyContinue
        
        $backups += [PSCustomObject]@{
            Id = $timestamp
            Path = $dir.FullName
            Created = $dir.LastWriteTime
            Size = "{0:N2} MB" -f ((Get-ChildItem $dir.FullName -Recurse -File | Measure-Object Length -Sum).Sum / 1MB)
            HasWorkspace = $workspaceFiles.Count -gt 0
            HasLaunchScript = $launchScripts.Count -gt 0
            HasRestoreGuide = Test-Path $restoreGuide
            WorkspaceFile = if ($workspaceFiles) { $workspaceFiles[0].FullName } else { $null }
            LaunchScript = if ($launchScripts) { $launchScripts[0].FullName } else { $null }
        }
    }
    
    # Find quick session files
    $quickSessions = Get-ChildItem -Path $WorkspaceRoot -Filter "quick-session-*.code-workspace" | Sort-Object LastWriteTime -Descending
    foreach ($workspace in $quickSessions) {
        $timestamp = $workspace.Name -replace "quick-session-|\.code-workspace", ""
        $launchScript = "$WorkspaceRoot\scripts\quick-launch-$timestamp.ps1"
        $reference = "$WorkspaceRoot\QUICK-SESSION-$timestamp.md"
        
        $backups += [PSCustomObject]@{
            Id = $timestamp
            Path = $workspace.DirectoryName
            Created = $workspace.LastWriteTime
            Size = "{0:N2} KB" -f ($workspace.Length / 1KB)
            HasWorkspace = $true
            HasLaunchScript = Test-Path $launchScript
            HasRestoreGuide = Test-Path $reference
            WorkspaceFile = $workspace.FullName
            LaunchScript = if (Test-Path $launchScript) { $launchScript } else { $null }
            Type = "Quick"
        }
    }
    
    return $backups | Sort-Object Created -Descending
}

function Show-SessionList {
    $sessions = Get-SessionBackups
    
    if (-not $sessions) {
        Write-Host "📭 No session backups found" -ForegroundColor Yellow
        return
    }
    
    Write-Host ""
    Write-Host "📚 Available Session Backups:" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan
    
    $index = 1
    foreach ($session in $sessions) {
        $type = if ($session.Type -eq "Quick") { " [QUICK]" } else { " [FULL]" }
        $status = @()
        if ($session.HasWorkspace) { $status += "✅ Workspace" }
        if ($session.HasLaunchScript) { $status += "🚀 Script" }
        if ($session.HasRestoreGuide) { $status += "📖 Guide" }
        
        Write-Host ""
        Write-Host "$index. Session $($session.Id)$type" -ForegroundColor White
        Write-Host "   📅 Created: $($session.Created)" -ForegroundColor Gray
        Write-Host "   💾 Size: $($session.Size)" -ForegroundColor Gray
        Write-Host "   🔧 Status: $($status -join ', ')" -ForegroundColor Gray
        
        $index++
    }
    
    Write-Host ""
    Write-Host "💡 Usage:" -ForegroundColor Yellow
    Write-Host "   Restore: .\session-manager.ps1 -Action restore -SessionId YYYYMMDD-HHMMSS" -ForegroundColor White
    Write-Host "   Interactive: .\session-manager.ps1 -Action restore -Interactive" -ForegroundColor White
}

function Restore-Session {
    param([string]$Id)
    
    $sessions = Get-SessionBackups
    
    if ($Interactive -and -not $Id) {
        Show-SessionList
        Write-Host ""
        $choice = Read-Host "Enter session number or ID to restore"
        
        if ($choice -match "^\d+$") {
            $sessionIndex = [int]$choice - 1
            if ($sessionIndex -ge 0 -and $sessionIndex -lt $sessions.Count) {
                $session = $sessions[$sessionIndex]
                $Id = $session.Id
            } else {
                throw "Invalid session number: $choice"
            }
        } else {
            $Id = $choice
        }
    }
    
    if (-not $Id) {
        throw "Session ID required. Use -Interactive or provide -SessionId"
    }
    
    $session = $sessions | Where-Object { $_.Id -eq $Id }
    if (-not $session) {
        throw "Session not found: $Id"
    }
    
    Write-Host "🔄 Restoring session: $Id" -ForegroundColor Green
    
    if ($session.LaunchScript -and (Test-Path $session.LaunchScript)) {
        Write-Host "🚀 Executing launch script..." -ForegroundColor Blue
        & $session.LaunchScript
    } elseif ($session.WorkspaceFile -and (Test-Path $session.WorkspaceFile)) {
        Write-Host "📁 Opening workspace file..." -ForegroundColor Blue
        Start-Process "code" -ArgumentList "--new-window", $session.WorkspaceFile
    } else {
        throw "No valid restoration method found for session $Id"
    }
    
    Write-Host "✅ Session restored!" -ForegroundColor Green
}

function Remove-OldSessions {
    param([int]$Keep)
    
    Write-Host "🧹 Cleaning up old sessions (keeping last $Keep)..." -ForegroundColor Yellow
    
    $sessions = Get-SessionBackups
    $toDelete = $sessions | Skip $Keep
    
    if (-not $toDelete) {
        Write-Host "✅ No sessions to clean up" -ForegroundColor Green
        return
    }
    
    Write-Host "📝 Sessions to delete:" -ForegroundColor Yellow
    foreach ($session in $toDelete) {
        Write-Host "   - $($session.Id) ($($session.Created))" -ForegroundColor Gray
    }
    
    $confirm = Read-Host "Continue? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
        return
    }
    
    foreach ($session in $toDelete) {
        try {
            # Remove backup directory
            if ($session.Path -and $session.Path.Contains("session-backup-") -and (Test-Path $session.Path)) {
                Remove-Item $session.Path -Recurse -Force
                Write-Host "🗑️ Deleted backup: $($session.Id)" -ForegroundColor Gray
            }
            
            # Remove workspace file
            if ($session.WorkspaceFile -and (Test-Path $session.WorkspaceFile)) {
                Remove-Item $session.WorkspaceFile -Force
            }
            
            # Remove launch script
            if ($session.LaunchScript -and (Test-Path $session.LaunchScript)) {
                Remove-Item $session.LaunchScript -Force
            }
            
            # Remove quick session reference
            $quickRef = "$WorkspaceRoot\QUICK-SESSION-$($session.Id).md"
            if (Test-Path $quickRef) {
                Remove-Item $quickRef -Force
            }
            
        } catch {
            Write-Host "⚠️ Error deleting session $($session.Id): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "✅ Cleanup complete!" -ForegroundColor Green
}

function New-SessionBackup {
    Write-Host "🎯 Creating new session backup..." -ForegroundColor Blue
    
    $cloneScript = "$WorkspaceRoot\scripts\clone-vscode-session.ps1"
    if (-not (Test-Path $cloneScript)) {
        throw "Clone script not found: $cloneScript"
    }
    
    & $cloneScript -OpenInNewWindow:$false
}

# Main execution
try {
    switch ($Action.ToLower()) {
        "list" {
            Show-SessionList
        }
        "restore" {
            Restore-Session -Id $SessionId
        }
        "clean" {
            Remove-OldSessions -Keep $KeepLast
        }
        "create" {
            New-SessionBackup
        }
        default {
            throw "Unknown action: $Action"
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📖 Usage:" -ForegroundColor Yellow
    Write-Host "   List sessions:    .\session-manager.ps1 -Action list" -ForegroundColor White
    Write-Host "   Restore session:  .\session-manager.ps1 -Action restore -Interactive" -ForegroundColor White
    Write-Host "   Clean old:        .\session-manager.ps1 -Action clean -KeepLast 3" -ForegroundColor White
    Write-Host "   Create backup:    .\session-manager.ps1 -Action create" -ForegroundColor White
    exit 1
}
