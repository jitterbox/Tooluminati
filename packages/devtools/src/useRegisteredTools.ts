import { useMemo } from 'react';
import type { VisibleToolSummary } from '@tooluminati/core';
import { useWebMcpRegistry } from '@tooluminati/react';

export function useRegisteredTools(): VisibleToolSummary[] {
  const registry = useWebMcpRegistry();

  return useMemo(
    () => registry.getVisibleToolSummaries(),
    [registry],
  );
}
