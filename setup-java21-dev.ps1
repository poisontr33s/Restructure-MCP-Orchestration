# Captain Guthilda's Java 21 & Maven Auto-Setup Script
# PowerShell script to install Java 21 JDK and Maven for MCP Orchestration System

param(
    [switch]$UseChocolatey,
    [switch]$UseWinget,
    [switch]$Force
)

# Color functions for better output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "🎯 $Message" -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host "⚠️ $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Captain { param($Message) Write-Host "🏴‍☠️ $Message" -ForegroundColor Magenta }

Write-Captain "CAPTAIN GUTHILDA'S JAVA 21 RENAISSANCE SETUP"
Write-Info "Preparing the development environment for Java 21 MCP Orchestration System..."

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin -and -not $Force) {
    Write-Warning "This script should be run as Administrator for best results."
    Write-Info "Continuing with user-level installation..."
}

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to get Java version if installed
function Get-JavaVersion {
    try {
        $javaVersion = java -version 2>&1
        if ($javaVersion -match "version `"(\d+)\.") {
            return [int]$matches[1]
        } elseif ($javaVersion -match "version `"(\d+)") {
            return [int]$matches[1]
        }
        return 0
    } catch {
        return 0
    }
}

# Check current Java installation
Write-Info "Checking current Java installation..."
$currentJavaVersion = Get-JavaVersion
if ($currentJavaVersion -ge 21) {
    Write-Success "Java $currentJavaVersion is already installed and meets requirements!"
    $javaInstalled = $true
} elseif ($currentJavaVersion -gt 0) {
    Write-Warning "Java $currentJavaVersion is installed but Java 21+ is required"
    $javaInstalled = $false
} else {
    Write-Info "Java is not installed"
    $javaInstalled = $false
}

# Check Maven installation
Write-Info "Checking Maven installation..."
if (Test-Command "mvn") {
    $mavenVersion = mvn -version 2>&1 | Select-String "Apache Maven" | ForEach-Object { $_.ToString() }
    Write-Success "Maven is already installed: $mavenVersion"
    $mavenInstalled = $true
} else {
    Write-Info "Maven is not installed"
    $mavenInstalled = $false
}

# Determine installation method
$installMethod = ""
if ($UseChocolatey -or (Test-Command "choco")) {
    $installMethod = "chocolatey"
    Write-Info "Using Chocolatey for installation"
} elseif ($UseWinget -or (Test-Command "winget")) {
    $installMethod = "winget"
    Write-Info "Using winget for installation"
} else {
    Write-Warning "Neither Chocolatey nor winget found. Will provide manual installation instructions."
    $installMethod = "manual"
}

# Install Java 21 if needed
if (-not $javaInstalled) {
    Write-Captain "Installing Java 21 JDK..."
    
    switch ($installMethod) {
        "chocolatey" {
            try {
                choco install temurin21 -y
                Write-Success "Java 21 installed via Chocolatey"
            } catch {
                Write-Error "Failed to install Java 21 via Chocolatey: $($_.Exception.Message)"
            }
        }
        "winget" {
            try {
                winget install EclipseAdoptium.Temurin.21.JDK --accept-source-agreements --accept-package-agreements
                Write-Success "Java 21 installed via winget"
            } catch {
                Write-Error "Failed to install Java 21 via winget: $($_.Exception.Message)"
            }
        }
        "manual" {
            Write-Info "Please manually install Java 21:"
            Write-Info "1. Visit: https://adoptium.net/temurin/releases/?version=21"
            Write-Info "2. Download Windows x64 JDK (.msi installer)"
            Write-Info "3. Run the installer with default settings"
            Write-Info "4. Restart PowerShell after installation"
        }
    }
}

# Install Maven if needed
if (-not $mavenInstalled) {
    Write-Captain "Installing Apache Maven..."
    
    switch ($installMethod) {
        "chocolatey" {
            try {
                choco install maven -y
                Write-Success "Maven installed via Chocolatey"
            } catch {
                Write-Error "Failed to install Maven via Chocolatey: $($_.Exception.Message)"
            }
        }
        "winget" {
            try {
                winget install Apache.Maven --accept-source-agreements --accept-package-agreements
                Write-Success "Maven installed via winget"
            } catch {
                Write-Error "Failed to install Maven via winget: $($_.Exception.Message)"
            }
        }
        "manual" {
            Write-Info "Please manually install Maven:"
            Write-Info "1. Visit: https://maven.apache.org/download.cgi"
            Write-Info "2. Download Binary zip archive"
            Write-Info "3. Extract to C:\Program Files\Apache\maven\"
            Write-Info "4. Add C:\Program Files\Apache\maven\bin to PATH"
            Write-Info "5. Set JAVA_HOME environment variable"
        }
    }
}

# Refresh environment variables
Write-Info "Refreshing environment variables..."
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify installations
Write-Captain "Verifying installations..."

Start-Sleep -Seconds 3  # Wait for installations to complete

# Check Java again
$newJavaVersion = Get-JavaVersion
if ($newJavaVersion -ge 21) {
    Write-Success "Java $newJavaVersion verification successful!"
    
    # Display Java version details
    Write-Info "Java version details:"
    java -version 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Error "Java 21+ verification failed. Please restart PowerShell and try manual installation."
}

# Check Maven again
if (Test-Command "mvn") {
    Write-Success "Maven verification successful!"
    
    # Display Maven version details
    Write-Info "Maven version details:"
    mvn -version 2>&1 | Select-Object -First 3 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Error "Maven verification failed. Please restart PowerShell and check installation."
}

# VS Code configuration guidance
Write-Captain "VS Code Configuration Instructions:"
Write-Info "1. Restart VS Code completely"
Write-Info "2. Open Command Palette (Ctrl+Shift+P)"
Write-Info "3. Run: 'Java: Configure Java Runtime'"
Write-Info "4. Run: 'Developer: Reload Window'"
Write-Info "5. Wait for Java Language Server to initialize"

# Test project build
$projectRoot = $PSScriptRoot
if (Test-Path "$projectRoot\pom.xml") {
    Write-Captain "Testing project build..."
    try {
        Set-Location $projectRoot
        Write-Info "Running: mvn clean compile -q"
        mvn clean compile -q
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Project build test successful! ✨"
        } else {
            Write-Warning "Project build test had issues. Check Java/Maven configuration."
        }
    } catch {
        Write-Warning "Could not test project build: $($_.Exception.Message)"
    }
} else {
    Write-Info "Project root not found. Navigate to project directory and run 'mvn clean compile' to test."
}

# Final instructions
Write-Captain "SETUP COMPLETE! Next steps:"
Write-Info "1. Restart PowerShell and VS Code"
Write-Info "2. Verify with: java -version && mvn -version"
Write-Info "3. Open project in VS Code and wait for Java Language Server"
Write-Info "4. Run: mvn clean compile test"
Write-Info "5. Start coding with Java 21 + GitHub Copilot! 🚀"

Write-Captain "Welcome to the Java 21 Renaissance! ⚓"
