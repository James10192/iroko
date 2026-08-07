---
name: fix-errors
description: >
  Fix all ESLint and TypeScript errors — sequentially by default; parallel sniper agents only
  beyond 20 errors (max 4 agents, each one consumes a full context window).
  Corrige toutes les erreurs ESLint et TypeScript, en séquentiel par défaut ; agents parallèles
  seulement au-delà de 20 erreurs (4 maximum, chaque agent consomme une fenêtre de contexte).
allowed-tools: Bash(pnpm :*), Bash(tsc :*), Bash(npm :*), Read, Task, Grep
---

# Fix Errors

Fix all ESLint and TypeScript errors. Sequential by default — parallel agents are the exception, not the rule.

## Workflow

1. **DISCOVER COMMANDS**: Check `package.json` for exact script names
   - Look for: `lint`, `typecheck`, `type-check`, `tsc`, `eslint`, `prettier`, `format`

2. **RUN DIAGNOSTICS**:
   - Run `pnpm run lint` (or equivalent)
   - Run `pnpm run typecheck` or `tsc --noEmit`
   - Capture all error output

3. **ANALYZE ERRORS**:
   - Extract file paths from error messages
   - Group errors by file location
   - Count total errors and affected files

4. **CHOOSE THE MODE**:

   | Error count | Mode |
   |-------------|------|
   | 20 or fewer | **Sequential (default)** — fix them yourself, file by file. No agents. |
   | More than 20 | Parallel — sniper agents, **max 4**, each handling one area of max 5 files. |

   **Cost warning before going parallel**: each agent consumes a full context window. Announce it: "N errors across M files → launching K sniper agents (each consumes a full context window)." If the count is borderline, stay sequential.

5. **SEQUENTIAL MODE (default)**:
   - Fix errors file by file, starting with the file that has the most errors.
   - Minimal changes only — fix the error, preserve functionality.

6. **PARALLEL MODE (>20 errors only)**:
   - Create areas of **max 5 files** each, grouping related files (same directory/feature).
   - Launch at most 4 sniper agents in ONE message, one area each, with the specific error list per file.

   Sniper agent instructions:
   ```
   Fix all ESLint and TypeScript errors in these files:
   [list of files with their specific errors]

   Focus only on these files. Make minimal changes to fix errors while preserving functionality.
   ```

7. **VERIFICATION**: Re-run diagnostics after fixes
   - Re-run lint and typecheck
   - Report remaining errors; loop back if needed

8. **FORMAT CODE**: Apply Prettier (if available)
   - Run `pnpm run format` or equivalent

## Rules

- ALWAYS check package.json first for correct commands
- ONLY fix linting and TypeScript errors
- NO feature additions — minimal fixes only
- SEQUENTIAL by default. Parallel is an optimization for large error counts, not the default — agents are expensive.
- In parallel mode: max 4 agents, max 5 files per area, every error assigned to exactly one area

## En clair (FR)

Ce skill corrige toutes les erreurs de lint et de typage du projet. Par défaut il travaille seul, fichier par fichier, ce qui coûte peu. Il ne lance des agents en parallèle qu'au-delà de 20 erreurs, et jamais plus de 4, car chaque agent consomme une fenêtre de contexte complète (donc des tokens).

## Next step

All green → `/commit`.

User: $ARGUMENTS
