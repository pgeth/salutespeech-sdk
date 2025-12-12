import * as errors from '../../../../errors';
import { TokenManager } from '../../../../core/auth';
import { generateUUID } from '../../../../utils/uuid';
import { simpleFetchStream } from '../../../../core/fetcher/SimpleFetcher';
import type { BaseClientOptions, BaseRequestOptions, NormalizedClientOptions } from '../../../../BaseClient';
import type { SynthesizeRequest } from './requests';
import { normalizeClientOptions } from '../../../../BaseClient';

export class TextToSpeechClient {
  protected readonly _options: NormalizedClientOptions<BaseClientOptions>;
  private tokenManager?: TokenManager;

  constructor(options: BaseClientOptions, tokenManager?: TokenManager) {
    this._options = normalizeClientOptions(options);
    this.tokenManager = tokenManager;
  }

  /**
   * Synthesize text to speech
   * @throws {SberSalutError} On API errors
   * @throws {SberSalutAuthError} On authentication failures
   * @throws {SberSalutRateLimitError} On rate limit exceeded
   */
  public async synthesize(
    request: SynthesizeRequest,
    requestOptions?: BaseRequestOptions,
  ): Promise<ReadableStream<Uint8Array>> {
    // Validate text length
    if (request.text.length > 4000) {
      throw new errors.SberSalutError({
        message: 'Text exceeds maximum length of 4000 characters',
      });
    }

    // Get authentication token
    if (!this.tokenManager) {
      throw new errors.SberSalutAuthError({
        message: 'Client ID and Client Secret are required for authentication',
      });
    }
    const token = await this.tokenManager.getToken();

    // Build query parameters
    const { text, format, voice, rebuildCache, bypassCache, requestId } = request;
    const queryParams: Record<string, string> = {};

    if (format) {
      queryParams.format = format;
    }
    if (voice) {
      queryParams.voice = voice;
    }
    if (rebuildCache !== undefined) {
      queryParams.rebuild_cache = rebuildCache.toString();
    }
    if (bypassCache !== undefined) {
      queryParams.bypass_cache = bypassCache.toString();
    }

    // Build headers
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Request-ID': requestId ?? generateUUID(),
    };

    // Make request
    const response = await simpleFetchStream(
      'https://smartspeech.sber.ru/rest/v1/text:synthesize',
      text,
      headers,
      queryParams
    );

    // Handle errors
    if (!response.ok) {
      const statusCode = response.status;

      switch (statusCode) {
        case 401:
        case 403:
          throw new errors.SberSalutAuthError({
            message: 'Authentication failed',
            statusCode,
            body: response.error?.body,
          });
        case 429:
          throw new errors.SberSalutRateLimitError({
            message: 'Rate limit exceeded',
            statusCode,
            body: response.error?.body,
          });
        default:
          throw new errors.SberSalutError({
            message: response.error?.message || 'Unknown error',
            statusCode,
            body: response.error?.body,
          });
      }
    }

    if (!response.data) {
      throw new errors.SberSalutError({
        message: 'Response body is empty',
      });
    }

    return response.data;
  }
}
