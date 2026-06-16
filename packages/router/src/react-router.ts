import type { RouteDiagnosticsProvider } from './types';

export interface ReactRouterLikeInput {
  location: {
    pathname: string;
    search?: string;
    hash?: string;
  };
  params?: Record<string, string | undefined>;
  matches?: Array<{ id?: string; pathname?: string; handle?: unknown }>;
  navigation?: {
    state: string;
    location?: { pathname?: string };
  };
}

export function createReactRouterDiagnosticsProvider(
  input: () => ReactRouterLikeInput,
): RouteDiagnosticsProvider {
  return {
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
  };
}
