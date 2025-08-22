#!/usr/bin/env node
"use strict";
/**
 * Unified Gemini TypeScript Implementation
 * Combines AI Studio, Google Gemini Pro 2.5, and CLI capabilities
 * Cross-compatible with JS/TS/TSX using pnpm workspace
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedGeminiClient = void 0;
const genai_1 = require("@google/genai");
const child_process_1 = require("child_process");
/**
 * Google GenAI SDK Provider (AI Studio compatible)
 */
class GoogleGenAIProvider {
    name = 'Google GenAI SDK';
    async test() {
        try {
            const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0';
            if (!apiKey)
                return false;
            const ai = new genai_1.GoogleGenAI({ apiKey });
            // Simple test to verify SDK is working
            return true;
        }
        catch {
            return false;
        }
    }
    async generate(prompt, config) {
        const apiKey = config.apiKey || process.env.GEMINI_API_KEY || 'AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0';
        if (!apiKey)
            throw new Error('GEMINI_API_KEY required for SDK provider');
        const ai = new genai_1.GoogleGenAI({ apiKey });
        // Configure tools based on config
        const tools = [];
        if (config.tools?.includes('googleSearch')) {
            tools.push({ googleSearch: {} });
        }
        if (config.tools?.includes('codeExecution')) {
            tools.push({ codeExecution: {} });
        }
        const requestConfig = {
            thinkingConfig: {
                thinkingBudget: config.thinkingBudget ?? -1,
            },
            tools: tools.length > 0 ? tools : undefined,
        };
        const contents = [{
                role: 'user',
                parts: [{ text: prompt }],
            }];
        if (config.streaming) {
            // Streaming response
            const response = await ai.models.generateContentStream({
                model: config.model,
                config: requestConfig,
                contents,
            });
            let totalText = '';
            let chunkCount = 0;
            for await (const chunk of response) {
                if (chunk.text) {
                    totalText += chunk.text;
                    chunkCount++;
                }
            }
            return {
                text: totalText,
                chunks: chunkCount,
                method: 'sdk',
                model: config.model,
                streaming: true,
                tools: config.tools || [],
            };
        }
        else {
            // Non-streaming response
            const response = await ai.models.generateContent({
                model: config.model,
                config: requestConfig,
                contents,
            });
            return {
                text: response.text || '',
                method: 'sdk',
                model: config.model,
                streaming: false,
                tools: config.tools || [],
            };
        }
    }
}
/**
 * Gemini CLI Provider
 */
class GeminiCliProvider {
    name = 'Gemini CLI';
    async test() {
        return new Promise((resolve) => {
            const child = (0, child_process_1.spawn)('gemini', ['--version'], { shell: true });
            child.on('close', (code) => resolve(code === 0));
            child.on('error', () => resolve(false));
        });
    }
    async generate(prompt, config) {
        return new Promise((resolve, reject) => {
            const args = ['-p', `"${prompt}"`];
            if (config.model && config.model !== 'gemini-2.5-pro') {
                args.unshift('--model', config.model);
            }
            if (config.ideMode) {
                args.push('--ide-mode-feature');
            }
            if (config.includeDirectories?.length) {
                args.push('--include-directories', config.includeDirectories.join(','));
            }
            const options = {
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe'],
            };
            const child = (0, child_process_1.spawn)('gemini', args, options);
            let output = '';
            let error = '';
            child.stdout?.on('data', (data) => {
                output += data.toString();
            });
            child.stderr?.on('data', (data) => {
                error += data.toString();
            });
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        text: output.trim(),
                        method: 'cli',
                        model: config.model,
                        streaming: false,
                        tools: [], // CLI tools are implicit
                    });
                }
                else {
                    reject(new Error(`CLI failed (${code}): ${error}`));
                }
            });
            child.on('error', (err) => {
                reject(err);
            });
        });
    }
}
/**
 * Direct API Provider (fallback)
 */
