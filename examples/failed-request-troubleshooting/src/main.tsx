import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { ActionAvailabilityProvider } from '@tooluminati/diagnostics';
import { WebMcpTroubleshootingProvider } from '@tooluminati/react-troubleshooting';
import {
  collectDisabledActionReasonsFromDom,
  type DisabledActionDomFinding,
} from '@tooluminati/testing';

const ACTION_ID = 'submit_order';
const BUTTON_LABEL = 'Complete checkout';

function CheckoutApp() {
  const [domResult, setDomResult] = useState<DisabledActionDomFinding | null>(
    null,
  );
  const [failed, setFailed] = useState(false);

  const actionProvider = useMemo<ActionAvailabilityProvider>(
    () => ({
      getActionAvailability(actionId) {
        if (actionId !== ACTION_ID || !failed) {
          return undefined;
        }
        return {
          actionId,
          label: BUTTON_LABEL,
          available: false,
          reasons: ['Checkout mutation rejected (403).'],
        };
      },
      listActions() {
        const action = actionProvider.getActionAvailability(ACTION_ID);
        return action ? [action] : [];
      },
    }),
    [failed],
  );

  const triggerFailure = async () => {
    setFailed(true);
    await fetch('/api/checkout', { method: 'POST' });
  };

  return (
    <WebMcpTroubleshootingProvider
      enabled
      actionProvider={actionProvider}
      panel={{ enabled: true, render: 'auto', startCollapsed: true }}
    >
      <main style={{ fontFamily: 'system-ui', padding: 24, maxWidth: 720 }}>
        <h1>Failed request troubleshooting</h1>
        <p>
          DOM shows a disabled checkout button after a failed save. WebMCP
          timeline captures the HTTP failure cause.
        </p>
        <button type="button" onClick={() => void triggerFailure()}>
          Simulate failed checkout save
        </button>
        <section data-testid="checkout-row" style={{ marginTop: 16 }}>
          <button disabled={failed} type="button">
            {BUTTON_LABEL}
          </button>
        </section>
        <button
          type="button"
          data-testid="dom-diagnose"
          onClick={() =>
            setDomResult(
              collectDisabledActionReasonsFromDom(document, BUTTON_LABEL),
            )
          }
        >
          Run DOM-only diagnosis
        </button>
        {domResult ? (
          <pre data-testid="dom-diagnosis">
            {JSON.stringify(domResult, null, 2)}
          </pre>
        ) : null}
      </main>
    </WebMcpTroubleshootingProvider>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <CheckoutApp />
  </StrictMode>,
);
