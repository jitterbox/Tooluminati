import {
  DestroyRef,
  EnvironmentProviders,
  isDevMode,
  makeEnvironmentProviders,
  Optional,
  signal,
  SkipSelf,
} from '@angular/core';
import {
  WebMcpRegistry,
  type PolicyContext,
  type WebMcpRegistryOptions,
  type WebMcpToolDescriptor,
} from '@tooluminati/core';
import {
  localDevPolicy,
  type WebMcpPolicySet,
} from '@tooluminati/policies';
import {
  WEB_MCP_CONTEXT,
  type WebMcpAngularContextValue,
} from './web-mcp-context';

export interface WebMcpRegistryConfig {
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

function buildContextValue(
  registry: WebMcpRegistry,
  config: WebMcpRegistryConfig,
  registryRevision: ReturnType<typeof signal<number>>,
): WebMcpAngularContextValue {
  const value: WebMcpAngularContextValue = {
    registry,
    enabled: config.enabled ?? false,
    policies: config.policies ?? localDevPolicy,
    registryRevision,
  };

  if (config.policyContext !== undefined) {
    value.policyContext = config.policyContext;
  }

  if (config.namespace !== undefined) {
    value.namespace = config.namespace;
  }

  return value;
}

export function provideWebMcpRegistry(
  config: WebMcpRegistryConfig = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: WEB_MCP_CONTEXT,
      useFactory: (
        parentContext: WebMcpAngularContextValue | null,
        destroyRef: DestroyRef,
      ) => {
        if (
          parentContext &&
          config.namespace === undefined &&
          isDevMode()
        ) {
          console.warn(
            '[tooluminati] Nested WebMcp provider detected without a namespace. ' +
              'Provide namespace to avoid tool collisions.',
          );
        }

        const registryRevision = signal(0);
        const bumpRegistryRevision = () => {
          registryRevision.update((value) => value + 1);
        };

        const registry = new WebMcpRegistry({
          enabled: config.enabled ?? false,
          strict: config.strict ?? false,
          namespace: config.namespace,
          policies: config.policies ?? localDevPolicy,
          policyContext: config.policyContext,
          modelContext: config.modelContext,
          getAppContext: config.getAppContext,
          onSecurityWarning: config.onSecurityWarning,
          onError: config.onError,
          onRegister: () => bumpRegistryRevision(),
        });

        const tools = config.tools ?? [];
        const registrations = tools.map((tool) =>
          registry.registerTool(tool, { source: 'provider' }),
        );

        destroyRef.onDestroy(() => {
          for (const registration of registrations) {
            registration.abort();
          }

          registry.unregisterAll();
          bumpRegistryRevision();
        });

        return buildContextValue(registry, config, registryRevision);
      },
      deps: [[new Optional(), new SkipSelf(), WEB_MCP_CONTEXT], DestroyRef],
    },
  ]);
}

export function createWebMcpRegistryForTesting(
  config: WebMcpRegistryConfig = {},
): WebMcpAngularContextValue {
  const registry = new WebMcpRegistry({
    enabled: config.enabled ?? false,
    strict: config.strict ?? false,
    namespace: config.namespace,
    policies: config.policies ?? localDevPolicy,
    policyContext: config.policyContext,
    modelContext: config.modelContext,
    getAppContext: config.getAppContext,
    onSecurityWarning: config.onSecurityWarning,
    onError: config.onError,
  });

  const tools = config.tools ?? [];
  for (const tool of tools) {
    registry.registerTool(tool, { source: 'provider' });
  }

  return buildContextValue(registry, config, signal(0));
}
