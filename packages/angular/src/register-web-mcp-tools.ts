import {
  assertInInjectionContext,
  DestroyRef,
  inject,
} from '@angular/core';
import type {
  RegisterToolOptions,
  WebMcpToolDescriptor,
} from '@tooluminati/core';
import { injectWebMcpRegistry } from './inject-web-mcp-registry';

export function registerWebMcpTools(
  tools: WebMcpToolDescriptor[],
  options: RegisterToolOptions = {},
): void {
  assertInInjectionContext(registerWebMcpTools);
  const registry = injectWebMcpRegistry();
  const destroyRef = inject(DestroyRef);
  const source = options.source ?? 'scope';

  const registrations = tools.map((tool) =>
    registry.registerTool(tool, {
      ...options,
      source,
    }),
  );

  destroyRef.onDestroy(() => {
    for (const registration of registrations) {
      registration.abort();
    }
  });
}
