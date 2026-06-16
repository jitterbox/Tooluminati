import { useEffect, useMemo, type DependencyList } from 'react';
import type {
  RegisterToolOptions,
  WebMcpRegistry,
  WebMcpToolDescriptor,
} from '@react-webmcp-diagnostics/core';
import { useLatestRef } from './useLatestRef';
import { useWebMcpContextValue } from './useWebMcpRegistry';

export interface UseWebMcpToolOptions extends RegisterToolOptions {
  fallbackRegistry?: WebMcpRegistry;
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

export function useWebMcpTool<TArgs, TResult>(
  tool: WebMcpToolDescriptor<TArgs, TResult>,
  deps: DependencyList = [],
  options: UseWebMcpToolOptions = {},
): void {
  const context = useWebMcpContextValue(options.fallbackRegistry);
  const registry = options.fallbackRegistry ?? context.registry;
  const toolRef = useLatestRef(tool);

  const definitionKey = useMemo(
    () =>
      stableSerialize({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: tool.annotations,
        exposedTo: options.exposedTo,
        source: options.source,
      }),
    [
      tool.name,
      tool.title,
      tool.description,
      tool.inputSchema,
      tool.annotations,
      options.exposedTo,
      options.source,
    ],
  );

  useEffect(() => {
    const latest = toolRef.current;
    const registration = registry.registerTool(
      {
        ...latest,
        execute: (args, executionContext) =>
          toolRef.current.execute(args, executionContext),
      },
      {
        ...options,
        source: options.source ?? 'hook',
      },
    );

    return () => registration.abort();
  }, [definitionKey, registry, toolRef, options.exposedTo, options.source, ...deps]);
}
