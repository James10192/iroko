---
name: fix-pr-comments
description: Fetch PR review comments and implement all requested changes
allowed-tools: Bash(gh :*), Bash(git :*), Read, Edit, MultiEdit
---

# Fix PR Comments

Systematically address ALL unresolved review comments until PR is approved.

## Prerequisites

This skill requires the GitHub CLI (`gh`). Check availability before proceeding:
- Run: `gh auth status`
- If not installed: https://cli.github.com
- If not authenticated: `gh auth login`
- If `gh` is missing, inform the user and stop. This skill cannot work without it.

## Context

- Current branch: !`git branch --show-current`
- Working tree status: !`git status --short`
- Recent commits: !`git log --oneline -3`

## Workflow

1. **FETCH COMMENTS**:
   - Identify PR: `gh pr status --json number,headRefName`
   - Get reviews: `gh pr review list --state CHANGES_REQUESTED`
   - Get inline: `gh api repos/{owner}/{repo}/pulls/{number}/comments`
   - Capture BOTH review comments AND inline code comments
   - STOP if no PR found - ask user for PR number

2. **ANALYZE & PLAN**:
   - Extract exact file:line references
   - Group by file for MultiEdit efficiency
   - STAY IN SCOPE: NEVER fix unrelated issues
   - Create checklist: one item per comment

3. **IMPLEMENT FIXES**:
   - BEFORE editing: ALWAYS `Read` target file first
   - Batch changes with `MultiEdit` for same-file modifications
   - Make EXACTLY what reviewer requested
   - Check off each resolved comment

4. **COMMIT & PUSH**:
   - Stage: `git add -A`
   - Commit: `fix: address PR review comments`
   - Push: `git push`
   - NEVER include co-author tags

## Rules

- Every unresolved comment MUST be addressed
- Read files BEFORE any edits - no exceptions
- FORBIDDEN: Style changes beyond reviewer requests
- On failure: Return to ANALYZE phase, never skip comments

User: $ARGUMENTS
