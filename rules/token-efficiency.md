# Rule: Token Efficiency

## Agent limits

- Maximum **4 parallel agents** per launch (e.g. critic + 3 research agents).
- Each agent consumes a full context window — never launch an agent for a trivial lookup.
- Use direct Grep/Glob/Read for simple searches. Reserve agents for multi-step exploration.

## When to use agents vs direct tools

The distributed agents are exactly: `critic`, `explore-codebase`, `explore-docs`, `websearch`.

| Task | Use |
|------|-----|
| Find a specific file/function | Grep or Glob directly |
| Understand a module (5+ files) | Agent `explore-codebase` |
| Check one API signature | ctx7 CLI directly (Bash) — see `docs-first` rule |
| Research a library for implementation | Agent `explore-docs` or the `/read-docs` skill |
| Quick web lookup | WebSearch directly |
| Multi-source web research | Agent `websearch` |
| Challenge a plan before coding | Agent `critic` |

## When to parallelize

- **Research phase:** critic + explore-codebase + explore-docs + websearch (4 max).
- **Implementation:** independent file groups (e.g. backend + frontend) that share no state.
- Any 2+ genuinely independent tasks.

## When NOT to parallelize

- Tasks with sequential dependencies (the schema must exist before the mutations).
- When one agent's output is the input of another.
- Trivial tasks that take under 30 seconds directly.

## Launch pattern

Launch all independent agents in a SINGLE message with multiple Agent tool calls.
Never launch them one at a time if they can run in parallel.

```
# GOOD: one message, multiple agents
Agent 1: critic
Agent 2: explore-codebase
Agent 3: explore-docs
Agent 4: websearch

# BAD: sequential launches
Agent 1: critic → wait → Agent 2: explore-codebase → wait → ...
```

Use `run_in_background: true` for agents whose results you do not need immediately;
keep working while they run.

## Synthesize, don't relay

After parallel agents complete, SYNTHESIZE their findings into one coherent view.
Never paste each agent's output back to back — extract what matters, resolve
contradictions, and state the conclusion.

## Skill invocation

- Check whether a skill exists before doing something manually.
- If the user types /something, invoke that skill immediately.
- Never duplicate work a subagent is already doing.

## Output efficiency

- Go straight to the point. No filler, no preamble.
- Don't restate what the user said.
- If you can say it in 1 sentence, don't use 3.
- Code speaks louder than explanations.

## Memory

- Don't save ephemeral task details to memory.
- Don't save things derivable from code or git history.
- Save only surprising user corrections, preferences, or external references.

## En clair (FR)

Chaque agent lancé coûte l'équivalent d'une conversation entière en tokens. Cette
règle évite de gaspiller : recherche directe (Grep, lecture de fichier) pour les
questions simples, agents seulement pour les explorations à plusieurs étapes,
jamais plus de 4 en parallèle, lancés en un seul message, et un résumé synthétique
au lieu de coller leurs rapports bout à bout. Résultat : moins de tokens brûlés
pour le même travail.
