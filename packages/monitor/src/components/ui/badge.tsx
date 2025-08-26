import React from 'react';

export const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}>{children}</span>;
};
