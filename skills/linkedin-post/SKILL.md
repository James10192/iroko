---
name: linkedin-post
description: Generate a LinkedIn post from current work context (feature, bug fix, architecture decision). Use when the user says "linkedin", "post linkedin", "write a post", or "/linkedin-post". Pulls from conversation context, git history, or Claude Code memory to find interesting content, then researches current tech trends to enrich the post.
argument-hint: "[sujet optionnel]"
---

# LinkedIn Post Generator

Generate authentic, professional LinkedIn posts based on real development work.

Auto-charger l'historique LinkedIn du projet courant :
!`slug=$(pwd | sed 's|:|--|' | sed 's|/|-|g' | sed 's|\\\\|-|g'); file="$HOME/.claude/projects/${slug}/memory/linkedin_posts.md"; [ -f "$file" ] && cat "$file" || echo "No linkedin_posts.md found"`

## Sources de contenu (par priorite)

1. **Argument explicite** — si l'utilisateur passe un sujet via ``
2. **Contexte conversation** — feature en cours, bug fix, architecture decision dans la session active
3. **Git recent** — analyser `git log --oneline -20` du repo courant pour trouver du travail recent interessant
4. **Memoire Claude Code** — lire les fichiers memoire du projet courant dans `~/.claude/projects/*/memory/` pour trouver des sujets marquants
5. **Historique LinkedIn** — lire `linkedin_posts.md` pour eviter de repeter un sujet, template ou angle

## Workflow

### Etape 1 : Identifier le sujet

Determiner le type de contenu :
- **Feature showcase** — nouvelle fonctionnalite implementee
- **Bug fix** — probleme resolu avec un angle pedagogique
- **Architecture decision** — choix technique avec tradeoffs
- **Milestone** — progres significatif sur un projet
- **Tendance + experience** — lier une tendance tech a du vecu

Si aucun sujet clair, proposer 3 options a l'utilisateur basees sur le contexte disponible.

Avant de fixer le sujet, ouvrir `linkedin_posts.md` du projet courant et verifier :
- le dernier sujet publie
- le dernier template utilise
- les hashtags recurrents
Eviter de reutiliser le meme template ou le meme sujet 2 fois de suite.
Regle stricte : si le dernier post partage 2 elements sur 3 (sujet, angle, hashtags), changer au moins 2 elements.

### Etape 2 : Extraire la matiere

Pour le sujet choisi, collecter :
- Le probleme concret (pas abstrait)
- La solution technique (avec juste assez de detail)
- Les chiffres reels (nombre d'utilisateurs, lignes de code, nombre de tables, etc.)
- Le "pourquoi c'etait difficile" — c'est ce qui rend le post interessant
- La lecon apprise ou l'insight non-obvious

Lire [references/profile-marcel.md](references/profile-marcel.md) pour le profil complet et les projets.
Si ces references n'existent pas, utiliser `~/.claude/projects/*/memory/user_profile.md` et `project_*.md`.

### Etape 3 : Enrichir avec tendances et data

**D'abord** lire les fichiers de recherche pre-existants :
- [references/linkedin-best-practices.md](references/linkedin-best-practices.md) — algorithme, longueur, engagement
- [references/tech-trends-2026.md](references/tech-trends-2026.md) — tendances par techno, hashtags
Si ces references n'existent pas, utiliser la meilleure source publique disponible.

**Ensuite** lancer 1-2 recherches web ciblees (WebSearch) pour :
- Trouver des chiffres/stats frais sur la techno du post
- Verifier si le sujet est dans l'actualite (ca amplifie l'engagement)
- Trouver des hashtags tendance specifiques au moment

Recherches utiles :
- `"[techno] trends 2026"` (ex: "Laravel multi-tenant SaaS 2026")
- `"[sujet] linkedin developers"` (ex: "AI tool calling production")
- `"[contexte local]"` (ex: "mobile money Cote d'Ivoire developers")

### Etape 4 : Rediger le post

Lire [references/post-templates.md](references/post-templates.md) pour les templates et regles de formatage.

Regles absolues :
- **Francais** par defaut (sauf si le sujet est clairement international)
- **Accroche killer** — les 2 premieres lignes doivent donner envie de cliquer "voir plus"
- **Probleme concret avant solution** — jamais "j'ai fait X", toujours "voici le probleme, voici comment je l'ai resolu"
- **Chiffres reels** — pas de "plusieurs", "beaucoup", "des milliers"
- **Pas de jargon vide** — pas de "leverage", "cutting-edge", "revolutionnaire"
- **Pas de fausse humilite** — un SaaS avec 3000 users n'est pas un "petit projet"
- **Pas de emojis excessifs** — 0 a 2 max, et seulement si ca sert le propos
- **Question ouverte en fin** — pour engager la discussion
- **3-5 hashtags** pertinents en fin de post
- **800-1500 caracteres** ideal
- **PROTECTION REPUTATION** — REGLE CRITIQUE : ne JAMAIS formuler un post de maniere a laisser entendre que l'auteur, son equipe ou sa startup vibecode, fait des erreurs, ou a des pratiques de mauvaise qualite. Quand on parle d'un bug ou d'une lecon apprise :
  - Presenter comme une observation de l'industrie ("un pattern que je vois"), pas "ca nous est arrive"
  - Si on mentionne le projet/startup, c'est pour partager des SOLUTIONS et bonnes pratiques, jamais les problemes
  - Framing correct : "Voici ce qu'on fait chez [startup] pour eviter X" — pas "On a eu le bug X"
  - L'auteur et sa startup doivent toujours apparaitre comme des experts qui maitrisent, pas comme des victimes
  - Meme si le bug est reel, le reframer en "constat industrie + voici nos garde-fous" plutot qu'en "on a galere"

