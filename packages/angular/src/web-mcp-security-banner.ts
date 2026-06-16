import { computed } from '@angular/core';
import { isWebMcpSupported } from '@tooluminati/core';
import { injectWebMcpContextValue } from './inject-web-mcp-registry';

export function webMcpSecurityBanner() {
  const { enabled, registry, registryRevision } = injectWebMcpContextValue();

  return computed(() => {
    registryRevision?.();

    return {
      enabled,
      supported: isWebMcpSupported(),
      registeredTools: registry.getRegisteredToolNames(),
      message: enabled
        ? 'Tooluminati diagnostics are enabled for this page.'
        : 'Tooluminati diagnostics are disabled.',
    };
  });
}
