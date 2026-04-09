---
name: worktree-start
description: Start work on a GitHub issue using a git worktree. Use when starting a new feature or fix from an issue number.
---

# Start Worktree — Issue → Worktree → Branch

Follow these steps to start working on a GitHub issue.

## Step 0 — Should you use a worktree?

| Situation | Use worktree? | Why |
|-----------|---------------|-----|
| New feature (> 1 hour of work) | YES | Isolate from base branch |
| Bug fix that needs separate PR | YES | Clean diff, easy review |
| Hotfix while mid-feature | YES | Don't stash, don't lose context |
| Quick fix (< 30 min, same scope) | NO | Commit directly, `Refs #N` |
| Code review / testing a PR | YES (temporary) | Run tests without switching |

If the answer is NO → inform the user and suggest committing directly with `Refs #N`.

## Step 1 — Fetch issue info

```bash
gh issue view $ARGUMENTS
```

Extract:
- The **title** to name the branch (slug in kebab-case)
- The **type**: feat / fix / refactor / test / chore
- The **labels** and **linked issues** (parent epic?)

## Step 2 — Detect the repo name and base branch

```bash
basename "$(git rev-parse --show-toplevel)"   # → repo name, e.g. MyProject
git remote show origin | grep "HEAD branch"   # → base branch, e.g. main / presentation
```

Use the repo name and base branch detected above. Never assume.

## Step 3 — Update base branch locally

```bash
git fetch origin
git checkout <base-branch>
git pull origin <base-branch>
```

**Never use a branch that doesn't exist in the remote as the base.**

## Step 4 — Create the worktree

Folder format: `../<RepoName>-issue-<N>`
Branch format: `issue-<N>-<slug>`

Example for repo `MyProject`, issue #42 "Add user login":
- Folder: `../MyProject-issue-42`
- Branch: `issue-42-add-user-login`

```bash
git worktree add ../<RepoName>-issue-<N> -b issue-<N>-<slug> origin/<base-branch>
```

Verify with:
```bash
git worktree list
```

## Step 5 — Configure commit author in the worktree

```bash
cd ../<RepoName>-issue-<N>
git config user.name
git config user.email
```

If not set, ask the user for their name and email before continuing.

## Step 6 — Create bypass permissions settings

```bash
mkdir -p ../<RepoName>-issue-<N>/.claude
cat > ../<RepoName>-issue-<N>/.claude/settings.json << 'EOF'
{
  "defaultMode": "bypassPermissions",
  "permissions": { "allow": ["Bash", "Read", "Edit", "Write"] }
}
EOF
```

## Step 7 — Confirm to user

Output:
```
Worktree created:
  Folder : ../<RepoName>-issue-<N>
  Branch : issue-<N>-<slug>
  Base   : origin/<base-branch>
  Issue  : #<N> — <title>
  Epic   : #<P> — <parent title> (if linked)

All files to modify are in: ../<RepoName>-issue-<N>/

Workflow:
  1. Code in the worktree
  2. /commit (will auto-add Refs #<N>)
  3. /create-pr
  4. /worktree-finish <N>
```

## Rules

- **Never work directly on the base branch** (`main`, `master`, `presentation`, `develop`)
- Always base from `origin/<base-branch>` (remote, not local)
- Worktree is a sibling directory: `../<RepoName>-issue-<N>` (one level above the repo)
- Branch naming: `issue-N-slug` (no type prefix)
- NEVER `git add .` or `git add -A` — always stage files explicitly
- NEVER "Generated with Claude Code" or "Co-Authored-By" in commits

$ARGUMENTS
