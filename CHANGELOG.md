# Changelog

All notable changes to **iroko** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html):
fixes and content updates are PATCH, new components or CLI flags are MINOR,
removals/renames and CLI interface changes are MAJOR.

## [Unreleased]

## [3.2.0] — 2026-08-09

Health-audit release: every critical and major defect from the August audit is fixed, plus a new `uninstall` command (the MINOR bump).

### Added

- **CLI**: `iroko uninstall` — removes ONLY the files listed in `.iroko.json` (mapped through the manifest), then `.iroko.json` and the update-check file, and recaps everything removed. If `~/.claude/settings.json` is the intact iroko template, only the guard hooks block is unwired; a user-modified settings.json is never touched (and the CLI says so). `--keep-settings` leaves settings.json completely untouched, `--yes` runs non-interactively, `--guide` switches the output to French. Unknown legacy components are listed and left in place.
- **Init**: when `~/.claude/settings.json` already exists (never overwritten), init now detects whether the `guard-destructive` hook is wired and, if not, prints the exact JSON block to paste ("Add this to your settings.json to activate the guard hook", French under `--guide`). Previously the hook shipped but was silently never activated for anyone with existing settings.
- **Doctor**: new "guard hook" check — wired in settings.json → OK, otherwise "to wire" with the exact JSON block to paste printed below the report.
- **Installer backups**: before overwriting a component whose local version differs from the source, the previous version is saved as `<file>.bak` (single level, overwritten each time) and reported ("local version saved as .bak") — both on `init` and `update`.
- **CI**: a `cli-smoke` job builds the CLI and exercises it in a throwaway `$HOME` (`--version`, `doctor`, `update` without an install — must exit 0 with a clean message and no stack trace — then `init --guide --yes`, `doctor`, `uninstall --yes`); the pack job now also verifies that all 24 manifest `path`s ship in the `npm pack` tarball; `tsc --noEmit` runs before the build.
- **Docs**: CONTRIBUTING.md (component proposals, CHANGELOG-first versioning, CI overview) and issue templates (`bug.md`, `component.md`).

### Fixed

- **Crash of `update` before `init`**: the update checker used to write `lastUpdateCheck` into `.iroko.json`, creating a partial config that bypassed the "not installed" guard and crashed `update` on `config.components.length`. The throttle timestamp now lives in its own file (`~/.claude/.iroko-update-check.json`, legacy field read once then ignored), the guard is hardened to `!config?.components?.length` with a clean "No iroko installation found. Run npx @james10192/iroko init first." message, and `doctor` reports this partial state as "components: to install" instead of "OK 0/24".
- **Guide pack is now self-contained (16 components)**: the `docs-first` rule, the `/sketch` skill and the `explore-codebase` / `websearch` agents move into the guide pack, and every remaining reference from a guide component to a non-guide component (`/deep-review`, `/create-pr`, `/oneshot`, `/visual-check`, `/pick-stack`) is reformulated as "if installed (with the default/full pack)". No more dead references for `--guide` installs.
- **Re-init no longer shrinks the install**: the saved component list is the union of the existing install and the new selection, instead of a replacement that silently dropped previously installed components from `.iroko.json`.
- **`update` fetches the matching version**: components are cloned from the `v<CLI version>` tag (fallback to master when the tag does not exist) instead of master HEAD, so a 3.2.0 CLI never installs future incompatible components. Legacy components absent from the manifest are listed at the end of the run as "unknown components kept as-is" instead of being silently re-saved.
- **`update` self-upgrade hint**: only shown when the published version is strictly newer (it used to suggest "3.2.0 → 3.1.0" whenever the versions merely differed).
- **song/ PowerShell snippet**: single quotes do not interpolate `$HOME` in PowerShell — the documented Stop/Notification hook commands now build the file URI by concatenation.
- **guard-destructive.sh**: also blocks `git push -f`, `docker compose down -v` (and `docker-compose down -v`), `convex dev --reset`, `prisma migrate reset` (verified against simulated PreToolUse payloads).

### Changed

- **README**: `doctor` and `uninstall` added to both command lists; every quickstart command is prefixed with `npx @james10192/iroko` (an npx install does not put `iroko` in the PATH); pack tables updated for the self-contained guide pack; an honest line about the plugin path ("ships skills and agents only; rules and the hook come with npx init").
- **npm tarball slimmed**: `song/` is no longer published to npm (the folder stays in the repo, and its README now documents repo-only usage); the tarball drops to ~35 kB.
- **package.json**: repository URL in canonical `git+https://` form, keywords enriched (guardrails, rules, beginner, ai-safety), description rewritten around the guardrail thesis.
- **tsup**: build target raised to node20 (matching `engines.node >= 20`).
- **.gitignore**: cleaned of `~/.claude` entries copied by mistake (sessions/, projects/, ide/, gsd-file-manifest.json, ...).

