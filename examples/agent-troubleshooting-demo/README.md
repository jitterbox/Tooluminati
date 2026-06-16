# Agent Troubleshooting Demo

**Start here** if you want objective proof that WebMCP helps agents diagnose
React apps.

This example deliberately hides checkout blockers from the DOM. A disabled
button is visible, but the real reasons live only in Tooluminati diagnostics.

## Run locally

```bash
pnpm install
pnpm --filter agent-troubleshooting-demo dev
```

Open the app and click **Run DOM-only diagnosis** vs **Run WebMCP diagnosis**
to see the side-by-side comparison.

## Sample agent prompt

Paste this into Chrome DevTools MCP, Cursor, or any agent with WebMCP access:

```text
The "Complete checkout" button is disabled. Diagnose why the user cannot
checkout and list concrete blockers with stable action ids.
```

### Without WebMCP (DOM-only)

An agent inspecting the page can usually determine:

- the button exists
- the button is `disabled`

It **cannot** reliably determine:

- restricted SKU rules
- incomplete billing address validation
- permission or domain-state blockers stored in React state

Expected DOM-only result:

```json
{
  "label": "Complete checkout",
  "disabled": true,
  "visibleBlockerReasons": []
}
```

### With WebMCP

Ask the agent to call:

```json
why_is_action_unavailable({ "actionId": "complete-checkout" })
```

Expected tool result:

```json
{
  "actionId": "complete-checkout",
  "available": false,
  "reasons": [
    "Cart contains a restricted item (SKU-404).",
    "Billing address is incomplete."
  ]
}
```

## Objective proof (automated)

This scenario is covered by Playwright tests that assert:

| Metric | DOM-only | WebMCP |
|--------|----------|--------|
| Blocker reasons found | `0` | `≥ 2` |
| Can explain checkout failure | no | yes |

Run:

```bash
pnpm test:browser
```

See `tests/browser/comparative-proof.spec.ts` and
`packages/testing/src/comparative-proof.ts`.

## Chrome setup

Real browser validation requires Chrome 149+ flags. See
[docs/chrome-setup.md](../../docs/chrome-setup.md).

## Related examples

- [diagnostics-quickstart](../diagnostics-quickstart/README.md) — redaction +
  action availability
- [vite-basic](../vite-basic/README.md) — minimal tool registration
