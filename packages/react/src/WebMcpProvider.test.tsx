import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MockModelContext } from '@react-webmcp-diagnostics/testing';
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
});
