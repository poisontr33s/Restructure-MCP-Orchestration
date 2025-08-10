# Saves a timestamped snapshot of MCP server status into .vscode/.session
param()

$ErrorActionPreference = 'SilentlyContinue'

# Ensure PATH contains uv/uvx
$env:Path = "C:\Users\erdno\.local\bin;$env:Path"

# Prepare output dir relative to the repo root
$sessionDir = Join-Path $PSScriptRoot '..\.session' | Resolve-Path -ErrorAction SilentlyContinue
if (-not $sessionDir) {
    $sessionDir = Join-Path $PSScriptRoot '..\.session'
    New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null
}

# Capture MCP status with fallback to pnpm dlx
$out = ''
try {
    $out = pnpm exec mcp status 2>&1 | Out-String
} catch {
    $out = ''
}
if (-not $out -or $out.Trim().Length -eq 0 -or $out -match 'Command "mcp" not found') {
    try {
        $out = pnpm dlx @modelcontextprotocol/cli@latest status 2>&1 | Out-String
    } catch {
        $out = "Unable to run 'mcp status' via pnpm. Ensure @modelcontextprotocol/cli is available. Error: $($_ | Out-String)"
    }
}
$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
$file = Join-Path $sessionDir "mcp-status-$ts.txt"
$out | Set-Content -Path $file -Encoding UTF8

Write-Host "Saved: $file"

# Auto-log
try {
    pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "mcp-status" -Summary "Saved MCP status snapshot" -Details $file -Actor "agent" | Out-Null
} catch {}
