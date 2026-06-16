import type { RouteDiagnosticsProvider } from './types';

export interface NextClientRouterLikeInput {
  pathname: string;
  search?: string;
  hash?: string;
  params?: Record<string, string | undefined>;
}

export interface NextClientRouterDiagnosticsOptions {
  loaderAllowlist?: string[] | undefined;
}

/**
 * Client-only pathname/search adapter for Next.js App Router pages.
 * Server Components are not observable from the browser runtime.
 *
 * @experimental
 */
export function createNextClientRouterDiagnosticsProvider(
  input: () => NextClientRouterLikeInput,
  options: NextClientRouterDiagnosticsOptions = {},
): RouteDiagnosticsProvider {
  return {
    loaderAllowlist: options.loaderAllowlist,
    getCurrentRoute() {
      const value = input();
      return {
        pathname: value.pathname,
        search: value.search,
        hash: value.hash,
        params: value.params,
      };
    },
    getNavigationState() {
      return { state: 'idle' };
    },
  };
}
