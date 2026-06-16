import {
  EnvironmentProviders,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  signal,
} from '@angular/core';
import { redactObject, type WebMcpToolDescriptor } from '@tooluminati/core';
import {
  createActionAvailabilityTool,
  createAppInfoTool,
  type AppInfo,
} from '@tooluminati/diagnostics';
import { localDevPolicy } from '@tooluminati/policies';
import {
  provideWebMcpRegistry,
  registerWebMcpTools,
} from '@tooluminati/angular';

export const acceptedTerms = signal(false);

function getAppInfo(): AppInfo {
  return {
    name: 'Diagnostics Quickstart',
    environment: isDevMode() ? 'development' : 'production',
    apiToken: 'secret-demo-token',
    supportEmail: 'agent@example.com',
  };
}

export function setAcceptedTerms(value: boolean): void {
  acceptedTerms.set(value);
}

export function getRedactedAppInfo(): unknown {
  return redactObject(getAppInfo());
}

export function provideQuickstartDiagnostics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      registerWebMcpTools(
        [
          createActionAvailabilityTool({
            getActionAvailability(actionId) {
              return {
                actionId,
                label: 'Continue',
                available: acceptedTerms(),
                reasons: acceptedTerms()
                  ? []
                  : ['Terms must be accepted first.'],
              };
            },
          }) as WebMcpToolDescriptor,
          createAppInfoTool(() => getAppInfo()) as WebMcpToolDescriptor,
        ],
        { source: 'scope' },
      );
    }),
  ]);
}

export const appProviders = [
  provideWebMcpRegistry({ enabled: isDevMode(), policies: localDevPolicy }),
  provideQuickstartDiagnostics(),
];
