# Advanced VS Code Extension Cleanup Script for MCP Orchestration System
# This script UNINSTALLS heavy resource extensions completely

Write-Host "🔥 Advanced VS Code Extension Cleanup for MCP Orchestration System..." -ForegroundColor Yellow
Write-Host "Following the Monorepo Ritual guidelines - COMPLETE REMOVAL..." -ForegroundColor Cyan

# Function to uninstall extension completely
function Uninstall-VSCodeExtension {
    param([string]$ExtensionId)
    
    try {
        Write-Host "Uninstalling $ExtensionId..." -ForegroundColor Gray
        & code --uninstall-extension $ExtensionId
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Uninstalled: $ExtensionId" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Failed to uninstall: $ExtensionId" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error uninstalling $ExtensionId`: $_" -ForegroundColor Red
    }
}

Write-Host "`n🗑️  Phase 1: UNINSTALLING Azure Extensions..." -ForegroundColor Red

$azureExtensions = @(
    "ms-azure-load-testing.microsoft-testing",
    "ms-azuretools.azure-dev",
    "ms-azuretools.vscode-azure-github-copilot",
    "ms-azuretools.vscode-azure-mcp-server",
    "ms-azuretools.vscode-azureappservice",
    "ms-azuretools.vscode-azurecontainerapps",
    "ms-azuretools.vscode-azurefunctions",
    "ms-azuretools.vscode-azureresourcegroups",
    "ms-azuretools.vscode-azurestaticwebapps",
    "ms-azuretools.vscode-azurestorage",
    "ms-azuretools.vscode-azurevirtualmachines",
    "ms-azuretools.vscode-cosmosdb",
    "ms-vscode.azure-repos",
    "ms-vscode.vscode-node-azure-pack"
)

foreach ($ext in $azureExtensions) {
    Uninstall-VSCodeExtension $ext
}

Write-Host "`n🗑️  Phase 2: UNINSTALLING .NET/C# Extensions..." -ForegroundColor Red

$dotnetExtensions = @(
    "ms-dotnettools.csdevkit",
    "ms-dotnettools.csharp",
    "ms-dotnettools.dotnet-maui",
    "ms-dotnettools.vscode-dotnet-runtime"
)

foreach ($ext in $dotnetExtensions) {
    Uninstall-VSCodeExtension $ext
}

Write-Host "`n🗑️  Phase 3: UNINSTALLING C++ Extensions..." -ForegroundColor Red

$cppExtensions = @(
    "ms-vscode.cpptools",
    "ms-vscode.cpptools-extension-pack",
    "ms-vscode.cpptools-themes",
    "ms-vscode.makefile-tools"
)

foreach ($ext in $cppExtensions) {
    Uninstall-VSCodeExtension $ext
}

Write-Host "`n🗑️  Phase 4: UNINSTALLING Jupyter/Notebook Extensions..." -ForegroundColor Red

$jupyterExtensions = @(
    "ms-toolsai.jupyter",
    "ms-toolsai.jupyter-keymap",
    "ms-toolsai.jupyter-renderers",
    "ms-toolsai.vscode-jupyter-cell-tags",
    "ms-toolsai.vscode-jupyter-slideshow"
)

foreach ($ext in $jupyterExtensions) {
    Uninstall-VSCodeExtension $ext
}

Write-Host "`n🗑️  Phase 5: UNINSTALLING AI/ML Heavy Extensions..." -ForegroundColor Red

$aiExtensions = @(
    "ms-windows-ai-studio.windows-ai-studio",
    "nvidia.nsight-vscode-edition",
    "teamsdevapp.vscode-ai-foundry"
)

foreach ($ext in $aiExtensions) {
    Uninstall-VSCodeExtension $ext
}

Write-Host "`n🗑️  Phase 6: UNINSTALLING Remote Development Extensions..." -ForegroundColor Red

$remoteExtensions = @(
    "ms-vscode-remote.remote-ssh",
    "ms-vscode-remote.remote-ssh-edit",
    "ms-vscode-remote.vscode-remote-extensionpack",
    "ms-vscode.remote-explorer",
    "ms-vscode.remote-repositories",
    "ms-vscode.remote-server"
)

foreach ($ext in $remoteExtensions) {
    Uninstall-VSCodeExtension $ext
}

Write-Host "`n🗑️  Phase 7: UNINSTALLING Specialized Language Extensions..." -ForegroundColor Red

$specializedExtensions = @(
    "shopify.ruby-lsp",
    "batisteo.vscode-django",
    "vmware.vscode-boot-dev-pack",
    "vmware.vscode-spring-boot-dashboard",
    "vmware.vscode-spring-initializr"
)

foreach ($ext in $specializedExtensions) {
    Uninstall-VSCodeExtension $ext
}

Write-Host "`n🗑️  Phase 8: UNINSTALLING Redundant AI/Chat Extensions..." -ForegroundColor Red

$redundantExtensions = @(
    "github.codespaces",
    "ms-vscode.vscode-copilot-vision",
    "ms-vscode.vscode-speech",
    "ms-vscode.vscode-websearchforcopilot",
    "google.gemini-cli-vscode-ide-companion",
    "anthropic.claude-code"
)

foreach ($ext in $redundantExtensions) {
    Uninstall-VSCodeExtension $ext
}

Write-Host "`n🗑️  Phase 9: UNINSTALLING Miscellaneous/Redundant Extensions..." -ForegroundColor Red

$miscExtensions = @(
    "almenon.arepl",
    "ai-dl.enlighter",
    "firefox-devtools.vscode-firefox-debug",
    "formulahendry.code-runner",
    "ritwickdey.liveserver",
    "sarthikbhat.json-server",
    "sidthesloth.html5-boilerplate",
    "solnurkarim.html-to-css-autocompletion",
    "hbenl.vscode-test-explorer",
    "ms-vscode.test-adapter-converter",
    "littlefoxteam.vscode-python-test-adapter",
    "ms-edgedevtools.vscode-edge-devtools"
)

foreach ($ext in $miscExtensions) {
    Uninstall-VSCodeExtension $ext
}

Write-Host "`n📊 Checking final extension count..." -ForegroundColor Blue
$finalExtensions = & code --list-extensions
$finalCount = ($finalExtensions | Measure-Object).Count

Write-Host "`n✨ COMPLETE CLEANUP FINISHED!" -ForegroundColor Green
Write-Host "📉 Final extension count: $finalCount" -ForegroundColor Cyan
Write-Host "🚀 VS Code should now be significantly lighter!" -ForegroundColor Green

Write-Host "`n🔧 Essential MCP Development Extensions Remaining:" -ForegroundColor Blue
$essentialExtensions = @(
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "redhat.java",
    "vscjava.vscode-java-pack",
    "jacano.vscode-pnpm",
    "ms-azuretools.vscode-containers",
    "ms-vscode-remote.remote-containers",
    "github.vscode-pull-request-github",
    "davidanson.vscode-markdownlint",
    "golang.go",
    "github.copilot",
    "github.copilot-chat"
)

foreach ($ext in $essentialExtensions) {
    if ($finalExtensions -contains $ext) {
        Write-Host "✅ $ext" -ForegroundColor Green
    } else {
        Write-Host "❌ $ext (missing - may need to install)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart VS Code to apply changes completely" -ForegroundColor White
Write-Host "2. Check memory usage in Task Manager" -ForegroundColor White
Write-Host "3. Test monorepo workflow: pnpm build, lint, test" -ForegroundColor White
Write-Host "4. Install any missing essential extensions if needed" -ForegroundColor White

Write-Host "`n⚓ The ship is now clean and ready for battle! MCP orchestration optimized! 🏴‍☠️🔥" -ForegroundColor Magenta
