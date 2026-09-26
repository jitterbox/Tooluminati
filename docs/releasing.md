# Releasing Tooluminati to npm

Tooluminati packages publish under the `@tooluminati` scope on npm. All sixteen
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
| `@tooluminati/angular` | Angular provider, scopes, banner |
| `@tooluminati/angular-forms` | Angular form adapters |
| `@tooluminati/angular-router` | Angular Router adapters |
| `@tooluminati/angular-state` | NgRx / signal state adapters |
| `@tooluminati/angular-devtools` | Angular debug panel |
| `@tooluminati/react-troubleshooting` | React timeline, blockers, dev panel |
| `@tooluminati/angular-troubleshooting` | Angular timeline, blockers, dev panel |

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
`setup-node` configures registry authentication through `NODE_AUTH_TOKEN`;
the publish step maps the `NPM_TOKEN` secret to both environment names.
The workflow verifies authentication with `npm whoami` before publication.
If that check fails, refresh the repository's npm token with scope write access.

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
pnpm sync-package-metadata  # refresh publish metadata on all packages
```

Before the first publish (or after adding packages), run:

```bash
pnpm sync-package-metadata
pnpm check
pnpm build
```

## Prepared version releases

When package versions and changelogs have already been updated locally, do not
run `version-packages` a second time. Confirm all sixteen public package
versions agree, refresh the lockfile, and validate before merging:

```bash
pnpm install --lockfile-only
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

Merge the versioned release PR to `main`. With no pending changesets, the
Release workflow publishes versions missing from npm. Wait for it to finish,
then verify every package version and its `latest` tag in the registry.
A merge or a successful build alone does not confirm publication.

## Manual publish (emergency only)

```bash
pnpm install
pnpm sync-package-metadata
pnpm build
npm whoami   # verify login
pnpm release
```

Prefer the automated workflow so changelogs and git tags stay consistent.

## Pre-1.0 policy

All public APIs are marked `@experimental` in source. The first npm release is
**0.1.0**. Breaking changes may ship in minor releases until 1.0. Document
behavior changes in changesets clearly.

## Verify a release

After publish:

```bash
npm view @tooluminati/core version
npm install @tooluminati/core@latest
npm install @tooluminati/react-troubleshooting@latest
```

Check package pages on npm and the GitHub Release notes created by Changesets.
