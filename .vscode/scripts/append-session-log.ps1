param(
  [string]$Topic = "note",
  [string]$Summary = "",
  [string]$Details = "",
  [string]$Actor = "human"
)

$ErrorActionPreference = "Stop"
$logFile = "docs/session-log/session.jsonl"
$ts = (Get-Date).ToString("o")

# try to collect minimal env
$branch = $env:GITHUB_REF_NAME
if (-not $branch) {
  try { $branch = (git rev-parse --abbrev-ref HEAD) 2>$null } catch { $branch = $null }
}
$os = $env:OS
$shell = $env:ComSpec
if (-not $shell) { $shell = $PSVersionTable.PSEdition }

$entry = [ordered]@{
  ts = $ts
  actor = $Actor
  topic = $Topic
  summary = $Summary
  details = @{ free = $Details }
  env = @{ branch = "$branch"; os = "$os"; shell = "$shell" }
}

$line = ($entry | ConvertTo-Json -Depth 6 -Compress)
Add-Content -Path $logFile -Value $line
Write-Host "Appended session log entry -> $logFile"
