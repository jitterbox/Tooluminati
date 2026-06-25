# Angular troubleshooting bundle

`@tooluminati/angular-troubleshooting` mirrors the React bundle with Angular
providers, error handler integration, declarative form directives, and the dev
panel component.

## Quick start

```ts
import { provideWebMcpTroubleshooting } from '@tooluminati/angular-troubleshooting';

export const appConfig = {
  providers: [provideWebMcpTroubleshooting({ enabled: isDevMode() })],
};
```

With auto-rendered panel (recommended for dev):

```ts
provideWebMcpTroubleshooting({
  enabled: isDevMode(),
  panel: { enabled: 'auto', render: 'auto', startCollapsed: true },
});
```

See [troubleshooting-panel.md](troubleshooting-panel.md) for panel options.

## Key exports

- `provideWebMcpTroubleshooting`
- `WebMcpTroubleshootingPanelComponent`
- `WebMcpFormDirective`, `WebMcpParamDescriptionDirective`
- `injectTroubleshootingPanel`
- `webMcpShowTroubleshootingPanel`, `webMcpHideTroubleshootingPanel`,
  `webMcpToggleTroubleshootingPanel`

Example: [angular-troubleshooting-demo](../examples/angular-troubleshooting-demo/)

## Declarative WebMCP forms (spec attributes)

Directives bind WebMCP spec attributes on the host element:

```html
<form
  webMcpForm="update_profile"
  toolDescription="Update the signed-in user's profile email"
  webMcpAutoSubmit
>
  <input
    name="email"
    type="email"
    webMcpParamDescription="Primary contact email"
  />
  <button type="submit">Save</button>
</form>
```

Rendered DOM:

```html
<form toolname="update_profile" tooldescription="..." toolautosubmit="">
  <input name="email" toolparamdescription="Primary contact email" />
</form>
```

For Signal Forms tool registration (imperative tools, not declarative attrs),
use `@tooluminati/angular-forms` (`provideWebMcpFormTool`,
`provideSignalFormWebMcpTool`) alongside this bundle.

## Signal Forms

`@tooluminati/angular-troubleshooting` does not auto-register Signal Form
state. Compose it with `@tooluminati/angular-forms` when agents need both
declarative form markup and structured form summary/submit tools.
