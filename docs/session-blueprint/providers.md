# ML Provider Setup Guide

This repo supports context-driven MCP servers for multiple providers. Keys are read from environment variables and the dynamic MCP generator includes servers only when those keys are present.

## Providers and env vars

- OpenAI: `OPENAI_API_KEY`
- Google Gemini: `GEMINI_API_KEY`
- Anthropic Claude: `ANTHROPIC_API_KEY`

Optional experimental local stacks (require enabling `MCP_EXPERIMENTAL=1`):

- Ollama: binary `ollama` must be on PATH
- llama.cpp: binary `llama` must be on PATH

## Quick start (PowerShell)

```powershell
# set the provider keys you have
$env:OPENAI_API_KEY = "..."   # if using OpenAI
$env:GEMINI_API_KEY = "..."   # if using Gemini
$env:ANTHROPIC_API_KEY = "..." # if using Claude

# optionally enable experimental
$env:MCP_EXPERIMENTAL = "1"

# regenerate dynamic MCP config
pwsh -NoProfile -File .vscode/scripts/generate-mcp-config.ps1
```

`mcp.generated.json` merges the immutable base servers with providers enabled by your env.

## Tips

- Keep `.vscode/mcp.json` stable; use `.vscode/mcp.generated.json` during active sessions.
- Unset a key or close/reopen the window to drop servers you no longer want.
- You can tweak `.vscode/mcp.policy.json` to add or disable rules locally.
