import type { RouteDiagnosticsProvider } from './types';

export interface TanStackRouterLikeInput {
  location: {
    pathname: string;
    search?: string;
    hash?: string;
  };
  params?: Record<string, string | undefined>;
  matches?: Array<{ id?: string; pathname?: string; status?: string }>;
  navigation?: {
    state: string;
    location?: { pathname?: string };
  };
  loaderData?: unknown;
}

export interface TanStackRouterDiagnosticsOptions {
  loaderAllowlist?: string[] | undefined;
}

/** @experimental */
export function createTanStackRouterDiagnosticsProvider(
  input: () => TanStackRouterLikeInput,
  options: TanStackRouterDiagnosticsOptions = {},
): RouteDiagnosticsProvider {
  return {
    loaderAllowlist: options.loaderAllowlist,
    getCurrentRoute() {
      const value = input();
      return {
        pathname: value.location.pathname,
        search: value.location.search,
        hash: value.location.hash,
        params: value.params,
        matches: value.matches?.map((match) => ({
          id: match.id,
          path: match.pathname,
          status: match.status,
        })),
      };
    },
    getNavigationState() {
      const navigation = input().navigation;
      return {
        state: navigation?.state ?? 'idle',
        pendingPathname: navigation?.location?.pathname,
      };
    },
    getRouteContext() {
      return {
        loaderData: input().loaderData,
      };
    },
  };
}
