# Getting Started with Tooluminati on Angular

Install the Angular packages you need:

```bash
pnpm add @tooluminati/core \
  @tooluminati/angular \
  @tooluminati/diagnostics
```

Optional adapters:

```bash
pnpm add @tooluminati/angular-forms \
  @tooluminati/angular-router \
  @tooluminati/angular-state \
  @tooluminati/angular-devtools
```

## Application setup

Register a root registry in `app.config.ts`:

```typescript
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideWebMcpRegistry } from '@tooluminati/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideWebMcpRegistry({ enabled: isDevMode() }),
  ],
};
```

## Register diagnostic tools

Use `registerWebMcpTools()` inside an environment initializer:

```typescript
import {
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import {
  createAppInfoTool,
  createActionAvailabilityTool,
} from '@tooluminati/diagnostics';
import { registerWebMcpTools } from '@tooluminati/angular';

export function provideDiagnostics() {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      registerWebMcpTools(
        [
          createAppInfoTool(() => ({
            name: 'Customer Portal',
            version: '1.0.0',
            environment: 'development',
            webMcpEnabled: true,
          })),
          createActionAvailabilityTool(actionsProvider),
        ],
        { source: 'scope' },
      );
    }),
  ]);
}
```

## Component-scoped tools

Register a tool from a component constructor (injection context):

```typescript
import { Component } from '@angular/core';
import { registerWebMcpTool } from '@tooluminati/angular';

@Component({ selector: 'app-profile', template: '...' })
export class ProfileComponent {
  private readonly state = { version: 1 };

  constructor() {
    registerWebMcpTool(
      () => ({
        name: 'get_profile_version',
        description: 'Returns the current profile version.',
        annotations: { readOnlyHint: true },
        execute: () => ({ version: this.state.version }),
      }),
      { source: 'hook' },
    );
  }
}
```

The `execute` closure reads the latest component state without re-registering on
every change — the same invariant as the React hooks. Pass `definitionDeps` with
signals when tool metadata (name, schema, annotations) must re-register.

## Scoped tools

Use `WebMcpScopeComponent` or route-level providers to register scoped tools with
an optional namespace segment:

```typescript
import { WebMcpScopeComponent } from '@tooluminati/angular';

@Component({
  imports: [WebMcpScopeComponent],
  template: '<web-mcp-scope namespaceSegment="checkout"><ng-content /></web-mcp-scope>',
})
export class CheckoutShellComponent {}
```

## Security banner

```typescript
import { WebMcpSecurityBannerComponent } from '@tooluminati/angular';

@Component({
  imports: [WebMcpSecurityBannerComponent],
  template: '<web-mcp-security-banner />',
})
export class AppComponent {}
```

## Route, form, and state adapters

| Package | API |
|---------|-----|
| `@tooluminati/angular-router` | `provideWebMcpRouteTools(provider)` |
| `@tooluminati/angular-forms` | `provideWebMcpFormTool(options)`, `provideWebMcpFormTools([...])`, `provideSignalFormWebMcpTool(options)` |
| `@tooluminati/angular-state` | `provideSignalStateWebMcpTools({ state, selector })`, `provideNgRxWebMcpTools(store, selectors)` |
| `@tooluminati/angular-devtools` | `WebMcpDebugPanelComponent`, `webMcpRegisteredTools()` |

See the Angular examples under `examples/angular-*` and
[docs/angular-comparison.md](angular-comparison.md) for React parity notes.

## Angular native WebMCP APIs

Angular **22** ships experimental `provideExperimentalWebMcpTools`,
`declareExperimentalWebMcpTool`, and Signal Forms
`provideExperimentalWebMcpForms` / `experimentalWebMcpTool`.
Tooluminati peers Angular `>=20 <23` and uses `@tooluminati/core`'s
`WebMcpRegistry` so policy, redaction, and security presets match the
React packages.

Do not double-register the same tool through both APIs. Prefer Angular
native implicit Signal Form tools for user-facing forms on Angular 22,
and Tooluminati `provideWebMcpFormTool` for policy-wrapped diagnostics.

## Troubleshooting bundle

For timeline, workflow blockers, and the dev panel:

```typescript
import { isDevMode } from '@angular/core';
import { provideWebMcpTroubleshooting } from '@tooluminati/angular-troubleshooting';

export const appConfig = {
  providers: [
    provideWebMcpTroubleshooting({
      enabled: isDevMode(),
      panel: { enabled: 'auto', render: 'auto', startCollapsed: true },
    }),
  ],
};
```

See [angular-troubleshooting.md](angular-troubleshooting.md).

## Examples

```bash
pnpm --filter angular-basic dev
pnpm --filter angular-troubleshooting-demo dev
```

Production enablement should be deliberate. See [production.md](production.md).
