# Testing

Use `@tooluminati/testing` for unit tests.

```ts
const mock = installModelContextMock();
```

The mock supports:

- `registerTool()`
- AbortSignal cleanup
- `toolchange`
- `getTools()`
- `executeTool()`
- invocation history

For browser tests, use `expectWebMcpTool(page, name)` and
`invokeWebMcpTool(page, name, args)`.

For DevTools MCP integration helpers, use `listWebMcpTools()` and
`executeWebMcpTool(name, args)` from `devtools-mcp-helper.ts`. These
return empty results or throw when WebMCP is unavailable, which is the
expected CI default.

Run real Chrome WebMCP checks only in environments with Chrome 149+ flags
enabled. Keep mock-context tests as the default CI path.

## Comparative proof (DOM vs WebMCP)

The flagship [agent-troubleshooting-demo](../examples/agent-troubleshooting-demo/README.md)
and `tests/browser/comparative-proof.spec.ts` assert an objective gap:

- DOM-only inspection finds **0** checkout blocker reasons
- WebMCP `why_is_action_unavailable` returns **≥ 2** actionable reasons

Helpers:

```ts
import {
  runComparativeProof,
  collectDisabledActionReasonsFromDom,
} from '@tooluminati/testing';
```

`runComparativeProof()` returns `webMcpIsStrictlyMoreInformative: true` when
WebMCP provides strictly more diagnostic data than DOM inspection for the same
UI state.

## Chrome 149 validation checklist

Use this checklist when validating against real Chrome WebMCP (not CI mocks):

1. Enable WebMCP in Chrome 149+ (`chrome://flags` or enterprise policy).
2. Load a local example (`pnpm --filter vite-basic dev`) over `http://localhost`.
3. Confirm `document.modelContext` exists in DevTools console.
4. Call `await document.modelContext.getTools()` and verify registered tool names.
5. Execute `get_app_info` and confirm redacted, read-only output.
6. Execute `get_page_state` and confirm page summary matches UI state.
7. Toggle a UI control and re-run tools to confirm live updates after `toolchange`.
8. Verify the security banner lists the same registered tools as `getTools()`.
9. Confirm production build disables registration (`import.meta.env.PROD`).
10. Re-run `pnpm test:browser` to ensure mock-based CI coverage still passes.
