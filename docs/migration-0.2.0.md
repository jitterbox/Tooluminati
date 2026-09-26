# Upgrading to 0.2.0

Update all installed `@tooluminati/*` packages to 0.2.0 together. This is a
pre-1.0 minor release; the browser API remains experimental.

## Registration readiness and cancellation

`registerTool()` still returns synchronously so framework cleanup remains
synchronous. Await the returned `ready` promise to observe browser registration
success or failure:

```ts
const registration = registry.registerTool({
  name: 'get_status',
  description: 'Read application status.',
  annotations: { readOnlyHint: true, debugging: true },
  execute: () => ({ ready: true }),
});

try {
  await registration.ready;
} catch (error) {
  console.error('Tool registration failed', error);
}

// Removes the tool; existing executions keep their own cancellation signal.
registration.abort();
```

Asynchronous failures clean up the local registration and notify `onError`.
A stale failure or abort cannot remove a replacement registered under the same
name. Synchronous failures still throw in strict mode; in non-strict mode they
reject `ready`. Execution handlers receive the browser/client cancellation
signal independently of the registration signal.

## Browser invocation helpers

`executeWebMcpTool` and `invokeWebMcpTool` pass objects by default. On browsers
that require JSON string input, select the encoding before calling:

```ts
import { executeWebMcpTool, invokeWebMcpTool } from '@tooluminati/testing';

await executeWebMcpTool('get_status', {});
await executeWebMcpTool('get_status', {}, document, {
  inputFormat: 'json-string',
});
await invokeWebMcpTool(page, 'get_status', {}, {
  inputFormat: 'json-string',
});
```

Helpers never retry a failed execution. A handler may throw `TypeError` after
performing a write; automatic fallback could execute that write twice.
`MockModelContext` accepts both encodings. Discovery and execution types now
live on `BrowserModelContext`; the old testing-extension type remains an alias.

## Diagnostics and declarative forms

Diagnostic factories add `debugging: true`. Form submit tools default to
`consequentialHint: true`; explicit submit annotations can override defaults.
Read-only and untrusted-content hints remain available.

React's `useAgentSubmitRespondWith(getResult)` runs result work only for agent
submissions with a callable `respondWith`. It passes a promise synchronously
to the browser and propagates thrown errors or rejected promises. Human submits
retain their ordinary behavior. React and Angular both export
`respondWithAgentResult` and `isAgentInvokedSubmit` for direct event handling.

Troubleshooting panels install shared focus styles once. Applications can also
use `ensureDeclarativeFocusStyles` or `WEBMCP_DECLARATIVE_FOCUS_STYLES` directly.

## Framework and browser compatibility

React peers remain 18+. Angular peers allow 20–22; the workspace is tested on
Angular 20. Angular 21/22 are not validated by a multi-version CI matrix.
Do not register the same tool names through Tooluminati and another framework
integration.

Local validation passed 186 unit tests, all package builds, React/Angular
browser integration tests (15 passing), and two native Chrome 154 legacy-input cases. The two
native Chrome 155+ object-input cases remain unverified on that browser version.
Chrome 154 omitted `debugging` from discovery metadata. DevTools discovery is
covered through the API, not panel UI automation.

See [testing](testing.md) for the optional native-browser command and
[Chrome setup](chrome-setup.md) for browser flags.
