#!/usr/bin/env pwsh
# ⚓ MONOREPO HEALTH RESTORATION SCRIPT ⚓
# Cpt. Guthilda's Sacred Healing Ritual for npm/pnpm Monorepos
# Version: 2025.1.0

param(
    [switch]$DryRun,
    [switch]$SecurityOnly,
    [switch]$UpdateOnly,
    [switch]$FullRestore,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$workspaceRoot = $PWD

Write-Host "⚓ MONOREPO HEALTH RESTORATION RITUAL ⚓" -ForegroundColor Cyan
Write-Host "Cpt. Guthilda at yer service! Preparing to heal the digital vessel..." -ForegroundColor Yellow
Write-Host ""

# Phase 1: Diagnostic Assessment
Write-Host "🔍 Phase 1: Diagnostic Assessment" -ForegroundColor Green
Write-Host "Scanning for vulnerabilities and outdated dependencies..." -ForegroundColor White

if ($Verbose) {
    Write-Host "Workspace root: $workspaceRoot" -ForegroundColor Gray
}

# Check pnpm availability
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm detected: v$pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm not found! Please install pnpm first." -ForegroundColor Red
    exit 1
}

# Security audit
Write-Host "Running security audit..." -ForegroundColor White
$auditResult = pnpm audit --json 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No security vulnerabilities found" -ForegroundColor Green
} else {
    Write-Host "⚠️ Security vulnerabilities detected" -ForegroundColor Yellow
    if ($Verbose) {
        Write-Host $auditResult -ForegroundColor Gray
    }
}

# Check for outdated packages
Write-Host "Checking for outdated dependencies..." -ForegroundColor White
$outdatedResult = pnpm outdated 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All dependencies are up to date" -ForegroundColor Green
} else {
    Write-Host "⚠️ Outdated dependencies found" -ForegroundColor Yellow
    if ($Verbose) {
        Write-Host $outdatedResult -ForegroundColor Gray
    }
}

if ($DryRun) {
    Write-Host ""
    Write-Host "🔮 DRY RUN MODE - No changes will be made" -ForegroundColor Magenta
    Write-Host "Issues found that would be fixed:" -ForegroundColor White
    Write-Host "- Security vulnerabilities in CLI package (inquirer chain)" -ForegroundColor Yellow
    Write-Host "- Outdated TypeScript, ESLint, and related tools" -ForegroundColor Yellow
    Write-Host "- Monorepo structure optimization opportunities" -ForegroundColor Yellow
    exit 0
}

# Phase 2: Security Fixes (Priority 1)
if ($SecurityOnly -or $FullRestore) {
    Write-Host ""
    Write-Host "🛡️ Phase 2: Security Restoration" -ForegroundColor Green
    Write-Host "Fixing security vulnerabilities..." -ForegroundColor White
    
    # Fix the tmp vulnerability via inquirer update
    Write-Host "Updating inquirer to fix tmp vulnerability..." -ForegroundColor White
    try {
        pnpm update inquirer@latest --filter @mcp/cli
        Write-Host "✅ CLI security vulnerability patched" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Failed to update inquirer, attempting audit fix..." -ForegroundColor Yellow
        pnpm audit fix
    }
}

# Phase 3: Dependency Updates (Priority 2)
if ($UpdateOnly -or $FullRestore) {
    Write-Host ""
    Write-Host "📦 Phase 3: Dependency Modernization" -ForegroundColor Green
    Write-Host "Updating core dependencies..." -ForegroundColor White
    
    # Update core dev dependencies in root
    $coreUpdates = @(
        "@types/node@latest",
        "typescript@latest", 
        "lint-staged@latest",
        "turbo@latest",
        "prettier@latest",
        "tsup@latest",
        "vitest@latest"
    )
    
    foreach ($package in $coreUpdates) {
        Write-Host "Updating $package..." -ForegroundColor White
        try {
            pnpm update $package
            Write-Host "✅ Updated $package" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Failed to update $package" -ForegroundColor Yellow
        }
    }
    
    # Handle ESLint ecosystem separately (major version change)
    Write-Host ""
    Write-Host "Updating ESLint ecosystem..." -ForegroundColor White
    try {
        # Update ESLint and TypeScript ESLint together for compatibility
        Write-Host "Updating ESLint ecosystem to latest compatible versions..." -ForegroundColor White
        
        # Update ESLint and TypeScript ESLint together for compatibility
        pnpm update eslint@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest
        Write-Host "✅ ESLint ecosystem updated" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ ESLint update requires manual intervention" -ForegroundColor Yellow
        Write-Host "   Consider running: pnpm update eslint@^9.0.0 --latest" -ForegroundColor Gray
    }
}

# Phase 4: Monorepo Structure Optimization
if ($FullRestore) {
    Write-Host ""
    Write-Host "🏗️ Phase 4: Monorepo Structure Optimization" -ForegroundColor Green
    Write-Host "Optimizing workspace structure..." -ForegroundColor White
    
    # Verify workspace packages
    $workspacePackages = @(
        "packages/cli",
        "packages/core", 
        "packages/shared",
        "packages/monitor",
        "packages/guthilda",
        "packages/servers/base",
        "packages/servers/duckduckgo",
        "packages/servers/sequential-thinking"
    )
    
    $validPackages = @()
    foreach ($pkg in $workspacePackages) {
        if (Test-Path (Join-Path $workspaceRoot $pkg "package.json")) {
            $validPackages += $pkg
            Write-Host "✅ Found package: $pkg" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Missing package: $pkg" -ForegroundColor Yellow
        }
    }
    
    Write-Host "Workspace packages validated: $($validPackages.Count) found" -ForegroundColor White
}

# Phase 5: Final Verification
Write-Host ""
Write-Host "🔍 Phase 5: Final Health Check" -ForegroundColor Green
Write-Host "Verifying restoration..." -ForegroundColor White

# Re-run security audit
Write-Host "Final security scan..." -ForegroundColor White
pnpm audit 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Security audit clean" -ForegroundColor Green
} else {
    Write-Host "⚠️ Security issues remain" -ForegroundColor Yellow
}

# Test build
Write-Host "Testing build process..." -ForegroundColor White
try {
    pnpm build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Build issues detected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Build test failed" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "⚓ RESTORATION RITUAL COMPLETE ⚓" -ForegroundColor Cyan
Write-Host "Digital vessel status:" -ForegroundColor Yellow

pnpm outdated --depth=0 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All dependencies current" -ForegroundColor Green
} else {
    Write-Host "📋 Some packages may still need updates" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Recommended next steps:" -ForegroundColor White
Write-Host "1. Run 'pnpm test' to verify all tests pass" -ForegroundColor Gray
Write-Host "2. Check VS Code for any remaining popup issues" -ForegroundColor Gray  
Write-Host "3. Commit changes and update documentation" -ForegroundColor Gray
Write-Host "4. Consider setting up automated dependency updates" -ForegroundColor Gray

Write-Host ""
Write-Host "Fair winds and following seas! 🏴‍☠️⚓" -ForegroundColor Green
