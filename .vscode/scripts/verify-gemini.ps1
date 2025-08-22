param(
  [switch]$Quick
)
$ErrorActionPreference = 'Continue'

Write-Host "Gemini CLI verification"
try {
  gemini --version
} catch {
  Write-Error "gemini not found on PATH"; exit 1
}

if (-not $Quick) {
  if (-not $env:GEMINI_API_KEY) { Write-Warning "GEMINI_API_KEY not set" }
  try {
    $res = gemini -p "health check: say 'ok'"
    if ($LASTEXITCODE -ne 0) { Write-Warning "gemini returned non-zero exit code: $LASTEXITCODE" }
    if ($res) { Write-Host "Gemini response (excerpt):"; $res.Split("`n")[0..([Math]::Min(3,$res.Split("`n").Length-1))] }
  } catch {
    Write-Warning "Gemini prompt test failed: $($_)"
  }
}

exit 0
