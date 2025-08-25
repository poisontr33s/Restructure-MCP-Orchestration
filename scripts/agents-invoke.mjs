#!/usr/bin/env node

/**
 * Agents Invoke Script
 * Reads agents/registry.json and invokes agents via their APIs
 * Supports OpenAI, Anthropic, Google Gemini, and placeholder agents
 */

import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Timeout for API requests (30 seconds for generation)
const REQUEST_TIMEOUT = 30000;

/**
 * Redact sensitive information from logs
 */
function redactSecret(value) {
  if (!value || typeof value !== 'string') return value;
  if (value.length <= 8) return '***';
  return value.substring(0, 4) + '***' + value.substring(value.length - 4);
}

/**
 * Make a safe HTTP request with timeout
 */
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log(`Making ${options.method || 'POST'} request to ${redactSecret(url)}`);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json().catch(() => null);
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: error.name === 'AbortError' ? 'Request timeout' : error.message
    };
  }
}

/**
 * Invoke OpenAI GPT
 */
async function invokeOpenAI(agent, params) {
  const { model = 'gpt-3.5-turbo', prompt, temperature = 0.7 } = params;
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  const url = agent.endpoints.chat;
  const requestBody = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: parseFloat(temperature),
    max_tokens: 1000
  };
  
  console.log(`🤖 Invoking OpenAI GPT with model: ${model}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
  
  const result = await makeRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify(requestBody)
  });
  
  if (result.success && result.data?.choices?.[0]?.message?.content) {
    return {
      success: true,
      response: result.data.choices[0].message.content,
      usage: result.data.usage,
      model: result.data.model,
      rawResponse: result.data
    };
  } else {
    throw new Error(`OpenAI API error: ${result.error || result.data?.error?.message || 'Unknown error'}`);
  }
}

/**
 * Invoke Anthropic Claude
 */
async function invokeAnthropic(agent, params) {
  const { model = 'claude-3-haiku-20240307', prompt, temperature = 0.7 } = params;
  
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }
  
  const url = agent.endpoints.messages;
  const requestBody = {
    model,
    max_tokens: 1000,
    temperature: parseFloat(temperature),
    messages: [{ role: 'user', content: prompt }]
  };
  
  console.log(`🤖 Invoking Anthropic Claude with model: ${model}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
  
  const result = await makeRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (result.success && result.data?.content?.[0]?.text) {
    return {
      success: true,
      response: result.data.content[0].text,
      usage: result.data.usage,
      model: result.data.model,
      rawResponse: result.data
    };
  } else {
    throw new Error(`Anthropic API error: ${result.error || result.data?.error?.message || 'Unknown error'}`);
  }
}

/**
 * Invoke Google Gemini
 */
async function invokeGemini(agent, params) {
  const { model = 'gemini-1.5-flash', prompt, temperature = 0.7 } = params;
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  
  const url = agent.endpoints.generateContent.replace('{model}', model) + `?key=${process.env.GEMINI_API_KEY}`;
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: parseFloat(temperature),
      maxOutputTokens: 1000
    }
  };
  
  console.log(`🤖 Invoking Google Gemini with model: ${model}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`);
  
  const result = await makeRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (result.success && result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return {
      success: true,
      response: result.data.candidates[0].content.parts[0].text,
      usage: result.data.usageMetadata,
      model: model,
      rawResponse: result.data
    };
  } else {
    throw new Error(`Gemini API error: ${result.error || result.data?.error?.message || 'Unknown error'}`);
  }
}

/**
 * Invoke placeholder agents (Jules, Gemini Code Assist)
 */
async function invokePlaceholder(agent, params) {
  const { prompt } = params;
  
  console.log(`🔄 Attempting to invoke placeholder agent: ${agent.displayName}`);
  
  if (agent.id === 'google.jules') {
    if (!process.env.JULES_API_KEY || !process.env.JULES_ENDPOINT) {
      throw new Error('JULES_API_KEY and JULES_ENDPOINT environment variables are required');
    }
    
    const url = process.env.JULES_ENDPOINT;
    console.log(`🤖 Invoking Google Jules (placeholder) at: ${redactSecret(url)}`);
    
    const result = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JULES_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        type: 'async-reasoning'
      })
    });
    
    if (result.success) {
      return {
        success: true,
        response: result.data?.response || 'Placeholder response from Jules',
        model: 'jules-beta',
        rawResponse: result.data,
        note: 'This is a placeholder implementation'
      };
    } else {
      throw new Error(`Jules API error: ${result.error || 'Placeholder endpoint may not be available'}`);
    }
  } else if (agent.id === 'google.gemini_code_assist') {
    if (!process.env.GEMINI_CODE_ASSIST_TOKEN) {
      throw new Error('GEMINI_CODE_ASSIST_TOKEN environment variable is required');
    }
    
    console.log(`🤖 Invoking Gemini Code Assist (placeholder)`);
    
    // This is a placeholder - in reality, this might require enterprise authentication
    return {
      success: true,
      response: `Placeholder response for Gemini Code Assist. Original prompt: "${prompt.substring(0, 100)}..."`,
      model: 'gemini-code-assist',
      rawResponse: { placeholder: true },
      note: 'This is a placeholder implementation for enterprise-only features'
    };
  } else {
    throw new Error(`Unknown placeholder agent: ${agent.id}`);
  }
}

/**
 * Handle GitHub Copilot awareness
 */
function handleCopilotAwareness(agent, params) {
  const { prompt } = params;
  
  console.log(`ℹ️ GitHub Copilot Coding Agent awareness request`);
  
  return {
    success: true,
    response: `GitHub Copilot Coding Agent is available through:\n- VS Code extension\n- GitHub web interface\n- GitHub Actions (this environment)\n\nOriginal request: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"\n\nFor actual code generation, use the GitHub Copilot extension in your IDE or the web interface.`,
    model: 'copilot',
    rawResponse: { awareness: true },
    note: 'This agent provides awareness only - no direct API access available'
  };
}

