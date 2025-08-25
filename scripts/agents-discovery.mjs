#!/usr/bin/env node

/**
 * Agents Discovery Script
 * Reads agents/registry.json, checks environment variables, and performs API probes
 * Generates agents-status.json and markdown summary
 */

import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Timeout for API requests (5 seconds)
const REQUEST_TIMEOUT = 5000;

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
async function makeRequest(config) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const url = interpolateEnvVars(config.url);
    const headers = {};
    
    // Interpolate environment variables in headers
    if (config.headers) {
      for (const [key, value] of Object.entries(config.headers)) {
        headers[key] = interpolateEnvVars(value);
      }
    }

    const requestConfig = {
      method: config.method || 'GET',
      headers,
      signal: controller.signal
    };

    if (config.body) {
      requestConfig.body = JSON.stringify(config.body);
    }

    console.log(`Making ${config.method || 'GET'} request to ${redactSecret(url)}`);
    
    const response = await fetch(url, requestConfig);
    clearTimeout(timeoutId);
    
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      data: response.status < 400 ? await response.json().catch(() => null) : null
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
 * Interpolate environment variables in strings
 */
function interpolateEnvVars(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\$\{([^}]+)\}/g, (match, envVar) => {
    return process.env[envVar] || match;
  });
}

/**
 * Check if environment variables are present
 */
function checkEnvironment(envVars) {
  const missing = [];
  const present = [];
  
  for (const envVar of envVars) {
    if (process.env[envVar]) {
      present.push(envVar);
    } else {
      missing.push(envVar);
    }
  }
  
  return { present, missing, hasAll: missing.length === 0 };
}

/**
 * Discover agent status
 */
async function discoverAgent(agent) {
  console.log(`\n🔍 Discovering agent: ${agent.displayName} (${agent.id})`);
  
  const result = {
    id: agent.id,
    displayName: agent.displayName,
    vendor: agent.vendor,
    status: 'unknown',
    environment: { present: [], missing: [], hasAll: false },
    probe: null,
    models: null,
    lastChecked: new Date().toISOString(),
    notes: agent.notes
  };

  // Check environment variables
  if (agent.discovery?.envList?.length > 0) {
    result.environment = checkEnvironment(agent.discovery.envList);
    console.log(`Environment check: ${result.environment.present.length} present, ${result.environment.missing.length} missing`);
    
    if (!result.environment.hasAll) {
      result.status = 'missing_secrets';
      console.log(`❌ Missing environment variables: ${result.environment.missing.join(', ')}`);
      return result;
    }
  } else {
    // Special case for agents that don't need API access
    result.environment.hasAll = true;
    if (agent.auth?.type === 'awareness_only') {
      result.status = 'awareness_only';
      console.log(`ℹ️ Awareness-only agent (no API access)`);
      return result;
    }
  }

  // Perform API probe if configured and environment is available
  if (agent.discovery?.probe && result.environment.hasAll) {
    console.log(`🔬 Performing API probe...`);
    
    try {
      const probeResult = await makeRequest(agent.discovery.probe);
      result.probe = {
        success: probeResult.success,
        status: probeResult.status,
        error: probeResult.error,
        timestamp: new Date().toISOString()
      };

      if (probeResult.success && probeResult.status < 400) {
        result.status = 'available';
        
        // Extract models if available from probe response
        if (probeResult.data) {
          if (probeResult.data.data && Array.isArray(probeResult.data.data)) {
            // OpenAI format
            result.models = probeResult.data.data.slice(0, 10).map(m => m.id || m.model).filter(Boolean);
          } else if (Array.isArray(probeResult.data.models)) {
            // Gemini format
            result.models = probeResult.data.models.slice(0, 10).map(m => m.name).filter(Boolean);
          }
        }
        
        console.log(`✅ Agent available via API`);
        if (result.models) {
          console.log(`📋 Found ${result.models.length} models`);
        }
      } else {
        result.status = 'api_error';
        console.log(`❌ API probe failed: ${probeResult.status} ${probeResult.error || probeResult.statusText || 'Unknown error'}`);
      }
    } catch (error) {
      result.probe = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      result.status = 'probe_failed';
      console.log(`❌ Probe failed: ${error.message}`);
    }
  } else if (result.environment.hasAll) {
    // Environment available but no probe configured
    result.status = 'environment_ready';
    console.log(`✅ Environment ready (no probe configured)`);
  }

  return result;
}

/**
 * Generate markdown summary
 */
