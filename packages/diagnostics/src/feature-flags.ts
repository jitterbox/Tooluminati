import type { WebMcpToolDescriptor } from '@tooluminati/core';

export interface FeatureFlagSummary {
  name: string;
  enabled: boolean;
  reason?: string;
}

export function createFeatureFlagsTool(
  getFlags: () => FeatureFlagSummary[],
  name = 'get_feature_flags_summary',
): WebMcpToolDescriptor<Record<string, never>, { flags: FeatureFlagSummary[] }> {
  return {
    name,
    description:
      'Returns safe feature flag names and enabled states without exposing user targeting data.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, debugging: true },
    execute: () => ({ flags: getFlags() }),
  };
}
