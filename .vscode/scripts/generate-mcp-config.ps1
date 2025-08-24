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

# intents can be passed via env INTENTS="a,b,c" or use policy.defaultIntents
$envIntents = (Get-Item -Path Env:INTENTS -ErrorAction SilentlyContinue).Value
$activeIntents = @()
if ($envIntents) {
  $activeIntents = $envIntents.Split(',') | ForEach-Object { $_.Trim().ToLowerInvariant() } | Where-Object { $_ -ne '' }
} elseif ($policy.defaultIntents) {
  $activeIntents = @($policy.defaultIntents | ForEach-Object { $_.ToString().ToLowerInvariant() })
}
if ($activeIntents.Count -eq 0) { $activeIntents = @('common') }
# expand with normalized tokens and simple aliases
$norm = New-Object System.Collections.Generic.HashSet[string]
foreach ($i in $activeIntents) {
  if (-not [string]::IsNullOrWhiteSpace($i)) {
    $lower = $i.ToLowerInvariant()
    [void]$norm.Add($lower)
    $parts = $lower -split "[^a-z0-9]+" | Where-Object { $_ -ne '' }
    foreach ($p in $parts) { [void]$norm.Add($p) }
    switch ($lower) {
      'web-search' { [void]$norm.Add('search'); break }
      'codegen' { [void]$norm.Add('code'); break }
      'local-llm' { [void]$norm.Add('llm'); break }
    }
  }
}
$activeIntents = @($norm)

$maxDynamic = if ($policy.maxDynamicServers) { [int]$policy.maxDynamicServers } else { 6 }
$strategy = if ($policy.strategy) { $policy.strategy } else { 'auto' }
$preferBindings = $true
if ($null -ne $policy.preferBindings) { $preferBindings = [bool]$policy.preferBindings }
$bindings = @{}
if ($policy.bindings) { $bindings = $policy.bindings }

$enabled = @()
$candidates = @()
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
    $ruleWeight = if ($rule.weight) { [int]$rule.weight } else { 1 }
    $ruleIntents = @()
    if ($rule.intents) { $ruleIntents = @($rule.intents | ForEach-Object { $_.ToString().ToLowerInvariant() }) }
    $intentScore = 0
    if ($ruleIntents.Count -gt 0) {
      foreach ($i in $activeIntents) { if ($ruleIntents -contains $i) { $intentScore += 1 } }
    }
    $candidates += [pscustomobject]@{
      rule = $rule
      weight = $ruleWeight
      intents = $ruleIntents
      intentScore = $intentScore
      score = ($ruleWeight * 10) + $intentScore
    }
  }
}

# selection based on strategy and budget
$selected = @()
if ($strategy -eq 'all') {
  $selected = $candidates
} else {
  $bindingKeys = @()
  if ($bindings -and $bindings.PSObject -and $bindings.PSObject.Properties) {
    $bindingKeys = @($bindings.PSObject.Properties | ForEach-Object { $_.Name })
  }
  if ($preferBindings -and $bindingKeys.Count -gt 0) {
    # Build allowlist of server keys from bindings matching active intents (prefix match: intent.category)
    $allow = New-Object System.Collections.Generic.HashSet[string]
    foreach ($bKey in $bindingKeys) {
      $parts = $bKey.Split('.')
      $intentKey = $parts[0].ToLowerInvariant()
      # match exact or prefix in any active intent token
  $bindHit = $false
  foreach ($ai in $activeIntents) { if ($ai -eq $intentKey -or $ai.StartsWith($intentKey)) { $bindHit = $true; break } }
      if ($bindHit) {
        $prop = $bindings.PSObject.Properties | Where-Object { $_.Name -eq $bKey } | Select-Object -First 1
        if ($null -ne $prop) {
          $vals = $prop.Value
          if ($null -ne $vals) {
            if ($vals -isnot [System.Array]) { $vals = @($vals) }
            foreach ($s in $vals) { if ($null -ne $s) { [void]$allow.Add([string]$s) } }
          }
        }
      }
    }
    $selected = $candidates | Where-Object { $allow.Contains([string]$_.rule.serverKey) } | Sort-Object -Property @{ Expression = 'score'; Descending = $true } | Select-Object -First $maxDynamic
    $bindStrict = $false; if ($policy.bindStrict) { $bindStrict = [bool]$policy.bindStrict }
    if ($selected.Count -eq 0 -and -not $bindStrict) {
      $selected = $candidates | Sort-Object -Property @{ Expression = 'score'; Descending = $true } | Select-Object -First $maxDynamic
    }
  } else {
    $selected = $candidates | Sort-Object -Property @{ Expression = 'score'; Descending = $true } | Select-Object -First $maxDynamic
  }
}

$baseCount = ($servers.Keys | Measure-Object).Count
$budget = [Math]::Max(0, $maxDynamic - $baseCount)
if ($strategy -ne 'all' -and $budget -lt $selected.Count) {
  $selected = $selected | Select-Object -First $budget
}

foreach ($c in $selected) {
  $rule = $c.rule
  $key = $rule.serverKey
  if (-not $servers.ContainsKey($key)) {
    $cmdToUse = $rule.command
    if ($cmdToUse -eq '{uvx}' -and $policy.uvxPath) { $cmdToUse = $policy.uvxPath }
    $servers[$key] = [pscustomobject]@{ command = $cmdToUse; args = $rule.args }
    $enabled += $key
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
  $det = "Intents: " + ($activeIntents -join ', ') + "; Enabled: " + ($(if ($enabled.Count -gt 0) { $enabled -join ", " } else { 'None' }))
  pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "mcp-config" -Summary $sum -Details $det -Actor "agent" | Out-Null
} catch {}
