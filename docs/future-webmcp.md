# Future WebMCP Compatibility

Tooluminati does not ship unstable reactive WebMCP APIs yet.

## Declarative WebMCP

The declarative explainer defines form attributes:

- `toolname`
- `tooldescription`
- `toolautosubmit`
- `toolparamdescription`

It also discusses `SubmitEvent.respondWith()` and form-active pseudo-classes.

**Supported today:**

- `@tooluminati/react-troubleshooting` — `WebMcpForm` / `WebMcpInput` /
  `WebMcpSelect` / `WebMcpTextarea` emit spec attributes; importing the package
  augments React JSX types for native elements.
- `@tooluminati/angular-troubleshooting` — `WebMcpFormDirective` and
  `WebMcpParamDescriptionDirective` bind spec attributes.
- `@tooluminati/diagnostics` — `get_workflow_blockers` and the troubleshooting
  timeline discover `form[toolname]` in the DOM.

Tooluminati does **not** polyfill browser declarative registration. When Chrome
implements declarative WebMCP, spec-marked forms should work without markup
changes. Imperative form tools from `@tooluminati/forms` remain the supported
path for React Hook Form, TanStack Form, and similar libraries.

## Resources And Subscriptions

Issue 151 proposes resource registration and subscriptions with APIs like:

- `registerResource`
- `unregisterResource`
- `notifyResourceUpdated`
- `subscribeHint`

Tooluminati adapters are built around snapshot readers that can later become
resource `read()` callbacks. Until the proposal stabilizes, polling tools are
the supported mechanism.

Future resource support should:

- use same-origin resource URIs
- debounce updates
- rate limit notifications
- preserve redaction and output policies
- avoid cross-origin subscription surprises