class DirectApiProvider {
    name = 'Direct API';
    async test() {
        return !!(process.env.GEMINI_API_KEY || 'AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0');
    }
    async generate(prompt, config) {
        const https = require('https');
        const apiKey = config.apiKey || process.env.GEMINI_API_KEY || 'AIzaSyBylYOTQrX1GIdThln1mKLQ9E0Dvg6ltx0';
        if (!apiKey)
            throw new Error('GEMINI_API_KEY required for direct API');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`;
        const requestData = JSON.stringify({
            contents: [{
                    parts: [{ text: prompt }]
                }],
            generationConfig: {
                temperature: config.temperature ?? 0.7,
                maxOutputTokens: config.maxOutputTokens ?? 2048
            }
        });
        return new Promise((resolve, reject) => {
            const req = https.request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestData)
                }
            }, (res) => {
                let responseData = '';
                res.on('data', (chunk) => responseData += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(responseData);
                        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
                            resolve({
                                text: response.candidates[0].content.parts[0].text,
                                tokens: {
                                    input: response.usageMetadata?.promptTokenCount || 0,
                                    output: response.usageMetadata?.candidatesTokenCount || 0,
                                    total: response.usageMetadata?.totalTokenCount || 0,
                                },
                                method: 'direct-api',
                                model: config.model,
                                streaming: false,
                                tools: [],
                            });
                        }
                        else {
                            reject(new Error(`No content in response: ${JSON.stringify(response)}`));
                        }
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            });
            req.on('error', reject);
            req.write(requestData);
            req.end();
        });
    }
}
/**
 * Unified Gemini Client
 */
class UnifiedGeminiClient {
    providers = [
        new GoogleGenAIProvider(),
        new GeminiCliProvider(),
        new DirectApiProvider(),
    ];
    async generate(prompt, config = {}) {
        const fullConfig = {
            model: 'gemini-2.5-pro',
            streaming: true,
            tools: ['googleSearch'],
            thinkingBudget: -1,
            temperature: 0.7,
            maxOutputTokens: 2048,
            fallbackToCli: true,
            ideMode: false,
            ...config,
        };
        console.log(`🔍 Attempting unified generation with model: ${fullConfig.model}`);
        // Try providers in order of preference
        for (const provider of this.providers) {
            try {
                const isAvailable = await provider.test();
                console.log(`📡 ${provider.name}: ${isAvailable ? '✅ Available' : '❌ Unavailable'}`);
                if (isAvailable) {
                    console.log(`🚀 Using ${provider.name}...`);
                    const response = await provider.generate(prompt, fullConfig);
                    console.log(`✅ Success with ${provider.name}`);
                    return response;
                }
            }
            catch (error) {
                console.log(`❌ ${provider.name} failed:`, error instanceof Error ? error.message : error);
                continue;
            }
        }
        throw new Error('All providers failed');
    }
    async listProviders() {
        const results = [];
        for (const provider of this.providers) {
            const available = await provider.test();
            results.push({ name: provider.name, available });
        }
        return results;
    }
}
exports.UnifiedGeminiClient = UnifiedGeminiClient;
/**
 * CLI Interface and Main Function
 */
async function main() {
    const args = process.argv.slice(2);
    const prompt = args[0] || 'Hello! Please identify yourself and confirm which provider is being used.';
    console.log('🤖 Unified Gemini TypeScript Client');
    console.log('=====================================');
    console.log('');
    const client = new UnifiedGeminiClient();
    // Configuration from environment and defaults
    const config = {
        model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
        streaming: true,
        tools: ['googleSearch'],
        thinkingBudget: -1,
        includeDirectories: ['packages', 'scripts', 'docs', '.vscode'],
    };
    console.log('📋 Configuration:');
    console.log(`   Model: ${config.model}`);
    console.log(`   Streaming: ${config.streaming}`);
    console.log(`   Tools: ${config.tools?.join(', ')}`);
    console.log(`   Thinking Budget: ${config.thinkingBudget === -1 ? 'Unlimited' : config.thinkingBudget}`);
    console.log('');
    console.log('💬 Prompt:', prompt);
    console.log('');
    try {
        // Show available providers
        const providers = await client.listProviders();
        console.log('📊 Provider Status:');
        providers.forEach(p => console.log(`   ${p.name}: ${p.available ? '✅' : '❌'}`));
        console.log('');
        // Generate response
        const response = await client.generate(prompt, config);
        console.log('🤖 Response:');
        console.log('─'.repeat(80));
        console.log(response.text);
        console.log('─'.repeat(80));
        console.log('');
        console.log('📈 Response Info:');
        console.log(`   Provider: ${response.method}`);
        console.log(`   Model: ${response.model}`);
        console.log(`   Streaming: ${response.streaming}`);
        console.log(`   Tools: ${response.tools.join(', ') || 'None'}`);
        if (response.chunks)
            console.log(`   Chunks: ${response.chunks}`);
        if (response.tokens) {
            console.log(`   Tokens: ${response.tokens.input} input + ${response.tokens.output} output = ${response.tokens.total} total`);
        }
    }
    catch (error) {
        console.error('❌ Generation failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
// Run as CLI if executed directly
if (require.main === module) {
    main().catch(console.error);
}
