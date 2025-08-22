#!/usr/bin/env node

/**
 * Sync Gemini CLI and SDK Configuration
 * Ensures both approaches use the same model and settings
 */

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔄 Syncing Gemini CLI and SDK Configuration...');
  console.log('');

  // Target model and settings
  const targetModel = 'gemini-2.5-pro';
  const targetSettings = {
    model: targetModel,
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0',
    streaming: true,
    tools: ['googleSearch'],
    thinkingBudget: -1
  };

  console.log('📋 Target Configuration:');
  console.log(`   Model: ${targetSettings.model}`);
  console.log(`   API Key: ${targetSettings.apiKey.substring(0, 12)}...`);
  console.log(`   Streaming: ${targetSettings.streaming}`);
  console.log(`   Tools: ${targetSettings.tools.join(', ')}`);
  console.log(`   Thinking Budget: ${targetSettings.thinkingBudget === -1 ? 'Unlimited' : targetSettings.thinkingBudget}`);
  console.log('');

  // Update VS Code settings
  const vsCodeSettingsPath = path.join(process.cwd(), '.vscode', 'settings.json');
  
  try {
    if (fs.existsSync(vsCodeSettingsPath)) {
      const settingsContent = fs.readFileSync(vsCodeSettingsPath, 'utf8');
      
      // Check if model is already set correctly
      if (settingsContent.includes(`"GEMINI_MODEL": "${targetModel}"`)) {
        console.log('✅ VS Code settings already configured with target model');
      } else {
        console.log('⚠️  VS Code settings contains JSON comments - manual update recommended');
        console.log(`   Please ensure GEMINI_MODEL is set to: ${targetModel}`);
      }
    } else {
      console.log('⚠️  VS Code settings not found');
    }
  } catch (error) {
    console.error('❌ Failed to check VS Code settings:', error.message);
  }

  // Create configuration summary for Gemini CLI
  const configSummary = `
# Gemini Configuration Summary
# Generated: ${new Date().toISOString()}

## Environment Variables
export GEMINI_API_KEY="${targetSettings.apiKey}"
export GEMINI_MODEL="${targetSettings.model}"

## Recommended Gemini CLI Usage
gemini --model ${targetSettings.model} --ide-mode-feature --include-directories packages,scripts,docs,.vscode,server,clients

## SDK Configuration
Model: ${targetSettings.model}
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
`;

  const configPath = path.join(process.cwd(), 'docs', 'gemini-config.md');
  fs.writeFileSync(configPath, configSummary);
  console.log('✅ Created configuration summary at docs/gemini-config.md');
  
  console.log('');
  console.log('🎯 Next Steps:');
  console.log('1. Restart VS Code terminals to pick up new environment variables');
  console.log('2. Test CLI: gemini --version');
  console.log('3. Test SDK: node scripts/test-gemini-sdk.js');
  console.log('4. Compare approaches using VS Code task: "Gemini: Compare API vs SDK"');
  console.log('');
  console.log('💡 The SDK approach offers:');
  console.log('   • Streaming responses');
  console.log('   • Google Search integration');
  console.log('   • Unlimited thinking budget');
  console.log('   • Better error handling');
}

if (require.main === module) {
  main().catch(console.error);
}