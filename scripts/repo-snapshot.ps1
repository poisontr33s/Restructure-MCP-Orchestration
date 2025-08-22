param(
  [string]$Out = (Join-Path $PSScriptRoot '..' 'docs' 'repo-index' 'snapshot.json')
)
$ErrorActionPreference = 'Stop'

function ConvertTo-JsonSafe {
  [CmdletBinding()]
  param(
    [Parameter(ValueFromPipeline = $true)]
    $obj,
    [int]$Depth = 6
  )
  process {
    try {
      $obj | ConvertTo-Json -Depth $Depth -ErrorAction Stop
    } catch {
      '{}'
    }
  }
}

$root = Resolve-Path "$PSScriptRoot/.."
$pkgRoot = Join-Path $root 'package.json'
$packages = Get-ChildItem -Path (Join-Path $root 'packages') -Recurse -Filter 'package.json' -ErrorAction SilentlyContinue

$snapshot = [ordered]@{
  when = (Get-Date).ToString('s') + 'Z'
  root = $root
  branch = $(git rev-parse --abbrev-ref HEAD 2>$null)
  lastCommit = $(git log -1 --pretty=format:'%h %s' 2>$null)
  settingsHash = ((Get-FileHash -Algorithm SHA1 -Path (Join-Path $root '.vscode' 'settings.json') -EA SilentlyContinue).Hash)
  tasksHash = ((Get-FileHash -Algorithm SHA1 -Path (Join-Path $root '.vscode' 'tasks.json') -EA SilentlyContinue).Hash)
  mcp = @{ base = '.vscode/mcp.json'; generated = '.vscode/mcp.generated.json' }
  plan = 'docs/plans/integrity-plan.md'
  dependabot = '.github/dependabot.yml'
  packages = @()
}

if (Test-Path $pkgRoot) { $snapshot.packages += [ordered]@{ path = 'package.json'; content = (Get-Content -Raw $pkgRoot) } }
foreach ($p in $packages) { $rel = $p.FullName.Substring($root.Path.Length+1); $snapshot.packages += [ordered]@{ path = $rel; content = (Get-Content -Raw $p.FullName) } }

$dir = Split-Path -Parent $Out
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
$js = ConvertTo-JsonSafe $snapshot
$js | Set-Content -Path $Out
Write-Host "Wrote snapshot to $Out"
