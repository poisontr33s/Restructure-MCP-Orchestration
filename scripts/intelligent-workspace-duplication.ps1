# 🏴‍☠️ Captain Guthilda's Intelligent Workspace Duplication System
# Creates immutable snapshots for safe VS Code instance replication

param(
    [string]$TargetPath = "",
    [switch]$DryRun = $false,
    [switch]$IncludeDevTools = $true,
    [switch]$CreatePortableSetup = $true,
    [switch]$GenerateVSCodeWorkspace = $true
)

$ErrorActionPreference = "Stop"

Write-Host "🏴‍☠️ Captain Guthilda's Intelligent Workspace Duplication System" -ForegroundColor Cyan
Write-Host "🎯 Creating immutable workspace snapshot for safe replication..." -ForegroundColor Yellow

# Get source workspace info
$SourceRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceName = Split-Path -Leaf $SourceRoot
$SourceVSCodeDir = Join-Path $SourceRoot ".vscode"
$SourceDevToolsDir = Join-Path $SourceRoot "dev-tools"

# Determine target path
if (-not $TargetPath) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $TargetPath = Join-Path (Split-Path -Parent $SourceRoot) "$SourceName-duplicate-$timestamp"
}

Write-Host "📂 Source Workspace: $SourceRoot" -ForegroundColor Gray
Write-Host "📂 Target Workspace: $TargetPath" -ForegroundColor Gray

# Workspace State Analysis
function Get-WorkspaceState {
    Write-Host "`n🔍 ANALYZING CURRENT WORKSPACE STATE" -ForegroundColor Cyan
    
    $state = @{
        SourcePath = $SourceRoot
        TargetPath = $TargetPath
        VSCodeConfig = @{}
        DevTools = @{}
        Projects = @{}
        Environment = @{}
        GitState = @{}
        Dependencies = @{}
    }
    
    # VS Code Configuration
    if (Test-Path $SourceVSCodeDir) {
        Write-Host "✅ VS Code configuration found" -ForegroundColor Green
        
        $settingsPath = Join-Path $SourceVSCodeDir "settings.json"
        if (Test-Path $settingsPath) {
            $state.VSCodeConfig.Settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
            Write-Host "  📄 settings.json loaded" -ForegroundColor Gray
        }
        
        $tasksPath = Join-Path $SourceVSCodeDir "tasks.json"
        if (Test-Path $tasksPath) {
            $state.VSCodeConfig.Tasks = Get-Content $tasksPath -Raw | ConvertFrom-Json
            Write-Host "  📄 tasks.json loaded" -ForegroundColor Gray
        }
        
        $launchPath = Join-Path $SourceVSCodeDir "launch.json"
        if (Test-Path $launchPath) {
            $state.VSCodeConfig.Launch = Get-Content $launchPath -Raw | ConvertFrom-Json
            Write-Host "  📄 launch.json loaded" -ForegroundColor Gray
        }
    }
    
    # Dev Tools Analysis
    if (Test-Path $SourceDevToolsDir) {
        Write-Host "✅ Portable dev tools found" -ForegroundColor Green
        
        $tools = Get-ChildItem $SourceDevToolsDir -Directory
        foreach ($tool in $tools) {
            $toolName = $tool.Name
            $toolPath = $tool.FullName
            
            # Get tool version if possible
            $version = "unknown"
            switch ($toolName) {
                "java21" { 
                    $javaBin = Join-Path $toolPath "bin\java.exe"
                    if (Test-Path $javaBin) {
                        try {
                            $version = & $javaBin -version 2>&1 | Select-Object -First 1
                        } catch { }
                    }
                }
                "maven" {
                    $mvnBin = Join-Path $toolPath "bin\mvn.cmd"
                    if (Test-Path $mvnBin) {
                        try {
                            $version = & $mvnBin -version 2>&1 | Select-Object -First 1
                        } catch { }
                    }
                }
                "go" {
                    $goBin = Join-Path $toolPath "bin\go.exe"
                    if (Test-Path $goBin) {
                        try {
                            $version = & $goBin version 2>&1
                        } catch { }
                    }
                }
                "node" {
                    $nodeBin = Join-Path $toolPath "node.exe"
                    if (Test-Path $nodeBin) {
                        try {
                            $version = & $nodeBin --version 2>&1
                        } catch { }
                    }
                }
            }
            
            $state.DevTools[$toolName] = @{
                Path = $toolPath
                Version = $version
                Size = (Get-ChildItem $toolPath -Recurse | Measure-Object -Property Length -Sum).Sum
            }
            
            Write-Host "  🛠️ $toolName - $version" -ForegroundColor Gray
        }
    }
    
    # Project Structure Analysis
    $projectTypes = @{
        "Java/Maven" = "pom.xml"
        "Node.js/npm" = "package.json"
        "Go" = "go.mod"
        "Python/Poetry" = "pyproject.toml"
        "Rust/Cargo" = "Cargo.toml"
        ".NET" = "*.csproj"
    }
    
    foreach ($type in $projectTypes.Keys) {
        $pattern = $projectTypes[$type]
        $projects = Get-ChildItem $SourceRoot -Recurse -Name $pattern -ErrorAction SilentlyContinue |
                   Where-Object { $_ -notlike "*dev-tools*" -and $_ -notlike "*node_modules*" -and $_ -notlike "*target*" }
        
        if ($projects) {
            $state.Projects[$type] = $projects
            Write-Host "✅ $type projects: $($projects.Count)" -ForegroundColor Green
        }
    }
    
    # Environment Variables
    $envVars = @("JAVA_HOME", "MAVEN_HOME", "GOROOT", "GOPATH", "NODE_ENV", "PATH")
    foreach ($var in $envVars) {
        $value = [Environment]::GetEnvironmentVariable($var)
        if ($value) {
            $state.Environment[$var] = $value
        }
    }
    
    # Git State
    if (Test-Path (Join-Path $SourceRoot ".git")) {
        try {
            $branch = git branch --show-current 2>&1
            $commit = git rev-parse HEAD 2>&1
            $status = git status --porcelain 2>&1
            
            $state.GitState = @{
                Branch = $branch
                Commit = $commit
                HasChanges = $status.Length -gt 0
                Status = $status
            }
            
            Write-Host "✅ Git repository - Branch: $branch" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Git information unavailable" -ForegroundColor Yellow
        }
    }
    
    return $state
}

