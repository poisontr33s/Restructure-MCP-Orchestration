# 🏴‍☠️ Captain Guthilda's VS Code Session Master Control
# Manage multiple isolated VS Code sessions

param(
    [Parameter(ParameterSetName="Create")]
    [string]$Create,
    
    [Parameter(ParameterSetName="List")]
    [switch]$List,
    
    [Parameter(ParameterSetName="Launch")]
    [string]$Launch,
    
    [Parameter(ParameterSetName="Remove")]
    [string]$Remove,
    
    [Parameter(ParameterSetName="FixTailwind")]
    [switch]$FixTailwind
)

$sessionsPath = "$env:APPDATA\Code-Sessions"

function Show-Sessions {
    Write-Host "🏴‍☠️ EXISTING VS CODE SESSIONS" -ForegroundColor Cyan
    
    if (-not (Test-Path $sessionsPath)) {
        Write-Host "No sessions found. Create your first session with:" -ForegroundColor Yellow
        Write-Host "  .\vscode-session-master.ps1 -Create 'ProjectName'" -ForegroundColor Gray
        return
    }
    
    $sessions = Get-ChildItem -Path $sessionsPath -Directory
    
    if ($sessions.Count -eq 0) {
        Write-Host "No sessions found." -ForegroundColor Yellow
        return
    }
    
    Write-Host "`n📋 Available Sessions:" -ForegroundColor Yellow
    foreach ($session in $sessions) {
        $launchScript = Join-Path $session.FullName "launch-$($session.Name).ps1"
        $hasScript = Test-Path $launchScript
        $icon = if ($hasScript) { "✅" } else { "⚠️" }
        
        Write-Host "  $icon $($session.Name)" -ForegroundColor $(if ($hasScript) { "Green" } else { "Yellow" })
        
        if (Test-Path (Join-Path $session.FullName "User\settings.json")) {
            try {
                $settings = Get-Content (Join-Path $session.FullName "User\settings.json") -Raw | ConvertFrom-Json
                if ($settings."java.jdt.ls.java.home") {
                    Write-Host "    ☕ Java/Maven project" -ForegroundColor Gray
                }
                if ($settings."go.goroot") {
                    Write-Host "    🐹 Go project" -ForegroundColor Gray
                }
                if ($settings."npm.packageManager") {
                    Write-Host "    📦 Node.js project" -ForegroundColor Gray
                }
            } catch {
                # Ignore JSON parsing errors
            }
        }
    }
    
    Write-Host "`n💡 Usage:" -ForegroundColor Yellow
    Write-Host "  Launch: .\vscode-session-master.ps1 -Launch 'SessionName'" -ForegroundColor Gray
    Write-Host "  Create: .\vscode-session-master.ps1 -Create 'NewProjectName'" -ForegroundColor Gray
    Write-Host "  Remove: .\vscode-session-master.ps1 -Remove 'SessionName'" -ForegroundColor Gray
}

function Start-Session {
    param($SessionName)
    
    $sessionPath = Join-Path $sessionsPath $SessionName
    $launchScript = Join-Path $sessionPath "launch-$SessionName.ps1"
    
    if (-not (Test-Path $launchScript)) {
        Write-Host "❌ Session '$SessionName' not found or invalid" -ForegroundColor Red
        Show-Sessions
        return
    }
    
    Write-Host "🚀 Launching session: $SessionName" -ForegroundColor Cyan
    & $launchScript
}

function Remove-Session {
    param($SessionName)
    
    $sessionPath = Join-Path $sessionsPath $SessionName
    
    if (-not (Test-Path $sessionPath)) {
        Write-Host "❌ Session '$SessionName' not found" -ForegroundColor Red
        return
    }
    
    Write-Host "🗑️ Removing session: $SessionName" -ForegroundColor Yellow
    
    # Remove desktop shortcut
    $shortcut = "$env:USERPROFILE\Desktop\VSCode-$SessionName.lnk"
    if (Test-Path $shortcut) {
        Remove-Item $shortcut -Force
        Write-Host "  🔗 Removed desktop shortcut" -ForegroundColor Gray
    }
    
    # Remove start menu entry
    $menuEntry = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\VS Code Sessions\$SessionName.lnk"
    if (Test-Path $menuEntry) {
        Remove-Item $menuEntry -Force
        Write-Host "  📋 Removed start menu entry" -ForegroundColor Gray
    }
    
    # Remove session data
    Remove-Item $sessionPath -Recurse -Force
    Write-Host "  📁 Removed session data" -ForegroundColor Gray
    
    Write-Host "✅ Session '$SessionName' removed" -ForegroundColor Green
}

