import type { WebMcpToolDescriptor } from '@react-webmcp-diagnostics/core';

export interface ActionAvailability {
  actionId: string;
  label: string;
  available: boolean;
  reasons: string[];
  category?: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface ActionAvailabilityProvider {
  getActionAvailability(actionId: string): ActionAvailability | undefined;
  listActions?: () => ActionAvailability[];
}

export function createActionAvailabilityTool(
  provider: ActionAvailabilityProvider,
  name = 'why_is_action_unavailable',
): WebMcpToolDescriptor<
  { actionId: string },
  ActionAvailability | { actionId: string; available: false; reasons: string[] }
> {
  return {
    name,
    description:
      'Explains whether a named UI action is available and returns validation, permission, or domain-rule blockers.',
    inputSchema: {
      type: 'object',
      properties: {
        actionId: {
          type: 'string',
          description: 'Stable id of the action to inspect.',
        },
      },
      required: ['actionId'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    validateArgs(args) {
      if (
        typeof args !== 'object' ||
        args === null ||
        typeof (args as { actionId?: unknown }).actionId !== 'string'
      ) {
        throw new Error('Expected { actionId: string }.');
      }

      return args as { actionId: string };
    },
    execute: ({ actionId }) =>
      provider.getActionAvailability(actionId) ?? {
        actionId,
        available: false,
        reasons: ['Unknown action id.'],
      },
  };
}

export function createListActionsTool(
  provider: ActionAvailabilityProvider,
  name = 'list_available_actions',
): WebMcpToolDescriptor<Record<string, never>, { actions: ActionAvailability[] }> {
  return {
    name,
    description:
      'Lists safe action availability summaries for the current page or app scope.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => ({ actions: provider.listActions?.() ?? [] }),
  };
}
