export interface Voice {
  name: string;
  sampleRate: number;
}

export const VOICES = {
  MAY_24000: { name: 'May', sampleRate: 24000 } as Voice,
  MAY_8000: { name: 'May', sampleRate: 8000 } as Voice,
  // Add more voices as they become available
} as const;
