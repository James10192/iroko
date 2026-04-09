---
name: create-issue
description: Create a GitHub issue with labels, template, and epic linking. Use when starting new work that needs tracking.
model: haiku
allowed-tools: Bash(gh :*), Bash(git :*)
---

# Create Issue

Create a well-structured GitHub issue for tracking work.

## Context

- Open issues: !`gh issue list --state open --limit 10`
- Labels: !`gh label list --limit 30`
- Current branch: !`git branch --show-current`

## Workflow

1. **Determine issue type** from the user's description:
   - `feat` → label `enhancement` (or `type:feature` if exists)
   - `fix` / `bug` → label `bug` (or `type:bug` if exists)
   - `refactor` → label `type:refactor` if exists
   - `chore` / `docs` → label `documentation` or `type:chore` if exists

2. **Check for parent epic**:
   - If the user mentions an existing issue (e.g. "part of #158", "sous-issue de #42")
   - If current work relates to a known epic in open issues
   - If a parent epic exists, add `Parent: #N` in the issue body

3. **Decide: new issue or continue existing?**

   Ask yourself (do NOT ask the user — decide and inform):

   | Situation | Decision |
   |-----------|----------|
   | New feature, new scope | Create new issue |
   | Bug found during feature work (critical) | Create new issue + label `priority:high` |
   | Bug found during feature work (minor) | Add to current PR, note in commit |
   | Next lot of an existing epic | Create new issue, link to epic with `Parent: #N` |
   | Small fix in same scope as current work | Don't create issue — just commit with `Refs #N` |

4. **Create the issue**:

   ```bash
   gh issue create \
     --title "<type>: <description>" \
     --label "<label1>,<label2>" \
     --body "$(cat <<'EOF'
   ## Context
   [Why this work is needed — 1-2 sentences]

   ## Scope
   - [ ] Task 1
   - [ ] Task 2
   - [ ] Task 3

   ## Acceptance criteria
   - [ ] [What "done" looks like]

   ## Related
   - Parent: #N (if applicable)
   - Related: #M, #P (if applicable)
   EOF
   )"
   ```

5. **Output** the issue number and suggest next step:
   ```
   Issue #<N> created: <title>
   → To start working: /worktree-start <N>
   → Or commit directly on current branch with: Refs #<N>
   ```

## Rules

- SPEED: Create the issue quickly, don't over-engineer the description
- LABELS: Use available labels from the repo. Don't create labels that don't exist
- TITLE FORMAT: `type: description` in imperative mood (e.g. "feat: add LMD bulletin PDF")
- EPIC LINKING: Always check open issues for a related epic before creating standalone
- NO INTERACTION: Analyze context and create — don't ask the user to fill in details
- TASK LIST: Include 2-5 checkboxes in the Scope section to make progress trackable

$ARGUMENTS
