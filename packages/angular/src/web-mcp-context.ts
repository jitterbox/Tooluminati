import { InjectionToken, type WritableSignal } from '@angular/core';
import type {
  PolicyContext,
  WebMcpRegistry,
} from '@tooluminati/core';
import type { WebMcpPolicySet } from '@tooluminati/policies';

export interface WebMcpAngularContextValue {
  registry: WebMcpRegistry;
  enabled: boolean;
  /** Bumps when tools register or unregister so UI can react. */
  registryRevision?: WritableSignal<number>;
  policies?: WebMcpPolicySet;
  policyContext?: PolicyContext | undefined;
  namespace?: string | undefined;
}

export const WEB_MCP_CONTEXT = new InjectionToken<WebMcpAngularContextValue>(
  'WEB_MCP_CONTEXT',
);
