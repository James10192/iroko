# COM6301 — proposed topic decision (discussion draft)

**Working title:** Design and Evaluation of a Context-Aware Pull Request Review System for Project-Specific Requirements.

**Aim:** design, implement and empirically evaluate a functioning read-only PR review prototype that uses verified, selectively retrieved project knowledge to identify potential requirement violations.

**Main research question:** To what extent does selectively retrieved project knowledge improve AI-assisted pull request reviews in detecting violations of project-specific requirements?

**Users:** individual web developers and small teams reviewing changes to established applications.

**Functional requirements:** FR1 ingest approved project decisions with provenance; FR2 retrieve bounded relevant context for the PR; FR3 read GitHub PR files and patches via read-only API; FR4 generate AI review recommendations referencing decision IDs; FR5 validate structural references and export report/JSON; FR6 compare baseline vs contextual conditions.

**Non-functional requirements:** NFR1 no PR code execution; NFR2 no automatic GitHub write permissions; NFR3 protect credentials and account access; NFR4 repeatable, documented benchmark and logs; NFR5 clear failure handling and bounded context; NFR6 accessible reporting as a later concern.

**Initial stack:** TypeScript, Node.js/CLI already present in IROKO, Node fetch for GitHub API and initial model adapter, native JSON knowledge file, node:test via tsx. No SaaS backend, DB, app dashboard or new hosted service required for this phase.

**Planned methodology:** iterative implementation with requirements + tests; construct independent labelled PR fixtures; randomised A/B review of the same diffs and provider settings; report precision/recall, false positives, source traceability, input/output tokens, time and cost per reviewed PR. Admit small sample limits.

**Plausible timetable (not official):** proposal validation October 2026; build local review pipeline November; construct labelled dataset and pilot December–January; execute replicable evaluation February–March; dissertation and demonstration April 2027. The lecture-note milestones 19 Oct draft / 31 Oct final proposal / 18 Dec interim chapters require Moodle confirmation.

**Risks:** reduced ambition relative to full IROKO coding agent, insufficient journal/book references, models falsely citing evidence, data leakage from private PRs, changed question from COM6300 topic. Mitigations: explicitly preserve full-product roadmap separately, controlled sample repos, human reference annotations, hard limits, tutor approval, academically honest claims.

**Important academic caveat:** lecture notes for Dr Loraine indicate strong restrictions on AI-written and AI-translated submissions. This is preparatory technical documentation only; the student must write and approve submitted academic work in their own words.