/**
 * Main invocation function
 */
async function invokeAgent(agentId, operation, params) {
  console.log(`🚀 Invoking agent: ${agentId}`);
  console.log(`🎯 Operation: ${operation}`);
  
  try {
    // Read registry
    const registryPath = join(rootDir, 'agents', 'registry.json');
    const registryContent = readFileSync(registryPath, 'utf8');
    const registry = JSON.parse(registryContent);
    
    const agent = registry.agents[agentId];
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    console.log(`🤖 Agent: ${agent.displayName} (${agent.vendor})`);
    
    let result;
    
    // Route by vendor and agent type
    switch (agent.vendor) {
      case 'OpenAI':
        if (operation === 'chat' || operation === 'text-generation') {
          result = await invokeOpenAI(agent, params);
        } else {
          throw new Error(`Unsupported operation '${operation}' for OpenAI agents`);
        }
        break;
        
      case 'Anthropic':
        if (operation === 'chat' || operation === 'text-generation') {
          result = await invokeAnthropic(agent, params);
        } else {
          throw new Error(`Unsupported operation '${operation}' for Anthropic agents`);
        }
        break;
        
      case 'Google':
        if (agent.id === 'google.gemini') {
          if (operation === 'chat' || operation === 'text-generation') {
            result = await invokeGemini(agent, params);
          } else {
            throw new Error(`Unsupported operation '${operation}' for Google Gemini`);
          }
        } else {
          // Placeholder agents
          result = await invokePlaceholder(agent, params);
        }
        break;
        
      case 'GitHub':
        if (agent.id === 'github.copilot_coding_agent') {
          result = handleCopilotAwareness(agent, params);
        } else {
          throw new Error(`Unknown GitHub agent: ${agent.id}`);
        }
        break;
        
      default:
        throw new Error(`Unsupported vendor: ${agent.vendor}`);
    }
    
    // Add metadata
    result.agent = {
      id: agent.id,
      displayName: agent.displayName,
      vendor: agent.vendor
    };
    result.invocation = {
      operation,
      timestamp: new Date().toISOString(),
      parameters: {
        ...params,
        // Redact sensitive info
        prompt: params.prompt ? `${params.prompt.substring(0, 100)}${params.prompt.length > 100 ? '...' : ''}` : undefined
      }
    };
    
    return result;
    
  } catch (error) {
    console.error(`❌ Invocation failed:`, error);
    
    return {
      success: false,
      error: error.message,
      agent: { id: agentId },
      invocation: {
        operation,
        timestamp: new Date().toISOString(),
        parameters: params
      }
    };
  }
}

/**
 * Generate markdown preview
 */
function generatePreview(result) {
  let preview = `# 🤖 Agent Invocation Result\n\n`;
  
  if (result.success) {
    preview += `✅ **Status:** Success\n`;
    preview += `🤖 **Agent:** ${result.agent.displayName} (${result.agent.vendor})\n`;
    preview += `🎯 **Operation:** ${result.invocation.operation}\n`;
    if (result.model) {
      preview += `🧠 **Model:** ${result.model}\n`;
    }
    preview += `⏰ **Timestamp:** ${result.invocation.timestamp}\n\n`;
    
    preview += `## 📝 Response\n\n`;
    preview += `${result.response}\n\n`;
    
    if (result.usage) {
      preview += `## 📊 Usage\n\n`;
      preview += `\`\`\`json\n${JSON.stringify(result.usage, null, 2)}\n\`\`\`\n\n`;
    }
    
    if (result.note) {
      preview += `## ℹ️ Note\n\n`;
      preview += `${result.note}\n\n`;
    }
  } else {
    preview += `❌ **Status:** Error\n`;
    preview += `🤖 **Agent:** ${result.agent.id}\n`;
    preview += `🎯 **Operation:** ${result.invocation.operation}\n`;
    preview += `⏰ **Timestamp:** ${result.invocation.timestamp}\n\n`;
    
    preview += `## ❌ Error\n\n`;
    preview += `${result.error}\n\n`;
  }
  
  return preview;
}

/**
 * Main function for CLI usage
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node agents-invoke.mjs <agent_id> <operation> <prompt> [model] [temperature] [extra_json]');
    console.error('Example: node agents-invoke.mjs openai.gpt chat "Hello, world!" gpt-4 0.7');
    process.exit(1);
  }
  
  const [agentId, operation, prompt, model, temperature, extraJson] = args;
  
  const params = {
    prompt,
    model,
    temperature: temperature ? parseFloat(temperature) : 0.7
  };
  
  if (extraJson) {
    try {
      const extra = JSON.parse(extraJson);
      Object.assign(params, extra);
    } catch (error) {
      console.error('❌ Invalid extra_json parameter:', error.message);
      process.exit(1);
    }
  }
  
  console.log('🚀 Starting agent invocation...\n');
  
  const result = await invokeAgent(agentId, operation, params);
  
  // Write result to file
  const resultPath = join(rootDir, 'agent-invocation-result.json');
  writeFileSync(resultPath, JSON.stringify(result, null, 2));
  console.log(`\n💾 Result written to: ${resultPath}`);
  
  // Generate and write preview
  const preview = generatePreview(result);
  const previewPath = join(rootDir, 'agent-invocation-preview.md');
  writeFileSync(previewPath, preview);
  console.log(`💾 Preview written to: ${previewPath}`);
  
  console.log(`\n📄 Preview:\n`);
  console.log(preview);
  
  if (!result.success) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { invokeAgent, generatePreview };