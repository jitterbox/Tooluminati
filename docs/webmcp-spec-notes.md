# WebMCP Spec Notes

Tooluminati tracks the 2 September 2026 WebMCP Community Group draft.

Current core assumptions:

- `document.modelContext` is canonical.
- `navigator.modelContext` is legacy fallback only (Chrome 146–149).
- `registerTool()` is the core portable API and returns a Promise.
- `getTools()` and `executeTool()` are part of the CG draft, not
  Chrome-only testing helpers.
- `executeTool(tool, inputObject)` takes a JSON-serializable object.
  JSON string input is deprecated as of Chrome 155.
- AbortSignal unregisters a tool. Chrome 153+ does **not** cancel
  in-flight `execute` when the registration signal aborts.
- Tool visibility is same-origin by default.
- `exposedTo` is explicit cross-origin allowlisting.
- The `tools` Permissions Policy gates access.
- Annotations: `readOnlyHint`, `untrustedContentHint`,
  `consequentialHint`, and `debugging`.
- Declarative forms use spec attributes: `toolname`, `tooldescription`,
  `toolautosubmit`, and `toolparamdescription` on form controls.

The project isolates all browser access in
`packages/core/src/model-context.ts` so spec changes can be handled in
one place.

WebMCP is a W3C Web Machine Learning CG draft, not a W3C Recommendation
and not Baseline. Chrome/Edge origin trial is 149–156. Do not treat
Chrome 157 as shipped.
