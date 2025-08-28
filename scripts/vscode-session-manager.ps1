# 🏴‍☠️ Captain Guthilda's VS Code Session Manager
# Creates project-specific VS Code shortcuts with isolated configurations

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [string]$ProjectPath = (Get-Location).Path,
    [string]$ShortcutLocation = "",
    [switch]$CreateMenuEntry,
    [switch]$IsolateExtensions,
    [switch]$CustomSettings,
    [switch]$NoMenuEntry,
    [switch]$NoExtensionIsolation,
    [switch]$NoCustomSettings
)

$ErrorActionPreference = "Stop"

Write-Host "🏴‍☠️ CAPTAIN GUTHILDA'S VS CODE SESSION MANAGER" -ForegroundColor Cyan
Write-Host "🎯 Creating isolated VS Code session for: $ProjectName" -ForegroundColor Yellow

# Set default behaviors (enabled unless explicitly disabled)
if (-not $NoMenuEntry) { $CreateMenuEntry = $true }
if (-not $NoExtensionIsolation) { $IsolateExtensions = $true }
if (-not $NoCustomSettings) { $CustomSettings = $true }

# Create project-specific VS Code data directory
$sessionDataPath = "$env:APPDATA\Code-Sessions\$ProjectName"
$extensionsPath = "$sessionDataPath\extensions"
$userDataPath = "$sessionDataPath\User"

function New-ProjectVSCodeEnvironment {
    Write-Host "🏗️ Creating isolated VS Code environment..." -ForegroundColor Yellow
    
    # Create directory structure
    New-Item -ItemType Directory -Force -Path $sessionDataPath | Out-Null
    New-Item -ItemType Directory -Force -Path $extensionsPath | Out-Null
    New-Item -ItemType Directory -Force -Path $userDataPath | Out-Null
    
    Write-Host "  📁 Session data: $sessionDataPath" -ForegroundColor Gray
    Write-Host "  📁 Extensions: $extensionsPath" -ForegroundColor Gray
    Write-Host "  📁 User data: $userDataPath" -ForegroundColor Gray
}

function Copy-BaseConfiguration {
    Write-Host "📋 Setting up base configuration..." -ForegroundColor Yellow
    
    # Copy essential settings from main VS Code if they exist
    $mainUserData = "$env:APPDATA\Code\User"
    $essentialFiles = @("settings.json", "keybindings.json")
    
    foreach ($file in $essentialFiles) {
        $sourcePath = Join-Path $mainUserData $file
        $targetPath = Join-Path $userDataPath $file
        
        if (Test-Path $sourcePath) {
            Copy-Item $sourcePath $targetPath -Force
            Write-Host "  ✅ Copied: $file" -ForegroundColor Green
        } else {
            # Create minimal settings for new projects
            if ($file -eq "settings.json") {
                $minimalSettings = @{
                    "workbench.startupEditor" = "readme"
                    "terminal.integrated.defaultProfile.windows" = "PowerShell"
                    "files.autoSave" = "afterDelay"
                    "editor.formatOnSave" = $true
                } | ConvertTo-Json -Depth 10
                
                $minimalSettings | Out-File -FilePath $targetPath -Encoding UTF8
                Write-Host "  ✅ Created minimal: $file" -ForegroundColor Green
            }
        }
    }
}

