# Fix Go Extension Environment Issues
# This script will diagnose and fix Go environment problems in VS Code

Write-Host "🔧 Go Extension Environment Diagnostic" -ForegroundColor Green
Write-Host "Checking Go installation and VS Code extension configuration" -ForegroundColor Gray
Write-Host ""

# 1. Check Go installation
Write-Host "🔍 Checking Go Installation..." -ForegroundColor Cyan

try {
    $goVersion = go version 2>$null
    if ($goVersion) {
        Write-Host "✅ Go found: $goVersion" -ForegroundColor Green
        $goPath = (go env GOPATH 2>$null)
        $goRoot = (go env GOROOT 2>$null)
        Write-Host "   GOPATH: $goPath" -ForegroundColor Gray
        Write-Host "   GOROOT: $goRoot" -ForegroundColor Gray
    } else {
        Write-Host "❌ Go not found in PATH" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Go not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Check Go tools installation
Write-Host "`n🛠️  Checking Go Tools..." -ForegroundColor Cyan

$goTools = @(
    "golang.org/x/tools/gopls",
    "github.com/uudashr/gopkgs/v2/cmd/gopkgs",
    "github.com/ramya-rao-a/go-outline",
    "github.com/cweill/gotests/gotests",
    "github.com/fatih/gomodifytags",
    "github.com/josharian/impl",
    "github.com/haya14busa/goplay/cmd/goplay",
    "github.com/go-delve/delve/cmd/dlv"
)

foreach ($tool in $goTools) {
    $toolName = Split-Path $tool -Leaf
    $toolPath = "$goPath\bin\$toolName.exe"
    
    if (Test-Path $toolPath) {
        Write-Host "✅ $toolName installed" -ForegroundColor Green
    } else {
        Write-Host "❌ $toolName missing" -ForegroundColor Red
        Write-Host "   Install with: go install $tool@latest" -ForegroundColor Gray
    }
}

# 3. Check VS Code Go extension settings
Write-Host "`n⚙️  Checking VS Code Go Extension Settings..." -ForegroundColor Cyan

$settingsPath = "$env:APPDATA\Code\User\settings.json"
if (Test-Path $settingsPath) {
    try {
        $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
        
        # Check Go-specific settings
        $goSettings = @{}
        $settings.PSObject.Properties | Where-Object { $_.Name -like "go.*" } | ForEach-Object {
            $goSettings[$_.Name] = $_.Value
        }
        
        if ($goSettings.Count -gt 0) {
            Write-Host "Current Go settings:" -ForegroundColor White
            $goSettings.GetEnumerator() | ForEach-Object {
                Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray
            }
        } else {
            Write-Host "⚠️  No Go-specific settings found" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Could not read VS Code settings: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ VS Code settings file not found" -ForegroundColor Red
}

# 4. Check workspace Go configuration
Write-Host "`n📁 Checking Workspace Go Configuration..." -ForegroundColor Cyan

$workspaceRoot = Split-Path -Parent $PWD
$goModPath = Join-Path $workspaceRoot "go.mod"
$goWorkPath = Join-Path $workspaceRoot "go.work"

if (Test-Path $goModPath) {
    Write-Host "✅ go.mod found: $goModPath" -ForegroundColor Green
    $goModContent = Get-Content $goModPath -Head 5
    Write-Host "   Content:" -ForegroundColor Gray
    $goModContent | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
} else {
    Write-Host "⚠️  go.mod not found in workspace root" -ForegroundColor Yellow
}

if (Test-Path $goWorkPath) {
    Write-Host "✅ go.work found: $goWorkPath" -ForegroundColor Green
} else {
    Write-Host "ℹ️  go.work not found (optional)" -ForegroundColor Gray
}

# 5. Generate recommended VS Code settings for Go
Write-Host "`n🎯 Recommended Go Settings for VS Code..." -ForegroundColor Cyan

$recommendedSettings = @{
    "go.useLanguageServer" = $true
    "go.languageServerExperimentalFeatures" = @{
        "diagnostics" = $true
        "documentLink" = $true
    }
    "go.toolsManagement.autoUpdate" = $true
    "go.buildOnSave" = "workspace"
    "go.lintOnSave" = "workspace"
    "go.vetOnSave" = "workspace"
    "go.formatTool" = "goimports"
    "go.useCodeSnippetsOnFunctionSuggest" = $true
    "go.autocompleteUnimportedPackages" = $true
    "go.gocodePackageLookupMode" = "go"
    "go.gotoSymbol.includeImports" = $true
    "go.docsTool" = "godoc"
}

Write-Host "Add these to your VS Code settings.json:" -ForegroundColor White
$recommendedSettings | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Gray

# 6. Provide fix commands
Write-Host "`n🔧 Fix Commands:" -ForegroundColor Green

Write-Host "1. Install missing Go tools:" -ForegroundColor White
$goTools | ForEach-Object {
    Write-Host "   go install $_@latest" -ForegroundColor Gray
}

Write-Host "`n2. Reload VS Code Go extension:" -ForegroundColor White
Write-Host "   Ctrl+Shift+P → 'Go: Install/Update Tools'" -ForegroundColor Gray
Write-Host "   Ctrl+Shift+P → 'Developer: Reload Window'" -ForegroundColor Gray

Write-Host "`n3. Check Go extension output:" -ForegroundColor White
Write-Host "   View → Output → Select 'Go' from dropdown" -ForegroundColor Gray
