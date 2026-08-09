# Rule: Docs First — never guess an API

This rule is the single source of truth for the documentation pipeline. Skills
(`/read-docs`, `/plan-and-confirm`) and the `explore-docs` agent reference it
instead of copying it.

## Tooling check (before first use)

Verify before concluding anything is missing: `npx --no-install ctx7 --version`, `claude mcp list 2>/dev/null | grep -i context7`, `gh --version`.
If missing, install it yourself: ctx7 runs on the fly via `npx --yes ctx7@latest`; the MCP via `claude mcp add context7 -- npx -y @upstash/context7-mcp` (when the `claude` CLI exists); gh via winget/brew/apt, then `gh auth status` (only `gh auth login` is the user's step).
Full protocol: tooling section of `/read-docs` (also in `/visual-check` and `/create-pr` when installed with the default/full packs); last-resort fallback is WebSearch of the official docs.

## The pipeline — mandatory order

**BEFORE writing code that uses any external library API, check the documentation.**

### Step 1: Context7 CLI (ctx7) — primary

```bash
# Find the library ID
npx ctx7 library "<library-name>" "<topic>"

# Get the docs
npx ctx7 docs "<library-id>" "<specific question>"
```

### Step 2: Context7 MCP — if the CLI output is insufficient

- `mcp__context7__resolve-library-id` — resolve library name to ID
- `mcp__context7__get-library-docs` — fetch documentation (5000-10000 tokens)

### Step 3: WebSearch / WebFetch — complement, not replacement

Use `WebSearch` for:
- Migration guides and breaking changes
- Error messages you can't resolve from docs alone
- Community solutions to specific problems

Use `WebFetch` to read the most relevant official documentation page directly.

## When to use the pipeline

- Any fast-moving library with recent breaking changes (e.g. Next.js, Prisma,
  Tailwind v4, Convex — training data goes stale in months)
- Any API you're not 100% certain about
- Implementing a feature pattern you haven't seen in this codebase before
- Whenever the user asks about a library API or says "check the docs"

## When NOT to use it

- Operations you already verified earlier in this conversation
- Standard language APIs (plain JavaScript/TypeScript, Python stdlib)
- Libraries used extensively in the current codebase — follow existing patterns first

## How to read a doc (method, not just links)

1. **Find the quickstart first.** It shows the intended happy path and the
   minimal setup. If your code diverges from the quickstart shape, know why.
2. **Check the version.** Confirm the doc version matches the version in the
   project's lockfile/`package.json`. A doc for v7 is misinformation for v6.
3. **Read the exact signature.** Parameter names, types, return values, async or
   not. Copy the signature, not your memory of it.
4. **Scan the breaking changes / migration page** whenever the major version is
   newer than your training data or the project just upgraded.
5. **Never copy an example across major versions.** An example written for
   another major version compiles sometimes and misbehaves silently often.
6. **Note the gotchas section** (or "caveats", "common pitfalls") — that is
   where the bugs you would have written are documented.

## Other CLIs

Use `gh` for ALL GitHub operations:
- `gh pr view/create/review` — not the GitHub API by hand
- `gh issue create/view/list` — not manual HTTP calls
- `gh api` — for anything not covered by built-in commands

## En clair (FR)

Une IA « connaît » les bibliothèques telles qu'elles étaient à sa date
d'entraînement. Depuis, les API ont changé. Deviner une API de mémoire produit du
code qui semble juste mais qui plante.

La règle : avant d'écrire du code qui utilise une bibliothèque externe, l'agent
consulte la documentation à jour, dans cet ordre : l'outil ctx7 en ligne de
commande, puis le plugin Context7, puis la recherche web en complément.

Et il ne se contente pas de lire : il vérifie que la version de la doc correspond
à celle du projet, copie la signature exacte des fonctions, et ne réutilise jamais
un exemple écrit pour une autre version majeure.
