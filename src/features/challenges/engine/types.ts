export type ActionKind =
  | "inspect"
  | "select"
  | "toggle"
  | "navigate"
  | "simulate"
  | "reveal"
  | "reset";
export type Settings = Record<string, string | boolean>;
export interface Outcome {
  id: string;
  title: string;
  description: string;
  next: string;
  tone: "notice" | "care";
}
export interface Session {
  screen: string;
  settings: Settings;
  history: { id: string; label: string }[];
  discoveries: string[];
  outcomes: Outcome[];
  reflection: boolean;
  hintLevel: number;
}
export interface Effect {
  screen?: string;
  settings?: Settings;
  discoveries?: string[];
  outcome?: Outcome;
}
export interface ScenarioAction {
  kind: ActionKind;
  label: string;
  allowed?: (state: Session) => boolean;
}
export interface Transition {
  action: string;
  apply: (state: Session, value?: string | boolean) => Effect;
}
export interface Scenario {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  difficulty: "はじめて" | "じっくり";
  estimatedMinutes: number;
  app: "mail" | "post" | "photo" | "comment" | "news" | "shop" | "support";
  objective: string;
  initialState: { screen: string; settings: Settings };
  states: string[];
  actions: Record<string, ScenarioAction>;
  transitions: Transition[];
  discoveries: { id: string; title: string; detail: string }[];
  outcomes: Record<string, Outcome>;
  hints: string[];
  knowledgeIds: string[];
  reality: string;
}
export type EngineEvent =
  | { type: "action"; id: string; value?: string | boolean }
  | { type: "hint" | "finish" | "resume" | "reset" };
