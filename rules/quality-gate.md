# Rule: Quality Gate

## When it activates

This rule activates AUTOMATICALLY when:
- The user asks to commit (`/commit`, "commit", "git commit", "push")
- You are about to run a `git commit`
- A skill (e.g. `/commit`) references the quality gate — this file is the single source of truth for the 4-axis audit; skills must reference it, never copy it

## Before ANY commit

### Step 1 — Memory lookup

Search the current project's memory (`memory/MEMORY.md`) for notes relevant to the diff.
If the project has specific conventions (architecture, patterns), load them.

### Step 2 — 4-axis audit

Analyze the diff (`git diff --cached` or `git diff`) on these 4 axes:

**1. Architecture**
- Does the code follow the best architectural solution available?
- God classes? Mixed responsibilities? Existing pattern ignored?
- Verdict: PASS / WARN / BLOCK

**2. Quality vs Speed**
- Was quality sacrificed for speed?
- N+1 queries? Duplicated code? Missing validation?
- Debug code left behind (`dd()`, `console.log`, `var_dump`)?
- Verdict: PASS / WARN / BLOCK

**3. Production-grade**
- Is the code ready for production?
- Exposed stack traces? Unprotected routes? Missing transactions?
- Hardcoded secrets? Raw exception messages shown to users?
- Verdict: PASS / WARN / BLOCK

**4. SOLID (Liskov focus)**
- Are SOLID principles respected?
- Parent class contracts violated? Roles hardcoded instead of permission checks?
- God controllers? Interfaces not honored?
- Verdict: PASS / WARN / BLOCK

### Step 3 — Final verdict

**All PASS** → Commit normally.

**At least 1 WARN** → Show the warnings to the user, then commit if confirmed.

**At least 1 BLOCK** → DO NOT COMMIT. Show the critical issues and propose fixes.

### Exemptions

Skip the audit if the diff is:
- Only `.md` files, `.json` config, or `.env.example`
- Fewer than 5 changed lines in a single file
- Deletions only (cleanup)

## Output format

```
## Quality Gate — Pre-Commit Audit

| Axis | Verdict | Detail |
|------|---------|--------|
| Architecture | PASS/WARN/BLOCK | ... |
| Quality vs Speed | PASS/WARN/BLOCK | ... |
| Production-grade | PASS/WARN/BLOCK | ... |
| SOLID | PASS/WARN/BLOCK | ... |

→ Final verdict: PASS / WARN (confirm?) / BLOCK (fix first)
```

**Every WARN or BLOCK detail MUST include the plain-language explanation from the
glossary below, not just the technical term.** Never output "BLOCK — Liskov violation"
alone; output "BLOCK — Liskov violation (a child class breaks the promise its parent
made, so code that worked before will now crash)".

## Glossary / En clair

Plain-language definitions for every term the audit can use. Quote these in verdicts.

### God class / god file
- **EN**: One file or class that does too many unrelated things at once. Hard to read, hard to change safely.
- **FR**: Un fichier ou une classe qui fait trop de choses sans rapport entre elles. Difficile à lire, risqué à modifier.

### N+1 query
- **EN**: The code asks the database once for a list, then once more for EACH item in the list. 100 items = 101 queries instead of 2. It works, but it gets slow fast.
- **FR**: Le code interroge la base une fois pour une liste, puis une fois de plus pour CHAQUE élément. 100 éléments = 101 requêtes au lieu de 2. Ça marche, mais ça devient très lent.

### Missing validation
- **EN**: The code trusts whatever the user sends without checking it. A wrong or malicious value can corrupt data or crash the app.
- **FR**: Le code fait confiance à ce que l'utilisateur envoie sans le vérifier. Une valeur fausse ou malveillante peut corrompre les données ou faire planter l'application.

### Debug code left behind
- **EN**: Temporary print/log lines (`console.log`, `dd()`, `var_dump`) used while testing, forgotten in the final code. They leak internal details and clutter output.
- **FR**: Des lignes d'affichage temporaires (`console.log`, `dd()`, `var_dump`) utilisées pendant les tests et oubliées dans le code final. Elles exposent des détails internes.

### Exposed stack trace
- **EN**: When something crashes, the raw technical error (file paths, code lines, sometimes secrets) is shown to the end user instead of a friendly message. Attackers love these.
- **FR**: Quand un truc plante, l'erreur technique brute (chemins de fichiers, lignes de code, parfois des secrets) s'affiche à l'utilisateur au lieu d'un message propre. Les attaquants adorent.

### Hardcoded secret
- **EN**: A password, API key, or token written directly in the code instead of an environment variable. Anyone who reads the code (or the git history) owns your account.
- **FR**: Un mot de passe, une clé API ou un token écrit en dur dans le code au lieu d'une variable d'environnement. Quiconque lit le code (ou l'historique git) possède votre compte.

### Unprotected route
- **EN**: A page or API endpoint anyone can call without being logged in or authorized, giving access to data or actions they should not have.
- **FR**: Une page ou un endpoint API que n'importe qui peut appeler sans être connecté ni autorisé, donnant accès à des données ou actions interdites.

### Missing transaction
- **EN**: Several database writes that must succeed or fail TOGETHER are run separately. If one fails midway, the data is left half-updated and inconsistent.
- **FR**: Plusieurs écritures en base qui doivent réussir ou échouer ENSEMBLE sont lancées séparément. Si l'une échoue en cours de route, les données restent à moitié modifiées.

### SOLID
- **EN**: Five classic design principles that keep code easy to change. The audit focuses on the "L" (Liskov, below); the others boil down to: one job per piece, extend rather than modify, depend on contracts not details.
- **FR**: Cinq principes classiques de conception qui gardent le code facile à faire évoluer. L'audit se concentre sur le « L » (Liskov, ci-dessous) ; les autres se résument à : une responsabilité par élément, étendre plutôt que modifier, dépendre de contrats et pas de détails.

### Liskov violation
- **EN**: A child class breaks the promise its parent made (different behavior, thrown errors, ignored parameters). Code written against the parent now breaks when given the child.
- **FR**: Une classe enfant casse la promesse faite par sa classe parente (comportement différent, erreurs inattendues, paramètres ignorés). Le code écrit pour la parente casse quand on lui donne l'enfant.

### Hardcoded role check
- **EN**: The code asks "is this user an admin?" by name instead of "does this user have permission X?". Adding a new role later means hunting every check in the codebase.
- **FR**: Le code demande « cet utilisateur est-il admin ? » au lieu de « a-t-il la permission X ? ». Ajouter un nouveau rôle plus tard oblige à chasser chaque vérification dans tout le code.

### Premature abstraction
- **EN**: Building a generic, flexible system for a problem that only exists once. Extra complexity today for a future that may never come.
- **FR**: Construire un système générique et flexible pour un problème qui n'existe qu'une seule fois. De la complexité en plus aujourd'hui pour un futur qui n'arrivera peut-être jamais.
