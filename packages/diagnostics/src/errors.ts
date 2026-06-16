import type { WebMcpToolDescriptor } from '@react-webmcp-diagnostics/core';

export interface ClientErrorSummary {
  message: string;
  source: string;
  timestamp: string;
  route?: string;
  stack?: string;
}

export class ClientErrorBuffer {
  private readonly errors: ClientErrorSummary[] = [];

  constructor(private readonly maxSize = 20) {}

  push(error: ClientErrorSummary): void {
    this.errors.unshift(error);
    this.errors.splice(this.maxSize);
  }

  list(): ClientErrorSummary[] {
    return [...this.errors];
  }

  clear(): void {
    this.errors.splice(0);
  }
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
