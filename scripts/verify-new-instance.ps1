# New Instance Verification Script
# Run this in the NEW VS Code instance to verify optimization

Write-Host "🔍 Verifying New Optimized VS Code Instance" -ForegroundColor Cyan
Write-Host "This should show the optimized configuration..." -ForegroundColor Yellow

# Check extension count
$extensions = & code --list-extensions
$extensionCount = ($extensions | Measure-Object).Count

Write-Host "`n📊 Extension Count Verification:" -ForegroundColor Blue
Write-Host "Current extensions: $extensionCount" -ForegroundColor White

if ($extensionCount -le 35) {
    Write-Host "🏆 EXCELLENT! Optimization successful ($extensionCount extensions)" -ForegroundColor Green
} elseif ($extensionCount -le 45) {
    Write-Host "👍 GOOD! Partial optimization ($extensionCount extensions)" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Extensions may not be optimized ($extensionCount extensions)" -ForegroundColor Yellow
}

# Verify core essentials
Write-Host "`n🔧 Essential Extensions Check:" -ForegroundColor Blue
$essentials = @(
    @{id="dbaeumer.vscode-eslint"; name="ESLint"},
    @{id="esbenp.prettier-vscode"; name="Prettier"},
    @{id="ms-python.python"; name="Python"},
    @{id="ms-python.vscode-pylance"; name="Pylance"},
    @{id="redhat.java"; name="Java"},
    @{id="vscjava.vscode-java-pack"; name="Java Pack"},
    @{id="jacano.vscode-pnpm"; name="pnpm"},
    @{id="ms-azuretools.vscode-containers"; name="Docker"},
    @{id="github.copilot"; name="Copilot"},
    @{id="github.copilot-chat"; name="Copilot Chat"}
)

$allPresent = $true
foreach ($ext in $essentials) {
    if ($extensions -contains $ext.id) {
        Write-Host "✅ $($ext.name)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($ext.name) (MISSING)" -ForegroundColor Red
        $allPresent = $false
    }
}

# Check removed heavy extensions
Write-Host "`n🗑️  Heavy Extensions Removal Check:" -ForegroundColor Magenta
$shouldBeGone = @(
    "ms-azuretools.azure-dev",
    "ms-toolsai.jupyter", 
    "ms-windows-ai-studio.windows-ai-studio",
    "nvidia.nsight-vscode-edition",
    "anthropic.claude-code",
    "visualstudioexptteam.vscodeintellicode",
    "ms-vscode.powershell"
)

$cleanupWorked = $true
foreach ($ext in $shouldBeGone) {
    if ($extensions -notcontains $ext) {
        Write-Host "✅ $ext (removed)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $ext (still present)" -ForegroundColor Yellow
        $cleanupWorked = $false
    }
}

# Performance test suggestions
Write-Host "`n🚀 Performance Tests for This Instance:" -ForegroundColor Yellow
Write-Host "Test these features in THIS window:" -ForegroundColor White

Write-Host "`n1. Java Development:" -ForegroundColor Blue
Write-Host "   • Open packages/mcp-v2-java-client/src/main/java/..." -ForegroundColor Gray
Write-Host "   • Check IntelliSense works" -ForegroundColor Gray

Write-Host "`n2. TypeScript/JavaScript:" -ForegroundColor Blue  
Write-Host "   • Open packages/core/src/index.ts" -ForegroundColor Gray
Write-Host "   • Check ESLint and Prettier work" -ForegroundColor Gray

Write-Host "`n3. Python:" -ForegroundColor Blue
Write-Host "   • Open packages/mcp-v2-python-client/..." -ForegroundColor Gray
Write-Host "   • Check Pylance IntelliSense" -ForegroundColor Gray

Write-Host "`n4. Monorepo:" -ForegroundColor Blue
Write-Host "   • Run: pnpm --version" -ForegroundColor Gray
Write-Host "   • Run: pnpm build" -ForegroundColor Gray

Write-Host "`n5. Docker:" -ForegroundColor Blue
Write-Host "   • Open docker-compose.java-dev.yml" -ForegroundColor Gray
Write-Host "   • Check syntax highlighting" -ForegroundColor Gray

# Memory comparison reminder
Write-Host "`n💾 Memory Comparison:" -ForegroundColor Magenta
Write-Host "NOW check Task Manager:" -ForegroundColor White
Write-Host "• This NEW instance should use ~200-300MB" -ForegroundColor Green
Write-Host "• Your OLD instance likely uses ~400-500MB+" -ForegroundColor Red
Write-Host "• Startup should have been faster" -ForegroundColor Green

# Summary
Write-Host "`n📈 Optimization Summary:" -ForegroundColor Green
$reductionPercent = ((96 - $extensionCount) / 96 * 100).ToString("F0")
Write-Host "• Extensions reduced: 96 → $extensionCount ($reductionPercent% reduction)" -ForegroundColor White
Write-Host "• Expected memory savings: 50-60%" -ForegroundColor White
Write-Host "• Expected startup improvement: 60%+" -ForegroundColor White

if ($allPresent -and $cleanupWorked) {
    Write-Host "`n🏆 SUCCESS! This instance is fully optimized for MCP development!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some issues detected - may need troubleshooting" -ForegroundColor Yellow
}

Write-Host "`n🏴‍☠️ New optimized instance ready! Compare with the old one! ⚓🔥" -ForegroundColor Magenta
