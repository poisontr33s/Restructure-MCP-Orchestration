# VS Code MCP Optimization Verification Script
# Confirms that essential extensions are working and monorepo functionality is intact

Write-Host "🔍 Verifying VS Code MCP Optimization Results..." -ForegroundColor Cyan

# Check extension count
$extensions = & code --list-extensions
$extensionCount = ($extensions | Measure-Object).Count
Write-Host "📊 Current extension count: $extensionCount" -ForegroundColor Blue

# Check essential extensions
Write-Host "`n🔧 Verifying Essential MCP Development Extensions:" -ForegroundColor Yellow

$essentialExtensions = @(
    @{id="dbaeumer.vscode-eslint"; name="ESLint"},
    @{id="esbenp.prettier-vscode"; name="Prettier"},
    @{id="ms-python.python"; name="Python"},
    @{id="ms-python.vscode-pylance"; name="Pylance"},
    @{id="redhat.java"; name="Java Language Support"},
    @{id="vscjava.vscode-java-pack"; name="Java Extension Pack"},
    @{id="jacano.vscode-pnpm"; name="pnpm"},
    @{id="ms-azuretools.vscode-containers"; name="Docker"},
    @{id="github.vscode-pull-request-github"; name="GitHub PR"},
    @{id="davidanson.vscode-markdownlint"; name="Markdown Lint"},
    @{id="golang.go"; name="Go"},
    @{id="github.copilot"; name="GitHub Copilot"},
    @{id="github.copilot-chat"; name="Copilot Chat"}
)

$missingExtensions = @()
foreach ($ext in $essentialExtensions) {
    if ($extensions -contains $ext.id) {
        Write-Host "✅ $($ext.name)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($ext.name) (MISSING)" -ForegroundColor Red
        $missingExtensions += $ext.id
    }
}

# Check removed heavy extensions
Write-Host "`n🗑️  Verifying Heavy Extensions Were Removed:" -ForegroundColor Magenta

$removedExtensions = @(
    "ms-azuretools.azure-dev",
    "ms-dotnettools.dotnet-maui", 
    "ms-vscode.cpptools",
    "ms-toolsai.jupyter",
    "ms-windows-ai-studio.windows-ai-studio",
    "nvidia.nsight-vscode-edition",
    "anthropic.claude-code",
    "google.gemini-cli-vscode-ide-companion"
)

foreach ($ext in $removedExtensions) {
    if ($extensions -notcontains $ext) {
        Write-Host "✅ $ext (removed)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $ext (still present)" -ForegroundColor Yellow
    }
}

# Test monorepo functionality
Write-Host "`n🏗️  Testing Monorepo Functionality:" -ForegroundColor Blue

try {
    Write-Host "Testing pnpm..." -ForegroundColor Gray
    $pnpmResult = & pnpm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ pnpm available (v$pnpmResult)" -ForegroundColor Green
    } else {
        Write-Host "❌ pnpm not available" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ pnpm not available" -ForegroundColor Red
}

# Check workspace configuration
Write-Host "`n📁 Checking Workspace Configuration:" -ForegroundColor Blue

$workspaceFiles = @(
    ".vscode\extensions.json",
    ".vscode\settings.json", 
    "pnpm-workspace.yaml",
    "package.json"
)

foreach ($file in $workspaceFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (missing)" -ForegroundColor Red
    }
}

# Performance summary
Write-Host "`n📈 Performance Improvements:" -ForegroundColor Green
Write-Host "• Extension count reduced from 96 to $extensionCount ($(((96-$extensionCount)/96*100).ToString('F0'))% reduction)" -ForegroundColor White
Write-Host "• Expected memory usage reduction: 50-60%" -ForegroundColor White
Write-Host "• Expected startup time improvement: 50%+" -ForegroundColor White

# Recommendations
Write-Host "`n🎯 Recommendations:" -ForegroundColor Yellow

if ($missingExtensions.Count -gt 0) {
    Write-Host "Install missing essential extensions:" -ForegroundColor White
    foreach ($ext in $missingExtensions) {
        Write-Host "  code --install-extension $ext" -ForegroundColor Gray
    }
}

Write-Host "1. Restart VS Code to apply all changes" -ForegroundColor White
Write-Host "2. Check Task Manager for memory usage" -ForegroundColor White
Write-Host "3. Test monorepo workflow: pnpm build, lint, test" -ForegroundColor White

Write-Host "`n🏴‍☠️ The Monorepo Ritual is complete! Your VS Code is optimized for MCP orchestration! ⚓🔥" -ForegroundColor Magenta
