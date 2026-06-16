import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MockModelContext } from '@react-webmcp-diagnostics/testing';
import { WebMcpSecurityPolicyError } from '@react-webmcp-diagnostics/core';
import { ciStrictPolicy } from '@react-webmcp-diagnostics/policies';
import { WebMcpProvider } from './WebMcpProvider';
import { useWebMcpTool } from './useWebMcpTool';

function ToolComponent({ value }: { value: string }) {
  useWebMcpTool(
    {
      name: 'get_value',
      description: 'Returns latest React value.',
      annotations: { readOnlyHint: true },
      execute: () => ({ value }),
    },
    [value],
  );

  return null;
}

function WriteToolComponent() {
  useWebMcpTool({
    name: 'save_item',
    description: 'Save item.',
    annotations: { readOnlyHint: false },
    execute: () => ({ ok: true }),
  });

  return null;
}

describe('WebMcpProvider', () => {
  it('registers hook tools and unregisters on unmount', async () => {
    const modelContext = new MockModelContext();
    const { unmount } = render(
      <WebMcpProvider enabled modelContext={modelContext}>
        <ToolComponent value="first" />
      </WebMcpProvider>,
    );

    await waitFor(() => {
      expect(modelContext.tools.has('get_value')).toBe(true);
    });

    unmount();
    expect(modelContext.tools.has('get_value')).toBe(false);
  });

  it('executes with fresh React state after rerender', async () => {
    const modelContext = new MockModelContext();
    const { rerender } = render(
      <WebMcpProvider enabled modelContext={modelContext}>
        <ToolComponent value="first" />
      </WebMcpProvider>,
    );

    rerender(
      <WebMcpProvider enabled modelContext={modelContext}>
        <ToolComponent value="second" />
      </WebMcpProvider>,
    );

    const result = await modelContext.executeTool('get_value', '{}');
    expect(result).toEqual({ value: 'second' });
  });

  it('registers provider tools and cleans them up', async () => {
    const modelContext = new MockModelContext();
    const tools = [
      {
        name: 'provider_tool',
        description: 'Provider tool.',
        execute: () => ({ ok: true }),
      },
    ];

    const { unmount } = render(
      <WebMcpProvider enabled modelContext={modelContext} tools={tools} />,
    );

    await waitFor(() => {
      expect(modelContext.tools.has('provider_tool')).toBe(true);
    });

    unmount();
    expect(modelContext.tools.has('provider_tool')).toBe(false);
  });

  it('throws in strict mode when write tool lacks confirmation', () => {
    const modelContext = new MockModelContext();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(() => {
      render(
        <WebMcpProvider
          enabled
          strict
          modelContext={modelContext}
          policies={ciStrictPolicy}
        >
          <WriteToolComponent />
        </WebMcpProvider>,
      );
    }).toThrow(WebMcpSecurityPolicyError);

    expect(modelContext.tools.has('save_item')).toBe(false);
    consoleError.mockRestore();
  });
});
