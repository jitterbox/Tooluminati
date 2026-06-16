# Examples

Runnable demos for Tooluminati. Each example includes agent
prompts and expected tool outcomes.

## Comparative proof (recommended first)

| Example | What it proves |
|---------|----------------|
| [agent-troubleshooting-demo](./agent-troubleshooting-demo/README.md) | DOM-only agents see a disabled button but **zero blockers**; WebMCP returns **actionable reasons** (automated Playwright proof) |

Run the flagship demo:

```bash
pnpm --filter agent-troubleshooting-demo dev
```

Run objective comparison tests:

```bash
pnpm test:browser
```

## Angular examples

| Example | React counterpart | Port |
|---------|-------------------|------|
| [angular-troubleshooting-demo](./angular-troubleshooting-demo/README.md) | agent-troubleshooting-demo | 4176 |
| [angular-basic](./angular-basic/README.md) | vite-basic | 4175 |
| [angular-diagnostics-quickstart](./angular-diagnostics-quickstart/README.md) | diagnostics-quickstart | 4177 |
| [angular-router-dashboard](./angular-router-dashboard/README.md) | react-router-dashboard | 4178 |
| [angular-signal-form-ticket](./angular-signal-form-ticket/README.md) | react-hook-form-support-ticket | 4179 |
| [angular-ngrx-diagnostics](./angular-ngrx-diagnostics/README.md) | tanstack-query-diagnostics (signal state) | 4180 |
| [angular-security-playground](./angular-security-playground/README.md) | security-playground | 4181 |

Run the Angular comparative proof demo:

```bash
pnpm --filter angular-troubleshooting-demo dev
```

## All React examples

| Example | Agent scenario | Key tool(s) | DOM-only gap |
|---------|----------------|-------------|--------------|
| [agent-troubleshooting-demo](./agent-troubleshooting-demo/README.md) | Why is checkout disabled? | `why_is_action_unavailable` | Blockers hidden from DOM |
| [vite-basic](./vite-basic/README.md) | What is app/page state? | `get_app_info`, `get_page_state` | Internal dirty flag not in DOM |
| [diagnostics-quickstart](./diagnostics-quickstart/README.md) | Why is Continue disabled? | `why_is_action_unavailable` | Terms gate in React state |
| [react-router-dashboard](./react-router-dashboard/README.md) | Where am I in the app? | route tools | Loader params not rendered |
| [react-hook-form-support-ticket](./react-hook-form-support-ticket/README.md) | What failed validation? | form submit + summary tools | Field errors not summarized in DOM |
| [tanstack-query-diagnostics](./tanstack-query-diagnostics/README.md) | Which queries are stale? | query cache summary | Full cache not safely visible |
| [security-playground](./security-playground/README.md) | Which tools are risky? | classification helpers | Risk metadata not in DOM |

## How to prompt agents

Use prompts that reference **observable symptoms**, then let WebMCP tools supply
structured facts:

```text
Symptom-first prompt (good):
"The Complete checkout button is disabled. List blockers using WebMCP tools."

Tool-directed prompt (also good):
"Call why_is_action_unavailable for actionId complete-checkout and summarize."
```

Avoid prompts that assume DOM visibility of internal state:

```text
Weak without WebMCP:
"Read the page and tell me why checkout is disabled."
```

## Measuring advantage objectively

The repo includes helpers in `@tooluminati/testing`:

- `collectDisabledActionReasonsFromDom()` — simulates DOM-only inspection
- `runComparativeProof()` — compares DOM vs WebMCP blocker counts

A passing comparative test means WebMCP returned strictly more actionable
diagnostic data than DOM inspection for the same UI state.

## Dev-only enablement

All examples use `enabled={import.meta.env.DEV}`. See
[docs/production.md](../docs/production.md) before enabling in production.

## Chrome setup

See [docs/chrome-setup.md](../docs/chrome-setup.md).
