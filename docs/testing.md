# Testing

Use `@react-webmcp-diagnostics/testing` for unit tests.

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

Run real Chrome WebMCP checks only in environments with Chrome 149+ flags
enabled. Keep mock-context tests as the default CI path.
