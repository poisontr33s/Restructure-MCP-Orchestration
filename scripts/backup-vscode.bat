@echo off
echo 🚀 Starting Backup VS Code Instance...
cd /d "%~dp0\.."
echo Opening workspace: %CD%
"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" --new-window "%CD%"
echo ✅ New VS Code window opened with main workspace!
echo Your original workspace session is preserved.
pause
