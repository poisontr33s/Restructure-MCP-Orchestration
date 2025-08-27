#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Gemini Pro User Switching Recovery
.DESCRIPTION
    Handles the proper workflow for switching between Gemini Pro accounts via web login
    This is the reliable method that actually works for Pro account switching
.NOTES
    Based on actual working behavior: relaunch CLI -> web login -> account selection
#>

param(
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

function Write-Status {
    param($Message, $Type = "INFO")
    $color = switch ($Type) {
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        "PRO" { "Magenta" }
        default { "Cyan" }
    }
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

function Stop-AllGeminiProcesses {
    Write-Status "Stopping all Gemini/Node processes..." "WARNING"
    try {
        # Kill all node processes (includes stuck Gemini CLI instances)
        Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        
        # Kill any gemini processes specifically
        Get-Process -Name gemini -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        
        # Wait a moment for processes to fully terminate
        Start-Sleep -Seconds 2
        
        $remainingProcesses = (Get-Process -Name node -ErrorAction SilentlyContinue).Count
        Write-Status "✅ Process cleanup complete. $remainingProcesses Node processes remain" "SUCCESS"
    } catch {
        Write-Status "⚠️ Some processes may not have been terminated: $($_.Exception.Message)" "WARNING"
    }
}

function Clear-GeminiCache {
    Write-Status "Clearing Gemini authentication cache..." "INFO"
    
    $cachePaths = @(
        "$env:USERPROFILE\.gemini",
        "$env:USERPROFILE\.google\gemini",
        "$env:APPDATA\gemini",
        "$env:LOCALAPPDATA\gemini"
    )
    
    $clearedPaths = 0
    foreach ($path in $cachePaths) {
        if (Test-Path $path) {
            try {
                Remove-Item $path -Recurse -Force -ErrorAction Stop
                Write-Status "✅ Cleared cache: $path" "SUCCESS"
                $clearedPaths++
            } catch {
                Write-Status "⚠️ Could not clear: $path" "WARNING"
            }
        }
    }
    
    # Clear temp error files
    try {
        $errorFiles = Get-ChildItem "$env:TEMP\gemini-client-error-*" -ErrorAction SilentlyContinue
        $errorFiles | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Status "✅ Cleared $($errorFiles.Count) error files from temp" "SUCCESS"
    } catch {
        Write-Status "⚠️ Could not clear all temp files" "WARNING"
    }
    
    Write-Status "Cache cleanup summary: $clearedPaths paths cleared" "INFO"
}

function Start-ProAccountSelection {
    Write-Status "🌟 Starting Gemini Pro Account Selection Process" "PRO"
    Write-Status "=============================================" "PRO"
    
    Write-Status "This process will:" "INFO"
    Write-Status "1. 🌐 Open Google AI Studio in your browser" "INFO"
    Write-Status "2. 👤 Show you available accounts to choose from" "INFO"
    Write-Status "3. 🔄 Allow switching between Pro accounts based on tokens" "INFO"
    Write-Status "4. ✅ Establish authenticated session for selected account" "INFO"
    
    Write-Host ""
    Write-Status "🚀 Ready to start? Press any key to launch Gemini CLI..." "PRO"
    if (-not $DryRun) {
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    
    Write-Status "Launching Gemini CLI for interactive login..." "INFO"
    
    if (-not $DryRun) {
        try {
            # Launch Gemini CLI which will trigger the web authentication flow
            Write-Status "📱 Browser should open automatically..." "INFO"
            Write-Status "⏳ If browser doesn't open, check your default browser settings" "WARNING"
            
            $geminiPath = "C:\Users\erdno\AppData\Roaming\npm\gemini.cmd"
            if (Test-Path $geminiPath) {
                Write-Status "Starting: $geminiPath" "INFO"
                
                # Start the process and wait briefly to see if it succeeds
                $process = Start-Process -FilePath $geminiPath -PassThru -NoNewWindow
                Start-Sleep -Seconds 3
                
                if ($process.HasExited) {
                    Write-Status "⚠️ Gemini CLI exited quickly. May need manual intervention." "WARNING"
                } else {
                    Write-Status "✅ Gemini CLI is running. Check your browser for login prompt." "SUCCESS"
                }
                
            } else {
                Write-Status "❌ Gemini CLI not found at expected path: $geminiPath" "ERROR"
                Write-Status "Please check your Gemini CLI installation" "ERROR"
                return $false
            }
        } catch {
            Write-Status "❌ Failed to launch Gemini CLI: $($_.Exception.Message)" "ERROR"
            return $false
        }
    } else {
        Write-Status "DRY RUN: Would launch Gemini CLI for web authentication" "INFO"
    }
    
    return $true
}

function Show-PostLoginInstructions {
    Write-Status "📋 POST-LOGIN INSTRUCTIONS" "PRO"
    Write-Status "=========================" "PRO"
    Write-Host ""
    Write-Status "After completing web login:" "INFO"
    Write-Status "1. ✅ Select your desired Pro account in the browser" "SUCCESS"
    Write-Status "2. 🔐 Complete the authentication flow" "SUCCESS"
    Write-Status "3. ✋ Close the Gemini CLI terminal when done" "WARNING"
    Write-Status "4. 🧪 Test with: echo 'Hello from Pro account' | gemini" "INFO"
    Write-Host ""
    Write-Status "🔄 For Pro account switching:" "PRO"
    Write-Status "• When tokens run low, re-run this script" "INFO"
    Write-Status "• Select different Pro account in browser" "INFO"
    Write-Status "• Continue working with new token limit" "INFO"
    Write-Host ""
    Write-Status "🆘 If issues persist:" "WARNING"
    Write-Status "• Check Google AI Studio directly: https://aistudio.google.com" "INFO"
    Write-Status "• Verify Pro subscription status" "INFO"
    Write-Status "• Try different browser/incognito mode" "INFO"
}

function Test-Authentication {
    Write-Status "🧪 Testing authentication..." "INFO"
    
    try {
        $testResult = Write-Output "Quick test: What is 1+1?" | gemini 2>&1
        if ($testResult -match "2|two" -and $testResult -notmatch "error|failed|unauthorized") {
            Write-Status "✅ Authentication test PASSED" "SUCCESS"
            Write-Status "✅ Gemini Pro account is working" "PRO"
            return $true
        } else {
            Write-Status "⚠️ Authentication test inconclusive" "WARNING"
            Write-Status "Response: $($testResult | Select-Object -First 1)" "INFO"
            return $false
        }
    } catch {
        Write-Status "❌ Authentication test FAILED: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main execution
Write-Status "🌟 GEMINI PRO USER SWITCHING RECOVERY" "PRO"
Write-Status "====================================" "PRO"
Write-Host ""

# Phase 1: Clean slate
Write-Status "Phase 1: Preparing clean environment..." "WARNING"
if (-not $DryRun) {
    Stop-AllGeminiProcesses
    Clear-GeminiCache
} else {
    Write-Status "DRY RUN: Would clean processes and cache" "INFO"
}

Write-Host ""

# Phase 2: Pro account selection
Write-Status "Phase 2: Pro account selection..." "PRO"
$loginSuccess = Start-ProAccountSelection

if ($loginSuccess -or $DryRun) {
    Write-Host ""
    Show-PostLoginInstructions
    
    if (-not $DryRun) {
        Write-Host ""
        Write-Status "⏳ Waiting 10 seconds for authentication to complete..." "INFO"
        Start-Sleep -Seconds 10
        
        Write-Status "Testing new authentication..." "INFO"
        $authSuccess = Test-Authentication
        
        if ($authSuccess) {
            Write-Status "🎉 SUCCESS! Pro account switching completed!" "SUCCESS"
            Write-Status "You can now use Gemini CLI with your selected Pro account" "PRO"
        } else {
            Write-Status "⚠️ Authentication test was inconclusive" "WARNING"
            Write-Status "Try manually: echo 'test message' | gemini" "INFO"
        }
    }
} else {
    Write-Status "❌ Pro account selection failed" "ERROR"
    Write-Status "Please try manual login: C:\Users\erdno\AppData\Roaming\npm\gemini.cmd" "WARNING"
}

Write-Host ""
Write-Status "🔄 Pro Account Switching Tips:" "PRO"
Write-Status "• Run this script whenever you need to switch accounts" "INFO"
Write-Status "• Each Pro account has separate token limits" "INFO"
Write-Status "• Web login is more reliable than API keys for Pro users" "INFO"
Write-Status "• Keep multiple Pro accounts for seamless switching" "PRO"
