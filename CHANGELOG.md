# Changelog

All notable changes to **iroko** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
following the rules in [`rules/iroko-versioning.md`](./rules/iroko-versioning.md).

## [Unreleased]

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

[Unreleased]: https://github.com/James10192/iroko/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/James10192/iroko/releases/tag/v2.2.0
[2.1.0]: https://github.com/James10192/iroko/releases/tag/v2.1.0
[2.0.1]: https://github.com/James10192/iroko/releases/tag/v2.0.1
[2.0.0]: https://github.com/James10192/iroko/releases/tag/v2.0.0
