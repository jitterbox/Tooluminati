# Releasing Tooluminati to npm

Tooluminati packages publish under the `@tooluminati` scope on npm. All nine
packages version together via Changesets.

## Published packages

| npm package | Purpose |
|-------------|---------|
| `@tooluminati/core` | Registry, model context, security |
| `@tooluminati/policies` | Policy presets |
| `@tooluminati/react` | Provider, hooks, scopes |
| `@tooluminati/diagnostics` | App/route/error diagnostics tools |
| `@tooluminati/forms` | Form adapters |
| `@tooluminati/router` | Router adapters |
| `@tooluminati/state` | Redux / TanStack Query adapters |
| `@tooluminati/testing` | Mocks, Playwright helpers |
| `@tooluminati/devtools` | Debug panel components |

Examples in `examples/` are **not** published.

## One-time maintainer setup

### 1. Create npm org / scope access

Create an npm account and ensure the `@tooluminati` scope is
available. Scoped packages publish as public via `publishConfig.access: "public"`.

### 2. Add GitHub secrets

In the repository settings, add:

| Secret | Purpose |
|--------|---------|
| `NPM_TOKEN` | npm automation token with publish access to the scope |

`GITHUB_TOKEN` is provided automatically to the Release workflow.

### 3. Enable GitHub Actions permissions

The Release workflow needs permission to create PRs and push version commits.
Default `GITHUB_TOKEN` permissions are sufficient when `contents: write` and
`pull-requests: write` are set in the workflow (already configured).

## Day-to-day release flow

1. Contributors add changesets in PRs (`pnpm changeset`).
2. Merge to `main`.
3. The [Release workflow](../.github/workflows/release.yml) runs:
   - If there are pending changesets, it opens/updates a **Version Packages** PR.
   - When that PR merges, it runs `pnpm build` and `pnpm release` to publish.

Root scripts:

```bash
pnpm changeset          # create a changeset
pnpm version-packages   # bump versions locally (CI does this)
pnpm release            # build + publish to npm (CI does this)
```

## Manual publish (emergency only)

```bash
pnpm install
pnpm build
npm whoami   # verify login
pnpm release
```

Prefer the automated workflow so changelogs and git tags stay consistent.

## Pre-1.0 policy

All public APIs are marked `@experimental` in source. Breaking changes may ship
in minor releases until 1.0. Document behavior changes in changesets clearly.

## Verify a release

After publish:

```bash
npm view @tooluminati/core version
npm install @tooluminati/core@latest
```

Check package pages on npm and the GitHub Release notes created by Changesets.
