param(
  [string]$Root = (Resolve-Path "$PSScriptRoot/.."),
  [switch]$FailOnFound
)
$ErrorActionPreference = 'Stop'
$violations = @()

# Disallow package-lock.json anywhere
$locks = Get-ChildItem -Path $Root -Recurse -Filter 'package-lock.json' -ErrorAction SilentlyContinue
if ($locks) { $violations += ($locks | ForEach-Object { $_.FullName }) }

# Flag rogue node_modules at repo root (allow in .pnpm store)
$nodes = Get-ChildItem -Path $Root -Directory -Filter 'node_modules' -ErrorAction SilentlyContinue
foreach ($n in $nodes) {
  if ($n.FullName -notlike '*\\.pnpm*') { $violations += $n.FullName }
}

if ($violations.Count -gt 0) {
  Write-Host "pnpm-only guard violations:" -ForegroundColor Yellow
  $violations | ForEach-Object { Write-Host " - $_" }
  if ($FailOnFound) { exit 2 } else { exit 0 }
} else {
  Write-Host 'pnpm-only guard: OK'
}
