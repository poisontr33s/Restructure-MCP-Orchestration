applyTo: "/packages/cli/\*\*"

CLI rules

- Single entry (`src/index.ts`) wiring; delegate logic to `@restructure/core`.
- Keep prompts and IO isolated; make commands testable.
- Ship minimal deps; lazy-import heavy modules.
