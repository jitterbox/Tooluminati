import type { WebMcpToolDescriptor } from '@react-webmcp-diagnostics/core';
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
    execute: () => provider.getRouteContext?.() ?? {},
  };
}
