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
  const { registry } = useWebMcpContextValue();
  const exposedTo = options.exposedTo;
  const source = options.source ?? 'scope';

  useEffect(() => {
    const registrations = tools.map((tool) =>
      registry.registerTool(tool, {
        ...options,
        source,
      }),
    );

    return () => {
      for (const registration of registrations) {
        registration.abort();
      }
    };
  }, [registry, tools, exposedTo, source, ...deps]);
}