## [3.1.0] — 2026-08-09

### Added

- **CLI**: `iroko doctor` — environment diagnostic (node >= 20, git, gh + auth, ctx7, dev-browser, claude CLI + MCP context7, installed iroko components). Each missing line shows the exact install command; `--guide` switches the output to French. Always exits 0: it is a report, not a gate.
- **Tooling check sections**: `visual-check`, `read-docs`, `create-pr`, `create-issue`, the `explore-docs` agent and the `docs-first` rule now carry a standard "Tooling check (before first use)" protocol: verify first (non-destructive probe), install directly if missing (npx on the fly for dev-browser/ctx7, `claude mcp add` for the Context7 MCP, winget/brew/apt for gh — only `gh auth login` stays a human step), documented fallback if the install fails. `plan-and-confirm` and `token-efficiency` reference the protocol.

## [3.0.0] — 2026-08-07

iroko v3 is a repositioning, not a facelift: from "my personal Claude Code config" to **a guardrail environment for AI-assisted work**, organized around the builder cycle (frame → illustrate → document → build → verify) and three promises: frame it, save tokens, verify it. 24 components (7 rules, 12 skills, 4 agents, 1 hook), install packs (`--guide` / default / `--full`), and a French-first beginner path.

### Migration v2 → v3

| v2 component | v3 status |
|---|---|
| `pre-commit-quality-gate` (rule) | **Renamed** → `quality-gate` (single source for the 4-axes audit, plain-language glossary added) |
| `use-available-tools` (rule) | **Renamed** → `docs-first` (single source for the docs pipeline) |
| `find-doc` (skill) | **Renamed** → `/read-docs` (absorbs the ctx7/Context7 pipeline, adds a reading method) |
| `parallel-agents` (rule) | **Removed** — merged into `token-efficiency` (the personal model-routing policy is not distributed) |
| `worktree-start` (skill) | **Removed** — expert-only, and it wrote `bypassPermissions` into user settings |
| `worktree-finish` (skill) | **Removed** — paired with worktree-start |
| `merge` (skill) | **Removed** — AI-driven conflict resolution is an error source for the target audience |
| `fix-pr-comments` (skill) | **Removed** — out of thesis |
| `fix-grammar` (skill) | **Removed** — out of thesis |
| `convex-cli` (skill) | **Removed** — niche |
| `npm-publish` (skill) | **Removed** — out of target audience |
| `linkedin-post` (skill + agent) | **Removed** — personal marketing tooling |
| `monitor-session.sh`, `notify-workflow.sh` (hooks) | **Removed** — dead without the OpenClaw gateway |

### Added

- **Rules**: `git-safety` (destructive git/db commands forbidden without explicit written approval, backup first), `stay-in-scope` (never beyond the request, file-size thresholds), `ship-quality` (loading/empty/error/success states on every deliverable, no "coming soon").
- **Skills**: `/sketch` (3-6 low-fidelity visual options on a local HTML board before any code), `/pick-stack` (stack advisor interviewing the real need), `/demarrer` (guided mode in French for complete beginners), `/deep-review` (ruthless structural review, generified from a personal skill), `/oneshot` (one trivial task: explore → code → test, stop after 2 failures).
- **Agents**: `explore-codebase` and `websearch` — repairs the dead references in `/plan-and-confirm` and `token-efficiency`, which invoked agents iroko did not distribute.
- **Hook**: `guard-destructive.sh` (PreToolUse) blocks `git reset --hard`, `git push --force`, `git checkout -- .`, `git clean -f`, `migrate:fresh`, `db:wipe`, `DROP DATABASE`, `--force-reset`, unscoped `rm -rf`. Pure bash, no jq dependency. Wired by default in `templates/settings.json.tpl`, whose deny list is extended to match.
- **Install packs**: `iroko init --guide` (beginner pack, CLI prompts in French), default (guide + default packs), `iroko init --full` (everything). New `--yes` flag for non-interactive installs.
- **Manifest metadata**: every component now carries a `step` (cadrer / illustrer / documenter / construire / verifier / ambient) and a `pack` (guide / default / full); `iroko list` displays both. Descriptions are bilingual EN/FR.

### Changed (structural fixes)

- **Single-source quality gate**: the 4-axes table lives ONLY in the `quality-gate` rule; `/commit` and `/plan-and-confirm` reference it instead of embedding divergent copies.
- **Single-source docs pipeline**: the ctx7 → MCP → web search pipeline lives ONLY in `docs-first`; `/read-docs` and the agents reference it.
- **`/plan-and-confirm` repaired**: the critic is invoked as an agent instead of being copied inline; branch convention unified to `type/N-slug`; cost displayed before high depths ("depth 5 ≈ 5 agents, confirm?").
- **`/commit` repaired**: stages ONLY the files changed in the conversation — no more `git add .`, aligned with `global-preferences`.
- **`/fix-errors` repaired**: sequential by default (token economy), parallel agents only past 20 errors; "snipper" typo fixed.
- **`/visual-check` purged** of client-project leaks (internal colors, issues, lessons learned); URL configurable.
- **`token-efficiency` repaired**: agent references point to distributed agents, absorbs the essentials of `parallel-agents`.
- **`global-preferences` corrected**: no longer contradicts the skills (the `git add` clause is aligned).

