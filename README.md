# Iroko

> Configuration Claude Code d'un dev full-stack Afrique de l'Ouest. Rules, skills, agents, hooks, sons de notification.

L'iroko est le bois noble d'Afrique de l'Ouest : durable, solide, la fondation sur laquelle tout se construit. Cette config est ma fondation pour Claude Code.

## Ce que c'est

Ma configuration globale `~/.claude/` pour [Claude Code](https://docs.anthropic.com/en/docs/claude-code), le CLI d'Anthropic. Tout ce qui fait tourner mon workflow quotidien sur 4 projets SaaS en parallele.

## Structure

```
iroko/
├── rules/                    # 5 regles globales (chargees dans TOUTES les conversations)
│   ├── marcel-global-preferences.md    # Git, design, code quality, infra
│   ├── parallel-agents.md              # Quand et comment paralleliser les agents
│   ├── pre-commit-quality-gate.md      # Audit 4 axes avant chaque commit
│   ├── token-efficiency.md             # Quand utiliser agents vs outils directs
│   └── use-available-tools.md          # ctx7, WebSearch, gh — jamais deviner les APIs
│
├── skills/                   # 23 skills (commandes /slash)
│   ├── commit/               # /commit — quality-gated, audit 4 axes avant commit
│   ├── plan-and-confirm/     # /plan-and-confirm — explore + critic + plan + OKAY gate
│   ├── find-doc/             # /find-doc — ctx7 CLI + MCP + WebSearch pipeline
│   ├── linkedin-post/        # /linkedin-post — genere un post depuis le contexte de travail
│   ├── visual-check/         # /visual-check — screenshot avec dev-browser
│   ├── create-pr/            # /create-pr — PR avec titre et description auto
│   ├── create-issue/         # /create-issue — issue GitHub avec labels
│   ├── worktree-start/       # /worktree-start — branche isolee depuis une issue
│   ├── worktree-finish/      # /worktree-finish — cleanup apres merge
│   ├── convex-cli/           # /convex-cli — init Convex non-interactif
│   ├── merge/                # /merge — resolution conflits context-aware
│   ├── fix-errors/           # /fix-errors — fix ESLint + TS en parallele
│   ├── fix-grammar/          # /fix-grammar — correction orthographe
│   ├── fix-pr-comments/      # /fix-pr-comments — implementer les retours PR
│   ├── apex/                 # /apex — APEX methodology (Melvynx)
│   ├── workflow-apex-free/   # Version free d'APEX
│   ├── ralph-loop/           # /ralph-loop — coding autonome pendant que tu dors
│   ├── oneshot/              # /oneshot — implementation ultra-rapide
│   ├── ultrathink/           # /ultrathink — reflexion profonde, mode artisan
│   ├── claude-memory/        # /claude-memory — optimiser CLAUDE.md
│   ├── skill-creator/        # /skill-creator — creer des skills
│   ├── subagent-creator/     # /subagent-creator — creer des subagents
│   └── prompt-creator/       # /prompt-creator — prompt engineering
│
├── agents/                   # 22 agents (subagents specialises)
│   ├── critic.md             # Reviewer technique multi-lentilles (CTO/UX/Security)
│   ├── explore-codebase.md   # Exploration approfondie de codebase
│   ├── explore-docs.md       # Recherche documentation avec ctx7
│   ├── websearch.md          # Recherche web ciblee
│   ├── linkedin-post.md      # Generation posts LinkedIn
│   ├── action.md             # Execution conditionnelle d'actions
│   └── gsd-*.md              # 16 agents GSD (Get Shit Done)
│
├── hooks/                    # 5 hooks (declencheurs automatiques)
│   ├── monitor-session.sh    # Monitoring session (Stop, Permission, Notification)
│   ├── notify-workflow.sh    # Notifications apres commandes Bash
│   ├── gsd-check-update.js   # Verifie les MAJ GSD au demarrage
│   ├── gsd-context-monitor.js# Monitore le contexte GSD
│   └── gsd-statusline.js     # Statusline avec stats session
│
├── scripts/                  # Outils custom
│   ├── command-validator/    # Valide les commandes Bash avant execution
│   └── statusline/           # Statusline custom avec tracking depenses
│
├── song/                     # Sons de notification
│   ├── finish.mp3            # Joue quand Claude finit une tache
│   └── need-human.mp3        # Joue quand Claude a besoin d'input
│
├── settings.json             # Configuration globale (sanitisee, sans credentials)
└── package.json
```

## Rules (5)

Les rules sont chargees automatiquement dans chaque conversation Claude Code.

| Rule | Description |
|------|-------------|
| **marcel-global-preferences** | Git (pas de Co-Authored-By, pnpm only), design (pas d'AI slop, 1 accent color), contenu en francais, infra budget-first |
| **parallel-agents** | Max 4 agents paralleles, lancer en un seul message, synthetiser les resultats |
| **pre-commit-quality-gate** | Audit 4 axes obligatoire avant commit : Architecture, Qualite vs Vitesse, Production-grade, SOLID |
| **token-efficiency** | Grep/Glob pour les recherches simples, agents pour l'exploration multi-fichiers |
| **use-available-tools** | ctx7 CLI avant de coder avec une lib externe, gh pour GitHub, jamais deviner une API |

## Skills custom (13)

Ces skills sont les miens. Les autres viennent de tiers (voir Credits).

| Skill | Commande | Description |
|-------|----------|-------------|
| **commit** | `/commit` | Audit qualite 4 axes + commit conventionnel + push. Bloque si CRITICAL. |
| **plan-and-confirm** | `/plan-and-confirm` | Critic + 3 agents recherche en parallele, plan detaille, gate OKAY obligatoire |
| **find-doc** | `/find-doc` | Pipeline : ctx7 CLI → ctx7 MCP → WebSearch → rapport structure |
| **linkedin-post** | `/linkedin-post` | Genere un post LinkedIn depuis le contexte (git, conversation, tendances) |
| **visual-check** | `/visual-check` | Lance dev-browser, screenshot, verification visuelle post-implementation |
| **create-pr** | `/create-pr` | PR GitHub avec titre auto, description structuree, push |
| **create-issue** | `/create-issue` | Issue GitHub avec labels, template, epic linking |
| **worktree-start** | `/worktree-start` | Branche isolee + worktree depuis un numero d'issue |
| **worktree-finish** | `/worktree-finish` | Cleanup worktree apres merge de la PR |
| **convex-cli** | `/convex-cli` | Init Convex non-interactif pour les projets qui l'utilisent |
| **merge** | `/merge` | Merge de branches avec resolution de conflits context-aware |
| **fix-errors** | `/fix-errors` | Fix ESLint + TypeScript en parallele avec agents |
| **fix-pr-comments** | `/fix-pr-comments` | Fetch les commentaires de PR et implemente les changements demandes |

## Agents custom (6)

| Agent | Description |
|-------|-------------|
| **critic** | Reviewer technique qui auto-detecte les lentilles pertinentes (CTO, UX, Security, Performance, Cost) |
| **explore-codebase** | Exploration profonde de codebase avec file:line references |
| **explore-docs** | Recherche documentation via ctx7 CLI + MCP Context7 |
| **websearch** | Recherche web ciblee pour best practices et breaking changes |
| **linkedin-post** | Agent specialise generation de contenu LinkedIn |
| **action** | Execution conditionnelle — agit seulement quand les conditions sont remplies |

## Hooks (5)

| Hook | Declencheur | Description |
|------|-------------|-------------|
| **monitor-session** | Stop, Permission, Notification | Monitoring central de la session |
| **notify-workflow** | PostToolUse (Bash) | Notification apres execution de commandes |
| **gsd-check-update** | SessionStart | Verifie les MAJ GSD au lancement |
| **gsd-context-monitor** | PostToolUse | Monitore le contexte pour GSD |
| **gsd-statusline** | statusLine | Affiche stats, depenses, progression dans la barre de statut |

## Sons de notification

- **finish.mp3** — Joue quand Claude termine une tache longue (hook Stop)
- **need-human.mp3** — Joue quand Claude a besoin d'une decision humaine (hook Notification)

Remplacer par vos propres sons. Format MP3, PowerShell `MediaPlayer` sur Windows.

## Le Quality Gate (pre-commit)

Chaque `/commit` passe par un audit automatique sur 4 axes :

| Axe | Verifie | BLOCK si |
|-----|---------|----------|
| **Architecture** | God class ? Responsabilites melangees ? | Fichier >300 lignes avec 3+ concerns |
| **Qualite vs Vitesse** | N+1 ? Debug code ? Duplication ? | `dd()`, `console.log` dans le diff |
| **Production-grade** | Stack traces ? Routes non protegees ? | Traces dans les reponses JSON |
| **SOLID** | Contrats parents violes ? hasRole() hardcode ? | Violation Liskov dans un override |

- **PASS** → commit normalement
- **WARN** → affiche les warnings, attend confirmation
- **BLOCK** → ne commit pas, propose des fixes

Exempt : fichiers `.md`/`.json` config, diffs < 5 lignes, suppressions pures.

## Installation

```bash
# 1. Cloner
git clone https://github.com/James10192/iroko.git ~/.claude-iroko

# 2. Copier ce dont vous avez besoin
cp -r ~/.claude-iroko/rules/* ~/.claude/rules/
cp -r ~/.claude-iroko/skills/* ~/.claude/skills/
cp -r ~/.claude-iroko/agents/* ~/.claude/agents/
cp -r ~/.claude-iroko/hooks/* ~/.claude/hooks/

# 3. Adapter settings.json (ne pas ecraser le votre)
# Ouvrir ~/.claude-iroko/settings.json et copier les sections utiles

# 4. Installer les plugins tiers
claude plugins add anthropics/claude-plugins-official
claude plugins add jpcaparas/superpowers-laravel
claude plugins add pbakaus/impeccable
```

## Credits et attributions

Cette config est un assemblage de travail personnel et d'outils communautaires. Credits la ou c'est du :

### Tiers — Plugins et frameworks

| Outil | Auteur | Repo | Description |
|-------|--------|------|-------------|
| **Get Shit Done (GSD)** | GSD Team | [Voir plugin](https://github.com/) | 16 agents, 30+ skills `/gsd:*`, hooks, statusline. Framework complet de gestion de projet pour Claude Code. |
| **AI Blueprint / APEX** | Melvynx (Melvyn Dev) | [Melvynx/aiblueprint](https://github.com/Melvynx/aiblueprint) | Skills `apex`, `workflow-apex-free`, `ralph-loop`, `oneshot`, `ultrathink`. Methodologies structurees pour l'implementation. |
| **Impeccable** | Paul Bakaus | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Plugin marketplace — skills adapt, animate, bolder, clarify. |
| **Superpowers Laravel** | JP Caparas | [jpcaparas/superpowers-laravel](https://github.com/jpcaparas/superpowers-laravel) | 50+ skills Laravel : TDD, controllers, policies, eloquent, queues, Horizon. |
| **Claude Plugins Official** | Anthropic | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | feature-dev, pr-review-toolkit, code-review, code-simplifier, frontend-design, vercel, slack. |
| **Context7** | Context7 Team | [context7](https://github.com/) | Plugin MCP + CLI `ctx7` pour lookup documentation en temps reel. |

### Tiers — Skills (via AI Blueprint / Melvynx)

- `apex/` — APEX methodology (Analyze-Plan-Execute-Validate)
- `workflow-apex-free/` — Version free d'APEX
- `ralph-loop/` — Coding autonome en boucle
- `oneshot/` — Implementation ultra-rapide
- `ultrathink/` — Reflexion profonde mode artisan
- `claude-memory/` — Optimisation CLAUDE.md
- `skill-creator/` — Creation de skills
- `subagent-creator/` — Creation de subagents
- `prompt-creator/` — Prompt engineering

### Custom — Par Marcel DJEDJE-LI

- Toutes les `rules/` (5 fichiers)
- Skills : `commit`, `plan-and-confirm`, `find-doc`, `linkedin-post`, `visual-check`, `create-pr`, `create-issue`, `worktree-start`, `worktree-finish`, `convex-cli`, `merge`, `fix-errors`, `fix-pr-comments`
- Agents : `critic`, `explore-codebase`, `explore-docs`, `websearch`, `linkedin-post`, `action`
- Hooks : `monitor-session.sh`, `notify-workflow.sh`
- Scripts : `command-validator/`, `statusline/`
- Sons de notification

## Contexte

Je suis Marcel DJEDJE-LI, developpeur full-stack a Abidjan, Cote d'Ivoire. Je construis :

- **KLASSCI** — SaaS multi-tenant de gestion d'etablissements scolaires (Laravel, 5 tenants en production)
- **MailPulse** — Plateforme d'email marketing (Next.js 16, Convex, Resend)
- **E-pagne** — Fintech d'epargne collaborative (Next.js, Convex)

Cette config est le resultat de plusieurs mois d'iteration quotidienne avec Claude Code sur ces projets.

## Licence

MIT — Utilisez, modifiez, partagez. Creditez les auteurs tiers selon leurs licences respectives.
