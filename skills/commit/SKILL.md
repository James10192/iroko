---
name: commit
description: Quality-gated commit and push. Audits code on 4 axes before committing, then generates detailed or quick commit messages. Use "commit détaillé" for multi-line body.
allowed-tools: Bash(git :*), Bash(npm :*), Bash(pnpm :*), Bash(gh :*), Grep, Glob, Read, Agent
---

# Commit — Quality-Gated

Audit code quality, then commit with conventional message format and push.

## Context

- Git state: !`git status`
- Staged changes: !`git diff --cached --stat`
- Unstaged changes: !`git diff --stat`
- Recent commits: !`git log --oneline -5`
- Current branch: !`git branch --show-current`
- Full diff: !`git diff`

## Workflow

### 1. Analyze git state

- Nothing staged but unstaged changes exist: `git add .`
- Nothing to commit: inform user and exit

### 2. Quality Gate — 4 Axes Audit

**Skip audit if** the diff is ONLY: `.md` files, `.json` config, `.env.example`, OR less than 5 lines changed in 1 file, OR only deletions.

**Otherwise, audit the diff on 4 axes:**

| Axe | Check | BLOCK if |
|-----|-------|----------|
| **Architecture** | God class? Mixed responsibilities? Existing pattern ignored? | New file >300 lines with 3+ unrelated concerns |
| **Qualité vs Vitesse** | N+1 queries? Debug code (`dd()`, `console.log`, `var_dump`)? Missing validation? | Debug code in diff, or obvious N+1 in a loop |
| **Production-grade** | Stack traces exposed? Unprotected routes? Missing transactions? Secrets hardcoded? | Stack traces in JSON responses, routes without auth, secrets in code |
| **SOLID** | Parent contracts violated? `hasRole()` hardcoded instead of permissions? | Liskov violation in overridden methods |

**Output format:**
```
## Quality Gate

| Axe | Verdict |
|-----|---------|
| Architecture | PASS/WARN/BLOCK — detail |
| Qualité vs Vitesse | PASS/WARN/BLOCK — detail |
| Production-grade | PASS/WARN/BLOCK — detail |
| SOLID | PASS/WARN/BLOCK — detail |
```

- **All PASS** → proceed to commit
- **Any WARN** → show warnings, ask user to confirm before committing
- **Any BLOCK** → DO NOT COMMIT. Show issues and propose fixes. Stop here.

### 3. Detect issue context (Issue Linking)

- Check if the user mentioned an issue number in the conversation (e.g. "issue #158", "Refs #42")
- Check if the branch name contains an issue number (e.g. `feat/158-lmd-system`, `fix-42`)
- Check recent conversation for epic/lot references (e.g. "Lot 3/7", "Part of #158")
- If an issue is detected, include `Refs #N` in the commit footer
- If the user says "closes", "ferme", "résout" the issue, use `Closes #N` instead

### 4. Generate commit message

- Title format: `type(scope): brief description`
- Types: `feat`, `fix`, `update`, `docs`, `chore`, `refactor`, `test`, `perf`, `revert`
- Title: under 72 chars, imperative mood, lowercase after colon
- **Detailed mode** (when user says "détaillé", "detailed", "descriptif", or diff touches 3+ files):
  - Add blank line after title
  - Add body with bullet points describing each meaningful change
  - Group by area/file when relevant
  - Include WHY not just WHAT when non-obvious
  - If lot/phase tracking is relevant, add `Lot X/Y: description` line before issue ref
  - Use HEREDOC format for multi-line:
    ```bash
    git commit -m "$(cat <<'EOF'
    type(scope): title

    - Change 1 description
    - Change 2 description
    - Change 3 description

    Lot 3/7: Service layer
    Refs #158
    EOF
    )"
    ```
- **Quick mode** (default for small/obvious changes): single line `git commit -m "message"`
  - If issue context detected, append on same line: `type(scope): description (Refs #N)`

### 5. Commit and push

- Execute the commit
- `git push`

## Issue Linking Rules

| Situation | Footer | Example |
|-----------|--------|---------|
| Work related to an open issue | `Refs #N` | `Refs #158` |
| Completing/closing an issue | `Closes #N` | `Closes #42` |
| Multiple related issues | `Refs #N, #M` | `Refs #158, #160` |
| Lot/phase of an epic | `Lot X/Y: desc` + `Refs #N` | `Lot 3/7: Controllers` + `Refs #158` |
| No issue context detected | No footer | (skip entirely) |

**Issue linking is opt-in**: only add when context is clear from the conversation, branch name, or user request. Never guess or fabricate issue numbers.

## Rules

- **QUALITY OVER SPEED**: The 4-axes audit runs BEFORE committing. Never skip it for speed.
- **NO INTERACTION on trivial commits**: For exempt diffs (md, config, <5 lines), generate and commit directly.
- **AUTO-STAGE**: If nothing staged, stage everything.
- **AUTO-PUSH**: Always push after committing.
- **IMPERATIVE MOOD**: "add", "update", "fix" not past tense.
- **DETAILED BY DEFAULT** when diff touches 3+ files or user asks for it.
- **NO "Generated with" or "Co-Authored-By"** footers unless user explicitly asks.
- **ISSUE LINKING**: Add `Refs #N` when an issue is clearly in context, skip otherwise.
- **BLOCK = NO COMMIT**: If any axis is BLOCK, fix first. No exceptions.
