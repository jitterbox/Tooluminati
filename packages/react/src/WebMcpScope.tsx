import { useMemo, type ReactNode } from 'react';
import type {
  WebMcpToolDescriptor,
  WebMcpToolSource,
} from '@tooluminati/core';
import { useWebMcpContextValue } from './useWebMcpRegistry';
import { useWebMcpTools } from './useWebMcpTools';

export interface WebMcpScopeProps {
  children: ReactNode;
  tools: WebMcpToolDescriptor[];
  source?: WebMcpToolSource;
  namespaceSegment?: string | undefined;
}

export function WebMcpScope({
  children,
  tools,
  source = 'scope',
  namespaceSegment,
}: WebMcpScopeProps) {
  const { namespace } = useWebMcpContextValue();
  const scopedTools = useMemo(
    () =>
      namespaceSegment
        ? tools.map((tool) => ({
            ...tool,
            name: `${namespaceSegment}.${tool.name}`,
          }))
        : tools,
    [namespaceSegment, tools],
  );

  void namespace;

  useWebMcpTools(scopedTools, [scopedTools], { source });

  return <>{children}</>;
}
