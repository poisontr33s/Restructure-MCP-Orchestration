# Unified Ops Entrypoint (PowerShell)
param(
  [Parameter(Mandatory=$true)][ValidateSet("index","mcp:gen","mcp:use-dyn","mcp:use-base","log:note","log:clip")] [string]$Cmd,
  [string]$Arg
)

$ErrorActionPreference = "Stop"

switch ($Cmd) {
  "index"      { node scripts/index-repo.js }
  "mcp:gen"    { pwsh -NoProfile -File .vscode/scripts/generate-mcp-config.ps1 }
  "mcp:use-dyn"{ pwsh -NoProfile -File .vscode/scripts/use-dynamic-mcp.ps1 }
  "mcp:use-base"{ pwsh -NoProfile -File .vscode/scripts/use-base-mcp.ps1 }
  "log:note"   { pwsh -NoProfile -File .vscode/scripts/append-session-log.ps1 -Topic "note" -Summary "Quick note" -Details ($Arg ?? "Session thought") -Actor "human" }
  "log:clip"   { (Get-Clipboard) | Out-String | ForEach-Object { $_.Trim() } | ForEach-Object { pwsh -NoProfile -File .vscode/scripts/append-session-log.ps1 -Topic 'clipboard' -Summary 'Clipboard note' -Details $_ -Actor 'human' } }
}
