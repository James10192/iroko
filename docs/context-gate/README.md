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

**Prerequisites:** Node >=20, a Git repository with at least one commit,
reviewed architectural documents and a carefully prepared
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
two local hooks into `.claude/settings.local.json`:

- `UserPromptSubmit`: synchronous context load with `onFailure: block`.
- `PreToolUse`: scoped tool protection for `Write|Edit|MultiEdit|NotebookEdit|Bash|mcp__.*`,
  also configured `onFailure: block`.
- `PostCompact`: invalidates the previous write permit after compaction.
  Because Claude Code does not permit a PostCompact hook to reinject context,
  the next submitted prompt must reprepare the documents before further writes.

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

## Security and usability limitations

- Context compaction can remove earlier instructions from the model's active
  window; IROKO revokes the current permit on `PostCompact` so that it cannot
  keep writing on that stale assumption. This intentionally interrupts work
  until the next preflight-capable prompt.
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
