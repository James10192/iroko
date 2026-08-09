# Contributing to iroko

Thanks for taking the time. iroko is small on purpose — a guardrail environment,
not a component dump — so contributions are judged first on fit with the thesis:
**frame it, save tokens, verify it**.

## Proposing a component (rule, skill, agent, hook)

1. Open an issue with the `component` template (`.github/ISSUE_TEMPLATE/component.md`).
2. Explain which step of the builder cycle it serves (cadrer / illustrer /
   documenter / construire / vérifier / ambient) and which pack it belongs to
   (guide / default / full). The guide pack must stay self-contained: a guide
   component may only hard-reference other guide components.
3. If accepted, submit a PR that adds the component files AND its entry in
   `src/lib/manifest.ts` (name, bilingual description, type, path, step, pack).
4. Every component ships in the npm tarball — CI verifies all manifest paths
   are present in `npm pack`.

## Reporting a bug

Use the `bug` template (`.github/ISSUE_TEMPLATE/bug.md`). Include the command,
the full output, your OS, and `node --version`.

## Versioning — CHANGELOG first

`CHANGELOG.md` (Keep a Changelog format) is the **single source of truth** for
the version:

- Write the entry under `## [X.Y.Z] — date` first.
- Run `node scripts/sync-version-from-changelog.mjs` to propagate the version
  to `package.json`, `src/lib/banner.ts` and `.claude-plugin/marketplace.json`.
- Semver: content fixes are PATCH, new components or CLI commands/flags are
  MINOR, removals/renames and CLI interface changes are MAJOR.

## CI (release-guard)

Every push/PR to `master` runs:

- version sources match `CHANGELOG.md` (`--check` mode of the sync script);
- PRs touching code must also touch `CHANGELOG.md`;
- `tsc --noEmit` + tsup build;
- CLI smoke in a clean `$HOME`: `--version`, `doctor`, `update` without an
  install (must exit 0 with a clean message), `init --guide --yes`, `doctor`,
  `uninstall --yes`;
- secret/path leak scan on shipped files;
- `npm pack` smoke: the tarball contains `dist/` + all 24 manifest paths.

## Conventions

- pnpm only. Conventional commits in imperative English. No Co-Authored-By.
- One file = one responsibility; keep files small.
- CLI copy: English by default, French under `--guide`.
