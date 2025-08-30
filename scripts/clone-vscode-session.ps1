# VSCODE SESSION CLONER - Captain Guthilda's Ultimate Session Replication Protocol
# This script attempts to clone the current VS Code session as closely as possible
# including open files, editor layout, terminal sessions, and workspace state

param(
    [string]$WorkspaceRoot = "",
    [switch]$PreserveTerminals,
    [switch]$OpenInNewWindow,
    [switch]$CopyExtensionState,
    [switch]$Verbose
)

# Set defaults for switches
if (-not $PSBoundParameters.ContainsKey('PreserveTerminals')) { $PreserveTerminals = $true }
if (-not $PSBoundParameters.ContainsKey('OpenInNewWindow')) { $OpenInNewWindow = $true }
if (-not $PSBoundParameters.ContainsKey('CopyExtensionState')) { $CopyExtensionState = $true }

# Set workspace root if not provided
if (-not $WorkspaceRoot) {
    $WorkspaceRoot = Split-Path -Parent $PSScriptRoot
}

Write-Host "🏴‍☠️ Captain Guthilda's VS Code Session Cloner v2.0" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Function to get VS Code workspace hash
function Get-WorkspaceHash {
    param([string]$WorkspacePath)
    
    # Normalize path for VS Code format
    $normalizedPath = $WorkspacePath.Replace('\', '/').ToLower()
    if (-not $normalizedPath.StartsWith('file:///')) {
        $normalizedPath = "file:///$normalizedPath"
    }
    $normalizedPath = $normalizedPath.Replace(':', '%3A')
    
    if ($Verbose) {
        Write-Host "Normalized path for hashing: $normalizedPath" -ForegroundColor Yellow
    }
    
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($normalizedPath)
    $hasher = [System.Security.Cryptography.MD5]::Create()
    $hash = $hasher.ComputeHash($bytes)
    return [System.BitConverter]::ToString($hash).Replace('-', '').ToLower()
}

# Function to find current workspace storage
function Find-CurrentWorkspaceStorage {
    $workspaceStoragePath = "$env:APPDATA\Code\User\workspaceStorage"
    
    if ($Verbose) {
        Write-Host "Searching workspace storage: $workspaceStoragePath" -ForegroundColor Yellow
        Write-Host "Looking for workspace: $WorkspaceRoot" -ForegroundColor Yellow
    }
    
    $candidates = Get-ChildItem -Path $workspaceStoragePath -Directory | Where-Object {
        if (Test-Path "$($_.FullName)\workspace.json") {
            try {
                $workspaceJson = Get-Content "$($_.FullName)\workspace.json" | ConvertFrom-Json
                $folder = $workspaceJson.folder
                
                if ($Verbose) {
                    Write-Host "Checking workspace folder: $($folder.Substring(0, [Math]::Min(100, $folder.Length)))..." -ForegroundColor Gray
                }
                
                if ($folder) {
                    # Simple URL decoding without System.Web
                    $decodedFolder = $folder -replace '^file:///', '' -replace '%3A', ':' -replace '%20', ' '
                    $decodedFolder = $decodedFolder.Replace('/', '\')
                    
                    if ($Verbose) {
                        Write-Host "Decoded folder: $decodedFolder" -ForegroundColor Gray
                    }
                    
                    # Check if paths match (case-insensitive)
                    if ($decodedFolder.ToLower() -eq $WorkspaceRoot.ToLower() -or 
                        $WorkspaceRoot.ToLower().Contains($decodedFolder.ToLower()) -or
                        $decodedFolder.ToLower().Contains($WorkspaceRoot.ToLower())) {
                        if ($Verbose) {
                            Write-Host "✅ Found matching workspace: $($_.Name)" -ForegroundColor Green
                        }
                        return $true
                    }
                }
            } catch {
                if ($Verbose) {
                    Write-Host "⚠️ Error reading workspace.json in $($_.Name): $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
        }
        return $false
    } | Sort-Object LastWriteTime -Descending
    
    if ($Verbose -and $candidates) {
        Write-Host "Found $($candidates.Count) candidate workspace(s)" -ForegroundColor Blue
    } elseif ($Verbose) {
        Write-Host "No matching workspaces found, using fallback method" -ForegroundColor Yellow
    }
    
    # If no exact match, return the most recent workspace as fallback
    if (-not $candidates) {
        $allWorkspaces = Get-ChildItem -Path $workspaceStoragePath -Directory | 
                        Where-Object { Test-Path "$($_.FullName)\workspace.json" } |
                        Sort-Object LastWriteTime -Descending
        
        if ($allWorkspaces -and $Verbose) {
            Write-Host "Using most recent workspace as fallback: $($allWorkspaces[0].Name)" -ForegroundColor Yellow
        }
        
        return $allWorkspaces | Select-Object -First 1
    }
    
    return $candidates | Select-Object -First 1
}

# Function to extract open files from VS Code state
function Get-OpenFiles {
    param([string]$WorkspaceStoragePath)
    
    $openFiles = @()
    
    try {
        # Try to find recent files from various sources
        if ($WorkspaceStoragePath -and (Test-Path $WorkspaceStoragePath)) {
            $stateDbPath = "$WorkspaceStoragePath\state.vscdb"
            
            if (Test-Path $stateDbPath) {
                Write-Host "📁 Found VS Code state database, attempting to extract open files..." -ForegroundColor Green
                
                # Create a temporary script to query SQLite (if available)
                $tempScript = @"
.mode list
.separator |
SELECT key, value FROM ItemTable WHERE key LIKE '%workbench.editors%' OR key LIKE '%files.openFiles%' OR key LIKE '%workbench.panel%';
"@
                
                $tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
                Set-Content -Path $tempSqlFile -Value $tempScript
                
                try {
                    # Try to use sqlite3 if available - PowerShell compatible method
                    $process = Start-Process -FilePath "sqlite3" -ArgumentList $stateDbPath -RedirectStandardInput $tempSqlFile -RedirectStandardOutput ([System.IO.Path]::GetTempFileName()) -PassThru -WindowStyle Hidden -ErrorAction SilentlyContinue
                    if ($process) {
                        $process.WaitForExit(5000)  # 5 second timeout
                        if ($process.ExitCode -eq 0) {
                            $sqliteOutput = Get-Content $process.StandardOutput.FileName
                            Write-Host "✅ Successfully extracted state data from SQLite" -ForegroundColor Green
                            if ($Verbose) {
                                Write-Host "State data preview:" -ForegroundColor Yellow
                                $sqliteOutput | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" }
                            }
                        }
                        Remove-Item $process.StandardOutput.FileName -Force -ErrorAction SilentlyContinue
                    }
                } catch {
                    Write-Host "⚠️ SQLite3 not available, using fallback methods" -ForegroundColor Yellow
                } finally {
                    Remove-Item $tempSqlFile -Force -ErrorAction SilentlyContinue
                }
            }
        } else {
            Write-Host "⚠️ No workspace storage path available, using fallback file detection" -ForegroundColor Yellow
        }
        
        # Fallback: Look for common file patterns in workspace
        Write-Host "🔍 Scanning workspace for common development files..." -ForegroundColor Blue
        
        $commonPatterns = @("*.ts", "*.js", "*.json", "*.md", "*.yml", "*.yaml", "*.java", "*.py", "*.go", "*.rs")
        $recentFiles = @()
        
        foreach ($pattern in $commonPatterns) {
            $files = Get-ChildItem -Path $WorkspaceRoot -Filter $pattern -Recurse -File | 
                     Where-Object { $_.FullName -notmatch "(node_modules|\.git|target|build|dist)" } |
                     Sort-Object LastWriteTime -Descending |
                     Select-Object -First 5
            $recentFiles += $files
        }
        
        $openFiles = $recentFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 15 | ForEach-Object { $_.FullName }
        
    } catch {
        Write-Host "⚠️ Error extracting open files: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Always include key project files
    $keyFiles = @(
        "$WorkspaceRoot\README.md",
        "$WorkspaceRoot\package.json",
        "$WorkspaceRoot\pnpm-workspace.yaml",
        "$WorkspaceRoot\.vscode\settings.json",
        "$WorkspaceRoot\.vscode\tasks.json"
    ) | Where-Object { Test-Path $_ }
    
    $openFiles = ($openFiles + $keyFiles) | Select-Object -Unique
    
    return $openFiles
}

# Function to create VS Code workspace file with specific files
function New-SessionWorkspace {
    param(
        [string[]]$FilesToOpen,
        [string]$WorkspaceRoot
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $workspaceFile = "$WorkspaceRoot\session-clone-$timestamp.code-workspace"
    
    $workspace = @{
        folders = @(
            @{
                path = "."
            }
        )
        settings = @{
            "workbench.editor.restoreViewState" = $true
            "workbench.editor.enablePreview" = $false
            "workbench.startupEditor" = "newUntitledFile"
        }
        extensions = @{
            recommendations = @(
                "ms-vscode.vscode-typescript-next",
                "ms-vscode.vscode-json",
                "bradlc.vscode-tailwindcss",
                "GitHub.copilot",
                "GitHub.copilot-chat"
            )
        }
    }
    
    # Add recent files as a comment for manual opening
    if ($FilesToOpen) {
        $workspace.settings["// Recent files to open manually"] = $FilesToOpen
    }
    
    $workspaceJson = $workspace | ConvertTo-Json -Depth 10
    Set-Content -Path $workspaceFile -Value $workspaceJson -Encoding UTF8
    
    return $workspaceFile
}

# Function to create launch script for new VS Code instance
function New-LaunchScript {
    param(
        [string]$WorkspaceFile,
        [string[]]$FilesToOpen
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $launchScript = "$WorkspaceRoot\scripts\launch-cloned-session-$timestamp.ps1"
    
    $scriptContent = @"
# Auto-generated VS Code Session Clone Launch Script
# Generated: $(Get-Date)

`$WorkspaceRoot = "$WorkspaceRoot"
`$WorkspaceFile = "$WorkspaceFile"

Write-Host "🚀 Launching cloned VS Code session..." -ForegroundColor Green

# Launch VS Code with workspace
Start-Process "code" -ArgumentList "--new-window", "`$WorkspaceFile" -NoNewWindow

# Wait a moment for VS Code to start
Start-Sleep -Seconds 3

# Open specific files
`$filesToOpen = @(
"@

    foreach ($file in $FilesToOpen) {
        $scriptContent += "`n    `"$file`","
    }
    
    $scriptContent += @"

)

foreach (`$file in `$filesToOpen) {
    if (Test-Path `$file) {
        Write-Host "📁 Opening: `$file" -ForegroundColor Blue
        Start-Process "code" -ArgumentList "--goto", "`$file" -NoNewWindow
        Start-Sleep -Milliseconds 500
    }
}

Write-Host "✅ Session clone launch complete!" -ForegroundColor Green
Write-Host "📋 Files opened: `$(`$filesToOpen.Count)" -ForegroundColor Cyan

# Clean up this launch script after use
# Uncomment the next line if you want auto-cleanup:
# Remove-Item `$PSCommandPath -Force
"@

    Set-Content -Path $launchScript -Value $scriptContent -Encoding UTF8
    return $launchScript
}

# Function to copy terminal history and commands
function Backup-TerminalState {
    param([string]$BackupDir)
    
    Write-Host "💻 Backing up terminal state..." -ForegroundColor Blue
    
    # PowerShell history
    $psHistoryPath = "$env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt"
    if (Test-Path $psHistoryPath) {
        Copy-Item $psHistoryPath "$BackupDir\powershell_history.txt" -Force
        Write-Host "✅ PowerShell history backed up" -ForegroundColor Green
    }
    
    # Common terminal commands for this project
    $commonCommands = @"
# Common commands for this MCP Orchestration project:

# Navigation
cd '$WorkspaceRoot'
cd packages/core
cd packages/cli

# Package management
pnpm install
pnpm build
pnpm test
pnpm start
pnpm start:dev

# Docker
docker-compose up -d
docker-compose down
docker ps

# Git
git status
git add .
git commit -m "Session clone checkpoint"
git push

# Java/Maven
mvn clean compile
mvn test
mvn package

# VS Code tasks
code --list-extensions
code --install-extension ms-vscode.vscode-typescript-next

# MCP specific
pnpm exec mcp status
pnpm run validate

"@
    
    Set-Content -Path "$BackupDir\common_commands.ps1" -Value $commonCommands -Encoding UTF8
    Write-Host "✅ Common commands reference created" -ForegroundColor Green
}

# Main execution
try {
    Write-Host "🔍 Detecting current VS Code session..." -ForegroundColor Yellow
    
    # Find current workspace storage
    $currentWorkspace = Find-CurrentWorkspaceStorage
    if (-not $currentWorkspace) {
        Write-Host "⚠️ Could not find specific workspace storage, using fallback method" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Found workspace storage: $($currentWorkspace.Name)" -ForegroundColor Green
    }
    
    # Create backup directory
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupDir = "$WorkspaceRoot\session-backup-$timestamp"
    New-Item -Path $backupDir -ItemType Directory -Force | Out-Null
    
    # Extract open files
    Write-Host "📂 Extracting open files..." -ForegroundColor Yellow
    $workspaceStoragePath = if ($currentWorkspace) { $currentWorkspace.FullName } else { $null }
    $openFiles = Get-OpenFiles -WorkspaceStoragePath $workspaceStoragePath
    
    Write-Host "✅ Found $($openFiles.Count) files to restore" -ForegroundColor Green
    if ($Verbose -and $openFiles) {
        Write-Host "Files to open:" -ForegroundColor Cyan
        $openFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
    }
    
    # Create workspace file
    Write-Host "⚙️ Creating session workspace..." -ForegroundColor Yellow
    $workspaceFile = New-SessionWorkspace -FilesToOpen $openFiles -WorkspaceRoot $WorkspaceRoot
    Write-Host "✅ Workspace file created: $workspaceFile" -ForegroundColor Green
    
    # Create launch script
    Write-Host "🚀 Creating launch script..." -ForegroundColor Yellow
    $launchScript = New-LaunchScript -WorkspaceFile $workspaceFile -FilesToOpen $openFiles
    Write-Host "✅ Launch script created: $launchScript" -ForegroundColor Green
    
    # Backup terminal state
    if ($PreserveTerminals) {
        Backup-TerminalState -BackupDir $backupDir
    }
    
    # Copy VS Code settings and state
    if ($CopyExtensionState -and $currentWorkspace) {
        Write-Host "⚙️ Backing up VS Code state..." -ForegroundColor Yellow
        
        # Copy workspace-specific state
        $wsBackupDir = "$backupDir\workspace-state"
        New-Item -Path $wsBackupDir -ItemType Directory -Force | Out-Null
        
        try {
            Copy-Item "$($currentWorkspace.FullName)\*" $wsBackupDir -Recurse -Force
            Write-Host "✅ Workspace state backed up" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Could not backup all workspace state: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        # Copy global VS Code settings
        $globalSettings = @(
            "$env:APPDATA\Code\User\settings.json",
            "$env:APPDATA\Code\User\keybindings.json",
            "$env:APPDATA\Code\User\tasks.json"
        )
        
        foreach ($setting in $globalSettings) {
            if (Test-Path $setting) {
                $fileName = Split-Path $setting -Leaf
                Copy-Item $setting "$backupDir\$fileName" -Force
            }
        }
    }
    
    # Create restoration guide
    $restoreGuide = @"
# VS Code Session Clone Restoration Guide
Generated: $(Get-Date)

## Files Backed Up:
- Workspace file: $workspaceFile
- Launch script: $launchScript
- Backup directory: $backupDir

## Manual Restoration Steps:

1. **Launch New Session:**
   ``````powershell
   & "$launchScript"
   ``````

2. **Alternative Launch:**
   ``````powershell
   code --new-window "$workspaceFile"
   ``````

3. **Manually Open Key Files:**
"@

    foreach ($file in $openFiles | Select-Object -First 10) {
        $restoreGuide += "`n   - ``$file``"
    }
    
    $restoreGuide += @"

## Terminal Commands to Restore:
``````powershell
# Load common commands
. "$backupDir\common_commands.ps1"

# Restore PowerShell history (manual)
Get-Content "$backupDir\powershell_history.txt" | Select-Object -Last 20
``````

## Extension State:
Extension state has been backed up to: $backupDir\workspace-state

## Notes:
- Some VS Code state (like exact editor split layout) cannot be perfectly replicated
- Terminal sessions cannot be fully restored but command history is preserved
- Extension state may need manual restoration for complex configurations
"@

    Set-Content -Path "$backupDir\RESTORATION_GUIDE.md" -Value $restoreGuide -Encoding UTF8
    
    # Summary
    Write-Host ""
    Write-Host "🎉 SESSION CLONE COMPLETE!" -ForegroundColor Green
    Write-Host "=========================" -ForegroundColor Green
    Write-Host "📁 Backup Directory: $backupDir" -ForegroundColor Cyan
    Write-Host "📄 Workspace File: $workspaceFile" -ForegroundColor Cyan
    Write-Host "🚀 Launch Script: $launchScript" -ForegroundColor Cyan
    Write-Host "📖 Restoration Guide: $backupDir\RESTORATION_GUIDE.md" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 To launch cloned session immediately:" -ForegroundColor Yellow
    Write-Host "   & `"$launchScript`"" -ForegroundColor White
    Write-Host ""
    
    if ($OpenInNewWindow) {
        Write-Host "🔄 Launching cloned session now..." -ForegroundColor Blue
        & $launchScript
    }
    
} catch {
    Write-Host "❌ Error during session cloning: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
