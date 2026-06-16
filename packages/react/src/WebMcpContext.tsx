import { createContext } from 'react';
import type {
  PolicyContext,
  WebMcpRegistry,
} from '@tooluminati/core';
import type { WebMcpPolicySet } from '@tooluminati/policies';

export interface WebMcpReactContextValue {
  registry: WebMcpRegistry;
  enabled: boolean;
  policies?: WebMcpPolicySet;
  policyContext?: PolicyContext | undefined;
  namespace?: string | undefined;
}

export const WebMcpContext = createContext<WebMcpReactContextValue | null>(
  null,
);
