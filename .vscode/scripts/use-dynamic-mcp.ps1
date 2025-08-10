$ErrorActionPreference = "Stop"
$base = ".vscode/mcp.json"
$backup = ".vscode/mcp.base.json"
$generated = ".vscode/mcp.generated.json"

if (-not (Test-Path $generated)) { throw "Generated MCP config not found: $generated. Run 'MCP: Generate Dynamic Config' first." }
if (-not (Test-Path $backup) -and (Test-Path $base)) { Copy-Item -Path $base -Destination $backup -Force }
Copy-Item -Path $generated -Destination $base -Force
Write-Host "Activated dynamic MCP -> ${base} (backup at ${backup})"

# Auto-log
try {
	pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "mcp-config" -Summary "Switched to dynamic MCP" -Details "base <- generated" -Actor "agent" | Out-Null
} catch {}
