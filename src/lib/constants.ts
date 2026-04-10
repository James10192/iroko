import type { ComponentType } from "../types.js";

export const TYPE_ORDER: ComponentType[] = ["rule", "skill", "agent", "hook"];

export const TYPE_META: Record<ComponentType, { label: string; desc: string }> = {
  rule: { label: "Rules", desc: "Loaded in every conversation — shape how Claude behaves globally" },
  skill: { label: "Skills", desc: "Slash commands (/commit, /plan-and-confirm, ...)" },
  agent: { label: "Agents", desc: "Specialized subagents for parallel research and review" },
  hook: { label: "Hooks", desc: "Automatic triggers on session events" },
};

export const PACKAGE_NAME = "@james10192/iroko";
export const REPO_URL = "https://github.com/James10192/iroko.git";
