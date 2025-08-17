/**
 * Authentication Types and Interfaces
 */

export interface VSCodeAuthExtension {
  /**
   * VS Code extension API for authentication
   */
  getSession(providerId: string, scopes: string[]): Promise<AuthSession | undefined>;
  createSession(providerId: string, scopes: string[]): Promise<AuthSession>;
  removeSession(sessionId: string): Promise<void>;
}

export interface AuthSession {
  id: string;
  accessToken: string;
  account: {
    id: string;
    label: string;
  };
  scopes: string[];
}

/**
 * Authentication events
 */
export interface AuthEvents {
  onDidChangeSessions: (handler: (event: AuthSessionChangeEvent) => void) => void;
}

export interface AuthSessionChangeEvent {
  added: AuthSession[];
  removed: AuthSession[];
  changed: AuthSession[];
}

/**
 * Provider-specific configurations
 */
export interface MicrosoftAuthConfig {
  clientId?: string;
  tenantId?: string;
  authority?: string;
  scopes?: string[];
}

export interface GoogleAuthConfig {
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
}

/**
 * Authentication status
 */
export enum AuthStatus {
  NotAuthenticated = 'not_authenticated',
  Authenticating = 'authenticating',
  Authenticated = 'authenticated',
  Failed = 'failed',
  Refreshing = 'refreshing'
}

/**
 * Authentication error types
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class TokenExpiredError extends AuthError {
  constructor(provider: string) {
    super('Access token has expired', 'TOKEN_EXPIRED', provider);
    this.name = 'TokenExpiredError';
  }
}

export class AuthCancelledError extends AuthError {
  constructor(provider: string) {
    super('Authentication was cancelled by user', 'AUTH_CANCELLED', provider);
    this.name = 'AuthCancelledError';
  }
}