#!/usr/bin/env -S node --loader ts-node/esm
import { promises as fs } from 'node:fs';
import path from 'node:path';

interface PackageInfo {
  name?: string;
  version?: string;
  private?: boolean;
  scripts?: Record<string, string>;
  dir: string;
}
interface WorkflowInfo {
  name: string;
  file: string;
}

async function readJsonSafe(file: string) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function listDirRecursive(root: string, filter: (p: string, stat: any) => boolean) {
  const out: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(p);
      } else {
        const stat = await fs.stat(p);
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
  await fs.mkdir(outDir, { recursive: true });

  // Packages
  const pkgFiles = await listDirRecursive(
    repoRoot,
    (p) => /package\.json$/.test(p) && !/node_modules/.test(p)
  );
  const packages: PackageInfo[] = [];
  for (const f of pkgFiles) {
    const json = await readJsonSafe(f);
    if (!json) continue;
    packages.push({
      name: json.name,
      version: json.version,
      private: json.private,
      scripts: json.scripts,
      dir: path.relative(repoRoot, path.dirname(f)),
    });
  }
  packages.sort((a, b) => a.dir.localeCompare(b.dir));

  // Workflows
  const wfDir = path.join(repoRoot, '.github', 'workflows');
  let workflows: WorkflowInfo[] = [];
  try {
    const files = await fs.readdir(wfDir);
    workflows = files
      .filter((f) => /\.(ya?ml)$/.test(f))
      .map((f) => ({
        name: f.replace(/\.(ya?ml)$/, '').replace(/[-_]/g, ' '),
        file: path.join('.github', 'workflows', f),
      }));
  } catch {}

  // Create index JSON
  const index = { generatedAt: new Date().toISOString(), packages, workflows };
  await fs.writeFile(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));

  // Minimal README
  const readme = `# Repo Index\n\n- Generated: ${new Date().toISOString()}\n- Packages: ${packages.length}\n- Workflows: ${workflows.length}\n\nSee index.json for details.`;
  await fs.writeFile(path.join(outDir, 'README.md'), readme);

  console.log(`Wrote ${path.join('docs', 'repo-index', 'index.json')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
