import { describe, expect, it } from 'vitest';
import { redactObject } from '@tooluminati/core';
import { createQueryCacheSummaryTool } from './tanstack-query';

describe('createQueryCacheSummaryTool security', () => {
  const queryClient = {
    getQueryCache: () => ({
      findAll: () => [
        {
          queryKey: ['users'],
          state: {
            status: 'success',
            data: { token: 'secret', name: 'Ada' },
          },
        },
        {
          queryKey: ['posts'],
          state: {
            status: 'success',
            data: { title: 'Hello' },
          },
        },
      ],
    }),
  };

  it('throws when allowKeys is omitted or empty', () => {
    const tool = createQueryCacheSummaryTool({
      queryClient,
      allowKeys: [],
    });

    expect(() => tool.execute({}, {} as never)).toThrow(/allowKeys is required/);
  });

  it('does not dump the full cache without explicit allowKeys', () => {
    const tool = createQueryCacheSummaryTool({
      queryClient,
      allowKeys: [['users']],
    });

    const result = tool.execute({}, {} as never) as {
      queries: Array<{ key: unknown; data?: unknown }>;
    };
    expect(result.queries).toHaveLength(1);
    expect(result.queries[0]?.key).toEqual(['users']);
    expect(result.queries[0]?.data).toBeUndefined();
  });

  it('requires redact when includeData is true', () => {
    const tool = createQueryCacheSummaryTool({
      queryClient,
      allowKeys: [['users']],
      includeData: true,
    });

    expect(() => tool.execute({}, {} as never)).toThrow(/redact is required/);
  });

  it('returns redacted data only for allowlisted keys', () => {
    const tool = createQueryCacheSummaryTool({
      queryClient,
      allowKeys: [['users']],
      includeData: true,
      includeDataShape: false,
      redact: (data) => redactObject(data),
    });

    const result = tool.execute({}, {} as never) as {
      queries: Array<{ key: unknown; data?: unknown }>;
    };
    expect(result.queries[0]?.data).toEqual({
      token: '[REDACTED]',
      name: 'Ada',
    });
  });
});
