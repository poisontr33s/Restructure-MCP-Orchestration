@echo off
REM CLAUDE UNIFIED RESUME - Simple batch wrapper
REM Quick access to unified session resumption

echo.
echo 🚀 Claude Code Unified Resume System
echo ====================================

REM Check if PowerShell script exists
if not exist "scripts\claude-unified-resume.ps1" (
    echo ❌ PowerShell resume script not found
    pause
    exit /b 1
)

REM Execute PowerShell script with execution policy bypass
powershell -ExecutionPolicy Bypass -File "scripts\claude-unified-resume.ps1" %*

echo.
echo 📋 Available options:
echo   claude-unified-resume.bat          - Resume with unified context
echo   claude-unified-resume.bat -Update  - Update unified state first  
echo   claude-unified-resume.bat -Fresh   - Start fresh with full context
echo.