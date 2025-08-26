/* eslint-disable no-console, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports */
'use strict';
// Generates a lean tool selection recommendation for Copilot Chat based on current MCP config
// Output: docs/repo-index/lean-tools.md with a copy-paste checklist
const fs = require('fs');
const path = require('path');

function main() {
  const root = process.cwd();
  const mcpPath = path.join(root, '.vscode', 'mcp.json');
  let servers = [];
  try {
    const cfg = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    servers = Object.keys(cfg.servers || {});
  } catch (_) {
    /* ignore: missing mcp.json */
  }

  const builtins = [
    'Built-in: terminalSelection',
    'Built-in: usages',
    'Built-in: vscodeAPI',
    // optional:
    'Built-in: testFailure (optional)',
  ];

  const mcp = servers.map((k) => `MCP Server: ${k}`);

  const lines = [];
  lines.push('# Lean Copilot Chat Tools');
  lines.push('');
  lines.push('Use “Configure Tools” and keep the list under ~64. Start with these:');
  lines.push('');
  lines.push('## Keep');
  for (const b of builtins) lines.push(`- [x] ${b}`);
  if (mcp.length) {
    lines.push('');
    lines.push('### MCP servers (from .vscode/mcp.json)');
    for (const s of mcp) lines.push(`- [x] ${s}`);
  }
  lines.push('');
  lines.push('## Disable (unless actively needed)');
  lines.push('- [ ] Azure tool packs (Resource Graph, Load Testing, DevCenter, etc.)');
  lines.push('- [ ] CodeQL/advanced security packs while not auditing');
  lines.push('- [ ] Jupyter/Notebook tools if not using notebooks');
  lines.push("- [ ] Excess language packs or linters you don't use today");
  lines.push('- [ ] Redundant web/doc search tools if one provider suffices');
  lines.push('');
  lines.push(
    'Tip: After switching intents (tasks: “MCP: Intents …”), run “MCP: Generate Dynamic Config” so the MCP list stays small.'
  );

  const outDir = path.join(root, 'docs', 'repo-index');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'lean-tools.md');
  fs.writeFileSync(outFile, lines.join('\n'));
  console.log('Wrote', outFile);
}

main();
