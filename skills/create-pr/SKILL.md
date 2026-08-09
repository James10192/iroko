---
name: create-pr
description: >
  Create and push a pull request with an auto-generated title and description.
  Crée et pousse une pull request avec titre et description générés automatiquement.
model: haiku
allowed-tools: Bash(git :*), Bash(gh :*)
---

# Create PR

Create pull request with concise, meaningful description.

## Tooling check (before first use)

1. **Verify first**: `gh --version`. Never conclude gh is missing without this check.
2. **Install directly if missing**: run the install yourself, per OS: Windows `winget install GitHub.cli`, macOS `brew install gh`, Debian/Ubuntu `sudo apt install gh`. Then check `gh auth status`; if not authenticated, STOP and ask the user to run `gh auth login` (authentication is the only human step).
3. **Fallback**: if the install fails, push the branch yourself with `git push -u origin HEAD`, then give the user the manual PR creation URL: `https://github.com/<owner>/<repo>/compare/<base>...<branch>?expand=1` plus the drafted title and body to paste.

FR : vérifier gh, l'installer soi-même selon l'OS, seule l'authentification (`gh auth login`) revient à l'utilisateur.

## Context

- Current branch: !`git branch --show-current`
- Working tree status: !`git status --short`
- Recent commits: !`git log --oneline -5`
- Remote tracking: !`git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "none"`

## Workflow

1. **Verify**: Check `git status` and current branch
2. **Branch Safety**: **CRITICAL** - If on main/master, create descriptive branch from changes
3. **Push**: `git push -u origin HEAD`
4. **Analyze**: `git diff origin/main...HEAD --stat`
5. **Generate PR**:
   - Title: One-line summary (max 72 chars)
   - Body: Bullet points of key changes
6. **Submit**: `gh pr create --title "..." --body "..."`
7. **Return**: Display PR URL

## PR Format

```markdown
## Summary

• [Main change or feature]
• [Secondary changes]
• [Any fixes included]

## Type

[feat/fix/refactor/docs/chore]
```

## Rules

- NO verbose descriptions
- NO "Generated with" signatures
- Auto-detect base branch (main/master/develop)
- Use HEREDOC for multi-line body
- If PR exists, return existing URL

## Next step

Before merging a large change → `/deep-review` on the branch. After merge → back to the next task with `/plan-and-confirm` or `/oneshot`.

User: $ARGUMENTS
