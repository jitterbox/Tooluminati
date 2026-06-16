import { describe, expect, it, vi } from 'vitest';
import { MockModelContext } from '@react-webmcp-diagnostics/testing';
import { WebMcpNameCollisionError } from './errors';
import { WebMcpRegistry } from './registry';

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

    const result = await modelContext.executeTool(
      'get_secret',
      JSON.stringify({ id: 'visible' }),
    );

    expect(validateArgs).toHaveBeenCalled();
    expect(redactResult).toHaveBeenCalled();
    expect(result).toEqual({ id: 'visible', token: '[REDACTED]' });
  });
});
