# 🏴‍☠️ CAPTAIN GUTHILDA'S PORTABLE JAVA 21 DEVELOPMENT ENVIRONMENT

> **"Why pollute the ship's hull when we can carry our own treasure chest of tools!"**  
> _Self-Contained Java 21 + Maven Setup within Repository Root_

---

## 🎯 **PORTABLE DEVELOPMENT PHILOSOPHY**

This approach creates a **completely self-contained development environment** within the repository:

- ✅ **No system-wide installations**
- ✅ **No package managers** (Chocolatey, Scoop, winget)
- ✅ **No admin privileges required**
- ✅ **Portable across machines**
- ✅ **Version-locked and reproducible**
- ✅ **Easy cleanup** (just delete the repo)

---

## 🛠️ **STEP 1: Repository-Local Java 21 Installation**

### Automated Setup Script

Save as `setup-portable-java21.ps1` in repository root:

```powershell
# Captain Guthilda's Portable Java 21 + Maven Setup
# Creates self-contained development environment in repository root

param(
    [string]$RepoRoot = $PWD,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🏴‍☠️ Captain Guthilda's Portable Java 21 Renaissance Setup" -ForegroundColor Cyan
Write-Host "📁 Repository Root: $RepoRoot" -ForegroundColor Gray

# Configuration
$ToolsDir = Join-Path $RepoRoot "dev-tools"
$JavaDir = Join-Path $ToolsDir "java21"
$MavenDir = Join-Path $ToolsDir "maven"
$TempDir = Join-Path $ToolsDir "temp"

# Java 21 Download URLs (Eclipse Adoptium - Official)
$JavaVersion = "21.0.4+7"
$JavaUrl = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.4%2B7/OpenJDK21U-jdk_x64_windows_hotspot_21.0.4_7.zip"
$JavaArchive = "openjdk21-windows.zip"

# Maven Download URLs (Apache Official)
$MavenVersion = "3.9.9"
$MavenUrl = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"
$MavenArchive = "apache-maven-$MavenVersion-bin.zip"

# Create directories
Write-Host "📁 Creating portable development structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $ToolsDir | Out-Null
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

# Function to download with progress
function Download-WithProgress {
    param($Url, $OutputPath, $Description)

    Write-Host "⬇️  Downloading $Description..." -ForegroundColor Yellow
    try {
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($Url, $OutputPath)
        Write-Host "✅ Downloaded: $Description" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download $Description" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to extract ZIP
function Extract-Archive {
    param($ArchivePath, $DestinationPath, $Description)

    Write-Host "📦 Extracting $Description..." -ForegroundColor Yellow
    try {
        if (Test-Path $DestinationPath) {
            Remove-Item $DestinationPath -Recurse -Force
        }
        Expand-Archive -Path $ArchivePath -DestinationPath $DestinationPath -Force
        Write-Host "✅ Extracted: $Description" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to extract $Description" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Download and setup Java 21
if (-not (Test-Path $JavaDir) -or $Force) {
    $JavaArchivePath = Join-Path $TempDir $JavaArchive
    Download-WithProgress $JavaUrl $JavaArchivePath "Java 21 JDK (Eclipse Adoptium)"

    Extract-Archive $JavaArchivePath $TempDir "Java 21 JDK"

    # Find the extracted JDK directory (varies by version)
    $ExtractedJavaDir = Get-ChildItem $TempDir -Directory | Where-Object { $_.Name.StartsWith("jdk") } | Select-Object -First 1
    if ($ExtractedJavaDir) {
        Move-Item $ExtractedJavaDir.FullName $JavaDir -Force
        Write-Host "✅ Java 21 installed to: $JavaDir" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not find extracted Java directory" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Java 21 already installed in: $JavaDir" -ForegroundColor Green
}

# Download and setup Maven
if (-not (Test-Path $MavenDir) -or $Force) {
    $MavenArchivePath = Join-Path $TempDir $MavenArchive
    Download-WithProgress $MavenUrl $MavenArchivePath "Apache Maven $MavenVersion"

    Extract-Archive $MavenArchivePath $TempDir "Apache Maven"

    # Find the extracted Maven directory
    $ExtractedMavenDir = Get-ChildItem $TempDir -Directory | Where-Object { $_.Name.StartsWith("apache-maven") } | Select-Object -First 1
    if ($ExtractedMavenDir) {
        Move-Item $ExtractedMavenDir.FullName $MavenDir -Force
        Write-Host "✅ Maven installed to: $MavenDir" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not find extracted Maven directory" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Maven already installed in: $MavenDir" -ForegroundColor Green
}

# Cleanup temporary files
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue

# Create environment setup scripts
$JavaBin = Join-Path $JavaDir "bin"
$MavenBin = Join-Path $MavenDir "bin"

# Windows batch script for environment setup
$SetupBat = @"
@echo off
echo 🏴‍☠️ Captain Guthilda's Portable Java 21 Environment
echo.

REM Set portable JAVA_HOME and MAVEN_HOME
set "JAVA_HOME=%~dp0dev-tools\java21"
set "MAVEN_HOME=%~dp0dev-tools\maven"

REM Add to PATH (prepend to ensure our versions are used)
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

echo ✅ Java Home: %JAVA_HOME%
echo ✅ Maven Home: %MAVEN_HOME%
echo ✅ Environment configured for portable development
echo.

REM Verify installation
echo 🔍 Verifying installation...
java -version
echo.
mvn -version
echo.

echo 🎯 Ready for Java 21 development!
echo 📝 To use: Run this script before development sessions
cmd /k
"@

$SetupBatPath = Join-Path $RepoRoot "setup-dev-env.bat"
$SetupBat | Out-File -FilePath $SetupBatPath -Encoding ASCII
Write-Host "✅ Created setup script: $SetupBatPath" -ForegroundColor Green

# PowerShell script for environment setup
$SetupPs1 = @"
# Captain Guthilda's Portable Java 21 Environment (PowerShell)
Write-Host "🏴‍☠️ Captain Guthilda's Portable Java 21 Environment" -ForegroundColor Cyan

# Get script directory (repository root)
`$RepoRoot = Split-Path -Parent `$MyInvocation.MyCommand.Path

# Set portable environment variables
`$env:JAVA_HOME = Join-Path `$RepoRoot "dev-tools\java21"
`$env:MAVEN_HOME = Join-Path `$RepoRoot "dev-tools\maven"

# Add to PATH (prepend to ensure our versions are used)
`$env:PATH = "`$(`$env:JAVA_HOME)\bin;`$(`$env:MAVEN_HOME)\bin;" + `$env:PATH

Write-Host "✅ Java Home: `$env:JAVA_HOME" -ForegroundColor Green
Write-Host "✅ Maven Home: `$env:MAVEN_HOME" -ForegroundColor Green
Write-Host "✅ Environment configured for portable development" -ForegroundColor Green
Write-Host ""

# Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow
java -version
Write-Host ""
mvn -version
Write-Host ""

Write-Host "🎯 Ready for Java 21 development!" -ForegroundColor Cyan
Write-Host "📝 Environment active in this PowerShell session" -ForegroundColor Gray
"@

$SetupPs1Path = Join-Path $RepoRoot "setup-dev-env.ps1"
$SetupPs1 | Out-File -FilePath $SetupPs1Path -Encoding UTF8
Write-Host "✅ Created PowerShell setup script: $SetupPs1Path" -ForegroundColor Green

# VS Code settings for portable Java
$VSCodeDir = Join-Path $RepoRoot ".vscode"
$SettingsPath = Join-Path $VSCodeDir "settings.json"

New-Item -ItemType Directory -Force -Path $VSCodeDir | Out-Null

$JavaHomePath = $JavaDir -replace '\\', '\\'
$MavenBinPath = Join-Path $MavenDir "bin\mvn.cmd" -replace '\\', '\\'

$VSCodeSettings = @"
{
    "java.jdt.ls.java.home": "$JavaHomePath",
    "java.configuration.runtimes": [
        {
            "name": "JavaSE-21",
            "path": "$JavaHomePath",
            "default": true
        }
    ],
    "maven.executable.path": "$MavenBinPath",
    "java.compile.nullAnalysis.mode": "automatic",
    "java.configuration.detectJdksAtStart": true,
    "java.import.maven.enabled": true,
    "java.configuration.maven.userSettings": null,
    "terminal.integrated.env.windows": {
        "JAVA_HOME": "$JavaHomePath",
        "MAVEN_HOME": "$($MavenDir -replace '\\', '\\')",
        "PATH": "$($JavaBin -replace '\\', '\\');$($MavenBin -replace '\\', '\\');\${env:PATH}"
    }
}
"@

