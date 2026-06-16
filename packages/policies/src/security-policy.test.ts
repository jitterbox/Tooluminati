import { describe, expect, it } from 'vitest';
import type { WebMcpToolDescriptor } from '@tooluminati/core';
import { productionOffPolicy } from './production-policy';
import { ciStrictSecurityPolicy } from './security-policy';

describe('policies', () => {
  it('blocks production registration when disabled', () => {
    const tool: WebMcpToolDescriptor = {
      name: 'get_status',
      description: 'Returns status.',
      execute: () => ({ ok: true }),
    };

    const decision = productionOffPolicy.canRegister(tool, {
      production: true,
    });
    expect(decision.allowed).toBe(false);
  });

  it('rejects write tools without confirmation in strict security mode', () => {
    const tool: WebMcpToolDescriptor = {
      name: 'save_item',
      description: 'Save item.',
      annotations: { readOnlyHint: false },
      execute: () => ({ ok: true }),
    };

    const decision = ciStrictSecurityPolicy.evaluateTool(tool);
    expect(decision.allowed).toBe(false);
  });
});
