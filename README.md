# SaluteSpeech SDK

TypeScript SDK for Sber SaluteSpeech (SmartSpeech) API with OAuth 2.0 authentication and streaming text-to-speech synthesis.

## Features

- 🔐 **OAuth 2.0 Authentication** - Automatic token management with refresh
- 🎙️ **Text-to-Speech** - High-quality speech synthesis with multiple voices
- 📡 **Streaming Support** - Memory-efficient binary audio streaming
- 🔄 **Automatic Retries** - Built-in retry logic with exponential backoff
- 💪 **TypeScript** - Full type safety with TypeScript definitions
- 🌐 **Cross-platform** - Works in Node.js, browsers, and edge runtimes

## Installation

```bash
npm install @salutespeech/sdk
```

## Quick Start

### Set Environment Variables

```bash
export SALUTESPEECH_CLIENT_ID="your-client-id"
export SALUTESPEECH_CLIENT_SECRET="your-client-secret"
```

### Basic Usage

```typescript
import { SberSalutClient } from '@salutespeech/sdk';
import * as fs from 'fs';

const client = new SberSalutClient({
  scope: 'SALUTE_SPEECH_PERS', // or 'SALUTE_SPEECH_CORP'
});

// Synthesize speech
const audioStream = await client.textToSpeech.synthesize({
  text: 'Привет, мир!',
  format: 'wav16',
  voice: 'May_24000',
});

// Save to file using Node.js streams
const writer = fs.createWriteStream('output.wav');
(audioStream as any).pipe(writer);

await new Promise((resolve, reject) => {
  writer.on('finish', resolve);
  writer.on('error', reject);
  (audioStream as any).on('error', reject);
});
```

## API Reference

### SberSalutClient

```typescript
const client = new SberSalutClient({
  clientId?: string;           // Default: SALUTESPEECH_CLIENT_ID env var
  clientSecret: string;        // Required, or SALUTESPEECH_CLIENT_SECRET env var
  scope?: OAuthScope;          // Default: 'SALUTE_SPEECH_PERS'
  timeoutInSeconds?: number;   // Default: 30
  maxRetries?: number;         // Default: 2
  headers?: Record<string, string>; // Optional additional headers
});
```

### Text-to-Speech

```typescript
const audio = await client.textToSpeech.synthesize({
  text: string;              // Max 4000 characters, supports SSML
  format?: AudioFormat;      // Default: 'wav16'
  voice?: string;            // Default: 'May_24000'
  rebuildCache?: boolean;    // Default: false
  bypassCache?: boolean;     // Default: false
  requestId?: string;        // Optional X-Request-ID header
});
```

#### Audio Formats

- `wav16` - WAV 16-bit (default)
- `pcm16` - PCM 16-bit
- `opus` - Opus codec
- `alaw` - A-law codec
- `g729` - G.729 codec (for telephony)

#### Available Voices

- `May_24000` - May voice, 24kHz (default)
- `May_8000` - May voice, 8kHz (for telephony)

## Advanced Usage

### SSML Support

```typescript
const audio = await client.textToSpeech.synthesize({
  text: '<speak>Привет, <break time="500ms"/> как дела?</speak>',
  format: 'opus',
});
```

### Error Handling

```typescript
import {
  SberSalutAuthError,
  SberSalutRateLimitError,
  SberSalutTimeoutError,
} from '@salutespeech/sdk';

try {
  const audio = await client.textToSpeech.synthesize({ text: 'Привет!' });
} catch (error) {
  if (error instanceof SberSalutAuthError) {
    console.error('Authentication failed:', error.statusCode);
  } else if (error instanceof SberSalutRateLimitError) {
    console.error('Rate limit exceeded:', error.statusCode);
  } else if (error instanceof SberSalutTimeoutError) {
    console.error('Request timed out');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Custom Timeout and Retries

```typescript
const client = new SberSalutClient({
  timeoutInSeconds: 60,
  maxRetries: 5,
});
```

## Rate Limits

- **Individuals (SALUTE_SPEECH_PERS)**: 5 concurrent streams
- **Companies (SALUTE_SPEECH_CORP)**: 10 concurrent streams

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Links

- [SaluteSpeech Documentation](https://developers.sber.ru/docs/ru/salutespeech/rest/salutespeech-rest-api)
- [GitHub Repository](https://github.com/pavelgorbunov/salutespeech-sdk)
- [NPM Package](https://www.npmjs.com/package/@salutespeech/sdk)
