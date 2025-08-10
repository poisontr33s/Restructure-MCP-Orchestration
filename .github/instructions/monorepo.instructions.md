applyTo: "/**"

Monorepo guardrails
- Use pnpm only; no npm. Clean rogue node_modules and package-lock.json.
- Shared dev tooling and scripts live at the root `package.json`.
- Packages keep only unique runtime deps; lean devDeps.
- Run via Turbo scripts at root; per-package scripts only when necessary.

