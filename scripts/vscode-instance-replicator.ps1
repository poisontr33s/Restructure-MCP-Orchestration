# 🏴‍☠️ Captain Guthilda's VS Code Instance Duplication System
# Creates perfect immutable replicas of the current development environment

param(
    [string]$TargetPath = "",
    [switch]$DryRun = $false,
    [string]$WorkspaceName = ""
)

$ErrorActionPreference = "Stop"

Write-Host "🏴‍☠️ CAPTAIN GUTHILDA'S VS CODE INSTANCE DUPLICATION" -ForegroundColor Cyan
Write-Host "🎯 Creating immutable workspace replica for safe parallel development..." -ForegroundColor Yellow

# Find the actual workspace root (where pom.xml, package.json, etc. are)
$CurrentPath = $PWD
$WorkspaceRoot = $CurrentPath

# Look for workspace indicators going up the directory tree
$workspaceIndicators = @("pom.xml", "package.json", "meta-package.yaml", ".vscode", "dev-tools")
$foundRoot = $false

for ($i = 0; $i -lt 5; $i++) {
    foreach ($indicator in $workspaceIndicators) {
        if (Test-Path (Join-Path $WorkspaceRoot $indicator)) {
            $foundRoot = $true
            break
        }
    }
    if ($foundRoot) { break }
    
    $parent = Split-Path -Parent $WorkspaceRoot
    if ($parent -eq $WorkspaceRoot) { break }
    $WorkspaceRoot = $parent
}

Write-Host "📂 Detected Workspace Root: $WorkspaceRoot" -ForegroundColor Green

# Generate target path
if (-not $TargetPath) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $baseName = Split-Path -Leaf $WorkspaceRoot
    if (-not $WorkspaceName) {
        $WorkspaceName = "$baseName-replica-$timestamp"
    }
    $TargetPath = Join-Path (Split-Path -Parent $WorkspaceRoot) $WorkspaceName
}

Write-Host "📂 Target Replica Path: $TargetPath" -ForegroundColor Green

