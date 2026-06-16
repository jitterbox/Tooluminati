import { useEffect, useMemo, type DependencyList } from 'react';
import type {
  RegisterToolOptions,
  WebMcpToolDescriptor as AnyWebMcpToolDescriptor,
  WebMcpToolDescriptor,
} from '@react-webmcp-diagnostics/core';
import { useLatestRef } from './useLatestRef';
import { useWebMcpContextValue } from './useWebMcpRegistry';

export function useWebMcpTool<TArgs, TResult>(
  tool: WebMcpToolDescriptor<TArgs, TResult>,
  deps: DependencyList = [],
  options: RegisterToolOptions = {},
): void {
  const { registry, policies } = useWebMcpContextValue();
  const toolRef = useLatestRef(tool);

  const definitionKey = useMemo(
    () =>
      JSON.stringify({
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
    const decision = policies?.security.evaluateTool(
      latest as AnyWebMcpToolDescriptor,
      options,
    );
    for (const warning of decision?.warnings ?? []) {
      console.warn(`[react-webmcp-diagnostics] ${warning}`);
    }
    if (decision && !decision.allowed) {
      console.warn(
        `[react-webmcp-diagnostics] Tool "${latest.name}" not registered: ${decision.reason}`,
      );
      return;
    }

    const registration = registry.registerTool(
      {
        ...latest,
        execute: (args, context) => toolRef.current.execute(args, context),
      },
      {
        ...options,
        source: options.source ?? 'hook',
      },
    );

    return () => registration.abort();
    // The definition key captures registration-defining fields. The caller's
    // deps decide when intentionally dynamic semantics should re-register.
  }, [definitionKey, registry, toolRef, policies, ...deps]);
}
