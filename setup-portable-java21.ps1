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

# Java 21 Download URLs (Microsoft OpenJDK - Reliable builds)
$JavaVersion = "21.0.4"
$JavaUrl = "https://aka.ms/download-jdk/microsoft-jdk-21.0.4-windows-x64.zip"
$JavaArchive = "microsoft-jdk-21-windows.zip"

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
    Write-Host "📍 From: $Url" -ForegroundColor Gray
    Write-Host "📁 To: $OutputPath" -ForegroundColor Gray
    
    try {
        # Use Invoke-WebRequest with progress
        $ProgressPreference = 'SilentlyContinue'  # Hide progress bar for cleaner output
        Invoke-WebRequest -Uri $Url -OutFile $OutputPath -UseBasicParsing
        
        # Verify download
        if (-not (Test-Path $OutputPath)) {
            throw "Downloaded file does not exist"
        }
        
        $FileSize = (Get-Item $OutputPath).Length
        if ($FileSize -eq 0) {
            throw "Downloaded file is empty"
        }
        
        Write-Host "✅ Downloaded: $Description ($([math]::Round($FileSize/1MB, 2)) MB)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download $Description" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Clean up partial download
        if (Test-Path $OutputPath) {
            Remove-Item $OutputPath -Force -ErrorAction SilentlyContinue
        }
        
        exit 1
    }
}

