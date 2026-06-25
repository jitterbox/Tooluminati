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
        document: { modelContext: {} },
        location: { origin: 'https://app.test' },
      } as unknown as typeof globalThis,
    });
    expect(summary.toolCount).toBe(1);
    expect(summary.supported).toBe(true);
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
