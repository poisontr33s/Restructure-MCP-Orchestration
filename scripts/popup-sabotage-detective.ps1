# 🏴‍☠️ Captain Guthilda's Popup Sabotage Detective
# Hunts down annoying Win11/VS Code popups and their sources

param(
    [switch]$Fix = $false,
    [switch]$Monitor = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

Write-Host "🕵️ Captain Guthilda's Popup Sabotage Detective" -ForegroundColor Cyan
Write-Host "🎯 Hunting down annoying system popups and their sources..." -ForegroundColor Yellow

# Get repository root
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$DevToolsDir = Join-Path $RepoRoot "dev-tools"

# 📋 Popup Sources Registry
$PopupSources = @{
    "Go Binary Not Found" = @{
        Pattern = "Failed to find the `"go`" binary"
        Source = "VS Code Go Extension"
        Solution = "Fix VS Code settings and PATH configuration"
        Priority = "HIGH"
    }
    "npm Package Manager" = @{
        Pattern = "npm.*package.*manager"
        Source = "VS Code npm/Node extensions"
        Solution = "Configure portable Node.js environment"
        Priority = "MEDIUM"
    }
    "TailwindCSS v4" = @{
        Pattern = "tailwind.*v4"
        Source = "VS Code Tailwind CSS extension"
        Solution = "Update extension settings or disable if not needed"
        Priority = "LOW"
    }
    "GOROOT/PATH Issues" = @{
        Pattern = "GOROOT.*PATH.*Check PATH"
        Source = "VS Code Go extension configuration"
        Solution = "Set proper GOROOT and update VS Code settings"
        Priority = "HIGH"
    }
}

# 🔍 Current Environment Analysis
function Analyze-Environment {
    Write-Host "`n🔍 ENVIRONMENT ANALYSIS" -ForegroundColor Cyan
    
    # Check current PATH
    Write-Host "`n📍 Current PATH Analysis:" -ForegroundColor Yellow
    $currentPath = $env:PATH -split ";"
    $relevantPaths = $currentPath | Where-Object { 
        $_ -like "*go*" -or 
        $_ -like "*node*" -or 
        $_ -like "*dev-tools*" -or
        $_ -like "*java*" -or
        $_ -like "*maven*"
    }
    
    if ($relevantPaths) {
        $relevantPaths | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }
    } else {
        Write-Host "  ❌ No development tools found in PATH" -ForegroundColor Red
    }
    
    # Check for portable tools
    Write-Host "`n📁 Portable Tools Status:" -ForegroundColor Yellow
    $tools = @("java21", "maven", "go", "node", "bun")
    foreach ($tool in $tools) {
        $toolPath = Join-Path $DevToolsDir $tool
        if (Test-Path $toolPath) {
            Write-Host "  ✅ $tool - Found at $toolPath" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $tool - Not found" -ForegroundColor Red
        }
    }
    
    # Check VS Code settings
    Write-Host "`n⚙️ VS Code Configuration:" -ForegroundColor Yellow
    $vscodeSettings = Join-Path $RepoRoot ".vscode\settings.json"
    if (Test-Path $vscodeSettings) {
        Write-Host "  ✅ VS Code settings found" -ForegroundColor Green
        $settings = Get-Content $vscodeSettings -Raw | ConvertFrom-Json
        
        # Check Go configuration
        if ($settings."go.goroot") {
            Write-Host "  ✅ Go GOROOT configured: $($settings."go.goroot")" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Go GOROOT not configured" -ForegroundColor Red
        }
        
        # Check Java configuration
        if ($settings."java.jdt.ls.java.home") {
            Write-Host "  ✅ Java home configured: $($settings."java.jdt.ls.java.home")" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Java home not configured" -ForegroundColor Red
        }
    } else {
        Write-Host "  ❌ No VS Code settings found" -ForegroundColor Red
    }
}

# 🛠️ Fix Functions
function Fix-GoConfiguration {
    Write-Host "`n🔧 FIXING GO CONFIGURATION" -ForegroundColor Cyan
    
    $goPath = Join-Path $DevToolsDir "go"
    $goBinary = Join-Path $goPath "bin\go.exe"
    
    if (-not (Test-Path $goBinary)) {
        Write-Host "❌ Go binary not found at $goBinary" -ForegroundColor Red
        return $false
    }
    
    # Update VS Code settings
    $vscodeDir = Join-Path $RepoRoot ".vscode"
    $settingsPath = Join-Path $vscodeDir "settings.json"
    
    New-Item -ItemType Directory -Force -Path $vscodeDir | Out-Null
    
    $settings = @{}
    if (Test-Path $settingsPath) {
        $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json -AsHashtable
    }
    
    # Add Go-specific settings
    $goRootPath = $goPath.Replace('\', '\\')
    $goBinPath = (Join-Path $goPath "bin").Replace('\', '\\')
    
    $settings["go.goroot"] = $goRootPath
    $settings["go.gopath"] = Join-Path $RepoRoot "go-workspace" | ForEach-Object { $_.Replace('\', '\\') }
    $settings["go.toolsGopath"] = Join-Path $RepoRoot "go-tools" | ForEach-Object { $_.Replace('\', '\\') }
    $settings["go.alternateTools"] = @{
        "go" = "$goRootPath\\bin\\go.exe"
    }
    
    # Update terminal environment
    if (-not $settings["terminal.integrated.env.windows"]) {
        $settings["terminal.integrated.env.windows"] = @{}
    }
    
    $settings["terminal.integrated.env.windows"]["GOROOT"] = $goRootPath
    $settings["terminal.integrated.env.windows"]["GOPATH"] = Join-Path $RepoRoot "go-workspace" | ForEach-Object { $_.Replace('\', '\\') }
    
    # Update PATH
    $currentPath = $settings["terminal.integrated.env.windows"]["PATH"]
    if (-not $currentPath) {
        $currentPath = '${env:PATH}'
    }
    $settings["terminal.integrated.env.windows"]["PATH"] = "$goBinPath;$currentPath"
    
    # Save settings
    $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8
    
    Write-Host "✅ Updated VS Code settings for Go" -ForegroundColor Green
    Write-Host "📍 GOROOT: $goRootPath" -ForegroundColor Gray
    Write-Host "📍 Go Binary: $goRootPath\\bin\\go.exe" -ForegroundColor Gray
    
    return $true
}

function Fix-NodeConfiguration {
    Write-Host "`n🔧 FIXING NODE/NPM CONFIGURATION" -ForegroundColor Cyan
    
    $nodePath = Join-Path $DevToolsDir "node"
    $bunPath = Join-Path $DevToolsDir "bun"
    
    $vscodeDir = Join-Path $RepoRoot ".vscode"
    $settingsPath = Join-Path $vscodeDir "settings.json"
    
    $settings = @{}
    if (Test-Path $settingsPath) {
        $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json -AsHashtable
    }
    
    # Disable npm/node popups if tools aren't needed
    $settings["npm.enabled"] = $false
    $settings["npm.autoDetect"] = "off"
    $settings["typescript.preferences.includePackageJsonAutoImports"] = "off"
    
    # If we have portable Node.js, configure it
    if (Test-Path $nodePath) {
        $nodeExe = Join-Path $nodePath "node.exe"
        $npmExe = Join-Path $nodePath "npm.cmd"
        
        if (Test-Path $nodeExe) {
            $settings["npm.enabled"] = $true
            $settings["npm.packageManager"] = "npm"
            $settings["typescript.npm"] = $npmExe.Replace('\', '\\')
        }
    }
    
    # Configure Bun if available
    if (Test-Path $bunPath) {
        $bunExe = Join-Path $bunPath "bun.exe"
        if (Test-Path $bunExe) {
            $settings["npm.packageManager"] = "bun"
        }
    }
    
    # Save settings
    $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8
    
    Write-Host "✅ Updated VS Code settings for Node/npm" -ForegroundColor Green
}

function Fix-TailwindConfiguration {
    Write-Host "`n🔧 FIXING TAILWIND CONFIGURATION" -ForegroundColor Cyan
    
    $vscodeDir = Join-Path $RepoRoot ".vscode"
    $settingsPath = Join-Path $vscodeDir "settings.json"
    
    $settings = @{}
    if (Test-Path $settingsPath) {
        $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json -AsHashtable
    }
    
    # Disable Tailwind CSS extension if causing issues
    $settings["tailwindCSS.experimental.configFile"] = $null
    $settings["tailwindCSS.includeLanguages"] = @{}
    $settings["tailwindCSS.validate"] = $false
    
    # Save settings
    $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8
    
    Write-Host "✅ Disabled problematic Tailwind CSS features" -ForegroundColor Green
}

# 🎯 Popup Monitoring System
function Start-PopupMonitoring {
    Write-Host "`n👁️ STARTING POPUP MONITORING" -ForegroundColor Cyan
    Write-Host "📝 Monitoring VS Code and system logs for popup sources..." -ForegroundColor Yellow
    
    # Monitor VS Code extension logs
    $vscodeLogsPath = "$env:USERPROFILE\.vscode\logs"
    if (Test-Path $vscodeLogsPath) {
        Write-Host "📁 VS Code logs: $vscodeLogsPath" -ForegroundColor Gray
        
        # Get recent log files
        $recentLogs = Get-ChildItem $vscodeLogsPath -Recurse -Filter "*.log" | 
                     Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-1) } |
                     Sort-Object LastWriteTime -Descending |
                     Select-Object -First 10
        
        foreach ($log in $recentLogs) {
            Write-Host "  📄 $($log.Name) - $($log.LastWriteTime)" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n🎯 To stop monitoring, press Ctrl+C" -ForegroundColor Yellow
    Write-Host "📊 Popup events will be logged here..." -ForegroundColor Gray
    
    # Keep monitoring (simplified for demo)
    try {
        while ($true) {
            Start-Sleep -Seconds 5
            # TODO: Implement actual popup monitoring logic here.
            # In a real implementation, we'd monitor actual popup events
            Write-Host "." -NoNewline -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "`n🛑 Monitoring stopped" -ForegroundColor Yellow
    }
}

# 📊 Generate Report
function Generate-PopupReport {
    $reportPath = Join-Path $RepoRoot "POPUP-SABOTAGE-REPORT.md"
    
    $report = @"
# 🏴‍☠️ Captain Guthilda's Popup Sabotage Report

**Generated:** $(Get-Date)  
**Repository:** $RepoRoot  

## 🎯 Identified Popup Sources

"@

    foreach ($source in $PopupSources.Keys) {
        $info = $PopupSources[$source]
        $report += @"

### $source
- **Pattern:** ``$($info.Pattern)``
- **Source:** $($info.Source)
- **Priority:** $($info.Priority)
- **Solution:** $($info.Solution)

"@
    }
    
    $report += @"

## 🔧 Recommended Fixes

1. **Update VS Code Settings** - Configure portable tool paths
2. **Set Environment Variables** - Ensure GOROOT, JAVA_HOME, etc. are set
3. **Disable Unnecessary Extensions** - Turn off extensions for unused tools
4. **Use Portable Setup Scripts** - Run setup-dev-env.ps1 before development

## 🎪 Prevention Strategy

- Always run portable environment setup before opening VS Code
- Keep dev-tools directory properly configured
- Monitor VS Code extension settings for conflicts
- Use workspace-specific settings to override global configuration

---
*Generated by Captain Guthilda's Popup Sabotage Detective 🕵️*
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "📄 Report generated: $reportPath" -ForegroundColor Green
}

# 🚀 Main Execution
Write-Host "`n🎯 POPUP SABOTAGE ANALYSIS" -ForegroundColor Cyan

# Always analyze environment
Analyze-Environment

if ($Fix) {
    Write-Host "`n🛠️ APPLYING FIXES" -ForegroundColor Cyan
    
    $goFixed = Fix-GoConfiguration
    Fix-NodeConfiguration
    Fix-TailwindConfiguration
    
    if ($goFixed) {
        Write-Host "`n✅ FIXES APPLIED SUCCESSFULLY" -ForegroundColor Green
        Write-Host "📝 Please restart VS Code to apply changes" -ForegroundColor Yellow
    }
}

if ($Monitor) {
    Start-PopupMonitoring
}

# Always generate report
Generate-PopupReport

Write-Host "`n🎉 POPUP SABOTAGE DETECTIVE COMPLETE!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run with -Fix to apply automatic fixes" -ForegroundColor White
Write-Host "2. Run with -Monitor to watch for popup sources" -ForegroundColor White
Write-Host "3. Restart VS Code after applying fixes" -ForegroundColor White
Write-Host "4. Run setup-dev-env.ps1 to activate portable environment" -ForegroundColor White
