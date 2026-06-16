<p align="center">
  <img src="assets/tooluminati-logo.png" alt="Tooluminati" width="420" />
</p>

# Tooluminati

[![CI](https://github.com/jitterbox/Tooluminati/actions/workflows/ci.yml/badge.svg)](https://github.com/jitterbox/Tooluminati/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Expose tools. Share context. Empower agents.**

Opinionated React diagnostics and agent observability for the emerging WebMCP
browser API.

This project is intentionally not just another `useWebMcpTool` hook. Generic
hook packages solve registration plumbing. Tooluminati focuses on safe,
consistent interpretation of React runtime surfaces: forms, routers, data
caches, action availability, errors, hydration, and production security policy.

WebMCP is experimental and currently requires browser flags or origin-trial
support. All APIs in this repository should be treated as pre-1.0 and subject
to change as the draft evolves.

## Install

Primary packages:

```bash
pnpm add @tooluminati/core @tooluminati/react
```

Recommended diagnostics bundle:

```bash
pnpm add @tooluminati/core \
  @tooluminati/react \
  @tooluminati/diagnostics
```

Optional adapters:

```bash
pnpm add @tooluminati/policies \
  @tooluminati/forms \
  @tooluminati/router \
  @tooluminati/state \
  @tooluminati/testing \
  @tooluminati/devtools
```

Packages publish to npm under `@tooluminati/*`. See
[docs/releasing.md](docs/releasing.md) for maintainer publishing setup.

## Quick start

```tsx
import {
  WebMcpProvider,
  useWebMcpTools,
} from '@tooluminati/react';
import {
  createAppInfoTool,
  createActionAvailabilityTool,
} from '@tooluminati/diagnostics';

<WebMcpProvider enabled={import.meta.env.DEV}>
  <App />
</WebMcpProvider>;
```

Full guide: [docs/getting-started.md](docs/getting-started.md)

## Examples and comparative proof

Start with [examples/agent-troubleshooting-demo](examples/agent-troubleshooting-demo/README.md)
for a side-by-side DOM vs WebMCP demo with sample agent prompts and automated
proof tests. See [examples/README.md](examples/README.md) for the full matrix.

```bash
pnpm --filter agent-troubleshooting-demo dev
pnpm test:browser
```

## Packages

| Package | Description |
|---------|-------------|
| `@tooluminati/core` | Registry, browser adapter, security |
| `@tooluminati/react` | Provider, hooks, scopes, banner |
| `@tooluminati/policies` | Policy presets |
| `@tooluminati/diagnostics` | Diagnostic tool factories |
| `@tooluminati/forms` | React Hook Form adapters |
| `@tooluminati/router` | Router diagnostics |
| `@tooluminati/state` | Redux / TanStack Query adapters |
| `@tooluminati/testing` | Test and Playwright helpers |
| `@tooluminati/devtools` | Debug panel UI |

## Documentation

- [Getting started](docs/getting-started.md)
- [Security](docs/security.md)
- [Diagnostics tools](docs/diagnostics.md)
- [Chrome setup](docs/chrome-setup.md)
- [Releasing to npm](docs/releasing.md)

## Development

```bash
pnpm install
pnpm check
pnpm build
pnpm test:browser
```

Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[MIT](LICENSE)
