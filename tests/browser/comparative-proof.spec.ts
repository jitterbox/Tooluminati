import { expect, test } from '@playwright/test';
import {
  MODEL_CONTEXT_MOCK_INIT_SCRIPT,
  runComparativeProof,
} from '@tooluminati/testing';

test.describe('agent-troubleshooting-demo comparative proof', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(MODEL_CONTEXT_MOCK_INIT_SCRIPT);
  });

  test('WebMCP exposes blockers DOM-only inspection cannot see', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Why is checkout disabled?' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Complete checkout' }),
    ).toBeDisabled();

    const proof = await runComparativeProof(page, {
      buttonLabel: 'Complete checkout',
      actionId: 'complete-checkout',
    });

    expect(proof.domOnly.disabled).toBe(true);
    expect(proof.domBlockerCount).toBe(0);
    expect(proof.webMcpBlockerCount).toBeGreaterThanOrEqual(2);
    expect(proof.webMcpIsStrictlyMoreInformative).toBe(true);
    expect(proof.webMcp.reasons).toEqual(
      expect.arrayContaining([
        'Cart contains a restricted item (SKU-404).',
        'Billing address is incomplete.',
      ]),
    );
  });

  test('interactive demo panels match automated proof', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Run DOM-only diagnosis' }).click();
    await page.getByRole('button', { name: 'Run WebMCP diagnosis' }).click();

    const summary = page.getByTestId('comparative-summary');
    await expect(summary).toContainText('DOM-only blocker reasons: 0');
    await expect(summary).toContainText('WebMCP blocker reasons: 2');
    await expect(summary).toContainText(
      'WebMCP strictly more informative: yes',
    );
  });
});
