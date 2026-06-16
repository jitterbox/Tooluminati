import { useMemo } from 'react';
import { isWebMcpSupported } from '@react-webmcp-diagnostics/core';
import { useWebMcpContextValue } from './useWebMcpRegistry';

export function useWebMcpSecurityBanner() {
  const { enabled, registry } = useWebMcpContextValue();

  return useMemo(
    () => ({
      enabled,
      supported: isWebMcpSupported(),
      registeredTools: registry.getRegisteredToolNames(),
      message: enabled
        ? 'WebMCP diagnostics are enabled for this page.'
        : 'WebMCP diagnostics are disabled.',
    }),
    [enabled, registry],
  );
}
