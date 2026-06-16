import type { WebMcpToolDescriptor } from '@react-webmcp-diagnostics/core';
import type { QuerySummary } from './types';

export interface QueryLike {
  queryKey: unknown;
  state: {
    status?: string;
    fetchStatus?: string;
    dataUpdatedAt?: number;
    error?: unknown;
    data?: unknown;
  };
  isStale?: () => boolean;
}

export interface QueryClientLike {
  getQueryCache(): {
    findAll(): QueryLike[];
  };
}

export interface QueryCacheSummaryOptions {
  queryClient: QueryClientLike;
  allowKeys?: unknown[];
  includeDataShape?: boolean;
  name?: string;
}

function summarizeShape(value: unknown): unknown {
  if (Array.isArray(value)) {
    return { type: 'array', length: value.length };
  }

  if (value && typeof value === 'object') {
    return {
      type: 'object',
      keys: Object.keys(value as Record<string, unknown>).slice(0, 20),
    };
  }

  return { type: typeof value };
}

export function createQueryCacheSummaryTool({
  queryClient,
  allowKeys,
  includeDataShape = true,
  name = 'get_query_cache_summary',
}: QueryCacheSummaryOptions): WebMcpToolDescriptor<
  Record<string, never>,
  { queries: QuerySummary[] }
> {
  return {
    name,
    description:
      'Returns allowlisted query status, fetch state, stale state, errors, and data shape summaries.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => {
      const allowed = allowKeys
        ? new Set(allowKeys.map((key) => JSON.stringify(key)))
        : null;
      const queries = queryClient
        .getQueryCache()
        .findAll()
        .filter((query) =>
          allowed ? allowed.has(JSON.stringify(query.queryKey)) : true,
        )
        .map((query) => ({
          key: query.queryKey,
          status: query.state.status,
          fetchStatus: query.state.fetchStatus,
          stale: query.isStale?.(),
          updatedAt: query.state.dataUpdatedAt,
          error: query.state.error
            ? query.state.error instanceof Error
              ? query.state.error.message
              : String(query.state.error)
            : undefined,
          dataShape: includeDataShape
            ? summarizeShape(query.state.data)
            : undefined,
        }));

      return { queries };
    },
  };
}