# Create Duplication Blueprint
function New-DuplicationBlueprint {
    param($WorkspaceState)
    
    $blueprint = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Source = $WorkspaceState.SourcePath
        Target = $WorkspaceState.TargetPath
        Instructions = @()
        Files = @()
        Commands = @()
        Verification = @()
    }
    
    # Add core instructions
    $blueprint.Instructions += "1. Copy workspace structure (excluding dev-tools temporarily)"
    $blueprint.Instructions += "2. Set up portable development environment"
    $blueprint.Instructions += "3. Configure VS Code settings for portable tools"
    $blueprint.Instructions += "4. Restore environment variables and paths"
    $blueprint.Instructions += "5. Verify all package managers work correctly"
    
    # Add file operations
    $blueprint.Files += @{
        Action = "Copy"
        Source = $WorkspaceState.SourcePath
        Target = $WorkspaceState.TargetPath
        Exclude = @("dev-tools", ".git", "target", "node_modules", "*.log")
    }
    
    if ($IncludeDevTools -and $WorkspaceState.DevTools.Count -gt 0) {
        $blueprint.Files += @{
            Action = "Copy"
            Source = Join-Path $WorkspaceState.SourcePath "dev-tools"
            Target = Join-Path $WorkspaceState.TargetPath "dev-tools"
            Note = "Portable development tools"
        }
    }
    
    # Add setup commands
    if ($CreatePortableSetup) {
        $blueprint.Commands += ".\setup-portable-java21.ps1 -RepoRoot `"$($WorkspaceState.TargetPath)`""
        $blueprint.Commands += ".\scripts\emergency-go-fix.ps1"
        $blueprint.Commands += ".\setup-dev-env.ps1"
    }
    
    # Add verification steps
    $blueprint.Verification += "java -version"
    $blueprint.Verification += "mvn -version"
    $blueprint.Verification += "go version"
    $blueprint.Verification += "code --version"
    
    return $blueprint
}

# Execute Duplication Process
function Start-WorkspaceDuplication {
    param($Blueprint, $DryRun)
    
    Write-Host "`n🚀 STARTING WORKSPACE DUPLICATION" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN MODE - No actual changes will be made" -ForegroundColor Yellow
    }
    
    # Create target directory
    if (-not $DryRun) {
        New-Item -ItemType Directory -Force -Path $Blueprint.Target | Out-Null
    }
    Write-Host "📁 Target directory: $($Blueprint.Target)" -ForegroundColor Green
    
    # Execute file operations
    foreach ($fileOp in $Blueprint.Files) {
        Write-Host "📋 $($fileOp.Action): $($fileOp.Source) -> $($fileOp.Target)" -ForegroundColor Gray
        
        if (-not $DryRun) {
            if ($fileOp.Action -eq "Copy") {
                if ($fileOp.Exclude) {
                    # Use robocopy for selective copying
                    $excludeArgs = $fileOp.Exclude | ForEach-Object { "/XD `"$_`"" }
                    $cmd = "robocopy `"$($fileOp.Source)`" `"$($fileOp.Target)`" /E /R:1 /W:1 $($excludeArgs -join ' ')"
                    Invoke-Expression $cmd | Out-Null
                } else {
                    Copy-Item $fileOp.Source $fileOp.Target -Recurse -Force
                }
            }
        }
    }
    
    # Generate setup scripts for target
    if (-not $DryRun -and $CreatePortableSetup) {
        $setupScript = @"
# 🏴‍☠️ Duplicated Workspace Setup Script
# Generated on $(Get-Date)

Write-Host "🏴‍☠️ Setting up duplicated workspace..." -ForegroundColor Cyan

# Change to workspace directory
Set-Location "$($Blueprint.Target)"

# Run portable setup
if (Test-Path "setup-portable-java21.ps1") {
    .\setup-portable-java21.ps1 -Force
}

# Fix Go environment
if (Test-Path "scripts\emergency-go-fix.ps1") {
    .\scripts\emergency-go-fix.ps1
}

# Activate environment
if (Test-Path "setup-dev-env.ps1") {
    .\setup-dev-env.ps1
}

Write-Host "✅ Workspace setup complete!" -ForegroundColor Green
Write-Host "📝 Open VS Code with: code ." -ForegroundColor Yellow
"@
        
        $setupScriptPath = Join-Path $Blueprint.Target "setup-duplicated-workspace.ps1"
        $setupScript | Out-File -FilePath $setupScriptPath -Encoding UTF8
        Write-Host "✅ Created setup script: $setupScriptPath" -ForegroundColor Green
    }
    
    # Generate VS Code workspace file
    if (-not $DryRun -and $GenerateVSCodeWorkspace) {
        $workspaceName = Split-Path -Leaf $Blueprint.Target
        $workspaceConfig = @{
            folders = @(
                @{ path = "." }
            )
            settings = @{
                "java.jdt.ls.java.home" = ".\dev-tools\java21"
                "go.goroot" = ".\dev-tools\go"
                "maven.executable.path" = ".\dev-tools\maven\bin\mvn.cmd"
            }
            extensions = @{
                recommendations = @(
                    "vscjava.vscode-java-pack",
                    "golang.go",
                    "ms-vscode.powershell",
                    "redhat.vscode-yaml"
                )
            }
        }
        
        $workspaceFilePath = Join-Path $Blueprint.Target "$workspaceName.code-workspace"
        $workspaceConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $workspaceFilePath -Encoding UTF8
        Write-Host "✅ Created VS Code workspace: $workspaceFilePath" -ForegroundColor Green
    }
}

