---
name: plan-and-confirm
description: >
  Ultraplan — depth-variable planning pipeline. Auto-detects task complexity, runs N parallel
  research agents + adversarial debate + 5 ultrathink lenses + premortem, presents alternatives
  with confidence scores, waits for explicit OKAY before any code change. Rule #1 — never code without OKAY.
argument-hint: "[description] [--depth=1..5 | --quick | --ultra] [--alternatives=N] [--no-issue] [--no-worktree]"
---

# Plan & Confirm — Ultraplan v3

> "Plan like Da Vinci. Question every assumption. Solve the real problem, not the stated one."

## Prerequisites

- ctx7 CLI (`npx ctx7 --version`) — falls back to Context7 MCP, then WebSearch.
- gh CLI for issue/worktree phases (FULL mode only).

## Phase 0 — Depth selection

Parse `$ARGUMENTS` for explicit flags first:

| Flag | Depth | Effect |
|------|-------|--------|
| `--depth=1` or `--quick` / `-q` | 1 | Direct read of relevant files. No agents. No critic. Plan is a 1-paragraph diff preview. |
| `--depth=2` | 2 | Local explore + critic (1 agent). 4-axis audit. No alternatives. |
| `--depth=3` (DEFAULT auto) | 3 | Critic + 3 research agents (codebase, docs, web). 4-axis audit. Reflection pass. 1 plan + salt. |
| `--depth=4` | 4 | Depth 3 + Devil's Advocate (5th agent) + 2 alternatives (A/B). Confidence scoring per section. |
| `--depth=5` or `--ultra` | 5 | Full ultrathink: depth 4 + premortem + simplification pass + 3 alternatives (A/B/C) + "future-self review" + opposite-day check. |

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

If multiple signals match, take the **maximum**. Announce the chosen depth in the first reply: `🎯 Auto-depth: 3 (feature add). Override with --depth=N if needed.`

Other flags:

| Flag | Effect |
|------|--------|
| `--alternatives=N` | Force N alternatives (overrides depth default) |
| `--no-issue` / `-ni` | Skip GitHub issue creation after OKAY |
| `--no-worktree` / `-nw` | Skip worktree creation after issue |

Strip flags from the task description.

---

## Phase 1 — Reconnaissance (depth-adapted)

> Show iteration counter at the top of every response: `[Iteration 1 · depth=3]`.

### Depth 1 — Direct
- Read 1-3 files directly involved.
- No agents, no critic, no research.
- Skip to Phase 3 with a 3-line plan.

### Depth 2 — Critic + local explore (1 agent)
- Read relevant files yourself.
- Launch ONE Critic agent with 4-axis audit.

### Depth 3 — Standard parallel (4 agents in ONE message)

```
Agent 1: Critic (subagent_type: "general-purpose")
Agent 2: Codebase Explorer (subagent_type: "explore-codebase")
Agent 3: Docs Research (subagent_type: "explore-docs")
Agent 4: Web Search (subagent_type: "websearch")
```

### Depth 4 — Adversarial (5 agents in ONE message)

Add a 5th agent in parallel:

```
Agent 5: Devil's Advocate (subagent_type: "general-purpose")
```

Devil's Advocate prompt:
```
You are a senior engineer who has just been shown this proposal:
{{task description}}

Your job is to ARGUE THIS PROPOSAL IS WRONG. Your reputation depends on finding the strongest counter-arguments. Even if it's mostly right, find what's brittle, premature, over-engineered, or solving the wrong problem.

Output:
1. Top 3 reasons this plan is wrong (most damaging first)
2. The "obvious" alternative the team hasn't considered
3. The hidden cost no one is talking about
4. What an expert outside the team would say in 30 seconds

Be ruthless. Cite code/docs when possible. Concise — under 400 words.
```

### Depth 5 — Ultrathink full

Depth 4 + post-research, BEFORE plan presentation, run yourself (no agent — these are reflection acts):

