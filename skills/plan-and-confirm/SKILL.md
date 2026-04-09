---
name: plan-and-confirm
description: >
  Explore the codebase, challenge the idea with a context-adaptive critic, present a clear implementation plan,
  and wait for explicit user approval before writing any code. Use for any non-trivial change
  (new feature, bug fix, refactor). Launches critic + research agents in parallel.
  Rule #1 — never code without OKAY.
argument-hint: "[description of the change] [--quick] [--no-issue] [--no-worktree]"
---

# Plan & Confirm — Full Pipeline

## Options

Parse `$ARGUMENTS` for flags. **Default mode is FULL** (deep research + issue + worktree).

| Flag | Short | Effect |
|------|-------|--------|
| `--quick` | `-q` | Skip deep research, skip critic debate, 1 local explore only |
| `--no-issue` | `-ni` | Skip GitHub issue creation after OKAY |
| `--no-worktree` | `-nw` | Skip worktree creation after issue |

If no flag is present → **FULL mode** (critic + parallel research + issue + worktree).

Extract the task description by removing any flags from `$ARGUMENTS`.

---

## Phase 0+1 — Critic + Research (ALL IN PARALLEL)

**In FULL mode, launch ALL 4 agents simultaneously in a single message:**

**Agent 1 — Critic** (`subagent_type: "general-purpose"`):

Use the critic agent definition from `~/.claude/agents/critic.md`. The critic auto-detects the right lenses (CTO/UX/Security/Performance/Cost) based on the proposal.

Prompt:
```
You are a senior technical reviewer. Read ~/.claude/agents/critic.md for your full role definition.

THE PROPOSAL: {{task description}}
THE CODEBASE: {{Run quick Grep/Glob to understand project structure, stack, existing patterns}}

Follow the critic.md instructions exactly. Auto-detect which lenses apply.
Output your verdict in the specified format.
```

**Agent 2 — Codebase Explorer** (`subagent_type: "explore-codebase"`):
```
Explore the codebase to understand how to implement: {{task description}}.
Find: relevant files, existing patterns, imports/exports that will be affected,
similar implementations to follow. Report with file:line references.
```

**Agent 3 — Documentation Research** (`subagent_type: "explore-docs"`):
```
Research documentation for the libraries/frameworks needed to implement: {{task description}}.

MANDATORY: Use ctx7 CLI to look up current API signatures:
1. Run: npx ctx7 library "<library>" "<topic>" to find the library ID
2. Run: npx ctx7 docs "<libraryId>" "<specific question>" to get docs

Also try Context7 MCP tools if available:
- mcp__context7__resolve-library-id
- mcp__context7__get-library-docs (5000-10000 tokens)

Focus on what's actually needed, not general overviews.
Report actual API signatures, code examples, and breaking changes.
```

**Agent 4 — Web Search** (`subagent_type: "websearch"`):
```
Search for best practices, common pitfalls, and proven patterns for: {{task description}}.
Focus on production-grade solutions, not tutorials.
Search for breaking changes if using: Next.js 16, Prisma 7, Tailwind v4, Convex, Resend v6.
Return concise findings with sources.
```

Wait for all 4 to complete, then synthesize their findings.

### If QUICK mode (`--quick`): Local explore only

1. Read all files directly related to the task
2. Grep for usages of affected symbols
3. Understand patterns and conventions
4. Identify side effects

**Rule: zero file modifications in this phase.**

---

## Phase 2 — Present the plan

Structure your response exactly as follows:

### Critic's verdict
- Present the critic's feedback verbatim — do not filter or soften it
- Note which lenses were activated (CTO, UX, Security, etc.)
- If verdict is REJECT → explain why and suggest alternative. Ask user to choose.
- If verdict is RETHINK → present alternative approach. Ask user to choose.
- If verdict is PROCEED WITH CHANGES → note changes, incorporate in plan.

### What I understood
- Describe the request with precise file:line references
- Flag any ambiguous or non-obvious points

