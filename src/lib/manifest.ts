import type { Component, Pack } from "../types.js";

// iroko v3 manifest — 24 components (7 rules, 12 skills, 4 agents, 1 hook)
// organized around the builder cycle:
//   CADRER → ILLUSTRER → DOCUMENTER → CONSTRUIRE → VÉRIFIER
// Rules, agents and hooks are "ambient" (always active).
// Packs are nested: guide ⊂ default ⊂ full — `pack` is the smallest pack
// that includes the component.
export const components: Component[] = [
  // ═══════════════════════════════════════════════
  // RULES — Loaded in every conversation
  // ═══════════════════════════════════════════════
  {
    name: "quality-gate",
    description:
      "Single source for the 4-axes commit audit (architecture, quality, production, SOLID) with a plain-language glossary / Source unique de l'audit 4 axes avant commit, avec un glossaire en langage simple.",
    type: "rule",
    origin: "custom",
    path: "rules/quality-gate.md",
    step: "ambient",
    pack: "guide",
  },
  {
    name: "git-safety",
    description:
      "Forbids destructive git and database commands without explicit written approval, backup first / Interdit les commandes git et base de données destructrices sans accord écrit, sauvegarde d'abord.",
    type: "rule",
    origin: "custom",
    path: "rules/git-safety.md",
    step: "ambient",
    pack: "guide",
  },
  {
    name: "stay-in-scope",
    description:
      "Never build beyond what was asked: no unrequested features, file-size thresholds enforced / Jamais au-delà de la demande : pas de fonctionnalités non demandées, seuils de taille de fichiers.",
    type: "rule",
    origin: "custom",
    path: "rules/stay-in-scope.md",
    step: "ambient",
    pack: "guide",
  },
  {
    name: "ship-quality",
    description:
      "Every deliverable handles loading, empty, error and success states, no 'coming soon' / Chaque livrable gère les états chargement, vide, erreur et succès, pas de « bientôt disponible ».",
    type: "rule",
    origin: "custom",
    path: "rules/ship-quality.md",
    step: "ambient",
    pack: "default",
  },
  {
    name: "token-efficiency",
    description:
      "When to use agents vs direct tools so context is never wasted / Quand utiliser des agents plutôt que les outils directs pour ne jamais gaspiller le contexte.",
    type: "rule",
    origin: "custom",
    path: "rules/token-efficiency.md",
    step: "ambient",
    pack: "guide",
  },
  {
    name: "docs-first",
    description:
      "Never guess an API: fetch current docs (ctx7, MCP, web) before writing code / Ne jamais deviner une API : chercher la doc à jour avant d'écrire du code.",
    type: "rule",
    origin: "custom",
    path: "rules/docs-first.md",
    step: "ambient",
    pack: "guide",
  },
  {
    name: "global-preferences",
    description:
      "Opinionated defaults: pnpm, no Co-Authored-By, monochrome design, no AI slop / Préférences assumées : pnpm, pas de Co-Authored-By, design monochrome, pas de bouillie IA.",
    type: "rule",
    origin: "custom",
    path: "rules/global-preferences.md",
    step: "ambient",
    pack: "default",
    hint: "opinionated — adapt to your own preferences",
  },

  // ═══════════════════════════════════════════════
  // SKILLS — Slash commands (/command)
  // ═══════════════════════════════════════════════
  {
    name: "demarrer",
    description:
      "Guided mode in French for complete beginners: tiny verified steps, zero jargon / Mode accompagné en français pour grands débutants : petits pas vérifiés, zéro jargon.",
    type: "skill",
    origin: "custom",
    path: "skills/demarrer",
    step: "cadrer",
    pack: "guide",
  },
  {
    name: "plan-and-confirm",
    description:
      "Research agents + critic + plan, explicit OKAY required before any code change / Agents de recherche + critic + plan, OKAY explicite obligatoire avant toute ligne de code.",
    type: "skill",
    origin: "custom",
    path: "skills/plan-and-confirm",
    step: "cadrer",
    pack: "guide",
  },
  {
    name: "pick-stack",
    description:
      "Stack advisor: interviews the real need (budget, audience, offline, payments) then recommends one justified stack / Conseiller de stack : interroge le vrai besoin puis recommande une stack argumentée.",
    type: "skill",
    origin: "custom",
    path: "skills/pick-stack",
    step: "cadrer",
    pack: "default",
  },
  {
    name: "sketch",
    description:
      "Shows 3-6 low-fidelity visual options on a local HTML board BEFORE any code is written / Montre 3 à 6 options visuelles basse fidélité sur une planche HTML locale AVANT d'écrire du code.",
    type: "skill",
    origin: "custom",
    path: "skills/sketch",
    step: "illustrer",
    pack: "guide",
  },
  {
    name: "read-docs",
    description:
      "Fetches current library docs and applies a reading method instead of guessing APIs / Récupère la doc à jour des bibliothèques et applique une méthode de lecture au lieu de deviner.",
    type: "skill",
    origin: "custom",
    path: "skills/read-docs",
    step: "documenter",
    pack: "guide",
  },
  {
    name: "oneshot",
    description:
      "Ultra-fast implementation of ONE trivial task: explore, code, test, stop after 2 failures / Implémentation ultra rapide d'UNE tâche triviale : explorer, coder, tester, stop après 2 échecs.",
    type: "skill",
    origin: "custom",
    path: "skills/oneshot",
    step: "construire",
    pack: "default",
  },
  {
    name: "create-pr",
    description:
      "Creates and pushes a pull request with auto-generated title and description / Crée et pousse une pull request avec titre et description générés automatiquement.",
    type: "skill",
    origin: "custom",
    path: "skills/create-pr",
    step: "construire",
    pack: "full",
  },
  {
    name: "create-issue",
    description:
      "Creates a GitHub issue with labels, template and epic linking / Crée une issue GitHub avec labels, gabarit et lien vers l'epic.",
    type: "skill",
    origin: "custom",
    path: "skills/create-issue",
    step: "construire",
    pack: "full",
  },
  {
    name: "commit",
    description:
      "Quality-gated commit: stages ONLY the conversation's files, audits, conventional message / Commit sous quality gate : stage UNIQUEMENT les fichiers de la conversation, audit, message conventionnel.",
    type: "skill",
    origin: "custom",
    path: "skills/commit",
    step: "verifier",
    pack: "guide",
  },
  {
    name: "deep-review",
    description:
      "Ruthless structural review: deletes complexity, blocks god files, 'correct is not enough' / Revue structurelle impitoyable : supprime la complexité, bloque les fichiers monstres, « correct ne suffit pas ».",
    type: "skill",
    origin: "custom",
    path: "skills/deep-review",
    step: "verifier",
    pack: "default",
  },
  {
    name: "fix-errors",
    description:
      "Fixes all lint and type errors, sequential by default, parallel only past 20 errors / Corrige toutes les erreurs lint et types, séquentiel par défaut, parallèle seulement au-delà de 20 erreurs.",
    type: "skill",
    origin: "custom",
    path: "skills/fix-errors",
    step: "verifier",
    pack: "guide",
  },
  {
    name: "visual-check",
    description:
      "Opens a browser to visually verify a page: screenshots, accessibility snapshot, issue report / Ouvre un navigateur pour vérifier visuellement une page : captures, snapshot accessibilité, rapport.",
    type: "skill",
    origin: "custom",
    path: "skills/visual-check",
    step: "verifier",
    pack: "default",
  },

  // ═══════════════════════════════════════════════
  // AGENTS — Specialized subagents
  // ═══════════════════════════════════════════════
  {
    name: "critic",
    description:
      "Technical reviewer with auto-detected lenses (CTO, UX, Security, Performance, Cost) / Relecteur technique avec angles auto-détectés (CTO, UX, sécurité, performance, coût).",
    type: "agent",
    origin: "custom",
    path: "agents/critic.md",
    step: "ambient",
    pack: "guide",
  },
  {
    name: "explore-docs",
    description:
      "Documentation research via ctx7 CLI and Context7 MCP / Recherche documentaire via le CLI ctx7 et le MCP Context7.",
    type: "agent",
    origin: "custom",
    path: "agents/explore-docs.md",
    step: "ambient",
    pack: "guide",
  },
  {
    name: "explore-codebase",
    description:
      "Explores the codebase to map patterns and files before implementing a feature / Explore le code pour cartographier les patterns et fichiers avant d'implémenter une fonctionnalité.",
    type: "agent",
    origin: "custom",
    path: "agents/explore-codebase.md",
    step: "ambient",
    pack: "guide",
  },
  {
    name: "websearch",
    description:
      "Quick targeted web research agent used by planning and docs skills / Agent de recherche web ciblée utilisé par les skills de planification et de documentation.",
    type: "agent",
    origin: "custom",
    path: "agents/websearch.md",
    step: "ambient",
    pack: "guide",
  },

  // ═══════════════════════════════════════════════
  // HOOKS — Automatic triggers
  // ═══════════════════════════════════════════════
  {
    name: "guard-destructive",
    description:
      "PreToolUse hook that blocks destructive commands (reset --hard, push --force, db wipe...) / Hook PreToolUse qui bloque les commandes destructrices (reset --hard, push --force, purge de base...).",
    type: "hook",
    origin: "custom",
    path: "hooks/guard-destructive.sh",
    step: "ambient",
    pack: "guide",
  },
];

export function getComponentsByType(type: Component["type"]) {
  return components.filter((c) => c.type === type);
}

// Components belonging to a pack, packs being nested: guide ⊂ default ⊂ full.
export function getComponentsForPack(pack: Pack): Component[] {
  if (pack === "full") return components;
  if (pack === "default") return components.filter((c) => c.pack !== "full");
  return components.filter((c) => c.pack === "guide");
}
