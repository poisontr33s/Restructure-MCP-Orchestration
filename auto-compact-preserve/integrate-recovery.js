#!/usr/bin/env node

// AUTO-COMPACT RECOVERY INTEGRATION
// Automatically loads recovery context into existing session systems

const fs = require('fs');
const path = require('path');

async function integrateRecoveryContext() {
  console.log('🔄 Integrating auto-compact recovery context...');

  // Load recovery context
  const recoveryPath = path.join(__dirname, 'AUTO-COMPACT-RECOVERY.md');
  const recoveryContext = fs.readFileSync(recoveryPath, 'utf8');

  // Create unified session with recovery context
  const unifiedSession = `# UNIFIED SESSION: Post Auto-Compact Recovery

${recoveryContext}

## 🚀 READY FOR CONTINUATION

All revolutionary session intelligence preserved and ready for seamless continuation.
`;

  // Write to preload directory for auto-loading
  fs.writeFileSync('../preload-sessions/AUTO-COMPACT-RECOVERY.md.session', unifiedSession);

  console.log('✅ Recovery context integrated into session systems');
  console.log('🎯 Ready for Claude Code auto-preload');
}

if (require.main === module) {
  integrateRecoveryContext();
}

module.exports = { integrateRecoveryContext };