function generateMarkdownSummary(discovery) {
  const { registry, results, summary } = discovery;
  
  let markdown = `# 🤖 Agents Discovery Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Registry Version:** ${registry.version}\n`;
  markdown += `**Total Agents:** ${summary.total}\n\n`;
  
  // Summary by status
  markdown += `## 📊 Status Summary\n\n`;
  for (const [status, count] of Object.entries(summary.byStatus)) {
    const emoji = getStatusEmoji(status);
    markdown += `- ${emoji} **${status.replace('_', ' ').toUpperCase()}**: ${count}\n`;
  }
  markdown += `\n`;
  
  // Detailed results
  markdown += `## 🔍 Detailed Results\n\n`;
  for (const result of results) {
    const emoji = getStatusEmoji(result.status);
    markdown += `### ${emoji} ${result.displayName}\n\n`;
    markdown += `- **ID:** ${result.id}\n`;
    markdown += `- **Vendor:** ${result.vendor}\n`;
    markdown += `- **Status:** ${result.status.replace('_', ' ')}\n`;
    
    if (result.environment.missing.length > 0) {
      markdown += `- **Missing Secrets:** ${result.environment.missing.join(', ')}\n`;
    }
    
    if (result.models && result.models.length > 0) {
      markdown += `- **Available Models:** ${result.models.join(', ')}\n`;
    }
    
    if (result.probe && !result.probe.success) {
      markdown += `- **Probe Error:** ${result.probe.error}\n`;
    }
    
    if (result.notes) {
      markdown += `- **Notes:** ${result.notes}\n`;
    }
    
    markdown += `\n`;
  }
  
  // Instructions
  markdown += `## 🚀 Next Steps\n\n`;
  markdown += `### To Configure Missing Agents\n\n`;
  
  const missingSecrets = new Set();
  for (const result of results) {
    if (result.status === 'missing_secrets') {
      result.environment.missing.forEach(secret => missingSecrets.add(secret));
    }
  }
  
  if (missingSecrets.size > 0) {
    markdown += `Add the following repository secrets:\n\n`;
    for (const secret of Array.from(missingSecrets).sort()) {
      markdown += `- \`${secret}\`\n`;
    }
    markdown += `\n`;
  }
  
  markdown += `### To Invoke Agents\n\n`;
  markdown += `Go to **Actions** → **Agents: Invoke** and select an available agent.\n\n`;
  
  return markdown;
}

/**
 * Get emoji for status
 */
function getStatusEmoji(status) {
  switch (status) {
    case 'available': return '✅';
    case 'environment_ready': return '🟡';
    case 'missing_secrets': return '❌';
    case 'api_error': return '🔴';
    case 'probe_failed': return '⚠️';
    case 'awareness_only': return 'ℹ️';
    default: return '❓';
  }
}

/**
 * Main discovery function
 */
async function main() {
  console.log('🤖 Starting Agents Discovery...\n');
  
  try {
    // Read registry
    const registryPath = join(rootDir, 'agents', 'registry.json');
    console.log(`📖 Reading registry from: ${registryPath}`);
    
    const registryContent = readFileSync(registryPath, 'utf8');
    const registry = JSON.parse(registryContent);
    
    console.log(`📋 Found ${Object.keys(registry.agents).length} agents in registry`);
    
    // Discover each agent
    const results = [];
    for (const [agentId, agent] of Object.entries(registry.agents)) {
      const result = await discoverAgent(agent);
      results.push(result);
    }
    
    // Generate summary
    const summary = {
      total: results.length,
      byStatus: {},
      byVendor: {}
    };
    
    for (const result of results) {
      summary.byStatus[result.status] = (summary.byStatus[result.status] || 0) + 1;
      summary.byVendor[result.vendor] = (summary.byVendor[result.vendor] || 0) + 1;
    }
    
    const discovery = {
      timestamp: new Date().toISOString(),
      registry: {
        version: registry.version,
        description: registry.description
      },
      results,
      summary
    };
    
    // Write status file
    const statusPath = join(rootDir, 'agents-status.json');
    writeFileSync(statusPath, JSON.stringify(discovery, null, 2));
    console.log(`\n💾 Status written to: ${statusPath}`);
    
    // Generate markdown summary
    const markdown = generateMarkdownSummary(discovery);
    console.log(`\n📄 Markdown Summary:\n`);
    console.log(markdown);
    
    // Write markdown file for artifact
    const markdownPath = join(rootDir, 'agents-discovery-summary.md');
    writeFileSync(markdownPath, markdown);
    console.log(`\n💾 Markdown written to: ${markdownPath}`);
    
    console.log(`\n✅ Discovery completed successfully!`);
    
  } catch (error) {
    console.error(`❌ Discovery failed:`, error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, discoverAgent, generateMarkdownSummary };