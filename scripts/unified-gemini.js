#!/usr/bin/env node

/**
 * JavaScript wrapper for unified Gemini solution
 * Cross-compatible entry point for the TypeScript implementation
 */

// Import the compiled TypeScript version
const unified = require('./compiled/unified-gemini.js');

// Re-export everything for compatibility
module.exports = unified;

// If run directly, execute the main function
if (require.main === module) {
  // The compiled version already handles CLI execution
  require('./compiled/unified-gemini.js');
}
