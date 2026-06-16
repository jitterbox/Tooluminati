# React WebMCP Diagnostics

Opinionated React diagnostics and agent observability for the emerging WebMCP
browser API.

This project is intentionally not just another `useWebMcpTool` hook. Generic
hook packages solve registration plumbing. React WebMCP Diagnostics focuses on
safe, consistent interpretation of React runtime surfaces: forms, routers, data
caches, action availability, errors, hydration, and production security policy.

WebMCP is experimental and currently requires browser flags or origin-trial
support. All APIs in this repository should be treated as pre-1.0 and subject
to change as the draft evolves.
