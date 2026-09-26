import type { WebMcpToolDescriptor } from '@tooluminati/core';
import type { QuerySummary } from './types';

export interface QueryLike {
  queryKey: unknown;
  state: {
    status?: string;
    fetchStatus?: string;
    dataUpdatedAt?: number;
    error?: unknown;
    data?: unknown;
    fetchFailureCount?: number;
    failureCount?: number;
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
  allowKeys: unknown[];
  includeDataShape?: boolean;
  includeData?: boolean;
  redact?: (data: unknown) => unknown;
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

function getRetryCount(query: QueryLike): number | undefined {
  const state = query.state;
  return state.fetchFailureCount ?? state.failureCount;
}

/** @experimental */
export function createQueryCacheSummaryTool({
  queryClient,
  allowKeys,
  includeDataShape = true,
  includeData = false,
  redact,
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
    annotations: { readOnlyHint: true, debugging: true },
    execute: () => {
      if (!allowKeys?.length) {
        throw new Error(
          'allowKeys is required for query cache summary tool. ' +
            'Provide an explicit allowlist of query keys.',
        );
      }

      if (includeData && !redact) {
        throw new Error(
          'redact is required when includeData is true for query cache summary tool.',
        );
      }

      const allowed = new Set(allowKeys.map((key) => JSON.stringify(key)));
      const queries = queryClient
        .getQueryCache()
        .findAll()
        .filter((query) => allowed.has(JSON.stringify(query.queryKey)))
        .map((query) => {
          const summary: QuerySummary = {
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
            retryCount: getRetryCount(query),
          };

          if (includeDataShape) {
            summary.dataShape = summarizeShape(query.state.data);
          }

          if (includeData && redact) {
            summary.data = redact(query.state.data);
          }

          return summary;
        });

      return { queries };
    },
  };
}
