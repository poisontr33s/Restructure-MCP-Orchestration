import { describe, it, expect } from 'vitest';
import { ServerType, ServerStatus } from './types';

describe('Shared types', () => {
  it('should export ServerType enum', () => {
    expect(ServerType).toBeDefined();
    expect(ServerType.safeParse('sequential-thinking').success).toBe(true);
    expect(ServerType.safeParse('duckduckgo').success).toBe(true);
    expect(ServerType.safeParse('invalid-type').success).toBe(false);
  });

  it('should export ServerStatus enum', () => {
    expect(ServerStatus).toBeDefined();
    expect(ServerStatus.safeParse('running').success).toBe(true);
    expect(ServerStatus.safeParse('stopped').success).toBe(true);
    expect(ServerStatus.safeParse('invalid-status').success).toBe(false);
  });
});