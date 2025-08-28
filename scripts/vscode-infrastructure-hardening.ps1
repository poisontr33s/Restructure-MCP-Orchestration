# 🏴‍☠️ Captain Guthilda's VS Code Infrastructure Hardening System
# Eliminates popup chaos through systematic configuration control

param(
    [string]$SessionName = "MCP-Orchestration-Fixed",
    [switch]$HardenAll,
    [switch]$DryRun = $false
)

Write-Host "🏴‍☠️ CAPTAIN GUTHILDA'S INFRASTRUCTURE HARDENING" -ForegroundColor Cyan
Write-Host "🎯 Eliminating popup chaos through systematic configuration control..." -ForegroundColor Yellow

$sessionsPath = "$env:APPDATA\Code-Sessions"
$sessionPath = Join-Path $sessionsPath $SessionName
$userDataPath = Join-Path $sessionPath "User"
$settingsPath = Join-Path $userDataPath "settings.json"

function Stop-AllVSCodeProcesses {
    Write-Host "⚔️ Stopping all VS Code processes..." -ForegroundColor Red
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN: Would stop VS Code processes" -ForegroundColor Yellow
        return
    }
    
    Get-Process | Where-Object { 
        $_.ProcessName -like "*code*" -or 
        $_.MainWindowTitle -like "*Visual Studio Code*" 
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Start-Sleep -Seconds 2
    Write-Host "✅ VS Code processes stopped" -ForegroundColor Green
}

function Set-AntiPopupSettings {
    Write-Host "🛡️ Applying anti-popup infrastructure settings..." -ForegroundColor Yellow
    
    if (-not (Test-Path $settingsPath)) {
        Write-Host "❌ Session settings not found: $settingsPath" -ForegroundColor Red
        return
    }
    
    try {
        $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
    } catch {
        $settings = @{}
    }
    
    # JAVA INFRASTRUCTURE HARDENING
    Write-Host "  ☕ Hardening Java infrastructure..." -ForegroundColor Gray
    $settings | Add-Member -MemberType NoteProperty -Name "java.configuration.detectJdksAtStart" -Value $false -Force
    $settings | Add-Member -MemberType NoteProperty -Name "java.configuration.runtimes" -Value @() -Force
    $settings | Add-Member -MemberType NoteProperty -Name "java.jdt.ls.java.home" -Value ".\\dev-tools\\java21" -Force
    $settings | Add-Member -MemberType NoteProperty -Name "java.import.gradle.enabled" -Value $false -Force
    $settings | Add-Member -MemberType NoteProperty -Name "java.silentNotification" -Value $true -Force
    $settings | Add-Member -MemberType NoteProperty -Name "java.server.launchMode" -Value "Standard" -Force
    $settings | Add-Member -MemberType NoteProperty -Name "redhat.telemetry.enabled" -Value $false -Force
    
    # TAILWIND INFRASTRUCTURE HARDENING  
    Write-Host "  🎨 Hardening TailwindCSS infrastructure..." -ForegroundColor Gray
    $settings | Add-Member -MemberType NoteProperty -Name "tailwindCSS.includeLanguages" -Value @{
        "typescript" = "javascript"
        "typescriptreact" = "javascript"
    } -Force
    $settings | Add-Member -MemberType NoteProperty -Name "tailwindCSS.experimental.configFile" -Value "tailwind.config.ts" -Force
    $settings | Add-Member -MemberType NoteProperty -Name "tailwindCSS.validate" -Value $false -Force
    
    # EXTENSION INFRASTRUCTURE HARDENING
    Write-Host "  🔌 Hardening extension infrastructure..." -ForegroundColor Gray
    $settings | Add-Member -MemberType NoteProperty -Name "extensions.autoCheckUpdates" -Value $false -Force
    $settings | Add-Member -MemberType NoteProperty -Name "extensions.autoUpdate" -Value $false -Force
    $settings | Add-Member -MemberType NoteProperty -Name "extensions.ignoreRecommendations" -Value $true -Force
    $settings | Add-Member -MemberType NoteProperty -Name "extensions.showRecommendationsOnlyOnDemand" -Value $true -Force
    
    # NOTIFICATION INFRASTRUCTURE HARDENING
    Write-Host "  🔕 Hardening notification infrastructure..." -ForegroundColor Gray
    $settings | Add-Member -MemberType NoteProperty -Name "telemetry.telemetryLevel" -Value "off" -Force
    $settings | Add-Member -MemberType NoteProperty -Name "update.mode" -Value "none" -Force
    $settings | Add-Member -MemberType NoteProperty -Name "update.showReleaseNotes" -Value $false -Force
    $settings | Add-Member -MemberType NoteProperty -Name "workbench.enableExperiments" -Value $false -Force
    $settings | Add-Member -MemberType NoteProperty -Name "workbench.settings.enableNaturalLanguageSearch" -Value $false -Force
    
    # PROJECT INFRASTRUCTURE HARDENING
    Write-Host "  📦 Hardening project infrastructure..." -ForegroundColor Gray
    $settings | Add-Member -MemberType NoteProperty -Name "npm.packageManager" -Value "pnpm" -Force
    $settings | Add-Member -MemberType NoteProperty -Name "maven.executable.path" -Value ".\\dev-tools\\maven\\bin\\mvn.cmd" -Force
    $settings | Add-Member -MemberType NoteProperty -Name "go.goroot" -Value ".\\dev-tools\\go" -Force
    $settings | Add-Member -MemberType NoteProperty -Name "go.gopath" -Value ".\\go-workspace" -Force
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN: Would save hardened settings" -ForegroundColor Yellow
    } else {
        $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8
        Write-Host "✅ Anti-popup settings applied" -ForegroundColor Green
    }
}

