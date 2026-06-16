# Future WebMCP Compatibility

Tooluminati does not ship unstable declarative or reactive WebMCP APIs yet.

## Declarative WebMCP

The declarative explainer currently discusses form attributes such as:

- `toolname`
- `tooldescription`
- `toolautosubmit`
- `toolparamdescription`

It also discusses `SubmitEvent.respondWith()` and form-active pseudo-classes.
The form adapter package keeps metadata close to these concepts, but does not
polyfill browser declarative behavior.

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
