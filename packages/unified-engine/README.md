# Unified Engine (@mcp/unified-engine)

## Purpose

- A unified, hardware-aware AI engine router that can target remote (e.g., Gemini CLI) and local (e.g., llama.cpp, ONNX Runtime) backends.
- Starts simple (Gemini CLI) and leaves hooks for CUDA/ROCm/Vulkan/DirectML accelerated local engines.

## Usage

- Programmatic:

  const r = new UnifiedEngineRouter({ includeDirs: ['packages','docs','.vscode'] });
  const res = await r.run({ prompt: 'Summarize this repo' });
  console.log(res.output);

## Roadmap

- Hardware probes: CUDA/ROCm detection, Vulkan/DirectML probes
- Local engines: llama.cpp bindings, ONNX Runtime for GGUF/ONNX models
- Router: model-aware decisions, cost/latency heuristics, fallbacks
