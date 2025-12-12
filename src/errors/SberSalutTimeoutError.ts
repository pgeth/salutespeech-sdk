import { SberSalutError } from './SberSalutError';

export class SberSalutTimeoutError extends SberSalutError {
  constructor(options?: { message?: string }) {
    super({
      message: options?.message ?? 'Request timed out',
    });
  }
}
