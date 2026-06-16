# Angular Comparison

Tooluminati mirrors Angular's experimental WebMCP lifecycle model while routing
all registration through `@tooluminati/core`'s `WebMcpRegistry` for policy
parity with React.

## Lifecycle mapping

| Angular 20+ (experimental; peer `^20.0.0` in packages) | Tooluminati Angular |
|---|---|
| Injector lifecycle | `provideWebMcpRegistry()` |
| `DestroyRef.onDestroy()` | `registration.abort()` via `DestroyRef` |
| `declareExperimentalWebMcpTool()` | `registerWebMcpTool()` |
| `provideExperimentalWebMcpTools()` | `provideWebMcpRegistry()` + `registerWebMcpTools()` |
| Signal Forms `experimentalWebMcpTool` | `provideWebMcpFormTool()` + `@tooluminati/forms` factories |

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
| Angular native implicit Signal Form tools | Complementary; Tooluminati adds policy + diagnostic tools |

See [angular-getting-started.md](angular-getting-started.md) for setup.
