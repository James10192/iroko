---
name: worktree-finish
description: Clean up after a worktree PR is merged. Use after the PR has been merged into the base branch.
---

# Finish Worktree — Cleanup après merge

Follow these steps **strictly in order** to clean up after a merged PR.

The issue number being cleaned is passed as `$ARGUMENTS`.

## Step 1 — Detect repo name and worktree path

```bash
REPO=$(basename "$(git rev-parse --show-toplevel)")
git worktree list
```

The worktree path should be `../${REPO}-issue-<N>`.

## Step 2 — Find the branch name

```bash
gh pr list --state merged --limit 20
# or
git branch -a | grep "issue-<N>"
```

The branch should be named `issue-<N>-<slug>`.

## Step 3 — Verify that the PR is merged

```bash
gh pr view issue-<N>-<slug> --json state,mergedAt,number
```

If `state` is NOT `MERGED` → **stop and inform the user** that the PR is not yet merged.

## Step 4 — Remove the worktree

```bash
git worktree remove ../${REPO}-issue-<N> --force
```

`--force` is required because the local branch hasn't been merged locally yet.

## Step 5 — Delete the local branch

Use `-D` (uppercase) because the branch was only merged on GitHub (remote merge commit):

```bash
git branch -D issue-<N>-<slug>
```

## Step 6 — Delete the remote branch

```bash
git push origin --delete issue-<N>-<slug>
```

If GitHub already auto-deleted it → ignore the error.

## Step 7 — Update base branch

```bash
BASE=$(git remote show origin | grep "HEAD branch" | awk '{print $NF}')
git checkout "$BASE"
git pull origin "$BASE"
```

## Step 8 — Close the GitHub issue

```bash
gh issue close <N> --comment "Fermé via merge de la PR #<PR number>"
```

To find open issues: `gh issue list --state open`

## Step 9 — Check for next steps

After cleanup, check if there's more work related to this issue's epic:

```bash
gh issue view <N> --json body 2>/dev/null | grep -i "parent"
```

If a parent epic exists:
```bash
gh issue view <parent-N> --json title,body,state
```

**Suggest next steps to the user:**

| Situation | Suggestion |
|-----------|------------|
| Parent epic still open, more lots to do | "Epic #P still open. Create next issue with `/create-issue`" |
| Parent epic fully done | "All lots complete! Close epic with `gh issue close <P>`" |
| No parent epic | "Cleanup complete. Ready for next task." |
| Other open issues exist | Show: `gh issue list --state open --limit 5` |

## Step 10 — Verify

```bash
git worktree list          # must show only the main repo
git log --oneline -3       # must show the merge commit at top
git branch -a | grep issue-<N>   # must return nothing
```

Output:
```
Cleanup complete:
  Worktree removed : ../<REPO>-issue-<N>
  Branch deleted   : issue-<N>-<slug> (local + remote)
  Issue closed     : #<N>
  Base updated     : <base-branch> (up to date)

Next: [suggestion based on Step 9]
```

## Rules

- **Always verify that the PR is MERGED before cleaning up**
- **Always use `git worktree list` before removing** to confirm the path
- **Always use `--force` on `worktree remove`**
- **Always use `-D` (uppercase) on `branch` delete** — branch is not merged locally
- **Always return to the base branch** at the end
- **Always delete the remote branch** with `git push origin --delete`
- **Always suggest next steps** — the workflow doesn't end at cleanup

$ARGUMENTS
