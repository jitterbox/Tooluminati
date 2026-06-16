import type { WebMcpToolDescriptor } from '@tooluminati/core';

export interface HydrationHealth {
  recoverableErrorCount: number;
  lastRecoverableError?: string;
}

export function createHydrationHealthTracker() {
  const health: HydrationHealth = { recoverableErrorCount: 0 };

  return {
    recordRecoverableError(error: unknown) {
      health.recoverableErrorCount += 1;
      health.lastRecoverableError =
        error instanceof Error ? error.message : String(error);
    },
    getHealth(): HydrationHealth {
      return { ...health };
    },
  };
}

export function createHydrationHealthTool(
  getHealth: () => HydrationHealth,
  name = 'get_hydration_health',
): WebMcpToolDescriptor<Record<string, never>, HydrationHealth> {
  return {
    name,
    description:
      'Returns development-only React hydration health and recoverable error summary.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => getHealth(),
  };
}
