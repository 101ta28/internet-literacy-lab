import { describe, expect, it } from "vitest";
import { news, shop, support } from "../scenarios/everyday";
import { initialSession, transition } from "./engine";
import type { Scenario, Session } from "./types";

function run(
  scenario: Scenario,
  actions: string[],
  start = initialSession(scenario),
) {
  return actions.reduce(
    (state, id) => transition(scenario, state, { type: "action", id }),
    start,
  );
}
const last = (state: Session) => state.outcomes.at(-1)?.id;

describe("L05: checking before sharing", () => {
  it("requires the organizer's information before a verified post or correction", () => {
    const initial = initialSession(news);
    expect(run(news, ["verified", "correct"], initial)).toBe(initial);
    const shared = run(news, ["share"]);
    expect(run(news, ["correct"], shared)).toBe(shared);
    const corrected = run(
      news,
      ["source", "image", "official", "correct"],
      shared,
    );
    expect(corrected.settings.publication).toBe("corrected");
    expect(corrected.discoveries).toEqual([
      "source",
      "date",
      "context",
      "correction",
    ]);
    expect(corrected.outcomes.map((o) => o.id)).toEqual([
      "shared",
      "corrected",
    ]);
    expect(run(news, ["correct", "share", "verified"], corrected)).toBe(
      corrected,
    );
  });
  it("can hold, investigate in any order, and share qualified information", () => {
    const held = run(news, ["hold", "official", "image", "source"]);
    expect(held.screen).toBe("held");
    expect(held.settings.publication).toBe("none");
    const verified = run(news, ["back", "verified"], held);
    expect(verified.settings.publication).toBe("verified");
    expect(last(verified)).toBe("verified");
  });
  it("deleting clears the visible post, keeps its history, and permits reconsideration", () => {
    const deleted = run(news, ["share", "remove"]);
    expect(deleted.screen).toBe("deleted");
    expect(deleted.settings.publication).toBe("none");
    expect(deleted.history.map((a) => a.id)).toEqual(["share", "remove"]);
    expect(run(news, ["remove", "share"], deleted)).toBe(deleted);
    expect(last(run(news, ["official", "back", "verified"], deleted))).toBe(
      "verified",
    );
  });
});

describe("L06: shopping and payment", () => {
  it("allows inspecting and leaving before payment without simulating a transfer", () => {
    const state = run(shop, ["compare", "seller", "checkout", "cancel"]);
    expect(state.screen).toBe("cancelled");
    expect(state.discoveries).toEqual(["price", "seller", "payment"]);
    expect(state.outcomes.map((o) => o.id)).toEqual(["cancelled"]);
    expect(run(shop, ["pay", "wait", "record", "help"], state)).toBe(state);
    expect(run(shop, ["back", "checkout"], state).screen).toBe("checkout");
  });
  it("requires checkout for payment and prevents undoing it with a cancellation", () => {
    const initial = initialSession(shop);
    expect(run(shop, ["pay", "wait", "record", "help"], initial)).toBe(initial);
    const paid = run(shop, ["checkout", "pay"]);
    expect(paid.screen).toBe("paid");
    expect(run(shop, ["pay", "cancel", "back"], paid)).toBe(paid);
  });
  it("supports recording and seeking help both immediately and after the missing delivery", () => {
    const state = run(shop, [
      "checkout",
      "pay",
      "record",
      "help",
      "wait",
      "seller",
      "compare",
      "record",
      "help",
    ]);
    expect(state.screen).toBe("trouble");
    expect(state.settings.recorded).toBe(true);
    expect(new Set(state.discoveries)).toEqual(
      new Set(["payment", "recovery", "seller", "price"]),
    );
    expect(state.discoveries.filter((id) => id === "recovery")).toHaveLength(1);
    expect(state.outcomes.map((o) => o.id)).toContain("trouble");
    expect(last(state)).toBe("help");
  });
});

describe("L07: fake warning and remote support", () => {
  it("distinguishes the fake in-page close button from closing the browser tab", () => {
    const blocked = run(support, ["insideClose"]);
    expect(blocked.screen).toBe("warning");
    expect(last(blocked)).toBe("blocked");
    const closed = run(support, ["origin", "close", "help"], blocked);
    expect(closed.screen).toBe("closed");
    expect(closed.settings).toMatchObject({
      called: false,
      remoteGranted: false,
      connected: false,
      paid: false,
    });
    expect(run(support, ["call", "remote", "pay"], closed)).toBe(closed);
  });
  it("can end a call without granting access or paying", () => {
    const state = run(support, ["call", "hangup"]);
    expect(last(state)).toBe("hungup");
    expect(state.settings).toMatchObject({
      called: true,
      remoteGranted: false,
      connected: false,
      paid: false,
    });
  });
  it.each([false, true])(
    "disconnects without erasing earlier access or payment (paid: %s)",
    (paid) => {
      const state = run(support, [
        "call",
        "remote",
        ...(paid ? ["pay"] : []),
        "disconnect",
        "help",
      ]);
      expect(state.screen).toBe("closed");
      expect(state.settings).toMatchObject({
        called: true,
        remoteGranted: true,
        connected: false,
        paid,
      });
      expect(state.discoveries).toContain("recovery");
      expect(last(state)).toBe("help");
    },
  );
  it("cannot pay before remote access or use the initial safe exit after granting access", () => {
    const initial = initialSession(support);
    expect(run(support, ["remote", "pay", "disconnect", "help"], initial)).toBe(
      initial,
    );
    const remote = run(support, ["call", "remote"]);
    expect(run(support, ["close", "hangup"], remote)).toBe(remote);
    expect(remote.settings.connected).toBe(true);
  });
});
