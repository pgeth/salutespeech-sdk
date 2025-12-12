import {
  SberSalutClient,
  SberSalutAuthError,
  SberSalutRateLimitError,
} from '../src';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Example with custom options and error handling
 */

async function main() {
  const client = new SberSalutClient({
    clientId: process.env.SALUTESPEECH_CLIENT_ID,
    clientSecret: process.env.SALUTESPEECH_CLIENT_SECRET || '',
    scope: 'SALUTE_SPEECH_PERS',
    timeoutInSeconds: 60, // Custom timeout
    maxRetries: 3, // Custom retry count
  });

  try {
    // Synthesize with custom options
    const audioStream = await client.textToSpeech.synthesize({
      text: '<speak>Привет, <break time="500ms"/> как дела?</speak>', // SSML support
      format: 'opus',
      voice: 'May_24000',
      bypassCache: true, // Don't use cached audio
    });

    // Save to file
    const writer = fs.createWriteStream('output-with-options.opus');
    (audioStream as any).pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Audio saved to output-with-options.opus');
        resolve(undefined);
      });
      writer.on('error', reject);
      (audioStream as any).on('error', reject);
    });
  } catch (error) {
    if (error instanceof SberSalutAuthError) {
      console.error('Authentication failed:', error.message);
      console.error('Status code:', error.statusCode);
    } else if (error instanceof SberSalutRateLimitError) {
      console.error('Rate limit exceeded:', error.message);
      console.error('Status code:', error.statusCode);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

main();
