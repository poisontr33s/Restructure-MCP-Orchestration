# 🏴‍☠️ Captain Guthilda's VS Code Surgical Reset System
# Eliminates process chaos while preserving workspace context

param(
    [switch]$PreserveHistory,
    [switch]$PreserveExtensions,
    [switch]$PreserveSettings,
    [switch]$DryRun = $false,
    [switch]$NoPreservation = $false
)

$ErrorActionPreference = "Continue"

Write-Host "🏴‍☠️ CAPTAIN GUTHILDA'S VS CODE SURGICAL RESET" -ForegroundColor Cyan
Write-Host "🎯 Eliminating process chaos while preserving your workspace context..." -ForegroundColor Yellow

# Set default preservation behavior (preserve unless NoPreservation is specified)
if (-not $NoPreservation) {
    $PreserveHistory = $true
    $PreserveExtensions = $true  
    $PreserveSettings = $true
}

# Backup VS Code user data that we want to preserve
$userDataPath = "$env:APPDATA\Code\User"
$backupPath = "$env:TEMP\vscode-surgical-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

function Backup-VSCodeContext {
    if ($DryRun) {
        Write-Host "🔍 DRY RUN: Would backup VS Code context..." -ForegroundColor Yellow
        return
    }
    
    Write-Host "💾 Backing up VS Code context..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $backupPath | Out-Null
    
    # Preserve recent workspaces and settings
    $itemsToBackup = @()
    
    if ($PreserveHistory) {
        $itemsToBackup += @(
            "globalStorage\storage.json",           # Recent workspaces
            "workspaceStorage",                     # Workspace-specific data
            "logs"                                  # Keep logs for debugging
        )
    }
    
    if ($PreserveSettings) {
        $itemsToBackup += @(
            "settings.json",                        # User settings
            "keybindings.json",                     # Custom keybindings
            "tasks.json"                           # Global tasks
        )
    }
    
    if ($PreserveExtensions) {
        $itemsToBackup += @(
            "extensions.json"                       # Extension list
        )
    }
    
    foreach ($item in $itemsToBackup) {
        $sourcePath = Join-Path $userDataPath $item
        if (Test-Path $sourcePath) {
            $targetPath = Join-Path $backupPath $item
            $targetDir = Split-Path -Parent $targetPath
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
            }
            
            if ((Get-Item $sourcePath).PSIsContainer) {
                Copy-Item -Path $sourcePath -Destination $targetPath -Recurse -Force
            } else {
                Copy-Item -Path $sourcePath -Destination $targetPath -Force
            }
            Write-Host "  ✅ Backed up: $item" -ForegroundColor Green
        }
    }
}

