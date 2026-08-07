---
name: deep-review
description: >
  Ruthless structural review of the branch diff: hunts for "code judo" moves that DELETE complexity,
  presumptive blockers (files past 1000 lines, spaghetti branching), inverted approval bar.
  Revue structurelle impitoyable du diff de la branche : cherche les reformulations qui SUPPRIMENT
  la complexité, blockers présomptifs (fichier >1000 lignes, spaghetti), barre d'approbation inversée.
disable-model-invocation: true
---

# Deep Review

Run an unusually strict review of the current branch's changes, focused on implementation quality, maintainability, abstraction quality, and codebase health.

Above all, be **ambitious** about code structure. Do not merely identify local cleanup opportunities. Actively search for "code judo" moves: restructurings that preserve behavior while making the implementation dramatically simpler, smaller, more direct, and more elegant.

## Core Prompt

Start from this baseline:

> Perform a deep code quality audit of the current branch's changes.
> Rethink how to structure the changes to meaningfully improve code quality without impacting behavior.
> Improve abstractions and modularity, reduce spaghetti code, improve succinctness and legibility.
> Be ambitious: if there is a clear path to improving the implementation that involves restructuring part of the codebase, go for it.
> Be extremely thorough and rigorous. Measure twice, cut once.

## Non-Negotiable Standards

0. **Code judo — delete complexity, don't move it.**
   - Look for reframings that make whole branches, helpers, modes, conditionals, or layers disappear entirely.
   - **Reject any refactor that moves complexity around without reducing it.** A "cleaner version of the same messy idea" is not an improvement.
   - Prefer the solution that makes the code feel inevitable in hindsight.

1. **Presumptive blocker: a file crossing 1000 lines.**
   - A PR pushing a file from under 1000 lines to over 1000 lines is a blocker by default.
   - Prefer extracting helpers, subcomponents, or modules first. Only waive with a compelling structural reason and a still clearly organized file.

2. **No spaghetti growth — every ad-hoc `if` grafted onto an existing flow is a design problem.**
   - New scattered special cases, one-off booleans, or branches inserted into unrelated flows are design problems, not stylistic nits.
   - Push the logic into a dedicated abstraction, helper, state machine, or module instead of tangling an existing path.

3. **Bias toward cleaning the design, not just accepting working code.**
   - Do not rubber-stamp "it works" implementations that leave the codebase messier.

4. **Prefer direct, boring, maintainable code over hacky or magical code.**
   - Flag thin abstractions, identity wrappers, or pass-through helpers that add indirection without buying clarity.

5. **Push on type and boundary cleanliness.**
   - Question unnecessary optionality, `unknown`, `any`, or cast-heavy code when a clearer boundary could exist.
   - If a branch relies on silent fallback to paper over an unclear invariant, make the boundary explicit instead.

6. **Keep logic in the canonical layer and reuse existing helpers.**
   - Call out feature logic leaking into shared paths, and bespoke helpers duplicating a canonical utility.

7. **Flag unnecessary sequential orchestration and non-atomic updates** when the cleaner structure is obvious.

## Primary Review Questions

- Is there a code-judo move that would make this dramatically simpler?
- Can this be reframed so fewer concepts, branches, or helper layers are needed?
- Did the diff add branching complexity where a better abstraction should exist?
- Did this change enlarge a file past a healthy size boundary?
- Is this logic living in the right file and layer?
- Is this abstraction actually earning its keep, or is it just a wrapper?
- Did the diff introduce casts, optionality, or ad-hoc shapes that obscure the real invariant?

## What to Flag Aggressively

- A complicated implementation where a cleaner reframing could delete whole categories of complexity.
- Refactors that move code around but fail to reduce the number of concepts a reader must hold in their head.
- A file crossing 1000 lines due to the PR.
- New conditionals bolted onto unrelated code paths; one-off booleans or nullable modes complicating existing flow.
- Feature-specific logic leaking into general-purpose modules.
- Thin wrappers, magic handling, unnecessary casts, copy-pasted logic.
- "Temporary" branching that is likely to become permanent debt.

## Preferred Remedies

- Delete a whole layer of indirection rather than polishing it.
- Reframe the state model so conditionals disappear instead of getting centralized.
- Turn special-case logic into a simpler default flow with fewer exceptions.
- Split a large file into smaller focused modules.
- Replace condition chains with a typed model or explicit dispatcher.
- Reuse the existing canonical helper instead of introducing a near-duplicate.

Do not be satisfied with "maybe rename this" feedback when the real issue is structural.

## Review Tone — stock phrasings

Be direct, serious, and demanding. Do not soften major maintainability issues into mild suggestions.

- `this pushes the file past 1k lines. can we decompose this first?`
- `this adds another special-case branch into an already busy flow. can we move this behind its own abstraction?`
- `this works, but it makes the surrounding code more spaghetti. let's keep the behavior and restructure the implementation.`
- `this feels like feature logic leaking into a shared path. can we isolate it?`
- `this abstraction seems unnecessary. can we just keep the direct flow?`
- `i think there's a code-judo move here that makes this much simpler. can we reframe this so these branches disappear?`
- `this refactor moves complexity around, but doesn't really delete it. is there a way to make the model itself simpler?`

## Output Expectations

Prioritize findings: structural regressions first, then missed simplifications, spaghetti growth, boundary/type problems, file-size concerns, then legibility. Prefer a small number of high-conviction comments over a long list of cosmetic notes.

## Approval Bar (inverted)

**Correct behavior is NOT enough.** Approve only when ALL of these hold:

- no clear structural regression
- no obvious missed opportunity for a dramatically simpler implementation
- no unjustified file-size explosion
- no spaghetti growth from special-case branching
- no hacky or magical abstraction that makes the code harder to reason about
- no unnecessary wrapper/cast/optionality churn obscuring the real design
- no architecture-boundary leak or avoidable canonical-helper duplication

Treat these as presumptive blockers unless clearly justified by the author:

- the PR preserves incidental complexity when a plausible code-judo move would delete it
- the PR pushes a file from below 1000 lines to above 1000 lines
- the PR adds ad-hoc branching that makes an existing flow more tangled
- the PR scatters feature checks across shared code
- the PR duplicates an existing helper or puts logic in the wrong layer

If the bar is not met, leave explicit, actionable feedback and push for the cleaner decomposition.

## En clair (FR)

À utiliser avant de merger un gros changement (grosse feature, refactor, plusieurs fichiers). Cette revue ne se contente pas de vérifier que « ça marche » : elle cherche si le changement rend le code plus difficile à maintenir, et s'il existe une façon nettement plus simple d'obtenir le même comportement. Un code correct mais qui salit la base est refusé.

## Next step

Findings to fix → fix them, then `/commit`. Bar met → `/create-pr`.
