/**
 * MCP v2 Metrics Utility
 * Performance and usage metrics collection
 */

export interface Metrics {
  recordRequest(method: string, latency: number, success: boolean): void;
  recordConnection(event: 'connect' | 'disconnect' | 'error'): void;
  recordLearning(signals: any): void;
  getMetrics(): any;
}

export interface MetricsOptions {
  enabled: boolean;
  endpoint?: string;
  interval?: number;
}

export function createMetrics(options: MetricsOptions): Metrics {
  return new DefaultMetrics(options);
}

class DefaultMetrics implements Metrics {
  private data = {
    requests: {
      total: 0,
      success: 0,
      errors: 0,
      latencies: [] as number[]
    },
    connections: {
      connects: 0,
      disconnects: 0,
      errors: 0
    },
    learning: [] as any[]
  };

  constructor(private options: MetricsOptions) {}

  recordRequest(method: string, latency: number, success: boolean): void {
    this.data.requests.total++;
    this.data.requests.latencies.push(latency);
    
    if (success) {
      this.data.requests.success++;
    } else {
      this.data.requests.errors++;
    }
  }

  recordConnection(event: 'connect' | 'disconnect' | 'error'): void {
    switch (event) {
      case 'connect':
        this.data.connections.connects++;
        break;
      case 'disconnect':
        this.data.connections.disconnects++;
        break;
      case 'error':
        this.data.connections.errors++;
        break;
    }
  }

  recordLearning(signals: any): void {
    this.data.learning.push({
      timestamp: Date.now(),
      signals
    });
  }

  getMetrics(): any {
    return { ...this.data };
  }
}
