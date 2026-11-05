import type { Scenario, Session } from "../challenges/engine/types";
export const STORAGE_KEY = "internet-literacy-lab:progress:v1";
export interface ProgressEntry {
  experienced: boolean;
  reflected: boolean;
  discoveries: string[];
  lastExperiencedAt: string;
}
export type Progress = Record<string, ProgressEntry>;
export type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function loadProgress(
  storage: StoragePort,
  scenarios: Scenario[],
): Progress {
  try {
    const raw: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const data = raw as Record<string, unknown>;
    const progress: Progress = {};
    for (const scenario of scenarios) {
      const entry = data[scenario.id] as Partial<ProgressEntry> | undefined;
      if (
        !entry ||
        typeof entry.experienced !== "boolean" ||
        typeof entry.reflected !== "boolean" ||
        !Array.isArray(entry.discoveries) ||
        typeof entry.lastExperiencedAt !== "string" ||
        !Number.isFinite(Date.parse(entry.lastExperiencedAt))
      )
        continue;
      progress[scenario.id] = {
        experienced: entry.experienced,
        reflected: entry.reflected,
        discoveries: [
          ...new Set(
            entry.discoveries.filter((id) =>
              scenario.discoveries.some((d) => d.id === id),
            ),
          ),
        ],
        lastExperiencedAt: entry.lastExperiencedAt,
      };
    }
    return progress;
  } catch {
    return {};
  }
}
export function mergeProgress(
  progress: Progress,
  scenario: Scenario,
  state: Session,
  now = new Date().toISOString(),
): Progress {
  const before = progress[scenario.id];
  return {
    ...progress,
    [scenario.id]: {
      experienced: true,
      reflected: !!before?.reflected || state.reflection,
      discoveries: [
        ...new Set([...(before?.discoveries ?? []), ...state.discoveries]),
      ],
      lastExperiencedAt: now,
    },
  };
}
export function saveProgress(
  storage: StoragePort,
  progress: Progress,
): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
export function clearProgress(storage: StoragePort): boolean {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
