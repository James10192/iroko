# IROKO: Evidence base and research roadmap for UX-centred AI-assisted development

> Status: research and product strategy, not an assertion of experimentally validated performance.
> Reviewed: 15 October 2026. Owner: IROKO project. Proposed academic use: BEng Software Engineering, COM6301 (subject to supervisor approval).

## Executive thesis

IROKO aims to help AI coding agents deliver software that is **functionally correct, usable, accessible, maintainable and verifiably aligned with user requirements**, without excessive developer time, context or inference spend. More generated code is not the same as more useful software.

The academic question is not whether IROKO is superior (that has **not** been established), but whether a **lightweight UX-centred planning and verification workflow** can improve outcomes enough to justify its overhead.

## 1. What is an agent harness?

A coding model generates candidate reasoning and code. An agent runtime/harness coordinates tool access, execution loops, permissions, context and feedback, recovery, and validation. A separate product-level workflow layer can guide that runtime using rules, skills and quality gates.

**Current architecture boundary:** IROKO is principally an installable workflow/guardrail layer for existing coding agents, not an independent general-purpose agent runtime. Its CLI distributes rules, skills, agents and guards; a full application boilerplate generator is a **future product direction**, not an existing complete capability.

## 2. Evidence: promise, trade-offs, and uncertainty

