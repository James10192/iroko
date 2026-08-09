---
name: plan-and-confirm
description: >
  Depth-variable planning pipeline: research agents + critic review, plan presented with confidence
  scores, explicit OKAY required before any code change. Rule #1 — never code without OKAY.
  Pipeline de planification à profondeur variable : agents de recherche + critique, plan présenté
  avec scores de confiance, OKAY explicite obligatoire avant toute ligne de code.
argument-hint: "[description] [--depth=1..5 | --quick | --ultra] [--grill] [--alternatives=N] [--no-issue] [--no-branch]"
---

# Plan & Confirm

> "Question every assumption. Solve the real problem, not the stated one."

## Prerequisites

- ctx7 CLI (`npx ctx7 --version`) — falls back to Context7 MCP, then WebSearch.
- gh CLI for the optional issue phase.
- If a tool is missing, apply the tooling check protocol of the `docs-first` rule: verify first, install it yourself (npx on the fly, winget/brew/apt for gh); only `gh auth login` is the user's step.

## Phase 0 — Depth selection

Parse `$ARGUMENTS` for explicit flags first:

| Flag | Depth | Effect |
|------|-------|--------|
| `--depth=1` or `--quick` / `-q` | 1 | Direct read of relevant files. No agents. No critic. Plan is a 1-paragraph diff preview. |
| `--depth=2` | 2 | Local explore + critic (1 agent). Quality-gate audit. No alternatives. |
| `--depth=3` (DEFAULT auto) | 3 | Critic + 3 research agents (codebase, docs, web). Reflection pass. 1 plan + salt. |
| `--depth=4` | 4 | Depth 3 + adversarial critic pass (5th agent) + 2 alternatives (A/B). Confidence scoring per section. |
| `--depth=5` or `--ultra` | 5 | Depth 4 + premortem + simplification pass + 3 alternatives (A/B/C) + future-self review + opposite-day check. |

**Auto-detect depth** if no flag given. Score signals from the prompt:

| Signal | Score |
|--------|-------|
| "typo", "fix label", "rename file", "update string" | depth=1 |
| "fix bug", "correct behavior", "small adjustment" | depth=2 |
| "add feature", "implement X", "build Y" | depth=3 |
| "refactor", "migrate", "consolidate", "redesign" | depth=4 |
| "rearchitect", "rewrite", "overhaul", "v2", "from scratch" | depth=5 |
| Touches >5 files predicted, OR domain-critical (auth/payments/data) | floor=4 |
| Trivial repo or sandbox | ceil=3 |

If multiple signals match, take the **maximum**. Announce the chosen depth in the first reply: `Auto-depth: 3 (feature add). Override with --depth=N if needed.`

### Cost check (MANDATORY at depth >= 3)

Before launching any agent at depth 3 or higher, display the cost and WAIT for confirmation:

> **Depth N ≈ X subagents (each consumes a full context window). Confirm or use a lower depth.**
> **Profondeur N ≈ X agents, confirme ou réduis.**

| Depth | Subagents |
|-------|-----------|
| 3 | 4 |
| 4 | 5 |
| 5 | 5 (+ reflection passes, no extra agents) |

Do not launch agents until the user confirms. If the user lowers the depth, restart Phase 0 with the new depth.

Other flags:

| Flag | Effect |
|------|--------|
| `--grill` | Force the grill mode (Phase 0.5) even for clear requests |
| `--alternatives=N` | Force N alternatives (overrides depth default) |
| `--no-issue` / `-ni` | Skip GitHub issue creation after OKAY |
| `--no-branch` / `-nb` | Skip branch creation after issue |

Strip flags from the task description.

---

## Phase 0.5 — Grill mode (optional framing)

Activate when `--grill` is passed, OR when the request is ambiguous enough that a wrong assumption would waste the whole pipeline.

Interview the user about the plan until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one by one. For each question, provide your recommended answer.

Rules of the grill:
- **One question at a time.** Wait for the answer before the next question. Multiple questions at once are bewildering.
- **Facts are looked up, not asked.** If a fact can be found by exploring the codebase, look it up yourself.
- **Decisions belong to the user.** Put each decision to the user and wait for the answer.
- Stop grilling once the design tree is resolved, then continue to Phase 1.

---

## Phase 1 — Reconnaissance (depth-adapted)

> Show iteration counter at the top of every response: `[Iteration 1 · depth=3]`.

