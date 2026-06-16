/**
 * Simulates what a DOM-only agent can infer about disabled actions.
 * Mirrors accessibility-tree inspection: labels, aria-* , title, nearby text.
 */
import type { WebMcpTestPage } from './browser-helpers';

export interface DisabledActionDomFinding {
  label: string;
  disabled: boolean;
  visibleBlockerReasons: string[];
}

function pushUnique(target: string[], value: string | null | undefined): void {
  const trimmed = value?.trim();
  if (!trimmed || target.includes(trimmed)) {
    return;
  }

  target.push(trimmed);
}

export function collectDisabledActionReasonsFromDom(
  root: Pick<Document, 'querySelectorAll' | 'getElementById'>,
  buttonLabel: string,
): DisabledActionDomFinding {
  const buttons = [...root.querySelectorAll('button')];
  const button = buttons.find((candidate) =>
    candidate.textContent?.includes(buttonLabel),
  );

  if (!button) {
    return {
      label: buttonLabel,
      disabled: false,
      visibleBlockerReasons: [],
    };
  }

  const visibleBlockerReasons: string[] = [];
  pushUnique(visibleBlockerReasons, button.getAttribute('title'));
  pushUnique(
    visibleBlockerReasons,
    button.getAttribute('aria-label')?.includes('because')
      ? button.getAttribute('aria-label')
      : null,
  );

  const describedBy = button.getAttribute('aria-describedby');
  if (describedBy) {
    for (const id of describedBy.split(/\s+/)) {
      pushUnique(
        visibleBlockerReasons,
        root.getElementById(id)?.textContent,
      );
    }
  }

  const fieldset = button.closest('fieldset');
  if (fieldset) {
    pushUnique(
      visibleBlockerReasons,
      fieldset.querySelector('legend')?.textContent,
    );
  }

  const row = button.closest('[data-testid="checkout-row"]');
  if (row) {
    pushUnique(
      visibleBlockerReasons,
      row.querySelector('[data-dom-blocker-hint]')?.textContent,
    );
  }

  return {
    label: buttonLabel,
    disabled: button.disabled,
    visibleBlockerReasons,
  };
}

export async function inspectDisabledActionFromDom(
  page: WebMcpTestPage,
  buttonLabel: string,
): Promise<DisabledActionDomFinding> {
  return page.evaluate((label) => {
    const buttons = [...document.querySelectorAll('button')];
    const button = buttons.find((candidate) =>
      candidate.textContent?.includes(label),
    );

    if (!button) {
      return {
        label,
        disabled: false,
        visibleBlockerReasons: [],
      };
    }

    const visibleBlockerReasons: string[] = [];
    const push = (value: string | null | undefined) => {
      const trimmed = value?.trim();
      if (trimmed && !visibleBlockerReasons.includes(trimmed)) {
        visibleBlockerReasons.push(trimmed);
      }
    };

    push(button.getAttribute('title'));
    const ariaLabel = button.getAttribute('aria-label');
    if (ariaLabel?.includes('because')) {
      push(ariaLabel);
    }

    const describedBy = button.getAttribute('aria-describedby');
    if (describedBy) {
      for (const id of describedBy.split(/\s+/)) {
        push(document.getElementById(id)?.textContent);
      }
    }

    const fieldset = button.closest('fieldset');
    if (fieldset) {
      push(fieldset.querySelector('legend')?.textContent);
    }

    const row = button.closest('[data-testid="checkout-row"]');
    if (row) {
      push(row.querySelector('[data-dom-blocker-hint]')?.textContent);
    }

    return {
      label,
      disabled: button.disabled,
      visibleBlockerReasons,
    };
  }, buttonLabel);
}
