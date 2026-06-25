import { useMemo } from 'react';
import type { WebMcpToolDescriptor } from '@tooluminati/core';
import { useWebMcpTools } from '@tooluminati/react';
import {
  createQueryCacheSummaryTool,
  type QueryClientLike,
} from '@tooluminati/state';

export interface TanStackQueryWebMcpToolsOptions {
  allowKeys: unknown[];
  includeDataShape?: boolean;
  includeData?: boolean;
  name?: string;
}

export function useTanStackQueryWebMcpTools(
  queryClient: QueryClientLike,
  options: TanStackQueryWebMcpToolsOptions,
): void {
  const {
    allowKeys,
    includeDataShape,
    includeData,
    name,
  } = options;

  const tool = useMemo((): WebMcpToolDescriptor => {
    return createQueryCacheSummaryTool({
      queryClient,
      allowKeys,
      ...(includeDataShape !== undefined ? { includeDataShape } : {}),
      ...(includeData !== undefined ? { includeData } : {}),
      ...(name ? { name } : {}),
    }) as WebMcpToolDescriptor;
  }, [queryClient, allowKeys, includeDataShape, includeData, name]);

  useWebMcpTools([tool], [tool], { source: 'diagnostic' });
}
