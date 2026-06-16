# Security

WebMCP tools run in the user's live authenticated browser session. Treat every
agent as an untrusted client with access to powerful context.

## Required Defaults

- Register tools explicitly.
- Keep production disabled unless reviewed.
- Use `readOnlyHint: true` for diagnostics.
- Use `untrustedContentHint: true` for user-generated or external content.
- Validate tool arguments in code.
- Redact outputs by default.
- Keep outputs small.
- Avoid raw state, cache, token, cookie, or profile dumps.
- Require confirmation for write-capable tools.
- Do not use wildcard or insecure `exposedTo` origins.

## Prompt Injection

Tool descriptions, parameter descriptions, and tool outputs become model
context. Keep descriptions concise, avoid hidden instructions, and mark
untrusted content. Tools returning comments, reviews, tickets, search results,
or documents should set `untrustedContentHint`.

## Cross-Origin Exposure

Do not set `exposedTo` unless you would directly share the same data and actions
with that origin. This library validates secure origins and rejects wildcards.

## Production Modes

Use policy presets:

- `productionOffPolicySet`: no production registration.
- `productionSafePolicySet`: only reviewed tools with strict safety behavior.
- `ciStrictPolicy`: fail builds or tests on unsafe configurations.
