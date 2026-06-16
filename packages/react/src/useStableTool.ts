import { useMemo, type DependencyList } from 'react';
import type { WebMcpToolDescriptor } from '@tooluminati/core';

export function useStableTool<TArgs, TResult>(
  factory: () => WebMcpToolDescriptor<TArgs, TResult>,
  deps: DependencyList,
): WebMcpToolDescriptor<TArgs, TResult> {
  return useMemo(factory, deps);
}
