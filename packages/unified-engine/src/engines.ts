export type EngineRequest = {
  prompt: string;
  files?: Array<{ path: string; content: string }>;
  model?: string;
};

export type EngineResponse = {
  output: string;
  meta?: Record<string, unknown>;
};

export interface Engine {
  id: string;
  kind: 'remote' | 'local';
  supports(req: EngineRequest): boolean;
  run(req: EngineRequest): Promise<EngineResponse>;
}
