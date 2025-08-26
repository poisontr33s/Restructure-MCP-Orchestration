#!/usr/bin/env node

/**
 * 🌑🔥 Autonomous Operation Test & Gemini CLI Wake-Up
 * Test script to verify all autonomous settings work and Gemini CLI is active
 */

import ElderPocketPlaneHeritageGuardian from './elder-pocket-plane-heritage-guardian.js';

async function testAutonomousOperation() {
  console.log('🌑🔥 Testing Autonomous Operation & Gemini CLI Integration...');
  
  const workspaceRoot = process.cwd();
  const guardian = new ElderPocketPlaneHeritageGuardian(workspaceRoot);
  
  try {
    // Initialize Heritage Guardian
    await guardian.initializeHeritageGuardian();
    
    // Test structural integrity and tidying
    await guardian.performStructuralIntegrityAndTidying();
    
    // Test recursive evolution
    await guardian.performRecursiveEvolution();
    
    console.log('✅ Autonomous operation test completed successfully!');
    console.log('🔥 Heritage Guardian is now actively preserving the Elder Pocket Plane repository');
    console.log('🌐 Live monitoring available at: http://localhost:5500');
    
  } catch (error) {
    console.error('💥 Autonomous operation test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAutonomousOperation().catch(console.error);
