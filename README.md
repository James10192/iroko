[![npm](https://img.shields.io/npm/v/@james10192/iroko?style=flat)](https://www.npmjs.com/package/@james10192/iroko)
[![license](https://img.shields.io/npm/l/@james10192/iroko?style=flat)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=flat)](https://nodejs.org/)

# iroko

My Claude Code configuration. 28 components I use every day across 4 production SaaS projects.

Named after the West African hardwood: durable, solid, the foundation everything else builds on.

```
npx @james10192/iroko init
```

## What you get

| Type | Count | What it does |
|------|-------|-------------|
| Rules | 5 | Loaded in every conversation. Shape how Claude behaves. |
| Skills | 15 | Slash commands: `/commit`, `/plan-and-confirm`, `/find-doc`... |
| Agents | 6 | Specialized subagents for review, research, search. |
| Hooks | 2 | Automatic triggers on session events. |
| Sounds | 2 | MP3 notifications when Claude finishes or needs input. |

---

## Rules

Rules are always active. You don't invoke them, they just work.

| Rule | What it does |
|------|-------------|
| `pre-commit-quality-gate` | Audits every commit on 4 axes: architecture, quality vs speed, production-readiness, SOLID. Blocks if critical issues found. |
| `parallel-agents` | Enforces max 4 parallel agents, launched in a single message. Synthesize results, don't relay. |
| `token-efficiency` | When to use agents (multi-file exploration) vs direct tools (Grep, Glob, Read). Saves context. |
| `use-available-tools` | Always check docs via ctx7 CLI before coding with external APIs. Never guess. |
| `marcel-global-preferences` | Personal config: pnpm, French UI, no AI slop. Deselect during init unless you share these preferences. |

## Skills

Type `/command` in Claude Code. These are the commands I built.

| Skill | What it does |
|-------|-------------|
| `/commit` | Quality-gated commit. Runs the 4-axes audit on your diff, generates a conventional message, pushes. Blocks on critical issues. |
| `/plan-and-confirm` | Launches a critic + 3 research agents in parallel, presents a detailed plan, waits for your explicit OKAY before touching any file. |
| `/find-doc` | Looks up library documentation via ctx7 CLI, Context7 MCP, and WebSearch. Use before writing code with any external API. |
| `/linkedin-post` | Generates a LinkedIn post from your current work context: git history, conversation, tech trends. Publishes via MCP if configured. |
| `/visual-check` | Opens dev-browser (sandboxed Chromium), navigates to a URL, takes screenshots to verify your implementation visually. |
| `/create-pr` | Creates a PR with auto-generated title and structured description. Analyzes the full diff, not just the last commit. |
| `/create-issue` | Creates a GitHub issue with labels, scope detection, and epic linking. |
| `/worktree-start` | Starts isolated work on a GitHub issue using a git worktree. Issue number to branch to worktree in one command. |
| `/worktree-finish` | Cleans up after a worktree PR is merged. Removes the worktree directory and local branch. |
| `/merge` | Merges branches with context-aware conflict resolution. Reads the PR, understands the feature, resolves conflicts. |
| `/fix-errors` | Fixes all ESLint and TypeScript errors using parallel agents. Groups errors by file area, max 5 per agent. |
| `/fix-grammar` | Fixes grammar and spelling in one or multiple files while preserving formatting. |
| `/fix-pr-comments` | Fetches all unresolved PR review comments and implements the requested changes. |
| `/npm-publish` | Bumps version, builds, publishes to npm, creates a git tag, pushes. One command for a full release. |
| `/convex-cli` | Initializes and manages Convex projects non-interactively. For Convex users only. |

## Agents

Subagents used by skills under the hood. You can also invoke them directly via the Agent tool.

| Agent | What it does |
|-------|-------------|
| `critic` | Technical reviewer. Auto-detects which lenses to apply: CTO, UX, Security, Performance, Cost. Gives a verdict: PROCEED, RETHINK, or REJECT. |
| `explore-codebase` | Deep codebase exploration. Follows import chains, discovers dependencies, reports with file:line references. |
| `explore-docs` | Documentation research via ctx7 CLI (primary), Context7 MCP (fallback), WebSearch (complement). |
| `websearch` | Targeted web search for best practices, breaking changes, community patterns. |
| `linkedin-post` | Content generation agent for LinkedIn. Positions as expert, never as learner. Respects reputation rules. |
| `action` | Conditional executor. Performs actions only when specific conditions are met. Batch processor for up to 5 independent tasks. |

## Hooks

Triggered automatically by Claude Code session events.

| Hook | Trigger | What it does |
|------|---------|-------------|
| `monitor-session` | Stop, Permission, Notification | Monitors session state, sends notifications via OpenClaw/Telegram. |
| `notify-workflow` | PostToolUse (Bash) | Sends a notification after Bash command execution completes. |

## The quality gate

The `/commit` skill blocks commits that fail a 4-axes audit:

| Axis | Checks | Blocks if |
|------|--------|-----------|
| Architecture | God class, mixed responsibilities | File >300 lines with 3+ concerns |
| Quality | N+1 queries, debug code, duplication | `dd()`, `console.log` in the diff |
| Production | Exposed stack traces, unprotected routes | Traces in JSON responses, routes without auth |
| SOLID | Liskov violations, hardcoded roles | Contract broken in an override |

PASS = commit. WARN = show warnings, ask confirmation. BLOCK = fix first.

Skipped for trivial diffs: markdown, config, less than 5 lines changed.

## Notification sounds

Two MP3 files that play when Claude Code triggers hooks:

- `finish.mp3` plays when Claude completes a task (Stop hook)
- `need-human.mp3` plays when Claude needs your input (Notification hook)

Adapted from [AI Blueprint](https://github.com/Melvynx/aiblueprint)'s Mac-only `afplay` pattern. This version works cross-platform: PowerShell on Windows, `afplay` on Mac, `paplay` on Linux. See [`song/README.md`](song/README.md) for setup.

## Auto-update

iroko checks npm for new versions on every run. If an update is available:

```
  Update available 1.3.0 → 1.4.0
  Run pnpm add -g @james10192/iroko@latest to update
```

`iroko update` pulls the latest config files from GitHub and re-installs your selected components.

---

## Install

### Option 1: npx (no install)

```bash
npx @james10192/iroko init
```

### Option 2: global install

```bash
pnpm add -g @james10192/iroko
iroko init
```

### Option 3: Claude Code plugin

```
/plugin marketplace add James10192/iroko
/plugin install iroko@iroko
```

### Option 4: manual

```bash
git clone https://github.com/James10192/iroko.git
cp -r iroko/rules/* ~/.claude/rules/
cp -r iroko/skills/* ~/.claude/skills/
cp -r iroko/agents/* ~/.claude/agents/
cp -r iroko/hooks/* ~/.claude/hooks/
```

### Commands

```bash
iroko init      # Interactive setup — select components to install
iroko list      # Show installed vs available components
iroko update    # Pull latest from GitHub and re-install
iroko --help    # All commands
```

The installer shows an interactive checklist grouped by type. Everything is selected by default. Deselect what you don't need.

---

## Recommended plugins

Tools I use alongside iroko. Not bundled, install them separately.

| Plugin | Author | What it does |
|--------|--------|-------------|
| [AI Blueprint](https://github.com/Melvynx/aiblueprint) | Melvynx | APEX workflow, ralph-loop autonomous coding, ultrathink deep thinking, oneshot fast implementation |
| [Impeccable](https://github.com/pbakaus/impeccable) | Paul Bakaus | Design quality and adaptation skills |
| [Superpowers Laravel](https://github.com/jpcaparas/superpowers-laravel) | JP Caparas | 50+ Laravel patterns: TDD, controllers, policies, queues, Horizon |
| [Claude Plugins Official](https://github.com/anthropics/claude-plugins-official) | Anthropic | feature-dev, pr-review-toolkit, code-review, frontend-design, vercel, slack |

```bash
claude plugins add anthropics/claude-plugins-official
claude plugins add pbakaus/impeccable
```

---

## Structure

```
iroko/
├── .claude-plugin/       Plugin marketplace manifest
├── src/                  CLI source (TypeScript)
├── rules/                5 global rules
├── skills/               15 slash commands
├── agents/               6 subagents
├── hooks/                2 event hooks
├── song/                 Notification sounds (cross-platform)
└── templates/            settings.json template
```

---

## Context

Built by [Marcel DJEDJE-LI](https://github.com/James10192) in Abidjan, Cote d'Ivoire. Used daily on:

- **KLASSCI** : multi-tenant school management SaaS (Laravel, 5 tenants, 3000+ students)
- **MailPulse** : email marketing platform (Next.js 16, Convex, Resend)
- **E-pagne** : collaborative savings fintech (Next.js, Convex)

This is the result of months of daily iteration with Claude Code on production software.

## License

MIT
