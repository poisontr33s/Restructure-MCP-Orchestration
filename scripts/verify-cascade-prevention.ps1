# 🔍 CASCADE PREVENTION VERIFICATION 🔍
# Captain Guthilda's Health Check & Validation Protocol
#
# Usage: ./scripts/verify-cascade-prevention.ps1 [-Detailed] [-Fix]
#
# This script verifies that cascade prevention measures are in place

[CmdletBinding()]
param(
    [Parameter(HelpMessage = "Show detailed information about each check")]
    [switch]$Detailed,
    
    [Parameter(HelpMessage = "Attempt to fix issues automatically")]
    [switch]$Fix
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

Write-Host "🔍 CASCADE PREVENTION VERIFICATION 🔍" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""
Write-Host "Captain Guthilda's Health Check & Validation Protocol" -ForegroundColor Magenta
Write-Host ""

$global:ChecksPassed = 0
$global:ChecksFailed = 0
$global:ChecksWarning = 0

function Write-CheckHeader {
    param([string]$Category, [string]$Icon = "🔧")
    Write-Host ""
    Write-Host "$Icon $Category" -ForegroundColor Cyan
    Write-Host ("=" * ($Category.Length + 3)) -ForegroundColor DarkGray
}

function Write-CheckResult {
    param(
        [string]$Description,
        [string]$Status,  # "Pass", "Fail", "Warning"
        [string]$Details = "",
        [string]$Recommendation = ""
    )
    
    $icons = @{
        "Pass" = "✅"
        "Fail" = "❌"
        "Warning" = "⚠️"
    }
    
    $colors = @{
        "Pass" = "Green"
        "Fail" = "Red" 
        "Warning" = "Yellow"
    }
    
    Write-Host "   $($icons[$Status]) $Description" -ForegroundColor $colors[$Status]
    
    if ($Detailed -and $Details) {
        Write-Host "      Details: $Details" -ForegroundColor DarkGray
    }
    
    if ($Recommendation) {
        Write-Host "      Recommendation: $Recommendation" -ForegroundColor Yellow
    }
    
    switch ($Status) {
        "Pass" { $global:ChecksPassed++ }
        "Fail" { $global:ChecksFailed++ }
        "Warning" { $global:ChecksWarning++ }
    }
}

function Test-SingleVSCodeInstance {
    Write-CheckHeader "VS Code Instance Management" "🖥️"
    
    $vscodeProcesses = Get-Process "Code" -ErrorAction SilentlyContinue
    if (-not $vscodeProcesses) {
        Write-CheckResult "VS Code Instances" "Pass" "No VS Code instances running"
    } elseif ($vscodeProcesses.Count -eq 1) {
        Write-CheckResult "VS Code Instances" "Pass" "Single VS Code instance running"
    } else {
        Write-CheckResult "VS Code Instances" "Fail" "$($vscodeProcesses.Count) VS Code instances running" "Close extra instances or run emergency-cascade-halt.ps1"
        
        if ($Fix) {
            Write-Host "      🔧 Attempting to close extra VS Code instances..." -ForegroundColor Blue
            $vscodeProcesses | Select-Object -Skip 1 | Stop-Process -Force
            Start-Sleep 2
            Write-Host "      ✅ Extra instances closed" -ForegroundColor Green
        }
    }
    
    # Check VS Code workspace storage
    $workspaceStorage = "$env:APPDATA\Code\User\workspaceStorage"
    if (Test-Path $workspaceStorage) {
        $storageSize = (Get-ChildItem $workspaceStorage -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $storageSizeMB = [math]::Round($storageSize / 1MB, 2)
        
        if ($storageSizeMB -lt 100) {
            Write-CheckResult "Workspace Storage Size" "Pass" "$storageSizeMB MB"
        } elseif ($storageSizeMB -lt 500) {
            Write-CheckResult "Workspace Storage Size" "Warning" "$storageSizeMB MB" "Consider clearing workspace storage"
        } else {
            Write-CheckResult "Workspace Storage Size" "Fail" "$storageSizeMB MB" "Clear workspace storage with foundation-reset.ps1"
        }
    } else {
        Write-CheckResult "Workspace Storage" "Pass" "Directory not found (fresh install)"
    }
}

function Test-NodeEnvironment {
    Write-CheckHeader "Node.js Environment" "🟢"
    
    # Check Node.js version
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            $nodeVersionNum = [version]($nodeVersion -replace 'v', '')
            if ($nodeVersionNum -ge [version]"20.0.0") {
                Write-CheckResult "Node.js Version" "Pass" "$nodeVersion"
            } elseif ($nodeVersionNum -ge [version]"18.0.0") {
                Write-CheckResult "Node.js Version" "Warning" "$nodeVersion" "Upgrade to Node.js 20+ recommended"
            } else {
                Write-CheckResult "Node.js Version" "Fail" "$nodeVersion" "Upgrade to Node.js 20+ required"
            }
        } else {
            Write-CheckResult "Node.js Installation" "Fail" "Node.js not found" "Install Node.js 20+"
        }
    }
    catch {
        Write-CheckResult "Node.js Installation" "Fail" "Could not check Node.js" "Install Node.js 20+"
    }
    
    # Check pnpm version
    try {
        $pnpmVersion = pnpm --version 2>$null
        if ($pnpmVersion) {
            $pnpmVersionNum = [version]$pnpmVersion
            if ($pnpmVersionNum -ge [version]"9.0.0") {
                Write-CheckResult "pnpm Version" "Pass" "$pnpmVersion"
            } elseif ($pnpmVersionNum -ge [version]"8.0.0") {
                Write-CheckResult "pnpm Version" "Warning" "$pnpmVersion" "Upgrade to pnpm 9+ recommended"
            } else {
                Write-CheckResult "pnpm Version" "Fail" "$pnpmVersion" "Upgrade to pnpm 9+ required"
            }
        } else {
            Write-CheckResult "pnpm Installation" "Fail" "pnpm not found" "Install pnpm: npm install -g pnpm@latest"
        }
    }
    catch {
        Write-CheckResult "pnpm Installation" "Fail" "Could not check pnpm" "Install pnpm: npm install -g pnpm@latest"
    }
}

