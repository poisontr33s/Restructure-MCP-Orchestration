#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Quick Gemini Pro Account Switcher
.DESCRIPTION
    Implements the exact workflow that actually works:
    1. Kill stuck processes
    2. Clear authentication cache  
    3. Launch Gemini CLI (triggers web login)
    4. Browser opens for account selection
    5. User selects Pro account
    6. Ready to use with new token limit
.NOTES
    This is the "relaunch and login via account choosing" method that actually works
#>

Write-Host "🌟 QUICK GEMINI PRO ACCOUNT SWITCHER" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "This script implements the working method you described:" -ForegroundColor Cyan
Write-Host "✅ Kill stuck processes → Clear cache → Relaunch → Web login → Account selection" -ForegroundColor Green
Write-Host ""

# Step 1: Clean slate
Write-Host "Step 1: Cleaning up stuck processes and cache..." -ForegroundColor Yellow
try {
    # Kill all node processes (including stuck Gemini CLI)
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Killed Node processes" -ForegroundColor Green
    
    # Clear Gemini cache directories
    $cachePaths = @("$env:USERPROFILE\.gemini", "$env:APPDATA\gemini", "$env:LOCALAPPDATA\gemini")
    foreach ($path in $cachePaths) {
        if (Test-Path $path) {
            Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Cleared cache: $path" -ForegroundColor Green
        }
    }
    
    # Clear temp error files
    Get-ChildItem "$env:TEMP\gemini-client-error-*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cleared temporary error files" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️ Some cleanup steps may have failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Explain what's about to happen
Write-Host "Step 2: About to launch Gemini CLI for account selection..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 What will happen:" -ForegroundColor Cyan
Write-Host "   1. Gemini CLI will start" -ForegroundColor White
Write-Host "   2. Your browser will open to Google AI Studio" -ForegroundColor White
Write-Host "   3. You'll see your available Google accounts" -ForegroundColor White
Write-Host "   4. Select the Pro account you want to use" -ForegroundColor White
Write-Host "   5. Complete the authentication" -ForegroundColor White
Write-Host "   6. Return to CLI and start using it" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Pro Tips:" -ForegroundColor Magenta
Write-Host "   • Choose account based on token availability" -ForegroundColor White
Write-Host "   • You can switch again anytime by re-running this script" -ForegroundColor White
Write-Host "   • Each Pro account has separate limits" -ForegroundColor White
Write-Host ""

# Step 3: Launch
Write-Host "Ready to start? Press Enter to launch Gemini CLI..." -ForegroundColor Green
Read-Host

Write-Host ""
Write-Host "🚀 Launching Gemini CLI..." -ForegroundColor Green
Write-Host "⏳ Browser should open automatically..." -ForegroundColor Yellow

try {
    $geminiPath = "C:\Users\erdno\AppData\Roaming\npm\gemini.cmd"
    
    if (Test-Path $geminiPath) {
        Write-Host "Starting: $geminiPath" -ForegroundColor Cyan
        
        # Launch Gemini CLI - this should trigger the web authentication flow
        & $geminiPath
        
    } else {
        Write-Host "❌ Gemini CLI not found at: $geminiPath" -ForegroundColor Red
        Write-Host "Please check your Gemini CLI installation" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Try installing with: npm install -g @google/gemini-cli" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error launching Gemini CLI: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Manual steps to try:" -ForegroundColor Yellow
    Write-Host "1. Open terminal" -ForegroundColor White
    Write-Host "2. Run: C:\Users\erdno\AppData\Roaming\npm\gemini.cmd" -ForegroundColor White
    Write-Host "3. Follow browser prompts for account selection" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 After authentication completes:" -ForegroundColor Green
Write-Host "   Test with: Write-Output 'Hello from Pro account' | gemini" -ForegroundColor White
Write-Host ""
Write-Host "🔄 To switch accounts again: Just re-run this script!" -ForegroundColor Magenta
