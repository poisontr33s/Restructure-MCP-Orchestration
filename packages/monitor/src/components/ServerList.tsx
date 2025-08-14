import React from 'react';
import { Play, StopCircle, RefreshCw } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { startServer, stopServer, restartServer } from '../api/mcp-api';

type ServerStatus = 'running' | 'starting' | 'error' | 'stopped' | 'not responding' | 'timeout';

interface ServerProps {
  name: string;
  type: string;
  port: number;
  status: ServerStatus;
  uptime?: number;
  pid?: number;
}

interface ServerListProps {
  servers: ServerProps[];
}

const ServerList: React.FC<ServerListProps> = ({ servers }) => {
  const queryClient = useQueryClient();

  // Mutations for server actions
  const startMutation = useMutation({
    mutationFn: startServer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mcpStatus'] }),
  });

  const stopMutation = useMutation({
    mutationFn: stopServer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mcpStatus'] }),
  });

  const restartMutation = useMutation({
    mutationFn: restartServer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mcpStatus'] }),
  });

  // Format uptime to human-readable format
  const formatUptime = (seconds?: number): string => {
    if (!seconds) return 'N/A';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold">MCP Servers</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Server Name</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Status</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Port</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Uptime</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">PID</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {servers.map((server) => (
              <tr key={server.type} className="hover:bg-muted/30">
                <td className="py-3 px-4">{server.name}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <span className={`status-indicator status-${server.status}`}></span>
                    <span className="capitalize">{server.status.replace('-', ' ')}</span>
                  </div>
                </td>
                <td className="py-3 px-4">{server.port}</td>
                <td className="py-3 px-4">{formatUptime(server.uptime)}</td>
                <td className="py-3 px-4">{server.pid || 'N/A'}</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    {server.status === 'running' || server.status === 'starting' ? (
                      <button
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => stopMutation.mutate(server.type)}
                        disabled={stopMutation.isPending}
                        title="Stop Server"
                      >
                        <StopCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => startMutation.mutate(server.type)}
                        disabled={startMutation.isPending}
                        title="Start Server"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => restartMutation.mutate(server.type)}
                      disabled={restartMutation.isPending}
                      title="Restart Server"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServerList;