function Stop-VSCodeProcesses {
    Write-Host "⚔️ Stopping VS Code processes..." -ForegroundColor Red
    
    $processes = @("Code", "code-tunnel", "node", "java", "go", "python") | ForEach-Object {
        Get-Process -Name $_ -ErrorAction SilentlyContinue | Where-Object {
            $_.ProcessName -like "*code*" -or 
            $_.MainWindowTitle -like "*Visual Studio Code*" -or
            $_.CommandLine -like "*vscode*" -or
            $_.CommandLine -like "*code-server*"
        }
    }
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN: Would stop $($processes.Count) VS Code processes" -ForegroundColor Yellow
        return
    }
    
    foreach ($process in $processes) {
        try {
            Write-Host "  🔫 Stopping: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Gray
            $process | Stop-Process -Force
        } catch {
            Write-Host "  ⚠️ Failed to stop $($process.ProcessName): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    # Wait for processes to fully terminate
    Start-Sleep -Seconds 2
}

function Clear-VSCodeCache {
    Write-Host "🧹 Clearing VS Code cache and temporary data..." -ForegroundColor Yellow
    
    $cachePaths = @(
        "$env:APPDATA\Code\CachedData",
        "$env:APPDATA\Code\CachedExtensions", 
        "$env:APPDATA\Code\CachedExtensionVSIXs",
        "$env:APPDATA\Code\logs",
        "$env:APPDATA\Code\User\History",
        "$env:TEMP\vscode-*"
    )
    
    foreach ($cachePath in $cachePaths) {
        if (Test-Path $cachePath) {
            if ($DryRun) {
                Write-Host "🔍 DRY RUN: Would clear cache: $cachePath" -ForegroundColor Yellow
            } else {
                try {
                    Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
                    Write-Host "  🗑️ Cleared: $cachePath" -ForegroundColor Gray
                } catch {
                    Write-Host "  ⚠️ Could not clear $cachePath`: $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
        }
    }
}

function Clear-ServiceWorkers {
    Write-Host "🔧 Clearing service worker registrations..." -ForegroundColor Yellow
    
    $serviceWorkerPaths = @(
        "$env:APPDATA\Code\User\workspaceStorage",
        "$env:APPDATA\Code\Service Worker",
        "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Service Worker",
        "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Service Worker"
    )
    
    foreach ($swPath in $serviceWorkerPaths) {
        if (Test-Path $swPath) {
            if ($DryRun) {
                Write-Host "🔍 DRY RUN: Would clear service workers: $swPath" -ForegroundColor Yellow
            } else {
                try {
                    Get-ChildItem -Path $swPath -Recurse -Filter "*service*worker*" -ErrorAction SilentlyContinue | 
                        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
                    Write-Host "  🔧 Cleared service workers in: $swPath" -ForegroundColor Gray
                } catch {
                    Write-Host "  ⚠️ Could not clear service workers in $swPath" -ForegroundColor Yellow
                }
            }
        }
    }
}

function Restore-VSCodeContext {
    if ($DryRun) {
        Write-Host "🔍 DRY RUN: Would restore VS Code context..." -ForegroundColor Yellow
        return
    }
    
    Write-Host "📥 Restoring VS Code context..." -ForegroundColor Green
    
    if (Test-Path $backupPath) {
        Get-ChildItem -Path $backupPath -Recurse | ForEach-Object {
            $relativePath = $_.FullName.Substring($backupPath.Length + 1)
            $targetPath = Join-Path $userDataPath $relativePath
            $targetDir = Split-Path -Parent $targetPath
            
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
            }
            
            if ($_.PSIsContainer) {
                if (-not (Test-Path $targetPath)) {
                    New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
                }
            } else {
                Copy-Item -Path $_.FullName -Destination $targetPath -Force
                Write-Host "  ✅ Restored: $relativePath" -ForegroundColor Green
            }
        }
    }
}

function Start-CleanVSCode {
    Write-Host "🚀 Starting clean VS Code instance..." -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN: Would start VS Code with current workspace" -ForegroundColor Yellow
        return
    }
    
    # Start VS Code with the current workspace
    $currentWorkspace = (Get-Location).Path
    
    try {
        # Look for existing workspace file
        $workspaceFiles = Get-ChildItem -Path $currentWorkspace -Filter "*.code-workspace" -ErrorAction SilentlyContinue
        
        if ($workspaceFiles) {
            $workspaceFile = $workspaceFiles[0].FullName
            Write-Host "  📂 Opening workspace file: $($workspaceFiles[0].Name)" -ForegroundColor Green
            Start-Process -FilePath "code" -ArgumentList "`"$workspaceFile`"" -NoNewWindow
        } else {
            Write-Host "  📂 Opening current directory: $currentWorkspace" -ForegroundColor Green
            Start-Process -FilePath "code" -ArgumentList "`"$currentWorkspace`"" -NoNewWindow
        }
        
        Write-Host "✅ VS Code started with workspace context preserved!" -ForegroundColor Green
        
    } catch {
        Write-Host "⚠️ Could not auto-start VS Code: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "💡 Manually open VS Code and use File > Open Recent" -ForegroundColor Cyan
    }
}

# Main execution flow
Write-Host "`n🎯 SURGICAL RESET SEQUENCE INITIATED" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
}

Backup-VSCodeContext
Stop-VSCodeProcesses
Clear-VSCodeCache
Clear-ServiceWorkers

# Give system time to settle
if (-not $DryRun) {
    Write-Host "⏱️ Waiting for system to settle..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
}

Restore-VSCodeContext
Start-CleanVSCode

if (-not $DryRun) {
    # Cleanup backup
    Write-Host "🧹 Cleaning up temporary backup..." -ForegroundColor Gray
    Remove-Item -Path $backupPath -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`n🎉 SURGICAL RESET COMPLETE!" -ForegroundColor Green
Write-Host "🏴‍☠️ Your VS Code environment has been surgically cleaned while preserving workspace context!" -ForegroundColor Cyan

if (-not $DryRun) {
    Write-Host "`n💡 VS Code should start automatically with your current workspace." -ForegroundColor Yellow
    Write-Host "   If not, your recent workspaces are preserved in File > Open Recent" -ForegroundColor Gray
}
