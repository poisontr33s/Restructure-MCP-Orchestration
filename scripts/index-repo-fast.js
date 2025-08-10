#!/usr/bin/env node
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function readJsonSafe(file) {
  try { return JSON.parse(await fsp.readFile(file, 'utf8')); } catch { return null; }
}

async function listDirRecursive(root, filter) {
  const out = [];
  async function walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else {
        const stat = await fsp.stat(p);
        if (filter(p, stat)) out.push({ p, stat });
      }
    }
  }
  await walk(root);
  return out;
}

async function main() {
  const repoRoot = process.cwd();
  const outDir = path.join(repoRoot, 'docs', 'repo-index');
  const cachePath = path.join(outDir, '.cache.json');
  await fsp.mkdir(outDir, { recursive: true });

  let cache = null;
  try { cache = JSON.parse(await fsp.readFile(cachePath, 'utf8')); } catch {}
  const prevFiles = (cache && cache.files) || {};
  const prevPackages = (cache && cache.packages) || [];

  // discover package.json files
  const pkgEntries = await listDirRecursive(repoRoot, (p) => /package\.json$/.test(p) && !/node_modules/.test(p));
  const packages = [];
  const prevByDir = new Map(prevPackages.map(x => [x.dir, x]));

  for (const { p, stat } of pkgEntries) {
    const rel = path.relative(repoRoot, p);
    const dir = path.relative(repoRoot, path.dirname(p));
    const prev = prevFiles[rel];
    const sig = `${stat.mtimeMs}:${stat.size}`;
    if (prev && prev.sig === sig && prevByDir.has(dir)) {
      packages.push(prevByDir.get(dir));
      continue;
    }
    const json = await readJsonSafe(p);
    if (!json) continue;
    packages.push({ name: json.name, version: json.version, private: json.private, scripts: json.scripts, dir });
    prevFiles[rel] = { sig };
  }
  packages.sort((a,b)=>a.dir.localeCompare(b.dir));

  // workflows
  const wfDir = path.join(repoRoot, '.github', 'workflows');
  let workflows = [];
  try {
    const files = await fsp.readdir(wfDir);
    workflows = files.filter((f)=>/\.(ya?ml)$/.test(f)).map((f)=>({ name: f.replace(/\.(ya?ml)$/,'').replace(/[-_]/g,' '), file: path.join('.github','workflows',f) }));
  } catch {}

  // session log stats
  const logFile = path.join(repoRoot, 'docs', 'session-log', 'session.jsonl');
  let sessionLog = { entries: 0, lastTs: null };
  try {
    const content = await fsp.readFile(logFile, 'utf8');
    const lines = content.split(/\r?\n/).filter(Boolean);
    let lastTs = null;
    for (const line of lines) { try { const obj = JSON.parse(line); if (obj.ts) lastTs = obj.ts; } catch {} }
    sessionLog = { entries: lines.length, lastTs };
  } catch {}

  const index = { generatedAt: new Date().toISOString(), packages, workflows, sessionLog, codebase: { map: 'docs/codebase/codebase.json', overview: 'docs/codebase/overview.md' } };
  await fsp.writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));

  // update cache
  const filesForCache = {};
  for (const { p, stat } of pkgEntries) {
    const rel = path.relative(repoRoot, p);
    filesForCache[rel] = { sig: `${stat.mtimeMs}:${stat.size}` };
  }
  const newCache = { files: filesForCache, packages };
  await fsp.writeFile(cachePath, JSON.stringify(newCache, null, 2));

  console.log(`Wrote ${path.join('docs','repo-index','index.json')} (fast)`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
