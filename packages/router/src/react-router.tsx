import { useMemo, type ReactNode } from 'react';
import type { WebMcpToolDescriptor } from '@tooluminati/core';
import { WebMcpScope } from '@tooluminati/react';
import {
  createCurrentRouteTool,
  createNavigationStateTool,
  createRouteContextTool,
} from './tools';
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
  loaderData?: unknown;
}

export interface ReactRouterDiagnosticsOptions {
  loaderAllowlist?: string[] | undefined;
}

/** @experimental */
export function createReactRouterDiagnosticsProvider(
  input: () => ReactRouterLikeInput,
  options: ReactRouterDiagnosticsOptions = {},
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
      const value = input();
      return {
        loaderData: value.loaderData,
      };
    },
  };
}

export interface WebMcpReactRouterScopeProps {
  children: ReactNode;
  useRouterState: () => ReactRouterLikeInput;
  loaderAllowlist?: string[] | undefined;
  namespaceSegment?: string | undefined;
}

/** @experimental */
export function WebMcpReactRouterScope({
  children,
  useRouterState,
  loaderAllowlist,
  namespaceSegment,
}: WebMcpReactRouterScopeProps) {
  const provider = useMemo(
    () =>
      createReactRouterDiagnosticsProvider(useRouterState, {
        loaderAllowlist,
      }),
    [useRouterState, loaderAllowlist],
  );

  const tools = useMemo(
    (): WebMcpToolDescriptor[] => [
      createCurrentRouteTool(provider) as WebMcpToolDescriptor,
      createNavigationStateTool(provider) as WebMcpToolDescriptor,
      createRouteContextTool(provider) as WebMcpToolDescriptor,
    ],
    [provider],
  );

  return (
    <WebMcpScope tools={tools} source="route" namespaceSegment={namespaceSegment}>
      {children}
    </WebMcpScope>
  );
}
