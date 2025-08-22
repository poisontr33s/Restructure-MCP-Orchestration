
# Gemini Configuration Summary
# Generated: 2025-08-12T23:20:03.658Z

## Environment Variables
export GEMINI_API_KEY="AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0"
export GEMINI_MODEL="gemini-2.5-pro"

## Recommended Gemini CLI Usage
gemini --model gemini-2.5-pro --ide-mode-feature --include-directories packages,scripts,docs,.vscode,server,clients

## SDK Configuration
Model: gemini-2.5-pro
Streaming: Enabled
Tools: Google Search
Thinking Budget: Unlimited

## Comparison Commands
# CLI approach:
gemini -p "Your prompt here"

# SDK approach (with tools):
node scripts/test-gemini-sdk.js "Your prompt here"

# Direct API approach:
node scripts/test-gemini-direct.js "Your prompt here"
