$ErrorActionPreference = "Stop"
$base = ".vscode/mcp.json"
$backup = ".vscode/mcp.base.json"
if (Test-Path $backup) {
  Copy-Item -Path $backup -Destination $base -Force
  Write-Host "Restored base MCP -> ${base} from ${backup}"
  try { pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "mcp-config" -Summary "Restored base MCP" -Details "base <- backup" -Actor "agent" | Out-Null } catch {}
} else {
  Write-Host "No backup found at ${backup}; leaving ${base} unchanged."
}
