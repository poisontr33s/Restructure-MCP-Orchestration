import type { Engine, EngineRequest, EngineResponse } from './engines';
import { spawn } from 'child_process';

function execGemini(prompt: string, includeDirs: string[]): Promise<string> {
  return new Promise((resolve) => {
    const args = ['--include-directories', includeDirs.join(','), '-p', prompt];
    const child = spawn('gemini', args, { shell: process.platform === 'win32' });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('close', () => resolve(out || err));
  });
}

export class GeminiCliEngine implements Engine {
  id = 'gemini-cli';
  kind: 'remote' | 'local' = 'remote';
  constructor(private includeDirs: string[] = ['packages', 'scripts', 'docs', '.vscode']) {}
  supports(_req: EngineRequest): boolean {
    return true;
  }
  async run(req: EngineRequest): Promise<EngineResponse> {
    const merged = [...this.includeDirs];
    const out = await execGemini(req.prompt, merged);
    return { output: out.trim(), meta: { engine: this.id } };
  }
}
