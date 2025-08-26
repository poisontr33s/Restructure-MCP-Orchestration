import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface StatusCardProps {
  title: string;
  status: 'loading' | 'error' | 'ok';
  data?: any;
}

export function StatusCard({ title, status, data }: StatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge
            className={
              status === 'ok'
                ? 'bg-green-500'
                : status === 'error'
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }
          >
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'ok' && data && (
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        )}
        {status === 'error' && <p className="text-red-500">Error fetching status</p>}
      </CardContent>
    </Card>
  );
}
