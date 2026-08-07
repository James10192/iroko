# Rule: Stay in Scope — build only what was asked

## When it activates

This rule activates on every implementation task: new feature, bug fix, refactor,
or any change that writes code.

## Principle 1 — Never go beyond the explicit request

- Implement exactly what the user asked. Nothing more.
- No bonus features, no "while I'm at it" improvements, no unrequested refactors.
- No premature abstraction: do not build a generic system for a problem that
  exists only once. Three concrete occurrences before one abstraction.
- If you spot something worth fixing outside the request, SAY it, do not DO it.
  One sentence: "I also noticed X, want me to handle it separately?"
- A fix stays a fix: resist upgrading dependencies, renaming things, or
  reformatting files the task did not touch.

## Principle 2 — One file, one responsibility

**If you need the word "AND" to describe what a file does, split it.**
("This file handles auth AND billing" = two files.)

Size thresholds (lines of code, excluding imports and blank lines):

| Concept | Soft limit | Hard limit | If exceeded |
|---------|-----------|------------|-------------|
| File | 250 | 500 | Split by domain, mandatory |
| Function / method | 30 | 50 | Extract helpers |
| React/UI component | 150 | 250 | Split into sub-components |
| Function parameters | 5 | 7 | Pass an options object |
| Nesting depth | 3 | 4 | Early returns, extract functions |

Warning signs a file has become a "god file":
- It has 3+ logically distinct sections (`// ==== USERS ====`, `// ==== ORDERS ====`)
- You search inside it with Ctrl+F instead of scrolling
- Its name is vague: `utils`, `helpers`, `common`, `manager`, `service`
- You hesitate about where a new function belongs

When you touch an existing file already over the hard limit: split it first
(separate commit), then add your feature.

## Practical workflow

1. Before coding, restate the scope in one sentence. If your sentence contains
   "and also", trim it or ask.
2. When planning, list target files with estimated sizes. Any file predicted
   over 250 LOC gets a planned split up front.
3. When creating a file, name its single domain first. If you cannot, the
   architecture is unclear: stop and clarify.

## Anti-patterns to block

1. "I also added dark mode since I was in the CSS" — nobody asked.
2. A `utils.js` growing past 200 lines — it has become a junk drawer.
3. Wrapping a single API call in a plugin system "for flexibility later".
4. A 600-line component mixing data fetching, state, and three modals.
5. Refactoring a whole module to fix a one-line bug.

## Acceptable exceptions (rare)

- Generated code (API clients, codegen output): size does not matter.
- Pure declarative data (constants, config, lists of routes): fine if logic-free.
- The user explicitly asked for the broader change.

## En clair (FR)

Le plus grand défaut d'une IA qui code : elle en fait trop. Tu demandes un bouton,
elle te livre un bouton, un thème sombre et un système de plugins. Résultat : plus
de code à relire, plus de bugs possibles, plus de tokens dépensés.

Cette règle dit deux choses :

1. L'agent construit UNIQUEMENT ce que tu as demandé. S'il repère autre chose à
   améliorer, il te le signale en une phrase et attend ton accord.
2. Chaque fichier fait UNE seule chose. Si on doit dire « ce fichier gère X ET Y »
   pour le décrire, on le découpe en deux. Un fichier trop gros (plus de 500 lignes)
   est découpé avant d'ajouter quoi que ce soit dedans.

Des fichiers petits et ciblés, c'est du code que toi (et l'IA) pouvez comprendre
d'un coup d'oeil, et donc moins d'erreurs.