### Depth 1 — Direct
- Read 1-3 files directly involved.
- No agents, no critic, no research.
- Skip to Phase 3 with a 3-line plan.

### Depth 2 — Critic + local explore (1 agent)
- Read relevant files yourself.
- Launch ONE critic agent (see "Critic invocation" below).

### Depth 3 — Standard parallel (4 agents in ONE message)

```
Agent 1: subagent_type: "critic"           — the distributed critic agent
Agent 2: subagent_type: "explore-codebase" — map the code relevant to the task
Agent 3: subagent_type: "explore-docs"     — current library docs for the APIs involved
Agent 4: subagent_type: "websearch"        — breaking changes, community pitfalls
```

### Depth 4 — Adversarial (5 agents in ONE message)

Add a 5th agent in parallel: a SECOND instance of the critic agent (`subagent_type: "critic"`) with an adversarial brief — "Argue this proposal is WRONG. Find what's brittle, premature, over-engineered, or solving the wrong problem. Top 3 counter-arguments, the alternative not considered, the hidden cost. Under 400 words."

### Depth 5 — Full reflection

Depth 4 + post-research, BEFORE plan presentation, run yourself (no agents — these are reflection acts):

1. **Premortem** — Imagine this implementation FAILED 6 months from now. Write the postmortem in 5 bullets.
2. **Simplification pass** — "What 30% of this can I DELETE while keeping 90% of the value?"
3. **Future-self review** — What will you regret in 6 months? What will you wish you'd named differently?
4. **Opposite-day check** — What if the obvious solution is wrong? Is there a non-obvious one that's better?

Add these reflections to the plan presentation under "Reflection lenses".

---

## Critic invocation (depth >= 2)

Launch the critic agent (agents/critic.md, installed as `~/.claude/agents/critic.md`) with `subagent_type: "critic"`. Do NOT paste a critic prompt inline — the agent carries its own instructions.

Pass it as context:
- The task description.
- Stack, patterns, and key file references from a quick Grep/Glob.

Ask it to return:
- The 4-axis verdicts (PASS/WARN/BLOCK per axis) **per the quality-gate rule** — the axis definitions live there, do not restate them.
- An overall verdict: GO / GO-WITH-CHANGES / RETHINK / REJECT (any axis BLOCK → overall ≤ GO-WITH-CHANGES).

---

## Phase 2 — Synthesis & Reflection (depth >= 3)

After agents return, BEFORE presenting the plan, do a **reflection pass yourself**:

1. Re-read the user's original request word by word.
2. Ask: "Did the agents answer the question I was asked, or an easier version of it?"
3. Identify the 1-2 things the agents missed or under-weighted.
4. Resolve contradictions between agents — pick the side with stronger evidence and explain why.

Output a 3-line synthesis at the top of Phase 3:

> **Synthesis** — Critic says X. Adversarial pass says Y. My read: Z (because…). I'll address Y by [adjustment].

If the critic verdict is **REJECT**, halt before Phase 3 — present the rejection and ask the user to choose: pivot, override, or quit.

---

## Phase 3 — Plan presentation

Structure your response in this exact order. Skip sections that don't apply at the chosen depth.

### `[Iteration 1 · depth=N]` Header

### Synthesis (depth >= 3)
3-line summary integrating critic + adversarial pass + your reflection.

### What I understood
- Bullet list with `file_path:line_number` references
- Explicitly flag any ambiguity. **Ask now**, don't assume.

### The Real Problem (depth >= 3)
1-2 sentences. Often distinct from the stated problem.

### Plan(s)

**Depth 1-3**: ONE plan.
**Depth 4**: TWO alternatives (A: minimal/reversible, B: balanced).
**Depth 5**: THREE alternatives (A: minimal, B: balanced, C: ambitious/"right" architecture).

For each plan:

```
### Plan [A/B/C] — [name] · confidence: X/5

Files to modify:
- path:line — what changes — confidence: X/5

Files NOT touched (and why):
- path — reason

Tradeoffs:
- pro: …
- con: …

Build sequence:
1. step
2. step
```

**Confidence scale (1-5)**:
- 5: I've done this exact thing here, low risk
- 4: I understand fully, minor unknowns
- 3: Some unknowns, will resolve at impl
- 2: Significant unknowns, may need to revisit
- 1: Speculation, needs validation before coding

> If ANY section scores <= 2 → halt and ask before OKAY.

