# VS Code Extension Optimization Script for MCP Orchestration System
# This script disables heavy resource extensions not needed for MCP development

Write-Host "🔥 Starting VS Code Extension Optimization for MCP Orchestration System..." -ForegroundColor Yellow
Write-Host "Following the Monorepo Ritual guidelines..." -ForegroundColor Cyan

# Function to disable extension safely
function Disable-VSCodeExtension {
    param([string]$ExtensionId)
    
    try {
        Write-Host "Disabling $ExtensionId..." -ForegroundColor Gray
        & code --disable-extension $ExtensionId
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Disabled: $ExtensionId" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Failed to disable: $ExtensionId" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error disabling $ExtensionId`: $_" -ForegroundColor Red
    }
}

Write-Host "`n🧹 Phase 1: Disabling Azure Extensions (not needed for MCP)..." -ForegroundColor Magenta

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
    Disable-VSCodeExtension $ext
}

Write-Host "`n🧹 Phase 2: Disabling .NET/C# Extensions (not needed)..." -ForegroundColor Magenta

$dotnetExtensions = @(
    "ms-dotnettools.csdevkit",
    "ms-dotnettools.csharp",
    "ms-dotnettools.dotnet-maui",
    "ms-dotnettools.vscode-dotnet-runtime"
)

foreach ($ext in $dotnetExtensions) {
    Disable-VSCodeExtension $ext
}

Write-Host "`n🧹 Phase 3: Disabling C++ Extensions (not needed)..." -ForegroundColor Magenta

$cppExtensions = @(
    "ms-vscode.cpptools",
    "ms-vscode.cpptools-extension-pack",
    "ms-vscode.cpptools-themes",
    "ms-vscode.makefile-tools"
)

foreach ($ext in $cppExtensions) {
    Disable-VSCodeExtension $ext
}

Write-Host "`n🧹 Phase 4: Disabling Jupyter/Notebook Extensions (resource heavy)..." -ForegroundColor Magenta

$jupyterExtensions = @(
    "ms-toolsai.jupyter",
    "ms-toolsai.jupyter-keymap",
    "ms-toolsai.jupyter-renderers",
    "ms-toolsai.vscode-jupyter-cell-tags",
    "ms-toolsai.vscode-jupyter-slideshow"
)

foreach ($ext in $jupyterExtensions) {
    Disable-VSCodeExtension $ext
}

Write-Host "`n🧹 Phase 5: Disabling AI/ML Heavy Extensions..." -ForegroundColor Magenta

$aiExtensions = @(
    "ms-windows-ai-studio.windows-ai-studio",
    "nvidia.nsight-vscode-edition",
    "teamsdevapp.vscode-ai-foundry"
)

foreach ($ext in $aiExtensions) {
    Disable-VSCodeExtension $ext
}

Write-Host "`n🧹 Phase 6: Disabling Remote Development Extensions (already have containers)..." -ForegroundColor Magenta

$remoteExtensions = @(
    "ms-vscode-remote.remote-ssh",
    "ms-vscode-remote.remote-ssh-edit",
    "ms-vscode-remote.vscode-remote-extensionpack",
    "ms-vscode.remote-explorer",
    "ms-vscode.remote-repositories",
    "ms-vscode.remote-server"
)

foreach ($ext in $remoteExtensions) {
    Disable-VSCodeExtension $ext
}

Write-Host "`n🧹 Phase 7: Disabling Specialized Language Extensions (not needed for MCP)..." -ForegroundColor Magenta

$specializedExtensions = @(
    "shopify.ruby-lsp",
    "batisteo.vscode-django",
    "vmware.vscode-boot-dev-pack",
    "vmware.vscode-spring-boot-dashboard",
    "vmware.vscode-spring-initializr"
)

foreach ($ext in $specializedExtensions) {
    Disable-VSCodeExtension $ext
}

Write-Host "`n🧹 Phase 8: Disabling Misc/Redundant Extensions..." -ForegroundColor Magenta

$miscExtensions = @(
    "github.codespaces",
    "ms-vscode.vscode-copilot-vision",
    "ms-vscode.vscode-speech",
    "ms-vscode.vscode-websearchforcopilot",
    "google.gemini-cli-vscode-ide-companion",
    "anthropic.claude-code"
)

foreach ($ext in $miscExtensions) {
    Disable-VSCodeExtension $ext
}

Write-Host "`n📊 Checking remaining extensions..." -ForegroundColor Blue
$remainingExtensions = & code --list-extensions
$remainingCount = ($remainingExtensions | Measure-Object).Count

Write-Host "`n✨ Optimization Complete!" -ForegroundColor Green
Write-Host "📉 Remaining extensions: $remainingCount (down from 96)" -ForegroundColor Cyan
Write-Host "🚀 VS Code should now be much faster and use less memory!" -ForegroundColor Green

Write-Host "`n🔧 Essential MCP Development Extensions Still Active:" -ForegroundColor Blue
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
    "golang.go"
)

foreach ($ext in $essentialExtensions) {
    if ($remainingExtensions -contains $ext) {
        Write-Host "✅ $ext" -ForegroundColor Green
    } else {
        Write-Host "❌ $ext (missing - may need to install)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart VS Code to apply changes" -ForegroundColor White
Write-Host "2. Check memory usage in Task Manager" -ForegroundColor White
Write-Host "3. Test monorepo workflow: pnpm build, lint, test" -ForegroundColor White
Write-Host "4. If any essential extensions are missing, install them" -ForegroundColor White

Write-Host "`n🏴‍☠️ The Monorepo Ritual is complete! Your VS Code is now optimized for MCP orchestration! 🔥⚓" -ForegroundColor Magenta
