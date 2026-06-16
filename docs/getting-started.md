# Getting Started

Install the packages you need:

```bash
pnpm add @tooluminati/core \
  @tooluminati/react \
  @tooluminati/diagnostics
```

Wrap your app with explicit enablement:

```tsx
<WebMcpProvider enabled={import.meta.env.DEV}>
  <App />
</WebMcpProvider>
```

Register diagnostics through package factories:

```tsx
useWebMcpTools([
  createAppInfoTool(() => ({
    name: 'Customer Portal',
    version: '1.0.0',
    environment: import.meta.env.MODE,
  })),
  createActionAvailabilityTool(actionAvailabilityProvider),
]);
```

Production enablement should be deliberate and reviewed. Use policy presets to
make that decision explicit.
