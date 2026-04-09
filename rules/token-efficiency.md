# Rule: Token Efficiency

## Agent limits

- Maximum **4 parallel agents** per launch (critic + 3 research, or 4 implementation)
- Each agent consumes a full context window — don't launch agents for trivial lookups
- Use direct Grep/Glob/Read for simple searches. Reserve agents for multi-step exploration.

## When to use agents vs direct tools

| Task | Use |
|------|-----|
| Find a specific file/function | Grep or Glob directly |
| Understand a module (5+ files) | Agent (explore-codebase) |
| Check one API signature | ctx7 CLI directly (Bash) |
| Research a library for implementation | Agent (explore-docs) or /find-doc skill |
| Quick web lookup | WebSearch directly |
| Multi-source research | Agent (websearch) |

## Skill invocation

- Check if a skill exists before doing something manually
- If the user says /something, invoke the Skill tool immediately
- Don't duplicate work that a subagent is already doing

## Output efficiency

- Go straight to the point. No filler, no preamble.
- Don't restate what the user said.
- If you can say it in 1 sentence, don't use 3.
- Code speaks louder than explanations.

## Memory

- Don't save ephemeral task details to memory
- Don't save things derivable from code or git history
- Save only surprising user corrections, preferences, or external references
