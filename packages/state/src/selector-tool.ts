import type { WebMcpToolDescriptor } from '@tooluminati/core';
import type { StateSummaryToolOptions } from './types';

export function createStateSummaryTool<TState, TSummary>({
  name,
  description,
  getState,
  selector,
  redact,
}: StateSummaryToolOptions<TState, TSummary>): WebMcpToolDescriptor<
  Record<string, never>,
  unknown
> {
  return {
    name,
    description,
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, debugging: true },
    execute: () => {
      const summary = selector(getState());
      return redact ? redact(summary) : summary;
    },
  };
}
