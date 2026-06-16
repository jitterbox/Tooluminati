# Tool Authoring

Prefer a small number of high-value tools.

Good tools:

- Describe one capability clearly.
- Use simple JSON schemas.
- Validate arguments at runtime.
- Return small, redacted summaries.
- Explain why an action is unavailable instead of exposing internal state.

Avoid:

- Raw Redux or query-cache dumps.
- Hidden instructions in descriptions.
- Broad write tools without confirmation.
- Over-parameterized schemas that ask agents for personal data.
- Route or component tools that remain registered after unmount.
