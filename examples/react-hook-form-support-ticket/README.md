# React Hook Form Support Ticket

Form submit tool plus validation summary for agent-driven support tickets.

## Run

```bash
pnpm --filter react-hook-form-support-ticket dev
```

## Agent prompt

```text
Inspect the support ticket form. List validation errors without submitting,
then submit when valid.
```

## Expected tool calls

1. `{name}_validation_summary` — schema + field errors + dirty/touched state
2. `submit_support_ticket` — after validation passes

## DOM-only vs WebMCP

| Fact | DOM-only | WebMCP |
|------|----------|--------|
| Empty fields | visible inputs | summarized error messages |
| All validation rules | scattered in DOM | single structured summary |
| Submitting state | hard to infer | explicit in tool output |

Leave Subject/Message empty and compare reading individual inputs vs calling
the validation summary tool.

## Chrome setup

[docs/chrome-setup.md](../../docs/chrome-setup.md)
