import { expect, test } from '@playwright/test';
import {
  expectWebMcpTool,
  invokeWebMcpTool,
} from '@react-webmcp-diagnostics/testing';

test.describe('vite-basic example', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const tools = new Map<
        string,
        {
          name: string;
          execute: (args: unknown) => unknown | Promise<unknown>;
        }
      >();

      Object.defineProperty(document, 'modelContext', {
        configurable: true,
        value: {
          registerTool(
            tool: {
              name: string;
              execute: (args: unknown) => unknown | Promise<unknown>;
            },
            options: { signal?: AbortSignal } = {},
          ) {
            if (options.signal?.aborted) {
              return;
            }

            tools.set(tool.name, tool);
            options.signal?.addEventListener(
              'abort',
              () => {
                tools.delete(tool.name);
              },
              { once: true },
            );
          },
          async getTools() {
            return [...tools.values()];
          },
          async executeTool(toolOrName: unknown, argsJson = '{}') {
            const name =
              typeof toolOrName === 'string'
                ? toolOrName
                : (toolOrName as { name?: string }).name;
            const tool = name ? tools.get(name) : undefined;
            if (!tool) {
              throw new Error(`Tool not found: ${name}`);
            }

            return tool.execute(JSON.parse(argsJson));
          },
        },
      });
    });
  });

  test('registers diagnostics tools and get_page_state', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'React WebMCP Diagnostics' }))
      .toBeVisible();
    await expectWebMcpTool(page, 'get_app_info');
    await expectWebMcpTool(page, 'get_page_state');

    const pageState = await invokeWebMcpTool<{ title: string; dirty: boolean }>(
      page,
      'get_page_state',
      {},
    );

    expect(pageState.title).toContain('React WebMCP Diagnostics');
    expect(pageState.dirty).toBe(false);
  });
});
