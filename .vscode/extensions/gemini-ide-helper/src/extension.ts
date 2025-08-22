import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

class GeminiCliViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'geminiCli.chatView';
  private _view?: vscode.WebviewView;
  private terminal?: vscode.Terminal;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtml();
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'run') {
        await this.runPrompt(msg.prompt as string);
      }
    });
  }

  private getHtml() {
    const css = `body{font-family:var(--vscode-font-family);padding:10px} .row{display:flex;gap:6px;margin-top:8px} input{flex:1;padding:6px;border-radius:4px;border:1px solid var(--vscode-input-border)} button{padding:6px 12px} pre{background:var(--vscode-editor-background);color:var(--vscode-editor-foreground);padding:8px;border-radius:6px;overflow:auto}`;
    const banner = `
<pre>
  ▄████  ▓█████  ███▄ ▄███▓ ██▓ ███▄    █  ██▓
 ██▒ ▀█▒ ▓█   ▀ ▓██▒▀█▀ ██▒▓██▒ ██ ▀█   █ ▓██▒
▒██░▄▄▄░ ▒███   ▓██    ▓██░▒██▒▓██  ▀█ ██▒▒██▒
░▓█  ██▓ ▒▓█  ▄ ▒██    ▒██ ░██░▓██▒  ▐▌██▒░██░
░▒▓███▀▒ ░▒████▒▒██▒   ░██▒░██░▒██░   ▓██░░██░
 ░▒   ▒  ░░ ▒░ ░░ ▒░   ░  ░░▓  ░ ▒░   ▒ ▒ ░▓  
  ░   ░   ░ ░  ░░  ░      ░ ▒ ░░ ░░   ░ ▒░ ▒ ░
░ ░   ░     ░   ░      ░    ▒ ░   ░   ░ ░  ▒ ░
      ░     ░  ░       ░    ░           ░  ░  
</pre>`;
    const tips = `<div>Tips for getting started:<ol><li>Ask questions, edit files, or run commands.</li><li>Be specific for the best results.</li><li>Use @path/to/file to include file contents.</li></ol></div>`;
    return `<!DOCTYPE html><html><head><style>${css}</style></head><body>
      ${banner}
      ${tips}
      <div class="row"><input id="prompt" placeholder="Type your message or @path/to/file" />
      <button id="run">Send</button></div>
      <div id="hint" style="margin-top:6px;color:var(--vscode-descriptionForeground)">Uses your terminal: gemini --include-directories …</div>
      <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('run').addEventListener('click', () => {
          const prompt = document.getElementById('prompt').value;
          vscode.postMessage({ type:'run', prompt });
        });
        document.getElementById('prompt').addEventListener('keydown', (e)=>{
          if(e.key==='Enter'){ document.getElementById('run').click(); }
        })
      </script>
    </body></html>`;
  }

  private async runPrompt(prompt: string) {
    if (!prompt?.trim()) { return; }
    let finalPrompt = prompt;
    if (prompt.trim().startsWith('@')) {
      const raw = prompt.trim().slice(1);
      try {
        const root = vscode.workspace.workspaceFolders?.[0]?.uri;
        const uri = raw.startsWith('/') || raw.match(/^[A-Za-z]:\\/) ? vscode.Uri.file(raw) : vscode.Uri.joinPath(root!, raw);
        const content = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf8');
        finalPrompt = `Please analyze this file and assist accordingly.\n\nFile: ${uri.fsPath}\n\n${content}`;
      } catch (e) {
        vscode.window.showWarningMessage('Could not read file: ' + raw);
      }
    }
    const include = getIncludeDirs().join(',');
    const cmd = `gemini --include-directories ${include} -p ${JSON.stringify(finalPrompt)}`;
    if (!this.terminal) {
      this.terminal = vscode.window.createTerminal({ name: 'Gemini CLI' });
    }
    this.terminal.show(true);
    this.terminal.sendText(cmd, true);
  }
}

function runGeminiCapture(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    const include = getIncludeDirs().join(',');
    const args = ['--include-directories', include, '-p', prompt];
    const child = child_process.spawn('gemini', args, { env: withEnvPath('gemini'), cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath, shell: process.platform === 'win32' });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => out += d.toString());
    child.stderr.on('data', (d) => err += d.toString());
    child.on('close', () => resolve(out || err));
  });
}

const output = vscode.window.createOutputChannel('Gemini CLI');

function extractFirstFencedCodeBlock(text: string): { code: string, lang?: string } | undefined {
  const match = text.match(/```(\w+)?\n([\s\S]*?)```/);
  if (match) { return { lang: match[1], code: match[2] }; }
  return undefined;
}

function getIncludeDirs(): string[] {
  const cfg = vscode.workspace.getConfiguration('geminiIde');
  const dirs = cfg.get<string[]>('includeDirectories') || ['packages','scripts','docs','.vscode'];
  return dirs;
}

function buildCommand(): string {
  const dirs = getIncludeDirs().join(',');
  return `gemini --ide-mode-feature --include-directories ${dirs}`;
}