function Test-PackageIntegrity {
    Write-CheckHeader "Package Integrity" "📦"
    
    # Check for package-lock.json (should not exist)
    if (Test-Path "package-lock.json") {
        Write-CheckResult "npm Lock File" "Fail" "package-lock.json found" "Remove package-lock.json and use pnpm-lock.yaml"
        
        if ($Fix) {
            Remove-Item "package-lock.json" -Force
            Write-Host "      🔧 Removed package-lock.json" -ForegroundColor Blue
        }
    } else {
        Write-CheckResult "npm Lock File" "Pass" "No package-lock.json found"
    }
    
    # Check for pnpm-lock.yaml
    if (Test-Path "pnpm-lock.yaml") {
        Write-CheckResult "pnpm Lock File" "Pass" "pnpm-lock.yaml exists"
    } else {
        Write-CheckResult "pnpm Lock File" "Warning" "pnpm-lock.yaml not found" "Run 'pnpm install' to generate"
    }
    
    # Check for node_modules
    if (Test-Path "node_modules") {
        Write-CheckResult "Node Modules" "Pass" "node_modules directory exists"
    } else {
        Write-CheckResult "Node Modules" "Warning" "node_modules not found" "Run 'pnpm install'"
    }
    
    # Check package.json integrity
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        
        # Check packageManager field
        if ($packageJson.packageManager -and $packageJson.packageManager -like "pnpm@*") {
            Write-CheckResult "Package Manager Config" "Pass" "$($packageJson.packageManager)"
        } else {
            Write-CheckResult "Package Manager Config" "Warning" "packageManager field missing or incorrect" "Set packageManager to pnpm@latest"
        }
        
        # Check engines
        if ($packageJson.engines -and $packageJson.engines.node) {
            Write-CheckResult "Node Engine Requirement" "Pass" "$($packageJson.engines.node)"
        } else {
            Write-CheckResult "Node Engine Requirement" "Warning" "Node engine requirement missing" "Add engines.node to package.json"
        }
        
    }
    catch {
        Write-CheckResult "Package.json Integrity" "Fail" "Could not parse package.json" "Fix package.json syntax"
    }
}

