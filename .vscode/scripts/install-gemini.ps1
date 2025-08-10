param(
  [ValidateSet("pnpm")][string]$Method = "pnpm"
)
$ErrorActionPreference = "Continue"

Write-Host "Installing Gemini CLI via method: $Method"
try {
  pnpm add -g @google/gemini-cli
} catch {
  Write-Error "pnpm global install failed: $($_)"; exit 1
}

Write-Host "Verifying 'gemini' is available..."
try { gemini --version } catch { Write-Warning "'gemini' not found on PATH after install" }

Write-Host "First-time auth: the CLI will prompt on first use (uses Google AI Studio)."

# Session log
try {
  pwsh -NoProfile -File ".vscode/scripts/append-session-log.ps1" -Topic "install" -Summary "Installed Gemini CLI ($Method)" -Details "gemini --version" -Actor "agent" | Out-Null
} catch {}
