/**
 * TSX Example using Unified Gemini Client
 * Demonstrates cross-compatibility with React/TypeScript
 */

import React, { useState, useEffect } from 'react';
import { UnifiedGeminiClient, GeminiConfig, GeminiResponse } from './unified-gemini';

interface GeminiChatProps {
  config?: Partial<GeminiConfig>;
}

const GeminiChat: React.FC<GeminiChatProps> = ({ config = {} }) => {
  const [client] = useState(() => new UnifiedGeminiClient());
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<GeminiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Array<{ name: string; available: boolean }>>([]);

  useEffect(() => {
    // Load provider status on mount
    client.listProviders().then(setProviders);
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const result = await client.generate(prompt, config);
      setResponse(result);
    } catch (error) {
      console.error('Generation failed:', error);
      setResponse({
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        method: 'sdk',
        model: config.model || 'gemini-2.5-pro',
        streaming: false,
        tools: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🤖 Unified Gemini Chat</h1>
      
      {/* Provider Status */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📊 Provider Status</h3>
        {providers.map(provider => (
          <div key={provider.name} style={{ margin: '5px 0' }}>
            <span style={{ color: provider.available ? 'green' : 'red' }}>
              {provider.available ? '✅' : '❌'}
            </span>
            {' '}{provider.name}
          </div>
        ))}
      </div>

      {/* Chat Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            style={{ 
              width: '100%', 
              height: '100px', 
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !prompt.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Send'}
        </button>
      </form>

      {/* Response Display */}
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h3>🤖 Response</h3>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}>
            {response.text}
          </div>
          
          {/* Response Metadata */}
          <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
            <div>Provider: {response.method}</div>
            <div>Model: {response.model}</div>
            <div>Streaming: {response.streaming ? 'Yes' : 'No'}</div>
            {response.chunks && <div>Chunks: {response.chunks}</div>}
            {response.tokens && (
              <div>
                Tokens: {response.tokens.input} input + {response.tokens.output} output = {response.tokens.total} total
              </div>
            )}
            {response.tools.length > 0 && <div>Tools: {response.tools.join(', ')}</div>}
          </div>
        </div>
      )}

      {/* Configuration Display */}
      <div style={{ marginTop: '30px', fontSize: '0.9em' }}>
        <h4>⚙️ Configuration</h4>
        <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify({
            model: config.model || 'gemini-2.5-pro',
            streaming: config.streaming ?? true,
            tools: config.tools || ['googleSearch'],
            thinkingBudget: config.thinkingBudget ?? -1,
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default GeminiChat;

// Example usage in a React app:
/*
import GeminiChat from './scripts/unified-gemini-example';

function App() {
  return (
    <GeminiChat 
      config={{
        model: 'gemini-2.5-pro',
        streaming: true,
        tools: ['googleSearch'],
        thinkingBudget: -1
      }}
    />
  );
}
*/