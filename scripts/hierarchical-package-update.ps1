# 📊 HIERARCHICAL PACKAGE UPDATE SYSTEM 📊
# Captain Guthilda's Systematic Dependency Orchestration
#
# Usage: ./scripts/hierarchical-package-update.ps1 [-WhatIf] [-Execute] [-Tier <number>] [-Force]
#
# This script updates dependencies in hierarchical order to prevent cascades

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(HelpMessage = "Show what would be updated without executing")]
    [switch]$WhatIf,
    
    [Parameter(HelpMessage = "Execute the updates (required for actual changes)")]
    [switch]$Execute,
    
    [Parameter(HelpMessage = "Update only specific tier (0-7)")]
    [ValidateRange(0, 7)]
    [int]$Tier = -1,
    
    [Parameter(HelpMessage = "Skip confirmation prompts")]
    [switch]$Force,
    
    [Parameter(HelpMessage = "Pin to exact versions after update")]
    [switch]$PinVersions
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Validate parameters
if (-not $WhatIf -and -not $Execute) {
    Write-Host "❌ You must specify either -WhatIf or -Execute" -ForegroundColor Red
    Write-Host "   Use -WhatIf to preview changes" -ForegroundColor Yellow
    Write-Host "   Use -Execute to perform updates" -ForegroundColor Yellow
    exit 1
}

Write-Host "📊 HIERARCHICAL PACKAGE UPDATE SYSTEM 📊" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""
Write-Host "Captain Guthilda's Systematic Dependency Orchestration" -ForegroundColor Magenta
Write-Host ""

if ($WhatIf) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
} else {
    Write-Host "⚡ EXECUTION MODE - Updates will be performed" -ForegroundColor Green
}
Write-Host ""

