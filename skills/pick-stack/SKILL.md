---
name: pick-stack
description: >
  Stack advisor: interviews the user one question at a time about the real need (audience, budget,
  payments, offline, team level), then recommends ONE justified stack plus 1-2 alternatives.
  Conseiller de stack : interroge le besoin une question à la fois (cible, budget, paiements,
  offline, niveau de l'équipe), puis recommande UNE stack argumentée et 1 à 2 alternatives.
argument-hint: "[short description of the project]"
---

# Pick Stack — the need chooses the stack, not the hype

Recommend a tech stack from the actual need — never from what's fashionable. A trendy stack without a justification tied to the need is a wrong answer.

## Step 1 — Interview, ONE question at a time

Ask these questions **one at a time**, waiting for each answer before the next. Skip any already answered by `$ARGUMENTS` or the conversation. For each question, offer your recommended answer as a default.

1. **What?** — showcase site / business app (internal tool, dashboard) / e-commerce / mobile app / API / something else?
2. **Who?** — roughly how many users? Where are they? Slow connections to plan for? Mobile-first?
3. **Hosting budget?** — free / under $10 per month / more?
4. **Payments?** — none / mobile money (Wave, Orange Money, MTN MoMo) / cards / both?
5. **Offline?** — must it work with intermittent connectivity?
6. **Team level?** — novice / intermediate / expert? How many people?
7. **Maintenance?** — who keeps it running after launch? Same team, someone else, nobody?

Facts you can determine yourself (e.g. an existing repo already has a framework), look up — don't ask.

## Step 2 — Recommend

Present:

### The recommendation — ONE stack

For each layer (frontend, backend/data, hosting, payments if relevant): the choice + **one sentence tying it to an answer from the interview**. A line without a justification tied to the need gets deleted.

### 1-2 alternatives, with tradeoffs

For each: when you'd pick it instead, what you gain, what you pay (complexity, cost, lock-in).

### Selection principles (apply and say so)

- **Simplicity first for novices**: fewer moving pieces beats more powerful pieces. One framework + one managed database beats a microservices diagram.
- **Predictable costs**: flag anything that can surprise-bill (per-invocation pricing, egress). Prefer free tiers and flat pricing for small budgets.
- **Accessible hosting**: deployable without a credit card or DevOps expertise when the team is novice.
- **Abundant docs**: prefer tools with large communities and current documentation — the agent AND the human will need them.
- **Context fit**: slow connections → lightweight pages, SSR/static over heavy SPAs; mobile money → providers with real local APIs (e.g. Wave, Orange Money, MTN MoMo aggregators), not Stripe-only assumptions; offline → local-first storage and sync.

## Rules

- ONE question per message during the interview. Never a questionnaire dump.
- NEVER recommend a stack you cannot justify with the user's own answers.
- If the user's existing skills strongly fit a stack (e.g. team knows PHP), weigh that heavily — familiarity is a feature.
- Do not oversell: if a static site covers the need, say so, even if it's boring.

## En clair (FR)

Ce skill vous pose des questions simples, une à la fois (c'est pour qui, quel budget, faut-il encaisser des paiements mobile money, faut-il que ça marche hors ligne, quel est le niveau de l'équipe), puis recommande UNE pile technique adaptée à VOTRE besoin, avec les alternatives et leurs compromis. Jamais de techno à la mode sans raison liée au besoin.

## Next step

→ `/read-docs` on the chosen stack, then `/plan-and-confirm`.

$ARGUMENTS
