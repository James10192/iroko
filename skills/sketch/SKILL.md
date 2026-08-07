---
name: sketch
description: >
  Show visual options BEFORE writing any code: generates a local HTML board with 3-6 low-fidelity
  wireframe directions, the user picks one, then the plan starts from the chosen option.
  Montre des options visuelles AVANT d'écrire du code : un fichier HTML local avec 3 à 6 croquis
  basse fidélité, l'utilisateur choisit, puis le plan démarre sur l'option retenue.
argument-hint: "<what to build — page, feature, app>"
---

# Sketch — see it before you build it

When the user describes something to build (a page, a feature, an app screen), do NOT start coding. Generate a **sketch board**: one self-contained local HTML file showing 3-6 visibly different directions, and ask the user to pick one BEFORE any production code is written.

## When to use

- The user describes a UI to build and no design exists yet.
- The user says "show me options", "des variantes", "à quoi ça pourrait ressembler".
- Before `/plan-and-confirm` on any feature with a visual surface.

Do NOT use for pure backend work, or when a validated design/mockup already exists.

## Step 1 — Understand the ask

From `$ARGUMENTS` and the conversation, extract: what the thing is, who uses it, the 2-3 key pieces of content or actions it must surface. If a decisive point is unclear (e.g. "is this mobile-first?"), ask ONE question, then proceed.

## Step 2 — Generate the board

Write ONE self-contained HTML file at:

```
.iroko/sketches/<slug>.html
```

(`<slug>` = short kebab-case of the ask, e.g. `login-page.html`. Create the directory if needed. Inline CSS only, no external assets, no JS unless a sketch needs a trivial toggle.)

### Board rules

- **3 to 6 options, in a single VERTICAL sequence**: one direction per row, full available width. Never a multi-column grid of options.
- **Low fidelity, wireframe style**: boxes, simple labels, rough placeholders, arrows, color swatches, short notes. Enough to compare ideas, NOT enough to look like a finished implementation.
- **Each option visibly different** — in layout, hierarchy, or concept. Six variations of the same layout with different colors is a failed board.
- **One-line tradeoff note under each option** ("dense, scans fast, weak on mobile" / "généreux, lisible, scroll long").
- **Zero superfluous chrome**: no masthead, no hero, no capability recap, no marketing copy above the options. A compact title line is enough. Start directly with option 1.
- A recommendation is optional, evidence-based, and comes AFTER all options — never lead with "Best fit" or a ranking.

### Anti-slop rules (mandatory)

- No gradient orbs, no glassmorphism, no random bento grids, no dark-SaaS template look, no animated counters.
- Monochrome + at most 1 accent color per option.
- No lorem-ipsum walls: placeholder labels say what the content IS ("nom du produit", "prix", "CTA acheter").

## Step 3 — Ask the user to choose

Tell the user the file path and how to open it (double-click / `start .iroko/sketches/<slug>.html`). Then ask:

> Which direction? (1-N, or "mix of 2 and 4", or "none — here's what's missing")

**Do NOT write any production code until the user has chosen.** If the user asks for changes, edit the board and ask again.

## Step 4 — Record the choice

Once chosen, restate the selected option in 2-3 lines (layout, hierarchy, accent) so it becomes the visual contract for the plan.

## En clair (FR)

Avant de coder une interface, ce skill dessine plusieurs directions possibles dans un fichier HTML local que vous ouvrez dans votre navigateur. Vous choisissez celle qui vous parle, et c'est SEULEMENT après votre choix que l'agent planifie puis code. On ne découvre plus le design une fois le code écrit.

## Next step

→ `/plan-and-confirm` with the chosen option as the visual contract.

$ARGUMENTS
