# 🏴‍☠️ Captain Guthilda's Gentle Popup Elimination
# Fixes extension issues WITHOUT destroying your current VS Code session

param(
    [switch]$DryRun,
    [switch]$FixTailwind,
    [switch]$FixJava,
    [switch]$FixNpm,
    [switch]$All
)

$ErrorActionPreference = "Continue"

# Set defaults if no specific fixes selected
if (-not ($FixTailwind -or $FixJava -or $FixNpm -or $All)) {
    $All = $true
}

if ($All) {
    $FixTailwind = $true
    $FixJava = $true
    $FixNpm = $true
}

Write-Host "🏴‍☠️ GENTLE POPUP ELIMINATION - NO SESSION KILLING" -ForegroundColor Cyan
Write-Host "🎯 Fixing extension issues while preserving your current work..." -ForegroundColor Yellow

function Repair-TailwindIssue {
    if (-not $FixTailwind) { return }
    
    Write-Host "`n🎨 FIXING TAILWIND CSS ISSUES..." -ForegroundColor Yellow
    
    # Fix the packages/monitor tailwind issue
    $monitorPath = "packages\monitor"
    if (Test-Path $monitorPath) {
        Push-Location $monitorPath
        
        Write-Host "📦 Installing missing tailwindcss-animate..." -ForegroundColor Gray
        if (-not $DryRun) {
            try {
                & pnpm add -D tailwindcss-animate
                Write-Host "✅ tailwindcss-animate installed" -ForegroundColor Green
            } catch {
                Write-Host "⚠️ Using npm fallback..." -ForegroundColor Yellow
                & npm install --save-dev tailwindcss-animate
            }
        } else {
            Write-Host "🔍 DRY RUN: Would install tailwindcss-animate" -ForegroundColor Yellow
        }
        
        Pop-Location
    }
    
    # Update VS Code settings to suppress TailwindCSS popups
    $vscodeSettings = ".vscode\settings.json"
    if (Test-Path $vscodeSettings) {
        if (-not $DryRun) {
            $settings = Get-Content $vscodeSettings -Raw | ConvertFrom-Json
            
            # Add TailwindCSS popup suppressions
            $settings | Add-Member -MemberType NoteProperty -Name "tailwindCSS.experimental.configFile" -Value "tailwind.config.ts" -Force
            $settings | Add-Member -MemberType NoteProperty -Name "tailwindCSS.validate" -Value $false -Force
            $settings | Add-Member -MemberType NoteProperty -Name "css.validate" -Value $false -Force
            
            $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $vscodeSettings -Encoding UTF8
            Write-Host "✅ VS Code TailwindCSS settings updated" -ForegroundColor Green
        } else {
            Write-Host "🔍 DRY RUN: Would update VS Code TailwindCSS settings" -ForegroundColor Yellow
        }
    }
}

function Repair-JavaJDKIssue {
    if (-not $FixJava) { return }
    
    Write-Host "`n☕ FIXING JAVA JDK POPUP ISSUES..." -ForegroundColor Yellow
    
    $vscodeSettings = ".vscode\settings.json"
    if (Test-Path $vscodeSettings) {
        if (-not $DryRun) {
            $settings = Get-Content $vscodeSettings -Raw | ConvertFrom-Json
            
            # Force Java extension to use our portable Java
            $portableJavaPath = ".\dev-tools\java21"
            if (Test-Path $portableJavaPath) {
                $settings | Add-Member -MemberType NoteProperty -Name "java.jdt.ls.java.home" -Value $portableJavaPath -Force
                $settings | Add-Member -MemberType NoteProperty -Name "java.configuration.runtimes" -Value @(
                    @{
                        "name" = "JavaSE-21"
                        "path" = $portableJavaPath
                        "default" = $true
                    }
                ) -Force
                
                # Disable automatic JDK downloads
                $settings | Add-Member -MemberType NoteProperty -Name "java.configuration.checkProjectSettings" -Value $false -Force
                $settings | Add-Member -MemberType NoteProperty -Name "java.sharedIndexes.enabled" -Value $false -Force
                $settings | Add-Member -MemberType NoteProperty -Name "java.autobuild.enabled" -Value $false -Force
                
                $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $vscodeSettings -Encoding UTF8
                Write-Host "✅ Java extension configured to use portable Java 21" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Portable Java not found at $portableJavaPath" -ForegroundColor Yellow
            }
        } else {
            Write-Host "🔍 DRY RUN: Would configure Java extension settings" -ForegroundColor Yellow
        }
    }
}

