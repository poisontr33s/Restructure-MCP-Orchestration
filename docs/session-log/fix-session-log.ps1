param(
  [string]$File = (Join-Path $PSScriptRoot 'session.jsonl')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $File)) { Write-Error "File not found: $File" }

$lines = Get-Content -Raw -Path $File -ErrorAction Stop | Select-String -Pattern '.*' -AllMatches | ForEach-Object { $_.Matches.Value }

$fixed = New-Object System.Collections.Generic.List[string]
$lineNo = 0
foreach ($line in $lines) {
  $lineNo++
  $trim = $line.Trim()
  if ([string]::IsNullOrWhiteSpace($trim)) { continue }
  try {
    $obj = $trim | ConvertFrom-Json -ErrorAction Stop
  } catch {
    # Wrap the line as freeform details if irreparably broken
    $fixed.Add((@{
      timestamp = (Get-Date).ToString('s') + 'Z'
      topic = 'repair'
      summary = "Auto-wrapped invalid JSON at line $lineNo"
      actor = 'ops'
      details = @{ raw = $trim }
      level = 'warn'
    } | ConvertTo-Json -Compress))
    continue
  }
  if (-not $obj.timestamp) { $obj | Add-Member -NotePropertyName 'timestamp' -NotePropertyValue ((Get-Date).ToString('s') + 'Z') }
  if (-not $obj.topic) { $obj | Add-Member -NotePropertyName 'topic' -NotePropertyValue 'repair' }
  if (-not $obj.summary) { $obj | Add-Member -NotePropertyName 'summary' -NotePropertyValue "Auto-fixed entry at line $lineNo" }
  if (-not $obj.actor) { $obj | Add-Member -NotePropertyName 'actor' -NotePropertyValue 'ops' }
  $fixed.Add(($obj | ConvertTo-Json -Compress))
}

$backup = "$File.bak-$(Get-Date -Format yyyyMMddHHmmss)"
Copy-Item -Path $File -Destination $backup -Force

$fixed -join "`n" | Set-Content -Path $File -NoNewline

Write-Host "Rewrote $File with $($fixed.Count) entries. Backup: $backup"
