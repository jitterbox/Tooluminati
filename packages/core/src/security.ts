import { WebMcpSecurityPolicyError } from './errors';
import type { WebMcpToolDescriptor } from './types';

export type ToolRiskLevel = 'low' | 'medium' | 'high';

export function validateExposedOrigins(origins: string[] = []): void {
  for (const origin of origins) {
    if (origin.includes('*')) {
      throw new WebMcpSecurityPolicyError(
        `Wildcard WebMCP exposedTo origins are not allowed: ${origin}`,
      );
    }

    let url: URL;
    try {
      url = new URL(origin);
    } catch {
      throw new WebMcpSecurityPolicyError(
        `Invalid WebMCP exposedTo origin: ${origin}`,
      );
    }

    const isLocalhost =
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '[::1]';

    if (url.protocol !== 'https:' && !isLocalhost) {
      throw new WebMcpSecurityPolicyError(
        `WebMCP exposedTo origins must be HTTPS: ${origin}`,
      );
    }

    if (url.pathname !== '/' || url.search || url.hash) {
      throw new WebMcpSecurityPolicyError(
        `WebMCP exposedTo entries must be origins only: ${origin}`,
      );
    }
  }
}

export function classifyTool(tool: WebMcpToolDescriptor): ToolRiskLevel {
  if (tool.meta?.sensitive || tool.confirmBeforeExecute) {
    return 'high';
  }

  if (tool.annotations?.readOnlyHint === false || tool.meta?.readOnly === false) {
    return 'medium';
  }

  if (tool.annotations?.untrustedContentHint) {
    return 'medium';
  }

  return 'low';
}

export function createSecurityWarning(
  tool: WebMcpToolDescriptor,
  risk: ToolRiskLevel = classifyTool(tool),
): string | undefined {
  if (risk === 'low') {
    return undefined;
  }

  if (risk === 'high') {
    return `Tool "${tool.name}" is high risk and should require explicit review.`;
  }

  return `Tool "${tool.name}" has side effects or untrusted content; review annotations and redaction.`;
}

export interface AssertProductionSafeOptions {
  production?: boolean;
  allowlist?: string[];
}

export function assertProductionSafe(
  tool: WebMcpToolDescriptor,
  options: AssertProductionSafeOptions = {},
): void {
  const isProduction = options.production === true;
  if (!isProduction) {
    return;
  }

  const allowlist = new Set(options.allowlist ?? []);
  if (allowlist.size > 0 && !allowlist.has(tool.name)) {
    throw new WebMcpSecurityPolicyError(
      `Tool "${tool.name}" is not approved for production WebMCP exposure.`,
    );
  }

  if (tool.annotations?.readOnlyHint === false && !tool.confirmationHandler) {
    throw new WebMcpSecurityPolicyError(
      `Write-capable tool "${tool.name}" requires a confirmation handler in production.`,
    );
  }
}