## [2.2.1] — 2026-08-07

### Fixed

- **npm tarball was missing all distributed content** — the `files` field in `package.json` listed a non-existent `configs/` directory instead of the real `rules/`, `skills/`, `agents/`, `hooks/` folders. Published versions shipped a CLI with nothing to install. The tarball now contains every distributed folder, and a new `pack-smoke` CI job packs, extracts, and verifies the tarball content on every push/PR.
- **Remove hardcoded gateway token from hooks** — `monitor-session.sh` and `notify-workflow.sh` now read `OPENCLAW_TOKEN` (and `OPENCLAW_URL`) from the environment and exit silently when no token is configured. Personal wording in hook messages replaced with generic text.
- **CI secret scan hardened** — the release-guard scan no longer filters by file extension (shell scripts are now scanned), detects hardcoded gateway token assignments, and matches any absolute `C:\Users\<name>` path instead of a single hardcoded username.
- **`iroko init` settings template resolution** — the template path no longer climbs above the package root in the npm install; both npm (`<pkg>/templates`) and dev (`repo/templates`) layouts are resolved.
- **`{{HOME}}` substitution corrupted settings.json on Windows** — the home path is now JSON-escaped (`JSON.stringify(home).slice(1, -1)`) so backslashes survive.
- **`iroko update` installed from the local package instead of the fresh clone** — components are now copied from the cloned repository, a `git --version` pre-check fails fast with a clear message when git is missing, and the temporary clone directory is always cleaned up in a `finally` block.
- **Truecolor detection on Windows Terminal** — `WT_SESSION` now enables 24-bit color even when `COLORTERM` is unset.

### Changed

- **Distributed content depersonalized**:
  - `skills/linkedin-post/references/profile-marcel.md` (personal emails, private repos, client data) replaced by a placeholder-based `profile.template.md`; the skill and agent now read a user-created `references/profile.md` with memory fallbacks.
  - `rules/marcel-global-preferences.md` renamed to `rules/global-preferences.md` — same principles (pnpm, no Co-Authored-By, monochrome design, no AI slop) without private project names or personal context. Manifest and README updated.
  - `agents/linkedin-post.md` no longer embeds a personal identity, project table, or company strategy; it reads the author profile instead.
- **Personal `settings.json` removed from the repository** (contained `bypassPermissions` and machine-specific hooks) and added to `.gitignore`. The clean template remains in `templates/settings.json.tpl`.

## [2.2.0] — 2026-04-27

### Changed

- **Premium CLI redesign** — full visual overhaul of the iroko CLI:
  - **New banner** — botanical iroko silhouette in walnut tone, replacing the generic green tree.
  - **Single signature character** — `▰` (U+25B0, BLACK PARALLELOGRAM) used everywhere as the iroko mark: status icons, KPI bars, section headers, outro tags. Reusable as a logo outside the CLI (npm avatar, LinkedIn posts, screenshots).
  - **New palette** — walnut (RGB 139,111,71) for the tree, ochre (RGB 212,160,23) as the single accent, ivory for body, graphite for dim. ANSI 24-bit when supported (`COLORTERM=truecolor`), automatic fallback to ANSI 16 elsewhere.
  - **`▰`/`▱`/`▴`/`×` status grammar** replaces `●`/`○`/`+` across `init` and `list`.
  - **KPI bars** in `iroko list` — visual progress (`▰▰▰▰▰▱▱▱▱▱`) per component type.
  - **Compact banner** for sub-commands (init/list/update) — keeps the workflow focused while preserving the iroko mark.
  - **Right-aligned outro tag** (`▰  by @LeVraiMD`) — discreet authorship signature after each successful action.
  - **Default screen** now lists commands with `▰` markers and ends with a one-line author signature (Marcel DJEDJE-LI · github.com/James10192 · @LeVraiMD).
  - **UTF-8 detection** — `Côte d'Ivoire` rendered with accents on capable terminals, ASCII fallback on legacy cmd.exe.

### Added

- `iroko about` — new sub-command with full author and project credits (name, GitHub, X, LinkedIn, email, npm, repo, issues, license).
- `src/lib/theme.ts` — centralised palette, marks, and country/UTF-8 detection.
- `src/lib/ui.ts` — reusable terminal-UI primitives (`mark`, `divider`, `sectionHeader`, `kpiBar`, `rightTag`, `row`).

