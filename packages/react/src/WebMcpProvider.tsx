import {
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import {
  WebMcpRegistry,
  type WebMcpRegistryOptions,
  type WebMcpToolDescriptor,
} from '@react-webmcp-diagnostics/core';
import {
  localDevPolicy,
  type WebMcpPolicySet,
} from '@react-webmcp-diagnostics/policies';
import { WebMcpContext } from './WebMcpContext';

export interface WebMcpProviderProps {
  children: ReactNode;
  tools?: WebMcpToolDescriptor[];
  enabled?: boolean;
  strict?: boolean;
  namespace?: string;
  policies?: WebMcpPolicySet;
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
  modelContext,
  getAppContext,
  onSecurityWarning,
  onError,
}: WebMcpProviderProps) {
  const registry = useMemo(
    () =>
      new WebMcpRegistry({
        enabled,
        strict,
        namespace,
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

  const value = useMemo(
    () => ({ registry, enabled, policies }),
    [enabled, policies, registry],
  );

  return (
    <WebMcpContext.Provider value={value}>{children}</WebMcpContext.Provider>
  );
}
