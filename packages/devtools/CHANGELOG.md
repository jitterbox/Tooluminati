# @tooluminati/devtools

## 0.2.0

### Minor Changes

- Align Tooluminati with the 2 September 2026 WebMCP CG draft: document.modelContext feature detection, registerTool ready promises, Chrome 153 execute-signal semantics, object executeTool input, debugging/consequentialHint annotations, and Chrome 150+/OT docs.

### Patch Changes

- Updated dependencies
  - @tooluminati/core@0.2.0
  - @tooluminati/react@0.2.0

## 0.1.1

### Patch Changes

- Treat Chrome 149 `navigator.modelContext` fallback as supported WebMCP in environment diagnostics instead of reporting missing `document.modelContext` as a hard failure.
- Updated dependencies
  - @tooluminati/core@0.1.1
  - @tooluminati/react@0.1.1

## 0.1.0

### Minor Changes

- Initial public release of Tooluminati.

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

### Patch Changes

- Updated dependencies
  - @tooluminati/core@0.1.0
  - @tooluminati/react@0.1.0
