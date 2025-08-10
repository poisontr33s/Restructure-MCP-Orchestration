param(
  [switch]$Quiet
)

$ErrorActionPreference = 'Stop'

function Test-Command {
  param([string]$Name)
  try { Get-Command $Name -ErrorAction Stop | Out-Null; return $true } catch { return $false }
}

function Invoke-CommandSafe {
  param([string]$Exe, [string[]]$Arguments)
  $result = [ordered]@{ exe = $Exe; args = ($Arguments -join ' '); ok = $false; exitCode = $null; output = $null; error = $null }
  try {
    $output = & $Exe @Arguments 2>&1 | Out-String
    $result.output = $output.Trim()
    $result.exitCode = $LASTEXITCODE
    $result.ok = ($LASTEXITCODE -eq 0)
  } catch {
    $result.error = $_.Exception.Message
  }
  return $result
}

$claude = [ordered]@{ available = Test-Command 'claude'; check = $null }
if ($claude.available) {
  $claude.check = Invoke-CommandSafe -Exe 'claude' -Arguments @('doctor')
} else {
  $claude.check = [ordered]@{ ok = $false; exitCode = $null; output = $null; error = 'claude command not found' }
}

$gemini = [ordered]@{ available = Test-Command 'gemini'; check = $null }
if ($gemini.available) {
  $gemini.check = Invoke-CommandSafe -Exe 'gemini' -Arguments @('--version')
} else {
  $gemini.check = [ordered]@{ ok = $false; exitCode = $null; output = $null; error = 'gemini command not found' }
}

$summary = 'Providers verification: ' + (
  @(
    'Claude=' + ($(if ($claude.check.ok) { 'OK' } else { 'MISSING/ERROR' })),
    'Gemini=' + ($(if ($gemini.check.ok) { 'OK' } else { 'MISSING/ERROR' }))
  ) -join ', '
)

# Emit to console
Write-Host $summary
if ($claude.available) { Write-Host "Claude doctor exit=$($claude.check.exitCode)"; if ($claude.check.output) { Write-Host ($claude.check.output) } }
if ($gemini.available) { Write-Host "Gemini version exit=$($gemini.check.exitCode)"; if ($gemini.check.output) { Write-Host ($gemini.check.output) } }

# Append to session log
try {
  $append = Join-Path $PSScriptRoot 'append-session-log.ps1'
  if (Test-Path $append) {
    $details = @{ claude = $claude; gemini = $gemini } | ConvertTo-Json -Depth 6
    & pwsh -NoProfile -File $append -Topic 'providers' -Summary $summary -Details $details -Actor 'ops' | Out-Null
  }
} catch { }

if (-not $Quiet) {
  if (-not $claude.check.ok -or -not $gemini.check.ok) {
    Write-Host 'Tip: Use tasks "Install: Claude Code (pnpm/native)" and "Install: Gemini CLI (pnpm)" to set these up.' -ForegroundColor Yellow
  }
}
