# 🏴‍☠️ CAPTAIN GUTHILDA'S POLYGLOT PARADISE SETUP
# Universal Multi-Language Development Environment Installer
# 
# This script downloads and sets up portable versions of:
# - Java 21 + Maven (orchestration backbone)
# - Node.js + Bun (modern JS/TS runtime)
# - Go toolchain (systems programming)
# - Python + Poetry (data science/ML)
# - Rust + Cargo (systems/WASM)
# - .NET 8 (enterprise apps)

param(
    [string]$RepoRoot = ".",
    [switch]$SkipJava = $false,
    [switch]$SkipNode = $false,
    [switch]$SkipGo = $false,
    [switch]$SkipPython = $false,
    [switch]$SkipRust = $false,
    [switch]$SkipDotNet = $false,
    [switch]$Force = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

# 🎨 Colors and formatting
function Write-Captain {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "🏴‍☠️ $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Verbose {
    param([string]$Message)
    if ($Verbose) {
        Write-Host "🔍 $Message" -ForegroundColor Gray
    }
}

# 🎯 Main setup orchestration
function Set-PolyglotParadise {
    Write-Captain "Welcome to Captain Guthilda's Polyglot Paradise Setup!" "Magenta"
    Write-Host ""
    Write-Host "🌊 Setting up a portable multi-language development environment..."
    Write-Host "📦 All tools will be installed locally in dev-tools/ directory"
    Write-Host ""

    $repoPath = Resolve-Path $RepoRoot
    $devToolsDir = Join-Path $repoPath "dev-tools"
    
    Write-Captain "Repository: $repoPath"
    Write-Captain "Dev Tools Directory: $devToolsDir"
    
    # Create dev-tools directory
    if (-not (Test-Path $devToolsDir)) {
        New-Item -ItemType Directory -Path $devToolsDir -Force | Out-Null
        Write-Success "Created dev-tools directory"
    }

    # Setup each language/tool
    if (-not $SkipJava) { Set-JavaEnvironment $devToolsDir }
    if (-not $SkipNode) { Set-NodeEnvironment $devToolsDir }
    if (-not $SkipGo) { Set-GoEnvironment $devToolsDir }
    if (-not $SkipPython) { Set-PythonEnvironment $devToolsDir }
    if (-not $SkipRust) { Set-RustEnvironment $devToolsDir }
    if (-not $SkipDotNet) { Set-DotNetEnvironment $devToolsDir }

    # Generate environment activation scripts
    New-UniversalEnvironmentScript $repoPath $devToolsDir
    
    # Update .gitignore
    Update-GitIgnore $repoPath
    
    # Create meta-package.yaml if it doesn't exist
    New-MetaPackageManifest $repoPath
    
    Write-Captain "🎉 Polyglot Paradise Setup Complete!" "Green"
    Write-Host ""
    Write-Host "🚀 To activate the environment:"
    Write-Host "   PowerShell: .\setup-dev-env.ps1"
    Write-Host "   Batch:      .\setup-dev-env.bat"
    Write-Host ""
    Write-Host "🎼 To orchestrate all package managers:"
    Write-Host "   .\dev-tools\java21\bin\java -jar meta-package-manager\target\meta-orchestrator.jar"
}

# ☕ Java 21 + Maven Setup
function Set-JavaEnvironment {
    param([string]$DevToolsDir)
    
    Write-Captain "Setting up Java 21 + Maven..."
    
    $javaDir = Join-Path $DevToolsDir "java21"
    $mavenDir = Join-Path $DevToolsDir "maven"
    
    if ((Test-Path $javaDir) -and (Test-Path $mavenDir) -and (-not $Force)) {
        Write-Warning "Java environment already exists. Use -Force to reinstall."
        return
    }
    
    # Download and extract Java 21
    $javaUrl = "https://download.oracle.com/java/21/latest/jdk-21_windows-x64_bin.zip"
    $javaZip = Join-Path $DevToolsDir "java21.zip"
    
    Write-Verbose "Downloading Java 21 from $javaUrl"
    Invoke-WebRequest -Uri $javaUrl -OutFile $javaZip -UseBasicParsing
    
    Write-Verbose "Extracting Java 21..."
    Expand-Archive -Path $javaZip -DestinationPath $DevToolsDir -Force
    
    # Find the extracted JDK directory and rename it
    $extractedJdkDir = Get-ChildItem -Path $DevToolsDir -Directory | Where-Object { $_.Name -like "jdk-21*" } | Select-Object -First 1
    if ($extractedJdkDir) {
        Move-Item -Path $extractedJdkDir.FullName -Destination $javaDir -Force
    }
    
    Remove-Item $javaZip -Force
    Write-Success "Java 21 installed to $javaDir"
    
    # Download and extract Maven
    $mavenUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
    $mavenZip = Join-Path $DevToolsDir "maven.zip"
    
    Write-Verbose "Downloading Maven from $mavenUrl"
    Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip -UseBasicParsing
    
    Write-Verbose "Extracting Maven..."
    Expand-Archive -Path $mavenZip -DestinationPath $DevToolsDir -Force
    
    # Find the extracted Maven directory and rename it
    $extractedMavenDir = Get-ChildItem -Path $DevToolsDir -Directory | Where-Object { $_.Name -like "apache-maven-*" } | Select-Object -First 1
    if ($extractedMavenDir) {
        Move-Item -Path $extractedMavenDir.FullName -Destination $mavenDir -Force
    }
    
    Remove-Item $mavenZip -Force
    Write-Success "Maven installed to $mavenDir"
}

# 🟢 Node.js + Bun Setup
function Set-NodeEnvironment {
    param([string]$DevToolsDir)
    
    Write-Captain "Setting up Node.js + Bun..."
    
    $nodeDir = Join-Path $DevToolsDir "node"
    $bunDir = Join-Path $DevToolsDir "bun"
    
    if ((Test-Path $nodeDir) -and (-not $Force)) {
        Write-Warning "Node.js environment already exists. Use -Force to reinstall."
        return
    }
    
    # Download and extract Node.js
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip"
    $nodeZip = Join-Path $DevToolsDir "node.zip"
    
    Write-Verbose "Downloading Node.js from $nodeUrl"
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip -UseBasicParsing
    
    Write-Verbose "Extracting Node.js..."
    Expand-Archive -Path $nodeZip -DestinationPath $DevToolsDir -Force
    
    # Find the extracted Node directory and rename it
    $extractedNodeDir = Get-ChildItem -Path $DevToolsDir -Directory | Where-Object { $_.Name -like "node-v*" } | Select-Object -First 1
    if ($extractedNodeDir) {
        Move-Item -Path $extractedNodeDir.FullName -Destination $nodeDir -Force
    }
    
    Remove-Item $nodeZip -Force
    Write-Success "Node.js installed to $nodeDir"
    
    # Download Bun
    $bunExe = Join-Path $bunDir "bun.exe"
    New-Item -ItemType Directory -Path $bunDir -Force | Out-Null
    
    $bunUrl = "https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64.zip"
    $bunZip = Join-Path $DevToolsDir "bun.zip"
    
    Write-Verbose "Downloading Bun from $bunUrl"
    Invoke-WebRequest -Uri $bunUrl -OutFile $bunZip -UseBasicParsing
    
    Write-Verbose "Extracting Bun..."
    Expand-Archive -Path $bunZip -DestinationPath $bunDir -Force
    
    Remove-Item $bunZip -Force
    Write-Success "Bun installed to $bunDir"
}

# 🐹 Go Setup
function Set-GoEnvironment {
    param([string]$DevToolsDir)
    
    Write-Captain "Setting up Go..."
    
    $goDir = Join-Path $DevToolsDir "go"
    
    if ((Test-Path $goDir) -and (-not $Force)) {
        Write-Warning "Go environment already exists. Use -Force to reinstall."
        return
    }
    
    # Download and extract Go
    $goUrl = "https://golang.org/dl/go1.21.6.windows-amd64.zip"
    $goZip = Join-Path $DevToolsDir "go.zip"
    
    Write-Verbose "Downloading Go from $goUrl"
    Invoke-WebRequest -Uri $goUrl -OutFile $goZip -UseBasicParsing
    
    Write-Verbose "Extracting Go..."
    Expand-Archive -Path $goZip -DestinationPath $DevToolsDir -Force
    
    Remove-Item $goZip -Force
    Write-Success "Go installed to $goDir"
}

# 🐍 Python + Poetry Setup
function Set-PythonEnvironment {
    param([string]$DevToolsDir)
    
    Write-Captain "Setting up Python + Poetry..."
    
    $pythonDir = Join-Path $DevToolsDir "python"
    
    if ((Test-Path $pythonDir) -and (-not $Force)) {
        Write-Warning "Python environment already exists. Use -Force to reinstall."
        return
    }
    
    # Download and extract Python
    $pythonUrl = "https://www.python.org/ftp/python/3.12.1/python-3.12.1-embed-amd64.zip"
    $pythonZip = Join-Path $DevToolsDir "python.zip"
    
    Write-Verbose "Downloading Python from $pythonUrl"
    Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonZip -UseBasicParsing
    
    Write-Verbose "Extracting Python..."
    New-Item -ItemType Directory -Path $pythonDir -Force | Out-Null
    Expand-Archive -Path $pythonZip -DestinationPath $pythonDir -Force
    
    Remove-Item $pythonZip -Force
    
    # Install Poetry
    $poetryDir = Join-Path $DevToolsDir "poetry"
    New-Item -ItemType Directory -Path $poetryDir -Force | Out-Null
    
    # Note: Poetry installation would require additional setup
    Write-Success "Python installed to $pythonDir"
    Write-Warning "Poetry setup requires additional configuration"
}

# 🦀 Rust + Cargo Setup
function Set-RustEnvironment {
    param([string]$DevToolsDir)
    
    Write-Captain "Setting up Rust + Cargo..."
    
    $rustDir = Join-Path $DevToolsDir "rust"
    
    if ((Test-Path $rustDir) -and (-not $Force)) {
        Write-Warning "Rust environment already exists. Use -Force to reinstall."
        return
    }
    
    # For Rust, we'll set up the directory structure
    # Note: Rust installation typically requires rustup
    New-Item -ItemType Directory -Path $rustDir -Force | Out-Null
    Write-Success "Rust directory created at $rustDir"
    Write-Warning "Rust setup requires rustup installation"
}

# 🔵 .NET Setup
function Set-DotNetEnvironment {
    param([string]$DevToolsDir)
    
    Write-Captain "Setting up .NET 8..."
    
    $dotnetDir = Join-Path $DevToolsDir "dotnet"
    
    if ((Test-Path $dotnetDir) -and (-not $Force)) {
        Write-Warning ".NET environment already exists. Use -Force to reinstall."
        return
    }
    
    # Download and extract .NET
    $dotnetUrl = "https://download.visualstudio.microsoft.com/download/pr/1c2b20ea-6de9-42fe-b062-e7d9dc52b9b9/b0aeb6dd2e7c5b6e1b0b9acddc8de4fd/dotnet-sdk-8.0.101-win-x64.zip"
    $dotnetZip = Join-Path $DevToolsDir "dotnet.zip"
    
    Write-Verbose "Downloading .NET from $dotnetUrl"
    Invoke-WebRequest -Uri $dotnetUrl -OutFile $dotnetZip -UseBasicParsing
    
    Write-Verbose "Extracting .NET..."
    New-Item -ItemType Directory -Path $dotnetDir -Force | Out-Null
    Expand-Archive -Path $dotnetZip -DestinationPath $dotnetDir -Force
    
    Remove-Item $dotnetZip -Force
    Write-Success ".NET installed to $dotnetDir"
}

# 🔧 Generate universal environment activation scripts
function New-UniversalEnvironmentScript {
    param([string]$RepoPath, [string]$DevToolsDir)
    
    Write-Captain "Generating universal environment scripts..."
    
    # PowerShell activation script
    $psScript = @"
# 🏴‍☠️ Captain Guthilda's Universal Development Environment
# Auto-generated by setup-polyglot-paradise.ps1

Write-Host "🏴‍☠️ Activating Captain Guthilda's Polyglot Paradise..." -ForegroundColor Cyan

`$ErrorActionPreference = "SilentlyContinue"
`$devTools = "$DevToolsDir"

# Java 21 + Maven
if (Test-Path "`$devTools\java21") {
    `$env:JAVA_HOME = "`$devTools\java21"
    `$env:PATH = "`$devTools\java21\bin;`$env:PATH"
    Write-Host "☕ Java 21 activated" -ForegroundColor Green
}
if (Test-Path "`$devTools\maven") {
    `$env:MAVEN_HOME = "`$devTools\maven"
    `$env:PATH = "`$devTools\maven\bin;`$env:PATH"
    Write-Host "🔨 Maven activated" -ForegroundColor Green
}

# Node.js + Bun
if (Test-Path "`$devTools\node") {
    `$env:PATH = "`$devTools\node;`$env:PATH"
    Write-Host "🟢 Node.js activated" -ForegroundColor Green
}
if (Test-Path "`$devTools\bun") {
    `$env:PATH = "`$devTools\bun;`$env:PATH"
    Write-Host "🥖 Bun activated" -ForegroundColor Green
}

# Go
if (Test-Path "`$devTools\go") {
    `$env:GOROOT = "`$devTools\go"
    `$env:PATH = "`$devTools\go\bin;`$env:PATH"
    Write-Host "🐹 Go activated" -ForegroundColor Green
}

# Python
if (Test-Path "`$devTools\python") {
    `$env:PATH = "`$devTools\python;`$env:PATH"
    Write-Host "🐍 Python activated" -ForegroundColor Green
}

# Rust
if (Test-Path "`$devTools\rust") {
    `$env:CARGO_HOME = "`$devTools\rust"
    `$env:PATH = "`$devTools\rust\bin;`$env:PATH"
    Write-Host "🦀 Rust activated" -ForegroundColor Green
}

# .NET
if (Test-Path "`$devTools\dotnet") {
    `$env:DOTNET_ROOT = "`$devTools\dotnet"
    `$env:PATH = "`$devTools\dotnet;`$env:PATH"
    Write-Host "🔵 .NET activated" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Polyglot Paradise is ready!" -ForegroundColor Magenta
Write-Host "🎼 Use 'java -jar meta-package-manager\target\meta-orchestrator.jar' to orchestrate all package managers" -ForegroundColor Cyan
"@

    $psScriptPath = Join-Path $RepoPath "setup-dev-env.ps1"
    $psScript | Out-File -FilePath $psScriptPath -Encoding UTF8
    
    # Batch activation script
    $batScript = @"
@echo off
REM 🏴‍☠️ Captain Guthilda's Universal Development Environment
REM Auto-generated by setup-polyglot-paradise.ps1

echo 🏴‍☠️ Activating Captain Guthilda's Polyglot Paradise...

set "devTools=$DevToolsDir"

REM Java 21 + Maven
if exist "%devTools%\java21" (
    set "JAVA_HOME=%devTools%\java21"
    set "PATH=%devTools%\java21\bin;%PATH%"
    echo ☕ Java 21 activated
)
if exist "%devTools%\maven" (
    set "MAVEN_HOME=%devTools%\maven"
    set "PATH=%devTools%\maven\bin;%PATH%"
    echo 🔨 Maven activated
)

REM Node.js + Bun
if exist "%devTools%\node" (
    set "PATH=%devTools%\node;%PATH%"
    echo 🟢 Node.js activated
)
if exist "%devTools%\bun" (
    set "PATH=%devTools%\bun;%PATH%"
    echo 🥖 Bun activated
)

REM Go
if exist "%devTools%\go" (
    set "GOROOT=%devTools%\go"
    set "PATH=%devTools%\go\bin;%PATH%"
    echo 🐹 Go activated
)

REM Python
if exist "%devTools%\python" (
    set "PATH=%devTools%\python;%PATH%"
    echo 🐍 Python activated
)

REM Rust
if exist "%devTools%\rust" (
    set "CARGO_HOME=%devTools%\rust"
    set "PATH=%devTools%\rust\bin;%PATH%"
    echo 🦀 Rust activated
)

REM .NET
if exist "%devTools%\dotnet" (
    set "DOTNET_ROOT=%devTools%\dotnet"
    set "PATH=%devTools%\dotnet;%PATH%"
    echo 🔵 .NET activated
)

echo.
echo 🎉 Polyglot Paradise is ready!
echo 🎼 Use 'java -jar meta-package-manager\target\meta-orchestrator.jar' to orchestrate all package managers
"@

    $batScriptPath = Join-Path $RepoPath "setup-dev-env.bat"
    $batScript | Out-File -FilePath $batScriptPath -Encoding ASCII
    
    Write-Success "Environment scripts created:"
    Write-Host "  PowerShell: $psScriptPath" -ForegroundColor Gray
    Write-Host "  Batch:      $batScriptPath" -ForegroundColor Gray
}

# 📝 Update .gitignore
function Update-GitIgnore {
    param([string]$RepoPath)
    
    $gitIgnorePath = Join-Path $RepoPath ".gitignore"
    $gitIgnoreContent = ""
    
    if (Test-Path $gitIgnorePath) {
        $gitIgnoreContent = Get-Content $gitIgnorePath -Raw
    }
    
    $devToolsIgnore = @"

# 🏴‍☠️ Captain Guthilda's Portable Development Tools
dev-tools/
setup-dev-env.ps1
setup-dev-env.bat
"@

    if ($gitIgnoreContent -notlike "*dev-tools/*") {
        $gitIgnoreContent += $devToolsIgnore
        $gitIgnoreContent | Out-File -FilePath $gitIgnorePath -Encoding UTF8
        Write-Success "Updated .gitignore to exclude dev-tools/"
    }
}

# 📦 Create default meta-package.yaml
function New-MetaPackageManifest {
    param([string]$RepoPath)
    
    $manifestPath = Join-Path $RepoPath "meta-package.yaml"
    
    if (Test-Path $manifestPath) {
        Write-Warning "meta-package.yaml already exists"
        return
    }
    
    $manifestContent = @"
# 🏴‍☠️ Captain Guthilda's Meta-Package Manifest
# Universal dependency declaration for polyglot repositories

metadata:
  name: "polyglot-paradise"
  version: "1.0.0"
  description: "Captain Guthilda's Universal Multi-Language Project"
  authors: ["Captain Guthilda"]

# Package manager configurations
package-managers:
  maven:
    enabled: true
    root: "."
    files: ["pom.xml"]
    commands:
      install: "mvn clean install"
      build: "mvn compile"
      test: "mvn test"
      
  npm:
    enabled: true
    root: "./frontend"
    files: ["package.json"]
    commands:
      install: "npm install"
      build: "npm run build"
      test: "npm test"
      
  bun:
    enabled: true
    root: "./modern-frontend"
    files: ["package.json"]
    commands:
      install: "bun install"
      build: "bun run build"
      test: "bun test"
      
  go:
    enabled: true
    root: "./services/go-service"
    files: ["go.mod"]
    commands:
      install: "go mod download"
      build: "go build"
      test: "go test ./..."
      
  poetry:
    enabled: true
    root: "./ml-pipeline"
    files: ["pyproject.toml"]
    commands:
      install: "poetry install"
      build: "poetry build"
      test: "poetry run pytest"
      
  cargo:
    enabled: true
    root: "./wasm-modules"
    files: ["Cargo.toml"]
    commands:
      install: "cargo fetch"
      build: "cargo build"
      test: "cargo test"
      
  dotnet:
    enabled: true
    root: "./enterprise-api"
    files: ["*.csproj", "*.sln"]
    commands:
      install: "dotnet restore"
      build: "dotnet build"
      test: "dotnet test"

# Cross-language dependency mapping
dependencies:
  shared-types:
    - maven: "com.guthilda:shared-types:1.0.0"
    - npm: "@guthilda/shared-types@^1.0.0"
    - nuget: "Guthilda.SharedTypes@1.0.0"
    
  logging:
    - maven: "org.slf4j:slf4j-api:2.0.9"
    - npm: "winston@^3.8.0"
    - go: "github.com/sirupsen/logrus@v1.9.0"
    - poetry: "loguru@^0.7.0"
    - cargo: "log@0.4.20"
    - nuget: "Serilog@3.0.1"

# Build pipeline configuration
pipeline:
  phases:
    - name: "setup"
      parallel: false
      commands:
        - "maven: mvn clean"
        - "npm: npm ci"
        - "poetry: poetry install"
        
    - name: "build"
      parallel: true
      commands:
        - "maven: mvn compile"
        - "npm: npm run build"
        - "go: go build"
        - "poetry: poetry build"
        - "cargo: cargo build"
        - "dotnet: dotnet build"
        
    - name: "test"
      parallel: true
      commands:
        - "maven: mvn test"
        - "npm: npm test"
        - "go: go test ./..."
        - "poetry: poetry run pytest"
        - "cargo: cargo test"
        - "dotnet: dotnet test"

# Environment configuration
environment:
  variables:
    JAVA_OPTS: "-Xmx2g"
    NODE_ENV: "development"
    GO111MODULE: "on"
    CARGO_TARGET_DIR: "target"
    
  paths:
    - "./dev-tools/java21/bin"
    - "./dev-tools/maven/bin"
    - "./dev-tools/node"
    - "./dev-tools/bun"
    - "./dev-tools/go/bin"
    - "./dev-tools/python"
    - "./dev-tools/rust/bin"
    - "./dev-tools/dotnet"
"@

    $manifestContent | Out-File -FilePath $manifestPath -Encoding UTF8
    Write-Success "Created meta-package.yaml manifest"
}

# 🚀 Execute the setup
try {
    Set-PolyglotParadise
} catch {
    Write-Error "Setup failed: $_"
    exit 1
}