1. **Premortem** — Imagine 6 months have passed and this implementation FAILED. Write the postmortem in 5 bullets: what broke, who got paged, what we wish we'd done differently.
2. **Simplification pass** — Look at the synthesized plan and answer: "What 30% of this can I DELETE while keeping 90% of the value?" Be ruthless.
3. **Future-self review** — Imagine you (the user) reviewing this code 6 months from now. What 2-3 things will you regret? What will you wish you'd named differently?
4. **Opposite-day check** — What if the obvious solution is wrong? Is there a non-obvious solution that's actually better?

Add these reflections to the plan presentation under "Ultrathink lenses".

---

## Critic prompt (depth ≥ 2)

```
You are a senior technical reviewer. Read ~/.claude/agents/critic.md if present.

THE PROPOSAL: {{task description}}
THE CODEBASE: {{stack, patterns, key file references from quick Grep/Glob}}

Auto-detect lenses (CTO / UX / Security / Performance / Cost / Accessibility).

MANDATORY 4-AXIS AUDIT (per pre-commit-quality-gate rule):

1. Architecture — best architectural solution? SRP respected? No god-class aggravation? Existing patterns honored?
2. Quality vs Speed — tests planned for critical logic? Any shortcut that will need rework? No N+1, no copy-paste?
3. Production-grade — feature flags? a11y? rate limiting? monitoring? graceful degradation? secret handling?
4. SOLID / Liskov — Open/Closed for extensibility? interfaces (ISP)? dependency inversion?

For each axis: PASS / WARN / BLOCK + concrete finding (file:line) + concrete fix.

ADDITIONALLY — answer the 5 ultrathink lenses (concise, 1-2 sentences each):
A. The Real Problem — Is the stated problem the actual problem? What's the second-order goal?
B. The Elegant Solution — Is there a simpler solution we're missing?
C. The Premortem — Name 3 ways this fails in 6 months.
D. The Simplification — What can we DELETE from this plan?
E. The Senior Test — What would the smartest senior eng on this team ask about this plan?

FINAL VERDICT:
- 4-axis row: Architecture / Quality / Prod / SOLID → PASS|WARN|BLOCK each
- Lens row: A/B/C/D/E → 1-line answer each
- Overall: GO / GO-WITH-CHANGES / RETHINK / REJECT
- Rule: any axis BLOCK → overall ≤ GO-WITH-CHANGES.
```

---

## Phase 2 — Synthesis & Reflection (depth ≥ 3)

After agents return, BEFORE presenting the plan, do a **reflection pass yourself**:

1. Re-read the user's original request word by word.
2. Ask: "Did the agents answer the question I was asked, or did they answer an easier version of it?"
3. Identify the 1-2 things the agents missed or under-weighted.
4. Resolve contradictions between agents (if any) — pick the side with stronger evidence and explain why.

Output a 3-line synthesis at the top of Phase 3:

> **Synthesis** — Critic says X. DevAdvocate says Y. My read: Z (because…). I'll address Y by [adjustment].

If Critic verdict is **REJECT**, halt before Phase 3 — present the rejection and ask the user to choose: pivot, override, or quit.

---

## Phase 3 — Plan presentation

Structure your response in this exact order. Skip sections that don't apply at the chosen depth.

### `[Iteration 1 · depth=N]` Header

### Synthesis (depth ≥ 3)
3-line summary integrating critic + devil's advocate + your reflection.

### What I understood
- Bullet list with `file_path:line_number` references
- Explicitly flag any ambiguity. **Ask now**, don't assume.

### The Real Problem (depth ≥ 3)
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

> If ANY section scores ≤ 2 → halt and ask before OKAY.

### Recommendation (depth ≥ 4)
"My pick: Plan B because [reason anchored in evidence]. Override if you disagree."

### Salt — what I'm NOT doing (depth ≥ 3)
List 3 things that look like good ideas but I'm leaving out, with the reason.
1. Tempting idea 1 — why I'm skipping (e.g., scope creep, premature, breaks invariant X)
2. ...
3. ...

### Ultrathink lenses (depth = 5)

| Lens | Answer |
|------|--------|
| Real Problem | … |
| Elegant Solution | … |
| Premortem (3 failure modes) | 1. … 2. … 3. … |
| Simplification (delete 30%) | … |
| Senior Test | … |
| Future-you regrets | … |
| Opposite-day check | … |

