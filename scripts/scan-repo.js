#!/usr/bin/env node
/* eslint-disable */
/*
  Repo Integrity Scanner
  - Finds duplicate files (by SHA1)
  - Flags rogue lockfiles (package-lock.json/yarn.lock)
  - Flags nested node_modules (pnpm monorepo should avoid per-package node_modules)
  - Lists large committed artifacts (>10MB) and dist/ build outputs
  - Compares devDependencies hoistability (duplicates matching root)
  - Heuristic unused/missing dependencies per package by scanning import/require
  - Writes reports: docs/repo-index/scan-report.json and scan-report.md
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { glob } = require('glob');

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'docs', 'repo-index');

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function sha1File(p) {
  const stat = fs.statSync(p);
  if (!stat.isFile()) return null;
  const MAX = 25 * 1024 * 1024; // 25MB
  if (stat.size > MAX) return null;
  const h = crypto.createHash('sha1');
  h.update(fs.readFileSync(p));
  return h.digest('hex');
}

function isBinaryByExt(p) {
  const ext = path.extname(p).toLowerCase();
  const binExt = new Set(['.png','.jpg','.jpeg','.gif','.webp','.svg','.ico','.pdf','.zip','.7z','.gz','.mp4','.mp3','.wav','.exe','.dll']);
  return binExt.has(ext);
}

function topN(arr, n, key) {
  return [...arr].sort((a,b)=>b[key]-a[key]).slice(0,n);
}

function aggregateFolderSizes(paths, entries) {
  const folderMap = new Map();
  function addSize(key, size) {
    const prev = folderMap.get(key) || 0;
    folderMap.set(key, prev + size);
  }
  for (const e of entries) {
    const parts = e.path.split('/');
    if (!parts.length) continue;
    const top = parts[0];
    addSize(top, e.size);
    if (parts[0] === 'packages' && parts.length >= 2) {
      addSize(`packages/${parts[1]}`, e.size);
    }
  }
  return [...folderMap.entries()].map(([key, size]) => ({ folder: key, size })).sort((a,b)=>b.size-a.size);
}

function computeOutliers(items) {
  if (!items.length) return { median: 0, mad: 0, outliers: [] };
  const sizes = items.map(x=>x.size).slice().sort((a,b)=>a-b);
  const median = sizes[Math.floor(sizes.length/2)];
  const deviations = sizes.map(v => Math.abs(v - median));
  const mad = deviations.sort((a,b)=>a-b)[Math.floor(deviations.length/2)] || 1;
  const outliers = items.filter(x => (Math.abs(x.size - median) / mad) >= 6); // 6*MAD ~ ~4.5 sigma
  return { median, mad, outliers };
}

async function main() {
  const ignore = [
    '**/.git/**','**/.turbo/**','**/.cache/**','**/.DS_Store','**/.vscode/**',
    '**/node_modules/**','**/dist/**','**/build/**','**/coverage/**',
    'docs/repo-index/snapshot.json'
  ];
  const files = await glob('**/*', { nodir: true, ignore });

  // Gather file stats
  const entries = files.map(p => {
    const full = path.join(ROOT, p);
    const s = fs.statSync(full);
    return { path: p.replace(/\\/g,'/'), size: s.size, mtime: s.mtimeMs, isBinary: isBinaryByExt(p) };
  });

  // Duplicates by SHA1 (exclude very small < 64 bytes and >25MB)
  const hashMap = new Map();
  for (const e of entries) {
    if (e.size < 64) continue;
    const full = path.join(ROOT, e.path);
    const h = sha1File(full);
    if (!h) continue;
    if (!hashMap.has(h)) hashMap.set(h, []);
    hashMap.get(h).push(e.path);
  }
  const duplicates = [...hashMap.entries()].filter(([,list]) => list.length > 1)
    .map(([hash, list]) => ({ hash, files: list }));

  // Rogue lockfiles and nested node_modules
  const rogueLockfiles = files.filter(p => /(^|\/)package-lock\.json$/.test(p) || /(^|\/)yarn\.lock$/.test(p));
  const nestedNodeModules = await glob('**/node_modules/**', { nodir: true, ignore: ['node_modules/**','.git/**'] });
  const nestedByPkg = [...new Set(nestedNodeModules.map(p => p.split('/node_modules/')[0])).values()]
    .filter(p => p && p !== 'node_modules' && p !== '.');

  // Large files and dist artifacts
  const LARGE = 10 * 1024 * 1024; // 10MB
  const HUGE = 1024 * 1024 * 1024; // 1GB
  const largeFiles = entries.filter(e => e.size >= LARGE).sort((a,b)=>b.size-a.size);
  const distDirs = [...new Set(files.filter(f => /(^|\/)dist\//.test(f)).map(f => f.split('/dist/')[0]))];

  // Size census (include dist/build, exclude node_modules/.git)
  const sizeFiles = await glob('**/*', { nodir: true, ignore: ['**/.git/**','**/.turbo/**','**/.cache/**','**/.DS_Store','**/.vscode/**','**/node_modules/**'] });
  const sizeEntries = sizeFiles.map(p => {
    const full = path.join(ROOT, p);
    const s = fs.statSync(full);
    return { path: p.replace(/\\/g,'/'), size: s.size };
  });
  const folderSizes = aggregateFolderSizes(sizeFiles, sizeEntries);
  const { median, mad, outliers } = computeOutliers(folderSizes);
  const hugeFiles = sizeEntries.filter(e => e.size >= HUGE).sort((a,b)=>b.size-a.size);

  // Packages analysis
  const rootPkg = readJSON(path.join(ROOT,'package.json')) || {};
  const pkgs = await glob('packages/*/package.json');
  const packageReports = [];

  // Build map of imports per package
  const importRe = /(?:import\s+[^'"`]+\s+from\s+['"]([^.'"`][^'"`]+)['"]|require\(\s*['"]([^.'"`][^'"`]+)['"]\s*\))/g;

  for (const pkgJsonPath of pkgs) {
    const pkgDir = path.dirname(pkgJsonPath);
    const pkg = readJSON(path.join(ROOT, pkgJsonPath)) || {};
    const devDupes = [];
    if (rootPkg.devDependencies && pkg.devDependencies) {
      for (const [name, ver] of Object.entries(pkg.devDependencies)) {
        if (rootPkg.devDependencies[name] && rootPkg.devDependencies[name] === ver) {
          devDupes.push({ name, version: ver });
        }
      }
    }
    // Imports used
    const pkgFiles = await glob(['**/*.{ts,tsx,js,jsx}'], { cwd: path.join(ROOT, pkgDir), nodir: true, ignore: ['**/dist/**','**/build/**','**/node_modules/**'] });
    const used = new Set();
    for (const rel of pkgFiles) {
      const full = path.join(ROOT, pkgDir, rel);
      try {
        const text = fs.readFileSync(full, 'utf8');
        let m;
        while ((m = importRe.exec(text))) {
          const name = m[1] || m[2];
          if (name) used.add(name.split('/')[0] === '@' ? name.split('/').slice(0,2).join('/') : name.split('/')[0]);
        }
  } catch { /* ignore unreadable file */ }
    }
    const declared = new Set([ ...Object.keys(pkg.dependencies||{}), ...Object.keys(pkg.devDependencies||{}) ]);
    const unused = [...declared].filter(d => !used.has(d) && !d.startsWith('@types/'));
    const missing = [...used].filter(u => !declared.has(u) && !(rootPkg.dependencies||{})[u] && !(rootPkg.devDependencies||{})[u]);

    packageReports.push({
      package: pkg.name || path.basename(pkgDir),
      dir: pkgDir.replace(/\\/g,'/'),
      devDepDuplicatesWithRoot: devDupes,
      unusedDeclared: unused,
      missingDeclared: missing,
    });
  }

  // Markdown duplicates
  const mdFiles = await glob('**/*.md', { ignore });
  const mdHashMap = new Map();
  for (const p of mdFiles) {
    const h = sha1File(path.join(ROOT, p));
    if (!h) continue;
    if (!mdHashMap.has(h)) mdHashMap.set(h, []);
    mdHashMap.get(h).push(p);
  }
  const mdDuplicates = [...mdHashMap.entries()].filter(([,list]) => list.length > 1)
    .map(([hash, files]) => ({ hash, files }));

  const report = {
    meta: { when: new Date().toISOString() },
    counts: { files: entries.length, duplicates: duplicates.length, mdDuplicates: mdDuplicates.length },
    duplicates,
    mdDuplicates,
    rogueLockfiles,
    nestedNodeModulesRoots: nestedByPkg,
    largeFiles: topN(largeFiles, 50, 'size'),
    distDirs,
    packages: packageReports,
    sizeCensus: {
      folderSizes,
      stats: { median, mad },
      outliers,
      thresholds: { LARGE, HUGE }
    },
    hugeFiles
  };

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'scan-report.json'), JSON.stringify(report, null, 2));

  // Markdown summary
  const md = [];
  md.push('# Repository Scan Report');
  md.push(`- Generated: ${report.meta.when}`);
  md.push(`- Files scanned: ${report.counts.files}`);
  md.push('');
  md.push('## Duplicates');
  md.push(`- File duplicates: ${report.duplicates.length}`);
  if (report.duplicates.length) {
    for (const d of report.duplicates.slice(0, 20)) {
      md.push(`  - ${d.files.length} files share SHA1 ${d.hash}:`);
      d.files.slice(0,5).forEach(f => md.push(`    - ${f}`));
      if (d.files.length > 5) md.push('    - ...');
    }
  }
  md.push('');
  md.push('## Markdown Duplicates');
  md.push(`- Duplicates: ${report.mdDuplicates.length}`);
  md.push('');
  md.push('## Rogue Lockfiles');
  md.push(report.rogueLockfiles.length ? report.rogueLockfiles.map(p=>`- ${p}`).join('\n') : '- None');
  md.push('');
  md.push('## Nested node_modules (should not exist in pnpm monorepo)');
  md.push(report.nestedNodeModulesRoots.length ? report.nestedNodeModulesRoots.map(p=>`- ${p}`).join('\n') : '- None');
  md.push('');
  md.push('## Large Files (>10MB)');
  if (report.largeFiles.length) {
    for (const lf of report.largeFiles.slice(0, 50)) {
      md.push(`- ${lf.path} (${(lf.size/1024/1024).toFixed(2)} MB)`);
    }
  } else md.push('- None');
  md.push('');
  md.push('## Huge Files (>=1GB)');
  if (report.hugeFiles.length) {
    for (const hf of report.hugeFiles) {
      md.push(`- ${hf.path} (${(hf.size/1024/1024/1024).toFixed(2)} GB)`);
    }
  } else md.push('- None');
  md.push('');
  md.push('## Folder Size Census (includes dist/build, excludes node_modules/.git)');
  md.push('- Top 15 largest folders:');
  report.sizeCensus.folderSizes.slice(0,15).forEach(f => md.push(`  - ${f.folder} ${(f.size/1024/1024).toFixed(2)} MB`));
  md.push(`- Median: ${(report.sizeCensus.stats.median/1024/1024).toFixed(2)} MB, MAD: ${(report.sizeCensus.stats.mad/1024/1024).toFixed(2)} MB`);
  md.push('- Outliers (size far from median):');
  if (report.sizeCensus.outliers.length) {
    report.sizeCensus.outliers.forEach(o => md.push(`  - ${o.folder} ${(o.size/1024/1024).toFixed(2)} MB`));
  } else {
    md.push('  - None');
  }
  md.push('');
  md.push('## Dist/Build Directories in Repo');
  md.push(report.distDirs.length ? report.distDirs.map(d=>`- ${d}/dist`).join('\n') : '- None');
  md.push('');
  md.push('## Packages Audit');
  for (const p of report.packages) {
    md.push(`### ${p.package} (${p.dir})`);
    md.push(`- Dev dep duplicates with root: ${p.devDepDuplicatesWithRoot.length}`);
    if (p.devDepDuplicatesWithRoot.length) p.devDepDuplicatesWithRoot.slice(0,10).forEach(d=>md.push(`  - ${d.name}@${d.version}`));
    md.push(`- Unused declared deps: ${p.unusedDeclared.length}`);
    if (p.unusedDeclared.length) md.push('  - ' + p.unusedDeclared.slice(0,10).join(', '));
    md.push(`- Missing declared deps (used but not listed): ${p.missingDeclared.length}`);
    if (p.missingDeclared.length) md.push('  - ' + p.missingDeclared.slice(0,10).join(', '));
    md.push('');
  }

  fs.writeFileSync(path.join(OUT_DIR, 'scan-report.md'), md.join('\n'));
  process.stdout.write('Scan done ->\n');
  process.stdout.write(' - docs/repo-index/scan-report.json\n');
  process.stdout.write(' - docs/repo-index/scan-report.md\n');
}

main().catch(e => { process.stderr.write((e && e.stack) ? e.stack + '\n' : String(e) + '\n'); process.exit(1); });
