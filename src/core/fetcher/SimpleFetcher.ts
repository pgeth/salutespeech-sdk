/**
 * Simplified HTTP client for SberSalut SDK
 * Single-file implementation with only essential features
 */

import nodeFetch from 'node-fetch';
import https from 'https';

// Always use node-fetch for better compatibility
// (Node.js native fetch has issues with some HTTPS endpoints)
const fetchFn = nodeFetch as any;

// Create HTTPS agent that accepts self-signed certificates
// This is needed for Sber API endpoints
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export interface SimpleFetcherOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | BodyInit;
  queryParams?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
}

export interface SimpleFetcherResponse<T> {
  ok: boolean;
  status: number;
  statusText: string;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
    body?: unknown;
  };
}

/**
 * Build URL with query parameters
 */
function buildUrl(baseUrl: string, params?: Record<string, string | number | boolean>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Simplified fetcher - makes HTTP request with timeout and retry support
 */
export async function simpleFetch<T = unknown>(
  options: SimpleFetcherOptions
): Promise<SimpleFetcherResponse<T>> {
  const {
    url: baseUrl,
    method,
    headers = {},
    body,
    queryParams,
    timeout = 30000,
    retries = 0,
  } = options;

  const url = buildUrl(baseUrl, queryParams);
  let lastError: Error | null = null;

  // Retry loop
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetchFn(url, {
          method,
          headers,
          body,
          signal: controller.signal,
          agent: httpsAgent,
        });

        clearTimeout(timeoutId);

        // Handle successful response
        if (response.ok) {
          // Check content type to determine how to parse
          const contentType = response.headers.get('content-type') || '';

          let data: T;
          if (contentType.includes('application/json')) {
            data = await response.json() as T;
          } else if (contentType.includes('text/')) {
            data = await response.text() as T;
          } else {
            // For streaming responses (audio, etc), return the stream
            data = response.body as T;
          }

          return {
            ok: true,
            status: response.status,
            statusText: response.statusText,
            data,
          };
        }

        // Handle error response
        let errorBody: unknown;
        try {
          const text = await response.text();
          errorBody = text ? JSON.parse(text) : undefined;
        } catch {
          errorBody = undefined;
        }

        return {
          ok: false,
          status: response.status,
          statusText: response.statusText,
          error: {
            message: `HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status,
            body: errorBody,
          },
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === retries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // All retries failed
  const errorMessage = lastError?.message || 'Unknown error';
  return {
    ok: false,
    status: 0,
    statusText: 'Request Failed',
    error: {
      message: errorMessage,
      statusCode: undefined,
      body: undefined,
    },
  };
}

/**
 * Helper for JSON POST requests
 */
export async function simpleFetchJson<T = unknown>(
  url: string,
  data: unknown,
  headers: Record<string, string> = {}
): Promise<SimpleFetcherResponse<T>> {
  return simpleFetch<T>({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Helper for form-urlencoded POST requests (for OAuth)
 */
export async function simpleFetchForm<T = unknown>(
  url: string,
  data: Record<string, string>,
  headers: Record<string, string> = {}
): Promise<SimpleFetcherResponse<T>> {
  const body = Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return simpleFetch<T>({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers,
    },
    body,
  });
}

/**
 * Helper for text POST requests with streaming response (for TTS)
 */
export async function simpleFetchStream(
  url: string,
  text: string,
  headers: Record<string, string> = {},
  queryParams?: Record<string, string | number | boolean>
): Promise<SimpleFetcherResponse<ReadableStream<Uint8Array>>> {
  return simpleFetch<ReadableStream<Uint8Array>>({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/text',
      ...headers,
    },
    body: text,
    queryParams,
  });
}
