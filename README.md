[![npm](https://img.shields.io/npm/v/@james10192/iroko?style=flat)](https://www.npmjs.com/package/@james10192/iroko)
[![license](https://img.shields.io/npm/l/@james10192/iroko?style=flat)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat)](https://nodejs.org/)

# iroko

**Deep roots for building with AI.**

iroko is not a collection of Claude Code components. It is a **guardrail environment for AI-assisted work**: you plant iroko in your setup, and the AI agent makes fewer mistakes, spends fewer tokens, and never drifts out of scope.

The iroko is a great sacred tree of West Africa: deep roots hold the ground, and it is the tree under which the council meets before acting. Same idea here — roots are the guardrails, the council is the plan before the code.

```
npx @james10192/iroko init
```

## Three promises

| Promise | How |
|---|---|
| **Frame it** | The AI never codes something you did not ask for. Plan first, explicit OKAY required (`/plan-and-confirm`, `stay-in-scope`). |
| **Save tokens** | Targeted research before code, agents only when they earn their cost (`token-efficiency`, `/read-docs`). |
| **Verify it** | Nothing ships without an audit: quality gate on every commit, ruthless review on demand (`quality-gate`, `/commit`, `/deep-review`). |

## The builder cycle

Every skill belongs to one step of the cycle, and each one hands over to the next:

```
FRAME  →  ILLUSTRATE  →  DOCUMENT  →  BUILD  →  VERIFY
```

Rules, agents and the hook are **ambient**: always active, watching every step.

## Quickstart

```bash
npx @james10192/iroko init           # default: guide + default packs (22 components)
npx @james10192/iroko init --guide   # beginner pack, CLI prompts in French
npx @james10192/iroko init --full    # everything (24 components)
iroko list                           # see each component's step and pack
```

The **guide pack** is designed to accompany people who are discovering development: a French guided skill (`/demarrer`), plan-before-code, docs-before-guessing, safe commits, and a hook that blocks destructive commands before they run.

## The 24 components

### Frame (cadrer)

| Component | Pack | What it does |
|---|---|---|
| `/demarrer` | guide | Guided mode in French for complete beginners: tiny verified steps, zero jargon. |
| `/plan-and-confirm` | guide | Research agents + critic review + plan. Explicit OKAY required before any code. |
| `/pick-stack` | default | Interviews the real need (budget, audience, offline, payments) then recommends one justified stack. |

### Illustrate (illustrer)

| Component | Pack | What it does |
|---|---|---|
| `/sketch` | default | Shows 3-6 low-fidelity visual options on a local HTML board BEFORE any code. You pick, then we build what you validated. |

### Document (documenter)

| Component | Pack | What it does |
|---|---|---|
| `/read-docs` | guide | Fetches current library docs (ctx7, MCP, web) and applies a reading method instead of guessing APIs. |

### Build (construire)

| Component | Pack | What it does |
|---|---|---|
| `/oneshot` | default | ONE trivial task: explore, code, test. Strictly in scope, stop after 2 failed attempts. |
| `/create-pr` | full | Creates and pushes a PR with auto-generated title and description. |
| `/create-issue` | full | Creates a GitHub issue with labels, template and epic linking. |

### Verify (vérifier)

| Component | Pack | What it does |
|---|---|---|
| `/commit` | guide | Quality-gated commit: stages ONLY the conversation's files, audits the diff, conventional message. |
| `/deep-review` | default | Ruthless structural review: deletes complexity, blocks god files, "correct is not enough". |
| `/fix-errors` | guide | Fixes all lint and type errors. Sequential by default, parallel only past 20 errors. |
| `/visual-check` | default | Opens a browser to visually verify a page: screenshots, accessibility snapshot, issue report. |

### Ambient — rules

| Rule | Pack | What it does |
|---|---|---|
| `quality-gate` | guide | Single source for the 4-axes commit audit, with a plain-language glossary (every verdict explains its terms). |
| `git-safety` | guide | Forbids destructive git and database commands without explicit written approval. Backup before any authorized destructive operation. |
| `stay-in-scope` | guide | Never build beyond what was asked. No unrequested features, file-size thresholds enforced. |
| `token-efficiency` | guide | When to use agents vs direct tools, so context is never wasted. |
| `ship-quality` | default | Every deliverable handles loading, empty, error and success states. No "coming soon". |
| `docs-first` | default | Never guess an API: current docs first (ctx7 → MCP → web search), with a reading method. |
| `global-preferences` | default | Opinionated defaults: pnpm, no Co-Authored-By, monochrome design, no AI slop. Adapt to taste. |

### Ambient — agents and hook

| Component | Pack | What it does |
|---|---|---|
| `critic` (agent) | guide | Technical reviewer with auto-detected lenses: CTO, UX, Security, Performance, Cost. |
| `explore-docs` (agent) | guide | Documentation research via ctx7 CLI and Context7 MCP. |
| `explore-codebase` (agent) | default | Maps patterns and files before implementing a feature. |
| `websearch` (agent) | default | Quick targeted web research for planning and docs skills. |
| `guard-destructive` (hook) | guide | PreToolUse hook that blocks `git reset --hard`, `push --force`, `migrate:fresh`, db wipes, unscoped `rm -rf`... with a clear "ask first" message. |

## Install

```bash
# npx (no install)
npx @james10192/iroko init

# global
pnpm add -g @james10192/iroko
iroko init

# Claude Code plugin
/plugin marketplace add James10192/iroko
/plugin install iroko@iroko
```

```bash
iroko init      # interactive setup (guide + default packs preselected)
iroko list      # installed vs available, with step and pack per component
iroko update    # pull latest from GitHub and re-install
iroko about     # author and links
```

Release notes live in [CHANGELOG.md](./CHANGELOG.md).

Built by [Marcel DJEDJE-LI](https://github.com/James10192).
**Grown in Abidjan · Built for everyone.**

---

## En français

**Des racines profondes pour construire avec l'IA.**

iroko n'est pas une collection de composants Claude Code. C'est **un environnement de garde-fous pour le travail assisté par IA** : vous plantez iroko dans votre configuration, et l'agent IA fait moins d'erreurs, dépense moins de tokens, et ne sort jamais du cadre.

L'iroko est un grand arbre sacré d'Afrique de l'Ouest : ses racines profondes tiennent le sol, et c'est l'arbre sous lequel on tient conseil avant d'agir. Même idée ici : les racines sont les garde-fous, le conseil est le plan avant le code.

```
npx @james10192/iroko init --guide
```

### Trois promesses

| Promesse | Comment |
|---|---|
| **Cadrer** | L'IA ne code jamais quelque chose que vous n'avez pas demandé. Plan d'abord, OKAY explicite obligatoire (`/plan-and-confirm`, `stay-in-scope`). |
| **Économiser** | Recherche ciblée avant le code, agents seulement quand ils valent leur coût (`token-efficiency`, `/read-docs`). |
| **Vérifier** | Rien ne part sans audit : quality gate sur chaque commit, revue impitoyable à la demande (`quality-gate`, `/commit`, `/deep-review`). |

### Le cycle du bâtisseur

Chaque skill appartient à une étape du cycle, et chacune passe le relais à la suivante :

```
CADRER  →  ILLUSTRER  →  DOCUMENTER  →  CONSTRUIRE  →  VÉRIFIER
```

Les rules, les agents et le hook sont **ambiants** : toujours actifs, à chaque étape.

### Démarrage rapide

```bash
npx @james10192/iroko init           # défaut : packs guide + default (22 composants)
npx @james10192/iroko init --guide   # pack débutant, invites du CLI en français
npx @james10192/iroko init --full    # tout (24 composants)
iroko list                           # étape et pack de chaque composant
```

Le **pack guide** est pensé pour accompagner des personnes qui découvrent le développement : un skill d'accompagnement en français (`/demarrer`), le plan avant le code, la doc avant la devinette, des commits sûrs, et un hook qui bloque les commandes destructrices avant qu'elles ne s'exécutent.

### Les 24 composants

**Cadrer** : `/demarrer` (guide, mode accompagné en français, petits pas vérifiés, zéro jargon), `/plan-and-confirm` (guide, agents de recherche + critic + plan, OKAY obligatoire avant tout code), `/pick-stack` (default, interroge le vrai besoin puis recommande une stack argumentée).

**Illustrer** : `/sketch` (default, montre 3 à 6 options visuelles basse fidélité sur une planche HTML locale AVANT d'écrire du code, vous choisissez, on construit ce que vous avez validé).

**Documenter** : `/read-docs` (guide, récupère la doc à jour des bibliothèques et applique une méthode de lecture au lieu de deviner les API).

**Construire** : `/oneshot` (default, UNE tâche triviale : explorer, coder, tester, stop après 2 échecs), `/create-pr` (full, pull request avec titre et description générés), `/create-issue` (full, issue GitHub avec labels et gabarit).

**Vérifier** : `/commit` (guide, commit sous quality gate, stage UNIQUEMENT les fichiers de la conversation), `/deep-review` (default, revue structurelle impitoyable, « correct ne suffit pas »), `/fix-errors` (guide, corrige toutes les erreurs lint et types, séquentiel par défaut), `/visual-check` (default, vérification visuelle dans un navigateur avec captures et rapport).

**Ambiant, les rules** : `quality-gate` (guide, source unique de l'audit 4 axes avec glossaire en langage simple), `git-safety` (guide, interdit les commandes destructrices sans accord écrit, sauvegarde d'abord), `stay-in-scope` (guide, jamais au-delà de la demande), `token-efficiency` (guide, agents ou outils directs, jamais de contexte gaspillé), `ship-quality` (default, chaque livrable gère chargement, vide, erreur, succès), `docs-first` (default, jamais deviner une API), `global-preferences` (default, préférences assumées, à adapter).

**Ambiant, les agents et le hook** : `critic` (guide, relecteur technique multi-angles), `explore-docs` (guide, recherche documentaire), `explore-codebase` (default, cartographie du code avant implémentation), `websearch` (default, recherche web ciblée), `guard-destructive` (guide, hook qui bloque `git reset --hard`, `push --force`, purges de base et `rm -rf` non scopé, avec un message clair : demande d'abord).

### Installation

```bash
# npx, sans installation
npx @james10192/iroko init --guide

# globale
pnpm add -g @james10192/iroko
iroko init
```

```bash
iroko init      # installation interactive (packs guide + default présélectionnés)
iroko list      # installés et disponibles, avec étape et pack
iroko update    # récupère la dernière version depuis GitHub et réinstalle
iroko about     # auteur et liens
```

Les notes de version sont dans [CHANGELOG.md](./CHANGELOG.md).

Construit par [Marcel DJEDJE-LI](https://github.com/James10192).
**Grown in Abidjan · Built for everyone.**

## License

MIT