function Test-VSCodeSettings {
    Write-CheckHeader "VS Code Configuration" "⚙️"
    
    $settingsPath = ".vscode\settings.json"
    if (Test-Path $settingsPath) {
        try {
            $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
            
            # Check Java configuration
            if ($settings.'java.home' -and $settings.'java.home' -eq ".\jdk-21.0.5+11-portable") {
                Write-CheckResult "Java Home Configuration" "Pass" "Portable Java 21 configured"
            } else {
                Write-CheckResult "Java Home Configuration" "Warning" "Java home not set to portable" "Configure java.home in VS Code settings"
            }
            
            # Check npm package manager
            if ($settings.'npm.packageManager' -eq "pnpm") {
                Write-CheckResult "Package Manager Setting" "Pass" "npm.packageManager set to pnpm"
            } else {
                Write-CheckResult "Package Manager Setting" "Warning" "npm.packageManager not set to pnpm" "Set npm.packageManager to pnpm"
            }
            
            # Check TailwindCSS config
            if ($settings.'tailwindCSS.experimental.configFile') {
                Write-CheckResult "TailwindCSS Configuration" "Pass" "TailwindCSS config file specified"
            } else {
                Write-CheckResult "TailwindCSS Configuration" "Warning" "TailwindCSS config not specified" "Set tailwindCSS.experimental.configFile"
            }
            
            # Check extension recommendations
            if ($settings.'extensions.ignoreRecommendations' -eq $true) {
                Write-CheckResult "Extension Recommendations" "Pass" "Extension recommendations disabled"
            } else {
                Write-CheckResult "Extension Recommendations" "Warning" "Extension recommendations enabled" "Disable to prevent popups"
            }
            
        }
        catch {
            Write-CheckResult "VS Code Settings Parse" "Fail" "Could not parse .vscode/settings.json" "Fix settings.json syntax"
        }
    } else {
        Write-CheckResult "VS Code Settings File" "Warning" ".vscode/settings.json not found" "Create settings.json with proper configuration"
    }
}

function Test-BuildSystem {
    Write-CheckHeader "Build System Health" "🏗️"
    
    # Test build
    Write-Host "   🔧 Testing build..." -ForegroundColor Blue
    try {
        $buildResult = Start-Process -FilePath "pnpm" -ArgumentList @("build") -Wait -PassThru -NoNewWindow -RedirectStandardError "NUL" -RedirectStandardOutput "NUL"
        if ($buildResult.ExitCode -eq 0) {
            Write-CheckResult "Build Test" "Pass" "All packages build successfully"
        } else {
            Write-CheckResult "Build Test" "Fail" "Build failed with exit code $($buildResult.ExitCode)" "Run 'pnpm build' to see errors"
        }
    }
    catch {
        Write-CheckResult "Build Test" "Fail" "Could not run build" "Check pnpm installation"
    }
    
    # Test linting
    Write-Host "   🔧 Testing linter..." -ForegroundColor Blue
    try {
        $lintResult = Start-Process -FilePath "pnpm" -ArgumentList @("lint") -Wait -PassThru -NoNewWindow -RedirectStandardError "NUL" -RedirectStandardOutput "NUL"
        if ($lintResult.ExitCode -eq 0) {
            Write-CheckResult "Lint Test" "Pass" "No linting errors found"
        } else {
            Write-CheckResult "Lint Test" "Warning" "Linting issues found" "Run 'pnpm lint' to see issues"
        }
    }
    catch {
        Write-CheckResult "Lint Test" "Warning" "Could not run linter" "Check eslint configuration"
    }
}

