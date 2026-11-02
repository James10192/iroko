# IROKO Context Gate — research prototype (not production-ready)

Issue #12. This is an isolated proof of concept, NOT wired into IROKO v4
\`init\`, npm releases, existing global hooks or existing user projects.

## What the code really enforces

- \`prepare.cjs\` loads explicitly listed *project* sources and prints their
  complete contents (bounded at 32 KB) to the agent's tool output. It stores
  an expiring fingerprint of those sources, policy and Git HEAD.
- \`hook.cjs\` is a Claude Code \`PreToolUse\` guard for the tool classes it is
  actually configured to intercept. Before preparation, \`Write\`/\`Edit\`/
  \`MultiEdit\`/\`NotebookEdit\` are blocked (exit 2). After preparation,
  file writes are allowed only within configured \`writeScopes\`. A changed
  source, policy, Git HEAD, expired state, or symlink path blocks them again.
- To avoid shell-writing bypasses in this narrow prototype, \`Bash\` is
  limited to a short allowlist of *single-command*, read-only probes and
  the exact preparation command. It intentionally blocks builds, tests,
  package managers and all other shell commands: NOT a full development
  runtime. Use a supervised shell / sandbox for a practical production agent.
- \`verify.cjs\` independently checks project-defined forbidden *literal*
  import strings inside selected source directories. This is a demonstrator
  of deterministic decisions, NOT a complete semantic architecture checker.

**Not proven:** that the model read, understood, agreed with or applied
every source; that every relevant project decision was found; that other
tools (MCP, alternate terminals, file APIs) are intercepted; or that this
repository-local state cannot be tampered with by a capable process.
No production security claims and no benchmark performance claims.

## How to run locally against an isolated sample project

1. Use Node.js >=20. Copy the \`prototypes/context-gate\` folder into
   the **sample repository** and create \`iroko.context.json\` at its root.
2. Write and approve *that project's* real decisions. Specify exact
   \`sources\` (existing regular text files) and \`writeScopes\` (paths
   ending in \`/\` for directories or exact file paths).
   See \`prototypes/context-gate/examples/\` for a fictional starting point.
3. Set the Claude project-local settings \`.claude/settings.json\` to include
   the following hook entry, **merged with existing hooks**, never replacing
   \`guard-destructive\` or existing configuration:

\`\`\`json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit|MultiEdit|NotebookEdit|Bash|mcp__.*",
      "hooks": [{
        "type": "command",
        "command": "node prototypes/context-gate/hook.cjs",
        "timeout": 10
      }]
    }]
  }
}
\`\`\`

4. Run the tool **inside the project** and keep its full output in the
   agent's working context:

\`\`\`sh
node prototypes/context-gate/prepare.cjs ISSUE-123
\`\`\`

5. Only now attempt a scoped \`Write\` or \`Edit\`. To check deterministic
   project policies independently (including from CI), run:

\`\`\`sh
node prototypes/context-gate/verify.cjs
\`\`\`

Both the hook and verifier need \`CLAUDE_PROJECT_DIR\` or the correct CWD.
No automatic activation occurs merely by installing IROKO. The policy is
**per project**, never hardcoded globally.

## Tests

\`\`\`sh
node --test prototypes/context-gate/context-gate.test.cjs
\`\`\`

Tests cover missing evidence, valid preparation, out-of-scope writes,
source mutation, expiry, shell escape attempts, symlinks, missing sources,
and independently detected architectural violations.

The repository workflow \`context-gate-prototype.yml\` runs these tests
on the draft PR. It tests the prototype; it does **not** claim to audit
all other pull requests in unrelated repositories.

## How a genuine mandatory PR gate must be deployed later

1. Move the verifier to a trusted workflow or GitHub App that cannot be
   silently weakened by the PR branch. Load policy from protected base,
   and evaluate the changed code, not an agent's self-written report.
2. Add the check as a **required status check** in branch protection /
   repository rulesets and restrict bypass permissions. A CI workflow
   without branch protection does not prevent merging.
3. Treat issue/PR events as triggers for *re-evaluation*, not as proof
   that an agent read a document. Record source hashes, branch/head,
   decision IDs, scoped files and verification outcomes.
4. For a real pre-write guarantee, run the agent in a sandbox where
   unmediated filesystem writes and uncontrolled MCP tools are not
   available. Hook-based control is only as comprehensive as the tools
   and permission boundaries it covers.
5. Repeat preflight when an issue, source decision, scope or Git head changes;
   offer human review for conflicting / undocumented product decisions.

## Research evaluation boundary

Compare the same agent, tasks, source availability and model across:
A) ordinary repository access;
B) context preflight;
C) context preflight + runtime checks + independent PR checks.

Measure actual implementation compliance separately from process evidence.
Do not interpret passing hook tests as proof of model understanding.
