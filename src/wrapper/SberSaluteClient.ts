import * as errors from '../errors';
import { TokenManager } from '../core/auth';
import { TextToSpeechClient } from '../api/resources/textToSpeech';
import type { BaseClientOptions } from '../BaseClient';
import type { OAuthScope } from '../api/resources/auth/types';

export declare namespace SberSalutClient {
  interface Options extends BaseClientOptions {
    /**
     * Your SaluteSpeech Client ID. Defaults to SALUTESPEECH_CLIENT_ID
     */
    clientId?: string;

    /**
     * Your SaluteSpeech Client Secret. Defaults to SALUTESPEECH_CLIENT_SECRET
     */
    clientSecret: string;

    /**
     * OAuth scope. Defaults to SALUTE_SPEECH_PERS
     */
    scope?: OAuthScope;
  }
}

export class SberSalutClient {
  protected readonly _options: SberSalutClient.Options;
  protected tokenManager: TokenManager;

  // Lazy-loaded resource clients
  protected _textToSpeech: TextToSpeechClient | undefined;

  constructor(options: SberSalutClient.Options) {
    const clientId = options.clientId ?? process.env.SALUTESPEECH_CLIENT_ID;
    const clientSecret =
      options.clientSecret ?? process.env.SALUTESPEECH_CLIENT_SECRET;

    if (clientId == null || clientSecret == null) {
      throw new errors.SberSalutError({
        message:
          'Please provide clientId and clientSecret or set SALUTESPEECH_CLIENT_ID and SALUTESPEECH_CLIENT_SECRET environment variables.',
      });
    }

    this._options = {
      ...options,
      clientId,
      clientSecret,
      scope: options.scope ?? 'SALUTE_SPEECH_PERS',
    };

    // Initialize TokenManager
    this.tokenManager = new TokenManager({
      clientId: clientId as string,
      clientSecret: clientSecret as string,
      scope: (options.scope as OAuthScope) ?? 'SALUTE_SPEECH_PERS',
    });
  }

  /**
   * Get the text-to-speech client
   */
  public get textToSpeech(): TextToSpeechClient {
    return (this._textToSpeech ??= new TextToSpeechClient(
      this._options,
      this.tokenManager
    ));
  }
}
