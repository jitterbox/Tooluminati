# Angular Diagnostics Quickstart

Policy preset + redaction + action availability for a gated Continue button.

## Run

```bash
pnpm --filter angular-diagnostics-quickstart dev
```

## Agent prompt

```text
The Continue button is disabled. Explain why using WebMCP and do not expose
secrets from app metadata.
```

## Expected tool calls

1. `why_is_action_unavailable({ "actionId": "Continue" })` or equivalent
2. `get_app_info` — should return redacted output (no raw `apiToken`)

## DOM-only vs WebMCP

| Fact | DOM-only | WebMCP |
|------|----------|--------|
| Continue disabled | yes | yes |
| Terms not accepted | checkbox state only | explicit reason array |
| Support email / tokens | may appear in DOM if rendered | redacted via policy |

Click **Show redacted app info** to compare UI redaction with tool output.

## Chrome setup

[docs/chrome-setup.md](../../docs/chrome-setup.md)
