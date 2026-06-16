# TanStack Query Diagnostics

Fail-closed query cache summaries with an explicit allowlist.

## Run

```bash
pnpm --filter tanstack-query-diagnostics dev
```

## Agent prompt

```text
Summarize TanStack Query cache health for allowlisted keys only. Do not dump
the full cache.
```

## Expected tool calls

1. Query cache summary tool with `allowKeys: [['users']]`

## DOM-only vs WebMCP

| Fact | DOM-only | WebMCP |
|------|----------|--------|
| Query loading/error | not in DOM | per-key status in summary |
| Stale flags | not in DOM | included when configured |
| Secret query data | must not scrape from memory | omitted unless allowlisted + redacted |

The demo cache includes `internal-secrets` — WebMCP exposes only `users` by
design. Without allowlists, agents might guess or hallucinate cache contents.

## Automated test

`packages/state/src/tanstack-query.test.ts` verifies full cache is not dumped
without `allowKeys`.

## Chrome setup

[docs/chrome-setup.md](../../docs/chrome-setup.md)
