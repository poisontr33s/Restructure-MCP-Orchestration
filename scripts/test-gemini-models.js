#!/usr/bin/env node

/**
 * Test different Gemini Pro models to find the right one
 */

const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0';

const models = [
  'gemini-2.5-pro', // Latest and most advanced
  'gemini-2.5-flash', // Latest Flash model
  'gemini-1.5-pro', // Previous Pro
  'gemini-1.5-pro-latest', // Latest 1.5 Pro
  'gemini-1.5-flash', // Flash 1.5
  'gemini-2.0-flash-exp', // Experimental 2.0
];

async function testModel(model) {
  return new Promise((resolve) => {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const requestData = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Hello! What model are you? Please identify yourself clearly.`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData),
      },
    };

    const req = https.request(API_URL, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);

          if (res.statusCode === 200 && response.candidates && response.candidates[0]) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
              const text = candidate.content.parts[0].text.trim();
              resolve({
                model,
                success: true,
                response: text,
                tokens: response.usageMetadata?.totalTokenCount || 0,
              });
            } else {
              resolve({
                model,
                success: false,
                error: `No content in response. Finish reason: ${candidate.finishReason || 'unknown'}`,
              });
            }
          } else {
            resolve({
              model,
              success: false,
              error: response.error?.message || `Status ${res.statusCode}`,
            });
          }
        } catch (parseError) {
          resolve({
            model,
            success: false,
            error: `Parse error: ${parseError.message}`,
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        model,
        success: false,
        error: error.message,
      });
    });

    req.setTimeout(10000, () => {
      resolve({
        model,
        success: false,
        error: 'Timeout',
      });
    });

    req.write(requestData);
    req.end();
  });
}

async function testAllModels() {
  console.log('🔍 Testing available Gemini Pro models...');
  console.log('');

  for (const model of models) {
    process.stdout.write(`📡 Testing ${model}... `);

    const result = await testModel(model);

    if (result.success) {
      console.log(`✅ SUCCESS (${result.tokens} tokens)`);
      console.log(
        `   Response: ${result.response.substring(0, 100)}${result.response.length > 100 ? '...' : ''}`
      );
    } else {
      console.log(`❌ FAILED: ${result.error}`);
    }
    console.log('');
  }

  console.log(
    '🎯 Recommendation: Use the model that works and gives you the most detailed responses.'
  );
}

testAllModels().catch(console.error);