function Install-MissingDependencies {
    Write-Host "📦 Installing missing dependencies to eliminate popup sources..." -ForegroundColor Yellow
    
    $currentDir = Get-Location
    $monitorPath = "packages\monitor"
    
    if (Test-Path $monitorPath) {
        Write-Host "  🎨 Installing tailwindcss-animate..." -ForegroundColor Gray
        
        if ($DryRun) {
            Write-Host "🔍 DRY RUN: Would install tailwindcss-animate" -ForegroundColor Yellow
        } else {
            try {
                Set-Location $monitorPath
                & pnpm add -D tailwindcss-animate
                Write-Host "  ✅ tailwindcss-animate installed" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️ Failed to install tailwindcss-animate: $($_.Exception.Message)" -ForegroundColor Yellow
            } finally {
                Set-Location $currentDir
            }
        }
    }
}

function Create-ExtensionBlocklist {
    Write-Host "🚫 Creating extension blocklist..." -ForegroundColor Yellow
    
    $extensionsPath = Join-Path $sessionPath "extensions"
    $blocklistPath = Join-Path $userDataPath "extensions.json"
    
    $extensionConfig = @{
        "recommendations" = @()
        "unwantedRecommendations" = @(
            "ms-vscode.vscode-typescript-next",
            "bradlc.vscode-tailwindcss"
        )
    }
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN: Would create extension blocklist" -ForegroundColor Yellow
    } else {
        $extensionConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $blocklistPath -Encoding UTF8
        Write-Host "✅ Extension blocklist created" -ForegroundColor Green
    }
}

