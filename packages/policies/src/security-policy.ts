import {
  classifyTool,
  createSecurityWarning,
  validateExposedOrigins,
  type WebMcpToolDescriptor,
  type RegisterToolOptions,
} from '@tooluminati/core';
import type { PolicyContext, PolicyDecision, SecurityPolicy } from './types';

export interface SecurityPolicyOptions {
  strict?: boolean;
}

export function createSecurityPolicy(
  options: SecurityPolicyOptions = {},
): SecurityPolicy {
  return {
    evaluateTool(
      tool: WebMcpToolDescriptor,
      registerOptions: RegisterToolOptions = {},
      _context: PolicyContext = {},
    ): PolicyDecision {
      const warnings: string[] = [];

      try {
        validateExposedOrigins(registerOptions.exposedTo);
      } catch (error) {
        return {
          allowed: false,
          warnings,
          reason: error instanceof Error ? error.message : String(error),
        };
      }

      const risk = classifyTool(tool);
      const warning = createSecurityWarning(tool, risk);
      if (warning) {
        warnings.push(warning);
      }

      const isWriteTool =
        tool.annotations?.readOnlyHint === false || tool.meta?.readOnly === false;
      if (isWriteTool && !tool.confirmBeforeExecute && !tool.confirmationHandler) {
        const message = `Write-capable tool "${tool.name}" has no confirmation handler.`;
        if (options.strict) {
          return { allowed: false, warnings, reason: message };
        }
        warnings.push(message);
      }

      return { allowed: true, warnings };
    },
  };
}

export const localDevSecurityPolicy = createSecurityPolicy();
export const ciStrictSecurityPolicy = createSecurityPolicy({ strict: true });
