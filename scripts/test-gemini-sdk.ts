#!/usr/bin/env node

/**
 * Enhanced Gemini SDK Test with Streaming and Tools
 * Based on AI Studio TypeScript code
 */

import { GoogleGenAI } from '@google/genai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0';
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('🔑 Testing Gemini SDK with streaming and tools...');
  console.log(`🔗 API Key: ${apiKey.substring(0, 12)}...`);
  console.log('');

  const ai = new GoogleGenAI({
    apiKey,
  });

  // Configure tools and thinking
  const tools = [
    {
      googleSearch: {}
    },
  ];

  const config = {
    thinkingConfig: {
      thinkingBudget: -1, // Unlimited thinking budget
    },
    tools,
  };

  const model = 'gemini-2.5-pro';
  
  // Get input from command line or use default test prompt
  const inputText = process.argv[2] || 'Hello! Please identify yourself as Gemini 2.5 Pro and confirm you have access to Google Search tools. Then search for "TypeScript SDK Google GenAI" and summarize what you find.';
  
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: inputText,
        },
      ],
    },
  ];

  console.log(`💬 Prompt: ${inputText}`);
  console.log('');
  console.log('🚀 Making streaming request with tools...');
  console.log('');

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    console.log('🤖 Gemini 2.5 Pro Response (Streaming):');
    console.log('─'.repeat(80));
    
    let totalText = '';
    let chunkCount = 0;
    
    for await (const chunk of response) {
      if (chunk.text) {
        process.stdout.write(chunk.text);
        totalText += chunk.text;
        chunkCount++;
      }
    }
    
    console.log('');
    console.log('─'.repeat(80));
    console.log('');
    console.log('📈 Streaming Info:');
    console.log(`   Total chunks: ${chunkCount}`);
    console.log(`   Total characters: ${totalText.length}`);
    console.log(`   Model: ${model}`);
    console.log(`   Tools enabled: ${tools.length > 0 ? 'Yes (Google Search)' : 'No'}`);
    console.log(`   Thinking budget: ${config.thinkingConfig.thinkingBudget === -1 ? 'Unlimited' : config.thinkingConfig.thinkingBudget}`);

  } catch (error) {
    console.error('❌ SDK Error:', error);
    
    if (error instanceof Error) {
      console.error('');
      console.error('🔍 Error Details:');
      console.error(`   Message: ${error.message}`);
      console.error(`   Name: ${error.name}`);
      
      if ('status' in error) {
        console.error(`   Status: ${(error as any).status}`);
      }
      
      if (error.message.includes('API key')) {
        console.error('');
        console.error('💡 Possible Issues:');
        console.error('   - API key invalid or expired');
        console.error('   - API key not enabled for Gemini API');
        console.error('   - Billing not set up');
      }
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}