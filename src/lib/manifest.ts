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
  },
  {
    name: "parallel-agents",
    description: "Launch up to 4 agents in parallel, synthesize results",
    type: "rule",
    origin: "custom",
    path: "rules/parallel-agents.md",

  },
  {
    name: "token-efficiency",
    description: "When to use agents vs direct tools (Grep, Glob, Read)",
    type: "rule",
    origin: "custom",
    path: "rules/token-efficiency.md",

  },
  {
    name: "use-available-tools",
    description: "Always check docs (ctx7, WebSearch) before coding with external APIs",
    type: "rule",
    origin: "custom",
    path: "rules/use-available-tools.md",

  },
  {
    name: "marcel-global-preferences",
    description: "Personal: pnpm, French UI, no AI slop, no Co-Authored-By",
    type: "rule",
    origin: "custom",
    path: "rules/marcel-global-preferences.md",
    hint: "personal — adapt to your own preferences",

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

  },
  {
    name: "plan-and-confirm",
    description: "Critic + parallel research agents + plan + mandatory OKAY gate before coding",
    type: "skill",
    origin: "custom",
    path: "skills/plan-and-confirm",

  },
  {
    name: "find-doc",
    description: "Look up library docs via ctx7 CLI + MCP + WebSearch before writing code",
    type: "skill",
    origin: "custom",
    path: "skills/find-doc",

  },
  {
    name: "linkedin-post",
    description: "Generate a LinkedIn post from current work context, git history, or tech trends",
    type: "skill",
    origin: "custom",
    path: "skills/linkedin-post",

  },
  {
    name: "visual-check",
    description: "Launch dev-browser, navigate to URL, take screenshots to verify implementation",
    type: "skill",
    origin: "custom",
    path: "skills/visual-check",

  },
  {
    name: "create-pr",
    description: "Create and push a PR with auto-generated title and description",
    type: "skill",
    origin: "custom",
    path: "skills/create-pr",

  },
  {
    name: "create-issue",
    description: "Create a GitHub issue with labels, template, and epic linking",
    type: "skill",
    origin: "custom",
    path: "skills/create-issue",

  },
  {
    name: "worktree-start",
    description: "Start isolated work on a GitHub issue using git worktree",
    type: "skill",
    origin: "custom",
    path: "skills/worktree-start",

  },
  {
    name: "worktree-finish",
    description: "Clean up worktree after PR is merged",
    type: "skill",
    origin: "custom",
    path: "skills/worktree-finish",

  },
  {
    name: "merge",
    description: "Merge branches with context-aware conflict resolution",
    type: "skill",
    origin: "custom",
    path: "skills/merge",

  },
  {
    name: "fix-errors",
    description: "Fix all ESLint and TypeScript errors with parallel agents",
    type: "skill",
    origin: "custom",
    path: "skills/fix-errors",

  },
  {
    name: "fix-grammar",
    description: "Fix grammar and spelling in files while preserving formatting",
    type: "skill",
    origin: "custom",
    path: "skills/fix-grammar",

  },
  {
    name: "fix-pr-comments",
    description: "Fetch PR review comments and implement all requested changes",
    type: "skill",
    origin: "custom",
    path: "skills/fix-pr-comments",

  },
  {
    name: "convex-cli",
    description: "Initialize and manage Convex projects non-interactively",
    type: "skill",
    origin: "custom",
    path: "skills/convex-cli",
    hint: "for Convex users",

  },
  {
    name: "npm-publish",
    description: "Bump version, build, publish to npm, git tag, push",
    type: "skill",
    origin: "custom",
    path: "skills/npm-publish",

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

  },
  {
    name: "explore-docs",
    description: "Documentation research via ctx7 CLI and Context7 MCP",
    type: "agent",
    origin: "custom",
    path: "agents/explore-docs.md",

  },
  {
    name: "linkedin-post-agent",
    description: "LinkedIn content generation agent (used by /linkedin-post skill)",
    type: "agent",
    origin: "custom",
    path: "agents/linkedin-post.md",

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

  },
  {
    name: "notify-workflow",
    description: "Sends notifications after Bash command execution",
    type: "hook",
    origin: "custom",
    path: "hooks/notify-workflow.sh",

  },
];

export function getComponentsByType(type: Component["type"]) {
  return components.filter((c) => c.type === type);
}
