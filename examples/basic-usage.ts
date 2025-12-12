import { SberSalutClient } from '../src';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Basic usage example
 *
 * Set environment variables in .env file:
 * SALUTESPEECH_CLIENT_ID=your-client-id
 * SALUTESPEECH_CLIENT_SECRET=your-client-secret
 */

async function main() {
  const client = new SberSalutClient({
    clientSecret: process.env.SALUTESPEECH_CLIENT_SECRET || '',
    scope: 'SALUTE_SPEECH_PERS',
  });

  try {
    const audioStream = await client.textToSpeech.synthesize({
      text: 'Привет, мир! Это тестовое сообщение от SaluteSpeech.',
      format: 'wav16',
      voice: 'May_24000',
    });

    const writer = fs.createWriteStream('output.wav');

    // In Node.js, the stream is a Node.js Readable, not Web ReadableStream
    // So we can pipe it directly
    (audioStream as any).pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Audio saved to output.wav');
        resolve(undefined);
      });
      writer.on('error', reject);
      (audioStream as any).on('error', reject);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
