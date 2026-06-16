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

`why_is_action_unavailable` is the preferred way to explain disabled buttons,
blocked workflows, permission failures, validation blockers, and domain-state
constraints.
