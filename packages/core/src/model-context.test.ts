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

  it('ignores modelContext without registerTool', () => {
    const navigatorContext = { registerTool: vi.fn() };
    const globalObject = {
      window: {},
      document: { modelContext: {} },
      navigator: { modelContext: navigatorContext },
    };

    expect(
      getModelContext({ globalObject: globalObject as typeof globalThis }),
    ).toBe(navigatorContext);
  });

  it('returns undefined during SSR', () => {
    const globalObject = { window: undefined, document: undefined };
    expect(
      getModelContext({ globalObject: globalObject as typeof globalThis }),
    ).toBeUndefined();
    expect(
      isWebMcpSupported({
        globalObject: globalObject as typeof globalThis,
      }),
    ).toBe(false);
  });
});

it('does not consult or announce navigator fallback when disabled', () => {
  const onNavigatorFallback = vi.fn();
  const navigatorContext = { registerTool: vi.fn() };
  const globalObject = {
    window: {},
    document: {},
    navigator: { modelContext: navigatorContext },
  } as unknown as typeof globalThis;
  expect(
    getModelContext({
      globalObject,
      allowNavigatorFallback: false,
      onNavigatorFallback,
    }),
  ).toBeUndefined();
  expect(
    isWebMcpSupported({ globalObject, allowNavigatorFallback: false }),
  ).toBe(false);
  expect(onNavigatorFallback).not.toHaveBeenCalled();
  const canonical = { registerTool: vi.fn() };
  Object.assign(globalObject.document, { modelContext: canonical });
  expect(getModelContext({ globalObject, allowNavigatorFallback: false })).toBe(
    canonical,
  );
});

it.each([null, {}, { registerTool: true }, { registerTool: 'function' }])(
  'rejects malformed model contexts %s',
  (modelContext) => {
    const globalObject = {
      window: {},
      document: { modelContext },
      navigator: { modelContext },
    } as unknown as typeof globalThis;
    expect(getModelContext({ globalObject })).toBeUndefined();
  },
);
