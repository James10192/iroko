# IROKO Context Gate — opt-in alpha

Issue [#12](https://github.com/James10192/iroko/issues/12), draft PR
[#13](https://github.com/James10192/iroko/pull/13).

**Status:** research prototype; not a hardened sandbox or universal
architecture-policy engine. Existing users are unaffected unless they
explicitly activate the feature in a project.

## What is actually guaranteed

When the local Claude Code hooks are enabled and running normally:

1. A synchronous `UserPromptSubmit` hook loads the *approved project sources*
   on **each submitted prompt** and emits their contents into the model context.
   The record is linked to the session ID, Git HEAD, source/policy fingerprint
   and a 20-minute expiry. The hook blocks the turn if preparation fails.
2. A `PreToolUse` hook denies covered file writes unless a matching context
   record exists and the path is in `writeScopes`. It rejects attempts to
   modify `.git/`, `.claude/`, `.iroko/` and `iroko.context.json`.
3. The same hook only permits a narrow set of exact *read-only* Bash commands.
   **Builds, tests, arbitrary shell commands, and all unclassified MCP tools
   are intentionally blocked in this alpha.** This is a deliberately strict
   research mode, not a smooth general development runtime.
4. The independent verifier detects project-configured literal forbidden
   patterns under specified directories, failing if a required directory is
   missing. The included GitHub Actions jobs test the gate and CLI installer.

**Not guaranteed:** an LLM has understood or followed the sources; a project
has documented every relevant decision; that a native host process, unrestricted
terminal or another application cannot write to the worktree; that locally
editable proof files cannot be forged; or that a literal match detects every
semantic architectural violation.

## Install locally (after the alpha is merged and released)

**Prerequisites:** Node >=20, **Claude Code v2.1.295 or later** for reliable
fail-closed `onFailure: "block"` hooks, a Git repository with at least one
commit, reviewed architectural documents and a carefully prepared
`iroko.context.json` file.

The configuration is per-project, **not** a global rule and does not invent
the organization's architecture. For example:

```json
{
  "schemaVersion": 1,
  "sources": [
    "docs/architecture/ADR-001.md",
    "src/integrations/ContactProvider.ts"
  ],
  "writeScopes": ["src/integrations/", "tests/integrations/"],
  "forbiddenPatterns": [{
    "id": "vendor-independent-core",
    "pathPrefix": "src/core/",
    "literal": "@crm-vendor/sdk"
  }]
}
```

Create only sources and paths that are **actually present** and approved in
the target project. A trailing slash in a write scope means "this directory
and its descendants"; other write scopes are exact file paths. Do not list
secrets, credentials, `.env` files or private keys as sources.

From the target project's root, after obtaining a CLI version that includes
this alpha:

```sh
iroko context init
iroko context doctor
```

Until publication, development-branch testing can use:
`pnpm build`, then `node /path/to/iroko/dist/cli.js context init`.
Do **not** run `npx @james10192/iroko` expecting unreleased features.

The installer copies the small runtime to `.iroko/context-gate/` and **merges**
four local hooks into `.claude/settings.local.json`:

- `SessionStart`: automatically injects current approved context on session
  start, resume, clear or compact; the subsequent pre-tool guard still blocks
  writes if preparation failed.
- `UserPromptSubmit`: synchronous context load with `onFailure: block`.
- `PreToolUse`: scoped tool protection for `Write|Edit|MultiEdit|NotebookEdit|Bash|mcp__.*`,
  also configured `onFailure: block`.
- Hooks are invoked using the direct `node` executable and arguments rather
  than a shell command, avoiding shell quoting differences across platforms.
  An existing hook wired without `onFailure: "block"` is refused rather than trusted.
- `PostCompact`: invalidates the previous write permit after compaction.
  `SessionStart(source=compact)` then re-injects approved decisions where
  supported; otherwise the next `UserPromptSubmit` must reprepare before writes.

Existing unrelated Claude hooks and permissions are preserved. Re-running
`context init` is idempotent when the runtime files are unchanged. A modified
runtime copy or malformed local settings causes a refusal, not a silent
overwrite. The installer does not modify global `~/.claude` settings, your
`AGENTS.md`, or `CLAUDE.md`.

**Local settings may not be committed.** To share the gate across a team,
distribute the approved project policy and reviewed hook setup under source
control, make sure a trusted runtime is installed, and protect these sources
with repository rules and review.

## Manual and CI checks

```sh
node .iroko/context-gate/verify.cjs
```

This verifier checks a deliberately limited, deterministic rule type. Passing
it does not mean the project architecture is compliant in every respect.

The manual `prepare.cjs` prints a diagnostic snapshot. It intentionally
does not give a live session a write permit unless explicitly bound to a
session; the automatic prompt hook is the normal path.

For IROKO contributors, the two suites are:

```sh
node --test prototypes/context-gate/context-gate.test.cjs
# Build the CLI first:
pnpm build
node --test prototypes/context-gate/context-install.test.cjs
```

## GitHub Actions and issue/PR workflow

The **IROKO repository's** CI currently verifies this alpha, the npm package,
existing CLI smoke, and the installer. It **does not** automatically enforce
consumer-project architecture on other repositories.

Suggested target-project lifecycle:

1. Issue documents the requested outcome and points to **approved decisions**
   and tests; an issue alone must not create new "approved" rules.
2. Developer/agent starts a task; the prompt hook provides relevant documented
   context; the pre-tool hook blocks covered unauthorized modifications.
3. PR CI independently checks source-code constraints from protected,
   **base-branch** policy. For a strong check, execute trusted verifier logic
   from a protected version, not a script supplied by the PR author.
4. Require that status in GitHub Rulesets/branch protection with **required
   status checks**, and require a PR review. Avoid `pull_request_target`
   executing untrusted PR code with elevated credentials.

See:
- https://code.claude.com/docs/en/hooks
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target

**Repository setting still needed:** `protect-master` currently only disallows
deletion and non-fast-forward changes. Its requirements do not include passing
status checks. The current GitHub connector cannot change that setting.

## Reference PR gate using the approved base-branch policy

This alpha now includes `prototypes/context-gate/ci-check.cjs`, which accepts
a **trusted base-branch checkout** and a **candidate checkout**:

```sh
node trusted/.iroko/context-gate/ci-check.cjs trusted candidate
```

The checker reads the approved `iroko.context.json` and the checker code
**only** from the base checkout. The candidate's code is read as data, never
`require()`d, built or run. It rejects any candidate attempting to weaken
or remove the approved policy, then checks the candidate source tree against
the protected base policy using the available deterministic literal rules.

A commented example workflow is provided in
`prototypes/context-gate/examples/approved-policy-workflow.yml`. It uses
`pull_request_target` with **read-only permissions**, two isolated checkouts
and *no untrusted code execution*. It must not be casually modified to run
`npm install`, `build`, test scripts, `git hooks`, or any other candidate
commands: these would introduce a serious "pwn request" security risk. The
candidate is untrusted; treat it strictly as passive data.

The example assumes the checker and its dependencies have been deliberately
committed and reviewed on the protected target repository's base branch.
Running `iroko context init` locally alone does not install the workflow or
enable mandatory PR protection.

For a genuine gate, an administrator must configure the GitHub ruleset to
require **IROKO approved-project-policy** (matching the actual check name)
and restrict bypass permissions. Until then, CI is advisory. An issue can
trigger preparatory research but never attests to compliance by itself.

This verifier is still a **literal rule checker**, not an architecture-aware
static analyzer. Context decisions requiring semantic interpretation need
separate tests, analysis and review.

References: https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target
and https://code.claude.com/docs/en/hooks.

## Security and usability limitations

- Context compaction can remove earlier instructions. `PostCompact`
  invalidates the previous permit and Claude Code's `SessionStart` re-injects
  context after compacting; writes remain blocked if that refresh fails.
- Hook decisions are *not* OS-level filesystem permissions. Never claim a
  complete security guarantee without a controlled runner/sandbox where
  alternative write paths are unavailable.
- Bash allowlisting is intentionally stringent and blocks many daily developer
  workflows. A future revision should provide supervised build/test commands
  via a separate mediated tool, not relax the allowlist to arbitrary scripts.
- A project-controlled policy can be forged by someone with unrestricted write
  access, even if the same process later signs the fingerprint. In high-trust
  scenarios, the policy, verifier and authorization record need independent
  protected storage.
- Prompt injection in repository documents is a risk. Sources are data, not
  higher-priority instructions. Their contents should be reviewed.
- Automatic injection costs tokens each prompt (32 KB hard input limit); this
  release favors deterministic evidence over sophisticated retrieval. Future
  work should retrieve *only relevant approved documents* with coverage tests.
- Session/subagent behavior, provider differences (Codex and OpenCode), Windows
  shells, and real-world bypass resistance require separate end-to-end trials.

**Academic boundary:** an implementation passing CI is evidence about this
prototype only, not experimental proof that guided agents make better software.
For COM6300, compare agent conditions on separate labeled project decisions
with controlled tasks and independent outcome checks.

### Scope of supported environments

The integration has been exercised in Node-based CI fixtures on Linux. Direct
`node` hooks with `args` reduce shell-portability risk but **do not replace
real end-to-end testing** of Claude Code and subagents on Windows, macOS and
Linux. A supported `onFailure: block` feature requires Claude Code v2.1.295+.
If Claude Code is absent from the installation environment, `iroko context
init` prints an explicit compatibility warning and `context doctor` reports
`claudeVersionSupport: unverified`.
