import {
  EnvironmentProviders,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  signal,
} from '@angular/core';
import type { WebMcpToolDescriptor } from '@tooluminati/core';
import { createActionAvailabilityTool } from '@tooluminati/diagnostics';
import {
  provideWebMcpRegistry,
  registerWebMcpTools,
} from '@tooluminati/angular';
import {
  createAngularRouterDiagnosticsProvider,
  provideWebMcpRouteTools,
} from '@tooluminati/angular-router';

export const pathname = signal('/dashboard');

export const routes = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/dashboard/settings', label: 'Settings' },
] as const;

export function setPathname(path: string): void {
  pathname.set(path);
}

const routerProvider = createAngularRouterDiagnosticsProvider(() => {
  const current = pathname();
  const snapshot = {
    url: current,
    routeConfigPath: current,
    navigationState: 'idle',
  };

  if (current === '/dashboard/settings') {
    return { ...snapshot, params: { tab: 'profile' } };
  }

  return snapshot;
});

function createExportActions() {
  return {
    getActionAvailability(actionId: string) {
      if (actionId !== 'export-report') {
        return undefined;
      }

      return {
        actionId,
        label: 'Export report',
        available: false,
        reasons: ['Export is disabled in this demo environment.'],
        category: 'admin',
      };
    },
    listActions() {
      return [
        {
          actionId: 'export-report',
          label: 'Export report',
          available: false,
          reasons: ['Export is disabled in this demo environment.'],
        },
      ];
    },
  };
}

export function provideRouterDiagnostics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      registerWebMcpTools(
        [
          createActionAvailabilityTool(
            createExportActions(),
          ) as WebMcpToolDescriptor,
        ],
        { source: 'scope' },
      );
    }),
    provideWebMcpRouteTools(routerProvider),
  ]);
}

export const appProviders = [
  provideWebMcpRegistry({ enabled: isDevMode() }),
  provideRouterDiagnostics(),
];
