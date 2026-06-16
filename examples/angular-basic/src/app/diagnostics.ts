import {
  EnvironmentProviders,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  signal,
} from '@angular/core';
import type { WebMcpToolDescriptor } from '@tooluminati/core';
import {
  createActionAvailabilityTool,
  createAppInfoTool,
  createVisibleToolsTool,
  type ActionAvailabilityProvider,
} from '@tooluminati/diagnostics';
import {
  provideWebMcpRegistry,
  registerWebMcpTools,
} from '@tooluminati/angular';

const pageTitle = 'Tooluminati';
const dirty = signal(false);

function createPageStateTool(
  getState: () => { title: string; dirty: boolean },
): WebMcpToolDescriptor<
  Record<string, never>,
  { title: string; dirty: boolean }
> {
  return {
    name: 'get_page_state',
    description: 'Returns a safe summary of the current page title and form state.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => getState(),
  };
}

function createActionsProvider(): ActionAvailabilityProvider {
  return {
    getActionAvailability(actionId) {
      if (actionId !== 'save-profile') {
        return undefined;
      }

      return {
        actionId,
        label: 'Save profile',
        available: dirty(),
        reasons: dirty() ? [] : ['No profile changes have been made.'],
        category: 'form',
      };
    },
    listActions() {
      return [
        {
          actionId: 'save-profile',
          label: 'Save profile',
          available: dirty(),
          reasons: dirty() ? [] : ['No profile changes have been made.'],
        },
      ];
    },
  };
}

export function provideBasicDiagnostics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const actions = createActionsProvider();
      registerWebMcpTools(
        [
          createAppInfoTool(() => ({
            name: 'Angular Basic',
            version: '0.0.0',
            environment: isDevMode() ? 'development' : 'production',
            webMcpEnabled: isDevMode(),
          })) as WebMcpToolDescriptor,
          createVisibleToolsTool() as WebMcpToolDescriptor,
          createActionAvailabilityTool(actions) as WebMcpToolDescriptor,
          createPageStateTool(() => ({
            title: pageTitle,
            dirty: dirty(),
          })) as WebMcpToolDescriptor,
        ],
        { source: 'scope' },
      );
    }),
  ]);
}

export function markProfileDirty(): void {
  dirty.set(true);
}

export function isProfileDirty(): boolean {
  return dirty();
}

export { dirty as profileDirty };

export const appProviders = [
  provideWebMcpRegistry({ enabled: isDevMode() }),
  provideBasicDiagnostics(),
];
