# Security Playground

Surfaces tool risk classification before exposing capabilities to agents.

## Run

```bash
pnpm --filter security-playground dev
```

## Agent prompt

```text
List registered tools and classify which are safe read-only diagnostics vs
write-capable or untrusted content tools.
```

## Expected observations

| Tool | Risk | Why |
|------|------|-----|
| `safe_read_snapshot` | low | `readOnlyHint: true` |
| `unsafe_delete_records` | high | write-capable, no confirmation |
| `untrusted_html_preview` | medium | `untrustedContentHint: true` |

## DOM-only vs WebMCP

| Fact | DOM-only | WebMCP |
|------|----------|--------|
| Tool names | not in DOM | via `get_visible_agent_tools` |
| Read vs write intent | not inferable | `annotations` + policy classification |
| Prompt injection risk | invisible | flagged for untrusted tools |

Use this example when designing agent guardrails and CI strict policy.

## Chrome setup

[docs/chrome-setup.md](../../docs/chrome-setup.md)
