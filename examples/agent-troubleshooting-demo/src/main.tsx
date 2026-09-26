import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createActionAvailabilityTool,
  createAppInfoTool,
  type ActionAvailabilityProvider,
} from '@tooluminati/diagnostics';
import {
  WebMcpProvider,
  WebMcpSecurityBanner,
  useWebMcpTools,
} from '@tooluminati/react';
import {
  collectDisabledActionReasonsFromDom,
  type DisabledActionDomFinding,
} from '@tooluminati/testing';

const CHECKOUT_ACTION_ID = 'complete-checkout';
const CHECKOUT_BUTTON_LABEL = 'Complete checkout';

interface WebMcpDiagnosis {
  actionId: string;
  available: boolean;
  reasons: string[];
}

async function diagnoseFromWebMcp(actionId: string): Promise<WebMcpDiagnosis> {
  const context = (
    document as Document & {
      modelContext?: {
        getTools: () => Promise<Array<{ name: string }>>;
        executeTool: (
          tool: unknown,
          input?: object | string,
        ) => Promise<unknown>;
      };
    }
  ).modelContext;

  if (!context?.getTools || !context.executeTool) {
    throw new Error('WebMCP is not available in this browser.');
  }

  const tools = await context.getTools();
  const tool = tools.find(
    (candidate) => candidate.name === 'why_is_action_unavailable',
  );
  if (!tool) {
    throw new Error('why_is_action_unavailable is not registered.');
  }

  const result = (await context.executeTool(tool, {
    actionId,
  })) as WebMcpDiagnosis;

  return {
    actionId: result.actionId,
    available: result.available,
    reasons: result.reasons ?? [],
  };
}