| Source | Finding relevant to this project | Interpretation / limitation |
| --- | --- | --- |
| [OpenAI, Harness engineering (2026)](https://openai.com/index/harness-engineering/) | An agent-first internal product used repository maps, automated checks, browser observability and recurring cleanup to constrain drift; team estimated substantially faster development. | Vendor case study; its estimated speedup is not a controlled or generalizable causal result. |
| [Anthropic, Effective harnesses for long-running agents (2025)](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) | Long-running tasks suffer across context-window boundaries; initialization, persistent progress and incremental delivery improve continuity. | Engineering guidance, not proof that any particular IROKO workflow improves outcomes. |
| [Gloaguen et al., Evaluating AGENTS.md (2026)](https://www.sri.inf.ethz.ch/publications/gloaguen2026agentsmd) | Repository context files did not improve overall task success in studied settings, while raising inference cost by more than 20%. | Additional instructions can be counterproductive; contextual minimalism should be tested, not assumed. |
| [METR, Developer productivity experiment update (2026)](https://metr.org/blog/2026-02-24-uplift-update/) | Early-2025 experiment observed 19% longer task times with AI for experienced open-source contributors. Later results suggest changed conditions but are affected by selection and time-measurement biases. | No universal AI productivity multiplier should be claimed. |
| [DORA, State of AI-assisted Software Development (2025)](https://dora.dev/research/2025/dora-report/) | AI tends to amplify strengths and weaknesses of the surrounding software-delivery system. | Process design and feedback loops matter; DORA does not specifically validate IROKO. |
| [Abu Doush and Kassem, AI-generated accessible web code (2025)](https://doi.org/10.1007/s10209-025-01250-2) | Generated web components can be semantically valid yet fail accessibility checks without further guidance and human intervention. | Code validity or a passing unit test does not imply usable, inclusive UI. |
| [W3C WAI, Evaluating web accessibility](https://www.w3.org/WAI/test-evaluate/) | Tools help find accessibility problems but cannot independently establish accessibility; human evaluation is required. | Automated audits must be supplemented by manual and task-based evaluation. |

## 3. Failure modes over the lifetime of an AI-built application

1. **Context loss and stale guidance:** handovers across agent sessions can forget decisions; oversized or outdated instruction files consume attention and give conflicting signals.
2. **Codebase entropy:** agents can perpetuate existing suboptimal patterns, increasing duplication, complexity and future correction costs. This is a *risk mechanism*, not a measured effect size for IROKO.
3. **Unverified correctness:** passing tests may cover the wrong contract, miss edge cases, or fail to validate the real user journey.
4. **UX debt:** layouts that look polished may still have confusing placement, ambiguous affordances, missing feedback, poor mobile ergonomics or inaccessible controls.
5. **Harness overhead:** extra agents, plans, prompts and reviews can consume tokens and human approval time without improving the delivered result.
6. **Weak developer understanding:** generated code can be accepted without adequate reasoning about its architecture or security.
7. **Performance degradation:** unnecessary client scripts, heavy bundles and motion effects can harm responsiveness and visual stability.

These are threats to investigate; their prevalence and causality require controlled evidence.

## 4. The actual IROKO building blocks (repository evidence)

| Step | Present components | What is verifiable now |
| --- | --- | --- |
| Frame | skills/cadrer, skills/plan-and-confirm, skills/pick-stack | Problem framing, stack selection, explicit plan approval |
| Illustrate | skills/sketch | Distinct low-fidelity UI options and visual choice before code |
| Document | skills/read-docs, rules/docs-first | Prefer current documentation to guesses |
| Build | skills/batir, skills/oneshot, skills/motion | Incremental implementation, lint/types/tests; motion API and reduced-motion guidance |
| Verify | skills/visual-check, skills/verdict, rules/quality-gate, rules/ship-quality | Browser checks, structural review, UI states, responsive and safety requirements |
| Maintain | rules/stay-in-scope, rules/token-efficiency, guard-destructive | Scope discipline, cost awareness and blocking of risky commands |

**Product vision, not shipped functionality:** optional full-stack starter/boilerplate, reusable accessible UI foundations, portable agent integrations, long-term quality tracking and evidence-linked release reports. A feature must be implemented and tested before it can be advertised as available.

## 5. Proposed differentiator: an evidence-linked Quality Contract

For a user-visible feature, record a **compact, testable contract** linking:

- **Intent:** user task, context, success criteria, responsive and accessibility requirements, error/loading/empty/success states.
- **Design:** approved information hierarchy, primary action placement, navigation and feedback, optionally a selected sketch.
- **Implementation:** trace from acceptance criteria to modified components and APIs.
- **Evidence:** independent functional tests, browser journey checks, manual accessibility review, user-task observations and measured performance.
- **Cost:** time, human interventions, model usage, retries and rework.

Prefer progressive disclosure: only the checks justified by the type and risk of the change should execute. A text correction should not activate a multi-agent architecture review; a payment or authentication change requires stronger safeguards. Record the reason a gate was or was not applied.

**Research hypothesis, not claim:** an evidence-linked workflow improves the final quality of generated web interfaces more than it increases development cost. A counter-hypothesis is that the extra process worsens efficiency or does not improve outcomes.

## 6. UX/UI is a first-class quality dimension

Assess both **automatable issues** and **human usability**. Potential measures:

- Functional: independently specified acceptance-test pass rate; regressions after a follow-on change.
- Accessibility: detected WCAG issues plus independent keyboard, screen-reader and semantic checks; no single tool proves conformance.
- User experience: task completion rate, time on task, user errors, navigation recoveries and a brief standardized satisfaction instrument.
- UI integrity: responsive layout tests at predeclared viewport sizes, visible system-state feedback and broken-interaction checks.
- Performance: page-loading, interactivity and stability where applicable (LCP, INP, CLS); compare under the same hardware/network conditions. See [web.dev Core Web Vitals](https://web.dev/articles/defining-core-web-vitals-thresholds/).
- Maintainability: independent review of complexity, duplicated logic and architecture violations; repeated-change regressions.
- Efficiency: wall time, tokens/API spend, agent turns, human approval time, corrections and repair cycles.

Aesthetic preference should not be conflated with usability; establish task-based criteria before looking at the generated interfaces.

## 7. Competitor positioning and falsifiable differentiation

- [GitHub Spec Kit](https://github.com/github/spec-kit) already supports specification-driven planning, implementation and verification.
- [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD) already offers role-oriented workflows including UX-related guidance.
- Claude Code, Codex and similar agent systems already provide planning, tools, coding and review primitives.

Therefore **planning + skills + UX rules are not inherently novel**. IROKO's *candidate* differentiation is an **adaptive, low-overhead, evidence-linked quality workflow** that connects user intent and UX decisions to functional and usability evidence. It must be benchmarked against meaningful baselines and existing frameworks before any comparative marketing claim.

## 8. COM6301 proposal (scope deliberately limited)

**Proposed title:** Design and Evaluation of a Lightweight UX-Centred Quality Framework for AI-Assisted Web Development.

**Research question:** To what extent can a lightweight, UX-centred quality framework improve the functional correctness and usability of AI-generated web applications without imposing excessive development overhead?

**Aim:** Design and evaluate a narrowly scoped quality-contract workflow derived from selected IROKO components.

**Research objectives:**

1. Critically review research on coding-agent harnesses, productivity measurement, AI-generated UX/accessibility and software maintainability.
2. Define observable criteria for correctness, usability, accessibility, responsiveness and development overhead.
3. Implement or configure a small experimental quality-contract workflow using existing IROKO capabilities.
4. Compare outcomes under controlled development conditions.
5. Evaluate findings and threats to validity, including negative or mixed results.

**Conditions (proposed ablation):**

- **A — Base AI coding:** a single coding agent with the functional specification and baseline tools.
- **B — Plan-focused:** the same agent, model, starter and task, plus a concise, approved plan and functional criteria.
- **C — IROKO UX quality:** same as B plus a defined UX contract, sketch choice where relevant, browser/user-journey verification and explicit evidence capture.

**Tasks:** e.g. a small form, filtered management view and dashboard with user interactions. Use a common starter so boilerplate quality does not confound the harness effect. Include at least one later change to test maintainability and regressions. Task count, replications and participant testing require supervisor sign-off and resource planning.

**Controls:** same model/version, prompts and task wording, development environment and starter; isolated clean workspaces; pre-registered acceptance criteria; repeated runs and randomized condition order where feasible; blind outcome assessment when possible. Keep development data separate from held-out assessment tasks.

**Outputs:** proposal, related-work review, architecture/quality-contract prototype, reproducible tasks and test scripts, anonymized evaluation data, analysis of functional+UX+overhead trade-offs, limitations and final report.

**Ethics and academic integrity:** obtain supervisor approval, check the institution's AI-use rules, obtain consent for any human participants, avoid collecting unnecessary personal data and disclose pre-existing IROKO work. No fabricated user-test results and no claims of causality beyond the design's evidence.

**Academic boundary:** the project does **not** promise to build all of IROKO, ship a commercial SaaS, prove universal superiority, or validate long-term multi-year maintainability.

## 9. Prioritized product research backlog (not implemented)

| Priority | Investigation | Exit criterion |
| --- | --- | --- |
| P0 | Define a machine-readable and human-readable quality-contract schema | Can map each acceptance criterion to a planned verification step |
| P0 | Run a small A/B/C pilot before broad implementation | Captures correctness, UX and total cost with reproducible scripts |
| P1 | Adaptive gate selection by task risk and visual impact | Demonstrates which checks were chosen, skipped and why |
| P1 | Browser-based UX journey evidence and human-review checkpoints | Produces a traceable report without claiming fully automated usability certification |
| P2 | Starter/boilerplate with optional accessible components | Documented feature boundaries, functional tests and versioned templates |
| P2 | Longitudinal maintainability and drift tests | Repeated changes with quantitative regression and structure measurements |

## 10. What can be said publicly, now?

**Defensible:** IROKO is an open-source set of workflows and safeguards spanning framing, visual design, implementation and verification. Research indicates that agent context, oversight, UX and quality controls matter, and that extra structure can also increase cost.

**Not yet defensible:** 'IROKO makes coding agents faster', 'IROKO guarantees better UX', 'IROKO removes technical debt', or 'IROKO is the first UX-aware harness'. These require controlled comparative evidence.

**Short positioning statement:** *IROKO is an evolving UX-centred workflow layer for AI-assisted software development, designed to make user requirements, implementation decisions and quality evidence traceable from idea to release.*

## References

1. Lopopolo, R. (2026). [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/). OpenAI, 11 February.
2. Anthropic (2025). [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), 26 November.
3. Gloaguen, T. et al. (2026). [Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?](https://www.sri.inf.ethz.ch/publications/gloaguen2026agentsmd). ICLR 2026 workshop.
4. METR (2026). [We are Changing our Developer Productivity Experiment Design](https://metr.org/blog/2026-02-24-uplift-update/), 24 February.
5. DORA (2025). [State of AI-assisted Software Development](https://dora.dev/research/2025/dora-report/).
6. Abu Doush, I. and Kassem, R. (2025). [Can generative AI create accessible web code?](https://doi.org/10.1007/s10209-025-01250-2). Universal Access in the Information Society.
7. W3C WAI. [Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/).
8. web.dev. [How the Core Web Vitals metrics thresholds were defined](https://web.dev/articles/defining-core-web-vitals-thresholds/).
9. GitHub. [Spec Kit](https://github.com/github/spec-kit).
10. BMAD. [BMAD Method](https://github.com/bmad-code-org/BMAD-METHOD).

---

### Résumé en français

IROKO vise la qualité *du logiciel livré*, et pas uniquement la vitesse de génération du code. Sa recherche académique doit tester, sur un périmètre réduit, si un contrat qualité intégrant exigences fonctionnelles, UX, accessibilité, tests réels et coût de développement améliore les résultats. Les bénéfices et l'originalité restent des hypothèses, non des résultats acquis.