function withEnvPath(cmd: string) {
  const cfg = vscode.workspace.getConfiguration('geminiIde');
  const prefix = cfg.get<string>('envPathPrefix') || '';
  const env = { ...process.env } as any;
  if (prefix && env.Path && !String(env.Path).startsWith(prefix)) {
    env.Path = `${prefix};${env.Path}`;
  }
  return env;
}

async function runShell(cmd: string, options?: child_process.SpawnOptionsWithoutStdio) {
  return new Promise<void>((resolve) => {
    const child = child_process.spawn(process.platform === 'win32' ? 'pwsh' : 'bash',
      process.platform === 'win32' ? ['-NoProfile','-Command', cmd] : ['-lc', cmd],
      { cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath, env: withEnvPath(cmd), ...options });
    child.on('close', () => resolve());
  });
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new GeminiCliViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(GeminiCliViewProvider.viewId, provider)
  );

  const start = vscode.commands.registerCommand('geminiIde.start', async () => {
    await runShell(buildCommand());
    vscode.window.showInformationMessage('Gemini IDE Mode started');
  });

  const restart = vscode.commands.registerCommand('geminiIde.restart', async () => {
    const killCmd = `$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'gemini' }; if ($procs) { $procs | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch {} } }`;
    await runShell(`${killCmd}; ${buildCommand()}`);
    vscode.window.showInformationMessage('Gemini IDE Mode restarted');
  });

  const kill = vscode.commands.registerCommand('geminiIde.kill', async () => {
    const killCmd = `$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'gemini' }; if ($procs) { $procs | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch {} }; Write-Host ("Killed " + $procs.Count + " gemini process(es).") } else { Write-Host 'No gemini processes found.' }`;
    await runShell(killCmd);
  });

  const status = vscode.commands.registerCommand('geminiIde.status', async () => {
    await runShell(`Write-Host 'GEMINI_API_KEY:' ([bool]$env:GEMINI_API_KEY); try { gemini --version } catch { Write-Error 'gemini not on PATH' }`);
  });

  const openView = vscode.commands.registerCommand('geminiCli.openView', async () => {
    await vscode.commands.executeCommand('workbench.view.explorer');
    await vscode.commands.executeCommand('workbench.views.service.openView', GeminiCliViewProvider.viewId);
  });

  // Ask about current selection
  const askSelection = vscode.commands.registerCommand('geminiCli.askSelection', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return vscode.window.showWarningMessage('No active editor'); }
    const selection = editor.document.getText(editor.selection.isEmpty ? new vscode.Range(0,0, editor.document.lineCount, 0) : editor.selection);
    const instruction = await vscode.window.showInputBox({ prompt: 'Ask Gemini about this selection/file', value: 'Explain, improve, or fix' });
    if (instruction === undefined) return;
    const prompt = `${instruction}\n\nSelected Content:\n\n${selection}`;
    output.appendLine('> ' + instruction);
    const res = await runGeminiCapture(prompt);
    output.appendLine(res.trim());
    output.show(true);
    const code = extractFirstFencedCodeBlock(res);
    if (code) {
      await context.globalState.update('geminiCli.lastCodeblock', code);
    }
  });

  // Ask about entire active file
  const askFile = vscode.commands.registerCommand('geminiCli.askFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return vscode.window.showWarningMessage('No active editor'); }
    const content = editor.document.getText();
    const instruction = await vscode.window.showInputBox({ prompt: 'Ask Gemini about this file', value: 'Summarize and suggest improvements' });
    if (instruction === undefined) return;
    const prompt = `${instruction}\n\nFile: ${editor.document.fileName}\n\n${content}`;
    output.appendLine('> ' + instruction);
    const res = await runGeminiCapture(prompt);
    output.appendLine(res.trim());
    output.show(true);
    const code = extractFirstFencedCodeBlock(res);
    if (code) {
      await context.globalState.update('geminiCli.lastCodeblock', code);
    }
  });

  // Apply last fenced code block to current selection (replace)
  const applyLast = vscode.commands.registerCommand('geminiCli.applyLastCodeblock', async () => {
    const data = context.globalState.get<{ code: string, lang?: string }>('geminiCli.lastCodeblock');
    if (!data) { return vscode.window.showWarningMessage('No code block available from last response'); }
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return vscode.window.showWarningMessage('No active editor'); }
    await editor.edit((eb) => {
      const sel = editor.selection;
      eb.replace(sel.isEmpty ? new vscode.Range(0,0, editor.document.lineCount, 0) : sel, data.code);
    });
  });

  context.subscriptions.push(start, restart, kill, status, openView, askSelection, askFile, applyLast);

  const auto = vscode.workspace.getConfiguration('geminiIde').get<boolean>('autoStartOnOpen');
  if (auto) {
    setTimeout(() => vscode.commands.executeCommand('geminiIde.start'), 1000);
  }
}

export function deactivate() {}
