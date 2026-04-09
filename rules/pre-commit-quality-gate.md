# Rule: Pre-Commit Quality Gate

## Quand s'active

Cette rule s'active AUTOMATIQUEMENT quand :
- L'utilisateur demande de commit (`/commit`, "commit", "git commit", "push")
- Tu es sur le point d'exécuter un `git commit`

## Avant TOUT commit

### Étape 1 — Recherche mémoire

Chercher dans les mémoires du projet courant (`memory/MEMORY.md`) les fichiers pertinents au diff.
Si le projet a des conventions spécifiques (architecture, patterns), les charger.

### Étape 2 — Audit 4 axes

Analyser le diff (`git diff --cached` ou `git diff`) sur ces 4 axes :

**1. Architecture**
- Le code suit-il la meilleure solution architecturale ?
- God classes ? Responsabilités mélangées ? Pattern existant ignoré ?
- Verdict : PASS / WARN / BLOCK

**2. Qualité vs Vitesse**
- La qualité a-t-elle été sacrifiée pour la vitesse ?
- N+1 queries ? Code dupliqué ? Validation manquante ?
- Debug code laissé (`dd()`, `console.log`, `var_dump`) ?
- Verdict : PASS / WARN / BLOCK

**3. Production-grade**
- Le code est-il prêt pour la production ?
- Stack traces exposées ? Routes non protégées ? Transactions manquantes ?
- Secrets hardcodés ? Exception messages brutes ?
- Verdict : PASS / WARN / BLOCK

**4. SOLID (Liskov focus)**
- Les principes SOLID sont-ils respectés ?
- Contrats de classes parentes violés ? hasRole() hardcodé au lieu de permissions ?
- God controllers ? Interfaces non respectées ?
- Verdict : PASS / WARN / BLOCK

### Étape 3 — Verdict

**Tous PASS** → Commit normalement.

**Au moins 1 WARN** → Afficher les warnings à l'utilisateur, puis commit si confirmé.

**Au moins 1 BLOCK** → NE PAS COMMIT. Afficher les issues critiques et proposer des fixes.

### Exemptions

Skip l'audit si le diff est :
- Uniquement des fichiers `.md`, `.json` config, ou `.env.example`
- Moins de 5 lignes changées dans 1 seul fichier
- Uniquement des suppressions (cleanup)

## Format de sortie

```
## Quality Gate — Pre-Commit Audit

| Axe | Verdict | Detail |
|-----|---------|--------|
| Architecture | PASS/WARN/BLOCK | ... |
| Qualité vs Vitesse | PASS/WARN/BLOCK | ... |
| Production-grade | PASS/WARN/BLOCK | ... |
| SOLID | PASS/WARN/BLOCK | ... |

→ Verdict final : PASS / WARN (confirm?) / BLOCK (fix first)
```
