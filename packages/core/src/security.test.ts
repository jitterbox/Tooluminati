import { describe, expect, it } from 'vitest';
import {
  assertProductionSafe,
  classifyTool,
  createSecurityWarning,
  validateExposedOrigins,
} from './security';
import { redactObject } from './redaction';
import type { WebMcpToolDescriptor } from './types';

describe('security utilities', () => {
  it('rejects wildcard exposedTo origins', () => {
    expect(() => validateExposedOrigins(['https://*.example.com'])).toThrow(
      /Wildcard/,
    );
  });

  it('rejects insecure exposedTo origins', () => {
    expect(() => validateExposedOrigins(['http://example.com'])).toThrow(
      /HTTPS/,
    );
  });

  it('redacts common sensitive keys', () => {
    const result = redactObject({
      token: 'abc',
      profile: { email: 'user@example.com', name: 'Ada' },
    }) as Record<string, unknown>;

    expect(result.token).toBe('[REDACTED]');
    expect((result.profile as Record<string, unknown>).email).toBe('[REDACTED]');
  });

  it('warns for write tools without confirmation in strict security policy', () => {
    const tool: WebMcpToolDescriptor = {
      name: 'save_item',
      description: 'Save item.',
      annotations: { readOnlyHint: false },
      execute: () => ({ ok: true }),
    };

    expect(classifyTool(tool)).toBe('medium');
    expect(createSecurityWarning(tool)).toMatch(/side effects/);
    expect(() => assertProductionSafe(tool, { production: true })).toThrow(
      /confirmation handler/,
    );
  });
});
