# Future WebMCP Compatibility

Tooluminati does not ship unstable reactive WebMCP APIs yet.

## Declarative WebMCP

The declarative explainer and Chrome's declarative API define form
attributes:

- `toolname`
- `tooldescription`
- `toolautosubmit`
- `toolparamdescription`

Chrome also ships `SubmitEvent.respondWith()`, `SubmitEvent.agentInvoked`,
and the `:tool-form-active` / `:tool-submit-active` pseudo-classes. The
main CG draft still lists declarative fold-in as incomplete.

**Supported today:**

- `@tooluminati/react-troubleshooting` — `WebMcpForm` / `WebMcpInput` /
  `WebMcpSelect` / `WebMcpTextarea` emit spec attributes; importing the
  package augments React JSX types for native elements.
  `respondWithAgentResult` / `useAgentSubmitRespondWith` wrap
  `SubmitEvent.respondWith()`. The troubleshooting panel injects default
  `:tool-form-active` / `:tool-submit-active` styles.
- `@tooluminati/angular-troubleshooting` — `WebMcpFormDirective` and
  `WebMcpParamDescriptionDirective` bind spec attributes and re-export
  the same submit helpers.
- `@tooluminati/diagnostics` — `get_workflow_blockers` and the
  troubleshooting timeline discover `form[toolname]` in the DOM.

Tooluminati does **not** polyfill browser declarative registration. When
Chrome implements declarative WebMCP, spec-marked forms should work
without markup changes. Imperative form tools from `@tooluminati/forms`
remain the supported path for React Hook Form, TanStack Form, ChatGPT
Site tools (which do not consume declarative or iframe tools), and
similar libraries.

## Resources And Subscriptions

Issue 151 proposes resource registration and subscriptions with APIs
like `registerResource`. Those APIs are **not** in the 2 September 2026
CG draft. MCP-B / `@mcp-b/global` expose similar primitives off-spec.

Tooluminati adapters are built around snapshot readers that can later
become resource `read()` callbacks. Until the proposal is in the spec,
polling tools are the supported mechanism. Do not call
`registerResource` on `document.modelContext`.

Future resource support should:

- use same-origin resource URIs
- debounce updates
- rate limit notifications
- preserve redaction and output policies
- avoid cross-origin subscription surprises
