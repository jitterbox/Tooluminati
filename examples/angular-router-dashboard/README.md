# Angular Router Dashboard

Route-scoped tools and navigation diagnostics with a disabled export action.

## Run

```bash
pnpm --filter angular-router-dashboard dev
```

## Agent prompt

```text
Which route am I on, what is navigation state, and why is Export report
disabled?
```

## Expected tool calls

1. Route tools from `provideWebMcpRouteTools` (e.g. current route, navigation state)
2. `why_is_action_unavailable({ "actionId": "export-report" })`

## DOM-only vs WebMCP

| Fact | DOM-only | WebMCP |
|------|----------|--------|
| Current pathname | visible in UI | structured route tool output |
| Route params (`tab`) | may be hidden | available via router adapter |
| Export disabled reason | not in DOM | `"Export is disabled in this demo environment."` |

Navigate between Dashboard and Settings and confirm route tools update.

## Chrome setup

[docs/chrome-setup.md](../../docs/chrome-setup.md)
