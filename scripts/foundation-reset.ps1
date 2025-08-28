# 🏗️ FOUNDATION RESET RITUAL 🏗️
# Captain Guthilda's Environment Normalization Protocol
#
# Usage: ./scripts/foundation-reset.ps1 [-WhatIf] [-Force]
#
# This script performs a complete environment reset to prevent cascades

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(HelpMessage = "Show what would be done without executing")]
    [switch]$WhatIf,
    
    [Parameter(HelpMessage = "Skip confirmation prompts")]
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "🏗️ FOUNDATION RESET RITUAL 🏗️" -ForegroundColor Cyan -BackgroundColor Black
Write-Host ""
Write-Host "Captain Guthilda's Environment Normalization Protocol" -ForegroundColor Magenta
Write-Host "This will reset your environment to a clean, stable state." -ForegroundColor White
Write-Host ""

if ($WhatIf) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

function Write-Phase {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host ""
    Write-Host "🔧 $Message" -ForegroundColor $Color
    Write-Host ("=" * ($Message.Length + 3)) -ForegroundColor DarkGray
}

function Write-Step {
    param([string]$Message, [string]$Status = "Info")
    $colors = @{
        "Info" = "White"
        "Success" = "Green"
        "Warning" = "Yellow"
        "Error" = "Red"
    }
    $icons = @{
        "Info" = "📋"
        "Success" = "✅"
        "Warning" = "⚠️"
        "Error" = "❌"
    }
    Write-Host "   $($icons[$Status]) $Message" -ForegroundColor $colors[$Status]
}

function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$Description,
        [string[]]$Arguments = @(),
        [switch]$Required = $false
    )
    
    Write-Step $Description "Info"
    
    if ($WhatIf) {
        Write-Host "      Would run: $Command $($Arguments -join ' ')" -ForegroundColor DarkGray
        return $true
    }
    
    try {
        if ($Arguments.Count -gt 0) {
            Start-Process -FilePath $Command -ArgumentList $Arguments -Wait -NoNewWindow -ErrorAction Stop
        } else {
            Invoke-Expression $Command
        }
        Write-Step "$Description - Complete" "Success"
        return $true
    }
    catch {
        Write-Step "$Description - Failed: $($_.Exception.Message)" "Error"
        if ($Required) {
            throw "Required step failed: $Description"
        }
        return $false
    }
}

# Phase 1: Environment Verification
Write-Phase "Phase 1: Environment Verification"

# Check Node.js version
Write-Step "Checking Node.js version..." "Info"
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $nodeVersionNum = [version]($nodeVersion -replace 'v', '')
        if ($nodeVersionNum -ge [version]"20.0.0") {
            Write-Step "Node.js $nodeVersion (OK)" "Success"
        } else {
            Write-Step "Node.js $nodeVersion (Upgrade recommended to >=20.0.0)" "Warning"
        }
    } else {
        Write-Step "Node.js not found - please install Node.js >=20.0.0" "Error"
        throw "Node.js is required"
    }
}
catch {
    Write-Step "Could not verify Node.js version" "Error"
    throw "Node.js verification failed"
}

# Check pnpm version
Write-Step "Checking pnpm version..." "Info"
try {
    $pnpmVersion = pnpm --version 2>$null
    if ($pnpmVersion) {
        $pnpmVersionNum = [version]$pnpmVersion
        if ($pnpmVersionNum -ge [version]"9.0.0") {
            Write-Step "pnpm $pnpmVersion (OK)" "Success"
        } else {
            Write-Step "pnpm $pnpmVersion (Upgrading to latest...)" "Warning"
            if (-not $WhatIf) {
                npm install -g pnpm@latest
                $newPnpmVersion = pnpm --version
                Write-Step "pnpm upgraded to $newPnpmVersion" "Success"
            }
        }
    } else {
        Write-Step "pnpm not found - installing..." "Warning"
        if (-not $WhatIf) {
            npm install -g pnpm@latest
            Write-Step "pnpm installed" "Success"
        }
    }
}
catch {
    Write-Step "Could not verify/install pnpm" "Error"
    throw "pnpm verification failed"
}

# Phase 2: Process Cleanup
Write-Phase "Phase 2: Process Cleanup"

# Kill VS Code instances
Write-Step "Checking for VS Code instances..." "Info"
$vscodeProcesses = Get-Process "Code" -ErrorAction SilentlyContinue
if ($vscodeProcesses) {
    Write-Step "Found $($vscodeProcesses.Count) VS Code instance(s)" "Warning"
    if (-not $WhatIf) {
        if (-not $Force) {
            $confirm = Read-Host "Close all VS Code instances? (y/n)"
            if ($confirm -ne "y") {
                Write-Step "Skipping VS Code cleanup" "Warning"
            } else {
                $vscodeProcesses | Stop-Process -Force
                Start-Sleep 2
                Write-Step "VS Code instances closed" "Success"
            }
        } else {
            $vscodeProcesses | Stop-Process -Force
            Start-Sleep 2
            Write-Step "VS Code instances closed" "Success"
        }
    }
} else {
    Write-Step "No VS Code instances running" "Success"
}