# Define the hierarchy
$updateTiers = @{
    0 = @{
        Name = "Infrastructure Foundation"
        Description = "Core language and type systems"
        Color = "Red"
        Icon = "🏗️"
        Packages = @(
            @{ Name = "@types/node"; Scope = "root"; Latest = "^24.3.0" }
            @{ Name = "typescript"; Scope = "root"; Latest = "^5.9.2" }
            @{ Name = "tsup"; Scope = "root"; Latest = "^8.5.0" }
        )
    }
    1 = @{
        Name = "Build System"
        Description = "Build tools and bundlers"
        Color = "DarkRed"
        Icon = "⚙️"
        Packages = @(
            @{ Name = "turbo"; Scope = "root"; Latest = "^2.5.6" }
            @{ Name = "vite"; Scope = "@mcp/monitor"; Latest = "^7.1.3" }
            @{ Name = "@vitejs/plugin-react-swc"; Scope = "@mcp/monitor"; Latest = "^3.6.0" }
        )
    }
    2 = @{
        Name = "Quality Tools"
        Description = "Linting, formatting, and git hooks"
        Color = "Yellow"
        Icon = "🔍"
        Packages = @(
            @{ Name = "eslint"; Scope = "root"; Latest = "^9.34.0" }
            @{ Name = "@typescript-eslint/eslint-plugin"; Scope = "root"; Latest = "^8.41.0" }
            @{ Name = "@typescript-eslint/parser"; Scope = "root"; Latest = "^8.41.0" }
            @{ Name = "prettier"; Scope = "root"; Latest = "^3.6.2" }
            @{ Name = "husky"; Scope = "root"; Latest = "^9.0.11" }
            @{ Name = "lint-staged"; Scope = "root"; Latest = "^16.1.5" }
        )
    }
    3 = @{
        Name = "Testing Framework"
        Description = "Test runners and utilities"
        Color = "Green"
        Icon = "🧪"
        Packages = @(
            @{ Name = "vitest"; Scope = "root"; Latest = "^3.2.4" }
        )
    }
    4 = @{
        Name = "Application Core"
        Description = "Core application dependencies"
        Color = "Blue"
        Icon = "🎯"
        Packages = @(
            @{ Name = "express"; Scope = "@mcp/core"; Latest = "^5.1.0" }
            @{ Name = "@types/express"; Scope = "@mcp/core"; Latest = "^5.0.3" }
            @{ Name = "zod"; Scope = "@mcp/core"; Latest = "^3.25.1" }
            @{ Name = "winston"; Scope = "@mcp/core"; Latest = "^3.11.0" }
            @{ Name = "node-fetch"; Scope = "@mcp/core"; Latest = "^3.3.2" }
            @{ Name = "express-rate-limit"; Scope = "@mcp/core"; Latest = "^8.0.1" }
        )
    }
    5 = @{
        Name = "Frontend Framework"
        Description = "React and React ecosystem"
        Color = "Cyan"
        Icon = "⚛️"
        Packages = @(
            @{ Name = "react"; Scope = "@mcp/monitor"; Latest = "^19.1.1" }
            @{ Name = "react-dom"; Scope = "@mcp/monitor"; Latest = "^19.1.1" }
            @{ Name = "@types/react"; Scope = "@mcp/monitor"; Latest = "^19.1.9" }
            @{ Name = "@types/react-dom"; Scope = "@mcp/monitor"; Latest = "^19.1.7" }
            @{ Name = "@tanstack/react-query"; Scope = "@mcp/monitor"; Latest = "^5.32.1" }
        )
    }
    6 = @{
        Name = "UI & Styling"
        Description = "CSS frameworks and UI components"
        Color = "Magenta"
        Icon = "🎨"
        Packages = @(
            @{ Name = "tailwindcss"; Scope = "@mcp/monitor"; Latest = "^4.1.11" }
            @{ Name = "@tailwindcss/postcss"; Scope = "@mcp/monitor"; Latest = "^4.1.11" }
            @{ Name = "tailwindcss-animate"; Scope = "@mcp/monitor"; Latest = "^1.0.7" }
            @{ Name = "postcss"; Scope = "@mcp/monitor"; Latest = "^8.4.35" }
            @{ Name = "autoprefixer"; Scope = "@mcp/monitor"; Latest = "^10.4.17" }
            @{ Name = "clsx"; Scope = "@mcp/monitor"; Latest = "^2.1.0" }
            @{ Name = "tailwind-merge"; Scope = "@mcp/monitor"; Latest = "^2.2.1" }
        )
    }
    7 = @{
        Name = "Specialized Libraries"
        Description = "Icons, state management, and utilities"
        Color = "DarkCyan"
        Icon = "🔧"
        Packages = @(
            @{ Name = "lucide-react"; Scope = "@mcp/monitor"; Latest = "^0.525.0" }
            @{ Name = "zustand"; Scope = "@mcp/monitor"; Latest = "^5.0.6" }
        )
    }
}

function Write-TierHeader {
    param(
        [int]$TierNumber,
        [hashtable]$TierData
    )
    Write-Host ""
    Write-Host "$($TierData.Icon) TIER ${TierNumber}: $($TierData.Name)" -ForegroundColor $TierData.Color
    Write-Host "   $($TierData.Description)" -ForegroundColor DarkGray
    Write-Host "   Packages: $($TierData.Packages.Count)" -ForegroundColor DarkGray
    Write-Host ""
}

function Get-LatestVersion {
    param([string]$PackageName)
    try {
        $result = npm info $PackageName@latest version 2>$null
        if ($result) {
            return "^$result"
        }
    }
    catch {
        Write-Host "      ⚠️  Could not fetch latest version for $PackageName" -ForegroundColor Yellow
    }
    return $null
}

