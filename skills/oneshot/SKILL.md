---
name: oneshot
description: >
  Ultra-fast implementation of ONE trivial, well-scoped task: Explore → Code → Test, strictly in
  scope, stop after 2 failed attempts. The quick counterpart to /plan-and-confirm.
  Implémentation ultra-rapide d'UNE tâche triviale bien cadrée : explorer → coder → tester,
  strictement dans le périmètre, stop après 2 échecs. Le pendant rapide de /plan-and-confirm.
argument-hint: "<feature-description>"
---

# OneShot

Implement `$ARGUMENTS` at maximum speed. For ONE small, well-understood task (a typo, a label, a tiny fix, a single focused feature). Anything bigger or fuzzier belongs in `/plan-and-confirm`.

## Workflow

### 1. EXPLORE (minimal)

Gather minimum viable context:
- Use `Glob` to find 2-3 key files by pattern
- Use `Grep` to search for specific patterns
- Quick doc lookup (per the docs-first rule) only if library-specific API knowledge is needed
- NO exploration tours — find examples/edit targets and move on

### 2. CODE (main phase)

Execute changes immediately:
- Follow existing codebase patterns exactly
- Clear variable/method names over comments
- Stay STRICTLY in scope — change only what's needed
- NO comments unless genuinely complex
- NO refactoring beyond requirements
- Run formatters if available (`pnpm run format` or equivalent)

### 3. TEST (validate)

Check quality:
- Run: `pnpm run lint && pnpm run typecheck` (or the project's equivalents from package.json)
- If it fails: fix only what you broke, re-run
- NO full test suite unless explicitly requested

## Output

When complete, return:

```
## Done

**Task:** {what was implemented}
**Files changed:** {list}
**Validation:** ✓ lint ✓ typecheck
```

## Constraints

- ONE task only — no tangential improvements
- NO documentation files unless requested
- NO refactoring outside immediate scope
- NO "while I'm here" additions
- If stuck after 2 attempts: report the blocker and STOP. Suggest `/plan-and-confirm` — the task was bigger than it looked.

## En clair (FR)

Pour une petite tâche évidente (corriger une faute, changer un libellé, un petit fix), ce skill va droit au but sans lancer toute la machinerie de planification. S'il échoue deux fois, il s'arrête et propose de passer par `/plan-and-confirm` : c'est le signe que la tâche était plus grosse que prévu.

## Next step

→ `/commit` to save the change.

$ARGUMENTS