function CheckoutScenario() {
  const [domResult, setDomResult] = useState<DisabledActionDomFinding | null>(
    null,
  );
  const [webMcpResult, setWebMcpResult] = useState<WebMcpDiagnosis | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const actions = useMemo<ActionAvailabilityProvider>(
    () => ({
      getActionAvailability(actionId) {
        if (actionId !== CHECKOUT_ACTION_ID) {
          return undefined;
        }

        return {
          actionId,
          label: CHECKOUT_BUTTON_LABEL,
          available: false,
          reasons: [
            'Cart contains a restricted item (SKU-404).',
            'Billing address is incomplete.',
          ],
          category: 'checkout',
          severity: 'warning',
        };
      },
      listActions() {
        return [
          {
            actionId: CHECKOUT_ACTION_ID,
            label: CHECKOUT_BUTTON_LABEL,
            available: false,
            reasons: [
              'Cart contains a restricted item (SKU-404).',
              'Billing address is incomplete.',
            ],
          },
        ];
      },
    }),
    [],
  );

  useWebMcpTools(
    [
      createAppInfoTool(() => ({
        name: 'Agent Troubleshooting Demo',
        environment: import.meta.env.MODE,
        webMcpEnabled: import.meta.env.DEV,
      })),
      createActionAvailabilityTool(actions),
    ],
    [actions],
  );

  const runDomDiagnosis = () => {
    setError(null);
    setDomResult(
      collectDisabledActionReasonsFromDom(document, CHECKOUT_BUTTON_LABEL),
    );
  };

  const runWebMcpDiagnosis = async () => {
    setError(null);
    try {
      setWebMcpResult(await diagnoseFromWebMcp(CHECKOUT_ACTION_ID));
    } catch (nextError) {
      setWebMcpResult(null);
      setError(
        nextError instanceof Error ? nextError.message : 'WebMCP failed.',
      );
    }
  };

  const domBlockers = domResult?.visibleBlockerReasons.length ?? 0;
  const webMcpBlockers = webMcpResult?.reasons.length ?? 0;

  return (
    <main className="layout">
      <WebMcpSecurityBanner />
      <header>
        <h1>Why is checkout disabled?</h1>
        <p>
          The UI shows a disabled button but hides the real blockers on
          purpose. Compare what a DOM-only agent can prove vs WebMCP tools.
        </p>
      </header>

      <section
        className="checkout-card"
        data-testid="checkout-row"
        aria-label="Checkout summary"
      >
        <h2>Checkout</h2>
        <p>Total: $129.00</p>
        <p className="muted">
          Status: waiting for customer action (details not shown in DOM).
        </p>
        <button disabled type="button">
          {CHECKOUT_BUTTON_LABEL}
        </button>
      </section>

      <section className="prompt-box">
        <h2>Sample agent prompt</h2>
        <blockquote>
          The &quot;Complete checkout&quot; button is disabled. Diagnose why
          the user cannot checkout and list concrete blockers.
        </blockquote>
      </section>

      <div className="compare-grid">
        <article className="panel panel-dom">
          <h2>Without WebMCP (DOM only)</h2>
          <p className="muted">
            Inspects button state, title, aria-describedby, and visible hints
            only.
          </p>
          <button type="button" onClick={runDomDiagnosis}>
            Run DOM-only diagnosis
          </button>
          {domResult ? (
            <pre data-testid="dom-diagnosis">
              {JSON.stringify(domResult, null, 2)}
            </pre>
          ) : null}
          {domResult ? (
            <p className="verdict verdict-fail" data-testid="dom-verdict">
              Blockers found in DOM: {domBlockers}. Cannot explain checkout
              failure.
            </p>
          ) : null}
        </article>

        <article className="panel panel-webmcp">
          <h2>With WebMCP</h2>
          <p className="muted">
            Calls <code>why_is_action_unavailable</code> with action id{' '}
            <code>{CHECKOUT_ACTION_ID}</code>.
          </p>
          <button type="button" onClick={() => void runWebMcpDiagnosis()}>
            Run WebMCP diagnosis
          </button>
          {error ? <p className="verdict verdict-fail">{error}</p> : null}
          {webMcpResult ? (
            <pre data-testid="webmcp-diagnosis">
              {JSON.stringify(webMcpResult, null, 2)}
            </pre>
          ) : null}
          {webMcpResult ? (
            <p className="verdict verdict-pass" data-testid="webmcp-verdict">
              Blockers from tool: {webMcpBlockers}. Actionable diagnosis
              available.
            </p>
          ) : null}
        </article>
      </div>

      {domResult && webMcpResult ? (
        <section className="summary" data-testid="comparative-summary">
          <h2>Objective comparison</h2>
          <ul>
            <li>
              DOM-only blocker reasons: <strong>{domBlockers}</strong>
            </li>
            <li>
              WebMCP blocker reasons: <strong>{webMcpBlockers}</strong>
            </li>
            <li>
              WebMCP strictly more informative:{' '}
              <strong>
                {domBlockers === 0 && webMcpBlockers > 0 ? 'yes' : 'no'}
              </strong>
            </li>
          </ul>
        </section>
      ) : null}

      <style>{`
        .layout {
          font-family: system-ui, sans-serif;
          margin: 0 auto;
          max-width: 960px;
          padding: 1.5rem;
        }
        .checkout-card,
        .prompt-box,
        .panel,
        .summary {
          border: 1px solid #d0d7de;
          border-radius: 8px;
          margin: 1rem 0;
          padding: 1rem;
        }
        .compare-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }
        .panel-dom {
          background: #fff5f5;
        }
        .panel-webmcp {
          background: #f0fff4;
        }
        .muted {
          color: #57606a;
        }
        .verdict {
          font-weight: 600;
        }
        .verdict-fail {
          color: #cf222e;
        }
        .verdict-pass {
          color: #116329;
        }
        pre {
          background: #f6f8fa;
          border-radius: 6px;
          overflow: auto;
          padding: 0.75rem;
        }
        blockquote {
          border-left: 4px solid #0969da;
          margin: 0;
          padding-left: 0.75rem;
        }
      `}</style>
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <WebMcpProvider enabled={import.meta.env.DEV}>
      <CheckoutScenario />
    </WebMcpProvider>
  </StrictMode>,
);
