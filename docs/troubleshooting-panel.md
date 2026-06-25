# Troubleshooting panel

Optional dev-only UI for verifying WebMCP setup without Chrome's Inspector
Extension.

Reference designs:

- [WebMcpTroubleshootingPanel-Spec.html](ui/WebMcpTroubleshootingPanel-Spec.html)
- [WebMcpTroubleshootingPanel-Mockup.html](ui/WebMcpTroubleshootingPanel-Mockup.html)

## React

```tsx
import { WebMcpTroubleshootingProvider } from '@tooluminati/react-troubleshooting';

<WebMcpTroubleshootingProvider
  enabled={import.meta.env.DEV}
  panel={{ enabled: 'auto', render: 'auto', startCollapsed: true }}
>
  <App />
</WebMcpTroubleshootingProvider>
```

Imperative visibility:

```ts
import {
  showWebMcpTroubleshootingPanel,
  hideWebMcpTroubleshootingPanel,
  toggleWebMcpTroubleshootingPanel,
} from '@tooluminati/react-troubleshooting';
```

URL override (opt-in): `?tooluminati-panel=1` when
`panel.allowUrlOverride: true`.

## Angular

```ts
import { provideWebMcpTroubleshooting } from '@tooluminati/angular-troubleshooting';

export const appConfig = {
  providers: [
    provideWebMcpTroubleshooting({
      enabled: isDevMode(),
      panel: { enabled: 'auto', render: 'auto' },
    }),
  ],
};
```

Template:

```html
<webmcp-troubleshooting-panel [startCollapsed]="true" />
```

## Five signals

1. WebMCP support (`get_webmcp_environment`)
2. Registered tool count
3. Timeline events (`get_troubleshooting_timeline`)
4. Environment warnings
5. Client errors (`ClientErrorBuffer`)

The panel is read-only and uses the same redaction policy as diagnostics tools.

Copy diagnostics serializes all five signals to JSON for bug reports.
