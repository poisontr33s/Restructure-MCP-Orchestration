import React from 'react';
import { cn } from '../utils';

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary p-1">
            <div className="h-6 w-6 text-primary-foreground flex items-center justify-center font-bold">
              MCP
            </div>
          </div>
          <h1 className="text-xl font-bold">MCP Orchestration System</h1>
        </div>
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
    </header>
  );
};

export default Header;
