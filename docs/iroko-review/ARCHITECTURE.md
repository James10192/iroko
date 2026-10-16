# IROKO Review — Architecture Decision Record ADR-2026-10-16

## Decision: add PR review as an experimental vertical slice

Existing repository: \`James10192/iroko\`, current root CLI v4.0, pre-existing agent skills/rules/hooks. Preserve these: work on a dedicated branch and obtain review before merging.

Sequence:

1. Developer opens GitHub PR. IROKO CLI retrieves read-only changed filenames and bounded patches using GitHub API.
2. IROKO Cortex Lite selects only **approved** project decisions from a version-controlled JSON file.
3. An AI reviewer receives a short bounded decision context plus untrusted patch text; returns JSON findings.
4. A validation boundary drops findings referring to unknown paths or invented decision IDs.
5. CLI renders human-readable report or JSON, and logs token usage. It NEVER auto-comments or approves a PR in this prototype.
6. For evaluation, \`--baseline\` removes selected decisions while keeping the rest of the pipeline fixed.

Architectural separation: GitHub adapter (input), decision selection (logic), model adapter (analysis), validation (output), CLI (transport). The review engine is a **read-only observer** of GitHub state, not a code executor.

Threat model: external PR patch instructions can attempt prompt injection; ignore them as instructions, bound payloads, and parse/validate model output. Credentials from environment only; never place secrets in model messages. Since the model reads source snippets, running this on private repos requires approval for third-party model data processing.

Next phases: (1) independent evaluation fixture dataset, (2) model-provider abstraction/AI SDK adapter, (3) optional GitHub App with least-privilege metadata/pull-request permissions, (4) human-gated review comment posting, (5) general IROKO coding-agent runtime with sandboxed tool gateway. Each phase requires security and benchmark tests.

Reasoning: A PR reviewer is a narrower, reproducible Software Engineering artefact than an autonomous agent, yet still tests the core hypothesis about contextual product decisions. This is a **change of research question** relative to the earlier Classkick topic: tutor approval is mandatory before adopting it for COM6301. COM6300 remains separate.
