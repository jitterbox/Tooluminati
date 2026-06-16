# Angular Comparison

Angular 22's experimental WebMCP support is the implementation model to mirror:

- injector lifecycle maps to React provider/component/route unmount
- `DestroyRef.onDestroy()` maps to `AbortController.abort()`
- `declareExperimentalWebMcpTool()` maps to `useWebMcpTool()`
- `provideExperimentalWebMcpTools()` maps to `WebMcpProvider` and
  `WebMcpScope`
- Signal Forms integration maps to form adapters

React differs by using public ecosystem APIs: form libraries, routers, data
caches, and explicit selectors. Tooluminati intentionally avoids Fiber and
React DevTools internals.
