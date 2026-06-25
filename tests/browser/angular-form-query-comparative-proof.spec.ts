import { test, expect } from '@playwright/test';
import { MODEL_CONTEXT_MOCK_INIT_SCRIPT } from '@tooluminati/testing';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(MODEL_CONTEXT_MOCK_INIT_SCRIPT);
});

test('angular troubleshooting panel renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('webmcp-troubleshooting-badge')).toBeVisible();
});

test('expanding panel reveals environment section', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('webmcp-troubleshooting-badge').click();
  await expect(page.getByTestId('webmcp-troubleshooting-panel')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Environment' })).toBeVisible();
});