### Recommendation (depth >= 4)
"My pick: Plan B because [reason anchored in evidence]. Override if you disagree."

### Salt — what I'm NOT doing (depth >= 3)
List 3 things that look like good ideas but I'm leaving out, with the reason.

### Reflection lenses (depth = 5)

| Lens | Answer |
|------|--------|
| Premortem (3 failure modes) | 1. … 2. … 3. … |
| Simplification (delete 30%) | … |
| Future-you regrets | … |
| Opposite-day check | … |

### Quality-gate audit (always)

Report one PASS/WARN/BLOCK verdict per axis **per the quality-gate rule** (Architecture / Quality vs Speed / Production-grade / SOLID — definitions live in the rule, do not restate them):

| Axis | Verdict | Finding | Fix |
|------|---------|---------|-----|

### Risks & attention points
- Side effects, breaking changes, migrations, env vars, infra impact.

### Why this is the right approach (depth >= 3)
> "I believe this is the *right* approach (not just *a* right approach) because: [reasons anchored in evidence].
> Challenge me if you disagree — I'd rather rethink now than rework later."

---

## Phase 4 — OKAY gate

**STOP. Do not touch any file.**

Output literally:

> Confirm with **OKAY** to proceed (default = Plan B if multiple alternatives).
> Or: `OKAY plan A`, `OKAY but skip step 3`, or describe what you want to change.

**Absolute rules**:
- No OKAY → no code change. Period.
- "OKAY but ..." → adjust plan, re-emit Phase 3 as Iteration K+1.
- User can debate the critic. Re-run critic with counter-arguments. **Max 2 debate rounds**, then user's decision is final.
- User can demand a deeper iteration: "go deeper" → bump depth +1, re-run Phase 1 (cost check applies again).

---

## Phase 5 — Issue & branch (skip with `--no-issue` / `--no-branch`)

### 5a. GitHub issue (after OKAY)

```bash
gh issue create \
  --title "<type>(<scope>): <description>" \
  --body "## Description
<summary from approved plan>

## Implementation plan
<file list with confidences>

## Acceptance criteria
- [ ] <criterion 1>
- [ ] <criterion 2>
" \
  --label "<label>"
```

### 5b. Branch

Branch convention: **`type/N-slug`** (e.g. `feat/12-login`, `fix/42-redirect-loop`). `type` = feat / fix / refactor / perf / chore, `N` = issue number from 5a (omit `N-` if no issue), `slug` = short kebab-case.

```bash
git checkout develop 2>/dev/null || git checkout main 2>/dev/null || git checkout master
git pull
git checkout -b feat/12-login   # type/N-slug
```

---

## Phase 6 — Implementation (only after OKAY)

1. Implement exactly the approved plan — no scope additions.
2. **If a discovery changes the plan → STOP, re-emit Phase 3 as Iteration K+1.** Do not silently deviate.
3. Run project verification: `pnpm tsc --noEmit`, `pnpm lint`, project tests.
4. Summarize changes with `file_path:line` references.

**Never commit unless asked.** When asked, use `/commit`.

---

## Anti-patterns (block these)

- Coding without OKAY — rule #1.
- Launching depth >= 3 agents without the cost confirmation.
- Auto-bumping depth without telling the user.
- Filtering or softening critic feedback (must be verbatim).
- Presenting one plan at depth >= 4 (must be alternatives).
- Skipping confidence scoring at depth >= 4.
- Treating any axis BLOCK as just a warning.
- Trivial change (typo, single string) → suggest `--depth=1` instead (or `/oneshot`, if installed with the default pack).

## Rules

- **Never code without OKAY.** Non-negotiable.
- Critic is honest, never softened. User overrides everything — the user is the principal.
- Base analysis on files actually read — never guess.
- Verify APIs per the docs-first rule (ctx7 → MCP → WebSearch). Training data is stale.

## En clair (FR)

Ce skill oblige l'agent à présenter un plan et à attendre votre OKAY avant d'écrire la moindre ligne de code. Plus la tâche est grosse, plus l'analyse est profonde, mais chaque niveau de profondeur a un coût en agents : il vous est annoncé et vous pouvez le réduire. Le mode grill (`--grill`) pose les questions une par une pour cadrer un besoin flou.

## Next step

After OKAY and implementation → `/commit`. With the default pack installed: `/visual-check <route>` if the UI changed, and `/deep-review` before merging a large change.

$ARGUMENTS