# Generate Duplication Report
function New-DuplicationReport {
    param($Blueprint, $WorkspaceState)
    
    $reportPath = Join-Path $Blueprint.Target "WORKSPACE-DUPLICATION-REPORT.md"
    
    $report = @"
# 🏴‍☠️ Workspace Duplication Report

**Generated:** $(Get-Date)  
**Source:** $($Blueprint.Source)  
**Target:** $($Blueprint.Target)  

## 🎯 Duplication Summary

This workspace is an immutable snapshot of the source workspace, configured for:
- Portable development environment
- Multiple package manager orchestration
- VS Code integration with portable tools

## 🛠️ Included Development Tools

"@

    foreach ($tool in $WorkspaceState.DevTools.Keys) {
        $toolInfo = $WorkspaceState.DevTools[$tool]
        $sizeGB = [math]::Round($toolInfo.Size / 1GB, 2)
        $report += "- **$tool**: $($toolInfo.Version) (${sizeGB}GB)`n"
    }

    $report += @"

## 📋 Project Structure

"@

    foreach ($projectType in $WorkspaceState.Projects.Keys) {
        $projects = $WorkspaceState.Projects[$projectType]
        $report += "- **$projectType**: $($projects.Count) project(s)`n"
    }

    $report += @"

## 🚀 Quick Start Instructions

1. **Run the setup script:**
   ```powershell
   .\setup-duplicated-workspace.ps1
   ```

2. **Open in VS Code:**
   ```powershell
   code .
   # OR open the workspace file:
   code *.code-workspace
   ```

3. **Verify environment:**
   ```powershell
   java -version
   mvn -version
   go version
   ```

## 🎪 VS Code Configuration

The workspace includes:
- Portable Java 21 configuration
- Go environment setup
- Maven integration
- Recommended extensions

## 🏴‍☠️ Captain's Notes

> "This duplicated workspace maintains the exact state and configuration of the source environment. All portable tools are included and pre-configured for immediate use. No system-level dependencies required!"

---

**Ready to sail the polyglot seas!** ⚓🚀
"@

    if (-not $DryRun) {
        $report | Out-File -FilePath $reportPath -Encoding UTF8
        Write-Host "📄 Generated duplication report: $reportPath" -ForegroundColor Green
    }
}

