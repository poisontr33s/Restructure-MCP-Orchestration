import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sun, Moon, RefreshCw } from 'lucide-react';
import Header from './components/Header';
import ServerList from './components/ServerList';
import SystemInfo from './components/SystemInfo';
import StatusCard from './components/StatusCard';
import { fetchStatus } from './api/mcp-api';
import type { FullStatus } from '@mcp/shared';

function App() {
  const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Fetch status data
  const { data, isLoading, error, refetch } = useQuery<FullStatus>({
    queryKey: ['mcpStatus'],
    queryFn: fetchStatus,
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Count servers by status
  const serverCounts = data?.servers.reduce((acc, server) => {
    acc[server.status] = (acc[server.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      <Header>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-accent transition-colors"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button 
          onClick={() => refetch()}
          className="ml-2 p-2 rounded-full hover:bg-accent transition-colors"
          aria-label="Refresh data"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </Header>
      
      <main className="container mx-auto py-6 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <h3 className="font-bold">Error</h3>
            <p>Failed to load MCP server status. Please try refreshing.</p>
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatusCard 
                title="Total Servers" 
                value={data.servers.length.toString()} 
                icon="server"
              />
              <StatusCard 
                title="Running" 
                value={(serverCounts['running'] || 0).toString()} 
                icon="play"
                status="running"
              />
              <StatusCard 
                title="Errors" 
                value={((serverCounts['error'] || 0) + (serverCounts['not responding'] || 0)).toString()} 
                icon="alert-triangle"
                status="error"
              />
              <StatusCard 
                title="Stopped" 
                value={(serverCounts['stopped'] || 0).toString()} 
                icon="stop-circle"
                status="stopped"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ServerList servers={data.servers} />
              </div>
              <div>
                <SystemInfo system={data.system} timestamp={data.timestamp} />
              </div>
            </div>
          </>
        ) : null}
      </main>
      
      <footer className="container mx-auto py-4 px-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          MCP Orchestration System © 2025
        </p>
      </footer>
    </div>
  );
}

export default App;
