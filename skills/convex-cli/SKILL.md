---
name: convex-cli
description: Initialize and manage Convex projects non-interactively. Use when setting up Convex in a new project, deploying, or running convex dev. Handles the non-interactive terminal limitation.
user_invocable: true
---

# Convex CLI — Non-Interactive Setup & Management

Use this skill when working with the Convex CLI in Claude Code or any non-interactive terminal.

## Problem

Convex CLI (`npx convex dev`) prompts for interactive input by default, which fails in non-interactive terminals with:
```
✖ Cannot prompt for input in non-interactive terminals.
```

## Non-Interactive Commands

### Initialize a NEW project (first time setup)

```bash
npx convex dev --configure new --project <project-name> --once
```

This will:
1. Create the project on Convex cloud
2. Provision a dev deployment
3. Save `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`
4. Generate `convex/_generated/` types
5. Push schema and functions
6. Stop (because of `--once`)

### Push code changes (after initial setup)

```bash
npx convex dev --once
```

The `--once` flag runs steps 1-3 (configure, codegen, push) then stops. No watching.

### Deploy to production

```bash
npx convex deploy --cmd 'pnpm build'
```

For CI/CD, set `CONVEX_DEPLOY_KEY` environment variable.

### Generate types only (no push)

```bash
npx convex dev --once --typecheck disable
```

### Run with a seed script

```bash
npx convex dev --once --run api.seed.default
```

### Watch mode (development)

If already configured (`.env.local` has `CONVEX_DEPLOYMENT`):

```bash
npx convex dev
```

This works non-interactively because the project is already configured.

## Key Flags

| Flag | Effect |
|------|--------|
| `--once` | Run once, don't watch for changes |
| `--configure new` | Force new project creation |
| `--configure existing` | Force linking to existing project |
| `--project <slug>` | Set project name (avoids prompt) |
| `--team <slug>` | Set team (avoids prompt) |
| `--prod` | Target production deployment |
| `--env-file <path>` | Custom env file path |
| `--codegen enable/disable` | Control type generation |
| `--typecheck enable/try/disable` | Control TypeScript checking |
| `--run <fn>` | Run a function after push |

## Prerequisites

- Must be logged in: `npx convex login` (interactive, do once manually)
- Or set `CONVEX_DEPLOY_KEY` env var for fully non-interactive operation

## Common Patterns

### After schema changes
```bash
npx convex dev --once
```

### Fresh clone setup (project already exists on Convex)
```bash
npx convex dev --configure existing --project <name> --team <team> --once
```

### CI/CD pipeline
```bash
CONVEX_DEPLOY_KEY=<key> npx convex deploy --cmd 'pnpm build'
```
