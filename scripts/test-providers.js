#!/usr/bin/env node

const { UnifiedGeminiClient } = require('./compiled/unified-gemini.js');

async function main() {
  console.log('🔍 Testing Unified Gemini Providers...');
  console.log('');
  
  const client = new UnifiedGeminiClient();
  const providers = await client.listProviders();
  
  console.log('📊 Provider Status:');
  providers.forEach(p => {
    console.log(`   ${p.name}: ${p.available ? '✅ Available' : '❌ Unavailable'}`);
  });
  
  console.log('');
  console.log('🎯 Recommendation: Use the highest priority available provider');
  console.log('   1. Google GenAI SDK (streaming + tools)');
  console.log('   2. Gemini CLI (IDE integration)'); 
  console.log('   3. Direct API (basic fallback)');
}

main().catch(console.error);