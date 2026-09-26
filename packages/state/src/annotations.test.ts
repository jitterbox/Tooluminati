import { expect, it } from 'vitest';
import { createStateSummaryTool } from './selector-tool';
import { createApolloSummaryTool } from './apollo';
import { createQueryCacheSummaryTool } from './tanstack-query';
const tools = [
  createStateSummaryTool({
    name: 'state',
    description: 'Reads state.',
    getState: () => ({}),
    selector: (state) => state,
  }),
  createApolloSummaryTool({ getQueries: () => [] }),
  createQueryCacheSummaryTool({
    queryClient: { getQueryCache: () => ({ findAll: () => [] }) },
    allowKeys: ['test'],
  }),
];
it.each(tools.map((tool) => [tool.name, tool] as const))(
  '%s is a read-only diagnostic',
  (_name, tool) => {
    expect(tool.annotations).toEqual({ readOnlyHint: true, debugging: true });
  },
);
