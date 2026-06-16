import {
  assertInInjectionContext,
  DestroyRef,
  inject,
} from '@angular/core';
import type {
  RegisterToolOptions,
  WebMcpExecutionContext,
  WebMcpRegistry,
  WebMcpToolDescriptor,
} from '@tooluminati/core';
import { injectWebMcpRegistry } from './inject-web-mcp-registry';

export interface RegisterWebMcpToolOptions extends RegisterToolOptions {
  fallbackRegistry?: WebMcpRegistry;
}

export function registerWebMcpTool<TArgs, TResult>(
  getTool: () => WebMcpToolDescriptor<TArgs, TResult>,
  options: RegisterWebMcpToolOptions = {},
): void {
  assertInInjectionContext(registerWebMcpTool);
  const registry = injectWebMcpRegistry(options.fallbackRegistry);
  const destroyRef = inject(DestroyRef);
  const toolRef = { current: getTool() };

  const registration = registry.registerTool(
    {
      ...toolRef.current,
      execute: (args: TArgs, executionContext: WebMcpExecutionContext) =>
        toolRef.current.execute(args, executionContext),
    },
    {
      ...options,
      source: options.source ?? 'hook',
    },
  );

  destroyRef.onDestroy(() => registration.abort());
}

export function stableSerialize(value: unknown): string {
  return JSON.stringify(value, (_key, current) =>
    current && typeof current === 'object' && !Array.isArray(current)
      ? Object.keys(current as Record<string, unknown>)
          .sort()
          .reduce<Record<string, unknown>>((accumulator, key) => {
            accumulator[key] = (current as Record<string, unknown>)[key];
            return accumulator;
          }, {})
      : current,
  );
}