function Fix-TailwindConfig {
    Write-Host "🎨 FIXING TAILWIND CSS CONFIGURATION ISSUES" -ForegroundColor Cyan
    
    $currentPath = Get-Location
    $tailwindConfigs = Get-ChildItem -Path $currentPath -Recurse -Name "tailwind.config.*" -ErrorAction SilentlyContinue
    
    if (-not $tailwindConfigs) {
        Write-Host "No TailwindCSS config files found in current directory" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔍 Found TailwindCSS configs:" -ForegroundColor Yellow
    $tailwindConfigs | ForEach-Object { Write-Host "  📄 $_" -ForegroundColor Gray }
    
    # Fix the specific error you're seeing
    $monitorPackageJson = "packages\monitor\package.json"
    if (Test-Path $monitorPackageJson) {
        Write-Host "`n🔧 Fixing packages/monitor TailwindCSS configuration..." -ForegroundColor Yellow
        
        # Check if tailwindcss-animate exists
        $packageContent = Get-Content $monitorPackageJson -Raw | ConvertFrom-Json
        
        if (-not $packageContent.dependencies."tailwindcss-animate" -and -not $packageContent.devDependencies."tailwindcss-animate") {
            Write-Host "  📦 Installing tailwindcss-animate..." -ForegroundColor Gray
            
            Set-Location "packages\monitor"
            try {
                & pnpm add -D tailwindcss-animate
                Write-Host "  ✅ tailwindcss-animate installed" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️ Failed to install tailwindcss-animate: $($_.Exception.Message)" -ForegroundColor Yellow
            }
            Set-Location $currentPath
        }
        
        # Update TailwindCSS config to properly resolve the animate plugin
        $tailwindConfigPath = "packages\monitor\tailwind.config.ts"
        if (Test-Path $tailwindConfigPath) {
            $configContent = Get-Content $tailwindConfigPath -Raw
            
            if ($configContent -notlike "*tailwindcss-animate*") {
                Write-Host "  🔧 Updating tailwind.config.ts..." -ForegroundColor Gray
                
                # Add the import and plugin
                $updatedConfig = $configContent -replace 
                    'import type { Config } from "tailwindcss"',
                    'import type { Config } from "tailwindcss"`nimport animate from "tailwindcss-animate"'
                
                $updatedConfig = $updatedConfig -replace 
                    'plugins: \[\]',
                    'plugins: [animate]'
                
                $updatedConfig | Out-File -FilePath $tailwindConfigPath -Encoding UTF8
                Write-Host "  ✅ TailwindCSS config updated" -ForegroundColor Green
            }
        }
    }
    
    Write-Host "`n💡 Additional fixes applied:" -ForegroundColor Yellow
    Write-Host "  • Added tailwindcss-animate dependency" -ForegroundColor Gray
    Write-Host "  • Updated tailwind.config.ts to include animate plugin" -ForegroundColor Gray
    Write-Host "  • This should resolve the 'tailwindcss-animate' error" -ForegroundColor Gray
    
    Write-Host "`n🚀 Restart your VS Code session to see the fixes!" -ForegroundColor Cyan
}

function New-QuickSession {
    param($ProjectName)
    
    Write-Host "🚀 Quick session creation for: $ProjectName" -ForegroundColor Cyan
    
    $currentPath = Get-Location
    & "$currentPath\scripts\vscode-session-manager.ps1" -ProjectName $ProjectName -ProjectPath $currentPath
}

# Main execution
switch ($PSCmdlet.ParameterSetName) {
    "List" { Show-Sessions }
    "Launch" { Start-Session -SessionName $Launch }
    "Remove" { Remove-Session -SessionName $Remove }
    "Create" { New-QuickSession -ProjectName $Create }
    "FixTailwind" { Fix-TailwindConfig }
    default { Show-Sessions }
}
