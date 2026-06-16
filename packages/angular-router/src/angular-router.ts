import type { RouteDiagnosticsProvider } from '@tooluminati/router';
import {
  createCurrentRouteTool,
  createNavigationStateTool,
  createRouteContextTool,
} from '@tooluminati/router';

export interface AngularRouterSnapshot {
  url: string;
  params?: Record<string, string | undefined>;
  queryParams?: Record<string, string | undefined>;
  fragment?: string | null;
  routeConfigPath?: string | undefined;
  navigationState?: string;
  loaderData?: unknown;
}

export interface AngularRouterDiagnosticsOptions {
  loaderAllowlist?: string[] | undefined;
}

/** @experimental */
export function createAngularRouterDiagnosticsProvider(
  input: () => AngularRouterSnapshot,
  options: AngularRouterDiagnosticsOptions = {},
): RouteDiagnosticsProvider {
  return {
    loaderAllowlist: options.loaderAllowlist,
    getCurrentRoute() {
      const value = input();
      const url = new URL(value.url, 'http://localhost');

      return {
        pathname: url.pathname,
        search: url.search || undefined,
        hash: url.hash || undefined,
        params: value.params,
        matches: value.routeConfigPath
          ? [{ path: value.routeConfigPath }]
          : undefined,
      };
    },
    getNavigationState() {
      const value = input();
      return {
        state: value.navigationState ?? 'idle',
      };
    },
    getRouteContext() {
      const value = input();
      return {
        routeId: value.routeConfigPath,
        loaderData: value.loaderData,
      };
    },
  };
}

export function createAngularRouteTools(
  provider: RouteDiagnosticsProvider,
) {
  return [
    createCurrentRouteTool(provider),
    createNavigationStateTool(provider),
    createRouteContextTool(provider),
  ];
}