### Fixed

- `iroko list` no longer crashes when `~/.claude/.iroko.json` exists without an `installedAt` field (created by the update-checker before any `iroko init`). Now prompts the user to run `iroko init` instead.

## [2.1.0] — 2026-04-27

### Changed

- `/plan-and-confirm` rewritten as **Ultraplan v3** — depth-variable planning pipeline (1–5):
  - **Auto-detected depth** from prompt signals (typo → 1, refactor → 4, rewrite → 5). Manual override via `--depth=N`, `--quick`, or `--ultra`.
  - **Devil's Advocate agent** (depth ≥ 4) launched in parallel — argues the plan is wrong, surfaces counter-arguments and hidden costs.
  - **5 ultrathink lenses** baked into the critic prompt: Real Problem, Elegant Solution, Premortem, Simplification, Senior Test.
  - **Multiple alternatives** (depth ≥ 4): Plan A (minimal/reversible), Plan B (balanced), Plan C (ambitious — depth 5 only).
  - **Confidence scoring** (1–5) per file/section. Halt if any score ≤ 2.
  - **"Salt the plan"** (depth ≥ 3) — explicit list of 3 tempting ideas being skipped, with reasons.
  - **Reflection pass** (depth ≥ 3) — checks whether agents answered the right question.
  - **Premortem + future-self review + opposite-day check** at depth 5.
  - **Iteration counter** (`[Iteration 2 · depth=4]`) shown on every plan revision.
  - **"Why this is the right approach"** closing — forces a defense anchored in evidence.
- `/npm-publish` rewritten with structured pre-flight checks, exact-version argument support (`/npm-publish 2.1.0`), and stricter rules. Now also runs `scripts/sync-version-from-changelog.mjs` to keep all version sources in sync.
- `/visual-check` extended with **Step 4 — Exercise the submit/mutation path**: submitting a form/CTA is now mandatory whenever a change touches a mutation. A 200-rendered page can hide a 500 on submit. Includes lessons learned from the 2026-04-27 KLASSCI cascade incident.
- `/create-issue`, `/create-pr`, `/find-doc`, `/fix-pr-comments`, `/merge`, `/worktree-start`, `/worktree-finish` now ship with explicit **Prerequisites** blocks (gh / ctx7 availability checks) so the skill stops cleanly instead of silently failing on missing tooling.

### Added

- `CHANGELOG.md` at repository root (this file). Existing releases retro-documented below.
- `scripts/sync-version-from-changelog.mjs` — single source of truth for version. Reads the latest released `## [X.Y.Z]` heading from `CHANGELOG.md` and applies it to `package.json`, `src/lib/banner.ts`, and `.claude-plugin/marketplace.json` (both `metadata.version` and `plugins[0].version`). Run with `--check` for read-only validation.
- `.github/workflows/release-guard.yml` — CI guard that:
  - Refuses any push/PR where a version source disagrees with `CHANGELOG.md` (CHANGELOG drives versioning).
  - Refuses any PR that touches `rules/`, `skills/`, `agents/`, `hooks/`, `src/`, `templates/`, or `song/` without updating `CHANGELOG.md`.
  - Scans for leaked tokens (Anthropic, OpenAI, GitHub PAT, AWS, Google) and personal absolute Windows paths in shipped bundles.
  - Builds the CLI to catch broken TypeScript before publish.

## [2.0.1] — 2026-04-10

### Changed

- Update-check throttled to once per 24 h (no more 3 s pause on every CLI invocation).
- Constants centralised in `src/lib/constants.ts` (`TYPE_ORDER`, `TYPE_META`, `PACKAGE_NAME`, `REPO_URL`).
- `getConfigsRoot()` memoized.
- Landing site cleanup — `useCopy` hook shared, arrays extracted, counts derived from `.length`, `useRef` fix for React 19.

### Removed

- Dead code: `getCustomComponents`, `InstalledComponent`, `defaultSelected`.

## [2.0.0] — 2026-04

### Removed

- 3 built-in agents (`websearch`, `explore-codebase`, `action`) — Claude Code now ships these natively.

### Changed

- Component count down from 28 → 25.
- Plugin marketplace manifest set to `strict: false`.

## [1.4.0] and earlier

Initial public releases. See git history for details.

[Unreleased]: https://github.com/James10192/iroko/compare/v2.2.1...HEAD
[2.2.1]: https://github.com/James10192/iroko/releases/tag/v2.2.1
[2.2.0]: https://github.com/James10192/iroko/releases/tag/v2.2.0
[2.1.0]: https://github.com/James10192/iroko/releases/tag/v2.1.0
[2.0.1]: https://github.com/James10192/iroko/releases/tag/v2.0.1
[2.0.0]: https://github.com/James10192/iroko/releases/tag/v2.0.0
