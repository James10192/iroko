---
name: batir
description: >
  End-to-end build of ONE feature: analyse, short plan with explicit OKAY, construction in
  small verified increments, then the full verification chain (lint and types, tests,
  /visual-check for UI, /verdict on the diff) before any commit.
  Construction de bout en bout d'UNE fonctionnalité : analyse, plan court avec OKAY explicite,
  construction par petits pas vérifiés, puis la chaîne de vérification complète (lint et types,
  tests, /visual-check pour l'UI, /verdict sur le diff) avant tout commit.
argument-hint: "<the feature to build end-to-end>"
---

# Bâtir — one feature, end to end, verified

The orchestrator of the builder cycle for a single feature: it walks ANALYSE → PLAN →
BUILD → VERIFY in one continuous flow, and refuses to skip the verification half.
Building is easy; shipping something verified is the job.

## When to use

- A feature that is bigger than `/oneshot` (multiple files, real logic) but does not
  need the full research pipeline of `/plan-and-confirm`
- When the user says "construis X de bout en bout", "fais X proprement", "batis X"

**Not for**: trivial one-file tasks (`/oneshot`), or product-level decisions still
open (`/cadrer` first), or large multi-feature scopes (`/plan-and-confirm` first).

## Phase 1 — Analyse (before any code)

1. Explore the codebase: the files the feature touches, the patterns they follow,
   the helpers that already exist (never duplicate a canonical utility).
2. If an external library API is involved: current docs first (`/read-docs` if
   installed, otherwise the docs-first pipeline). Never guess an API.
3. Independent lookups run in parallel; agents only when they earn their cost.

## Phase 2 — Plan court + OKAY

Present a SHORT plan: target files (with estimated sizes — any file predicted past
250 lines gets a planned split), the approach in 5-8 lines, what is explicitly OUT
of scope, and the verification steps that will run at the end.

**Wait for the explicit OKAY.** No code before it. If the user amends, update and
re-present. For UI work, if `/sketch` is installed and the visual direction is not
settled: sketch first, build what was validated.

## Phase 3 — Build, in small verified increments

- Strictly in scope: nothing the plan did not announce (`stay-in-scope`).
- Every screen handles loading, empty, error, success (`ship-quality`).
- Increment by increment: each one compiles and passes existing tests before the
  next starts. No "big bang then debug".
- New logic gets its test in the same increment, not "later".

## Phase 4 — The verification chain (non-negotiable, in order)

1. **Lint + types** : zero errors (`/fix-errors` if installed, otherwise run the
   project's linter and type-checker and fix everything).
2. **Tests** : the full suite, not just the new ones. A red test stops the flow.
3. **UI changed?** → `/visual-check` on the affected routes (if installed; otherwise
   open the page and verify visually). Loading, empty, error states exercised.
4. **`/verdict` on the diff** (if installed; otherwise apply its standards inline):
   code-judo review, structural blockers. **BLOCK means fix first, then re-run.**
5. Report honestly: what was built, what was verified with what result, what was
   left out and why. Never claim verified what was not run.

## Rules

- The verification chain never gets skipped "because it's a small change" — small
  changes that skip verification are how production breaks.
- Two consecutive failed attempts at the same fix → stop, present the blocker and
  the options (never grind silently).
- Feature complete but the user asked for several → one `/batir` per feature,
  sequentially. Parallelism lives inside a phase, never across features.

## En clair (FR)

Ce skill construit UNE fonctionnalité du début à la fin, dans l'ordre du cycle du
bâtisseur : on analyse d'abord (le code existant, la doc à jour), on présente un
plan court et on attend ton OKAY, on construit par petits pas qui compilent et
passent les tests, puis on déroule la chaîne de vérification complète : zéro erreur
de lint et de types, tous les tests au vert, vérification visuelle si l'interface a
changé, et la revue `/verdict` qui peut bloquer un code correct mais mal structuré.
Rien n'est déclaré fini sans avoir été vérifié, et le rapport final dit exactement
ce qui a été testé et comment.

## Next step

Verification chain green → `/commit`. Merge of a large branch → `/create-pr`
(full pack). Next feature → `/batir` again.

$ARGUMENTS
