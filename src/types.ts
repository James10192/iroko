export type ComponentType = "rule" | "skill" | "agent" | "hook";

export type Origin = "custom" | "community";

export interface Component {
  name: string;
  description: string;
  type: ComponentType;
  origin: Origin;
  path: string;
  hint?: string;
  defaultSelected?: boolean;
}

export interface InstalledComponent extends Component {
  installedAt: string;
}

export interface IrokoConfig {
  version: string;
  installedAt: string;
  components: string[];
}
