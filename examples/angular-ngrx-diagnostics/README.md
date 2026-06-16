# Angular Signal State Diagnostics

Fail-closed signal-backed state summaries with an explicit allowlist.

## Run

```bash
pnpm --filter angular-ngrx-diagnostics dev
```

## Agent prompt

```text
Summarize signal-backed query health for allowlisted keys only. Do not dump
the full state or secrets.
```

## Expected tool calls

1. `get_signal_state_summary` — only `users` query metadata

## DOM-only vs WebMCP

| Fact | DOM-only | WebMCP |
|------|----------|--------|
| Query loading/error | not in DOM | per-key status in summary |
| Stale flags | not in DOM | included when configured |
| Secret state | must not scrape from memory | omitted unless allowlisted |

The demo state includes `internal-secrets` — WebMCP exposes only `users` by
design. Without allowlists, agents might guess or hallucinate cache contents.

## Chrome setup

[docs/chrome-setup.md](../../docs/chrome-setup.md)