### What I will do
- List every file to modify or create, with the reasoning for each change
- State explicitly what will NOT be changed and why

### Research findings
- Key patterns found in codebase (from Agent 2)
- Relevant documentation/API notes (from Agent 3)
- Best practices and pitfalls to avoid (from Agent 4)

### Agent routing recommendation

| Task type | Recommended approach |
|-----------|---------------------|
| Bug fix (1-2 files) | Direct fix, no agent needed |
| Bug fix (complex) | `gsd-debugger` agent pattern |
| Feature (new page/component) | Direct implementation |
| Refactor (multi-file) | Agent with `isolation: "worktree"` |
| Multi-file independent changes | Parallel agents (one per file group) |

### Risks & attention points
- Any code that could break elsewhere
- Any assumption made (and why) — cross-reference with critic's findings
- Any breaking API change, DB migration, or env variable addition

---

## Phase 3 — Wait for approval

**STOP. Do not touch any file.**

Send a Telegram notification:

```bash
curl -s -X POST "http://127.0.0.1:18789/hooks/agent" \
  -H "x-openclaw-token: 342f171b9e6b74f2eb63c8a1b41d9fdd381df7ff020d3ae8" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Plan pret — en attente de ton OKAY\", \"deliver\": true, \"channel\": \"last\"}" \
  > /dev/null 2>&1
```

Then output literally:

> Please confirm with **OKAY** if the understanding and plan are correct.
> Otherwise, tell me what is wrong and I will adjust before coding.

**Absolute rule:** If the user does not say OKAY (or equivalent: "yes", "go", "ok", "c'est bon", "lance"), stay in Phase 3. Do not proceed.

**The user can debate the critic.** If they disagree, re-run the critic with counter-arguments. Max 2 rounds — then user's decision is final.

---

## Phase 4 — Create issue & worktree (FULL mode, skip if `--no-issue`)

Once OKAY is received:

### 4a. Create GitHub issue

```bash
gh issue create \
  --title "<type>(<scope>): <description>" \
  --body "## Description
<summary from the approved plan>

## Implementation plan
<file list from Phase 2>

## Acceptance criteria
- [ ] <criterion 1>
- [ ] <criterion 2>

## Context
- Critic verdict: <verdict>
- Lenses: <CTO, UX, Security, ...>
- Mode: <FULL/QUICK>
" \
  --label "<appropriate label>"
```

### 4b. Create worktree (skip if `--no-worktree`)

```bash
TYPE="feat"  # or fix, refactor, perf, chore
ISSUE_NUM=<from 4a>
SLUG=<short-kebab-case-description>

git checkout develop 2>/dev/null || git checkout master
git pull
git checkout -b ${TYPE}/${ISSUE_NUM}-${SLUG}
```

---

## Phase 5 — Implement (only after OKAY)

1. Implement exactly as described in the approved plan — no additions beyond scope
2. Follow the agent routing recommendation from Phase 2
3. If something discovered during implementation changes the plan → **stop and re-present**
4. Run project-specific verification (pnpm tsc --noEmit, pnpm lint, etc.)
5. Summarize changes with file:line references

**Never commit** unless the user explicitly asks. When asked, use `/commit`.

---

## Phase 6 — Post-implementation (FULL mode)

1. If UI impact → suggest: "Use `/visual-check <route>` to verify."
2. Suggest: "Ready to commit. Use `/commit`."
3. After commit → suggest: "Use `/create-pr` with `Closes #<issue>`."

---

## Rules

- **Never code without OKAY** — rule #1, non-negotiable
- **The critic runs in parallel with research** — saves time, small token waste if critic rejects
- **The critic is honest** — never soften, filter, or apologize for its feedback
- **The user can override the critic** — after debate, user's decision is final
- Base all analysis on files actually read — no guessing
- A "trivial change" (typo, single string edit) → suggest `--quick` or skip entirely
- **Default is FULL** — user must explicitly opt out with flags
- **Use ctx7 CLI and WebSearch** to verify APIs before coding — training data is stale

$ARGUMENTS
