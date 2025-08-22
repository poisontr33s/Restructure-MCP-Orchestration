# Claude Doctor Raw Mode Issue

**Date**: 2025-08-11  
**Issue**: `claude doctor` command fails with "Raw mode is not supported" error  
**Context**: Running in CI/non-interactive environment or PowerShell with restricted stdin  

## Error Details

```
Command: claude doctor
Version: 1.0.72 (Claude Code)
Timeout: 2m 0.0s
Error: Raw mode is not supported on the current process.stdin, which Ink uses as input stream by default.
```

**Stack Trace**:
```
handleSetRawMode (claude-code/cli.js:797:3853)
-> sF (claude-code/cli.js:329:21533)  
-> nX (claude-code/cli.js:329:41154)
-> KG0 (claude-code/cli.js:323:8931)
-> Immediate.IG0 (claude-code/cli.js:323:9350)
-> process.processImmediate (node:internal/timers:485:21)
```

## Root Cause Analysis

**Ink Framework Issue**: Claude Code uses Ink (React for CLI) which requires TTY/raw mode for interactive UI. The error occurs when:
1. Running in non-interactive environment (CI, scripts)
2. PowerShell with restricted stdin capabilities
3. Redirected input/output streams
4. Windows terminal compatibility issues

## Solutions

### 1. Alternative Diagnostic Commands
```bash
# Instead of claude doctor, use:
claude --version                    # ✅ Works
claude --help                       # ✅ Works  
claude config list                  # ✅ Works (non-interactive)
```

### 2. Environment Fixes
```powershell
# Option A: Use proper interactive terminal
cmd /c "claude doctor"

# Option B: PowerShell with ConPTY
$env:FORCE_COLOR = "0"
claude doctor

# Option C: Windows Terminal / WSL
wsl claude doctor
```

### 3. Programmatic Health Check
```javascript
// Alternative to claude doctor
const { spawn } = require('child_process');

function claudeHealthCheck() {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude', ['--version'], { 
      stdio: 'pipe',
      shell: true 
    });
    
    let output = '';
    proc.stdout.on('data', (data) => output += data);
    proc.on('close', (code) => {
      if (code === 0 && output.includes('Claude Code')) {
        resolve({ status: 'ok', version: output.trim() });
      } else {
        reject(new Error(`Claude not working: ${code}`));
      }
    });
  });
}
```

## Integration with Arbitrage System

**Update env-report.js** to use safe claude check:
```javascript
// Instead of calling claude doctor directly
function getClaudeStatus() {
  try {
    const version = execSync('claude --version', { 
      encoding: 'utf8', 
      timeout: 5000,
      stdio: 'pipe'
    }).trim();
    return version.includes('Claude Code') ? version : 'installed-unknown';
  } catch {
    return 'missing';
  }
}
```

**Update VS Code Tasks** (`tasks.json`):
```json
{
  "label": "Health: Claude Status (Safe)",
  "type": "shell", 
  "command": "claude",
  "args": ["--version"],
  "group": "build",
  "presentation": { "echo": true, "reveal": "always" }
}
```

## Captain Guthilda's Law Compliance

This issue doesn't violate pnpm rituals but affects health checking. The fix maintains:
- ✅ No npm artifacts created
- ✅ Uses existing pnpm-installed claude
- ✅ Preserves systematic health checking
- ✅ Integrates with arbitrage bridge protocols

## Recommended Action

1. Update `scripts/env-report.js` with safe claude detection
2. Create VS Code task for non-interactive claude health check
3. Document this limitation in `ARBITRAGE-BRIDGE.md`
4. Use `claude --version` for automated health checks
5. Reserve `claude doctor` for manual troubleshooting in proper terminals

## Status
- **Immediate**: Use `claude --version` for health checks ✅
- **Short-term**: Update automation scripts to avoid raw mode ⏳  
- **Long-term**: Monitor Claude Code updates for Ink compatibility fixes ⏳