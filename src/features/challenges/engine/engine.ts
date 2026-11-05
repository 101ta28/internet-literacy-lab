import type { EngineEvent, Scenario, Session } from "./types";
export function initialSession(scenario: Scenario): Session {
  return {
    screen: scenario.initialState.screen,
    settings: { ...scenario.initialState.settings },
    history: [],
    discoveries: [],
    outcomes: [],
    reflection: false,
    hintLevel: 0,
  };
}
export function transition(
  scenario: Scenario,
  state: Session,
  event: EngineEvent,
): Session {
  if (event.type === "reset") return initialSession(scenario);
  if (event.type === "finish") return { ...state, reflection: true };
  if (event.type === "resume") return { ...state, reflection: false };
  if (event.type === "hint")
    return {
      ...state,
      hintLevel: Math.min(state.hintLevel + 1, scenario.hints.length),
    };
  if (event.type !== "action") return state;
  if (state.reflection) return state;
  const action = scenario.actions[event.id];
  const rule = scenario.transitions.find((t) => t.action === event.id);
  if (!action || !rule || (action.allowed && !action.allowed(state)))
    return state;
  const effect = rule.apply(state, event.value);
  const screen =
    effect.screen && scenario.states.includes(effect.screen)
      ? effect.screen
      : state.screen;
  return {
    ...state,
    screen,
    settings: { ...state.settings, ...effect.settings },
    history: [...state.history, { id: event.id, label: action.label }],
    discoveries: [
      ...new Set([
        ...state.discoveries,
        ...(effect.discoveries ?? []).filter((id) =>
          scenario.discoveries.some((d) => d.id === id),
        ),
      ]),
    ],
    outcomes: effect.outcome
      ? [...state.outcomes, effect.outcome]
      : state.outcomes,
  };
}