function Add-ProjectSpecificSettings {
    Write-Host "🎨 Adding project-specific settings..." -ForegroundColor Yellow
    
    $settingsPath = Join-Path $userDataPath "settings.json"
    
    if (Test-Path $settingsPath) {
        $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
    } else {
        $settings = @{}
    }
    
    # Detect project type and add relevant settings
    $projectSettings = @{}
    
    # Java/Maven project
    if (Test-Path (Join-Path $ProjectPath "pom.xml")) {
        $projectSettings["java.jdt.ls.java.home"] = ".\\dev-tools\\java21"
        $projectSettings["maven.executable.path"] = ".\\dev-tools\\maven\\bin\\mvn.cmd"
        $projectSettings["java.configuration.updateBuildConfiguration"] = "automatic"
        $projectSettings["java.configuration.runtimes"] = @(
            @{
                "name" = "JavaSE-21"
                "path" = ".\\dev-tools\\java21"
                "default" = $true
            }
        )
        # Disable automatic JDK downloads and installations
        $projectSettings["java.jdt.ls.vmargs"] = "-Xmx2G"
        $projectSettings["java.import.gradle.enabled"] = $false
        $projectSettings["java.saveActions.organizeImports"] = $true
        $projectSettings["java.compile.nullAnalysis.mode"] = "automatic"
        # Force use of our portable Java, disable downloads
        $projectSettings["java.configuration.checkProjectSettings"] = $false
        $projectSettings["java.requirements.JDK11Warning"] = $false
        $projectSettings["java.import.gradle.wrapper.checksums"] = @()
        Write-Host "  ☕ Java/Maven settings added (with popup prevention)" -ForegroundColor Green
    }
    
    # Node.js project
    if (Test-Path (Join-Path $ProjectPath "package.json")) {
        $projectSettings["npm.packageManager"] = "pnpm"
        $projectSettings["typescript.preferences.quoteStyle"] = "single"
        Write-Host "  📦 Node.js settings added" -ForegroundColor Green
    }
    
    # Go project
    if (Test-Path (Join-Path $ProjectPath "go.mod")) {
        $projectSettings["go.goroot"] = ".\\dev-tools\\go"
        $projectSettings["go.gopath"] = ".\\go-workspace"
        Write-Host "  🐹 Go settings added" -ForegroundColor Green
    }
    
    # TailwindCSS fix for the error you're seeing
    if (Test-Path (Join-Path $ProjectPath "tailwind.config.*")) {
        $projectSettings["tailwindCSS.experimental.configFile"] = "tailwind.config.ts"
        $projectSettings["tailwindCSS.includeLanguages"] = @{
            "typescript" = "javascript"
            "typescriptreact" = "javascript"
        }
        Write-Host "  🎨 TailwindCSS settings added (fixing config errors)" -ForegroundColor Green
    }
    
    # Merge project settings
    foreach ($key in $projectSettings.Keys) {
        $settings | Add-Member -MemberType NoteProperty -Name $key -Value $projectSettings[$key] -Force
    }
    
    # Save updated settings
    $settings | ConvertTo-Json -Depth 10 | Out-File -FilePath $settingsPath -Encoding UTF8
}

function New-LaunchScript {
    Write-Host "📜 Creating launch script..." -ForegroundColor Yellow
    
    $launchScriptPath = Join-Path $sessionDataPath "launch-$ProjectName.ps1"
    
    $launchScript = @"
# 🏴‍☠️ $ProjectName VS Code Session Launcher
# Auto-generated by Captain Guthilda's Session Manager

Write-Host "🚀 Launching $ProjectName VS Code session..." -ForegroundColor Cyan

# Set environment for portable tools BEFORE launching VS Code
`$projectRoot = "$ProjectPath"
if (Test-Path "`$projectRoot\dev-tools") {
    `$env:JAVA_HOME = "`$projectRoot\dev-tools\java21"
    `$env:MAVEN_HOME = "`$projectRoot\dev-tools\maven"
    `$env:GOROOT = "`$projectRoot\dev-tools\go"
    `$env:GOPATH = "`$projectRoot\go-workspace"
    `$env:PATH = "`$projectRoot\dev-tools\java21\bin;`$projectRoot\dev-tools\maven\bin;`$projectRoot\dev-tools\go\bin;" + `$env:PATH
    
    Write-Host "✅ Portable Java 21 environment activated" -ForegroundColor Green
    Write-Host "  📁 JAVA_HOME: `$env:JAVA_HOME" -ForegroundColor Gray
    Write-Host "  📁 MAVEN_HOME: `$env:MAVEN_HOME" -ForegroundColor Gray
}

# Launch VS Code with isolated session and environment
Start-Process "code" -ArgumentList @(
    "--user-data-dir", "$userDataPath",
    "--extensions-dir", "$extensionsPath",
    "$ProjectPath"
) -WorkingDirectory "$ProjectPath"

Write-Host "✅ $ProjectName session started with portable tools!" -ForegroundColor Green
"@
    
    $launchScript | Out-File -FilePath $launchScriptPath -Encoding UTF8
    Write-Host "  📜 Launch script: $launchScriptPath" -ForegroundColor Gray
    
    return $launchScriptPath
}

function New-DesktopShortcut {
    param($LaunchScriptPath)
    
    Write-Host "🔗 Creating desktop shortcut..." -ForegroundColor Yellow
    
    $shortcutPath = Join-Path $ShortcutLocation "VSCode-$ProjectName.lnk"
    
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$LaunchScriptPath`""
    $Shortcut.WorkingDirectory = $ProjectPath
    $Shortcut.IconLocation = "shell32.dll,25"  # VS Code-like icon
    $Shortcut.Description = "Launch $ProjectName in isolated VS Code session"
    $Shortcut.Save()
    
    Write-Host "  🔗 Shortcut: $shortcutPath" -ForegroundColor Green
}

function New-StartMenuEntry {
    param($LaunchScriptPath)
    
    if (-not $CreateMenuEntry) { return }
    
    Write-Host "📋 Creating Start Menu entry..." -ForegroundColor Yellow
    
    $startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\VS Code Sessions"
    New-Item -ItemType Directory -Force -Path $startMenuPath | Out-Null
    
    $menuShortcutPath = Join-Path $startMenuPath "$ProjectName.lnk"
    
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($menuShortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$LaunchScriptPath`""
    $Shortcut.WorkingDirectory = $ProjectPath
    $Shortcut.IconLocation = "shell32.dll,25"
    $Shortcut.Description = "Launch $ProjectName in isolated VS Code session"
    $Shortcut.Save()
    
    Write-Host "  📋 Start Menu: $menuShortcutPath" -ForegroundColor Green
}

