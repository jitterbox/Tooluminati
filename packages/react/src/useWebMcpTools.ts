import { useEffect, type DependencyList } from 'react';
import type {
  RegisterToolOptions,
  WebMcpToolDescriptor,
} from '@react-webmcp-diagnostics/core';
import { useWebMcpContextValue } from './useWebMcpRegistry';

export function useWebMcpTools(
  tools: WebMcpToolDescriptor[],
  deps: DependencyList = [],
  options: RegisterToolOptions = {},
): void {
  const { registry, policies } = useWebMcpContextValue();

  useEffect(() => {
    const registrations = tools.flatMap((tool) => {
      const decision = policies?.security.evaluateTool(tool, options);
      for (const warning of decision?.warnings ?? []) {
        console.warn(`[react-webmcp-diagnostics] ${warning}`);
      }
      if (decision && !decision.allowed) {
        console.warn(
          `[react-webmcp-diagnostics] Tool "${tool.name}" not registered: ${decision.reason}`,
        );
        return [];
      }

      return [
        registry.registerTool(tool, {
          ...options,
          source: options.source ?? 'scope',
        }),
      ];
    });

    return () => {
      for (const registration of registrations) {
        registration.abort();
      }
    };
  }, [registry, policies, tools, options, ...deps]);
}
