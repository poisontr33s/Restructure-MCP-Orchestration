import React from 'react';
import { Server, AlertTriangle, PlayCircle, StopCircle } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string;
  icon: 'server' | 'alert-triangle' | 'play' | 'stop-circle';
  status?: 'running' | 'error' | 'stopped';
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, icon, status }) => {
  // Get background color based on status
  const getBgColor = () => {
    switch (status) {
      case 'running':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50';
      case 'stopped':
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-900/50';
      default:
        return 'bg-card border-border';
    }
  };

  // Get icon color based on status
  const getIconColor = () => {
    switch (status) {
      case 'running':
        return 'text-green-500 dark:text-green-400';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      case 'stopped':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-primary';
    }
  };

  // Render the appropriate icon
  const renderIcon = () => {
    switch (icon) {
      case 'server':
        return <Server className={`h-6 w-6 ${getIconColor()}`} />;
      case 'alert-triangle':
        return <AlertTriangle className={`h-6 w-6 ${getIconColor()}`} />;
      case 'play':
        return <PlayCircle className={`h-6 w-6 ${getIconColor()}`} />;
      case 'stop-circle':
        return <StopCircle className={`h-6 w-6 ${getIconColor()}`} />;
      default:
        return <Server className={`h-6 w-6 ${getIconColor()}`} />;
    }
  };

  return (
    <div className={`rounded-lg border shadow-sm p-6 ${getBgColor()}`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="bg-background dark:bg-card rounded-full p-2 border border-border">
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
