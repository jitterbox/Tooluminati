import { describe, expect, it, vi } from 'vitest';
import { getModelContext, isWebMcpSupported } from './model-context';

describe('getModelContext', () => {
  it('returns document modelContext first', () => {
    const documentContext = { registerTool: vi.fn() };
    const globalObject = {
      window: {},
      document: { modelContext: documentContext },
      navigator: { modelContext: { registerTool: vi.fn() } },
    };

    expect(
      getModelContext({ globalObject: globalObject as typeof globalThis }),
    ).toBe(documentContext);
  });

  it('falls back to navigator modelContext when allowed', () => {
    const navigatorContext = { registerTool: vi.fn() };
    const onNavigatorFallback = vi.fn();
    const globalObject = {
      window: {},
      document: {},
      navigator: { modelContext: navigatorContext },
    };

    expect(
      getModelContext({
        globalObject: globalObject as typeof globalThis,
        onNavigatorFallback,
      }),
    ).toBe(navigatorContext);
    expect(onNavigatorFallback).toHaveBeenCalled();
  });

  it('returns undefined during SSR', () => {
    const globalObject = { window: undefined, document: undefined };
    expect(
      getModelContext({ globalObject: globalObject as typeof globalThis }),
    ).toBeUndefined();
    expect(isWebMcpSupported({ globalObject: globalObject as typeof globalThis })).toBe(
      false,
    );
  });
});
