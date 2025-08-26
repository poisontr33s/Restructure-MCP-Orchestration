export * from './engines';
export * from './hardware';
export * from './engine-gemini-cli';

import type { Engine, EngineRequest, EngineResponse } from './engines';
import { detectHardware } from './hardware';
import { GeminiCliEngine } from './engine-gemini-cli';

export type RoutingDecision = {
  engineId: string;
  reason: string;
};

export class UnifiedEngineRouter {
  private engines: Engine[] = [];
  constructor(opts?: { includeDirs?: string[] }) {
    this.engines.push(new GeminiCliEngine(opts?.includeDirs));
  }

  async detect() {
    return detectHardware();
  }

  decide(_req: EngineRequest): RoutingDecision {
    // For now, always use Gemini CLI; later factor in hardware, model hints, locality
    return { engineId: 'gemini-cli', reason: 'default' };
  }

  async run(req: EngineRequest): Promise<EngineResponse> {
    const choice = this.decide(req);
    const engine = this.engines.find((e) => e.id === choice.engineId)!;
    return engine.run(req);
  }
}
