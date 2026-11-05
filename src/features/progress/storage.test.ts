import { expect, it } from "vitest";
import {
  clearProgress,
  loadProgress,
  mergeProgress,
  saveProgress,
  STORAGE_KEY,
  type StoragePort,
} from "./storage";
import { scenarios } from "../challenges/scenarios";
import { initialSession, transition } from "../challenges/engine/engine";
function memory(): StoragePort {
  const data: Record<string, string> = {};
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}
it("saves only progress fields, preserving completion across retries", () => {
  const store = memory();
  const scenario = scenarios[0];
  let session = transition(scenario, initialSession(scenario), {
    type: "action",
    id: "open",
  });
  session = transition(scenario, session, { type: "action", id: "sender" });
  session = transition(scenario, session, { type: "finish" });
  const progress = mergeProgress({}, scenario, session);
  expect(saveProgress(store, progress)).toBe(true);
  expect(loadProgress(store, scenarios)).toEqual(progress);
  const raw = JSON.parse(store.getItem(STORAGE_KEY)!);
  expect(Object.keys(raw.L01).sort()).toEqual([
    "discoveries",
    "experienced",
    "lastExperiencedAt",
    "reflected",
  ]);
  const retry = mergeProgress(progress, scenario, initialSession(scenario));
  expect(retry.L01.reflected).toBe(true);
  expect(retry.L01.discoveries).toEqual(["sender"]);
  expect(clearProgress(store)).toBe(true);
  expect(loadProgress(store, scenarios)).toEqual({});
});
it("handles inaccessible storage without throwing", () => {
  const store: StoragePort = {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("quota");
    },
    removeItem: () => {
      throw new Error("denied");
    },
  };
  expect(loadProgress(store, scenarios)).toEqual({});
  expect(saveProgress(store, {})).toBe(false);
  expect(clearProgress(store)).toBe(false);
});
it("validates malformed data and discards unknown fields and discovery IDs", () => {
  const store = memory();
  for (const data of [
    "{",
    "null",
    "[]",
    '{"L01":null}',
    '{"L01":{"lastExperiencedAt":"oops"}}',
  ]) {
    store.setItem(STORAGE_KEY, data);
    expect(loadProgress(store, scenarios)).toEqual({});
  }
  store.setItem(
    STORAGE_KEY,
    JSON.stringify({
      L01: {
        experienced: true,
        reflected: false,
        discoveries: ["sender", "sender", "fake", 123],
        lastExperiencedAt: "2026-11-05T00:00:00.000Z",
        personalInfo: "discard",
      },
      fake: {},
    }),
  );
  const result = loadProgress(store, scenarios);
  expect(result.L01.discoveries).toEqual(["sender"]);
  expect(Object.keys(result)).toEqual(["L01"]);
  expect(result.L01).not.toHaveProperty("personalInfo");
});
