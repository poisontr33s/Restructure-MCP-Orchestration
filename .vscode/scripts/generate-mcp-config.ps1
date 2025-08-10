param(
  [string]$PolicyFile = ".vscode/mcp.policy.json",
  [string]$BaseFile = ".vscode/mcp.json",
  [string]$OutFile = ".vscode/mcp.generated.json"
)

$ErrorActionPreference = "Stop"

function Read-Json($path) {
  if (-not (Test-Path $path)) { return $null }
  return Get-Content -Raw -Path $path | ConvertFrom-Json -Depth 20
}

$root = Get-Location
$base = Read-Json $BaseFile
if ($null -eq $base) { throw "Base MCP config not found: $BaseFile" }
if ($null -eq $base.servers) { $base | Add-Member -NotePropertyName servers -NotePropertyValue (@{}) }

$policy = Read-Json $PolicyFile
if ($null -eq $policy) { throw "Policy file not found: $PolicyFile" }

$servers = @{}
# copy base servers first (immutable baseline)
foreach ($k in $base.servers.PSObject.Properties.Name) {
  $servers[$k] = $base.servers.$k
}

$enabled = @()
foreach ($rule in $policy.rules) {
  if ($rule.disabled) { continue }
  # Experimental gating
  if ($rule.experimental -and $policy.allowExperimentalEnvVar) {
    $gateVar = (Get-Item -Path Env:$($policy.allowExperimentalEnvVar) -ErrorAction SilentlyContinue).Value
    $isAllowed = $false
    if ($gateVar) {
      $val = $gateVar.ToString().ToLowerInvariant()
      if ($val -eq '1' -or $val -eq 'true' -or $val -eq 'yes' -or $val -eq 'on') { $isAllowed = $true }
    }
    if (-not $isAllowed) { continue }
  }
  $ok = $true
  if ($rule.enableIf -and $rule.enableIf.pathExists) {
    $p = Join-Path $root $rule.enableIf.pathExists
    if (-not (Test-Path $p)) { $ok = $false }
  }
  if ($rule.enableIf -and $rule.enableIf.env) {
    foreach ($envKey in $rule.enableIf.env) {
      $envVal = (Get-Item -Path Env:$envKey -ErrorAction SilentlyContinue).Value
      if (-not $envVal) { $ok = $false }
    }
  }
  if ($rule.enableIf -and $rule.enableIf.commandAvailable) {
    $cmd = $rule.enableIf.commandAvailable
    $cmdFound = $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
    if (-not $cmdFound) { $ok = $false }
  }
  if ($ok) {
    $key = $rule.serverKey
    if (-not $servers.ContainsKey($key)) {
      $cmdToUse = $rule.command
      if ($cmdToUse -eq '{uvx}' -and $policy.uvxPath) { $cmdToUse = $policy.uvxPath }
      $servers[$key] = [pscustomobject]@{ command = $cmdToUse; args = $rule.args }
      $enabled += $key
    }
  }
}

$out = [pscustomobject]@{ inputs = @(); servers = $servers }
$outJson = $out | ConvertTo-Json -Depth 20
$outDir = Split-Path -Parent $OutFile
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }
$outJson | Set-Content -Path $OutFile -Encoding UTF8

Write-Host "Generated: $OutFile"
if ($enabled.Count -gt 0) {
  Write-Host ("Enabled dynamic servers: " + ($enabled -join ", "))
} else {
  Write-Host "No dynamic servers enabled (build servers or adjust policy)."
}

# Auto-log the action
try {
  $sum = "Generated dynamic MCP config"
  $det = if ($enabled.Count -gt 0) { "Enabled: " + ($enabled -join ", ") } else { "None enabled" }
  pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "mcp-config" -Summary $sum -Details $det -Actor "agent" | Out-Null
} catch {}