function Test-GitState {
    Write-CheckHeader "Git Repository State" "📚"
    
    # Check if we're in a git repository
    try {
        $null = git rev-parse --git-dir 2>$null
        Write-CheckResult "Git Repository" "Pass" "Git repository detected"
        
        # Check working tree status
        $gitStatus = git status --porcelain 2>$null
        if (-not $gitStatus) {
            Write-CheckResult "Working Tree" "Pass" "Working tree is clean"
        } else {
            $changedFiles = ($gitStatus | Measure-Object).Count
            Write-CheckResult "Working Tree" "Warning" "$changedFiles file(s) with changes" "Commit or stash changes"
        }
        
        # Check for untracked files that shouldn't exist
        $untrackedLockFiles = git ls-files --others --ignored --exclude-standard | Where-Object { $_ -like "package-lock.json" -or $_ -like "yarn.lock" }
        if ($untrackedLockFiles) {
            Write-CheckResult "Unwanted Lock Files" "Warning" "$($untrackedLockFiles -join ', ') found" "Remove these lock files"
        } else {
            Write-CheckResult "Lock File Cleanliness" "Pass" "No unwanted lock files"
        }
        
    }
    catch {
        Write-CheckResult "Git Repository" "Warning" "Not a git repository or git not available" "Initialize git repository"
    }
}

# Run all checks
Test-SingleVSCodeInstance
Test-NodeEnvironment  
Test-PackageIntegrity
Test-VSCodeSettings
Test-BuildSystem
Test-GitState

# Final summary
Write-Host ""
Write-Host "📊 VERIFICATION SUMMARY 📊" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""

$totalChecks = $global:ChecksPassed + $global:ChecksFailed + $global:ChecksWarning
Write-Host "Total Checks: $totalChecks" -ForegroundColor White
Write-Host "✅ Passed: $global:ChecksPassed" -ForegroundColor Green
Write-Host "⚠️  Warnings: $global:ChecksWarning" -ForegroundColor Yellow  
Write-Host "❌ Failed: $global:ChecksFailed" -ForegroundColor Red
Write-Host ""

# Overall health assessment
if ($global:ChecksFailed -eq 0 -and $global:ChecksWarning -eq 0) {
    Write-Host "🎉 EXCELLENT! Your environment is optimally configured!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "   No cascade risk detected. Safe to proceed with updates." -ForegroundColor Green
} elseif ($global:ChecksFailed -eq 0) {
    Write-Host "😊 GOOD! Minor warnings detected but no critical issues." -ForegroundColor Yellow -BackgroundColor Black
    Write-Host "   Low cascade risk. Address warnings when convenient." -ForegroundColor Yellow
} elseif ($global:ChecksFailed -le 2) {
    Write-Host "⚠️  CAUTION! Some issues need attention." -ForegroundColor Yellow -BackgroundColor Black
    Write-Host "   Medium cascade risk. Fix critical issues before updates." -ForegroundColor Yellow
} else {
    Write-Host "🚨 DANGER! Multiple critical issues detected!" -ForegroundColor Red -BackgroundColor Black
    Write-Host "   HIGH cascade risk. Run foundation-reset.ps1 immediately." -ForegroundColor Red
}

Write-Host ""
Write-Host "🏴‍☠️ Captain's Recommendations:" -ForegroundColor Magenta

if ($global:ChecksFailed -gt 0) {
    Write-Host "   1. Address all failed checks immediately" -ForegroundColor Red
    Write-Host "   2. Run foundation-reset.ps1 for major issues" -ForegroundColor Red
    Write-Host "   3. Re-run this verification after fixes" -ForegroundColor Red
}

if ($global:ChecksWarning -gt 0) {
    Write-Host "   1. Review warnings and fix when possible" -ForegroundColor Yellow
    Write-Host "   2. Use -Fix flag to auto-fix some issues" -ForegroundColor Yellow
}

Write-Host "   ⚓ Regular verification prevents cascade disasters!" -ForegroundColor Cyan
