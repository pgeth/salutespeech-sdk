import type { OAuthScope } from '../../api/resources/auth/types';

export interface TokenData {
  accessToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
}

export interface TokenManagerOptions {
  clientId: string;
  clientSecret: string;
  scope: OAuthScope;
  /** Buffer time in seconds before token expiry to refresh (default: 300 = 5 minutes) */
  refreshBufferSeconds?: number;
}

export interface CachedToken {
  token: TokenData;
  /** Key used for caching (hash of credentials) */
  cacheKey: string;
}
