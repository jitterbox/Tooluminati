import { test, expect } from '@playwright/test';
import {
  MODEL_CONTEXT_MOCK_INIT_SCRIPT,
  invokeWebMcpTool,
} from '@tooluminati/testing';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(MODEL_CONTEXT_MOCK_INIT_SCRIPT);
});

test('query summary reports error state', async ({ page }) => {
  await page.goto('/');
  const queries = await invokeWebMcpTool<{ queries: Array<{ status: string }> }>(
    page,
    'get_query_cache_summary',
    {},
  );
  expect(queries.queries.some((q) => q.status === 'error')).toBe(true);
});

test('workflow blockers include form and query context', async ({ page }) => {
  await page.goto('/');
  await expect
    .poll(async () => {
      const blockers = await invokeWebMcpTool<{
        actions: Array<{ actionId: string; reasons: string[] }>;
        queries: Array<{ status: string }>;
      }>(page, 'get_workflow_blockers', {});
      return blockers.queries.some((q) => q.status === 'error');
    })
    .toBe(true);

  const blockers = await invokeWebMcpTool<{
    actions: Array<{ actionId: string; reasons: string[] }>;
    queries: Array<{ status: string }>;
  }>(page, 'get_workflow_blockers', {});
  expect(
    blockers.actions.some((a) => a.actionId === 'save-profile' && a.reasons.length > 0),
  ).toBe(true);
});

test('troubleshooting panel is mounted', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('webmcp-troubleshooting-badge')).toBeVisible();
});

test('environment reports registered diagnostic tools', async ({ page }) => {
  await page.goto('/');
  const env = await invokeWebMcpTool<{ toolCount: number }>(
    page,
    'get_webmcp_environment',
    {},
  );
  expect(env.toolCount).toBeGreaterThan(0);
});
