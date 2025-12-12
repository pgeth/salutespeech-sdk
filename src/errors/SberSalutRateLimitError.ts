import { SberSalutError } from './SberSalutError';

export class SberSalutRateLimitError extends SberSalutError {
  constructor(options: ConstructorParameters<typeof SberSalutError>[0]) {
    super({
      message: options.message ?? 'Rate limit exceeded',
      ...options,
    });
  }
}
