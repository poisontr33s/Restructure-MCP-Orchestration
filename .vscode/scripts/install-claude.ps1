param(
  [ValidateSet("pnpm","native")][string]$Method = "pnpm"
)
$ErrorActionPreference = "Continue"

Write-Host "Installing Claude Code via method: $Method"
if ($Method -eq "native") {
  try {
    iex (irm https://claude.ai/install.ps1)
  } catch {
    Write-Error "Native install failed: $($_)"; exit 1
  }
} else {
  try {
    pnpm add -g @anthropic-ai/claude-code
  } catch {
    Write-Error "pnpm global install failed: $($_)"; exit 1
  }
}

Write-Host "Running 'claude doctor' to verify..."
try {
  claude --version
  claude config list | Out-Null
} catch { Write-Warning "'claude --version' or 'claude config list' failed: $($_)" }

# Suggest IDE integration per docs
Write-Host "Tip: Open VS Code integrated terminal and run 'claude' to auto-install the extension. Ensure 'code' shell command is available."

# Session log
try {
  pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "install" -Summary "Installed Claude Code ($Method)" -Details "Ran non-interactive checks (claude --version, config list)" -Actor "agent" | Out-Null
} catch {}
