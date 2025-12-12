import { SberSalutError } from './SberSalutError';

export class SberSalutAuthError extends SberSalutError {
  constructor(options: ConstructorParameters<typeof SberSalutError>[0]) {
    super({
      message: options.message ?? 'Authentication failed',
      ...options,
    });
  }
}
