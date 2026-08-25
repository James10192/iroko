---
name: cadrer
description: >
  Relentless product interview BEFORE building: one question at a time, a recommended
  answer every time, facts looked up in the code instead of asked, every decision logged,
  nothing built until the shared understanding is confirmed with an explicit OKAY.
  Interrogatoire produit sans complaisance AVANT de construire : une question à la fois,
  une recommandation à chaque fois, les faits cherchés dans le code au lieu d'être demandés,
  chaque décision consignée, rien n'est construit avant un OKAY explicite.
argument-hint: "<the plan, feature or product to grill>"
---

# Cadrer — the interview that hardens a plan

A plan that has not been interrogated is a list of wishes. This skill turns it into a
set of decisions: walk the decision tree branch by branch, resolve the dependencies
between choices one by one, and stop only when nothing important is left implicit.

## When to use

- Before starting a product, a major feature, a redesign, a pricing change
- When the user says "grill me", "challenge ce plan", "on cadre", or brings a vague idea
- Before `/plan-and-confirm` when the WHAT is not yet settled (grilling settles the
  what and the why; plan-and-confirm settles the how)

**Not for**: trivial tasks (use `/oneshot`) or plans already fully decided.

## The five rules (non-negotiable)

1. **One question at a time.** Several questions at once is bewildering; the answer to
   one changes the next. Wait for the answer before continuing.
2. **A recommendation every time.** Never ask a naked question. Present 2-4 options with
   their real trade-offs, mark ONE as recommended, and say why in two sentences. The
   user decides; you take a position.
3. **Facts are looked up, decisions are asked.** If the answer exists in the codebase,
   the docs, the market or the web, go get it (Grep, Read, WebSearch, agents if
   installed) instead of asking. Only DECISIONS belong to the user.
4. **Follow the dependency order.** Ask first the question whose answer changes the most
   downstream choices (what is the product → for whom → business model → scope → stack
   → details). Never ask a detail question while a structural one is open.
5. **Nothing is built until the OKAY.** Grilling produces decisions, not code.

## Step 1 — Map the branches

Read what exists (code, docs, previous notes). List privately the open branches:
positioning, audience, scope v1, business model, distribution, stack, risks. Order
them by dependency weight. Announce the terrain in two sentences, then start.

## Step 2 — Grill, branch by branch

For each question:
- State the context in one or two sentences (what this decision blocks or unblocks).
- Present the options with honest trade-offs — including the cost of the option the
  user probably prefers. Flag what your research found (with sources when web-sourced).
- Recommend one. Wait.
- **Log the decision** before moving on. If an answer invalidates an earlier decision,
  say so immediately and re-open that branch, never silently.

Challenge inconsistencies politely but firmly: "tu as choisi X tout à l'heure, cette
réponse le contredit : lequel des deux tient ?". A grilling that never pushes back is
a form, not an interview.

## Step 3 — The shared understanding

When no important branch is open, present the complete summary: every decision, one
line each, plus the explicit list of what was REJECTED (rejections are decisions too).
Ask for the OKAY. If the user corrects, update and re-present.

## Step 4 — Persist

Write the decisions where the project keeps them (project memory, a `CADRAGE.md`, or
the tool the project uses). A decision that lives only in the conversation dies with it.

## Rules

- Never re-litigate a logged decision unless the user re-opens it or a new FACT
  invalidates it (then say the fact, cite the source, ask once).
- Rejected options are recorded with one line of why: future sessions must not
  re-propose them innocently.
- If the user answers a question with a new idea, log it, park it, finish the current
  branch first. The tree is walked in order.

## En clair (FR)

Avant de construire, on interroge. Ce skill mène un entretien serré : une seule
question à la fois, toujours accompagnée d'une recommandation argumentée, les faits
vérifiés dans le code ou sur internet plutôt que demandés, et chaque décision notée
noir sur blanc. On ne code rien tant que le résumé final n'a pas reçu un OKAY
explicite. C'est ce qui transforme une idée floue en produit cadré, et ce qui évite
de découvrir les questions importantes au milieu du chantier.

## Next step

Decisions locked → `/pick-stack` if the stack is still open (with the default pack),
then `/plan-and-confirm` to plan the build, `/sketch` before any UI.

$ARGUMENTS
