# Chrome Setup

WebMCP is experimental. It is a Community Group draft in a Chromium
origin trial (Chrome 149–156 / Edge through 17 Nov 2026). Chrome 157 is
listed as a ship *target*, not a contract.

## Local flags

For local testing:

1. Open `chrome://flags/#enable-webmcp-testing`.
2. Set the flag to Enabled.
3. Relaunch Chrome.

Chrome 150+ turns DevTools WebMCP support on by default. On Chrome 149
only, also enable `chrome://flags/#devtools-webmcp-support`.

The DevTools Application panel then includes a WebMCP pane for inspecting
registered tools, schemas, invocation history, input, output, and status.

For public origins during the trial, register an Origin-Trial token
instead of relying on the local testing flag.

## Chrome DevTools MCP

For Chrome DevTools MCP, enable the experimental category:

```bash
--categoryExperimentalWebmcp=true
```

When launching Chrome manually for automation, the page API still needs
`WebMCPTesting`. Include `DevToolsWebMCPSupport` only when targeting
Chrome 149:

```bash
--enable-features=WebMCPTesting
```

`getTools()` and `executeTool()` are in the 2 September 2026 CG draft.
Pass a JSON-serializable **object** to `executeTool` (Chrome 155+).
String input is deprecated.

```js
const [tool] = await document.modelContext.getTools();
await document.modelContext.executeTool(tool, { actionId: 'save' });
```

For Chrome 149, use `--enable-features=WebMCPTesting,DevToolsWebMCPSupport`.
For legacy string input through Tooluminati helpers, see the
[0.2.0 migration guide](migration-0.2.0.md#browser-invocation-helpers).
