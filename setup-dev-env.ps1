# Captain Guthilda's Portable Java 21 Environment (PowerShell)
Write-Host "🏴‍☠️ Captain Guthilda's Portable Java 21 Environment" -ForegroundColor Cyan

# Get script directory (repository root)
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

# Set portable environment variables
$env:JAVA_HOME = Join-Path $RepoRoot "dev-tools\java21"
$env:MAVEN_HOME = Join-Path $RepoRoot "dev-tools\maven"

# Add to PATH (prepend to ensure our versions are used)
$env:PATH = "$($env:JAVA_HOME)\bin;$($env:MAVEN_HOME)\bin;" + $env:PATH

Write-Host "✅ Java Home: $env:JAVA_HOME" -ForegroundColor Green
Write-Host "✅ Maven Home: $env:MAVEN_HOME" -ForegroundColor Green
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
