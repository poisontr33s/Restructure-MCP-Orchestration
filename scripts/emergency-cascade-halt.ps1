# 🚨 EMERGENCY CASCADE HALT PROTOCOL 🚨
# Captain Guthilda's Nuclear Option for Bug Cascades
#
# Usage: ./scripts/emergency-cascade-halt.ps1
#
# WARNING: This will forcefully stop everything and revert to safety

[CmdletBinding()]
param(
    [Parameter(HelpMessage = "Skip confirmation prompt")]
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

Write-Host "🚨 EMERGENCY CASCADE HALT PROTOCOL ACTIVATED 🚨" -ForegroundColor Red -BackgroundColor Yellow
Write-Host ""
Write-Host "Captain Guthilda's Nuclear Option for Bug Cascades" -ForegroundColor Magenta
Write-Host "WARNING: This will forcefully stop everything!" -ForegroundColor Red
Write-Host ""

if (-not $Force) {
    $confirmation = Read-Host "Are you sure you want to halt all processes? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-Host "❌ Cascade halt cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "🔥 Phase 1: Process Annihilation" -ForegroundColor Red

# Kill all VS Code instances
Write-Host "⚰️  Terminating all VS Code instances..."
try {
    Get-Process "Code" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep 2
    Write-Host "✅ VS Code instances terminated" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  No VS Code instances found or already terminated" -ForegroundColor Yellow
}

# Kill all Node processes
Write-Host "⚰️  Terminating all Node.js processes..."
try {
    Get-Process "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep 1
    Write-Host "✅ Node.js processes terminated" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  No Node.js processes found" -ForegroundColor Yellow
}

# Kill all npm/pnpm processes
Write-Host "⚰️  Terminating package manager processes..."
try {
    Get-Process "npm", "pnpm" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep 1
    Write-Host "✅ Package manager processes terminated" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  No package manager processes found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🧹 Phase 2: Cache Purification" -ForegroundColor Cyan

# Clear VS Code temp files
Write-Host "🗑️  Clearing VS Code temporary files..."
try {
    $vsCodeAppData = "$env:APPDATA\Code"
    if (Test-Path $vsCodeAppData) {
        Remove-Item "$vsCodeAppData\User\workspaceStorage\*" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item "$vsCodeAppData\logs\*" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item "$vsCodeAppData\CachedExtensions\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ VS Code cache cleared" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  Could not clear VS Code cache" -ForegroundColor Yellow
}

# Reset pnpm store
Write-Host "🗑️  Purging pnpm store..."
try {
    Start-Process -FilePath "pnpm" -ArgumentList "store", "prune" -Wait -NoNewWindow
    Write-Host "✅ pnpm store purged" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Could not purge pnpm store" -ForegroundColor Yellow
}

# Clear npm cache
Write-Host "🗑️  Clearing npm cache..."
try {
    Start-Process -FilePath "npm" -ArgumentList "cache", "clean", "--force" -Wait -NoNewWindow
    Write-Host "✅ npm cache cleared" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Could not clear npm cache" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 Phase 3: Git State Restoration" -ForegroundColor Blue

# Check git status
$gitStatus = git status --porcelain 2>$null
if ($gitStatus) {
    Write-Host "📋 Uncommitted changes detected:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    
    if (-not $Force) {
        $stashConfirm = Read-Host "Stash changes and reset to last commit? (yes/no)"
        if ($stashConfirm -eq "yes") {
            git stash push -m "Emergency cascade halt - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            Write-Host "✅ Changes stashed" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "🧼 Phase 4: Node Modules Cleansing" -ForegroundColor Magenta

# Remove all node_modules recursively
Write-Host "🗑️  Removing all node_modules directories..."
try {
    Get-ChildItem -Path . -Name "node_modules" -Recurse -Directory | ForEach-Object {
        $fullPath = Resolve-Path $_
        Write-Host "   Removing: $fullPath" -ForegroundColor DarkGray
        Remove-Item $fullPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✅ All node_modules removed" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Some node_modules could not be removed" -ForegroundColor Yellow
}

# Remove lock files
Write-Host "🗑️  Removing package lock files..."
try {
    Remove-Item "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
    Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
    Get-ChildItem -Path . -Name "package-lock.json" -Recurse | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Lock files removed" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Some lock files could not be removed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🛡️ Phase 5: Foundation Reset" -ForegroundColor Green

# Fresh install
Write-Host "📦 Performing fresh package installation..."
try {
    Start-Process -FilePath "pnpm" -ArgumentList "install" -Wait -NoNewWindow
    Write-Host "✅ Fresh installation complete" -ForegroundColor Green
}
catch {
    Write-Host "❌ Fresh installation failed" -ForegroundColor Red
    Write-Host "   Try running 'pnpm install' manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 CASCADE HALT COMPLETE! 🎉" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "🏴‍☠️ Captain's Orders:" -ForegroundColor Magenta
Write-Host "   1. Wait 10 seconds before opening VS Code" -ForegroundColor White
Write-Host "   2. Open only ONE VS Code instance" -ForegroundColor White
Write-Host "   3. Run 'pnpm build' to verify everything works" -ForegroundColor White
Write-Host "   4. If issues persist, run foundation-reset.ps1" -ForegroundColor White
Write-Host ""
Write-Host "⚓ The ship is stabilized. Sail forth carefully!" -ForegroundColor Cyan
