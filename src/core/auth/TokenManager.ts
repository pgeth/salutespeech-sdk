import { generateUUID } from '../../utils/uuid';
import { SberSalutAuthError } from '../../errors';
import type { OAuthResponse } from '../../api/resources/auth/types';
import type { TokenData, TokenManagerOptions, CachedToken } from './types';
import { simpleFetchForm } from '../fetcher/SimpleFetcher';

export class TokenManager {
  private tokenCache: Map<string, CachedToken> = new Map();
  private refreshPromises: Map<string, Promise<TokenData>> = new Map();

  constructor(
    private options: TokenManagerOptions
  ) {}

  /**
   * Get valid token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    const cacheKey = this.getCacheKey();
    const cached = this.tokenCache.get(cacheKey);

    // Check if cached token is still valid
    if (cached && this.isTokenValid(cached.token)) {
      return cached.token.accessToken;
    }

    // If refresh already in progress, wait for it
    const existingRefresh = this.refreshPromises.get(cacheKey);
    if (existingRefresh) {
      const token = await existingRefresh;
      return token.accessToken;
    }

    // Start new refresh
    const refreshPromise = this.refreshToken();
    this.refreshPromises.set(cacheKey, refreshPromise);

    try {
      const token = await refreshPromise;
      this.tokenCache.set(cacheKey, { token, cacheKey });
      return token.accessToken;
    } finally {
      this.refreshPromises.delete(cacheKey);
    }
  }

  /**
   * Check if token is valid (not expired with buffer)
   */
  private isTokenValid(token: TokenData): boolean {
    const bufferMs = (this.options.refreshBufferSeconds ?? 300) * 1000;
    const now = Date.now();
    return token.expiresAt - bufferMs > now;
  }

  /**
   * Refresh token via OAuth
   */
  private async refreshToken(): Promise<TokenData> {
    const auth = Buffer.from(
      `${this.options.clientId}:${this.options.clientSecret}`
    ).toString('base64');

    const rquid = generateUUID();

    const response = await simpleFetchForm<OAuthResponse>(
      'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
      { scope: this.options.scope },
      {
        Authorization: `Basic ${auth}`,
        RqUID: rquid,
      }
    );

    if (!response.ok) {
      throw new SberSalutAuthError({
        message: 'OAuth authentication failed',
        statusCode: response.error?.statusCode,
        body: response.error,
      });
    }

    if (!response.data) {
      throw new SberSalutAuthError({
        message: 'OAuth response is empty',
        statusCode: response.status,
        body: undefined,
      });
    }

    return {
      accessToken: response.data.access_token,
      expiresAt: response.data.expires_at,
    };
  }

  private getCacheKey(): string {
    // Create hash of credentials for cache key
    return Buffer.from(
      `${this.options.clientId}:${this.options.clientSecret}:${this.options.scope}`
    ).toString('base64');
  }

  /**
   * Clear cached token (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.tokenCache.clear();
  }
}
