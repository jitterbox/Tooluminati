# Getting Started with Tooluminati

> **Angular apps:** see [angular-getting-started.md](angular-getting-started.md).

Install the packages you need:

```bash
pnpm add @tooluminati/core \
  @tooluminati/react \
  @tooluminati/diagnostics
```

Wrap your app with explicit enablement:

```tsx
import { WebMcpProvider } from '@tooluminati/react';

<WebMcpProvider enabled={import.meta.env.DEV}>
  <App />
</WebMcpProvider>;
```

Register diagnostics through package factories:

```tsx
import { useWebMcpTools } from '@tooluminati/react';
import {
  createAppInfoTool,
  createActionAvailabilityTool,
} from '@tooluminati/diagnostics';

useWebMcpTools([
  createAppInfoTool(() => ({
    name: 'Customer Portal',
    version: '1.0.0',
    environment: import.meta.env.MODE,
  })),
  createActionAvailabilityTool(actionAvailabilityProvider),
]);
```

Production enablement should be deliberate and reviewed. Use policy presets to
make that decision explicit.

## Troubleshooting bundle

For timeline, workflow blockers, environment checks, and a dev panel, add
`@tooluminati/react-troubleshooting`:

```tsx
import { WebMcpTroubleshootingProvider } from '@tooluminati/react-troubleshooting';

<WebMcpTroubleshootingProvider enabled={import.meta.env.DEV}>
  <App />
</WebMcpTroubleshootingProvider>;
```

See [react-troubleshooting.md](react-troubleshooting.md) and
[troubleshooting-panel.md](troubleshooting-panel.md).

## Chrome `usewebmcp`

Chrome's React docs point at the community `usewebmcp` hook for generic
`registerTool` plumbing. Tooluminati is the policy, redaction, and
diagnostic catalog layer. Keep `WebMcpProvider` / `useWebMcpTool` as the
registration path. Do not also register the same tool names through
`usewebmcp`.
