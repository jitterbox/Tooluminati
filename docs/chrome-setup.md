# Chrome Setup

WebMCP is experimental.

For local testing in Chrome 149+:

1. Open `chrome://flags/#enable-webmcp-testing`.
2. Enable the flag.
3. Open `chrome://flags/#devtools-webmcp-support`.
4. Enable the flag.
5. Relaunch Chrome.

The DevTools Application panel then includes a WebMCP pane for inspecting
registered tools, schemas, invocation history, input, output, and status.

For Chrome DevTools MCP, enable the experimental category:

```bash
--categoryExperimentalWebmcp=true
```

When launching Chrome manually for automation, the relevant feature flags are:

```bash
--enable-features=WebMCPTesting,DevToolsWebMCPSupport
```

Chrome-only `getTools()` and `executeTool()` helpers are treated as testing
surfaces in Tooluminati, not required core registration APIs.
