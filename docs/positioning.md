# Positioning

Tooluminati is not primarily a generic React hook wrapper for
`document.modelContext.registerTool()`.

Generic hook packages are useful when an app only needs registration plumbing.
Tooluminati focuses on the harder layer: consistent, safe interpretation of
React runtime surfaces that agents cannot infer from the DOM.

## Differentiator

A hook package says: here is how to register a tool.

Tooluminati says: here are the correct, safe, React-specific tools your app
should expose so agents can troubleshoot it.

## Design Model

```txt
Core: strict, tiny, boring
Adapters: opinionated, safe by default
App integration: configurable, explicit, overrideable
Escape hatches: possible, noisy, documented
```

The core layer handles lifecycle, cleanup, validation, browser API isolation,
and security boundaries. Adapter packages encode recommended diagnostics for
forms, routers, state libraries, errors, and action availability.
