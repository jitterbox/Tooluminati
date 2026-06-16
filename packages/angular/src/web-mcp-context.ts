import { InjectionToken } from '@angular/core';
import type {
  PolicyContext,
  WebMcpRegistry,
} from '@tooluminati/core';
import type { WebMcpPolicySet } from '@tooluminati/policies';

export interface WebMcpAngularContextValue {
  registry: WebMcpRegistry;
  enabled: boolean;
  policies?: WebMcpPolicySet;
  policyContext?: PolicyContext | undefined;
  namespace?: string | undefined;
}

export const WEB_MCP_CONTEXT = new InjectionToken<WebMcpAngularContextValue>(
  'WEB_MCP_CONTEXT',
);
