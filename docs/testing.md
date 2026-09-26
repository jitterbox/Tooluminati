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
- `executeTool(tool, inputObject)` (also accepts a JSON string)
- invocation history

For browser tests, use `expectWebMcpTool(page, name)` and
`invokeWebMcpTool(page, name, args)`. Helpers pass an object to
`executeTool`. For legacy browsers requiring string input, explicitly select
`{ inputFormat: 'json-string' }` before invoking:

```ts
await invokeWebMcpTool(page, name, args, { inputFormat: 'json-string' });
await executeWebMcpTool(name, args, document, { inputFormat: 'json-string' });
```

Execution errors are never retried automatically: a tool can throw `TypeError`
after already performing a write.

For DevTools MCP integration helpers, use `listWebMcpTools()` and
`executeWebMcpTool(name, args)` from `devtools-mcp-helper.ts`. These
return empty results or throw when WebMCP is unavailable, which is the
expected CI default.

WebMCP eval-style helpers:

- `snapshotRegisteredTools(page)`
- `createToolCallEvalFixture(tools, cases)`
- `assertToolSchemaBudgets(tools)`
- `runToolSelectionSmokeTest(tools, prompt, expected)`
- `runTimelineComparativeProof(page, options)`

See [chrome-setup.md](chrome-setup.md) for the Model Context Inspector
Extension workflow.

Run real Chrome WebMCP checks only in environments with Chrome 149+
flags or an origin-trial token. Keep mock-context tests as the default
CI path.

Optional real-Chrome Playwright job:

```bash
WEBMCP_REAL_CHROME=1 pnpm exec playwright test --config playwright.webmcp.config.ts
```

The native suite tests legacy string input on Chrome 153+ and object input
on Chrome 155+. Only the object cases skip on Chrome 153–154. The suite skips unless
`WEBMCP_REAL_CHROME=1` is set. Its dedicated configuration launches installed
Chrome with WebMCP testing flags; set `WEBMCP_CHROME_EXECUTABLE` for another
Chrome binary. It does **not** inject a mock or start the example servers.
It checks metadata discovery (the surface used by inspectors), same-origin
`fromOrigins`, object execution, unregister cleanup, and pending execution
surviving unregister. Chrome 154 omits `debugging` from discovered annotations; that assertion runs
with the Chrome 155+ object cases. The suite does not automate the DevTools panel UI.

## Angular unit tests

Angular packages use Vitest with Angular `TestBed` (`packages/angular/src/test-setup.ts`).
Import the setup file at the top of Angular `*.test.ts` files:

```ts
import './test-setup';
```

Run Angular provider tests:

```bash
pnpm test -- packages/angular
```

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

`runComparativeProof()` returns `webMcpIsStrictlyMoreInformative: true`
when WebMCP provides strictly more diagnostic data than DOM inspection
for the same UI state.

## Chrome 149+ validation checklist

Use this checklist when validating against real Chrome WebMCP (not CI mocks):

1. Enable WebMCP (`chrome://flags/#enable-webmcp-testing` or an OT token).
   On Chrome 149 only, also enable `#devtools-webmcp-support`.
2. Load a local example (`pnpm --filter vite-basic dev`) over `http://localhost`.
3. Confirm `typeof document.modelContext.registerTool === 'function'`.
4. Call `await document.modelContext.getTools()` and verify registered tool names.
5. Execute with an object: `executeTool(tool, {})` — not a JSON string.
6. Execute `get_app_info` and confirm redacted, read-only, `debugging` output.
7. Toggle a UI control and re-run tools to confirm live updates after `toolchange`.
8. Unregister a tool while an execute is in flight (Chrome 153+): execute
   should finish; registration abort must not cancel it.
9. Verify the security banner lists the same registered tools as `getTools()`.
10. Confirm production build disables registration (`import.meta.env.PROD`).
11. Re-run `pnpm test:browser` to ensure mock-based CI coverage still passes.
