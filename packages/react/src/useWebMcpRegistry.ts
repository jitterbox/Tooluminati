import { useContext } from 'react';
import { WebMcpContext } from './WebMcpContext';

export function useWebMcpRegistry() {
  const context = useContext(WebMcpContext);

  if (!context) {
    throw new Error('useWebMcpRegistry must be used within WebMcpProvider.');
  }

  return context.registry;
}

export function useWebMcpContextValue() {
  const context = useContext(WebMcpContext);

  if (!context) {
    throw new Error('WebMCP hooks must be used within WebMcpProvider.');
  }

  return context;
}
