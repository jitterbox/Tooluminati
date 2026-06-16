import {
  EnvironmentProviders,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import type { WebMcpToolDescriptor } from '@tooluminati/core';
import {
  createActionAvailabilityTool,
  createAppInfoTool,
  type ActionAvailabilityProvider,
} from '@tooluminati/diagnostics';
import {
  provideWebMcpRegistry,
  registerWebMcpTools,
} from '@tooluminati/angular';

export const CHECKOUT_ACTION_ID = 'complete-checkout';
export const CHECKOUT_BUTTON_LABEL = 'Complete checkout';

const CHECKOUT_REASONS = [
  'Cart contains a restricted item (SKU-404).',
  'Billing address is incomplete.',
];

function createCheckoutActionsProvider(): ActionAvailabilityProvider {
  return {
    getActionAvailability(actionId) {
      if (actionId !== CHECKOUT_ACTION_ID) {
        return undefined;
      }

      return {
        actionId,
        label: CHECKOUT_BUTTON_LABEL,
        available: false,
        reasons: CHECKOUT_REASONS,
        category: 'checkout',
        severity: 'warning',
      };
    },
    listActions() {
      return [
        {
          actionId: CHECKOUT_ACTION_ID,
          label: CHECKOUT_BUTTON_LABEL,
          available: false,
          reasons: CHECKOUT_REASONS,
        },
      ];
    },
  };
}

export function provideCheckoutDiagnostics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const actions = createCheckoutActionsProvider();
      registerWebMcpTools(
        [
          createAppInfoTool(() => ({
            name: 'Angular Troubleshooting Demo',
            environment: isDevMode() ? 'development' : 'production',
            webMcpEnabled: isDevMode(),
          })) as WebMcpToolDescriptor,
          createActionAvailabilityTool(actions) as WebMcpToolDescriptor,
        ],
        { source: 'scope' },
      );
    }),
  ]);
}

export const appProviders = [
  provideWebMcpRegistry({ enabled: isDevMode() }),
  provideCheckoutDiagnostics(),
];
