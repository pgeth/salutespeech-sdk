import type { SynthesizeOptions } from '../../types';

export interface SynthesizeRequest extends SynthesizeOptions {
  /** Text to synthesize (max 4000 characters, supports SSML) */
  text: string;
}
