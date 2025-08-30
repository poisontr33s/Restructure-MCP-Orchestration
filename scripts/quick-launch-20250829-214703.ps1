# Quick Session Restore - Generated 08/29/2025 21:47:07
Write-Host "🚀 Launching quick session clone..." -ForegroundColor Green

# Launch VS Code with workspace
Start-Process "code" -ArgumentList "--new-window", "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration\quick-session-20250829-214703.code-workspace"
Start-Sleep -Seconds 2

# Open key files
Start-Process "code" -ArgumentList "--goto", "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration\.vscode\settings.json"
Start-Sleep -Milliseconds 300
Start-Process "code" -ArgumentList "--goto", "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration\.vscode\tasks.json"
Start-Sleep -Milliseconds 300
Start-Process "code" -ArgumentList "--goto", "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration\benchmark-hardware-acceleration.js"
Start-Sleep -Milliseconds 300
Start-Process "code" -ArgumentList "--goto", "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration\CURRENT-STATUS-REPORT.md"
Start-Sleep -Milliseconds 300
Start-Process "code" -ArgumentList "--goto", "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration\GO-EXTENSION-FIX.md"
Start-Sleep -Milliseconds 300
Start-Process "code" -ArgumentList "--goto", "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration\mcp-v2-shared-infrastructure\docker-compose.dev.yml"
Start-Sleep -Milliseconds 300
Start-Process "code" -ArgumentList "--goto", "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration\mcp-v2-shared-infrastructure\docker-compose.prod.yml"
Start-Sleep -Milliseconds 300
Start-Process "code" -ArgumentList "--goto", "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration\mcp-v2-typescript-client\package.json"
Start-Sleep -Milliseconds 300
Write-Host "✅ Quick session restored!" -ForegroundColor Green
