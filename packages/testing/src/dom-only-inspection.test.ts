import { describe, expect, it } from 'vitest';
import { collectDisabledActionReasonsFromDom } from './dom-only-inspection';

describe('collectDisabledActionReasonsFromDom', () => {
  it('finds no checkout blockers when none are exposed in the DOM', () => {
    document.body.innerHTML = `
      <section data-testid="checkout-row">
        <p>Status: waiting for customer action.</p>
        <button disabled type="button">Complete checkout</button>
      </section>
    `;

    const finding = collectDisabledActionReasonsFromDom(
      document,
      'Complete checkout',
    );

    expect(finding.disabled).toBe(true);
    expect(finding.visibleBlockerReasons).toEqual([]);
  });

  it('finds visible hints when the DOM exposes them', () => {
    document.body.innerHTML = `
      <section data-testid="checkout-row">
        <p data-dom-blocker-hint>Terms must be accepted first.</p>
        <button disabled type="button">Complete checkout</button>
      </section>
    `;

    const finding = collectDisabledActionReasonsFromDom(
      document,
      'Complete checkout',
    );

    expect(finding.visibleBlockerReasons).toContain(
      'Terms must be accepted first.',
    );
  });
});
