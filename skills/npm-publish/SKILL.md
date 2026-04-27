---
name: npm-publish
description: Bump version, build, publish to npm, git tag, and push. Use when releasing a new version of any npm package.
allowed-tools: Bash(npm :*), Bash(pnpm :*), Bash(git :*), Read
---

# npm-publish

Bump, build, publish, tag, push. One command.

## Context

- Package info: !`cat package.json | node -e "const p=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(p);console.log(j.name+'@'+j.version)"`
- Git state: !`git status --short`
- npm logged in as: !`npm whoami 2>&1`

## Workflow

### 1. Pre-flight checks

- Verify `package.json` exists in current directory
- Verify `npm whoami` returns a username (not an error)
- Verify git working directory is clean (no uncommitted changes). If dirty, stop and ask user to commit first.
- **If repo has `CHANGELOG.md` at root**: verify the next-version entry exists (an `## [Unreleased]` section with content, OR an `## [X.Y.Z]` heading matching the bump target). Stop if missing — ask the user to update CHANGELOG.md first. The CHANGELOG is the source of truth for what is shipped.
- **If repo has `scripts/sync-version-from-changelog.mjs`** (iroko-style): run `node scripts/sync-version-from-changelog.mjs --check` before bumping. Stop on drift.

### 2. Determine version bump

Read current version from `package.json`.

Ask the user which bump type (if not provided as argument):

```
Current version: X.Y.Z

  patch  → X.Y.(Z+1)    Bug fixes, small changes
  minor  → X.(Y+1).0    New features, backward compatible
  major  → (X+1).0.0    Breaking changes
```

If user passed an argument (e.g. `/npm-publish patch`), use it directly without asking.

### 3. Bump version

```bash
npm version <patch|minor|major> --no-git-tag-version
```

`--no-git-tag-version` because we handle git ourselves after publish succeeds.

### 4. Build

```bash
pnpm build
```

If build fails, revert the version bump:
```bash
git checkout package.json
```

### 5. Publish

```bash
npm publish --access public
```

If publish fails, revert:
```bash
git checkout package.json
```

### 6. Git commit + tag + push

After successful publish:

```bash
git add package.json
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push
git push --tags
```

### 7. Summary

Display:
```
Published <package-name>@X.Y.Z

  npm: https://www.npmjs.com/package/<package-name>
  tag: vX.Y.Z
```

## Arguments

- `/npm-publish` — interactive, asks for bump type
- `/npm-publish patch` — bump patch, no prompt
- `/npm-publish minor` — bump minor
- `/npm-publish major` — bump major
- `/npm-publish 2.1.0` — set exact version

## Rules

- **NEVER publish with dirty git** — commit first
- **NEVER publish without building** — always `pnpm build` before publish
- **REVERT on failure** — if build or publish fails, restore package.json
- **NO --force** — never force publish
- **PUBLIC access** — always `--access public` for scoped packages
- **NO Co-Authored-By** in the release commit
- **Tag format** — always `vX.Y.Z` (with v prefix)
