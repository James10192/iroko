import type { Component } from "../types.js";

export const components: Component[] = [
  // ═══════════════════════════════════════════════
  // RULES — Loaded in every conversation
  // ═══════════════════════════════════════════════
  {
    name: "pre-commit-quality-gate",
    description: "Audit code on 4 axes (architecture, quality, production, SOLID) before every commit",
    type: "rule",
    origin: "custom",
    path: "rules/pre-commit-quality-gate.md",
    defaultSelected: true,
  },
  {
    name: "parallel-agents",
    description: "Launch up to 4 agents in parallel, synthesize results",
    type: "rule",
    origin: "custom",
    path: "rules/parallel-agents.md",
    defaultSelected: true,
  },
  {
    name: "token-efficiency",
    description: "When to use agents vs direct tools (Grep, Glob, Read)",
    type: "rule",
    origin: "custom",
    path: "rules/token-efficiency.md",
    defaultSelected: true,
  },
  {
    name: "use-available-tools",
    description: "Always check docs (ctx7, WebSearch) before coding with external APIs",
    type: "rule",
    origin: "custom",
    path: "rules/use-available-tools.md",
    defaultSelected: true,
  },
  {
    name: "marcel-global-preferences",
    description: "Personal: pnpm, French UI, no AI slop, no Co-Authored-By",
    type: "rule",
    origin: "custom",
    path: "rules/marcel-global-preferences.md",
    hint: "personal — adapt to your own preferences",
    defaultSelected: false,
  },

  // ═══════════════════════════════════════════════
  // SKILLS — Slash commands (/command)
  // ═══════════════════════════════════════════════
  {
    name: "commit",
    description: "Quality-gated commit: 4-axes audit, conventional message, auto-push",
    type: "skill",
    origin: "custom",
    path: "skills/commit",
    defaultSelected: true,
  },
  {
    name: "plan-and-confirm",
    description: "Critic + parallel research agents + plan + mandatory OKAY gate before coding",
    type: "skill",
    origin: "custom",
    path: "skills/plan-and-confirm",
    defaultSelected: true,
  },
  {
    name: "find-doc",
    description: "Look up library docs via ctx7 CLI + MCP + WebSearch before writing code",
    type: "skill",
    origin: "custom",
    path: "skills/find-doc",
    defaultSelected: true,
  },
  {
    name: "linkedin-post",
    description: "Generate a LinkedIn post from current work context, git history, or tech trends",
    type: "skill",
    origin: "custom",
    path: "skills/linkedin-post",
    defaultSelected: true,
  },
  {
    name: "visual-check",
    description: "Launch dev-browser, navigate to URL, take screenshots to verify implementation",
    type: "skill",
    origin: "custom",
    path: "skills/visual-check",
    defaultSelected: true,
  },
  {
    name: "create-pr",
    description: "Create and push a PR with auto-generated title and description",
    type: "skill",
    origin: "custom",
    path: "skills/create-pr",
    defaultSelected: true,
  },
  {
    name: "create-issue",
    description: "Create a GitHub issue with labels, template, and epic linking",
    type: "skill",
    origin: "custom",
    path: "skills/create-issue",
    defaultSelected: true,
  },
  {
    name: "worktree-start",
    description: "Start isolated work on a GitHub issue using git worktree",
    type: "skill",
    origin: "custom",
    path: "skills/worktree-start",
    defaultSelected: true,
  },
  {
    name: "worktree-finish",
    description: "Clean up worktree after PR is merged",
    type: "skill",
    origin: "custom",
    path: "skills/worktree-finish",
    defaultSelected: true,
  },
  {
    name: "merge",
    description: "Merge branches with context-aware conflict resolution",
    type: "skill",
    origin: "custom",
    path: "skills/merge",
    defaultSelected: true,
  },
  {
    name: "fix-errors",
    description: "Fix all ESLint and TypeScript errors with parallel agents",
    type: "skill",
    origin: "custom",
    path: "skills/fix-errors",
    defaultSelected: true,
  },
  {
    name: "fix-grammar",
    description: "Fix grammar and spelling in files while preserving formatting",
    type: "skill",
    origin: "custom",
    path: "skills/fix-grammar",
    defaultSelected: true,
  },
  {
    name: "fix-pr-comments",
    description: "Fetch PR review comments and implement all requested changes",
    type: "skill",
    origin: "custom",
    path: "skills/fix-pr-comments",
    defaultSelected: true,
  },
  {
    name: "convex-cli",
    description: "Initialize and manage Convex projects non-interactively",
    type: "skill",
    origin: "custom",
    path: "skills/convex-cli",
    hint: "for Convex users",
    defaultSelected: false,
  },
  {
    name: "npm-publish",
    description: "Bump version, build, publish to npm, git tag, push",
    type: "skill",
    origin: "custom",
    path: "skills/npm-publish",
    defaultSelected: true,
  },

  // ═══════════════════════════════════════════════
  // AGENTS — Specialized subagents
  // ═══════════════════════════════════════════════
  {
    name: "critic",
    description: "Technical reviewer with auto-detected lenses (CTO, UX, Security, Performance, Cost)",
    type: "agent",
    origin: "custom",
    path: "agents/critic.md",
    defaultSelected: true,
  },
  {
    name: "explore-codebase",
    description: "Deep codebase exploration with file:line references",
    type: "agent",
    origin: "custom",
    path: "agents/explore-codebase.md",
    defaultSelected: true,
  },
  {
    name: "explore-docs",
    description: "Documentation research via ctx7 CLI and Context7 MCP",
    type: "agent",
    origin: "custom",
    path: "agents/explore-docs.md",
    defaultSelected: true,
  },
  {
    name: "websearch",
    description: "Targeted web search for best practices and breaking changes",
    type: "agent",
    origin: "custom",
    path: "agents/websearch.md",
    defaultSelected: true,
  },
  {
    name: "linkedin-post-agent",
    description: "LinkedIn content generation agent (used by /linkedin-post skill)",
    type: "agent",
    origin: "custom",
    path: "agents/linkedin-post.md",
    defaultSelected: true,
  },
  {
    name: "action",
    description: "Conditional action executor — acts only when specific conditions are met",
    type: "agent",
    origin: "custom",
    path: "agents/action.md",
    defaultSelected: true,
  },

  // ═══════════════════════════════════════════════
  // HOOKS — Automatic triggers
  // ═══════════════════════════════════════════════
  {
    name: "monitor-session",
    description: "Session monitoring: tracks Stop, Permission, and Notification events",
    type: "hook",
    origin: "custom",
    path: "hooks/monitor-session.sh",
    defaultSelected: true,
  },
  {
    name: "notify-workflow",
    description: "Sends notifications after Bash command execution",
    type: "hook",
    origin: "custom",
    path: "hooks/notify-workflow.sh",
    defaultSelected: true,
  },
];

export function getComponentsByType(type: Component["type"]) {
  return components.filter((c) => c.type === type);
}

export function getCustomComponents() {
  return components.filter((c) => c.origin === "custom");
}
