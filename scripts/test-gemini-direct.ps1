#!/usr/bin/env pwsh

# Direct Gemini API Test (PowerShell)
param(
    [string]$ApiKey = $env:GEMINI_API_KEY,
    [string]$Prompt = "Hello! Please respond with 'PowerShell API test successful!' to confirm the connection.",
    [string]$Model = "gemini-2.5-pro"
)

if (-not $ApiKey) {
    $ApiKey = "AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0"
}

Write-Host "🔑 Testing Gemini API directly (PowerShell)..." -ForegroundColor Green
Write-Host "📡 Model: $Model" -ForegroundColor Cyan
Write-Host "🔗 API Key: $($ApiKey.Substring(0,12))..." -ForegroundColor Cyan
Write-Host "💬 Prompt: $Prompt" -ForegroundColor Cyan
Write-Host ""

$uri = "https://generativelanguage.googleapis.com/v1beta/models/$Model`:generateContent?key=$ApiKey"

$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = $Prompt
                }
            )
        }
    )
    generationConfig = @{
        temperature = 0.7
        maxOutputTokens = 2048
    }
} | ConvertTo-Json -Depth 5

$headers = @{
    'Content-Type' = 'application/json'
}

Write-Host "🚀 Making API request..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -Body $body -Headers $headers
    
    Write-Host "✅ SUCCESS! API key is working correctly." -ForegroundColor Green
    Write-Host ""
    
    if ($response.candidates -and $response.candidates[0]) {
        $text = $response.candidates[0].content.parts[0].text
        Write-Host "🤖 Gemini Response:" -ForegroundColor Blue
        Write-Host ("─" * 50) -ForegroundColor Gray
        Write-Host $text.Trim() -ForegroundColor White
        Write-Host ("─" * 50) -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "📈 Usage Info:" -ForegroundColor Magenta
    if ($response.usageMetadata) {
        Write-Host "   Input tokens: $($response.usageMetadata.promptTokenCount)" -ForegroundColor White
        Write-Host "   Output tokens: $($response.usageMetadata.candidatesTokenCount)" -ForegroundColor White
        Write-Host "   Total tokens: $($response.usageMetadata.totalTokenCount)" -ForegroundColor White
    }
    
    # Test a second request to verify quota
    Write-Host ""
    Write-Host "🔄 Testing second request (quota verification)..." -ForegroundColor Yellow
    
    $body2 = @{
        contents = @(
            @{
                parts = @(
                    @{
                        text = "What is 2+2? Respond with just the number."
                    }
                )
            }
        )
        generationConfig = @{
            temperature = 0.1
            maxOutputTokens = 50
        }
    } | ConvertTo-Json -Depth 5
    
    $response2 = Invoke-RestMethod -Uri $uri -Method POST -Body $body2 -Headers $headers
    
    if ($response2.candidates -and $response2.candidates[0]) {
        $answer = $response2.candidates[0].content.parts[0].text.Trim()
        Write-Host "✅ Second request successful: $answer" -ForegroundColor Green
        Write-Host "🎯 Your API key has good quota availability!" -ForegroundColor Green
    }
    
} catch {
    $errorResponse = $_.Exception.Response
    $statusCode = if ($errorResponse) { $errorResponse.StatusCode.Value__ } else { "Unknown" }
    
    Write-Host "❌ API Error (Status: $statusCode):" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "💡 Possible Issues:" -ForegroundColor Yellow
        Write-Host "   - Invalid API key format" -ForegroundColor White
        Write-Host "   - API key not enabled for Gemini API" -ForegroundColor White
        Write-Host "   - Request format issue" -ForegroundColor White
    } elseif ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "💡 Possible Issues:" -ForegroundColor Yellow
        Write-Host "   - API key lacks permissions" -ForegroundColor White
        Write-Host "   - Generative AI API not enabled in Google Cloud Console" -ForegroundColor White
        Write-Host "   - Billing not set up" -ForegroundColor White
    } elseif ($_.Exception.Response.StatusCode -eq 429) {
        Write-Host "💡 Rate Limit Info:" -ForegroundColor Yellow
        Write-Host "   - Free tier: 15 requests per minute" -ForegroundColor White
        Write-Host "   - Wait a minute and try again" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "🔍 Full Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor White
}