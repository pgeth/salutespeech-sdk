import type { AudioFormat } from './AudioFormat';

export interface SynthesizeOptions {
  /** Audio format (default: wav16) */
  format?: AudioFormat;
  /** Voice to use (default: May_24000) */
  voice?: string;
  /** Rebuild cache (default: false) */
  rebuildCache?: boolean;
  /** Bypass cache (default: false) */
  bypassCache?: boolean;
  /** Custom X-Request-ID header */
  requestId?: string;
}
