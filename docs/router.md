# Router Diagnostics

Route tools should be scoped to route lifecycles. Prefer mounting tools inside
route elements or route-specific providers so they disappear on navigation.

Expose:

- current route
- params
- search/hash
- safe match summaries
- navigation state
- blockers and blocker reasons
- redacted loader/context summaries

Do not expose raw loader data by default. Summaries should describe shape,
status, count, and safe labels before data.
