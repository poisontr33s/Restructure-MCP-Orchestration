param(
  [Parameter(Mandatory=$true)][string]$Intents,
  [string]$Persist = "false"
)

$ErrorActionPreference = "Stop"

$env:INTENTS = $Intents
Write-Host ("INTENTS=" + $env:INTENTS)

if ($Persist.ToLowerInvariant() -in @('true','1','yes','on')) {
  [Environment]::SetEnvironmentVariable('INTENTS', $Intents, 'User')
  Write-Host "Persisted INTENTS for current user."
}

pwsh -NoProfile -File ".vscode/scripts/generate-mcp-config.ps1" | Out-Host

try {
  pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "mcp-config" -Summary "Set intents" -Details ("INTENTS=" + $Intents) -Actor "human" | Out-Null
} catch {}
