# Production Hardening

Production WebMCP diagnostics should be opt-in and reviewed.

Recommended policy:

```ts
<WebMcpProvider
  enabled={featureFlags.webMcpDiagnostics}
  policies={productionSafePolicySet}
>
  <App />
</WebMcpProvider>
```

Checklist:

- Review every registered tool.
- Require redaction for user, auth, and profile data.
- Require confirmation for writes.
- Disable cross-origin exposure unless approved.
- Add visible user/admin indication for debug sessions.
- Set an expiry for temporary diagnostics.
- Avoid sending tool args/results to analytics.
- Keep outputs under the configured budget.
