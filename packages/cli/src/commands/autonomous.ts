
import { logger } from '@mcp/core';
import { spawn } from 'child_process';

export async function autonomousCommandHandler() {
  logger.info('Starting Autonomous Operation...');

  const autonomous = spawn('node', ['agent/autonomous-launcher.js'], {
    stdio: 'inherit',
    detached: true,
  });

  logger.info('Autonomous Operation started.');
  logger.info(`Autonomous launcher PID: ${autonomous.pid}`);
}
