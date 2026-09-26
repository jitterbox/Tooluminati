import { describe, expect, it, vi } from 'vitest';
import { MockModelContext } from '@tooluminati/testing';
import {
  WebMcpConfirmationRequiredError,
  WebMcpExecutionValidationError,
  WebMcpNameCollisionError,
  WebMcpSecurityPolicyError,
  WebMcpUnsupportedError,
} from './errors';
import { applyOutputBudget } from './result';
import { WebMcpRegistry } from './registry';
import {
  permissivePolicySet,
  type ProductionPolicy,
  type WebMcpPolicySet,
} from './policy-types';

const productionOffPolicy: ProductionPolicy = {
  canRegister: (_tool, context) =>
    context?.production
      ? {
          allowed: false,
          warnings: [],
          reason: 'Production registration disabled.',
        }
      : { allowed: true, warnings: [] },
};

describe('WebMcpRegistry', () => {
  it('registers and unregisters tools through AbortSignal', async () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({
      enabled: true,
      modelContext,
    });

    const registration = registry.registerTool({
      name: 'get_status',
      description: 'Returns test status.',
      annotations: { readOnlyHint: true },
      execute: () => ({ ok: true }),
    });

    expect(modelContext.tools.has('get_status')).toBe(true);
    registration.abort();
    expect(modelContext.tools.has('get_status')).toBe(false);
  });

  it('prevents duplicate logical names before browser registration', () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({ enabled: true, modelContext });
    const tool = {
      name: 'get_status',
      description: 'Returns test status.',
      execute: () => ({ ok: true }),
    };

    registry.registerTool(tool);
    expect(() => registry.registerTool(tool)).toThrow(WebMcpNameCollisionError);
  });

  it('validates args and redacts results before returning', async () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({ enabled: true, modelContext });
    const validateArgs = vi.fn((args) => args as { id: string });
    const redactResult = vi.fn(() => ({ id: 'visible', token: '[REDACTED]' }));

    registry.registerTool({
      name: 'get_secret',
      description: 'Returns a redacted secret summary.',
      validateArgs,
      redactResult,
      execute: (args) => ({ id: args.id, token: 'secret-token' }),
    });

    const result = await modelContext.executeTool('get_secret', {
      id: 'visible',
    });

    expect(validateArgs).toHaveBeenCalled();
    expect(redactResult).toHaveBeenCalled();
    expect(result).toEqual({ id: 'visible', token: '[REDACTED]' });
  });

  it('wraps validateArgs failures', async () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({ enabled: true, modelContext });

    registry.registerTool({
      name: 'validated',
      description: 'Validated tool.',
      validateArgs: () => {
        throw new Error('bad args');
      },
      execute: () => ({ ok: true }),
    });

    await expect(modelContext.executeTool('validated', {})).rejects.toBeInstanceOf(
      WebMcpExecutionValidationError,
    );
  });

  it('requires confirmation handler for confirmBeforeExecute tools', async () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({ enabled: true, modelContext });

    registry.registerTool({
      name: 'write_item',
      description: 'Write item.',
      confirmBeforeExecute: true,
      execute: () => ({ ok: true }),
    });

    await expect(modelContext.executeTool('write_item', {})).rejects.toBeInstanceOf(
      WebMcpConfirmationRequiredError,
    );
  });

  it('no-ops browser registration when disabled', () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({ enabled: false, modelContext });

    registry.registerTool({
      name: 'disabled_tool',
      description: 'Disabled tool.',
      execute: () => ({ ok: true }),
    });

    expect(modelContext.tools.size).toBe(0);
    expect(registry.getRegisteredToolNames()).toContain('disabled_tool');
  });

  it('throws in strict mode when unsupported', () => {
    const registry = new WebMcpRegistry({ enabled: true, strict: true });

    expect(() =>
      registry.registerTool({
        name: 'unsupported',
        description: 'Unsupported tool.',
        execute: () => ({ ok: true }),
      }),
    ).toThrow(WebMcpUnsupportedError);
  });

  it('evaluates production policy before registration', () => {
    const modelContext = new MockModelContext();
    const policies: WebMcpPolicySet = {
      ...permissivePolicySet,
      production: productionOffPolicy,
    };
    const registry = new WebMcpRegistry({
      enabled: true,
      strict: true,
      modelContext,
      policies,
      policyContext: { production: true },
    });

    expect(() =>
      registry.registerTool({
        name: 'blocked',
        description: 'Blocked tool.',
        execute: () => ({ ok: true }),
      }),
    ).toThrow(WebMcpSecurityPolicyError);
  });

  it('returns visible tool summaries with metadata', () => {
    const registry = new WebMcpRegistry({ enabled: false });
    registry.registerTool({
      name: 'get_app_info',
      title: 'App Info',
      description: 'Returns app info.',
      annotations: { readOnlyHint: true },
      execute: () => ({}),
    });

    expect(registry.getVisibleToolSummaries()).toEqual([
      expect.objectContaining({
        name: 'get_app_info',
        title: 'App Info',
        description: 'Returns app info.',
        annotations: { readOnlyHint: true },
      }),
    ]);
  });

  it('warns when output budget is exceeded without truncation', () => {
    const warnings: string[] = [];
    const budget = applyOutputBudget(
      { message: 'x'.repeat(40) },
      10,
      false,
      (message) => warnings.push(message),
    );

    expect(budget.exceeded).toBe(true);
    expect(warnings[0]).toMatch(/character budget/);
  });

  it('handles async registerTool rejections via onError', async () => {
    const modelContext = new MockModelContext();
    modelContext.registerTool = vi.fn(() =>
      Promise.reject(new Error('async failure')),
    );
    const onError = vi.fn();
    const registry = new WebMcpRegistry({
      enabled: true,
      modelContext,
      onError,
    });

    const registration = registry.registerTool({
      name: 'async_fail',
      description: 'Async fail.',
      execute: () => ({ ok: true }),
    });

    await expect(registration.ready).rejects.toMatchObject({
      name: 'WebMcpRegistrationError',
    });
    expect(onError).toHaveBeenCalled();
  });

  it('does not abort in-flight execute when unregistered', async () => {
    const modelContext = new MockModelContext();
    const registry = new WebMcpRegistry({ enabled: true, modelContext });
    let captured: AbortSignal | undefined;

    const registration = registry.registerTool({
      name: 'long_read',
      description: 'Read-only tool.',
      annotations: { readOnlyHint: true, debugging: true },
      execute: (_args, context) => {
        captured = context.signal;
        return { ok: true };
      },
    });

    await modelContext.executeTool('long_read', {});
    registration.abort();
    expect(captured?.aborted).toBe(false);
  });
});
