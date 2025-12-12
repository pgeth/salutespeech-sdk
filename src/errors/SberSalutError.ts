export class SberSalutError extends Error {
  public readonly statusCode?: number;
  public readonly body?: unknown;

  constructor(options: {
    message?: string;
    statusCode?: number;
    body?: unknown;
  }) {
    super(buildMessage(options));
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode;
    this.body = options.body;
  }
}

function buildMessage(options: {
  message?: string;
  statusCode?: number;
  body?: unknown;
}): string {
  if (options.message != null) {
    return options.message;
  }

  let message = 'SberSalutError';

  if (options.statusCode != null) {
    message += ` (${options.statusCode})`;
  }

  if (options.body != null) {
    if (typeof options.body === 'string') {
      message += `: ${options.body}`;
    } else {
      try {
        message += `: ${JSON.stringify(options.body)}`;
      } catch {
        message += `: ${String(options.body)}`;
      }
    }
  }

  return message;
}
