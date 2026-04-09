---
name: npm-publish
description: Bump version, build, publish to npm, git tag, and push. Use when releasing a new version of any npm package.
allowed-tools: Bash(npm :*), Bash(pnpm :*), Bash(git :*), Read
---

# npm-publish

Bump, build, publish, tag, push. One command.

## Context

- Package info: !`node -e "const p=require('./package.json');console.log(p.name+'@'+p.version)"`
- Git state: !`git status --short`
- npm logged in as: !`npm whoami 2>&1`

## Workflow

1. Verify package.json exists, npm whoami works, git is clean
2. Ask bump type (patch/minor/major) or use argument
3. `npm version <type> --no-git-tag-version`
4. `pnpm build`
5. `npm publish --access public`
6. If publish fails, revert: `git checkout package.json`
7. `git add package.json && git commit -m "release: vX.Y.Z"`
8. `git tag vX.Y.Z && git push && git push --tags`

## Arguments

- `/npm-publish` — interactive
- `/npm-publish patch` — bump patch
- `/npm-publish minor` — bump minor
- `/npm-publish major` — bump major

## Rules

- NEVER publish with dirty git
- NEVER publish without building
- REVERT on failure
- Always --access public for scoped packages
- NO Co-Authored-By in release commits
- Tag format: vX.Y.Z
