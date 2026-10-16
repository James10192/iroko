# IROKO Review — COM6301 experimental vertical slice

**Status: draft PR / research prototype; not a production reviewer or a tutor-approved submission.**

The existing iroko v4 CLI provides installable Claude Code guidance and hooks. This experimental feature adds a different, measurable capability without replacing those flows: GitHub pull-request change analysis **against approved project decisions**.

## Run (after checking out this branch)

- Install existing repo dependencies (pnpm install), then build with pnpm build.
- Copy \`examples/iroko-review/decisions.example.json\` to \`.iroko/decisions.json\` **or provide --decisions explicitly**.
- Offline smoke: \`node dist/cli.js review --repo James10192/iroko --pr 1 --decisions examples/iroko-review/decisions.example.json --offline\`
- For a real AI review: set \`OPENAI_API_KEY\` in your shell, then call \`node dist/cli.js review --repo OWNER/REPO --pr NUMBER --decisions path/to/decisions.json --model gpt-4o-mini\`.
- For private repos / higher API limits, optionally set a **read-only** \`GITHUB_TOKEN\`. Never check tokens into source control.
- \`--baseline\` runs with zero product decisions, using the same model and changed files. \`--json\` produces machine-readable output.
- Tests: \`pnpm test:review\`.

**Never execute PR code to review it.** This prototype only fetches PR metadata and patch text. It does not publish GitHub comments, post approvals, run untrusted tests, or write code. Every AI finding is advisory and must be human reviewed.

## Data contract

Decisions are human-approved JSON entries, with id, statement, status, source, and file scopes. Only approved and relevant records are provided to the model. Draft/superseded records are excluded. Scopes are simple exact paths or a prefix ending in \`*\`, not arbitrary regular expressions.

Selection is **transparent and deterministic**, using changed-file path matches and lexical overlap. This is intentionally modest: it is not an embedding database, a proven semantic memory, or a guarantee of relevance. Provenance is included in the prompt. The model sees bounded untrusted patch text and must return JSON findings. The validator checks changed file names, provided decision IDs and basic fields, but **does not prove semantic correctness** of model evidence or assertions.

## Research evaluation

**Question:** To what extent does selectively retrieved, approved project knowledge improve AI-assisted PR reviews in detecting project-specific requirement violations?

Use a fixed set of seeded PR diffs with an independently created ground truth. Compare **A: identical reviewer with no Product Compass entries** and **B: identical reviewer with selected approved entries**, holding model, prompts aside from decisions, code diffs and settings constant.

Measure precision, recall, false positives, traceability to rule IDs, time and API tokens. Repeat samples, randomise order, record model versions and confidence intervals if feasible. Some false positives may persist despite validation: automated reviewer output is not the ground truth.

## Limitations and integrity

A coding-agent SDK and autonomous patching loop are **not implemented here**. The initial provider adapter uses the standard OpenAI Chat Completions HTTP API; a Vercel AI SDK adapter can replace it when evaluation needs multi-provider support. There is no web cockpit or webhook worker yet. This vertical slice extends the existing iroko CLI while preserving the original installation/skill behavior.

The dissertation must be personally written by the student in accordance with COM6301 AI-use restrictions. This code is a proposal for review and learning, **not an approved or completed academic artefact**.