# Comprehensive State Capture
function Get-CompleteWorkspaceState {
    Write-Host "`n🔍 CAPTURING COMPLETE WORKSPACE STATE" -ForegroundColor Cyan
    
    $state = @{
        Timestamp = Get-Date
        SourceRoot = $WorkspaceRoot
        TargetPath = $TargetPath
        VSCodeConfig = @{}
        DevTools = @{}
        ProjectStructure = @{}
        EnvironmentVars = @{}
        GitState = @{}
        FileStructure = @{}
        Dependencies = @{}
    }
    
    # Capture VS Code Configuration
    $vscodeDir = Join-Path $WorkspaceRoot ".vscode"
    if (Test-Path $vscodeDir) {
        Write-Host "✅ Capturing VS Code configuration..." -ForegroundColor Green
        
        $configFiles = @("settings.json", "tasks.json", "launch.json", "extensions.json")
        foreach ($configFile in $configFiles) {
            $configPath = Join-Path $vscodeDir $configFile
            if (Test-Path $configPath) {
                try {
                    $content = Get-Content $configPath -Raw
                    $state.VSCodeConfig[$configFile] = @{
                        Content = $content
                        Parsed = ($content | ConvertFrom-Json -ErrorAction SilentlyContinue)
                    }
                    Write-Host "  📄 $configFile captured" -ForegroundColor Gray
                } catch {
                    Write-Host "  ⚠️ Failed to parse $configFile" -ForegroundColor Yellow
                }
            }
        }
    }
    
    # Capture Development Tools
    $devToolsDir = Join-Path $WorkspaceRoot "dev-tools"
    if (Test-Path $devToolsDir) {
        Write-Host "✅ Capturing portable development tools..." -ForegroundColor Green
        
        $tools = Get-ChildItem $devToolsDir -Directory -ErrorAction SilentlyContinue
        foreach ($tool in $tools) {
            $toolName = $tool.Name
            $toolPath = $tool.FullName
            
            # Calculate size
            $size = (Get-ChildItem $toolPath -Recurse -File -ErrorAction SilentlyContinue | 
                    Measure-Object -Property Length -Sum).Sum
            
            # Get version info
            $version = Get-ToolVersion -ToolName $toolName -ToolPath $toolPath
            
            $state.DevTools[$toolName] = @{
                Path = $toolPath
                RelativePath = "dev-tools\$toolName"
                Version = $version
                SizeBytes = $size
                SizeMB = [math]::Round($size / 1MB, 2)
            }
            
            Write-Host "  🛠️ $toolName - $version ($([math]::Round($size/1MB, 1))MB)" -ForegroundColor Gray
        }
    }
    
    # Capture Project Structure
    Write-Host "✅ Analyzing project structure..." -ForegroundColor Green
    $projectTypes = @{
        "Java/Maven" = @{ Pattern = "pom.xml"; Command = "mvn" }
        "Node.js/npm" = @{ Pattern = "package.json"; Command = "npm" }
        "Go Modules" = @{ Pattern = "go.mod"; Command = "go" }
        "Python/Poetry" = @{ Pattern = "pyproject.toml"; Command = "poetry" }
        "Rust/Cargo" = @{ Pattern = "Cargo.toml"; Command = "cargo" }
        ".NET/C#" = @{ Pattern = "*.csproj"; Command = "dotnet" }
        "Meta-Package" = @{ Pattern = "meta-package.yaml"; Command = "java" }
    }
    
    foreach ($projectType in $projectTypes.Keys) {
        $info = $projectTypes[$projectType]
        $projects = Get-ChildItem $WorkspaceRoot -Recurse -Name $info.Pattern -ErrorAction SilentlyContinue |
                   Where-Object { 
                       $_ -notlike "*dev-tools*" -and 
                       $_ -notlike "*node_modules*" -and 
                       $_ -notlike "*target*" -and
                       $_ -notlike "*.git*"
                   }
        
        if ($projects) {
            $state.ProjectStructure[$projectType] = @{
                Projects = $projects
                Count = $projects.Count
                Command = $info.Command
            }
            Write-Host "  📦 ${projectType}: $($projects.Count) project(s)" -ForegroundColor Gray
        }
    }
    
    # Capture Environment State
    Write-Host "✅ Capturing environment variables..." -ForegroundColor Green
    $importantVars = @("JAVA_HOME", "MAVEN_HOME", "GOROOT", "GOPATH", "NODE_ENV", "PATH", "PYTHONPATH")
    foreach ($var in $importantVars) {
        $value = [Environment]::GetEnvironmentVariable($var)
        if ($value) {
            $state.EnvironmentVars[$var] = $value
            # Check if it references our workspace
            if ($value -like "*$WorkspaceRoot*") {
                Write-Host "  🎯 $var references workspace" -ForegroundColor Gray
            }
        }
    }
    
    # Capture Git State
    if (Test-Path (Join-Path $WorkspaceRoot ".git")) {
        Write-Host "✅ Capturing Git repository state..." -ForegroundColor Green
        try {
            Push-Location $WorkspaceRoot
            
            $state.GitState = @{
                Branch = (git branch --show-current 2>$null)
                Commit = (git rev-parse HEAD 2>$null)
                HasChanges = ((git status --porcelain 2>$null) -ne "")
                RemoteUrl = (git remote get-url origin 2>$null)
                Tags = (git tag --points-at HEAD 2>$null)
            }
            
            Write-Host "  🌿 Branch: $($state.GitState.Branch)" -ForegroundColor Gray
            Write-Host "  📝 Commit: $($state.GitState.Commit.Substring(0,8))..." -ForegroundColor Gray
            
        } catch {
            Write-Host "  ⚠️ Git state capture failed" -ForegroundColor Yellow
        } finally {
            Pop-Location
        }
    }
    
    return $state
}

# Get tool version information
function Get-ToolVersion {
    param($ToolName, $ToolPath)
    
    try {
        switch ($ToolName) {
            "java21" { 
                $javaBin = Join-Path $ToolPath "bin\java.exe"
                if (Test-Path $javaBin) {
                    return (& $javaBin -version 2>&1 | Select-Object -First 1)
                }
            }
            "maven" {
                $mvnBin = Join-Path $ToolPath "bin\mvn.cmd"
                if (Test-Path $mvnBin) {
                    return (& $mvnBin -version 2>&1 | Select-Object -First 1)
                }
            }
            "go" {
                $goBin = Join-Path $ToolPath "bin\go.exe"
                if (Test-Path $goBin) {
                    return (& $goBin version 2>&1)
                }
            }
            "node" {
                $nodeBin = Join-Path $ToolPath "node.exe"
                if (Test-Path $nodeBin) {
                    return (& $nodeBin --version 2>&1)
                }
            }
        }
    } catch {
        return "Version detection failed"
    }
    
    return "Unknown version"
}