function Update-LaunchScript {
    Write-Host "🚀 Updating launch script with infrastructure hardening..." -ForegroundColor Yellow
    
    $launchScript = Join-Path $sessionPath "launch-$SessionName.ps1"
    
    if (-not (Test-Path $launchScript)) {
        Write-Host "❌ Launch script not found: $launchScript" -ForegroundColor Red
        return
    }
    
    $hardenedLaunchScript = @"
# 🏴‍☠️ $SessionName VS Code Session Launcher (Infrastructure Hardened)
# Auto-generated by Captain Guthilda's Infrastructure Hardening System

Write-Host "🚀 Launching $SessionName VS Code session..." -ForegroundColor Cyan

# INFRASTRUCTURE STEP 1: Stop any existing VS Code processes
Get-Process | Where-Object { 
    `$_.ProcessName -like "*code*" -or 
    `$_.MainWindowTitle -like "*Visual Studio Code*" 
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 1

# INFRASTRUCTURE STEP 2: Set environment for portable tools
`$projectRoot = "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration"
if (Test-Path "`$projectRoot\dev-tools") {
    `$env:JAVA_HOME = "`$projectRoot\dev-tools\java21"
    `$env:MAVEN_HOME = "`$projectRoot\dev-tools\maven" 
    `$env:GOROOT = "`$projectRoot\dev-tools\go"
    `$env:GOPATH = "`$projectRoot\go-workspace"
    `$env:PATH = "`$projectRoot\dev-tools\java21\bin;`$projectRoot\dev-tools\maven\bin;`$projectRoot\dev-tools\go\bin;" + `$env:PATH
    
    Write-Host "✅ Portable tools environment set" -ForegroundColor Green
}

# INFRASTRUCTURE STEP 3: Launch VS Code with isolated session
Start-Process "code" -ArgumentList @(
    "--user-data-dir", "$userDataPath",
    "--extensions-dir", "$extensionsPath", 
    "--disable-extensions",
    "--disable-telemetry",
    "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration"
) -WorkingDirectory "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration"

Write-Host "✅ $SessionName session started with infrastructure hardening!" -ForegroundColor Green
"@

    if ($DryRun) {
        Write-Host "🔍 DRY RUN: Would update launch script with hardening" -ForegroundColor Yellow
    } else {
        $hardenedLaunchScript | Out-File -FilePath $launchScript -Encoding UTF8
        Write-Host "✅ Launch script hardened" -ForegroundColor Green
    }
}

function Test-InfrastructureHealth {
    Write-Host "🔍 Testing infrastructure health..." -ForegroundColor Cyan
    
    $checks = @{
        "Session Directory" = Test-Path $sessionPath
        "Settings File" = Test-Path $settingsPath  
        "Launch Script" = Test-Path (Join-Path $sessionPath "launch-$SessionName.ps1")
        "Java 21 Tools" = Test-Path "dev-tools\java21"
        "Maven Tools" = Test-Path "dev-tools\maven"
        "Monitor Package" = Test-Path "packages\monitor"
    }
    
    foreach ($check in $checks.Keys) {
        $status = if ($checks[$check]) { "✅" } else { "❌" }
        $color = if ($checks[$check]) { "Green" } else { "Red" }
        Write-Host "  $status $check" -ForegroundColor $color
    }
    
    $healthy = ($checks.Values | Where-Object { $_ -eq $true }).Count
    $total = $checks.Values.Count
    
    Write-Host "`n🎯 Infrastructure Health: $healthy/$total checks passed" -ForegroundColor Cyan
    
    if ($healthy -eq $total) {
        Write-Host "🏴‍☠️ Infrastructure is battle-ready!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Infrastructure needs repairs before battle!" -ForegroundColor Yellow
    }
}

# MAIN EXECUTION
Write-Host "`n🎯 INFRASTRUCTURE HARDENING SEQUENCE" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
}

Test-InfrastructureHealth
Stop-AllVSCodeProcesses
Install-MissingDependencies
Set-AntiPopupSettings
Create-ExtensionBlocklist
Update-LaunchScript

Write-Host "`n🎉 INFRASTRUCTURE HARDENING COMPLETE!" -ForegroundColor Green
Write-Host "🏴‍☠️ Your VS Code session is now fortified against popup invasions!" -ForegroundColor Cyan

Write-Host "`n💡 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Test the hardened session: .\scripts\vscode-session-master.ps1 -Launch '$SessionName'" -ForegroundColor White
Write-Host "  2. Monitor for any remaining popups" -ForegroundColor White
Write-Host "  3. Report any survivors for immediate elimination!" -ForegroundColor White