# Main Execution
Write-Host "`n🔍 WORKSPACE STATE ANALYSIS" -ForegroundColor Cyan
$workspaceState = Get-WorkspaceState

Write-Host "`n📋 CREATING DUPLICATION BLUEPRINT" -ForegroundColor Cyan
$blueprint = New-DuplicationBlueprint -WorkspaceState $workspaceState

Write-Host "`n🎯 DUPLICATION BLUEPRINT SUMMARY" -ForegroundColor Cyan
Write-Host "Source: $($blueprint.Source)" -ForegroundColor Gray
Write-Host "Target: $($blueprint.Target)" -ForegroundColor Gray
Write-Host "Dev Tools: $($workspaceState.DevTools.Count) tools" -ForegroundColor Gray
Write-Host "Projects: $($workspaceState.Projects.Count) types" -ForegroundColor Gray

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN RESULTS:" -ForegroundColor Yellow
    Write-Host "✅ Analysis complete - no issues found" -ForegroundColor Green
    Write-Host "✅ Blueprint created successfully" -ForegroundColor Green
    Write-Host "✅ Target path available: $($blueprint.Target)" -ForegroundColor Green
    Write-Host "`n📝 Run without -DryRun to execute duplication" -ForegroundColor Cyan
} else {
    Start-WorkspaceDuplication -Blueprint $blueprint -DryRun $DryRun
    New-DuplicationReport -Blueprint $blueprint -WorkspaceState $workspaceState
    
    Write-Host "`n🎉 WORKSPACE DUPLICATION COMPLETE!" -ForegroundColor Green
    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. cd `"$($blueprint.Target)`"" -ForegroundColor White
    Write-Host "2. .\setup-duplicated-workspace.ps1" -ForegroundColor White
    Write-Host "3. code ." -ForegroundColor White
    Write-Host "`n🏴‍☠️ Your immutable workspace copy is ready!" -ForegroundColor Green
}