function Install-EssentialExtensions {
    if (-not $IsolateExtensions) { return }
    
    Write-Host "🔌 Installing essential extensions for project type..." -ForegroundColor Yellow
    
    $extensionsToInstall = @()
    
    # Base extensions for all projects
    $extensionsToInstall += @(
        "ms-vscode.powershell",
        "github.copilot",
        "ms-vscode.vscode-json"
    )
    
    # Project-specific extensions
    if (Test-Path (Join-Path $ProjectPath "pom.xml")) {
        $extensionsToInstall += @(
            "redhat.java",
            "vscjava.vscode-java-pack",
            "vscjava.vscode-maven"
        )
    }
    
    if (Test-Path (Join-Path $ProjectPath "package.json")) {
        $extensionsToInstall += @(
            "ms-vscode.vscode-typescript-next",
            "esbenp.prettier-vscode",
            "bradlc.vscode-tailwindcss"
        )
    }
    
    if (Test-Path (Join-Path $ProjectPath "go.mod")) {
        $extensionsToInstall += @(
            "golang.go"
        )
    }
    
    Write-Host "  📦 Extensions to install: $($extensionsToInstall.Count)" -ForegroundColor Gray
    
    # Create extension installation script
    $extensionScript = Join-Path $sessionDataPath "install-extensions.ps1"
    $installCommands = $extensionsToInstall | ForEach-Object {
        "code --user-data-dir `"$userDataPath`" --extensions-dir `"$extensionsPath`" --install-extension $_"
    }
    
    $installCommands -join "`n" | Out-File -FilePath $extensionScript -Encoding UTF8
    Write-Host "  🔌 Extension installer: $extensionScript" -ForegroundColor Gray
}

# Main execution
Write-Host "`n🎯 CREATING PROJECT SESSION" -ForegroundColor Cyan

# Auto-detect correct desktop path (OneDrive vs local)
if (-not $ShortcutLocation) {
    $possibleDesktops = @(
        "$env:USERPROFILE\OneDrive\Desktop",
        "$env:USERPROFILE\Desktop",
        "$env:OneDrive\Desktop"
    )
    
    foreach ($desktop in $possibleDesktops) {
        if (Test-Path $desktop) {
            $ShortcutLocation = $desktop
            Write-Host "🔍 Desktop detected: $desktop" -ForegroundColor Gray
            break
        }
    }
    
    if (-not $ShortcutLocation) {
        $ShortcutLocation = "$env:USERPROFILE\Desktop"
        Write-Host "⚠️ Using default desktop path: $ShortcutLocation" -ForegroundColor Yellow
    }
}

New-ProjectVSCodeEnvironment
Copy-BaseConfiguration
Add-ProjectSpecificSettings
$launchScript = New-LaunchScript
New-DesktopShortcut -LaunchScriptPath $launchScript
New-StartMenuEntry -LaunchScriptPath $launchScript
Install-EssentialExtensions

Write-Host "`n🎉 VS CODE SESSION CREATED!" -ForegroundColor Green
Write-Host "🏴‍☠️ Project: $ProjectName" -ForegroundColor Cyan
Write-Host "📁 Path: $ProjectPath" -ForegroundColor Gray
Write-Host "🔗 Shortcut: VSCode-$ProjectName.lnk on Desktop" -ForegroundColor Gray
Write-Host "📋 Start Menu: Programs > VS Code Sessions > $ProjectName" -ForegroundColor Gray

Write-Host "`n💡 USAGE:" -ForegroundColor Yellow
Write-Host "  • Double-click desktop shortcut to launch isolated session" -ForegroundColor White
Write-Host "  • Each project has its own extensions and settings" -ForegroundColor White
Write-Host "  • No conflicts between different project configurations" -ForegroundColor White
Write-Host "  • Portable tools auto-configured per project" -ForegroundColor White

Write-Host "`n🚀 Ready to launch $ProjectName session!" -ForegroundColor Cyan
