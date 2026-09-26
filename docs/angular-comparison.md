# Angular Comparison

Tooluminati mirrors Angular's experimental WebMCP lifecycle model while routing
all registration through `@tooluminati/core`'s `WebMcpRegistry` for policy
parity with React.

Angular peer range is `>=20 <23`. Official Angular WebMCP APIs shipped as
experimental in **Angular 22**. Tooluminati does not require Angular 22.

## Lifecycle mapping

| Angular 22 (experimental) | Tooluminati Angular |
|---|---|
| Injector lifecycle | `provideWebMcpRegistry()` |
| `DestroyRef.onDestroy()` | `registration.abort()` via `DestroyRef` |
| `declareExperimentalWebMcpTool()` | `registerWebMcpTool()` |
| `provideExperimentalWebMcpTools()` | `provideWebMcpRegistry()` + `registerWebMcpTools()` |
| Signal Forms `experimentalWebMcpTool` | Native Angular for implicit forms; Tooluminati `provideWebMcpFormTool()` for policy-wrapped / non-signal forms |

React differs by using public ecosystem APIs: form libraries, routers, data
caches, and explicit selectors. Tooluminati intentionally avoids Fiber and
React DevTools internals.

## Package parity

| React | Angular |
|---|---|
| `@tooluminati/react` | `@tooluminati/angular` |
| `@tooluminati/forms` | `@tooluminati/angular-forms` |
| `@tooluminati/router` (`WebMcpReactRouterScope`) | `@tooluminati/angular-router` |
| `@tooluminati/state` | `@tooluminati/angular-state` |
| `@tooluminati/devtools` | `@tooluminati/angular-devtools` |
| `@tooluminati/core`, `@tooluminati/policies`, `@tooluminati/diagnostics`, `@tooluminati/testing` | Reused unchanged |

## Known gaps

| React feature | Angular note |
|---|---|
| TanStack Query adapter | Use `@tooluminati/angular-state` with signals or NgRx |
| React Hook Form / Formik hooks | Use `@tooluminati/angular-forms` |
| Angular native implicit Signal Form tools | Complementary; do not double-register the same names |

If an app uses both Tooluminati and Angular native WebMCP, keep Tooluminati
on diagnostic names (`get_*`, `why_*`) and let Angular own user-facing
actions.

See [angular-getting-started.md](angular-getting-started.md) for setup.
