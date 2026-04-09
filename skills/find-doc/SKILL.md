---
name: find-doc
description: >
  Research library documentation using Context7 CLI (ctx7) and web search before writing any code.
  Use when implementing features with external libraries, debugging API issues, or when training data
  may be stale (Next.js 16, Prisma 7, Tailwind v4, Convex, shadcn/ui, etc.).
  Trigger: before any implementation that touches external library APIs.
argument-hint: "<library-name> <topic or question>"
---

# Find Doc — Documentation Research Pipeline

## When to use

- **BEFORE writing any code** that uses an external library API
- When a library has had recent breaking changes (Next.js 16, Prisma 7, Tailwind v4, Resend v6)
- When you're not 100% sure of the current API signature
- When the user asks "comment utiliser X" or "cherche la doc de X"

## Step 1 — Parse arguments

Extract from `$ARGUMENTS`:
- `<library>` — the library name (e.g., "next.js", "convex", "shadcn/ui")
- `<topic>` — what specifically to look up (e.g., "app router caching", "useQuery hooks")

If no topic provided, use the current task context to infer what's needed.

## Step 2 — Context7 CLI (primary source)

Run these commands sequentially:

```bash
npx ctx7 library "<library>" "<topic>"
```

This returns Context7-compatible library IDs. Pick the best match (highest benchmark score, official repo).

Then fetch the actual documentation:

```bash
npx ctx7 docs "<libraryId>" "<topic>"
```

Example:
```bash
npx ctx7 library "next.js" "server actions"
# Returns: /vercel/next.js
npx ctx7 docs "/vercel/next.js" "server actions form validation"
```

## Step 3 — Context7 MCP plugin (if available)

If the CLI output is insufficient, also try the MCP tools:
- `mcp__context7__resolve-library-id` with the library name
- `mcp__context7__get-library-docs` with the resolved ID and topic (tokens: 5000-10000)

## Step 4 — Web search (complement)

Use `WebSearch` for:
- Breaking changes or migration guides
- Community patterns not in official docs
- Error messages or edge cases

Use `WebFetch` to read the most relevant result page.

## Step 5 — Output

Report findings directly (NEVER create files):

### Documentation Found
- **Library:** [name] (version [X])
- **Source:** ctx7 / MCP / web

### API Signatures
```
[Actual function signatures, props, config options]
```

### Code Examples
```
[Working code from the docs]
```

### Breaking Changes (if any)
- [What changed vs previous versions]

### Gotchas
- [Common pitfalls, known issues]

## Rules

- **ctx7 CLI is the PRIMARY tool** — always try it first
- **Never guess an API** — if ctx7 + web search both fail, say so explicitly
- **Cost awareness:** ctx7 CLI is free. MCP plugin is cheap. WebSearch is free. Use them.
- **Be specific:** "next.js server actions" not "next.js documentation"
- Output is for immediate use — code snippets > theory
