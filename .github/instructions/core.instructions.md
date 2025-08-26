applyTo: "/packages/core/\*\*"

Core package rules

- Type-safe APIs and shared logger utils only; no CLI/HTTP/UI code here.
- Keep public API stable; add tests for breaking changes.
- Use the root tsconfig base; avoid custom TS configs unless justified.