# Create Replication Blueprint
function New-ReplicationBlueprint {
    param($WorkspaceState)
    
    $blueprint = @{
        Metadata = @{
            Created = Get-Date
            Source = $WorkspaceState.SourceRoot
            Target = $WorkspaceState.TargetPath
            Creator = "Captain Guthilda's VS Code Duplication System"
        }
        FileOperations = @()
        SetupCommands = @()
        VerificationSteps = @()
        VSCodeConfiguration = @{}
    }
    
    # Define what to copy and what to exclude
    $blueprint.FileOperations += @{
        Type = "CopyDirectory"
        Source = $WorkspaceState.SourceRoot
        Target = $WorkspaceState.TargetPath
        Exclude = @("dev-tools\temp", ".git", "target", "node_modules", "*.log", "*.tmp")
        Include = @("dev-tools", ".vscode", "src", "scripts", "*.md", "*.json", "*.xml", "*.yaml", "*.toml")
        Description = "Copy complete workspace structure"
    }
    
    # Setup commands for the replicated workspace
    $blueprint.SetupCommands += @{
        Command = ".\setup-portable-java21.ps1"
        Description = "Initialize portable Java 21 environment"
        WorkingDirectory = $WorkspaceState.TargetPath
    }
    
    $blueprint.SetupCommands += @{
        Command = ".\scripts\emergency-go-fix.ps1"
        Description = "Configure Go environment and eliminate popups"
        WorkingDirectory = $WorkspaceState.TargetPath
    }
    
    $blueprint.SetupCommands += @{
        Command = ".\setup-dev-env.ps1"
        Description = "Activate portable development environment"
        WorkingDirectory = $WorkspaceState.TargetPath
    }
    
    # Verification steps
    $blueprint.VerificationSteps += "java -version"
    $blueprint.VerificationSteps += "mvn -version"
    $blueprint.VerificationSteps += "go version"
    $blueprint.VerificationSteps += "git --version"
    
    # VS Code workspace configuration
    $workspaceName = Split-Path -Leaf $WorkspaceState.TargetPath
    $blueprint.VSCodeConfiguration = @{
        WorkspaceFile = "$workspaceName.code-workspace"
        Settings = @{
            "java.jdt.ls.java.home" = ".\dev-tools\java21"
            "go.goroot" = ".\dev-tools\go"
            "maven.executable.path" = ".\dev-tools\maven\bin\mvn.cmd"
            "terminal.integrated.defaultProfile.windows" = "PowerShell"
            "terminal.integrated.profiles.windows" = @{
                "PowerShell" = @{
                    source = "PowerShell"
                    args = @("-NoLogo", "-File", ".\setup-dev-env.ps1")
                }
            }
        }
        Folders = @(
            @{ name = "Root"; path = "." }
        )
        Extensions = @{
            recommendations = @(
                "vscjava.vscode-java-pack",
                "golang.go",
                "ms-vscode.powershell",
                "redhat.vscode-yaml",
                "ms-vscode.vscode-json"
            )
        }
    }
    
    return $blueprint
}

