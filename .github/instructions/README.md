# Scoped Copilot instructions

This folder contains repo-scoped instructions for Copilot Chat and the coding agent.

How it works

- Each `*.instructions.md` file may include an `applyTo:` block at the top to scope usage to a sub-tree.
- Copilot Chat reads `.github/copilot-instructions.md` as repo-wide defaults, then merges scoped files when your current file or PR changes match the patterns.

Verify it’s working

- Ask Copilot Chat: "Which scoped instructions are active for packages/core?" while editing a file in `packages/core/`.
- In Copilot PRs, the coding agent will also consult files in this folder when changes match `applyTo` patterns.

Files

- `monorepo.instructions.md`: repo-wide conventions and rituals.
- `core.instructions.md`: applies to `packages/core/**`.
- `cli.instructions.md`: applies to `packages/cli/**`.
- `monitor.instructions.md`: applies to `packages/monitor/**`.
- `servers.instructions.md`: applies to `packages/servers/**`.
- `shared.instructions.md`: applies to `packages/shared/**`.

