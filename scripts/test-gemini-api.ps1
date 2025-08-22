#!/usr/bin/env pwsh

# Test Gemini API with fresh environment
param(
    [string]$ApiKey = "AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0",
    [string]$Prompt = "Hello, test my API key setup"
)

Write-Host "🔑 Testing Gemini API with key: $($ApiKey.Substring(0,12))..." -ForegroundColor Green

# Clear any cached credentials
$configPath = Join-Path $env:USERPROFILE ".gemini-cli"
if (Test-Path $configPath) {
    Write-Host "🧹 Clearing cached credentials..." -ForegroundColor Yellow
    Remove-Item $configPath -Recurse -Force -ErrorAction SilentlyContinue
}

# Set environment and test
$env:GEMINI_API_KEY = $ApiKey
Write-Host "🚀 Testing with API key override..." -ForegroundColor Cyan

try {
    # Test the CLI
    gemini -p $Prompt
    Write-Host "✅ Gemini API test complete!" -ForegroundColor Green
} catch {
    Write-Host "❌ Gemini API test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}