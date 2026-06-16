import type { ReactNode } from 'react';
import type {
  WebMcpToolDescriptor,
  WebMcpToolSource,
} from '@react-webmcp-diagnostics/core';
import { useWebMcpTools } from './useWebMcpTools';

export interface WebMcpScopeProps {
  children: ReactNode;
  tools: WebMcpToolDescriptor[];
  source?: WebMcpToolSource;
}

export function WebMcpScope({
  children,
  tools,
  source = 'scope',
}: WebMcpScopeProps) {
  useWebMcpTools(tools, [tools], { source });

  return <>{children}</>;
}
