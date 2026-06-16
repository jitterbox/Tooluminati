import { useContext } from 'react';
import type { WebMcpRegistry } from '@react-webmcp-diagnostics/core';
import { WebMcpContext } from './WebMcpContext';

export function useWebMcpRegistry() {
  const context = useContext(WebMcpContext);

  if (!context) {
    throw new Error('useWebMcpRegistry must be used within WebMcpProvider.');
  }

  return context.registry;
}

export function useWebMcpContextValue(fallbackRegistry?: WebMcpRegistry) {
  const context = useContext(WebMcpContext);

  if (!context && !fallbackRegistry) {
    throw new Error('WebMCP hooks must be used within WebMcpProvider.');
  }

  if (context) {
    return context;
  }

  return {
    registry: fallbackRegistry as WebMcpRegistry,
    enabled: false,
  };
}
