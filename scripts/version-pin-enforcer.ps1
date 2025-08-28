# 📌 VERSION PIN ENFORCER 📌
# Captain Guthilda's Dependency Drift Prevention System
#
# Usage: ./scripts/version-pin-enforcer.ps1 [-WhatIf] [-Unpin]
#
# This script pins package versions to exact versions to prevent drift

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(HelpMessage = "Show what would be pinned without executing")]
    [switch]$WhatIf,
    
    [Parameter(HelpMessage = "Remove pins and restore flexible versioning")]
    [switch]$Unpin
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "📌 VERSION PIN ENFORCER 📌" -ForegroundColor Blue -BackgroundColor Black
Write-Host ""
Write-Host "Captain Guthilda's Dependency Drift Prevention System" -ForegroundColor Magenta
Write-Host ""

if ($WhatIf) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
} elseif ($Unpin) {
    Write-Host "🔓 UNPIN MODE - Restoring flexible versioning" -ForegroundColor Yellow
} else {
    Write-Host "📌 PIN MODE - Locking to exact versions" -ForegroundColor Green
}
Write-Host ""

function Get-CurrentVersionFromLockfile {
    param([string]$PackageName)
    
    if (-not (Test-Path "pnpm-lock.yaml")) {
        return $null
    }
    
    try {
        $lockContent = Get-Content "pnpm-lock.yaml" -Raw
        # Simple regex to find version in lock file
        # This is a simplified approach - production code would use proper YAML parsing
        if ($lockContent -match "$PackageName@([\d\.]+)") {
            return $matches[1]
        }
    }
    catch {
        Write-Host "      ⚠️  Could not parse lock file for $PackageName" -ForegroundColor Yellow
    }
    
    return $null
}

