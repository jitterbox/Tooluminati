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

## Examples and comparative proof

Start with [examples/agent-troubleshooting-demo](examples/agent-troubleshooting-demo/README.md)
for a side-by-side DOM vs WebMCP demo with sample agent prompts and automated
proof tests. See [examples/README.md](examples/README.md) for the full matrix.
