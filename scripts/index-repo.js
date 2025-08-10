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
      if (e.isDirectory()) { await walk(p); }
      else {
        const stat = await fsp.stat(p);
        if (filter(p, stat)) out.push(p);
      }
    }
  }
  await walk(root);
  return out;
}

async function main() {
  const repoRoot = process.cwd();
  const outDir = path.join(repoRoot, 'docs', 'repo-index');
  await fsp.mkdir(outDir, { recursive: true });

  const pkgFiles = await listDirRecursive(repoRoot, (p) => /package\.json$/.test(p) && !/node_modules/.test(p));
  const packages = [];
  for (const f of pkgFiles) {
    const json = await readJsonSafe(f);
    if (!json) continue;
    packages.push({ name: json.name, version: json.version, private: json.private, scripts: json.scripts, dir: path.relative(repoRoot, path.dirname(f)) });
  }
  packages.sort((a,b)=>a.dir.localeCompare(b.dir));

  const wfDir = path.join(repoRoot, '.github', 'workflows');
  let workflows = [];
  try {
    const files = await fsp.readdir(wfDir);
    workflows = files.filter((f)=>/\.(ya?ml)$/.test(f)).map((f)=>({ name: f.replace(/\.(ya?ml)$/,'').replace(/[-_]/g,' '), file: path.join('.github','workflows',f) }));
  } catch {}

  const index = { generatedAt: new Date().toISOString(), packages, workflows };
  // session log stats
  const logFile = path.join(repoRoot, 'docs', 'session-log', 'session.jsonl');
  try {
    const content = await fsp.readFile(logFile, 'utf8');
    const lines = content.split(/\r?\n/).filter(Boolean);
    let lastTs = null;
    for (const line of lines) {
      try { const obj = JSON.parse(line); if (obj.ts) lastTs = obj.ts; } catch {}
    }
    index.sessionLog = { entries: lines.length, lastTs };
  } catch {}
  // codebase map pointer
  index.codebase = {
    map: 'docs/codebase/codebase.json',
    overview: 'docs/codebase/overview.md'
  };
  await fsp.writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  const readme = `# Repo Index\n\n- Generated: ${new Date().toISOString()}\n- Packages: ${packages.length}\n- Workflows: ${workflows.length}\n\nSee index.json for details.`;
  await fsp.writeFile(path.join(outDir, 'README.md'), readme);

  console.log(`Wrote ${path.join('docs','repo-index','index.json')}`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
