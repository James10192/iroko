# iroko

Claude Code configuration that I use every day across 4 production SaaS projects. Rules, skills, agents, hooks.

Named after the West African hardwood — durable, solid, the foundation everything else builds on.

```
pnpm add -g @james10192/iroko
iroko init
```

Or one-shot:

```
npx @james10192/iroko init
```

---

## What's inside

**28 components**, each does one thing well:

### Rules (5)

Rules are loaded into every Claude Code conversation. They shape behavior without you typing anything.

```
pre-commit-quality-gate     Audit code on 4 axes before every commit
parallel-agents             Launch up to 4 agents in parallel
token-efficiency            When to use agents vs direct tools
use-available-tools         Check docs (ctx7, WebSearch) before coding
marcel-global-preferences   Personal: pnpm, French UI, no AI slop
```

`marcel-global-preferences` is my personal config. Deselect it during init unless you want French UI and pnpm enforcement.

### Skills (15)

Slash commands. Type `/commit` in Claude Code and it runs.

```
commit              Quality-gated commit — 4-axes audit before pushing
plan-and-confirm    Critic + 3 research agents + plan + OKAY gate
find-doc            Look up library docs via ctx7 before writing code
linkedin-post       Generate a LinkedIn post from current work context
visual-check        Screenshot a page to verify implementation
create-pr           PR with auto-generated title and description
create-issue        GitHub issue with labels and epic linking
worktree-start      Start isolated work on a GitHub issue
worktree-finish     Clean up worktree after PR merge
merge               Context-aware conflict resolution
fix-errors          Fix ESLint + TypeScript errors with parallel agents
fix-grammar         Fix spelling while preserving formatting
fix-pr-comments     Implement all PR review comments
npm-publish         Bump version, build, publish to npm, git tag, push
```

Optional:
```
convex-cli          Convex project init (for Convex users only)
```

### Agents (6)

Specialized subagents that skills use under the hood.

```
critic              Technical reviewer — auto-detects CTO/UX/Security lenses
explore-codebase    Deep exploration with file:line references
explore-docs        Documentation lookup via ctx7 CLI and MCP
websearch           Targeted search for best practices
linkedin-post       Content generation for LinkedIn
action              Conditional executor — acts only when conditions are met
```

### Hooks (2)

Automatic triggers on session events.

```
monitor-session     Tracks Stop, Permission, and Notification events
notify-workflow     Sends notification after Bash execution
```

---

## The Quality Gate

The `/commit` skill runs a 4-axes audit on your diff before committing:

| Axis | Checks | Blocks if |
|------|--------|-----------|
| Architecture | God class, mixed responsibilities | New file >300 lines with 3+ concerns |
| Quality | N+1, debug code, duplication | `dd()`, `console.log` in diff |
| Production | Exposed traces, unprotected routes | Stack traces in JSON responses |
| SOLID | Liskov violations, hardcoded roles | Contract broken in override |

**PASS** = commit. **WARN** = show warnings, ask confirmation. **BLOCK** = fix first, no commit.

Skipped for trivial diffs: markdown, config files, <5 lines.

---

## Notification Sounds

Two MP3 files that play when Claude Code triggers specific hooks:

- `finish.mp3` — plays when Claude completes a task (Stop hook)
- `need-human.mp3` — plays when Claude needs human input (Notification hook)

Adapted from [AI Blueprint](https://github.com/Melvynx/aiblueprint)'s Mac-only `afplay` pattern. This version works on Windows (PowerShell MediaPlayer), Mac (`afplay`), and Linux (`paplay`). See `song/README.md` for setup instructions.

---

## Auto-update

iroko checks for new versions on every run. If a newer version exists on npm:

```
  Update available 1.2.0 → 1.3.0
  Run pnpm add -g @james10192/iroko@latest to update
```

`iroko update` updates your installed config files from GitHub. If the CLI itself is outdated, it tells you.

---

## Installation

### Quick

```bash
npx @james10192/iroko init
```

### Global

```bash
pnpm add -g @james10192/iroko
iroko init
```

The installer shows an interactive checklist. Everything is selected by default — deselect what you don't need.

### Commands

```bash
iroko init      # Interactive setup
iroko list      # Show installed vs available components
iroko update    # Pull latest from GitHub and re-install
```

### Manual

Clone and copy what you need:

```bash
git clone https://github.com/James10192/iroko.git
cp -r iroko/rules/* ~/.claude/rules/
cp -r iroko/skills/* ~/.claude/skills/
cp -r iroko/agents/* ~/.claude/agents/
cp -r iroko/hooks/* ~/.claude/hooks/
```

---

## Recommended plugins

These are tools I use daily alongside iroko. They have their own repos and install commands.

| Plugin | Author | What it does |
|--------|--------|-------------|
| [AI Blueprint](https://github.com/Melvynx/aiblueprint) | Melvynx | APEX methodology, ralph-loop autonomous coding, ultrathink deep thinking, oneshot fast implementation |
| [GSD (Get Shit Done)](https://github.com/) | GSD Team | Full project management framework: 16 agents, 30+ skills, statusline, phase planning |
| [Impeccable](https://github.com/pbakaus/impeccable) | Paul Bakaus | Design quality and adaptation skills |
| [Superpowers Laravel](https://github.com/jpcaparas/superpowers-laravel) | JP Caparas | 50+ Laravel-specific patterns (TDD, controllers, policies, queues) |
| [Claude Plugins Official](https://github.com/anthropics/claude-plugins-official) | Anthropic | feature-dev, pr-review-toolkit, code-review, frontend-design, vercel, slack |

Install via Claude Code:
```bash
claude plugins add anthropics/claude-plugins-official
claude plugins add pbakaus/impeccable
```

---

## Structure

```
iroko/
├── src/                  CLI source (TypeScript)
│   ├── cli.ts            Entry point
│   ├── commands/         init, list, update
│   └── lib/              manifest, installer, paths
├── rules/                5 global rules
├── skills/               15 slash commands
├── agents/               6 subagents
├── hooks/                2 event hooks
├── song/                 Notification sounds (Windows PowerShell, Mac, Linux)
├── templates/            settings.json template
└── .github/              CODEOWNERS, dependabot, security policy
```

---

## Context

Built by Marcel DJEDJE-LI in Abidjan, Cote d'Ivoire. Used daily on:

- **KLASSCI** — Multi-tenant school management SaaS (Laravel, 5 tenants in production)
- **MailPulse** — Email marketing platform (Next.js 16, Convex, Resend)
- **E-pagne** — Collaborative savings fintech (Next.js, Convex)

This config is the result of months of daily iteration with Claude Code on production software.

---

## Credits

Built by Marcel DJEDJE-LI. Recommended plugins credit their respective authors.

## License

MIT
