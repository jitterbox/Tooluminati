# Failed request troubleshooting

Demonstrates `@tooluminati/react-troubleshooting` timeline capture when a
checkout mutation fails over the network.

## Run locally

```bash
pnpm install
pnpm --filter failed-request-troubleshooting dev
```

## What it proves

- DOM shows a disabled button with no visible blocker text
- `get_troubleshooting_timeline` records the HTTP failure after a failed save
- `why_is_action_unavailable` (via `actionProvider`) returns structured reasons
- Side-by-side DOM-only vs WebMCP diagnosis in the UI

## Sample agent prompt

```text
Checkout failed after I clicked save. Use get_troubleshooting_timeline to find
the HTTP failure and summarize why checkout is blocked.
```

## Automated proof

Covered by the failed-request Playwright project:

```bash
pnpm test:browser --project failed-request-troubleshooting
```

## Related docs

- [docs/react-troubleshooting.md](../../docs/react-troubleshooting.md)
- [docs/diagnostics.md](../../docs/diagnostics.md)
