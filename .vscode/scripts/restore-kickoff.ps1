# Restores a minimal session: checks MCP status and gives quick next steps
param()

$ErrorActionPreference = 'Continue'

# Ensure PATH contains uv/uvx
$env:Path = "C:\Users\erdno\.local\bin;$env:Path"

Write-Host "Restoring dev environment..."
Write-Host "1) Checking MCP servers"
try {
	pnpm exec mcp status
} catch {
	try {
		pnpm dlx @modelcontextprotocol/cli@latest status
	} catch {
		Write-Host "Could not run 'mcp status'. Install @modelcontextprotocol/cli or ensure pnpm is on PATH."
	}
}

Write-Host ""
Write-Host "2) Tip: Run the 'Dev: Monitor UI' task to revive the UI server"

# Auto-log
try {
	pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "session-restore" -Summary "Ran restore kickoff" -Details "Checked MCP status" -Actor "agent" | Out-Null
} catch {}
