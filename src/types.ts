export type ComponentType = "rule" | "skill" | "agent" | "hook";

export type Origin = "custom" | "community";

// The builder cycle step a component belongs to.
// Rules, agents and hooks are "ambient": always active, not tied to one step.
export type Step =
  | "cadrer"
  | "illustrer"
  | "documenter"
  | "construire"
  | "verifier"
  | "ambient";

// Install pack. Packs are nested: guide ⊂ default ⊂ full.
// A component's pack is the SMALLEST pack that includes it.
export type Pack = "guide" | "default" | "full";

export interface Component {
  name: string;
  description: string;
  type: ComponentType;
  origin: Origin;
  path: string;
  step: Step;
  pack: Pack;
  hint?: string;
}

export interface IrokoConfig {
  version: string;
  installedAt: string;
  components: string[];
}
