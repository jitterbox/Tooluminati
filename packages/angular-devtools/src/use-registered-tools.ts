import { computed } from '@angular/core';
import {
  injectWebMcpContextValue,
  injectWebMcpRegistry,
} from '@tooluminati/angular';
import type { VisibleToolSummary } from '@tooluminati/core';

export function webMcpRegisteredTools() {
  const context = injectWebMcpContextValue();
  const registry = injectWebMcpRegistry();

  return computed((): VisibleToolSummary[] => {
    context.registryRevision?.();
    return registry.getVisibleToolSummaries();
  });
}