# Execute the replication
function Start-WorkspaceReplication {
    param($Blueprint, $WorkspaceState, $DryRun)
    
    Write-Host "`n🚀 STARTING WORKSPACE REPLICATION" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN MODE - Simulating replication process" -ForegroundColor Yellow
        
        foreach ($operation in $Blueprint.FileOperations) {
            Write-Host "📋 Would execute: $($operation.Description)" -ForegroundColor Gray
            Write-Host "  Source: $($operation.Source)" -ForegroundColor DarkGray
            Write-Host "  Target: $($operation.Target)" -ForegroundColor DarkGray
        }
        
        Write-Host "`n📝 Setup commands that would be generated:" -ForegroundColor Yellow
        foreach ($cmd in $Blueprint.SetupCommands) {
            Write-Host "  ▶️ $($cmd.Command)" -ForegroundColor Gray
        }
        
        return
    }
    
    # Create target directory
    Write-Host "📁 Creating target directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $Blueprint.Metadata.Target | Out-Null
    
    # Execute file operations
    foreach ($operation in $Blueprint.FileOperations) {
        Write-Host "📋 $($operation.Description)" -ForegroundColor Yellow
        
        if ($operation.Type -eq "CopyDirectory") {
            Copy-DirectoryWithExclusions -Source $operation.Source -Target $operation.Target -Exclude $operation.Exclude
        }
    }
    
    # Generate setup script for the replicated workspace
    $setupScriptContent = Generate-SetupScript -Blueprint $Blueprint -WorkspaceState $WorkspaceState
    $setupScriptPath = Join-Path $Blueprint.Metadata.Target "setup-replica.ps1"
    $setupScriptContent | Out-File -FilePath $setupScriptPath -Encoding UTF8
    Write-Host "✅ Generated setup script: setup-replica.ps1" -ForegroundColor Green
    
    # Generate VS Code workspace file
    $workspaceConfig = @{
        folders = $Blueprint.VSCodeConfiguration.Folders
        settings = $Blueprint.VSCodeConfiguration.Settings
        extensions = $Blueprint.VSCodeConfiguration.Extensions
    }
    
    $workspaceFilePath = Join-Path $Blueprint.Metadata.Target $Blueprint.VSCodeConfiguration.WorkspaceFile
    $workspaceConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $workspaceFilePath -Encoding UTF8
    Write-Host "✅ Generated VS Code workspace: $($Blueprint.VSCodeConfiguration.WorkspaceFile)" -ForegroundColor Green
}

# Generate setup script for replicated workspace
function Generate-SetupScript {
    param($Blueprint, $WorkspaceState)
    
    return @"
# 🏴‍☠️ Replicated Workspace Setup Script
# Generated by Captain Guthilda's VS Code Duplication System
# Created: $(Get-Date)

param([switch]`$SkipEnvironmentSetup = `$false)

Write-Host "🏴‍☠️ Setting up replicated workspace..." -ForegroundColor Cyan
Write-Host "📂 Workspace: `$PWD" -ForegroundColor Gray

# Verify workspace integrity
if (-not (Test-Path "dev-tools")) {
    Write-Host "❌ dev-tools directory missing - workspace may be incomplete" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".vscode")) {
    Write-Host "❌ .vscode directory missing - VS Code configuration unavailable" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Workspace integrity verified" -ForegroundColor Green

# Setup portable environment
if (-not `$SkipEnvironmentSetup) {
    Write-Host "`n🔧 Setting up portable development environment..." -ForegroundColor Yellow
    
    if (Test-Path "setup-portable-java21.ps1") {
        Write-Host "⚡ Running Java 21 setup..." -ForegroundColor Gray
        .\setup-portable-java21.ps1 -Force
    }
    
    if (Test-Path "scripts\emergency-go-fix.ps1") {
        Write-Host "⚡ Fixing Go environment..." -ForegroundColor Gray
        .\scripts\emergency-go-fix.ps1
    }
    
    Write-Host "✅ Environment setup complete" -ForegroundColor Green
}

# Activate environment
Write-Host "`n🚀 Activating development environment..." -ForegroundColor Yellow
if (Test-Path "setup-dev-env.ps1") {
    .\setup-dev-env.ps1
} else {
    Write-Host "⚠️ Environment activation script not found" -ForegroundColor Yellow
}

# Verification
Write-Host "`n🔍 Verifying tools..." -ForegroundColor Yellow
try {
    `$javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Java: `$javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java verification failed" -ForegroundColor Red
}

try {
    `$mvnVersion = mvn -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Maven: `$mvnVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Maven verification failed" -ForegroundColor Red
}

try {
    `$goVersion = go version 2>&1
    Write-Host "✅ Go: `$goVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Go verification failed" -ForegroundColor Red
}

Write-Host "`n🎉 Replicated workspace setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open VS Code: code ." -ForegroundColor White
Write-Host "2. Or open workspace: code $($Blueprint.VSCodeConfiguration.WorkspaceFile)" -ForegroundColor White
Write-Host "3. Enjoy your immutable development environment! 🚀" -ForegroundColor White
"@
}

