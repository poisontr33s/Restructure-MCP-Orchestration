#!/usr/bin/env node
const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function loadDotEnv() {
  try {
    const file = path.join(__dirname, '..', '.env.local');
    if (!fs.existsSync(file)) return;
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const s = line.trim();
      if (!s || s.startsWith('#')) continue;
      const idx = s.indexOf('=');
      if (idx === -1) continue;
      const key = s.slice(0, idx).trim();
      let val = s.slice(idx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {}
}

loadDotEnv();

function safe(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] })
      .toString()
      .trim();
  } catch (e) {
    return '';
  }
}

function has(cmd) {
  try {
    execSync(process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

const info = {
  when: new Date().toISOString(),
  os: {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemGB: +(os.totalmem() / 1e9).toFixed(2),
  },
  node: process.versions.node,
  tools: {
    pnpm: has('pnpm') ? safe('pnpm -v') : '',
    npm: has('npm') ? safe('npm -v') : '',
    yarn: has('yarn') ? safe('yarn -v') : '',
    uv: has('uv') ? safe('uv --version') : '',
    uvx: has('uvx') ? safe('uvx --version') : '',
    git: has('git') ? safe('git --version') : '',
    claude: has('claude') ? safe('claude --version') || 'installed' : '',
    gemini: has('gemini') ? safe('gemini --version') : '',
  },
  env: {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    MCP_EXPERIMENTAL: !!process.env.MCP_EXPERIMENTAL,
    PATH_has_local_bin: (process.env.Path || process.env.PATH || '')
      .toLowerCase()
      .includes('c:/users/erdno/.local/bin'),
  },
};

console.log('Environment Report');
console.log('===================');
console.log(`When: ${info.when}`);
console.log(
  `OS: ${info.os.platform} ${info.os.release} ${info.os.arch} CPUs=${info.os.cpus} Mem=${info.os.totalMemGB}GB`
);
console.log(`Node: ${info.node}`);
for (const [k, v] of Object.entries(info.tools)) console.log(`${k}: ${v || 'missing'}`);
console.log(
  `Keys -> OPENAI:${info.env.OPENAI_API_KEY} GEMINI:${info.env.GEMINI_API_KEY} ANTHROPIC:${info.env.ANTHROPIC_API_KEY} EXP:${info.env.MCP_EXPERIMENTAL}`
);
console.log(`PATH has local bin: ${info.env.PATH_has_local_bin}`);

// Emit JSON at end for machine-consumers
console.log('\nJSON:\n' + JSON.stringify(info));
