# Rule: Use Available Tools — Don't Guess APIs

## Context7 CLI (ctx7)

**BEFORE writing code that uses any external library API, you MUST check the documentation.**

```bash
# Step 1: Find the library ID
npx ctx7 library "<library-name>" "<topic>"

# Step 2: Get the docs
npx ctx7 docs "<library-id>" "<specific question>"
```

### When to use ctx7

- Any library with recent breaking changes: Next.js 16, Prisma 7, Tailwind v4, Resend v6, Convex
- Any API you're not 100% certain about
- When implementing a feature you haven't seen in this codebase before
- When the user says "cherche la doc" or asks about a library API

### When NOT to use ctx7

- Simple operations you've already verified in this conversation
- Standard JavaScript/TypeScript APIs
- Libraries already used extensively in the current codebase (follow existing patterns)

## Context7 MCP Plugin

Also available as MCP tools:
- `mcp__context7__resolve-library-id` — resolve library name to ID
- `mcp__context7__get-library-docs` — fetch documentation (5000-10000 tokens)

Use these when ctx7 CLI is slow or unavailable.

## WebSearch + WebFetch

Use `WebSearch` for:
- Migration guides and breaking changes
- Error messages you can't resolve from docs alone
- Community solutions to specific problems

Use `WebFetch` to read official documentation pages directly.

## GitHub CLI (gh)

Use `gh` for ALL GitHub operations:
- `gh pr view/create/review` — not the GitHub API
- `gh issue create/view/list` — not manual HTTP calls
- `gh api` — for anything not covered by built-in commands

## Other CLIs

- `pnpm` — NEVER npm. Always pnpm for package management.
- `npx convex` — Convex CLI for backend operations
- `vercel` — Vercel CLI for deployments (if installed)
- `npx prisma` — Prisma CLI for migrations and generation
