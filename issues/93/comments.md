# Captain Guthilda Action Plan — Unified Merge + RC Strategy (pnpm-only)

This comment tracks the single, orchestrated path to unify the open work into one cohesive release candidate. Source refs: #91 #88 #84 #68 and PRs #92 #90 #89 #87 #86. pnpm-only is enforced throughout.

---

## 1) Merge Sequence (with gates)

- [ ] Foundation: pnpm + CI/CD baseline
  - [ ] PR #89 — pnpm-only enforcement + branch manager script fix (draft)
    - Gates: pnpm-lock.yaml updated; package-lock.json removed/ignored; scripts use pnpm; universal-branch-manager.sh OK
    - Action: Convert from draft → Ready for review once green
  - [ ] PR #90 — CI/CD fixes + M365 agents integration
    - Gates: All workflows standardized on pnpm; build matrix covers all packages; TS/ESLint clean; Tailwind v4 stable
  - [ ] Issue #91 — Validate and document infra (post-merge)
    - Gates: Confirm green CI across matrix; commit doc updates

- [ ] Automation Intelligence
  - [ ] PR #87 — Branch Intelligence System (chaos prevention, cross-repo analysis)
    - Gates: branch-intelligence.yml runs on schedule + PR events; scripts migrated to pnpm; JSON/markdown outputs verified
  - [ ] PR #86 — Universal Repository Bridge (multi-repo ops)
    - Gates: repository-bridge.json validated; bridge CLI works across sample repos; safety excludes respected

- [ ] Intelligent Auth + Content Discovery
  - [ ] PR #92 — VS Code-integrated auth with dynamic capability discovery (draft)
    - Gates: vscode tasks present; no env vars required; Microsoft/Google/X sign-in flows OK; capability detection prints in logs
    - Action: Convert from draft → Ready for review once green

- [ ] Meta-Automation and Cleanups
  - [ ] Issue #84 — Branch repair automation: wire to Branch Intelligence
  - [ ] Issue #68 — Recalibrate failing scanners/quality gates post-foundation
  - [x] Issue #30 — Closed; ensure branch-delete admin pathway documented

Notes:
- Draft PRs to flip ready once their gates are green: #89, #92
- If any PR is blocked, cherry-pick scoped commits into an RC branch (see §2), then close/supersede PRs via the RC PR

---

## 2) Release Candidate Branch Plan

- Branch name: `release/captain-guthilda-rc1`
- Steps:
  1) Create RC from `main`
  2) Merge (or cherry-pick) in order: #89 → #90 → docs (#91) → #87 → #86 → #92 → wire #84/#68 tasks
  3) Ensure monorepo builds locally with pnpm:
     - pnpm install
     - pnpm -r build
     - pnpm -r lint && pnpm -r test
  4) Run CI; fix any matrix/package drifts
  5) Open a single PR: “Unified RC: Captain Guthilda (Foundation, Intelligence, Auth)”
  6) On approval, squash-merge RC PR; backport doc updates if needed

---

## 3) Validation Checklist (must be green before RC PR)

- [ ] Only pnpm present; no npm artifacts; .gitignore blocks package-lock.json
- [ ] Actions cache keys use pnpm store; matrix includes all packages
- [ ] Tailwind v4 builds stable across packages using it
- [ ] Branch Intelligence: schedule + PR runs generate reports; chaos thresholds configurable
- [ ] Bridge: bridge:init + bridge:list/cleanup dry run succeed against at least one connected repo (mock or real)
- [ ] VS Code auth tasks:
  - [ ] Microsoft sign-in + capability discovery logs services (Outlook/Calendar/OneDrive/Teams/SharePoint)
  - [ ] Google sign-in + capability discovery logs services (Gmail/Calendar/Drive/Contacts)
  - [ ] X sign-in stub path returns capabilities framework-ready output

---

## 4) Docs + Rituals

- [ ] Consolidate guidance into .github/guthilda-monorepo-rituals.md + README links
- [ ] Add a quickstart: pnpm install → VS Code auth tasks → Branch Intelligence → Bridge ops
- [ ] Add troubleshooting for: pnpm cache, Tailwind v4, MS Graph throttling, Google quota, GitHub Actions OOM

---

## 5) Owners / Quick Commands

- Local sanity (from repo root):
```bash
pnpm install
pnpm -r build && pnpm -r lint && pnpm -r test
```
- Branch Intelligence:
```bash
pnpm run branch-intelligence:analyze
pnpm run branch-intelligence:report
pnpm run branch-intelligence:chaos-check
```
- Bridge example:
```bash
pnpm run bridge:init -- --main-repo "poisontr33s/Restructure-MCP-Orchestration" --org "poisontr33s"
pnpm run bridge:list
```
- VS Code auth tasks: run the provided tasks or node entrypoints per PR #92 description

---

If approved, I will proceed to open `release/captain-guthilda-rc1` and stage merges in the sequence above. 

— Captain Guthilda