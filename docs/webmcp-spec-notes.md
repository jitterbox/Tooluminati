# WebMCP Spec Notes

This project tracks the 15 June 2026 WebMCP draft.

Current core assumptions:

- `document.modelContext` is canonical.
- `navigator.modelContext` is legacy fallback only.
- `registerTool()` is the core portable API.
- `getTools()` and `executeTool()` are useful Chrome/testing helpers.
- AbortSignal drives unregistration.
- Tool visibility is same-origin by default.
- `exposedTo` is explicit cross-origin allowlisting.
- The `tools` Permissions Policy gates access.

The project isolates all browser access in `packages/core/src/model-context.ts`
so spec changes can be handled in one place.
