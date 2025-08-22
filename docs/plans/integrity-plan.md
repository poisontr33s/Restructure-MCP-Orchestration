# Orchestration Integrity Plan (current, temporary)

Date: 2025-08-11
Repo: Restructure-MCP-Orchestration (branch: poisontr33s/issue46)

This plan is a granular, prerequisite-aware sequence designed to keep the repo stable while enabling fast iteration. It mirrors the current snapshot and aligns with our “Captain’s Code” rituals.

## 0) Baseline context

- Tooling: pnpm monorepo + turbo, TypeScript packages, Vite React UI.
- MCP: baseline `.vscode/mcp.json` + dynamic generator `.vscode/scripts/generate-mcp-config.ps1` with policy `.vscode/mcp.policy.json`.
- Logging: `docs/session-log/session.jsonl` with auto-logging scripts.
- Indexers: `scripts/index-repo.js` and `scripts/index-repo-fast.js`.

- New guardrails in this pass:
  - Session log schema + validator + fixer.
  - “fast index”, “verify providers”, “validate/fix session log”, “health: quick scan” tasks.
  - Optional: disabled MCP discovery in settings.

## 1) Session log integrity (prevents chaos loops)

1. Validate log
   - Task: Validate: Session Log (node scripts/validate-session-log.js)
   - Fails if entries lack: timestamp (ISO), topic, summary, actor.
2. Auto-fix on failure
   - Task: Fix: Session Log (PowerShell) – backs up and repairs minimal fields; preserves details raw when JSON invalid.
3. Re-validate until green
   - Rationale: keeps journal machine-parseable for agents and tooling.

## 2) MCP config determinism

1. Generate dynamic config
   - Task: MCP: Generate Dynamic Config – emits .vscode/mcp.generated.json from policy + env/commands.
2. Swap to dynamic or base
   - Tasks: MCP: Use Dynamic / MCP: Use Base; snapshot is kept.
3. Disable auto discovery (optional, applied)
   - VS Code setting: "chat.mcp.discovery": false – prevents drift from implicit servers.

## 3) Provider setup and health

1. Verify providers
   - Task: Verify: Claude & Gemini – runs "claude doctor" and "gemini --version"; logs to session.
2. Install if missing
   - Tasks: Install: Claude Code (pnpm/native); Install: Gemini CLI (pnpm).
3. Re-verify
   - Ensures policy-eligible providers can be enabled by generator.

## 4) Index and codebase visibility

1. Index (fast)
   - Task: Index: Repo Catalog (fast) – cached; writes docs/repo-index/index.json.
2. Ops entrypoint
   - Task: Ops: Index Repo – alternative orchestration path.

## 5) Health: Quick Scan

- Composite task running: fast index, MCP config gen, PATH check (uv), provider verify, session log validation.
- Purpose: one-click status snapshot before/after changes.

## 6) Dependabot & monorepo hygiene

- Dependabot: .github/dependabot.yml with stanzas for root and each package (present as of this snapshot).
- pnpm ritual: never npm; remove package-lock.json and rogue node_modules if present.
- Optional guard task (future): fail CI if npm artifacts detected.

## 7) Workflow rhythm (suggested)

- Start day: Session: Auto Restore on Open → Health: Quick Scan.
- During dev: run fast index after structural changes; use Verify Providers when keys/CLIs change.
- Before PR: Validate Session Log; MCP: Generate Dynamic Config; optionally Use Base for reproducible review.

## Cross-check with current snapshot

- Session log validator initially failed on timestamp; auto-fix script created a backup and normalized entries.
- Fast index executed and updated docs/repo-index/index.json.
- Provider verification shows missing Claude/Gemini CLIs on this machine.
- settings.json updated to disable discovery (with proper comma fix).
- tasks.json now includes: fast index, verify providers, validate/fix session log, health quick scan.
- dependabot.yml covers root + packages (per attachment), aligned with the monorepo ritual.

## Next steps (optional)

- Add a CI job to run Health: Quick Scan on PRs.
- Add a guard task: “Guard: pnpm-only” to detect npm artifacts.
- Expand MCP policy to surface local servers once built artifacts exist.

---
This document is temporary; regenerate as the rituals evolve to keep parity with the session and codebase state.