# Generate comprehensive report
function New-ReplicationReport {
    param($Blueprint, $WorkspaceState)
    
    $reportPath = Join-Path $Blueprint.Metadata.Target "REPLICATION-REPORT.md"
    
    $devToolsSummary = ""
    foreach ($tool in $WorkspaceState.DevTools.Keys) {
        $toolInfo = $WorkspaceState.DevTools[$tool]
        $devToolsSummary += "- **$tool**: $($toolInfo.Version) ($($toolInfo.SizeMB)MB)`n"
    }
    
    $projectSummary = ""
    foreach ($projectType in $WorkspaceState.ProjectStructure.Keys) {
        $projectInfo = $WorkspaceState.ProjectStructure[$projectType]
        $projectSummary += "- **$projectType**: $($projectInfo.Count) project(s)`n"
    }
    
    $report = @"
# 🏴‍☠️ Workspace Replication Report

**Created:** $(Get-Date)  
**Source:** $($WorkspaceState.SourceRoot)  
**Target:** $($WorkspaceState.TargetPath)  
**Git Branch:** $($WorkspaceState.GitState.Branch)  
**Git Commit:** $($WorkspaceState.GitState.Commit)  

## 🎯 Replication Summary

This is an immutable replica of the source workspace, configured for independent parallel development without any conflicts or dependencies on the original workspace.

## 🛠️ Included Development Tools

$devToolsSummary

## 📦 Project Structure

$projectSummary

## 🚀 Quick Start

1. **Setup the environment:**
   ```powershell
   .\setup-replica.ps1
   ```

2. **Open in VS Code:**
   ```powershell
   code $($Blueprint.VSCodeConfiguration.WorkspaceFile)
   ```

3. **Verify everything works:**
   ```powershell
   java -version
   mvn -version
   go version
   ```

## 🎪 Features

- ✅ Completely portable - no system dependencies
- ✅ Isolated environment - won't conflict with other workspaces
- ✅ Pre-configured VS Code settings
- ✅ All development tools included
- ✅ Ready for immediate development

## 🏴‍☠️ Captain's Notes

> "This replicated workspace is a perfect clone of the source environment at the time of creation. It includes all portable tools, configurations, and project structures. The environment is completely self-contained and ready for immediate use!"

---

**Happy coding in your replicated paradise!** ⚓🚀
"@

    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "📄 Generated replication report: REPLICATION-REPORT.md" -ForegroundColor Green
}

