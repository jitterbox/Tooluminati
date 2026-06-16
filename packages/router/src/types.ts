export interface RouteSummary {
  pathname: string;
  search?: string | undefined;
  hash?: string | undefined;
  params?: Record<string, string | undefined> | undefined;
  matches?: Array<{
    id?: string | undefined;
    path?: string | undefined;
    status?: string | undefined;
    label?: string | undefined;
  }> | undefined;
}

export interface NavigationSummary {
  state: 'idle' | 'loading' | 'submitting' | string;
  pendingPathname?: string | undefined;
  blocked?: boolean | undefined;
  blockerReasons?: string[] | undefined;
}

export interface RouteContextSummary {
  routeId?: string | undefined;
  loaderStatus?: string | undefined;
  dataShape?: unknown;
  safeLabels?: string[] | undefined;
  loaderData?: unknown;
}

export interface RouteDiagnosticsProvider {
  getCurrentRoute(): RouteSummary;
  getNavigationState?: () => NavigationSummary;
  getRouteContext?: () => RouteContextSummary;
  loaderAllowlist?: string[] | undefined;
}
