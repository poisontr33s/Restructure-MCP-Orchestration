import * as vscode from 'vscode';
// Replace Node ESM imports to avoid requiring @types/node
declare const require: any;
const fs: any = require('fs');
const path: any = require('path');
// no node:crypto to avoid type dependency; use a small local hash instead

function computeProblemsSignature(items: Array<{file: string, problems: any[]}>): string {
  // Normalize deterministically and hash with djb2
  const norm = items
    .map(x => ({
      file: x.file,
      problems: [...x.problems]
        .map(p => ({
          message: p.message,
          severity: p.severity,
          start: { line: p.range?.start?.line, character: p.range?.start?.character },
          end: { line: p.range?.end?.line, character: p.range?.end?.character },
          source: p.source || '',
          code: p.code || ''
        }))
        .sort((a,b) => (a.severity+''+a.source+''+a.message).localeCompare(b.severity+''+b.source+''+b.message))
    }))
    .sort((a,b) => a.file.localeCompare(b.file));
  const json = JSON.stringify(norm);
  let hash = 5381;
  for (let i = 0; i < json.length; i++) {
    hash = ((hash << 5) + hash) + json.charCodeAt(i);
    hash = hash | 0; // force 32-bit
  }
  return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
}

function getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
  const ws = vscode.workspace.workspaceFolders;
  return ws && ws.length > 0 ? ws[0] : undefined;
}

async function dumpProblems(): Promise<string> {
  const ws = getWorkspaceFolder();
  if (!ws) { throw new Error('No workspace open'); }
  const diagnostics: ReadonlyArray<[vscode.Uri, readonly vscode.Diagnostic[]]> = vscode.languages.getDiagnostics();
  const items = diagnostics.map(([uri, diags]: [vscode.Uri, readonly vscode.Diagnostic[]]) => ({
    file: uri.fsPath,
    problems: (diags as readonly vscode.Diagnostic[]).map((d: vscode.Diagnostic) => ({
      message: d.message,
      severity: ['Error','Warning','Info','Hint'][d.severity] || String(d.severity),
      range: { start: d.range.start, end: d.range.end },
      source: d.source,
      code: typeof d.code === 'object' ? d.code.value : d.code,
    }))
  })).filter((x: any) => x.problems.length > 0);

  const outDir = path.join(ws.uri.fsPath, 'docs', 'session-log');
  await fs.promises.mkdir(outDir, { recursive: true });
  const signature = computeProblemsSignature(items as any);
  const outPath = path.join(outDir, `problems-${Date.now()}.json`);
  await fs.promises.writeFile(outPath, JSON.stringify({ when: new Date().toISOString(), signature, items }, null, 2));
  return outPath;
}

async function dumpTerminals(): Promise<string> {
  const ws = getWorkspaceFolder();
  if (!ws) { throw new Error('No workspace open'); }
  const outDir = path.join(ws.uri.fsPath, 'docs', 'session-log');
  await fs.promises.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `terminals-${Date.now()}.json`);
  const terms = vscode.window.terminals.map((t: vscode.Terminal) => ({ name: t.name, creationOptions: t.creationOptions }));
  await fs.promises.writeFile(outPath, JSON.stringify({ when: new Date().toISOString(), terminals: terms }, null, 2));
  return outPath;
}

async function dumpTasks(): Promise<string> {
  const ws = getWorkspaceFolder();
  if (!ws) { throw new Error('No workspace open'); }
  const outDir = path.join(ws.uri.fsPath, 'docs', 'session-log');
  await fs.promises.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `tasks-${Date.now()}.json`);
  const executions = vscode.tasks.taskExecutions;
  const running = executions.map(ex => {
    const t = ex.task;
    return {
      name: t.name,
      source: t.source,
      scope: typeof t.scope === 'object' ? (t.scope as any).name || 'workspace' : t.scope,
      definition: t.definition,
      detail: t.detail,
    };
  });
  await fs.promises.writeFile(outPath, JSON.stringify({ when: new Date().toISOString(), running }, null, 2));
  return outPath;
}

async function dumpEditors(): Promise<string> {
  const ws = getWorkspaceFolder();
  if (!ws) { throw new Error('No workspace open'); }
  const outDir = path.join(ws.uri.fsPath, 'docs', 'session-log');
  await fs.promises.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `editors-${Date.now()}.json`);
  const editors = vscode.window.visibleTextEditors.map(ed => ({
    file: ed.document.uri.fsPath,
    languageId: ed.document.languageId,
    isDirty: ed.document.isDirty,
    selections: ed.selections.map(s => ({ start: s.start, end: s.end })),
  }));
  await fs.promises.writeFile(outPath, JSON.stringify({ when: new Date().toISOString(), editors }, null, 2));
  return outPath;
}

