param(
  [string]$Topic = "note",
  [string]$Summary = "",
  [string]$Details = "",
  [string]$Actor = "human"
)

$ErrorActionPreference = "Stop"
$logFile = "docs/session-log/session.jsonl"
# Ensure directory exists
$logDir = Split-Path -Parent $logFile
if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
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
$last = $null
if (Test-Path $logFile) {
  try { $last = Get-Content -Path $logFile -Tail 1 -ErrorAction Stop } catch { $last = $null }
}
if ($last) {
  try {
    $lastObj = $last | ConvertFrom-Json -ErrorAction Stop
    $same = $false
    if ($lastObj) {
      $lastTopic = $lastObj.topic
      $lastSummary = $lastObj.summary
      $lastDetails = $lastObj.details.free
      if (($lastTopic -eq $entry.topic) -and ($lastSummary -eq $entry.summary) -and ($lastDetails -eq $entry.details.free)) { $same = $true }
    }
    if ($same) {
      Write-Host "Skipped duplicate session log entry (same as last)"
    } else {
      Add-Content -Path $logFile -Value $line
      Write-Host "Appended session log entry -> $logFile"
    }
  } catch {
    Add-Content -Path $logFile -Value $line
    Write-Host "Appended session log entry -> $logFile"
  }
} else {
  Add-Content -Path $logFile -Value $line
  Write-Host "Appended session log entry -> $logFile"
}
