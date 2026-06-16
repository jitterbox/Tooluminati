import { createContext } from 'react';
import type { WebMcpRegistry } from '@react-webmcp-diagnostics/core';
import type { WebMcpPolicySet } from '@react-webmcp-diagnostics/policies';

export interface WebMcpReactContextValue {
  registry: WebMcpRegistry;
  enabled: boolean;
  policies?: WebMcpPolicySet;
}

export const WebMcpContext = createContext<WebMcpReactContextValue | null>(
  null,
);