function Update-PackageJsonVersions {
    param(
        [string]$FilePath,
        [hashtable]$VersionChanges,
        [bool]$DryRun,
        [bool]$UnpinMode
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "   ⚠️  $FilePath not found" -ForegroundColor Yellow
        return
    }
    
    try {
        $packageJson = Get-Content $FilePath -Raw | ConvertFrom-Json
        $changesMade = $false
        
        # Process devDependencies
        if ($packageJson.devDependencies) {
            foreach ($package in $packageJson.devDependencies.PSObject.Properties) {
                $packageName = $package.Name
                $currentVersion = $package.Value
                
                if ($VersionChanges.ContainsKey($packageName)) {
                    $newVersion = if ($UnpinMode) { "^$($VersionChanges[$packageName])" } else { $VersionChanges[$packageName] }
                    
                    if ($currentVersion -ne $newVersion) {
                        Write-Host "      ${packageName}: $currentVersion → $newVersion" -ForegroundColor Cyan
                        if (-not $DryRun) {
                            $packageJson.devDependencies.$packageName = $newVersion
                            $changesMade = $true
                        }
                    }
                }
            }
        }
        
        # Process dependencies
        if ($packageJson.dependencies) {
            foreach ($package in $packageJson.dependencies.PSObject.Properties) {
                $packageName = $package.Name
                $currentVersion = $package.Value
                
                if ($VersionChanges.ContainsKey($packageName)) {
                    $newVersion = if ($UnpinMode) { "^$($VersionChanges[$packageName])" } else { $VersionChanges[$packageName] }
                    
                    if ($currentVersion -ne $newVersion) {
                        Write-Host "      ${packageName}: $currentVersion → $newVersion" -ForegroundColor Cyan
                        if (-not $DryRun) {
                            $packageJson.dependencies.$packageName = $newVersion
                            $changesMade = $true
                        }
                    }
                }
            }
        }
        
        # Write back if changes were made
        if ($changesMade -and -not $DryRun) {
            $packageJson | ConvertTo-Json -Depth 10 | Out-File $FilePath -Encoding UTF8
            Write-Host "   ✅ Updated $FilePath" -ForegroundColor Green
        } elseif (-not $changesMade) {
            Write-Host "   ℹ️  No changes needed for $FilePath" -ForegroundColor DarkGray
        }
        
    }
    catch {
        Write-Host "   ❌ Failed to process $FilePath`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Critical packages that should always be pinned for stability
$criticalPackages = @(
    "typescript",
    "turbo", 
    "eslint",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "vitest",
    "tailwindcss",
    "react",
    "react-dom"
)

Write-Host "🔍 Analyzing current package versions..." -ForegroundColor Blue

# Build version map from lock file
$versionMap = @{}
$packagesProcessed = 0

# Get all package.json files
$packageJsonFiles = @("package.json") + (Get-ChildItem -Path "packages" -Recurse -Name "package.json" | ForEach-Object { "packages\$_" })

foreach ($file in $packageJsonFiles) {
    if (Test-Path $file) {
        Write-Host ""
        Write-Host "📦 Processing: $file" -ForegroundColor Green
        
        try {
            $packageJson = Get-Content $file -Raw | ConvertFrom-Json
            
            # Collect all dependencies
            $allDeps = @{}
            if ($packageJson.dependencies) {
                $packageJson.dependencies.PSObject.Properties | ForEach-Object { $allDeps[$_.Name] = $_.Value }
            }
            if ($packageJson.devDependencies) {
                $packageJson.devDependencies.PSObject.Properties | ForEach-Object { $allDeps[$_.Name] = $_.Value }
            }
            
            foreach ($dep in $allDeps.GetEnumerator()) {
                $packageName = $dep.Key
                $currentVersion = $dep.Value
                
                # Skip workspace references
                if ($currentVersion -like "workspace:*") {
                    continue
                }
                
                # Get actual installed version from lock file
                $lockVersion = Get-CurrentVersionFromLockfile $packageName
                if ($lockVersion) {
                    $versionMap[$packageName] = $lockVersion
                    
                    # Show current state
                    $isPinned = -not ($currentVersion.StartsWith("^") -or $currentVersion.StartsWith("~"))
                    $isCritical = $criticalPackages -contains $packageName
                    
                    $statusIcon = if ($isPinned) { "📌" } else { "🔄" }
                    $criticalIcon = if ($isCritical) { "⚡" } else { "  " }
                    
                    Write-Host "      $statusIcon$criticalIcon ${packageName}: $currentVersion (installed: $lockVersion)" -ForegroundColor White
                    $packagesProcessed++
                }
            }
            
        }
        catch {
            Write-Host "   ❌ Failed to read $file`: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📊 Found $packagesProcessed packages across $($packageJsonFiles.Count) package.json files" -ForegroundColor Cyan

if ($packagesProcessed -eq 0) {
    Write-Host "❌ No packages found to process. Run 'pnpm install' first." -ForegroundColor Red
    exit 1
}

# Apply version changes
Write-Host ""
if ($Unpin) {
    Write-Host "🔓 Unpinning versions (adding ^ prefixes)..." -ForegroundColor Yellow
} else {
    Write-Host "📌 Pinning versions to exact numbers..." -ForegroundColor Blue
}

foreach ($file in $packageJsonFiles) {
    Update-PackageJsonVersions -FilePath $file -VersionChanges $versionMap -DryRun $WhatIf -UnpinMode $Unpin
}

# Summary
Write-Host ""
Write-Host "📋 SUMMARY" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""

if ($WhatIf) {
    Write-Host "🔍 This was a dry run. To apply changes:" -ForegroundColor Yellow
    if ($Unpin) {
        Write-Host "   ./scripts/version-pin-enforcer.ps1 -Unpin" -ForegroundColor White
    } else {
        Write-Host "   ./scripts/version-pin-enforcer.ps1" -ForegroundColor White
    }
} else {
    if ($Unpin) {
        Write-Host "🔓 Version unpinning complete!" -ForegroundColor Green
        Write-Host "   Dependencies now use flexible versioning (^x.y.z)" -ForegroundColor White
        Write-Host "   This allows patch and minor updates automatically" -ForegroundColor White
    } else {
        Write-Host "📌 Version pinning complete!" -ForegroundColor Green
        Write-Host "   Dependencies are now locked to exact versions" -ForegroundColor White
        Write-Host "   This prevents unexpected updates and drift" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "🏴‍☠️ Captain's Orders:" -ForegroundColor Magenta
    Write-Host "   1. Run 'pnpm install' to update lock file" -ForegroundColor White
    Write-Host "   2. Test build: 'pnpm build'" -ForegroundColor White
    Write-Host "   3. Commit changes when satisfied" -ForegroundColor White
    
    if (-not $Unpin) {
        Write-Host ""
        Write-Host "⚠️  Remember: Pinned versions require manual updates" -ForegroundColor Yellow
        Write-Host "   Use hierarchical-package-update.ps1 for safe updates" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "⚓ Version management is the anchor of stability!" -ForegroundColor Cyan