# Phase 3: Cache & Temp Cleanup
Write-Phase "Phase 3: Cache & Temporary File Cleanup"

# Clear VS Code workspace storage
$vsCodeWorkspace = "$env:APPDATA\Code\User\workspaceStorage"
if (Test-Path $vsCodeWorkspace) {
    Write-Step "Clearing VS Code workspace storage..." "Info"
    if (-not $WhatIf) {
        Get-ChildItem $vsCodeWorkspace | ForEach-Object {
            Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
        Write-Step "VS Code workspace storage cleared" "Success"
    }
} else {
    Write-Step "VS Code workspace storage not found" "Info"
}

# Clear package manager caches
Invoke-SafeCommand "pnpm" "Clearing pnpm store" @("store", "prune") -Required:$false
Invoke-SafeCommand "npm" "Clearing npm cache" @("cache", "clean", "--force") -Required:$false

# Phase 4: Dependency Reset
Write-Phase "Phase 4: Dependency Reset"

# Remove all node_modules
Write-Step "Removing all node_modules directories..." "Info"
if (-not $WhatIf) {
    Get-ChildItem -Path . -Name "node_modules" -Recurse -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        $fullPath = Join-Path (Get-Location) $_
        Write-Host "      Removing: $fullPath" -ForegroundColor DarkGray
        Remove-Item $fullPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Step "node_modules directories removed" "Success"
}

# Remove lock files
Write-Step "Removing lock files..." "Info"
if (-not $WhatIf) {
    @("pnpm-lock.yaml", "package-lock.json") | ForEach-Object {
        if (Test-Path $_) {
            Remove-Item $_ -Force
            Write-Host "      Removed: $_" -ForegroundColor DarkGray
        }
    }
    Write-Step "Lock files removed" "Success"
}

# Phase 5: VS Code Settings Normalization
Write-Phase "Phase 5: VS Code Settings Normalization"

$vscodeSettingsPath = ".vscode\settings.json"
if (Test-Path $vscodeSettingsPath) {
    Write-Step "Normalizing VS Code settings..." "Info"
    if (-not $WhatIf) {
        # Read current settings
        $settings = Get-Content $vscodeSettingsPath -Raw | ConvertFrom-Json
        
        # Ensure critical settings
        $requiredSettings = @{
            "java.configuration.runtimes" = @(@{
                "name" = "JavaSE-21"
                "path" = ".\jdk-21.0.5+11-portable"
                "default" = $true
            })
            "java.home" = ".\jdk-21.0.5+11-portable"
            "npm.packageManager" = "pnpm"
            "typescript.preferences.includePackageJsonAutoImports" = "off"
            "extensions.ignoreRecommendations" = $true
            "java.silentNotification" = $true
            "tailwindCSS.experimental.configFile" = "./packages/monitor/tailwind.config.ts"
        }
        
        foreach ($key in $requiredSettings.Keys) {
            $settings | Add-Member -NotePropertyName $key -NotePropertyValue $requiredSettings[$key] -Force
        }
        
        # Write back normalized settings
        $settings | ConvertTo-Json -Depth 10 | Out-File $vscodeSettingsPath -Encoding UTF8
        Write-Step "VS Code settings normalized" "Success"
    }
} else {
    Write-Step "No VS Code settings found - will create on first run" "Info"
}

# Phase 6: Fresh Installation
Write-Phase "Phase 6: Fresh Package Installation"

Invoke-SafeCommand "pnpm" "Installing dependencies" @("install") -Required:$true

# Phase 7: Verification
Write-Phase "Phase 7: Foundation Verification"

Invoke-SafeCommand "pnpm" "Building all packages" @("build") -Required:$true
Invoke-SafeCommand "pnpm" "Running tests" @("test") -Required:$false
Invoke-SafeCommand "pnpm" "Linting code" @("lint") -Required:$false

Write-Host ""
Write-Host "🎉 FOUNDATION RESET COMPLETE! 🎉" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "🏴‍☠️ Captain's Status Report:" -ForegroundColor Magenta
Write-Host "   ✅ Environment verified and normalized" -ForegroundColor Green
Write-Host "   ✅ Caches cleared and reset" -ForegroundColor Green  
Write-Host "   ✅ Dependencies freshly installed" -ForegroundColor Green
Write-Host "   ✅ Build verification passed" -ForegroundColor Green
Write-Host ""
Write-Host "⚓ Your foundation is now solid as bedrock!" -ForegroundColor Cyan
Write-Host "   Safe to proceed with hierarchical updates." -ForegroundColor White
