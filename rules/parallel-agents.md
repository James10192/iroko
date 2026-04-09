# Rule: Parallel Agent Conventions

## When to parallelize

- **Research phase:** critic + codebase explorer + doc researcher + web search = 4 agents max
- **Implementation:** independent file groups can be parallelized (e.g., backend + frontend)
- **PR review:** code-reviewer + type-design + silent-failure-hunter in parallel
- **Any 2+ independent tasks** that don't share state

## When NOT to parallelize

- Tasks with sequential dependencies (schema must exist before mutations)
- When one agent's output is needed as input for another
- Trivial tasks that take < 30 seconds manually

## Launch pattern

Always launch all independent agents in a SINGLE message with multiple Agent tool calls.
Never launch them one at a time sequentially if they can run in parallel.

```
# GOOD: Single message, multiple agents
Agent 1: critic
Agent 2: explore-codebase
Agent 3: find-doc
Agent 4: websearch

# BAD: Sequential launches
Agent 1: critic → wait → Agent 2: explore → wait → ...
```

## Background agents

Use `run_in_background: true` for agents whose results you don't need immediately.
Continue working while they run. You'll be notified when they complete.

## Synthesize, don't relay

After parallel agents complete, SYNTHESIZE their findings into a coherent plan.
Don't just paste each agent's output — extract what matters and resolve contradictions.
