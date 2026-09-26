# Vite Basic

Minimal WebMCP wiring: app info, visible tools, action availability, and page
state.

## Run

```bash
pnpm --filter vite-basic dev
```

## Agent prompt

```text
Summarize this app using WebMCP. What tools are registered, is the profile
dirty, and is Save profile available?
```

## Expected tool calls

1. `get_app_info` → app name, environment, WebMCP status
2. `get_visible_agent_tools` → registered tool metadata
3. `get_page_state` → `{ title, dirty }`
4. `list_available_actions` or `why_is_action_unavailable` for `save-profile`

## DOM-only vs WebMCP

| Fact | DOM-only | WebMCP |
|------|----------|--------|
| Button disabled | yes (visible) | yes |
| Why Save is disabled | vague / missing | `"No profile changes have been made."` |
| Page dirty flag | not exposed | `get_page_state.dirty` |

Click **Make profile dirty** and re-run tools to verify live updates.

## Automated test

`tests/browser/vite-basic.spec.ts` verifies `get_page_state` registration and
execution.

Manual Chrome 155+ check from DevTools:

```js
const tools = await document.modelContext.getTools();
const pageState = tools.find((tool) => tool.name === 'get_page_state');
await document.modelContext.executeTool(pageState, {});
```

## Chrome setup

[docs/chrome-setup.md](../../docs/chrome-setup.md)
