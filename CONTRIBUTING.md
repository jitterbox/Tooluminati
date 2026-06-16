# Contributing

Thanks for helping improve Tooluminati.

## Development setup

Requirements: Node.js 18+, pnpm 10+.

```bash
git clone https://github.com/jitterbox/Tooluminati.git
cd Tooluminati
pnpm install
pnpm check      # typecheck, lint, unit tests
pnpm build      # build publishable packages
pnpm test:browser
```

## Project layout

- `packages/*` — publishable npm packages (`@tooluminati/*`)
- `examples/*` — runnable Vite demos (not published)
- `docs/*` — guides and adapter documentation
- `tests/browser/*` — Playwright integration tests

## Making changes

1. Create a branch from `main`.
2. Keep changes focused and match existing code style.
3. Add tests for behavior changes.
4. Update docs or examples when usage changes.
5. Run `pnpm check` before opening a PR.

## Changesets (required for package API changes)

User-facing package changes need a changeset:

```bash
pnpm changeset
```

Choose semver bump and write a short summary. The Release workflow uses
changesets to version and publish.

See [docs/releasing.md](docs/releasing.md).

## Pull requests

- Fill out the PR template checklist.
- Link related issues when applicable.
- Prefer small, reviewable PRs.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
