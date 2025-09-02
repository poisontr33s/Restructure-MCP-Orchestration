# Codebase Overview

## Structure

- Root: monorepo tools (pnpm, turbo), shared scripts
- packages/
  - core: orchestration runtime
  - cli: entrypoints and orchestration commands
  - monitor: UI (Vite + React)
  - servers: MCP servers (base, duckduckgo, kraken, sequential-thinking)
  - shared: shared types, config, logger
- .vscode/: developer experience, tasks, MCP config (base + dynamic)
- docs/: session blueprint, session log, repo index, codebase map

## Flows

- Dev UI: run task "Dev: Monitor UI"
- Build All: run task "Build: All"
- MCP status/snapshots: tasks in .vscode
- Dynamic MCP: generate → use dynamic → restore base
- Session Log: append via tasks, JSONL in docs/session-log
- Unified Ops: scripts/ops.ps1 (index, mcp:gen, mcp:use-dyn, mcp:use-base, log:note, log:clip)

## Rituals

- Keep base configs immutable; prefer overlays for local session changes.
- Use env vars to enable providers; regenerate MCP when toggling.
- Log thoughts as you go; one JSONL line per idea/action.