### 4-axis audit (always)
| Axis | Verdict | Finding | Fix |
|------|---------|---------|-----|
| Architecture | PASS/WARN/BLOCK | … | … |
| Quality vs Speed | PASS/WARN/BLOCK | … | … |
| Production-grade | PASS/WARN/BLOCK | … | … |
| SOLID | PASS/WARN/BLOCK | … | … |

### Risks & attention points
- Side effects, breaking changes, migrations, env vars, infra impact.

### Why this is the right approach (depth ≥ 3)
> "I believe this is the *right* approach (not just *a* right approach) because:
> 1. [reason anchored in evidence/code]
> 2. [reason]
> 3. [reason]
> Challenge me if you disagree — I'd rather rethink now than rework later."

---

## Phase 4 — OKAY gate

**STOP. Do not touch any file.**

(Optional notification — only if `OPENCLAW_TOKEN` is set in env, ping your local Telegram hook. Skip silently otherwise.)

Output literally:

> Confirm with **OKAY** to proceed (default = Plan B if multiple alternatives).
> Or: `OKAY plan A`, `OKAY but skip step 3`, or describe what you want to change.

**Absolute rules**:
- No OKAY → no code change. Period.
- "OKAY but ..." → adjust plan, re-emit Phase 3 as Iteration K+1.
- User can debate the critic. Re-run critic with counter-arguments. **Max 2 debate rounds**, then user's decision is final.
- User can demand a deeper iteration: "go deeper" → bump depth +1, re-run Phase 1.

---

## Phase 5 — Issue & worktree (FULL mode, skip with `--no-issue` / `--no-worktree`)

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

## Context
- Depth: <N>
- Critic verdict: <verdict>
- Plan chosen: <A/B/C>
" \
  --label "<label>"
```

### 5b. Worktree

```bash
TYPE="feat"  # or fix, refactor, perf, chore
ISSUE_NUM=<from 5a>
SLUG=<short-kebab>

git checkout develop 2>/dev/null || git checkout master
git pull
git checkout -b ${TYPE}/${ISSUE_NUM}-${SLUG}
```

---

## Phase 6 — Implementation (only after OKAY)

1. Implement exactly the approved plan — no scope additions.
2. Follow the agent routing recommendation if any.
3. **If a discovery changes the plan → STOP, re-emit Phase 3 as Iteration K+1.** Do not silently deviate.
4. Run project verification: `pnpm tsc --noEmit`, `pnpm lint`, project tests.
5. Summarize changes with `file_path:line` references.

**Never commit unless asked.** When asked, use `/commit`.

---

## Phase 7 — Post-implementation

1. UI impact → suggest `/visual-check <route>`.
2. Suggest `/commit`.
3. After commit → suggest `/create-pr` with `Closes #<issue>`.

---

## Iteration counter rules

- First plan presentation = Iteration 1.
- User pushback / "go deeper" / changed flags = Iteration N+1.
- Show counter at top of every plan: `[Iteration 2 · depth=4]`.
- Track iteration in your head, no need for a file.

---

## Anti-patterns (block these)

- Coding without OKAY — rule #1.
- Auto-bumping depth without telling the user.
- Filtering or softening critic feedback (must be verbatim).
- Presenting one plan at depth ≥ 4 (must be alternatives).
- Skipping confidence scoring at depth ≥ 4.
- Skipping "salt" / "what I'm not doing" at depth ≥ 3.
- Treating any axis BLOCK as just a warning.
- Trivial change (typo, single string) → suggest `--depth=1` or skip skill entirely.

---

## Rules

- **Never code without OKAY.** Non-negotiable.
- Critic runs in parallel with research. Time saved > tokens wasted on rejections.
- Critic is honest, never softened.
- User overrides everything (critic, devil's advocate, defaults). User is the principal.
- Base analysis on files actually read — never guess.
- Use ctx7 CLI + WebSearch to verify APIs. Training data is stale.
- Default depth is auto-detected. User can override anytime.

$ARGUMENTS
