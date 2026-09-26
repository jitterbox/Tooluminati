# React troubleshooting bundle

`@tooluminati/react-troubleshooting` wires timeline, workflow blockers, error
collection, optional TanStack Query tools, declarative form helpers, and the
dev troubleshooting panel.

## Quick start

```tsx
import { WebMcpTroubleshootingProvider } from '@tooluminati/react-troubleshooting';

<WebMcpTroubleshootingProvider enabled={import.meta.env.DEV}>
  <App />
</WebMcpTroubleshootingProvider>
```

See also [troubleshooting-panel.md](troubleshooting-panel.md) for panel
visibility and styling references.

## Key exports

- `WebMcpTroubleshootingProvider`
- `WebMcpTroubleshootingPanel`
- `WebMcpErrorBoundary`
- `useTanStackQueryWebMcpTools`
- `useFormSubmitBlockers`, `createFormSubmitBlockersProvider`
- `WebMcpForm`, `WebMcpInput`, `WebMcpSelect`, `WebMcpTextarea`
- `useAgentInvokedSubmit`, `useAgentSubmitRespondWith`,
  `respondWithAgentResult`
- `showWebMcpTroubleshootingPanel`, `hideWebMcpTroubleshootingPanel`,
  `toggleWebMcpTroubleshootingPanel`

Registered diagnostic tools include:

- `get_troubleshooting_timeline`
- `get_webmcp_environment`
- `get_workflow_blockers`
- `get_recent_client_errors`

Chrome's React docs point at community `usewebmcp` for generic tool
registration. Use Tooluminati when you need policy, redaction, and
diagnostic tools. Do not register the same names through both.

## Declarative WebMCP forms (spec attributes)

React components emit **real WebMCP spec attributes** on the DOM — not
Tooluminati-specific `data-webmcp-*` aliases. Importing the package also
augments React's HTML attribute types so native elements accept spec attrs in
JSX:

```tsx
import {
  WebMcpForm,
  WebMcpInput,
  useAgentInvokedSubmit,
  respondWithAgentResult,
} from '@tooluminati/react-troubleshooting';

function ProfileForm() {
  const onSubmit = useAgentInvokedSubmit((event) => {
    event.preventDefault();
    respondWithAgentResult(event.nativeEvent, 'Profile saved.');
  });

  return (
    <WebMcpForm
      toolName="update_profile"
      toolDescription="Update the signed-in user's profile email"
      toolAutoSubmit
      onSubmit={onSubmit}
    >
      <WebMcpInput
        name="email"
        type="email"
        toolParamDescription="Primary contact email"
      />
      <button type="submit">Save</button>
    </WebMcpForm>
  );
}
```

Rendered DOM:

```html
<form toolname="update_profile" tooldescription="..." toolautosubmit="">
  <input name="email" toolparamdescription="Primary contact email" />
</form>
```

You can also use spec attrs directly on native elements once the package is
imported:

```tsx
<form toolname="search" tooldescription="Search products">
  <input name="q" toolparamdescription="Search query" />
</form>
```

`get_workflow_blockers` and the troubleshooting timeline discover declarative
forms via `form[toolname]`. Pair declarative markup with
`createFormSubmitBlockersProvider` when agents also need imperative validation
and action-availability context.

## TanStack Query integration

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useTanStackQueryWebMcpTools } from '@tooluminati/react-troubleshooting';

useTanStackQueryWebMcpTools(queryClient, {
  allowKeys: [['profile']],
});
```

Pass `querySummaries` to `WebMcpTroubleshootingProvider` so
`get_workflow_blockers` includes query error context.

## Agent result handling

`useAgentSubmitRespondWith(getResult)` calls `respondWith` synchronously with a
promise, then evaluates `getResult`. It does not run result work for human
submissions or browsers without `respondWith`. Thrown errors and rejected
promises reach the browser as rejected results. Keep ordinary user-submit
behavior in your application's normal form handling.

See the [0.2.0 migration guide](migration-0.2.0.md) for cancellation and helper
input changes.