$VSCodeSettings | Out-File -FilePath $SettingsPath -Encoding UTF8
Write-Host "✅ Created VS Code settings: $SettingsPath" -ForegroundColor Green

# Create .gitignore entry for dev-tools (optional)
$GitIgnorePath = Join-Path $RepoRoot ".gitignore"
$GitIgnoreEntry = "`n# Portable development tools`ndev-tools/`n"

if (Test-Path $GitIgnorePath) {
    $currentContent = Get-Content $GitIgnorePath -Raw
    if ($currentContent -notlike "*dev-tools/*") {
        Add-Content -Path $GitIgnorePath -Value $GitIgnoreEntry
        Write-Host "✅ Added dev-tools/ to .gitignore" -ForegroundColor Green
    }
} else {
    $GitIgnoreEntry | Out-File -FilePath $GitIgnorePath -Encoding UTF8
    Write-Host "✅ Created .gitignore with dev-tools/ entry" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 PORTABLE JAVA 21 ENVIRONMENT SETUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen VS Code" -ForegroundColor White
Write-Host "2. Run setup-dev-env.ps1 in PowerShell to activate environment" -ForegroundColor White
Write-Host "3. OR run setup-dev-env.bat in Command Prompt" -ForegroundColor White
Write-Host "4. Verify with: java -version && mvn -version" -ForegroundColor White
Write-Host ""
Write-Host "🏴‍☠️ Repository Structure:" -ForegroundColor Cyan
Write-Host "├── dev-tools/" -ForegroundColor Gray
Write-Host "│   ├── java21/          # Portable Java 21 JDK" -ForegroundColor Gray
Write-Host "│   └── maven/           # Portable Maven 3.9+" -ForegroundColor Gray
Write-Host "├── setup-dev-env.ps1   # PowerShell environment script" -ForegroundColor Gray
Write-Host "├── setup-dev-env.bat   # Batch environment script" -ForegroundColor Gray
Write-Host "└── .vscode/settings.json # VS Code portable configuration" -ForegroundColor Gray
```

---

## 🛠️ **STEP 2: Repository Structure Overview**

After running the setup script, your repository will have:

`📁 Restructure-MCP-Orchestration/
├── 🛠️ dev-tools/                    # Portable development tools
│   ├── 📦 java21/                   # Eclipse Adoptium OpenJDK 21
│   │   ├── bin/java.exe             # Java runtime
│   │   ├── bin/javac.exe            # Java compiler
│   │   └── lib/                     # Java libraries
│   └── 📦 maven/                    # Apache Maven 3.9+
│       ├── bin/mvn.cmd              # Maven executable
│       └── lib/                     # Maven libraries
├── 🔧 setup-dev-env.ps1             # PowerShell environment activator
├── 🔧 setup-dev-env.bat             # Batch environment activator  
├── 📁 .vscode/
│   └── ⚙️ settings.json             # VS Code portable Java config
├── 📄 .gitignore                    # Excludes dev-tools/ (optional)
├── 📦 pom.xml                       # Maven project configuration
└── 📁 mcp-*/                        # Java 21 MCP modules`

---

## 🛠️ **STEP 3: Usage Instructions**

### For PowerShell Development Sessions

```powershell
# Navigate to repository root
cd "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration"

# Activate portable environment
.\setup-dev-env.ps1

# Verify Java and Maven are available
java -version
mvn -version

# Build the project
mvn clean compile

# Run tests
mvn test
```

### For Command Prompt Development Sessions

```batch
cd "C:\Users\erdno\BETTERDOWNLOADSFOLDER\github_repos2025\Restructure-MCP-Orchestration\Restructure-MCP-Orchestration"

setup-dev-env.bat

java -version
mvn -version
mvn clean compile
```

### For VS Code Integration

1. **Open VS Code** in the repository root
2. **VS Code will automatically detect** the portable Java configuration
3. **Java extensions will use** the repository-local Java 21 and Maven
4. **No system-wide configuration needed**

---

## 🛠️ **STEP 4: VS Code Extension Configuration**

The setup automatically creates `.vscode/settings.json` with:

```json
{
  "java.jdt.ls.java.home": "C:\\...\\dev-tools\\java21",
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-21",
      "path": "C:\\...\\dev-tools\\java21",
      "default": true
    }
  ],
  "maven.executable.path": "C:\\...\\dev-tools\\maven\\bin\\mvn.cmd",
  "terminal.integrated.env.windows": {
    "JAVA_HOME": "C:\\...\\dev-tools\\java21",
    "MAVEN_HOME": "C:\\...\\dev-tools\\maven",
    "PATH": "C:\\...\\dev-tools\\java21\\bin;C:\\...\\dev-tools\\maven\\bin;${env:PATH}"
  }
}
```

This ensures:

- ✅ **Java Language Server** uses portable Java 21
- ✅ **Maven integration** uses portable Maven
- ✅ **Integrated terminal** has correct environment
- ✅ **No system PATH pollution**

---

## 🛠️ **STEP 5: Run the Setup**

Execute the portable setup:

```powershell
# Save the script and run it
.\setup-portable-java21.ps1

# Force reinstall if needed
.\setup-portable-java21.ps1 -Force
```

---

## 🌟 **BENEFITS OF PORTABLE APPROACH**

### ✅ **Complete Isolation**

- No system-wide Java installations
- No admin privileges required
- No package manager dependencies
- No PATH or registry modifications

### ✅ **Reproducible Environment**

- Exact Java 21 version locked
- Exact Maven version locked
- Works identically across machines
- Easy to version control setup scripts

### ✅ **Easy Cleanup**

- Delete repository = complete removal
- No leftover system files
- No registry entries
- No PATH modifications

### ✅ **Multi-Project Support**

- Each repository has its own tools
- Different projects can use different versions
- No version conflicts between projects

---

## 🔧 **EXTENDING TO OTHER LANGUAGES**

This approach works for any development tool:

### Go (Portable)

```powershell
# Download Go binary
$GoUrl = "https://go.dev/dl/go1.21.0.windows-amd64.zip"
# Extract to dev-tools/go/
# Set GOROOT in VS Code settings
```

### Ruby (Portable)

```powershell
# Download Ruby binary
$RubyUrl = "https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-3.2.0-1/rubyinstaller-3.2.0-1-x64.7z"
# Extract to dev-tools/ruby/
# Set PATH in VS Code settings
```

### Node.js (Portable)

```powershell
# Download Node.js binary
$NodeUrl = "https://nodejs.org/dist/v20.5.0/node-v20.5.0-win-x64.zip"
# Extract to dev-tools/node/
# Set PATH in VS Code settings
```

---

## 🎯 **FINAL RESULT**

After setup:

- ✅ **No system-wide installations**
- ✅ **VS Code Java extensions work perfectly**
- ✅ **Maven builds work**
- ✅ **Java 21 features available**
- ✅ **Complete environment portability**
- ✅ **Easy cleanup and version management**

**This gives you a completely self-contained, portable Java 21 development environment that doesn't touch your system!** 🏴‍☠️⚓

---

_Captain Guthilda's Portable Renaissance - Development Tools as Cargo, Not Ship Modifications!_
