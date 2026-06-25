# Diagnostics

Diagnostics tools explain runtime facts agents cannot reliably infer from DOM
snapshots.

Core diagnostics:

- `get_app_info`
- `get_visible_agent_tools`
- `why_is_action_unavailable`
- `list_available_actions`
- `get_recent_client_errors`
- `get_hydration_health`
- `get_feature_flags_summary`
- `get_troubleshooting_timeline`
- `get_webmcp_environment`
- `get_workflow_blockers`
- `get_mounted_forms_summary`
- `get_query_cache_summary` (via `@tooluminati/state` / troubleshooting bundles)

`get_workflow_blockers` merges action availability, mounted form summaries,
declarative forms discovered via `form[toolname]`, and optional query summaries.

Timeline event categories: `client_error`, `fetch_failure`, `route_change`,
`action_blocked`, `tool_activated`, `tool_cancelled`, `agent_form_submit`,
`toolchange`, `custom`.

Dev UI: see [troubleshooting-panel.md](troubleshooting-panel.md).

`why_is_action_unavailable` is the preferred way to explain disabled buttons,
blocked workflows, permission failures, validation blockers, and domain-state
constraints.
