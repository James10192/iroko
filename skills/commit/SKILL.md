---
name: commit
description: >
  Quality-gated commit: stages ONLY the files changed in this conversation, audits the diff per
  the quality-gate rule, writes a conventional message, pushes only when a remote exists.
  Commit avec garde-fou qualité : ne stage que les fichiers modifiés dans la conversation, audite
  le diff selon la rule quality-gate, message conventionnel, push seulement si un remote existe.
allowed-tools: Bash(git :*), Bash(npm :*), Bash(pnpm :*), Bash(gh :*), Grep, Glob, Read
---

# Commit — Quality-Gated

Audit code quality, then commit with a conventional message.

## Context

- Git state: !`git status`
- Staged changes: !`git diff --cached --stat`
- Unstaged changes: !`git diff --stat`
- Recent commits: !`git log --oneline -5`
- Current branch: !`git branch --show-current`

## Workflow

### 1. Stage PRECISELY — never `git add .`

List the files you modified or created **in this conversation**. Stage them explicitly, by name:

```bash
git add path/to/file1.ts path/to/file2.ts
```

- **NEVER** `git add .`, `git add -A`, or `git add --all`. Other files in the working tree (another agent's work, local config, untracked experiments) are not yours to commit.
- If files are already staged that you did NOT touch in this conversation, warn the user and ask before including them.
- Nothing to commit → inform the user and exit.

### 2. Quality gate — audit per the quality-gate rule

**Skip the audit if** the diff is ONLY: `.md` files, `.json` config, `.env.example`, OR less than 5 lines changed in 1 file, OR only deletions.

Otherwise, audit the staged diff (`git diff --cached`) on the 4 axes **defined in the quality-gate rule** (Architecture / Quality vs Speed / Production-grade / SOLID). The axis definitions, checks, and BLOCK criteria live in that rule — do not restate them here.

**Output format:**
```
## Quality Gate (per the quality-gate rule)

| Axis | Verdict |
|------|---------|
| Architecture | PASS/WARN/BLOCK — detail |
| Quality vs Speed | PASS/WARN/BLOCK — detail |
| Production-grade | PASS/WARN/BLOCK — detail |
| SOLID | PASS/WARN/BLOCK — detail |
```

- **All PASS** → proceed to commit.
- **Any WARN** → show warnings, ask the user to confirm before committing.
- **Any BLOCK** → DO NOT COMMIT. Show issues and propose fixes. Stop here.

### 3. Detect issue context

- Issue number mentioned in the conversation (e.g. "issue #158") → `Refs #N` in the footer.
- Branch name contains an issue number (convention `type/N-slug`, e.g. `feat/158-lmd-system`) → `Refs #N`.
- User says the work closes the issue → `Closes #N` instead.
- **Opt-in only**: never guess or fabricate issue numbers.

### 4. Generate the commit message

- Title: `type(scope): brief description` — under 72 chars, imperative mood, lowercase after colon.
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`, `ci`.
- **Detailed mode** (user asks for it, or diff touches 3+ files): blank line after title, then bullet points per meaningful change, WHY when non-obvious. Use HEREDOC:
  ```bash
  git commit -m "$(cat <<'EOF'
  type(scope): title

  - Change 1
  - Change 2

  Refs #158
  EOF
  )"
  ```
- **Quick mode** (small/obvious changes): single line `git commit -m "type(scope): description"`.

### 5. Commit, then push conditionally

- Execute the commit.
- Push ONLY if BOTH are true:
  1. A remote exists: `git remote` returns at least one remote AND the branch has (or can set) an upstream.
  2. The user has NOT said not to push in this conversation.
- Push command: `git push` (or `git push -u origin HEAD` if no upstream yet).
- No remote, or user said don't push → stop after the commit and say so.

## Rules

- **PRECISE STAGING**: only files changed in this conversation, listed by name. `git add .` / `-A` is forbidden.
- **BLOCK = NO COMMIT**: if any axis is BLOCK, fix first. No exceptions.
- **NO "Generated with" or "Co-Authored-By"** footers unless the user explicitly asks.
- **IMPERATIVE MOOD**: "add", "fix", not past tense.
- **NO INTERACTION on trivial commits**: for exempt diffs (md, config, <5 lines), generate and commit directly.
- **CONDITIONAL PUSH**: never force-push, never push without a remote, never push against the user's wishes.

## En clair (FR)

Ce skill commit uniquement les fichiers touchés pendant la conversation (jamais `git add .`, qui embarquerait des fichiers qui ne sont pas les vôtres), vérifie la qualité du diff selon la rule quality-gate avant de committer, et ne pousse vers GitHub que si un remote existe et que vous ne vous y êtes pas opposé.

## Next step

Large or structural change → if installed (with the default pack): `/verdict` before merging. Ready to merge → if installed (with the full pack): `/create-pr`.

$ARGUMENTS
