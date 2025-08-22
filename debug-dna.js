const SessionDNAAnalyzer = require('./scripts/session-dna-analyzer.js');
const analyzer = new SessionDNAAnalyzer();

async function debug() {
  try {
    console.log('Loading sessions...');
    const sessions = await analyzer.loadMdSessions();
    console.log('Sessions loaded:', sessions.length);
    
    for (let i = 0; i < sessions.length; i++) {
      console.log(`Session ${i}: ${sessions[i].id}`);
      console.log('Metadata:', sessions[i].metadata);
      console.log('Concepts:', sessions[i].metadata.concepts);
      
      if (i === 0) {
        console.log('Testing DNA extraction...');
        const content = sessions[i].content + JSON.stringify(sessions[i].intelligence);
        console.log('Content length:', content.length);
        console.log('Content type:', typeof content);
        
        try {
          const score = analyzer.calculateFactorScore(content, ['multi-agent', 'arbitrage']);
          console.log('Factor score test:', score);
        } catch (e) {
          console.error('Factor score error:', e.message);
        }
        break;
      }
    }
  } catch (error) {
    console.error('Debug error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debug();