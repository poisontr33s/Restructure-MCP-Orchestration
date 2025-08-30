# VS Code New Window Optimization Test
# This script tests if the optimization persisted in a new VS Code window

Write-Host "🔍 Testing VS Code Optimization in New Window..." -ForegroundColor Cyan
Write-Host "Checking if session optimization persisted..." -ForegroundColor Yellow

# Wait a moment for the new window to load
Start-Sleep -Seconds 3

# Check current extension count
Write-Host "`n📊 Checking Extension Count:" -ForegroundColor Blue
$extensions = & code --list-extensions
$extensionCount = ($extensions | Measure-Object).Count
Write-Host "Current extensions: $extensionCount" -ForegroundColor White

if ($extensionCount -le 55) {
    Write-Host "✅ Extension optimization PERSISTED! (50-55 extensions)" -ForegroundColor Green
} elseif ($extensionCount -le 70) {
    Write-Host "⚠️  Partial optimization (56-70 extensions)" -ForegroundColor Yellow
} else {
    Write-Host "❌ Extensions may have been restored (70+ extensions)" -ForegroundColor Red
}

# Check essential MCP extensions are still available
Write-Host "`n🔧 Verifying Essential Extensions:" -ForegroundColor Blue

$essentialExtensions = @(
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode", 
    "ms-python.python",
    "redhat.java",
    "vscjava.vscode-java-pack",
    "jacano.vscode-pnpm",
    "ms-azuretools.vscode-containers",
    "github.copilot"
)

$allPresent = $true
foreach ($ext in $essentialExtensions) {
    if ($extensions -contains $ext) {
        Write-Host "✅ $ext" -ForegroundColor Green
    } else {
        Write-Host "❌ $ext (MISSING)" -ForegroundColor Red
        $allPresent = $false
    }
}

# Check removed extensions are still gone
Write-Host "`n🗑️  Verifying Heavy Extensions Stay Removed:" -ForegroundColor Magenta

$shouldBeRemoved = @(
    "ms-azuretools.azure-dev",
    "ms-toolsai.jupyter",
    "ms-windows-ai-studio.windows-ai-studio",
    "anthropic.claude-code",
    "google.gemini-cli-vscode-ide-companion"
)

$cleanupIntact = $true
foreach ($ext in $shouldBeRemoved) {
    if ($extensions -notcontains $ext) {
        Write-Host "✅ $ext (still removed)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $ext (unexpectedly present)" -ForegroundColor Yellow
        $cleanupIntact = $false
    }
}

# Overall session persistence test
Write-Host "`n🎯 Session Persistence Test Results:" -ForegroundColor Yellow

if ($allPresent -and $cleanupIntact -and $extensionCount -le 55) {
    Write-Host "🏆 EXCELLENT! Session optimization fully persisted" -ForegroundColor Green
    Write-Host "   • Extension count optimized: $extensionCount" -ForegroundColor White
    Write-Host "   • Essential extensions present: ✅" -ForegroundColor White
    Write-Host "   • Heavy extensions removed: ✅" -ForegroundColor White
} elseif ($allPresent -and $cleanupIntact) {
    Write-Host "👍 GOOD! Core optimization persisted" -ForegroundColor Cyan
    Write-Host "   • Extension count: $extensionCount (acceptable)" -ForegroundColor White
    Write-Host "   • Essential extensions present: ✅" -ForegroundColor White
    Write-Host "   • Heavy extensions removed: ✅" -ForegroundColor White
} else {
    Write-Host "⚠️  PARTIAL! Some optimization may need reapplication" -ForegroundColor Yellow
    Write-Host "   • Extension count: $extensionCount" -ForegroundColor White
    Write-Host "   • Essential extensions: $(if($allPresent){'✅'}else{'❌'})" -ForegroundColor White
    Write-Host "   • Cleanup intact: $(if($cleanupIntact){'✅'}else{'❌'})" -ForegroundColor White
}

Write-Host "`n🔧 Quick Performance Test:" -ForegroundColor Blue
Write-Host "Monitor the new VS Code window for:" -ForegroundColor White
Write-Host "• Faster startup time" -ForegroundColor Gray
Write-Host "• Lower memory usage in Task Manager" -ForegroundColor Gray
Write-Host "• Responsive IntelliSense" -ForegroundColor Gray
Write-Host "• Working monorepo functionality" -ForegroundColor Gray

Write-Host "`n🏴‍☠️ New window test complete! Check the new VS Code instance. ⚓🔥" -ForegroundColor Magenta
