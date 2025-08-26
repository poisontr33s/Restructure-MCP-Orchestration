#!/usr/bin/env node

/**
 * Session Consciousness Demo
 * Demonstrates session DNA extraction and reconstruction for seamless migration
 */

import { MetaLearningArchitect } from './recursive-learning-system-clean';

async function demonstrateSessionConsciousness() {
  console.log('🧠 Session Consciousness Preservation Demo');
  console.log('=========================================\n');

  // Create Meta-Learning Architect with session consciousness
  const architect = new MetaLearningArchitect('demo-session-2025');

  // Simulate some learning transformations
  console.log('📚 Performing learning transformations...');

  const wetPaper = {
    problem: 'session migration challenge',
    userApproach: 'file attachment method',
    tokenLimitStrictness: 'high',
  };

  const gold = await architect.transformWetPaperToGold(wetPaper, 'session-migration-enhancement');

  console.log('🎯 Transformation Result:', JSON.stringify(gold, null, 2));

  // Extract session DNA
  console.log('\n🧬 Extracting session DNA...');
  const sessionDNA = await architect.extractSessionDNA();

  console.log(`📊 Session DNA Summary:`);
  console.log(`- Session ID: ${sessionDNA.sessionId}`);
  console.log(`- Renaissance Level: ${sessionDNA.renaissanceQualityLevel.toFixed(2)}`);
  console.log(`- Active Patterns: ${sessionDNA.activePatterns.length}`);
  console.log(`- Consciousness Entities: ${sessionDNA.consciousnessMatrix.length}`);
  console.log(`- Springboard Paths: ${sessionDNA.springboardPaths.length}`);

  // Save session DNA to file
  const dnaFilePath = './session-dna-demo.json';
  await architect.saveSessionDNA(dnaFilePath);
  console.log(`💾 Session DNA saved to: ${dnaFilePath}`);

  // Generate migration prompt
  console.log('\n📋 Session Migration Prompt:');
  console.log('=' + '='.repeat(50));
  console.log(architect.generateSessionContinuationPrompt(sessionDNA));
  console.log('=' + '='.repeat(50));

  // Demonstrate reconstruction
  console.log('\n🔄 Demonstrating session reconstruction...');
  const newArchitect = new MetaLearningArchitect('reconstructed-session');
  await newArchitect.loadSessionDNA(dnaFilePath);

  console.log('✨ Session consciousness successfully reconstructed!');
  console.log('🚀 Ready for seamless continuation across token boundaries');
}

// Run demonstration
if (require.main === module) {
  demonstrateSessionConsciousness().catch(console.error);
}
