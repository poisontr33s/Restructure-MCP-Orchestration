param(
  [string]$DatasetPath = "$PSScriptRoot/micro-dataset.json"
)

$ErrorActionPreference = 'Continue'

if (!(Test-Path $DatasetPath)) { throw "Dataset not found: $DatasetPath" }
$data = Get-Content -Raw -Path $DatasetPath | ConvertFrom-Json

Write-Host "== Session Blueprint Replayer =="
Write-Host "Repo: $($data.meta.repo) on branch $($data.meta.branch)"

# 1) Validate invariants
Write-Host "\n[1/3] Validating invariants..."
if (!(Test-Path $data.invariants.uvxPath)) { Write-Error "uvx not found at $($data.invariants.uvxPath)" }
if (!(Test-Path $data.invariants.mcpConfig)) { Write-Error "MCP config missing: $($data.invariants.mcpConfig)" }
$persist = (Get-Content -Raw -Path ".vscode/settings.json" | ConvertFrom-Json)."terminal.integrated.enablePersistentSessions"
if ($persist -ne $true) { Write-Warning "terminal.integrated.enablePersistentSessions is not true" }

# 2) Verify MCP server config can start
Write-Host "\n[2/3] Verifying MCP server(s)..."
foreach ($s in $data.mcp.servers) {
  Write-Host "- Checking server: $($s.name)"
  & $s.command @($s.args) --help 1>$null 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Warning "Server '$($s.name)' may not be available (help check failed)" }
}

# 3) Optional session snapshot probe
Write-Host "\n[3/3] Snapshot probe..."
$sessionDir = $data.invariants.snapshotDir
if (!(Test-Path $sessionDir)) { New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null }
$out = ""
try {
  $out = pnpm exec mcp status 2>&1 | Out-String
} catch {
  try { $out = pnpm dlx @modelcontextprotocol/cli@latest status 2>&1 | Out-String } catch { $out = $_ | Out-String }
}
$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$file = Join-Path $sessionDir "mcp-status-$ts.txt"
$out | Set-Content -Path $file -Encoding UTF8
Write-Host "Saved: $file"

Write-Host "\nReplayer finished. Review warnings (if any) above."