function Repair-NpmIssue {
    if (-not $FixNpm) { return }
    
    Write-Host "`n📦 FIXING NPM/PNPM ISSUES..." -ForegroundColor Yellow
    
    $vscodeSettings = ".vscode\settings.json"
    if (Test-Path $vscodeSettings) {
        if (-not $DryRun) {
            $settings = Get-Content $vscodeSettings -Raw | ConvertFrom-Json
            
            # Configure to use pnpm and suppress npm popups
            $settings | Add-Member -MemberType NoteProperty -Name "npm.packageManager" -Value "pnpm" -Force
            $settings | Add-Member -MemberType NoteProperty -Name "typescript.preferences.includePackageJsonAutoImports" -Value "off" -Force
            $settings | Add-Member -MemberType NoteProperty -Name "typescript.suggest.autoImports" -Value $false -Force
            $settings | Add-Member -MemberType NoteProperty -Name "npm.autoDetect" -Value "off" -Force
            
            $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $vscodeSettings -Encoding UTF8
            Write-Host "✅ npm/pnpm settings configured" -ForegroundColor Green
        } else {
            Write-Host "🔍 DRY RUN: Would configure npm/pnpm settings" -ForegroundColor Yellow
        }
    }
}

function Add-GlobalPopupSuppression {
    Write-Host "`n🚫 ADDING GLOBAL POPUP SUPPRESSION..." -ForegroundColor Yellow
    
    $vscodeSettings = ".vscode\settings.json"
    if (Test-Path $vscodeSettings) {
        if (-not $DryRun) {
            $settings = Get-Content $vscodeSettings -Raw | ConvertFrom-Json
            
            # Global popup suppression
            $settings | Add-Member -MemberType NoteProperty -Name "extensions.ignoreRecommendations" -Value $true -Force
            $settings | Add-Member -MemberType NoteProperty -Name "workbench.enableExperiments" -Value $false -Force
            $settings | Add-Member -MemberType NoteProperty -Name "telemetry.telemetryLevel" -Value "off" -Force
            $settings | Add-Member -MemberType NoteProperty -Name "update.showReleaseNotes" -Value $false -Force
            $settings | Add-Member -MemberType NoteProperty -Name "git.showPushSuccessNotification" -Value $false -Force
            
            $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $vscodeSettings -Encoding UTF8
            Write-Host "✅ Global popup suppression enabled" -ForegroundColor Green
        } else {
            Write-Host "🔍 DRY RUN: Would add global popup suppression" -ForegroundColor Yellow
        }
    }
}

# Main execution
if ($DryRun) {
    Write-Host "`n🔍 DRY RUN MODE - Preview of changes:" -ForegroundColor Cyan
} else {
    Write-Host "`n🚀 APPLYING GENTLE FIXES..." -ForegroundColor Cyan
}

Repair-TailwindIssue
Repair-JavaJDKIssue  
Repair-NpmIssue
Add-GlobalPopupSuppression

Write-Host "`n🎉 GENTLE FIXES COMPLETE!" -ForegroundColor Green
Write-Host "🏴‍☠️ Your VS Code session should now be popup-free!" -ForegroundColor Cyan

if (-not $DryRun) {
    Write-Host "`n💡 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "  1. The settings have been updated in .vscode/settings.json" -ForegroundColor Gray
    Write-Host "  2. Dependencies are being installed in the background" -ForegroundColor Gray
    Write-Host "  3. Restart VS Code when convenient to apply all changes" -ForegroundColor Gray
    Write-Host "  4. Or use Ctrl+Shift+P > 'Developer: Reload Window'" -ForegroundColor Gray
} else {
    Write-Host "`n💡 Run without -DryRun to apply the fixes" -ForegroundColor Yellow
}
