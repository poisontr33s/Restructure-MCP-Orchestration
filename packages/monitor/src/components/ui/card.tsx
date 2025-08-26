import React from 'react';

export const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="border rounded-lg p-4 shadow-sm">{children}</div>;
};

export const CardHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};

export const CardTitle = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="text-lg font-semibold">{children}</h3>;
};

export const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};