# Function to extract ZIP
function Extract-Archive {
    param($ArchivePath, $DestinationPath, $Description)
    
    Write-Host "📦 Extracting $Description..." -ForegroundColor Yellow
    Write-Host "📁 From: $ArchivePath" -ForegroundColor Gray
    Write-Host "📁 To: $DestinationPath" -ForegroundColor Gray
    
    # Verify source file exists
    if (-not (Test-Path $ArchivePath)) {
        throw "Archive file does not exist: $ArchivePath"
    }
    
    try {
        # Remove destination if it exists
        if (Test-Path $DestinationPath) {
            Remove-Item $DestinationPath -Recurse -Force
        }
        
        # Create destination directory
        New-Item -ItemType Directory -Force -Path $DestinationPath | Out-Null
        
        # Extract using .NET classes for better reliability
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($ArchivePath, $DestinationPath)
        
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
    Download-WithProgress $JavaUrl $JavaArchivePath "Java 21 JDK (Microsoft Build)"
    
    # Create a temporary extraction directory
    $ExtractTempDir = Join-Path $TempDir "java-extract"
    Extract-Archive $JavaArchivePath $ExtractTempDir "Java 21 JDK"
    
    # Find the extracted JDK directory (varies by version)
    $ExtractedJavaDir = Get-ChildItem $ExtractTempDir -Directory | Where-Object { $_.Name -match "jdk" } | Select-Object -First 1
    if ($ExtractedJavaDir) {
        Write-Host "📁 Moving Java installation..." -ForegroundColor Yellow
        
        # Retry logic for file locks (antivirus scanning)
        $retryCount = 0
        $maxRetries = 3
        $success = $false
        
        while (-not $success -and $retryCount -lt $maxRetries) {
            try {
                $retryCount++
                if ($retryCount -gt 1) {
                    Write-Host "⏳ Retry $retryCount/$maxRetries - waiting for file locks to clear..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 5
                }
                
                # Use robocopy for more reliable directory copying
                $robocopyResult = & robocopy $ExtractedJavaDir.FullName $JavaDir /E /MOVE /R:1 /W:1 2>&1
                $success = $LASTEXITCODE -lt 8  # Robocopy exit codes 0-7 are success
                
                if ($success) {
                    Write-Host "✅ Java 21 installed to: $JavaDir" -ForegroundColor Green
                } else {
                    throw "Robocopy failed with exit code: $LASTEXITCODE"
                }
            } catch {
                if ($retryCount -eq $maxRetries) {
                    Write-Host "❌ Failed to move Java installation after $maxRetries attempts" -ForegroundColor Red
                    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
                    exit 1
                }
            }
        }
    } else {
        # Try to find any directory in the extraction folder
        $ExtractedJavaDir = Get-ChildItem $ExtractTempDir -Directory | Select-Object -First 1
        if ($ExtractedJavaDir) {
            Write-Host "📁 Moving Java installation (fallback)..." -ForegroundColor Yellow
            # Same retry logic for fallback
            $retryCount = 0
            $maxRetries = 3
            $success = $false
            
            while (-not $success -and $retryCount -lt $maxRetries) {
                try {
                    $retryCount++
                    if ($retryCount -gt 1) {
                        Write-Host "⏳ Retry $retryCount/$maxRetries - waiting for file locks to clear..." -ForegroundColor Yellow
                        Start-Sleep -Seconds 5
                    }
                    
                    $robocopyResult = & robocopy $ExtractedJavaDir.FullName $JavaDir /E /MOVE /R:1 /W:1 2>&1
                    $success = $LASTEXITCODE -lt 8
                    
                    if ($success) {
                        Write-Host "✅ Java 21 installed to: $JavaDir" -ForegroundColor Green
                    } else {
                        throw "Robocopy failed with exit code: $LASTEXITCODE"
                    }
                } catch {
                    if ($retryCount -eq $maxRetries) {
                        Write-Host "❌ Failed to move Java installation after $maxRetries attempts" -ForegroundColor Red
                        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
                        exit 1
                    }
                }
            }
        } else {
            Write-Host "❌ Could not find extracted Java directory" -ForegroundColor Red
            Write-Host "📁 Contents of extraction directory:" -ForegroundColor Gray
            Get-ChildItem $ExtractTempDir | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
            exit 1
        }
    }
} else {
    Write-Host "✅ Java 21 already installed in: $JavaDir" -ForegroundColor Green
}

# Download and setup Maven
if (-not (Test-Path $MavenDir) -or $Force) {
    $MavenArchivePath = Join-Path $TempDir $MavenArchive
    Download-WithProgress $MavenUrl $MavenArchivePath "Apache Maven $MavenVersion"
    
    # Create a temporary extraction directory
    $ExtractTempDir = Join-Path $TempDir "maven-extract"
    Extract-Archive $MavenArchivePath $ExtractTempDir "Apache Maven"
    
    # Find the extracted Maven directory
    $ExtractedMavenDir = Get-ChildItem $ExtractTempDir -Directory | Where-Object { $_.Name.StartsWith("apache-maven") } | Select-Object -First 1
    if ($ExtractedMavenDir) {
        Write-Host "📁 Moving Maven installation..." -ForegroundColor Yellow
        
        # Retry logic for file locks
        $retryCount = 0
        $maxRetries = 3
        $success = $false
        
        while (-not $success -and $retryCount -lt $maxRetries) {
            try {
                $retryCount++
                if ($retryCount -gt 1) {
                    Write-Host "⏳ Retry $retryCount/$maxRetries - waiting for file locks to clear..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 3
                }
                
                $robocopyResult = & robocopy $ExtractedMavenDir.FullName $MavenDir /E /MOVE /R:1 /W:1 2>&1
                $success = $LASTEXITCODE -lt 8
                
                if ($success) {
                    Write-Host "✅ Maven installed to: $MavenDir" -ForegroundColor Green
                } else {
                    throw "Robocopy failed with exit code: $LASTEXITCODE"
                }
            } catch {
                if ($retryCount -eq $maxRetries) {
                    Write-Host "❌ Failed to move Maven installation after $maxRetries attempts" -ForegroundColor Red
                    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
                    exit 1
                }
            }
        }
    } else {
        Write-Host "❌ Could not find extracted Maven directory" -ForegroundColor Red
        Write-Host "📁 Contents of extraction directory:" -ForegroundColor Gray
        Get-ChildItem $ExtractTempDir | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
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

$JavaHomePath = $JavaDir.Replace('\', '\\')
$MavenBinPath = (Join-Path $MavenDir "bin\mvn.cmd").Replace('\', '\\')

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
        "MAVEN_HOME": "$($MavenDir.Replace('\', '\\'))",
        "PATH": "$($JavaBin.Replace('\', '\\'));$($MavenBin.Replace('\', '\\'));\${env:PATH}"
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