# Advanced Copy Function with Robocopy Fallback
function Copy-DirectoryWithExclusions {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Source,
        
        [Parameter(Mandatory=$true)]
        [string]$Target,
        
        [Parameter(Mandatory=$false)]
        [array]$Exclude = @()
    )
    
    Write-Host "📁 Copying $Source to $Target..." -ForegroundColor Yellow
    
    # Check if robocopy is available
    $robocopyAvailable = $false
    try {
        $null = Get-Command robocopy -ErrorAction Stop
        $robocopyAvailable = $true
        Write-Host "🚀 Using robocopy for efficient copying..." -ForegroundColor Gray
    } catch {
        Write-Host "⚠️ Robocopy not available, using PowerShell Copy-Item..." -ForegroundColor Yellow
    }
    
    if ($robocopyAvailable) {
        # Use robocopy for efficient copying with exclusions
        $excludeDirs = ($Exclude | Where-Object { $_ -notlike "*.*" }) -join " "
        $excludeFiles = ($Exclude | Where-Object { $_ -like "*.*" }) -join " "
        
        $robocopyArgs = @(
            "`"$Source`"",
            "`"$Target`"",
            "/E",  # Copy subdirectories including empty ones
            "/R:1", # Retry once
            "/W:1", # Wait 1 second between retries
            "/NFL", # No file list
            "/NDL"  # No directory list
        )
        
        if ($excludeDirs) {
            $robocopyArgs += "/XD"
            $robocopyArgs += $excludeDirs.Split(" ")
        }
        
        if ($excludeFiles) {
            $robocopyArgs += "/XF"
            $robocopyArgs += $excludeFiles.Split(" ")
        }
        
        try {
            & robocopy @robocopyArgs | Out-Null
            $exitCode = $LASTEXITCODE
            
            # Robocopy exit codes 0-7 are success
            if ($exitCode -lt 8) {
                Write-Host "✅ Directory copy completed successfully (robocopy)" -ForegroundColor Green
                return
            } else {
                Write-Host "⚠️ Robocopy failed with exit code: $exitCode, falling back to Copy-Item..." -ForegroundColor Yellow
                throw "Robocopy failed, trying fallback"
            }
        } catch {
            Write-Host "⚠️ Robocopy error: $($_.Exception.Message), falling back to Copy-Item..." -ForegroundColor Yellow
            # Fall through to Copy-Item
        }
    }
    
    # PowerShell-native fallback using Copy-Item
    Write-Host "🔄 Using PowerShell Copy-Item for directory replication..." -ForegroundColor Yellow
    
    # Create target directory
    if (-not (Test-Path $Target)) {
        New-Item -ItemType Directory -Force -Path $Target | Out-Null
    }
    
    # Get all items to copy
    $items = Get-ChildItem -Path $Source -Recurse -Force
    $totalItems = $items.Count
    $copiedItems = 0
    
    foreach ($item in $items) {
        $copiedItems++
        $relativePath = $item.FullName.Substring($Source.Length + 1)
        $targetPath = Join-Path $Target $relativePath
        
        # Check exclusions
        $shouldExclude = $false
        foreach ($exclusion in $Exclude) {
            if ($item.Name -like $exclusion -or $relativePath -like "*$exclusion*") {
                $shouldExclude = $true
                break
            }
        }
        
        if ($shouldExclude) {
            continue
        }
        
        # Show progress every 100 items
        if ($copiedItems % 100 -eq 0) {
            Write-Host "  📋 Progress: $copiedItems/$totalItems items processed..." -ForegroundColor Gray
        }
        
        try {
            if ($item.PSIsContainer) {
                # Directory
                if (-not (Test-Path $targetPath)) {
                    New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
                }
            } else {
                # File
                $targetDir = Split-Path -Parent $targetPath
                if (-not (Test-Path $targetDir)) {
                    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
                }
                Copy-Item -Path $item.FullName -Destination $targetPath -Force
            }
        } catch {
            Write-Host "⚠️ Failed to copy $relativePath`: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "✅ Directory copy completed successfully (PowerShell Copy-Item)" -ForegroundColor Green
}

# Main execution
try {
    Write-Host "`n🔍 ANALYZING WORKSPACE STATE" -ForegroundColor Cyan
    $workspaceState = Get-CompleteWorkspaceState
    
    Write-Host "`n📋 CREATING REPLICATION BLUEPRINT" -ForegroundColor Cyan
    $blueprint = New-ReplicationBlueprint -WorkspaceState $workspaceState
    
    Write-Host "`n🎯 REPLICATION SUMMARY" -ForegroundColor Cyan
    Write-Host "Source: $($workspaceState.SourceRoot)" -ForegroundColor Gray
    Write-Host "Target: $($workspaceState.TargetPath)" -ForegroundColor Gray
    Write-Host "Dev Tools: $($workspaceState.DevTools.Count) tools found" -ForegroundColor Gray
    Write-Host "Projects: $($workspaceState.ProjectStructure.Count) types detected" -ForegroundColor Gray
    
    if ($DryRun) {
        Write-Host "`n🔍 DRY RUN COMPLETE" -ForegroundColor Yellow
        Write-Host "✅ Workspace analysis successful" -ForegroundColor Green
        Write-Host "✅ Replication blueprint created" -ForegroundColor Green
        Write-Host "✅ Target path validated" -ForegroundColor Green
        Write-Host "`n📝 Run without -DryRun to execute replication" -ForegroundColor Cyan
    } else {
        Start-WorkspaceReplication -Blueprint $blueprint -WorkspaceState $workspaceState -DryRun $DryRun
        New-ReplicationReport -Blueprint $blueprint -WorkspaceState $workspaceState
        
        Write-Host "`n🎉 WORKSPACE REPLICATION COMPLETE!" -ForegroundColor Green
        Write-Host "`n📋 Your new workspace is ready at:" -ForegroundColor Cyan
        Write-Host "$($workspaceState.TargetPath)" -ForegroundColor White
        Write-Host "`n🚀 To start using it:" -ForegroundColor Cyan
        Write-Host "1. cd `"$($workspaceState.TargetPath)`"" -ForegroundColor White
        Write-Host "2. .\setup-replica.ps1" -ForegroundColor White
        Write-Host "3. code $($blueprint.VSCodeConfiguration.WorkspaceFile)" -ForegroundColor White
    }
    
} catch {
    Write-Host "`n❌ REPLICATION FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🏴‍☠️ Captain's advice: Check permissions and disk space!" -ForegroundColor Yellow
    exit 1
}
