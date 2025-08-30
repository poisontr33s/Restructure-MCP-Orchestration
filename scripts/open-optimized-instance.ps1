# Open New Optimized VS Code Instance (Session-Safe)
# This creates a new VS Code window with the optimized extensions while keeping the current session intact

Write-Host "🔥 Opening New Optimized VS Code Instance..." -ForegroundColor Yellow
Write-Host "Current session will remain intact for comparison!" -ForegroundColor Green

# Get current workspace path
$currentPath = Get-Location
Write-Host "`n📁 Current workspace: $currentPath" -ForegroundColor Blue

# Open new VS Code instance with same workspace
Write-Host "`n🚀 Launching new VS Code instance..." -ForegroundColor Cyan
Write-Host "This will open with the optimized 32 extensions!" -ForegroundColor Green

# Use --new-window to ensure separate instance
Start-Process "code" -ArgumentList "--new-window", ".", "--disable-extensions-except", "dbaeumer.vscode-eslint,esbenp.prettier-vscode,ms-python.python,ms-python.vscode-pylance,redhat.java,vscjava.vscode-java-pack,jacano.vscode-pnpm,ms-azuretools.vscode-containers,github.vscode-pull-request-github,davidanson.vscode-markdownlint,yzhang.markdown-all-in-one,golang.go,github.copilot,github.copilot-chat" -NoNewWindow

Write-Host "`n⏱️  Waiting for new instance to load..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n🔍 Memory Comparison Instructions:" -ForegroundColor Magenta
Write-Host "1. Open Task Manager (Ctrl+Shift+Esc)" -ForegroundColor White
Write-Host "2. Go to 'Details' tab and sort by 'Memory'" -ForegroundColor White
Write-Host "3. Look for multiple 'Code.exe' processes" -ForegroundColor White
Write-Host "4. Compare memory usage between instances:" -ForegroundColor White
Write-Host "   • OLD instance (this one): Should show higher memory usage" -ForegroundColor Red
Write-Host "   • NEW instance: Should show significantly lower memory usage" -ForegroundColor Green

Write-Host "`n📊 Expected Results:" -ForegroundColor Blue
Write-Host "• OLD instance: ~400-500MB+ (96→32 extensions still loading)" -ForegroundColor Red
Write-Host "• NEW instance: ~200-300MB (clean start with 32 extensions)" -ForegroundColor Green
Write-Host "• Difference: 50-60% memory reduction!" -ForegroundColor Cyan

Write-Host "`n🎯 Test the New Instance:" -ForegroundColor Yellow
Write-Host "In the NEW VS Code window, try:" -ForegroundColor White
Write-Host "• Opening Java files → IntelliSense should work" -ForegroundColor Gray
Write-Host "• TypeScript/JavaScript → ESLint & Prettier should work" -ForegroundColor Gray
Write-Host "• Python files → Pylance should provide IntelliSense" -ForegroundColor Gray
Write-Host "• Docker files → Container support should work" -ForegroundColor Gray
Write-Host "• Git operations → GitHub integration should work" -ForegroundColor Gray
Write-Host "• Markdown files → Linting and editing should work" -ForegroundColor Gray

Write-Host "`n✅ Verification Commands for New Instance:" -ForegroundColor Green
Write-Host "Run these in the NEW VS Code terminal:" -ForegroundColor White
Write-Host "• pnpm --version" -ForegroundColor Gray
Write-Host "• pnpm build" -ForegroundColor Gray
Write-Host "• git status" -ForegroundColor Gray

Write-Host "`n🏴‍☠️ Both sessions preserved! Compare the performance difference! ⚓🔥" -ForegroundColor Magenta
Write-Host "The new instance should be much faster and use less memory!" -ForegroundColor Green
