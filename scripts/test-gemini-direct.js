#!/usr/bin/env node

/**
 * Direct Gemini API Test
 * Tests API key without CLI interference
 */

const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro'; // Use latest 2.5 Pro model by default
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const testPrompt = process.argv[2] || "Hello! Please respond with 'API key working correctly!' to confirm the connection.";

console.log('🔑 Testing Gemini API directly...');
console.log(`📡 Model: ${MODEL}`);
console.log(`🔗 API Key: ${API_KEY.substring(0, 12)}...`);
console.log(`💬 Prompt: ${testPrompt}`);
console.log('');

const requestData = JSON.stringify({
  contents: [{
    parts: [{
      text: testPrompt
    }]
  }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048
  }
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  }
};

console.log('🚀 Making API request...');

const req = https.request(API_URL, options, (res) => {
  console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS! API key is working correctly.');
        console.log('');
        
        if (response.candidates && response.candidates[0]) {
          const candidate = response.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
            const text = candidate.content.parts[0].text;
            console.log('🤖 Gemini Response:');
            console.log('─'.repeat(50));
            console.log(text.trim());
            console.log('─'.repeat(50));
          } else if (candidate.finishReason) {
            console.log(`⚠️  Response completed with reason: ${candidate.finishReason}`);
            if (candidate.finishReason === 'MAX_TOKENS') {
              console.log('💡 Try increasing maxOutputTokens in the request');
            }
          }
        }
        
        console.log('');
        console.log('📈 Usage Info:');
        if (response.usageMetadata) {
          console.log(`   Input tokens: ${response.usageMetadata.promptTokenCount}`);
          console.log(`   Output tokens: ${response.usageMetadata.candidatesTokenCount}`);
          console.log(`   Total tokens: ${response.usageMetadata.totalTokenCount}`);
        }
        
      } else {
        console.log('❌ API Error:');
        console.log(JSON.stringify(response, null, 2));
        
        if (response.error) {
          console.log('');
          console.log('🔍 Error Details:');
          console.log(`   Code: ${response.error.code}`);
          console.log(`   Message: ${response.error.message}`);
          
          if (response.error.code === 400) {
            console.log('');
            console.log('💡 Possible Issues:');
            console.log('   - Invalid API key format');
            console.log('   - API key not enabled for Gemini API');
            console.log('   - Request format issue');
          } else if (response.error.code === 403) {
            console.log('');
            console.log('💡 Possible Issues:');
            console.log('   - API key lacks permissions');
            console.log('   - API not enabled in Google Cloud Console');
            console.log('   - Billing not set up');
          } else if (response.error.code === 429) {
            console.log('');
            console.log('💡 Rate Limit Info:');
            console.log('   - Free tier: 15 requests per minute');
            console.log('   - Wait a minute and try again');
          }
        }
      }
      
    } catch (parseError) {
      console.log('❌ Failed to parse response:');
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.log(`❌ Request failed: ${error.message}`);
});

req.write(requestData);
req.end();