import { useMemo } from 'react';
import type { VisibleToolSummary } from '@react-webmcp-diagnostics/core';
import { useWebMcpRegistry } from '@react-webmcp-diagnostics/react';

export function useRegisteredTools(): VisibleToolSummary[] {
  const registry = useWebMcpRegistry();

  return useMemo(
    () => registry.getVisibleToolSummaries(),
    [registry],
  );
}
