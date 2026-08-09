---
name: read-docs
description: >
  Fetch current library documentation BEFORE writing any code (Context7 CLI, MCP, web search) and
  apply a reading method — API signatures, breaking changes, gotchas — instead of guessing.
  Récupère la documentation à jour d'une librairie AVANT d'écrire du code (Context7 CLI, MCP,
  recherche web) et applique une méthode de lecture au lieu de deviner les API.
argument-hint: "<library-name> <topic or question>"
---

# Read Docs — current documentation, and how to read it

Never guess an API. Fetch the current documentation first, then read it with a method. Training data is stale; the docs are not.

## Tooling check (before first use)

1. **Verify first**: `npx --no-install ctx7 --version` for the CLI, `claude mcp list 2>/dev/null | grep -i context7` for the MCP. Never conclude a tool is missing without checking.
2. **Install directly if missing**: ctx7 needs no permanent install, run it as `npx --yes ctx7@latest`. For the MCP, if the `claude` CLI exists, run `claude mcp add context7 -- npx -y @upstash/context7-mcp` yourself. If the `claude` CLI does not exist (other agent or environment), fall back to the ctx7 CLI, then WebSearch.
3. **Fallback**: if everything fails, WebSearch the official documentation and read the most relevant page with WebFetch.

FR : vérifier les outils avant de conclure qu'ils manquent, les installer soi-même si besoin, sinon se rabattre sur la recherche web de la doc officielle.

## When to use

- **BEFORE writing any code** that uses an external library API
- After `/pick-stack` chose a stack, before `/plan-and-confirm`
- When a library has had recent breaking changes
- When you're not 100% sure of the current API signature
- When the user asks how to use X or asks for the docs of X

## Step 1 — Parse arguments

Extract from `$ARGUMENTS`:
- `<library>` — the library name (e.g., "next.js", "convex", "shadcn/ui")
- `<topic>` — what specifically to look up (e.g., "app router caching", "useQuery hooks")

If no topic is provided, infer it from the current task context. **Be specific**: "next.js server actions", not "next.js documentation".

## Step 2 — Fetch, per the docs-first rule

Follow the source pipeline **defined in the docs-first rule** (ctx7 CLI → Context7 MCP → WebSearch, with graceful degradation — the pipeline, fallback order, and commands live in that rule, do not restate them here).

Practical notes when using Context7 (CLI or MCP):
- Pass the user's **full question** as the query, not a single keyword — it improves relevance ranking.
- Pick the best library match: exact name match, official/primary package over community forks, higher benchmark score.
- If the user mentioned a version ("React 19", "Tailwind v4"), prefer the version-specific library ID.
- Complement with web search for migration guides, breaking changes, and community pitfalls not in official docs.

## Step 3 — How to read a doc

Fetching is half the work. Read with this method:

1. **Version first.** Confirm which version the doc describes and which version the project uses (`package.json`). A perfect answer for the wrong version is a wrong answer.
2. **Signature over prose.** Find the actual function/component signature, its parameters and return type. The prose around it can be outdated; the signature is the contract.
3. **Copy the canonical example, then adapt.** Start from the doc's own working example rather than composing from memory. Adapt names and types to the project.
4. **Hunt the migration notes.** If the library had a major release, read the "breaking changes" / "migration" section even if you think you're not affected — that's where silent behavior changes hide.
5. **Note the gotchas.** Defaults that changed, options that look optional but aren't, SSR/client-only constraints. Write them down in your answer, not just in your head.
6. **Distrust blog posts older than the current major.** When a doc and a tutorial disagree, the doc wins.

## Step 4 — Output

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

- **Never guess an API** — if all sources fail, say so explicitly instead of improvising.
- The pipeline and fallbacks come from the docs-first rule — this skill adds the reading method and the output format.
- Output is for immediate use — code snippets over theory.

## En clair (FR)

Avant d'écrire du code qui utilise une librairie externe, ce skill va chercher la documentation à jour (les connaissances de l'IA datent de son entraînement et sont souvent périmées), puis la lit avec méthode : vérifier la version, partir des signatures et des exemples officiels, repérer les changements cassants. C'est ce qui évite les API inventées.

## Next step

Docs in hand → `/plan-and-confirm` to plan the implementation (or straight back to the task that needed the doc).

$ARGUMENTS