function Update-Package {
    param(
        [string]$PackageName,
        [string]$Scope,
        [string]$LatestVersion,
        [bool]$DryRun
    )
    
    Write-Host "   📦 $PackageName" -ForegroundColor White
    
    # Get actual latest version
    $actualLatest = Get-LatestVersion $PackageName
    if ($actualLatest) {
        Write-Host "      Latest: $actualLatest" -ForegroundColor Green
    } else {
        Write-Host "      Latest: $LatestVersion (cached)" -ForegroundColor Yellow
        $actualLatest = $LatestVersion
    }
    
    if ($DryRun) {
        if ($Scope -eq "root") {
            Write-Host "      Would run: pnpm update $PackageName@latest" -ForegroundColor DarkGray
        } else {
            Write-Host "      Would run: pnpm update $PackageName@latest --filter $Scope" -ForegroundColor DarkGray
        }
        return $true
    }
    
    try {
        if ($Scope -eq "root") {
            $pnpmArgs = @("update", "$PackageName@latest")
        } else {
            $pnpmArgs = @("update", "$PackageName@latest", "--filter", $Scope)
        }
        
        Write-Host "      Running: pnpm $($pnpmArgs -join ' ')" -ForegroundColor DarkGray
        Start-Process -FilePath "pnpm" -ArgumentList $pnpmArgs -Wait -NoNewWindow -ErrorAction Stop
        Write-Host "      ✅ Updated successfully" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "      ❌ Update failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-BuildAfterTier {
    param([int]$TierNumber)
    
    Write-Host ""
    Write-Host "🧪 Testing build after Tier $TierNumber..." -ForegroundColor Yellow
    
    try {
        Start-Process -FilePath "pnpm" -ArgumentList @("build") -Wait -NoNewWindow -ErrorAction Stop
        Write-Host "✅ Build successful after Tier $TierNumber" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Build failed after Tier $TierNumber" -ForegroundColor Red
        Write-Host "   You may need to fix issues before continuing" -ForegroundColor Yellow
        return $false
    }
}

# Main execution
$startTier = if ($Tier -ge 0) { $Tier } else { 0 }
$endTier = if ($Tier -ge 0) { $Tier } else { 7 }

$totalPackages = 0
$successCount = 0
$failureCount = 0

for ($tierNum = $startTier; $tierNum -le $endTier; $tierNum++) {
    $tierData = $updateTiers[$tierNum]
    Write-TierHeader $tierNum $tierData
    
    foreach ($package in $tierData.Packages) {
        $totalPackages++
        $success = Update-Package -PackageName $package.Name -Scope $package.Scope -LatestVersion $package.Latest -DryRun $WhatIf
        if ($success) {
            $successCount++
        } else {
            $failureCount++
        }
    }
    
    # Test build after each tier (except in dry run mode)
    if (-not $WhatIf -and $tierNum -lt $endTier) {
        $buildSuccess = Test-BuildAfterTier $tierNum
        if (-not $buildSuccess -and -not $Force) {
            $continue = Read-Host "Build failed. Continue anyway? (y/n)"
            if ($continue -ne "y") {
                Write-Host "❌ Update process halted by user" -ForegroundColor Red
                exit 1
            }
        }
    }
}

# Pin versions if requested
if ($PinVersions -and -not $WhatIf) {
    Write-Host ""
    Write-Host "📌 Pinning versions to prevent drift..." -ForegroundColor Blue
    
    # This would involve reading package.json files and converting ^ to exact versions
    # Implementation would go here
    Write-Host "   Version pinning will be implemented in future version" -ForegroundColor Yellow
}

# Final summary
Write-Host ""
Write-Host "🎉 HIERARCHICAL UPDATE COMPLETE! 🎉" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "📊 Update Summary:" -ForegroundColor Cyan
Write-Host "   Total packages processed: $totalPackages" -ForegroundColor White
Write-Host "   Successful updates: $successCount" -ForegroundColor Green
Write-Host "   Failed updates: $failureCount" -ForegroundColor Red
Write-Host ""

if ($WhatIf) {
    Write-Host "🔍 This was a dry run. To execute updates, run:" -ForegroundColor Yellow
    Write-Host "   ./scripts/hierarchical-package-update.ps1 -Execute" -ForegroundColor White
} else {
    Write-Host "⚓ Captain's Final Orders:" -ForegroundColor Magenta
    Write-Host "   1. Run 'pnpm build' to verify everything works" -ForegroundColor White
    Write-Host "   2. Run 'pnpm test' to ensure tests pass" -ForegroundColor White
    Write-Host "   3. Commit your changes when satisfied" -ForegroundColor White
}
Write-Host ""
