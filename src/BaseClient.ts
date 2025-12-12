import { mergeHeaders } from './core/headers';
import type { OAuthScope } from './api/resources/auth/types';
import * as core from './core';

export interface BaseClientOptions {
  /** Client ID for OAuth */
  clientId?: string;
  /** Client Secret for OAuth */
  clientSecret?: string;
  /** OAuth scope */
  scope?: OAuthScope;
  /** Additional headers to include in requests. */
  headers?: Record<string, string | null | undefined>;
  /** The default maximum time to wait for a response in seconds. */
  timeoutInSeconds?: number;
  /** The default number of times to retry the request. Defaults to 2. */
  maxRetries?: number;
  /** Provide a custom fetch implementation. Useful for platforms that don't have a built-in fetch or need a custom implementation. */
  fetch?: typeof fetch;
}

export interface BaseRequestOptions {
  /** The maximum time to wait for a response in seconds. */
  timeoutInSeconds?: number;
  /** The number of times to retry the request. Defaults to 2. */
  maxRetries?: number;
  /** A hook to abort the request. */
  abortSignal?: AbortSignal;
  /** Additional query string parameters to include in the request. */
  queryParams?: Record<string, unknown>;
  /** Additional headers to include in the request. */
  headers?: Record<string, string | null | undefined>;
}

export type NormalizedClientOptions<T extends BaseClientOptions> = T;

export function normalizeClientOptions<T extends BaseClientOptions>(
  options: T,
): NormalizedClientOptions<T> {
  const headers = mergeHeaders(
    {
      'User-Agent': '@salutespeech/sdk/1.0.0',
      'X-SDK-Name': '@salutespeech/sdk',
      'X-SDK-Version': '1.0.0',
      'X-Runtime': core.runtime.RUNTIME.type,
      'X-Runtime-Version': core.runtime.RUNTIME.version,
    },
    options?.headers,
  );

  return {
    ...options,
    headers,
  } as NormalizedClientOptions<T>;
}
