# Changesets

We use [Changesets](https://github.com/changesets/changesets) to version and
publish packages to npm.

## Adding a changeset

After making a user-facing change:

```bash
pnpm changeset
```

Choose affected packages, semver bump (`patch`, `minor`, `major`), and write a
short summary.

## Release flow

1. Merge PRs with changesets to `main`.
2. The Release workflow opens or updates a "Version Packages" PR.
3. Merge that PR to bump versions and update changelogs.
4. The workflow publishes to npm when versions change.

See [docs/releasing.md](../docs/releasing.md) for maintainer setup.
