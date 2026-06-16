import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import type { WebMcpToolDescriptor } from '@tooluminati/core';
import { registerWebMcpTools } from '@tooluminati/angular';
import type { RouteDiagnosticsProvider } from '@tooluminati/router';
import { createAngularRouteTools } from './angular-router';

export function provideWebMcpRouteTools(
  provider: RouteDiagnosticsProvider,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      registerWebMcpTools(
        createAngularRouteTools(provider) as WebMcpToolDescriptor[],
        {
          source: 'route',
        },
      );
    }),
  ]);
}

export function provideWebMcpRouteScope(
  provider: RouteDiagnosticsProvider,
): EnvironmentProviders {
  return provideWebMcpRouteTools(provider);
}