export function activate(context: vscode.ExtensionContext) {
  // Lightweight MCP status indicator: shows enabled server count vs budget
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  status.name = 'MCP';
  status.command = undefined;
  context.subscriptions.push(status);

  async function updateMcpStatus() {
    try {
      const ws = getWorkspaceFolder();
      if (!ws) { status.hide(); return; }
      const mcpPath = path.join(ws.uri.fsPath, '.vscode', 'mcp.json');
      const policyPath = path.join(ws.uri.fsPath, '.vscode', 'mcp.policy.json');
      const hasMcp = fs.existsSync(mcpPath);
      const hasPolicy = fs.existsSync(policyPath);
      if (!hasMcp) { status.hide(); return; }
      const cfg = JSON.parse(await fs.promises.readFile(mcpPath, 'utf8'));
      const srv = cfg?.servers ? Object.keys(cfg.servers) : [];
      let budget = 0;
      if (hasPolicy) {
        try {
          const pol = JSON.parse(await fs.promises.readFile(policyPath, 'utf8'));
          budget = Number(pol?.maxDynamicServers) || 0;
        } catch {}
      }
      status.text = `$(server) MCP ${srv.length}${budget>0?('/'+budget):''}`;
      status.tooltip = new vscode.MarkdownString(`Enabled servers: ${srv.join(', ') || 'none'}\n\nClick to regenerate dynamic config.`);
      status.command = {
        title: 'Generate Dynamic MCP',
        command: 'workbench.action.tasks.runTask',
        arguments: ['MCP: Generate Dynamic Config']
      } as any;
      status.show();
    } catch {
      status.hide();
    }
  }

  void updateMcpStatus();
  const fileWatcher = vscode.workspace.createFileSystemWatcher('**/.vscode/mcp*.json');
  context.subscriptions.push(
    fileWatcher.onDidCreate(updateMcpStatus),
    fileWatcher.onDidChange(updateMcpStatus),
    fileWatcher.onDidDelete(updateMcpStatus)
  );

  function getProblemsItems(): Array<{file: string, problems: any[]}> {
    const diagnostics: ReadonlyArray<[vscode.Uri, readonly vscode.Diagnostic[]]> = vscode.languages.getDiagnostics();
    return diagnostics.map(([uri, diags]: [vscode.Uri, readonly vscode.Diagnostic[]]) => ({
      file: uri.fsPath,
      problems: (diags as readonly vscode.Diagnostic[]).map((d: vscode.Diagnostic) => ({
        message: d.message,
        severity: ['Error','Warning','Info','Hint'][d.severity] || String(d.severity),
        range: { start: d.range.start, end: d.range.end },
        source: d.source,
        code: typeof d.code === 'object' ? d.code.value : d.code,
      }))
    })).filter((x: any) => x.problems.length > 0);
  }

  function computeCombinedSignature(): string {
    const items = getProblemsItems();
    const problemsSig = computeProblemsSignature(items as any);
    const terms = vscode.window.terminals.map(t => t.name).sort();
  const editors = vscode.window.visibleTextEditors.map(ed => ({ file: ed.document.uri.fsPath, lang: ed.document.languageId, dirty: ed.document.isDirty })).sort((a: any,b: any) => a.file.localeCompare(b.file));
  const dbg: any = (vscode as any).debug;
  const sessions = Array.isArray(dbg?.sessions) ? dbg.sessions.map((s: any) => ({ name: s?.name, type: s?.type })).sort((a: any,b: any) => (String(a.type)+String(a.name)).localeCompare(String(b.type)+String(b.name))) : [];
  const bps = Array.isArray((vscode as any).debug?.breakpoints) ? ((vscode as any).debug.breakpoints as any[]).length : vscode.debug.breakpoints.length;
  const scmAny: any = (vscode as any).scm;
  const repos = Array.isArray(scmAny?.repositories) ? scmAny.repositories.map((r: any) => ({ label: r?.provider?.label, root: r?.rootUri?.fsPath || '' })).sort((a: any,b: any) => (String(a.label)+String(a.root)).localeCompare(String(b.label)+String(b.root))) : [];
  const payload = { problemsSig, terms, editors, sessions, breakpoints: bps, repos };
    const json = JSON.stringify(payload);
    // djb2 hash
    let hash = 5381;
    for (let i = 0; i < json.length; i++) { hash = ((hash << 5) + hash) + json.charCodeAt(i); hash |= 0; }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  const cmd = vscode.commands.registerCommand('problemsLogger.dump', async () => {
    try {
      const [p, t, k, e] = await Promise.all([dumpProblems(), dumpTerminals(), dumpTasks(), dumpEditors()]);
      // Write combined summary
      const ws = getWorkspaceFolder();
      if (ws) {
        const outDir = path.join(ws.uri.fsPath, 'docs', 'session-log');
        const combined = path.join(outDir, `snapshot-${Date.now()}.json`);
        await fs.promises.writeFile(combined, JSON.stringify({
          when: new Date().toISOString(),
          files: {
            problems: path.basename(p),
            terminals: path.basename(t),
            tasks: path.basename(k),
            editors: path.basename(e)
          }
        }, null, 2));
      }
      vscode.window.showInformationMessage(`Problems/Terminals/Tasks/Editors dumped.`);
    } catch (e:any) {
      vscode.window.showErrorMessage(`Problems Logger failed: ${e.message || e}`);
    }
  });
  context.subscriptions.push(cmd);

  const dumpIfChanged = vscode.commands.registerCommand('problemsLogger.dumpIfChanged', async () => {
    try {
      const ws = getWorkspaceFolder();
      if (!ws) { return; }
  const conf = vscode.workspace.getConfiguration('problemsLogger');
  const scope = (conf.get<string>('changeDetectionScope') || 'problems');
  const sig = scope === 'combined' ? computeCombinedSignature() : computeProblemsSignature(getProblemsItems() as any);
      const key = 'problemsLogger.lastSig';
      const last = context.globalState.get<string>(key);
      if (last !== sig) {
        const full = vscode.workspace.getConfiguration('problemsLogger').get<boolean>('autoDumpFullSnapshot') === true;
        if (full) {
          await Promise.all([dumpProblems(), dumpTerminals(), dumpTasks(), dumpEditors()]);
        } else {
          await dumpProblems();
        }
        await context.globalState.update(key, sig);
        const outDir = path.join(ws.uri.fsPath, 'docs', 'session-log');
        await fs.promises.mkdir(outDir, { recursive: true });
        await fs.promises.writeFile(path.join(outDir, 'last-problems-sig.json'), JSON.stringify({ when: new Date().toISOString(), signature: sig }, null, 2));
        vscode.window.showInformationMessage('Problems changed — snapshot dumped.');
      } else {
        vscode.window.showInformationMessage('Problems unchanged — no dump.');
      }
    } catch (e:any) {
      vscode.window.showErrorMessage(`Problems Logger dumpIfChanged failed: ${e.message || e}`);
    }
  });
  context.subscriptions.push(dumpIfChanged);

  // Intelligent auto-dump: debounce + signature-based change detection
  let timer: ReturnType<typeof setTimeout> | undefined;
  const scheduleAutoDump = () => {
    const conf = vscode.workspace.getConfiguration('problemsLogger');
    if (conf.get('autoDumpOnChange') === true) {
      const cooldown = Number(conf.get('autoDumpCooldownMs')) || 2000; // default 2s
      const detect = conf.get('changeDetectionEnabled') !== false; // default true
      const scope = (conf.get<string>('changeDetectionScope') || 'problems');
      if (timer) { clearTimeout(timer); }
      timer = setTimeout(async () => {
        try {
          const ws = getWorkspaceFolder();
          if (!ws) { return; }
          if (detect) {
            const sig = scope === 'combined' ? computeCombinedSignature() : computeProblemsSignature(getProblemsItems() as any);
            const key = 'problemsLogger.lastSig';
            const last = context.globalState.get<string>(key);
            if (last === sig) { return; }
            await dumpProblems();
            await context.globalState.update(key, sig);
            const outDir = path.join(ws.uri.fsPath, 'docs', 'session-log');
            await fs.promises.mkdir(outDir, { recursive: true });
            await fs.promises.writeFile(path.join(outDir, 'last-problems-sig.json'), JSON.stringify({ when: new Date().toISOString(), signature: sig }, null, 2));
          } else {
            await dumpProblems();
          }
        } catch { /* swallow */ }
      }, cooldown);
    }
  };

  const subDiag = vscode.languages.onDidChangeDiagnostics(scheduleAutoDump);
  const subEditors = vscode.window.onDidChangeVisibleTextEditors(scheduleAutoDump);
  const subTermOpen = vscode.window.onDidOpenTerminal(scheduleAutoDump);
  const subTermClose = vscode.window.onDidCloseTerminal(scheduleAutoDump);
  context.subscriptions.push(subDiag, subEditors, subTermOpen, subTermClose);
}

export function deactivate() {}
