import { describe, expect, it } from 'vitest';
import {
  createWebMcpEnvironmentSummary,
  createWebMcpEnvironmentTool,
} from './webmcp-environment';

describe('createWebMcpEnvironmentSummary', () => {
  it('reports unsupported when modelContext is missing', () => {
    const summary = createWebMcpEnvironmentSummary({
      globalObject: {
        window: {},
        document: {},
        location: { origin: 'https://app.test' },
      } as unknown as typeof globalThis,
    });
    expect(summary.supported).toBe(false);
    expect(summary.checks[0]?.status).toBe('fail');
    expect(summary.warnings.length).toBeGreaterThan(0);
  });

  it('includes registered tool count from registry', () => {
    const registry = {
      getRegisteredToolNames: () => ['demo_tool'],
    } as import('@tooluminati/core').WebMcpRegistry;
    const summary = createWebMcpEnvironmentSummary({
      registry,
      globalObject: {
        window: {},
        document: { modelContext: { registerTool: () => undefined } },
        location: { origin: 'https://app.test' },
      } as unknown as typeof globalThis,
    });
    expect(summary.toolCount).toBe(1);
    expect(summary.supported).toBe(true);
    expect(summary.registerToolAvailable).toBe(true);
    expect(summary.consumers.length).toBeGreaterThan(0);
    expect(summary.checks.some((check) => check.id === 'origin-trial')).toBe(
      true,
    );
  });

  it('supports Chrome 149 navigator.modelContext fallback', () => {
    const summary = createWebMcpEnvironmentSummary({
      globalObject: {
        window: {},
        document: {},
        navigator: { modelContext: { registerTool: () => undefined } },
        location: { origin: 'https://app.test' },
      } as unknown as typeof globalThis,
    });

    const documentCheck = summary.checks.find(
      (check) => check.id === 'document.modelContext',
    );
    const navigatorCheck = summary.checks.find(
      (check) => check.id === 'navigator.modelContext',
    );

    expect(summary.supported).toBe(true);
    expect(summary.usingNavigatorFallback).toBe(true);
    expect(documentCheck?.status).toBe('warn');
    expect(documentCheck?.value).toBe('missing; using fallback');
    expect(navigatorCheck?.status).toBe('warn');
  });

  it('warns when document.domain is set', () => {
    const summary = createWebMcpEnvironmentSummary({
      globalObject: {
        window: {},
        document: { modelContext: {}, domain: 'example.com' },
        location: { origin: 'https://app.test' },
      } as unknown as typeof globalThis,
    });
    const originCheck = summary.checks.find((c) => c.id === 'origin-isolation');
    expect(originCheck?.status).toBe('warn');
  });
});

describe('createWebMcpEnvironmentTool', () => {
  it('returns summary from getter', async () => {
    const tool = createWebMcpEnvironmentTool(() =>
      createWebMcpEnvironmentSummary(),
    );
    const result = await tool.execute({}, {} as never);
    expect(result).toHaveProperty('checks');
  });
});

it.each([undefined, {}, { registerTool: true }])(
  'reports unsupported malformed context %s',
  (modelContext) => {
    const summary = createWebMcpEnvironmentSummary({
      globalObject: {
        window: {},
        document: { modelContext },
      } as unknown as typeof globalThis,
    });
    expect(summary.supported).toBe(false);
    expect(summary.registerToolAvailable).toBe(false);
    expect(summary.usingNavigatorFallback).toBe(false);
    expect(summary.checks).toContainEqual(
      expect.objectContaining({ id: 'registerTool', status: 'fail' }),
    );
  },
);

it('reports SSR as unsupported without accessing the DOM', () => {
  const summary = createWebMcpEnvironmentSummary({
    globalObject: {} as typeof globalThis,
  });
  expect(summary.supported).toBe(false);
  expect(summary.origin).toBe('unknown');
  expect(summary.checks).toContainEqual(
    expect.objectContaining({ id: 'origin-trial', status: 'muted' }),
  );
});
