import { test, expect } from '@playwright/test';
import {
  MODEL_CONTEXT_MOCK_INIT_SCRIPT,
  invokeWebMcpTool,
} from '@tooluminati/testing';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(MODEL_CONTEXT_MOCK_INIT_SCRIPT);
});

test('timeline exposes fetch failure DOM cannot see', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Simulate failed checkout save' }).click();
  await expect
    .poll(async () => {
      const timeline = await invokeWebMcpTool<{
        events: Array<{ category: string }>;
      }>(page, 'get_troubleshooting_timeline', {});
      return timeline.events.some((e) => e.category === 'fetch_failure');
    })
    .toBe(true);

  await page.getByTestId('dom-diagnose').click();
  const domText = await page.getByTestId('dom-diagnosis').textContent();
  expect(domText).toContain('"visibleBlockerReasons": []');

  const blockers = await invokeWebMcpTool<{
    actions: Array<{ actionId: string; reasons: string[] }>;
  }>(page, 'get_workflow_blockers', {});
  expect(blockers.actions.some((a) => a.reasons.length > 0)).toBe(true);
});

test('troubleshooting panel badge is visible', async ({ page }) => {
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
