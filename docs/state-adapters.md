# State Adapters

State adapters are explicit and selector-based.

Rules:

- Never dump a whole store or cache by default.
- Require selectors or allowlisted query keys.
- Summarize status before data.
- Redact sensitive values.
- Keep outputs small.

Useful summaries include:

- loading/fetching status
- stale state
- retry/error messages
- updated timestamps
- selected entity ids
- counts and shape summaries
- optimistic or pending mutation indicators
