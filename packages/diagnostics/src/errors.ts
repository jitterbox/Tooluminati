import type { WebMcpToolDescriptor } from '@react-webmcp-diagnostics/core';

export interface ClientErrorSummary {
  message: string;
  source: string;
  timestamp: string;
  route?: string;
  stack?: string;
}

export interface ClientErrorBufferOptions {
  maxSize?: number;
  redact?: (error: ClientErrorSummary) => ClientErrorSummary;
  includeStacks?: boolean;
  getRoute?: () => string | undefined;
}

function isDevEnvironment(): boolean {
  return (
    typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
  );
}

export class ClientErrorBuffer {
  private readonly errors: ClientErrorSummary[] = [];
  private readonly maxSize: number;
  private readonly redact?: (error: ClientErrorSummary) => ClientErrorSummary;
  private readonly includeStacks: boolean;
  private readonly getRoute?: () => string | undefined;

  constructor(options: ClientErrorBufferOptions | number = 20) {
    if (typeof options === 'number') {
      this.maxSize = options;
      this.includeStacks = false;
    } else {
      this.maxSize = options.maxSize ?? 20;
      if (options.redact) {
        this.redact = options.redact;
      }
      this.includeStacks = options.includeStacks ?? false;
      if (options.getRoute) {
        this.getRoute = options.getRoute;
      }
    }
  }

  push(error: ClientErrorSummary): void {
    const route = error.route ?? this.getRoute?.();
    const entry: ClientErrorSummary = {
      message: error.message,
      source: error.source,
      timestamp: error.timestamp,
      ...(route ? { route } : {}),
    };

    if (this.includeStacks && isDevEnvironment() && error.stack) {
      entry.stack = error.stack;
    }

    const stored = this.redact?.(entry) ?? entry;
    this.errors.unshift(stored);
    this.errors.splice(this.maxSize);
  }

  list(): ClientErrorSummary[] {
    return [...this.errors];
  }

  clear(): void {
    this.errors.splice(0);
  }
}

export interface ErrorCollectorOptions {
  buffer: ClientErrorBuffer;
  enabled?: boolean;
}

/** @experimental */
export function createErrorCollector(
  options: ErrorCollectorOptions,
): () => void {
  if (options.enabled === false || typeof window === 'undefined') {
    return () => {};
  }

  const onError = (event: ErrorEvent) => {
    const stack =
      event.error instanceof Error ? event.error.stack : undefined;
    options.buffer.push({
      message: event.message,
      source: event.filename ?? 'window.onerror',
      timestamp: new Date().toISOString(),
      ...(stack ? { stack } : {}),
    });
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const stack = reason instanceof Error ? reason.stack : undefined;
    options.buffer.push({
      message: reason instanceof Error ? reason.message : String(reason),
      source: 'unhandledrejection',
      timestamp: new Date().toISOString(),
      ...(stack ? { stack } : {}),
    });
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}

export function createRecentClientErrorsTool(
  buffer: ClientErrorBuffer,
  name = 'get_recent_client_errors',
): WebMcpToolDescriptor<Record<string, never>, { errors: ClientErrorSummary[] }> {
  return {
    name,
    description:
      'Returns recent redacted client-side errors captured by the app diagnostics buffer.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => ({ errors: buffer.list() }),
  };
}
