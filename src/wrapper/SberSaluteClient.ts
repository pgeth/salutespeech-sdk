import { TokenManager } from '../core/auth';
import { TextToSpeechClient } from '../api/resources/textToSpeech';
import type { BaseClientOptions } from '../BaseClient';
import type { OAuthScope } from '../api/resources/auth/types';

export declare namespace SberSaluteClient {
  interface Options extends BaseClientOptions {
    /**
     * Your SaluteSpeech Client ID (required)
     */
    clientId: string;

    /**
     * Your SaluteSpeech Client Secret (required)
     */
    clientSecret: string;

    /**
     * OAuth scope. Defaults to SALUTE_SPEECH_PERS
     */
    scope?: OAuthScope;
  }
}

export class SberSaluteClient {
  protected readonly _options: SberSaluteClient.Options;
  protected tokenManager: TokenManager;

  // Lazy-loaded resource clients
  protected _textToSpeech: TextToSpeechClient | undefined;

  constructor(options: SberSaluteClient.Options) {
    this._options = {
      ...options,
      scope: options.scope ?? 'SALUTE_SPEECH_PERS',
    };

    // Initialize TokenManager
    this.tokenManager = new TokenManager({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      scope: options.scope ?? 'SALUTE_SPEECH_PERS',
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
