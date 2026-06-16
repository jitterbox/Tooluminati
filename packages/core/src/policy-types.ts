import type { RegisterToolOptions, WebMcpToolDescriptor } from './types';

export interface PolicyDecision {
  allowed: boolean;
  warnings: string[];
  reason?: string | undefined;
}

export interface PolicyContext {
  environment?: 'development' | 'test' | 'staging' | 'production';
  production?: boolean;
  debugSession?: boolean;
}

export interface SecurityPolicy {
  evaluateTool(
    tool: WebMcpToolDescriptor,
    options?: RegisterToolOptions,
    context?: PolicyContext,
  ): PolicyDecision;
}

export interface RedactionPolicy {
  redact(value: unknown, context?: { kind?: string; path?: string }): unknown;
}

export interface OutputPolicy {
  enforce(value: unknown, context?: { toolName?: string }): unknown;
}

export interface ProductionPolicy {
  canRegister(
    tool: WebMcpToolDescriptor,
    context?: PolicyContext,
  ): PolicyDecision;
}

export interface ConfirmationPolicy {
  requiresConfirmation(tool: WebMcpToolDescriptor): boolean;
}

export interface LoggingPolicy {
  canLog(event: string, payload?: unknown): boolean;
}

export interface WebMcpPolicySet {
  security: SecurityPolicy;
  redaction: RedactionPolicy;
  output: OutputPolicy;
  production: ProductionPolicy;
  confirmation: ConfirmationPolicy;
  logging: LoggingPolicy;
}

export const permissivePolicySet: WebMcpPolicySet = {
  security: {
    evaluateTool: () => ({ allowed: true, warnings: [] }),
  },
  production: {
    canRegister: () => ({ allowed: true, warnings: [] }),
  },
  redaction: {
    redact: (value) => value,
  },
  output: {
    enforce: (value) => value,
  },
  confirmation: {
    requiresConfirmation: () => false,
  },
  logging: {
    canLog: () => true,
  },
};
