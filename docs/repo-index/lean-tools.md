# Lean Copilot Chat Tools

Use “Configure Tools” and keep the list under ~64. Start with these:

## Keep
- [x] Built-in: terminalSelection
- [x] Built-in: usages
- [x] Built-in: vscodeAPI
- [x] Built-in: testFailure (optional)

### MCP servers (from .vscode/mcp.json)
- [x] MCP Server: fetch
- [x] MCP Server: sequential-thinking
- [x] MCP Server: duckduckgo
- [x] MCP Server: server-base

## Disable (unless actively needed)
- [ ] Azure tool packs (Resource Graph, Load Testing, DevCenter, etc.)
- [ ] CodeQL/advanced security packs while not auditing
- [ ] Jupyter/Notebook tools if not using notebooks
- [ ] Excess language packs or linters you don't use today
- [ ] Redundant web/doc search tools if one provider suffices

Tip: After switching intents (tasks: “MCP: Intents …”), run “MCP: Generate Dynamic Config” so the MCP list stays small.