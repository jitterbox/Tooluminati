# Form + query troubleshooting

Demonstrates `@tooluminati/react-troubleshooting` with TanStack Query errors,
form validation blockers, and WebMCP spec attributes on a declarative form.

## Run locally

```bash
pnpm install
pnpm --filter form-query-troubleshooting dev
```

## What it proves

- `get_workflow_blockers` merges action reasons and query error context
- `get_query_cache_summary` reports the failing profile query
- `WebMcpForm` / `WebMcpInput` emit spec attrs (`toolname`, `toolparamdescription`)
- The troubleshooting panel mounts in dev (`render: 'auto'`)

## Sample agent prompt

```text
The Save profile button is disabled. Call get_workflow_blockers and explain
both form validation and query failures.
```

## Automated proof

```bash
pnpm test:browser --project form-query-troubleshooting
```

See `tests/browser/form-query-comparative-proof.spec.ts`.

## Related docs

- [docs/react-troubleshooting.md](../../docs/react-troubleshooting.md)
- [docs/troubleshooting-panel.md](../../docs/troubleshooting-panel.md)
