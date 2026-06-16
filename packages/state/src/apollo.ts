import type { WebMcpToolDescriptor } from '@tooluminati/core';

export interface ApolloQuerySummary {
  name?: string;
  networkStatus?: string | number;
  loading?: boolean;
  error?: string;
}

export function createApolloSummaryTool(options: {
  getQueries: () => ApolloQuerySummary[];
  name?: string;
}): WebMcpToolDescriptor<Record<string, never>, { queries: ApolloQuerySummary[] }> {
  return {
    name: options.name ?? 'get_apollo_query_summary',
    description:
      'Returns allowlisted Apollo query loading, network, and error summaries.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => ({ queries: options.getQueries() }),
  };
}
