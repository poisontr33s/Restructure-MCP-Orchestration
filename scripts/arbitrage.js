#!/usr/bin/env node
/*
  Simple provider arbitrage:
  - Discovers providers by env keys: OPENAI_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY
  - Models can be overridden via env: OPENAI_MODEL, GEMINI_MODEL, ANTHROPIC_MODEL
  - Usage:
      node scripts/arbitrage.js --prompt "Your question"
      node scripts/arbitrage.js --stdin
      node scripts/arbitrage.js --dry-run
*/

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
      const idx = s.indexOf('='); if (idx === -1) continue;
      const key = s.slice(0, idx).trim();
      let val = s.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {}
}

loadDotEnv();

const DEFAULTS = {
  openai: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  gemini: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  anthropic: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620',
};

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { dryRun: false, stdin: false, prompt: null, json: false, timeoutMs: 45000 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--stdin') out.stdin = true;
    else if (a === '--prompt') out.prompt = args[++i] || '';
    else if (a === '--json') out.json = true;
    else if (a === '--timeout-ms') out.timeoutMs = +args[++i] || out.timeoutMs;
  }
  return out;
}

function discoverProviders() {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
  };
}

async function withTimeout(promise, ms, label) {
  let to;
  const t = new Promise((_, rej) => { to = setTimeout(() => rej(new Error(`timeout after ${ms}ms: ${label}`)), ms); });
  return Promise.race([promise.finally(() => clearTimeout(to)), t]);
}

async function callOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY; if (!key) throw new Error('OPENAI_API_KEY missing');
  const model = DEFAULTS.openai;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const j = await res.json();
  return j.choices?.[0]?.message?.content?.trim() || '';
}

async function callGemini(prompt) {
  const key = process.env.GEMINI_API_KEY; if (!key) throw new Error('GEMINI_API_KEY missing');
  const model = DEFAULTS.gemini;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const j = await res.json();
  return j.candidates?.[0]?.content?.parts?.map(p => p.text).join('')?.trim() || '';
}

async function callAnthropic(prompt) {
  const key = process.env.ANTHROPIC_API_KEY; if (!key) throw new Error('ANTHROPIC_API_KEY missing');
  const model = DEFAULTS.anthropic;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 1000 }),
  });
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
  const j = await res.json();
  const content = j.content || [];
  const text = content.map(p => p.text || '').join('').trim();
  return text;
}

function summarize(text, max = 400) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max-3) + '...' : clean;
}

async function main() {
  const args = parseArgs();
  const providers = discoverProviders();
  const available = Object.entries(providers).filter(([_, v]) => v).map(([k]) => k);

  if (args.dryRun) {
    const out = { available, defaults: DEFAULTS };
    if (args.json) console.log(JSON.stringify(out)); else {
      console.log('Arbitrage dry run');
      console.log('Available providers:', available.join(', ') || 'none');
      console.log('Default models:', DEFAULTS);
    }
    process.exit(0);
  }

  let prompt = args.prompt;
  if (args.stdin) {
    prompt = await new Promise(resolve => {
      let data=''; process.stdin.setEncoding('utf8');
      process.stdin.on('data', c => data += c);
      process.stdin.on('end', () => resolve(data.trim()));
    });
  }
  if (!prompt) { console.error('No prompt provided. Use --prompt or --stdin or --dry-run'); process.exit(2); }

  const calls = [];
  if (providers.openai) calls.push(['openai', () => callOpenAI(prompt)]);
  if (providers.gemini) calls.push(['gemini', () => callGemini(prompt)]);
  if (providers.anthropic) calls.push(['anthropic', () => callAnthropic(prompt)]);
  if (calls.length === 0) { console.error('No providers available (set API keys).'); process.exit(3); }

  const results = [];
  for (const [name, fn] of calls) {
    const started = Date.now();
    try {
      const text = await withTimeout(fn(), args.timeoutMs, name);
      results.push({ provider: name, ok: true, ms: Date.now()-started, text });
    } catch (e) {
      results.push({ provider: name, ok: false, ms: Date.now()-started, error: String(e) });
    }
  }

  // Naive arbitration: pick the longest successful response; show all summaries.
  const winners = results.filter(r => r.ok).sort((a,b) => (b.text?.length||0) - (a.text?.length||0));
  const winner = winners[0] || null;

  const summary = {
    prompt,
    available,
    results: results.map(r => ({ provider: r.provider, ok: r.ok, ms: r.ms, excerpt: summarize(r.text, 400), error: r.error })),
    winner: winner ? { provider: winner.provider, ms: winner.ms } : null,
  };

  if (args.json) {
    console.log(JSON.stringify(summary));
  } else {
    console.log('Arbitrage Results');
    console.log('=================');
    console.log('Available:', available.join(', '));
    for (const r of summary.results) {
      console.log(`\n[${r.provider}] ok=${r.ok} ms=${r.ms}`);
      if (r.ok) console.log(r.excerpt); else console.log(r.error);
    }
    if (winner) console.log(`\nWinner: ${winner.provider} (${winner.ms} ms)`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
