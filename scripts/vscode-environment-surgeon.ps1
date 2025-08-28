# 🏴‍☠️ Captain Guthilda's VS Code Environment Surgeon
# Performs deep surgery on VS Code OS conflicts and process explosions

param(
    [switch]$Nuclear = $false,
    [switch]$Analyze = $false,
    [switch]$FixServiceWorkers = $false,
    [switch]$IsolateWorkspace = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🏴‍☠️ CAPTAIN GUTHILDA'S VS CODE ENVIRONMENT SURGEON" -ForegroundColor Cyan
Write-Host "🎯 Resolving Win11 OS conflicts and VS Code process explosions..." -ForegroundColor Yellow

# Function to analyze VS Code process chaos
function Analyze-VSCodeChaos {
    Write-Host "`n🔍 ANALYZING VS CODE PROCESS LANDSCAPE" -ForegroundColor Cyan
    
    $codeProcesses = Get-Process | Where-Object {
        $_.ProcessName -like "*Code*" -or 
        $_.ProcessName -like "*vscode*" -or
        $_.ProcessName -like "*CodeAnalysis*" -or
        $_.ProcessName -like "*VisualStudio.Code*"
    }
    
    $processGroups = $codeProcesses | Group-Object ProcessName | Sort-Object Count -Descending
    
    Write-Host "📊 VS Code Process Analysis:" -ForegroundColor Yellow
    foreach ($group in $processGroups) {
        $totalMemory = ($group.Group | Measure-Object WorkingSet -Sum).Sum / 1MB
        Write-Host "  🔹 $($group.Name): $($group.Count) instances ($([math]::Round($totalMemory, 1))MB)" -ForegroundColor Gray
    }
    
    $totalProcesses = ($processGroups | Measure-Object Count -Sum).Sum
    $totalMemory = ($codeProcesses | Measure-Object WorkingSet -Sum).Sum / 1MB
    
    Write-Host "`n🎯 CHAOS SUMMARY:" -ForegroundColor Red
    Write-Host "  💀 Total VS Code Processes: $totalProcesses" -ForegroundColor Red
    Write-Host "  🧠 Total Memory Usage: $([math]::Round($totalMemory, 1))MB" -ForegroundColor Red
    
    if ($totalProcesses -gt 20) {
        Write-Host "  ⚠️ CRITICAL: Process explosion detected!" -ForegroundColor Red
        return $true
    }
    
    return $false
}

# Function to perform nuclear VS Code reset
function Invoke-NuclearVSCodeReset {
    Write-Host "`n💀 PERFORMING NUCLEAR VS CODE RESET" -ForegroundColor Red
    Write-Host "⚠️ This will close ALL VS Code instances and reset workspace state" -ForegroundColor Yellow
    
    # Stop all VS Code processes
    Write-Host "🔥 Terminating all VS Code processes..." -ForegroundColor Yellow
    
    $processNames = @(
        "Code*",
        "*vscode*",
        "*CodeAnalysis*",
        "*VisualStudio.Code*",
        "code-tunnel*",
        "codeql*"
    )
    
    foreach ($pattern in $processNames) {
        Get-Process | Where-Object {$_.ProcessName -like $pattern} | ForEach-Object {
            try {
                Write-Host "  💀 Killing $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Gray
                $_.Kill()
            } catch {
                Write-Host "  ⚠️ Failed to kill $($_.ProcessName): $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }
    
    # Wait for cleanup
    Start-Sleep -Seconds 3
    
    # Clear VS Code temp files and service worker cache
    Write-Host "🧹 Clearing VS Code cache and temp files..." -ForegroundColor Yellow
    
    $cachePaths = @(
        "$env:APPDATA\Code\User\workspaceStorage",
        "$env:APPDATA\Code\User\globalStorage",
        "$env:APPDATA\Code\CachedExtensions",
        "$env:APPDATA\Code\CachedData",
        "$env:LOCALAPPDATA\Microsoft\vscode-cpptools",
        "$env:TEMP\vscode-*"
    )
    
    foreach ($cachePath in $cachePaths) {
        if (Test-Path $cachePath) {
            try {
                Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "  🗑️ Cleared: $cachePath" -ForegroundColor Gray
            } catch {
                Write-Host "  ⚠️ Could not clear: $cachePath" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "✅ Nuclear reset complete!" -ForegroundColor Green
}

# Function to fix service worker issues
function Fix-ServiceWorkerIssues {
    Write-Host "`n🛠️ FIXING SERVICE WORKER REGISTRATION ISSUES" -ForegroundColor Cyan
    
    # Create workspace-specific VS Code settings to isolate from OS
    $workspaceSettings = @{
        "workbench.enableExperiments" = $false
        "update.mode" = "none"
        "telemetry.telemetryLevel" = "off"
        "extensions.autoCheckUpdates" = $false
        "extensions.autoUpdate" = $false
        "workbench.settings.enableNaturalLanguageSearch" = $false
        "search.useGlobalIgnoreFiles" = $false
        "terminal.integrated.enablePersistentSessions" = $false
        "files.watcherExclude" = @{
            "**/dev-tools/**" = $true
            "**/node_modules/**" = $true
            "**/target/**" = $true
            "**/.git/**" = $true
        }
        "search.exclude" = @{
            "**/dev-tools/**" = $true
            "**/node_modules/**" = $true
            "**/target/**" = $true
        }
        "typescript.disableAutomaticTypeAcquisition" = $true
        "npm.autoDetect" = "off"
        "grunt.autoDetect" = "off"
        "gulp.autoDetect" = "off"
        "jake.autoDetect" = "off"
    }
    
    $settingsPath = ".vscode/settings.json"
    if (Test-Path $settingsPath) {
        $existingSettings = Get-Content $settingsPath -Raw | ConvertFrom-Json -AsHashtable -ErrorAction SilentlyContinue
        if (-not $existingSettings) { $existingSettings = @{} }
        
        # Merge settings
        foreach ($key in $workspaceSettings.Keys) {
            $existingSettings[$key] = $workspaceSettings[$key]
        }
        
        $existingSettings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8
        Write-Host "✅ Updated workspace settings for service worker isolation" -ForegroundColor Green
    }
}

# Function to create isolated workspace environment
function Create-IsolatedWorkspace {
    Write-Host "`n🏗️ CREATING ISOLATED WORKSPACE ENVIRONMENT" -ForegroundColor Cyan
    
    # Create workspace-specific user data directory
    $workspaceUserData = ".vscode-isolated"
    if (-not (Test-Path $workspaceUserData)) {
        New-Item -ItemType Directory -Path $workspaceUserData | Out-Null
        Write-Host "✅ Created isolated user data directory" -ForegroundColor Green
    }
    
    # Create isolated startup script
    $isolatedStartup = @"
# 🏴‍☠️ Captain Guthilda's Isolated VS Code Launcher
# Launches VS Code with complete OS isolation

`$workspaceRoot = Split-Path -Parent `$MyInvocation.MyCommand.Path
`$isolatedUserData = Join-Path `$workspaceRoot ".vscode-isolated"

Write-Host "🏴‍☠️ Launching VS Code in isolated mode..." -ForegroundColor Cyan
Write-Host "📂 Workspace: `$workspaceRoot" -ForegroundColor Gray
Write-Host "🔒 Isolated Data: `$isolatedUserData" -ForegroundColor Gray

# Launch VS Code with isolated user data
& code --user-data-dir "`$isolatedUserData" --disable-extensions --no-sandbox "`$workspaceRoot"
"@
    
    $isolatedStartup | Out-File -FilePath "launch-isolated-vscode.ps1" -Encoding UTF8
    Write-Host "✅ Created isolated VS Code launcher: launch-isolated-vscode.ps1" -ForegroundColor Green
    
    # Create extension whitelist for isolated mode
    $essentialExtensions = @(
        "ms-vscode.vscode-typescript-next",
        "redhat.java",
        "vscjava.vscode-java-pack",
        "golang.go"
    )
    
    $extensionConfig = @{
        "recommendations" = $essentialExtensions
        "unwantedRecommendations" = @(
            "ms-vscode.vscode-json",
            "bradlc.vscode-tailwindcss",
            "ms-python.python"
        )
    }
    
    $extensionConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath ".vscode/extensions.json" -Encoding UTF8
    Write-Host "✅ Created extension whitelist for isolation" -ForegroundColor Green
}

# Main execution logic
if ($Analyze -or (-not $Nuclear -and -not $FixServiceWorkers -and -not $IsolateWorkspace)) {
    $hasChaos = Analyze-VSCodeChaos
    
    if ($hasChaos) {
        Write-Host "`n🚨 RECOMMENDATIONS:" -ForegroundColor Yellow
        Write-Host "  1. Run with -Nuclear to perform complete reset" -ForegroundColor Gray
        Write-Host "  2. Run with -FixServiceWorkers to resolve service worker issues" -ForegroundColor Gray
        Write-Host "  3. Run with -IsolateWorkspace to create isolated environment" -ForegroundColor Gray
        Write-Host "  4. Restart Windows to clear all OS-level conflicts" -ForegroundColor Gray
    }
}

if ($Nuclear) {
    Invoke-NuclearVSCodeReset
}

if ($FixServiceWorkers) {
    Fix-ServiceWorkerIssues
}

if ($IsolateWorkspace) {
    Create-IsolatedWorkspace
}

Write-Host "`n🎉 VS Code environment surgery complete!" -ForegroundColor Green
Write-Host "🔄 Restart VS Code or use launch-isolated-vscode.ps1 for clean environment" -ForegroundColor Yellow
