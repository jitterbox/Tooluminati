import { expect, test } from '@playwright/test';
import {
  expectWebMcpTool,
  invokeWebMcpTool,
  MODEL_CONTEXT_MOCK_INIT_SCRIPT,
} from '@react-webmcp-diagnostics/testing';

test.describe('vite-basic example', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(MODEL_CONTEXT_MOCK_INIT_SCRIPT);
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
