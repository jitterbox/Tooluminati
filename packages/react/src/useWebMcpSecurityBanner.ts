import { useMemo } from 'react';
import { isWebMcpSupported } from '@tooluminati/core';
import { useWebMcpContextValue } from './useWebMcpRegistry';

export function useWebMcpSecurityBanner() {
  const { enabled, registry } = useWebMcpContextValue();

  return useMemo(
    () => ({
      enabled,
      supported: isWebMcpSupported(),
      registeredTools: registry.getRegisteredToolNames(),
      message: enabled
        ? 'Tooluminati diagnostics are enabled for this page.'
        : 'Tooluminati diagnostics are disabled.',
    }),
    [enabled, registry],
  );
}
