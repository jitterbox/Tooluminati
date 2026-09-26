# Changelog

## 0.2.0

Align with the 2 September 2026 WebMCP Community Group draft.

- Feature-detect `registerTool` on `document.modelContext`
- `RegisteredWebMcpTool.ready` for async browser registration
- Chrome 153: registration abort no longer cancels in-flight execute
- `getTools` / object `executeTool` as first-class APIs (explicit legacy string mode)
- Spec annotations: `debugging`, `consequentialHint`
- Declarative `SubmitEvent.respondWith()` helpers and focus styles
- Chrome 150+ / origin-trial docs; optional `WEBMCP_REAL_CHROME` Playwright spec
- Angular 22 native experimental API docs; peers `>=20 <23`

- Preserve replacement registrations across late failures and observe cross-realm promises
- Avoid duplicate writes by never retrying failed tool executions
- Run React agent-submit result handlers only for supported agent events
- Expand regression coverage to 186 unit tests and optional native-browser contracts

## 0.1.1

Treat Chrome 149 `navigator.modelContext` fallback as supported WebMCP in
environment diagnostics instead of reporting missing `document.modelContext`
as a hard failure.

## 0.1.0

Initial public release of Tooluminati.

- Core registry, security, browser adapter, and policy presets
- React and Angular provider families with scoped tools and security banner
- Diagnostics, forms, router, state, testing, and devtools packages
- `@tooluminati/react-troubleshooting` and `@tooluminati/angular-troubleshooting`
  bundles: timeline, workflow blockers, error collection, and dev panel
- React declarative helpers emit WebMCP spec attributes (`toolname`,
  `tooldescription`, `toolautosubmit`, `toolparamdescription`) with JSX module
  augmentation
- Angular declarative directives bind the same spec attributes
- Example apps, comparative Playwright proofs, and maintainer release workflow

## 0.0.0

Internal monorepo bootstrap (unpublished).
