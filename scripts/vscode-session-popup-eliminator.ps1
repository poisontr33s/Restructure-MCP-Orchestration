# 🏴‍☠️ Captain Guthilda's VS Code Session Popup Eliminator
# Fixes existing sessions to prevent Java extension popups

param(
    [string]$SessionName = "MCP-Orchestration-Fixed"
)

$ErrorActionPreference = "Continue"

Write-Host "🏴‍☠️ CAPTAIN GUTHILDA'S POPUP ELIMINATOR" -ForegroundColor Cyan
Write-Host "🎯 Fixing session: $SessionName" -ForegroundColor Yellow

$sessionPath = "$env:APPDATA\Code-Sessions\$SessionName"
$settingsPath = "$sessionPath\User\settings.json"

if (-not (Test-Path $settingsPath)) {
    Write-Host "❌ Session settings not found: $settingsPath" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Loading current settings..." -ForegroundColor Yellow
$settings = Get-Content $settingsPath -Raw | ConvertFrom-Json

Write-Host "🚫 Adding popup prevention settings..." -ForegroundColor Yellow

# Java extension popup prevention
$javaSettings = @{
    "java.jdt.ls.java.home" = ".\\dev-tools\\java21"
    "maven.executable.path" = ".\\dev-tools\\maven\\bin\\mvn.cmd"
    "java.configuration.updateBuildConfiguration" = "automatic"
    "java.configuration.runtimes" = @(
        @{
            "name" = "JavaSE-21"
            "path" = ".\\dev-tools\\java21"
            "default" = $true
        }
    )
    "java.jdt.ls.vmargs" = "-Xmx2G"
    "java.import.gradle.enabled" = $false
    "java.configuration.checkProjectSettings" = $false
    "java.requirements.JDK11Warning" = $false
    "java.import.gradle.wrapper.checksums" = @()
    # Disable extension installation prompts
    "extensions.autoCheckUpdates" = $false
    "extensions.autoUpdate" = $false
    "extensions.ignoreRecommendations" = $true
    "workbench.extensions.ignoreRecommendations" = $true
    # Disable other annoying popups
    "update.mode" = "none"
    "telemetry.telemetryLevel" = "off"
    "workbench.welcomePage.walkthroughs.openOnInstall" = $false
    "workbench.startupEditor" = "none"
    # TailwindCSS fix
    "tailwindCSS.experimental.configFile" = "tailwind.config.ts"
    "tailwindCSS.includeLanguages" = @{
        "typescript" = "javascript"
        "typescriptreact" = "javascript"
    }
}

# Apply all settings
foreach ($key in $javaSettings.Keys) {
    $settings | Add-Member -MemberType NoteProperty -Name $key -Value $javaSettings[$key] -Force
    Write-Host "  ✅ Added: $key" -ForegroundColor Green
}

Write-Host "💾 Saving fixed settings..." -ForegroundColor Yellow
$settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8

Write-Host "`n🎉 POPUP ELIMINATION COMPLETE!" -ForegroundColor Green
Write-Host "🏴‍☠️ Session '$SessionName' is now popup-resistant!" -ForegroundColor Cyan
Write-Host "`n💡 Next time you launch this session:" -ForegroundColor Yellow
Write-Host "  • No Java JDK download prompts" -ForegroundColor Gray
Write-Host "  • No extension recommendation popups" -ForegroundColor Gray
Write-Host "  • Uses portable Java 21 automatically" -ForegroundColor Gray
Write-Host "  • TailwindCSS errors fixed" -ForegroundColor Gray

Write-Host "`n🚀 Launch your session again to test the fixes!" -ForegroundColor Cyan
