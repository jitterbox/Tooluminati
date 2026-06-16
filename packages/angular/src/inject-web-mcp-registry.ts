import { inject } from '@angular/core';
import type { WebMcpRegistry } from '@tooluminati/core';
import { WEB_MCP_CONTEXT } from './web-mcp-context';

export function injectWebMcpContextValue(
  fallbackRegistry?: WebMcpRegistry,
): import('./web-mcp-context').WebMcpAngularContextValue {
  if (fallbackRegistry) {
    return {
      registry: fallbackRegistry,
      enabled: true,
    };
  }

  const context = inject(WEB_MCP_CONTEXT, { optional: true });
  if (!context) {
    throw new Error(
      'injectWebMcpRegistry() called outside a WebMcp provider. ' +
        'Add provideWebMcpRegistry() to your application or route providers.',
    );
  }

  return context;
}

export function injectWebMcpRegistry(
  fallbackRegistry?: WebMcpRegistry,
): WebMcpRegistry {
  return injectWebMcpContextValue(fallbackRegistry).registry;
}
