import {
  assertInInjectionContext,
  DestroyRef,
  effect,
  inject,
  untracked,
  type Signal,
} from '@angular/core';
import type {
  RegisterToolOptions,
  RegisteredWebMcpTool,
  WebMcpExecutionContext,
  WebMcpRegistry,
  WebMcpToolDescriptor,
} from '@tooluminati/core';
import { injectWebMcpRegistry } from './inject-web-mcp-registry';
import { WEB_MCP_CONTEXT } from './web-mcp-context';

export interface RegisterWebMcpToolOptions extends RegisterToolOptions {
  fallbackRegistry?: WebMcpRegistry;
  /** Signal dependencies that trigger tool definition re-registration. */
  definitionDeps?: Signal<unknown>[];
}

function stableSerialize(value: unknown): string {
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

function buildDefinitionKey(
  tool: WebMcpToolDescriptor<unknown, unknown>,
  options: RegisterWebMcpToolOptions,
): Record<string, unknown> {
  return {
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema,
    annotations: tool.annotations,
    exposedTo: options.exposedTo,
    source: options.source,
  };
}

function registerToolInstance<TArgs, TResult>(
  registry: WebMcpRegistry,
  toolRef: { current: WebMcpToolDescriptor<TArgs, TResult> },
  options: RegisterWebMcpToolOptions,
): RegisteredWebMcpTool {
  return registry.registerTool(
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
}

export function registerWebMcpTool<TArgs, TResult>(
  getTool: () => WebMcpToolDescriptor<TArgs, TResult>,
  options: RegisterWebMcpToolOptions = {},
): void {
  assertInInjectionContext(registerWebMcpTool);
  const registry = injectWebMcpRegistry(options.fallbackRegistry);
  const context = inject(WEB_MCP_CONTEXT, { optional: true });
  const destroyRef = inject(DestroyRef);
  const toolRef = { current: getTool() };
  let registration = registerToolInstance(registry, toolRef, options);

  if (options.definitionDeps?.length) {
    let lastDefinitionKey = stableSerialize(
      buildDefinitionKey(
        toolRef.current as WebMcpToolDescriptor<unknown, unknown>,
        options,
      ),
    );

    effect(() => {
      for (const dep of options.definitionDeps!) {
        dep();
      }

      untracked(() => {
        toolRef.current = getTool();
        const definitionKey = stableSerialize(
          buildDefinitionKey(
            toolRef.current as WebMcpToolDescriptor<unknown, unknown>,
            options,
          ),
        );

        if (definitionKey === lastDefinitionKey) {
          return;
        }

        lastDefinitionKey = definitionKey;
        registration.abort();
        context?.registryRevision?.update((value) => value + 1);
        registration = registerToolInstance(registry, toolRef, options);
      });
    });
  }

  destroyRef.onDestroy(() => {
    registration.abort();
    context?.registryRevision?.update((value) => value + 1);
  });
}
