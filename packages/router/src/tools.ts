import type { WebMcpToolDescriptor } from '@tooluminati/core';
import type {
  NavigationSummary,
  RouteContextSummary,
  RouteDiagnosticsProvider,
  RouteSummary,
} from './types';

export function createCurrentRouteTool(
  provider: RouteDiagnosticsProvider,
  name = 'get_current_route',
): WebMcpToolDescriptor<Record<string, never>, RouteSummary> {
  return {
    name,
    description:
      'Returns the current router-derived route, params, search, hash, and safe match summary.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => provider.getCurrentRoute(),
  };
}

export function createNavigationStateTool(
  provider: RouteDiagnosticsProvider,
  name = 'get_navigation_state',
): WebMcpToolDescriptor<Record<string, never>, NavigationSummary> {
  return {
    name,
    description:
      'Returns router navigation state, pending path, blockers, and safe blocker reasons.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () =>
      provider.getNavigationState?.() ?? {
        state: 'idle',
      },
  };
}

function pickAllowlistedLoaderData(
  data: unknown,
  allowlist: string[] | undefined,
): unknown {
  if (!data || typeof data !== 'object' || !allowlist?.length) {
    return undefined;
  }

  const record = data as Record<string, unknown>;
  return Object.fromEntries(
    allowlist
      .filter((key) => key in record)
      .map((key) => [key, record[key]]),
  );
}

export function createRouteContextTool(
  provider: RouteDiagnosticsProvider,
  name = 'get_route_context',
): WebMcpToolDescriptor<Record<string, never>, RouteContextSummary> {
  return {
    name,
    description:
      'Returns a redacted summary of current route loader/context state before any raw data.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => {
      const context = provider.getRouteContext?.() ?? {};
      const loaderData = pickAllowlistedLoaderData(
        context.loaderData,
        provider.loaderAllowlist,
      );

      return {
        routeId: context.routeId,
        loaderStatus: context.loaderStatus,
        dataShape: context.dataShape,
        safeLabels: context.safeLabels,
        ...(loaderData !== undefined ? { loaderData } : {}),
      };
    },
  };
}
