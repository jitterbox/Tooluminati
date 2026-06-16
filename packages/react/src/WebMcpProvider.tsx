import {
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import {
  WebMcpRegistry,
  type PolicyContext,
  type WebMcpRegistryOptions,
  type WebMcpToolDescriptor,
} from '@react-webmcp-diagnostics/core';
import {
  localDevPolicy,
  type WebMcpPolicySet,
} from '@react-webmcp-diagnostics/policies';
import { WebMcpContext, type WebMcpReactContextValue } from './WebMcpContext';

export interface WebMcpProviderProps {
  children: ReactNode;
  tools?: WebMcpToolDescriptor[];
  enabled?: boolean;
  strict?: boolean;
  namespace?: string;
  policies?: WebMcpPolicySet;
  policyContext?: PolicyContext;
  modelContext?: WebMcpRegistryOptions['modelContext'];
  getAppContext?: () => unknown;
  onSecurityWarning?: WebMcpRegistryOptions['onSecurityWarning'];
  onError?: WebMcpRegistryOptions['onError'];
}

export function WebMcpProvider({
  children,
  tools = [],
  enabled = false,
  strict = false,
  namespace,
  policies = localDevPolicy,
  policyContext,
  modelContext,
  getAppContext,
  onSecurityWarning,
  onError,
}: WebMcpProviderProps) {
  const parentContext = useContext(WebMcpContext);

  useEffect(() => {
    if (
      parentContext &&
      namespace === undefined &&
      typeof process !== 'undefined' &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.warn(
        '[react-webmcp-diagnostics] Nested WebMcpProvider detected without a namespace. Provide namespace to avoid tool collisions.',
      );
    }
  }, [namespace, parentContext]);

  const registry = useMemo(
    () =>
      new WebMcpRegistry({
        enabled,
        strict,
        namespace,
        policies,
        policyContext,
        modelContext,
        getAppContext,
        onSecurityWarning,
        onError,
      }),
    [
      enabled,
      getAppContext,
      modelContext,
      namespace,
      onError,
      onSecurityWarning,
      policies,
      policyContext,
      strict,
    ],
  );

  useEffect(() => {
    const registrations = tools.map((tool) =>
      registry.registerTool(tool, { source: 'provider' }),
    );

    return () => {
      for (const registration of registrations) {
        registration.abort();
      }
    };
  }, [registry, tools]);

  useEffect(() => () => registry.unregisterAll(), [registry]);

  const value = useMemo(() => {
    const next: WebMcpReactContextValue = {
      registry,
      enabled,
      policies,
    };
    if (policyContext !== undefined) {
      next.policyContext = policyContext;
    }
    if (namespace !== undefined) {
      next.namespace = namespace;
    }
    return next;
  }, [enabled, namespace, policies, policyContext, registry]);

  return (
    <WebMcpContext.Provider value={value}>{children}</WebMcpContext.Provider>
  );
}
