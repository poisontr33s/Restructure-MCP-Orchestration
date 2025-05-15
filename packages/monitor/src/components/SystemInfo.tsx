import React from 'react';
import type { SystemInfo as SystemInfoType } from '@mcp/shared';

interface SystemInfoProps {
  system: SystemInfoType;
  timestamp: string;
}

const SystemInfo: React.FC<SystemInfoProps> = ({ system, timestamp }) => {
  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format timestamp to local time
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Calculate memory usage percentage
  const memoryUsagePercent = Math.round(((system.memory.total - system.memory.free) / system.memory.total) * 100);
  
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold">System Information</h2>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
          <p className="text-base mt-1">{formatTimestamp(timestamp)}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">Hostname</p>
          <p className="text-base mt-1">{system.hostname}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">Platform</p>
          <p className="text-base mt-1 capitalize">{system.platform}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">CPU Cores</p>
          <p className="text-base mt-1">{system.cpus}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
          <div className="mt-1">
            <div className="flex justify-between text-xs mb-1">
              <span>{formatBytes(system.memory.total - system.memory.free)} used</span>
              <span>{memoryUsagePercent}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${memoryUsagePercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>{formatBytes(system.memory.free)} free</span>
              <span>{formatBytes(system.memory.total)} total</span>
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
          <p className="text-base mt-1">{formatUptime(system.uptime)}</p>
        </div>
      </div>
    </div>
  );
};

// Format uptime to human-readable format
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days} days, ${hours} hours, ${minutes} minutes`;
  } else if (hours > 0) {
    return `${hours} hours, ${minutes} minutes`;
  } else {
    return `${minutes} minutes`;
  }
}

export default SystemInfo;
