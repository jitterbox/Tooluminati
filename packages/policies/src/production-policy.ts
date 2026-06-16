import type { WebMcpToolDescriptor } from '@tooluminati/core';
import type { PolicyContext, PolicyDecision, ProductionPolicy } from './types';

export interface ProductionPolicyOptions {
  allowProduction?: boolean;
  allowlist?: string[];
}

export function createProductionPolicy(
  options: ProductionPolicyOptions = {},
): ProductionPolicy {
  const allowlist = new Set(options.allowlist ?? []);

  return {
    canRegister(
      tool: WebMcpToolDescriptor,
      context: PolicyContext = {},
    ): PolicyDecision {
      const isProduction =
        context.production === true || context.environment === 'production';

      if (!isProduction) {
        return { allowed: true, warnings: [] };
      }

      if (options.allowProduction !== true) {
        return {
          allowed: false,
          warnings: [],
          reason: 'WebMCP diagnostics are disabled in production by policy.',
        };
      }

      if (allowlist.size > 0 && !allowlist.has(tool.name)) {
        return {
          allowed: false,
          warnings: [],
          reason: `Tool "${tool.name}" is not in the production allowlist.`,
        };
      }

      return { allowed: true, warnings: [] };
    },
  };
}

export const productionOffPolicy = createProductionPolicy();
export const productionSafePolicy = createProductionPolicy({
  allowProduction: true,
});
