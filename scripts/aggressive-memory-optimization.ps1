# Aggressive VS Code Memory Optimization - Phase 2
# Targeting the remaining resource-heavy extensions for maximum memory reduction

Write-Host "🔥 AGGRESSIVE Memory Optimization - Phase 2" -ForegroundColor Red
Write-Host "Removing additional resource-heavy extensions..." -ForegroundColor Yellow

# Function to uninstall extension
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

Write-Host "`n🗑️  Removing Additional Heavy Extensions:" -ForegroundColor Magenta

# IntelliCode (resource heavy AI features)
$intellicodeExtensions = @(
    "visualstudioexptteam.intellicode-api-usage-examples",
    "visualstudioexptteam.vscodeintellicode"
)

Write-Host "`nRemoving IntelliCode (AI features - resource heavy)..." -ForegroundColor Red
foreach ($ext in $intellicodeExtensions) {
    Uninstall-VSCodeExtension $ext
}

# Test explorers and adapters (not essential for MCP)
$testExtensions = @(
    "hbenl.vscode-test-explorer",
    "ms-vscode.test-adapter-converter"
)

Write-Host "`nRemoving Test Explorers (Java/Maven tests work without these)..." -ForegroundColor Red
foreach ($ext in $testExtensions) {
    Uninstall-VSCodeExtension $ext
}

# Additional Python tools (keep core Python + Pylance only)
$pythonExtensions = @(
    "kevinrose.vsc-python-indent",
    "mgesbert.python-path"
)

Write-Host "`nRemoving Additional Python Tools (core Python support remains)..." -ForegroundColor Red
foreach ($ext in $pythonExtensions) {
    Uninstall-VSCodeExtension $ext
}

# Visual/UI enhancements (not essential)
$visualExtensions = @(
    "kisstkondoros.vscode-gutter-preview",
    "naumovs.color-highlight",
    "pflannery.vscode-versionlens"
)

Write-Host "`nRemoving Visual/UI Enhancements..." -ForegroundColor Red
foreach ($ext in $visualExtensions) {
    Uninstall-VSCodeExtension $ext
}

# File format support (not needed for MCP core development)
$fileExtensions = @(
    "mechatroner.rainbow-csv",
    "dotjoshjohnson.xml",
    "ecmel.vscode-html-css",
    "bradlc.vscode-tailwindcss",
    "wholroyd.jinja"
)

Write-Host "`nRemoving File Format Extensions (focus on core MCP files)..." -ForegroundColor Red
foreach ($ext in $fileExtensions) {
    Uninstall-VSCodeExtension $ext
}

# Security/analysis tools (not essential for development)
$analysisExtensions = @(
    "ms-sarifvscode.sarif-viewer",
    "doublevkay.codeql-agent",
    "github.vscode-codeql"
)

Write-Host "`nRemoving Security/Analysis Tools..." -ForegroundColor Red
foreach ($ext in $analysisExtensions) {
    Uninstall-VSCodeExtension $ext
}

# PowerShell (not needed for MCP development)
Write-Host "`nRemoving PowerShell Extension (terminal PowerShell works fine)..." -ForegroundColor Red
Uninstall-VSCodeExtension "ms-vscode.powershell"

# Check final count
Write-Host "`n📊 Checking Final Extension Count..." -ForegroundColor Blue
$finalExtensions = & code --list-extensions
$finalCount = ($finalExtensions | Measure-Object).Count

Write-Host "`n✨ AGGRESSIVE OPTIMIZATION COMPLETE!" -ForegroundColor Green
Write-Host "📉 Extension count: $finalCount" -ForegroundColor Cyan

# Show core essentials remaining
Write-Host "`n🎯 Core Essentials Remaining:" -ForegroundColor Blue
$coreEssentials = @(
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "redhat.java",
    "vscjava.vscode-java-pack",
    "jacano.vscode-pnpm",
    "ms-azuretools.vscode-containers",
    "github.vscode-pull-request-github",
    "davidanson.vscode-markdownlint",
    "yzhang.markdown-all-in-one",
    "golang.go",
    "github.copilot",
    "github.copilot-chat"
)

foreach ($ext in $coreEssentials) {
    if ($finalExtensions -contains $ext) {
        Write-Host "✅ $ext" -ForegroundColor Green
    } else {
        Write-Host "❌ $ext (MISSING)" -ForegroundColor Red
    }
}

Write-Host "`n💡 Expected Memory Reduction:" -ForegroundColor Yellow
Write-Host "• Target: ~25-30 extensions total" -ForegroundColor White
Write-Host "• Expected memory: ~200-300MB total" -ForegroundColor White
Write-Host "• Eliminated: AI features, test explorers, visual enhancements" -ForegroundColor White

Write-Host "`n⚓ RESTART VS CODE NOW for maximum memory reduction! 🏴‍☠️🔥" -ForegroundColor Magenta