### Etape 5 : Presenter au user et proposer la publication

Afficher :
1. Le post formate, pret a copier-coller
2. Les tendances trouvees qui ont enrichi le post
3. Variante courte (si le post depasse 1200 chars) ou variante anglaise (si pertinent)
4. **Proposer de publier directement** : "Tu veux que je le publie sur ton LinkedIn maintenant ?"

Si l'utilisateur confirme la publication :
- Utiliser le MCP server LinkedIn (`linkedin`) pour poster directement
- Chercher le tool MCP approprie pour creer un post (ex: `create_post`, `publish_post`, etc.)
- Passer le contenu du post tel quel (texte brut, pas de markdown)
- Confirmer la publication avec le lien du post si disponible
- Mettre a jour le statut en memoire de "Propose" a "Publie"

Si l'utilisateur refuse ou prefere copier-coller, ne rien faire de plus.

Option alternative recommandee (si MCP LinkedIn non configure) : creer un draft Typefully via `typefully-cli`.
Workflow Typefully :
1. `typefully-cli auth test`
2. `typefully-cli social-sets list --json` pour trouver l'ID
3. `typefully-cli drafts create <social-set-id> --text "..." --platform linkedin`
4. Retourner le `private_url` du draft

Helper script (Windows) :
- `powershell -NoProfile -File .claude/skills/linkedin-post/scripts/create_typefully_draft.ps1 -SocialSetId <id> -FilePath C:\path\post.txt`

Bonnes pratiques Typefully :
- Pour texte multi-lignes, utiliser un fichier temporaire et `--text` avec contenu brut.
- Verifier que seule la plateforme LinkedIn est active.
- Ne pas publier directement sans confirmation explicite.

**Note** : Le MCP server LinkedIn doit etre configure et authentifie. Si le token est expire (~59 jours), indiquer a l'utilisateur de relancer l'auth OAuth :
```
cd $HOME/linkedin-mcp
$env:LINKEDIN_CLIENT_ID="YOUR_CLIENT_ID"; $env:LINKEDIN_CLIENT_SECRET="YOUR_CLIENT_SECRET"; .venv\Scripts\linkedin-mcp-auth oauth
```

### Etape 6 : Sauvegarder en memoire

Apres chaque post genere, mettre a jour le fichier memoire `linkedin_posts.md` dans le repertoire memoire du projet (`~/.claude/projects/*/memory/`).

Avant d'ajouter un nouveau post, comparer sujet + angle + template aux 2 derniers posts et ajuster pour eviter repetition.

Pour chaque post, enregistrer :
- **Numero** du post (incrementer)
- **Date** (date du jour)
- **Sujet** (resume en 1 ligne)
- **Template** utilise (numero + nom)
- **Angle** (resume de l'approche)
- **Langue** (Francais / Anglais)
- **Hashtags** utilises
- **Longueur** approximative en caracteres
- **Statut** (Propose / Publie)
- **Fingerprint** (Sujet|Angle|Hashtags, en minuscule)

Cela permet de :
- Eviter de repeter le meme template 2 fois de suite
- Eviter de repeter le meme sujet trop souvent
- Suivre l'evolution du personal branding
- Varier les angles et les formats

Si le fichier memoire n'existe pas encore, le creer avec le format frontmatter standard. Si `MEMORY.md` n'existe pas, le creer aussi avec un lien vers `linkedin_posts.md`.

## Projets et technos de reference

| Projet | Stack | Mot-cle |
|--------|-------|---------|
| KLASSCI v2 | Laravel 12, Blade, Alpine.js, DomPDF, Claude Haiku | SaaS EdTech multi-tenant |
| KLASSCI College | FastAPI, Next.js 15, shadcn/ui, TanStack Query | Rewrite moderne |
| E-pagne | Next.js 16, Convex, Tailwind v4, Recharts | PWA Fintech africaine |
| Kalga | FastAPI, Node.js Baileys, DeepSeek | Commerce WhatsApp IA |

## References

- **[references/profile-marcel.md](references/profile-marcel.md)** — Profil complet, projets, technos, style de contenu
- **[references/post-templates.md](references/post-templates.md)** — 10 templates varies + regles de formatage LinkedIn
- **[references/linkedin-best-practices.md](references/linkedin-best-practices.md)** — Algorithme 2026, longueur optimale (1300-1900 chars), engagement, personal branding dev
- **[references/tech-trends-2026.md](references/tech-trends-2026.md)** — Tendances Laravel, AI agents, Fintech Afrique, EdTech, Next.js, hashtags par domaine
