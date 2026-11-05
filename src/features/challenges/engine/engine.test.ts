import { describe, expect, it } from "vitest";
import { scenarios, inferPost, commentText, comments } from "../scenarios";
import { initialSession, transition } from "./engine";
import type { EngineEvent, Scenario, Session } from "./types";
import { articles } from "../../knowledge/articles";
const [mail, post, photo, comment] = scenarios;
function run(
  scenario: Scenario,
  actions: (string | [string, string])[],
  start = initialSession(scenario),
) {
  return actions.reduce(
    (s, action) =>
      transition(scenario, s, {
        type: "action",
        id: typeof action === "string" ? action : action[0],
        value: typeof action === "string" ? undefined : action[1],
      }),
    start,
  );
}
const last = (state: Session) => state.outcomes.at(-1)!;
describe("common scenario engine", () => {
  it.each(scenarios)(
    "$id starts without spoilers and resets every temporary field",
    (scenario) => {
      const initial = initialSession(scenario);
      expect(initial.discoveries).toEqual([]);
      expect(initial.hintLevel).toBe(0);
      expect(initial.outcomes).toEqual([]);
      let state = transition(scenario, initial, { type: "hint" });
      state = {
        ...state,
        screen: scenario.states.at(-1)!,
        settings: { changed: true },
        discoveries: [scenario.discoveries[0].id],
        history: [{ id: "test", label: "test" }],
        outcomes: Object.values(scenario.outcomes),
        reflection: true,
      };
      expect(transition(scenario, state, { type: "reset" })).toEqual(initial);
      expect(initialSession(scenario).settings).not.toBe(
        scenario.initialState.settings,
      );
    },
  );
  it.each(scenarios)(
    "$id caps hints and freezes actions during reflection",
    (scenario) => {
      let state = initialSession(scenario);
      for (let i = 0; i < 5; i++)
        state = transition(scenario, state, { type: "hint" });
      expect(state.hintLevel).toBe(3);
      state = transition(scenario, state, { type: "finish" });
      expect(
        transition(scenario, state, {
          type: "action",
          id: Object.keys(scenario.actions)[0],
        }),
      ).toBe(state);
      expect(transition(scenario, state, { type: "resume" }).reflection).toBe(
        false,
      );
    },
  );
  it("rejects unknown and out-of-order actions", () => {
    const state = initialSession(mail);
    for (const id of ["send", "recover", "sender", "nonexistent"])
      expect(transition(mail, state, { type: "action", id })).toBe(state);
  });
  it("does not duplicate discoveries or mutate initial state", () => {
    const initial = initialSession(mail);
    const state = run(mail, ["open", "sender", "sender", "url"]);
    expect(state.discoveries).toEqual(["sender", "url"]);
    expect(initial.settings.sender).toBe(false);
  });
  it("every scenario has valid actions, states, outcomes and two-way article links", () => {
    expect(new Set(scenarios.map((s) => s.slug)).size).toBe(scenarios.length);
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length);
    expect(new Set(articles.map((a) => a.id)).size).toBe(articles.length);
    for (const article of articles)
      for (const id of article.challengeIds)
        expect(scenarios.find((s) => s.id === id)?.knowledgeIds).toContain(
          article.id,
        );
    for (const s of scenarios) {
      expect(s.states).toContain(s.initialState.screen);
      expect(s.transitions.map((t) => t.action).sort()).toEqual(
        Object.keys(s.actions).sort(),
      );
      for (const id of s.knowledgeIds)
        expect(articles.find((a) => a.id === id)?.challengeIds).toContain(s.id);
      expect(Object.values(s.outcomes).every((o) => o.title && o.next)).toBe(
        true,
      );
    }
  });
});
describe("L01: email", () => {
  it("independently inspects sender, URL and official app", () => {
    const state = run(mail, [
      "official",
      "back",
      "open",
      "url",
      "sender",
      "report",
    ]);
    expect(state.discoveries).toEqual(["official", "url", "sender"]);
    expect(state.screen).toBe("deleted");
    expect(last(state).id).toBe("removed");
  });
  it("opens then closes without sending, and can still verify", () => {
    const state = run(mail, ["open", "link", "close"]);
    expect(last(state).id).toBe("closed");
    expect(state.settings.submitted).toBe(false);
    expect(state.screen).toBe("email");
    expect(run(mail, ["official"], state).discoveries).toContain("official");
  });
  it("simulates sending then recovery, preserving the actual earlier risk", () => {
    const state = run(mail, [
      "open",
      "link",
      "send",
      "close",
      "official",
      "recover",
    ]);
    expect(state.outcomes.map((o) => o.id)).toEqual([
      "sent",
      "sent",
      "official",
      "recovered",
    ]);
    expect(state.outcomes.some((o) => o.id === "closed")).toBe(false);
    expect(
      transition(mail, state, { type: "finish" }).history.map((h) => h.id),
    ).toContain("send");
  });
  it("does not resurrect a deleted message on returning from the official app", () => {
    const state = run(mail, ["open", "remove", "official", "back"]);
    expect(state.settings.removed).toBe(true);
    expect(transition(mail, state, { type: "action", id: "open" })).toBe(state);
  });
});
describe("L02: social footprint", () => {
  it("shows multiple inferences on the default public post", () => {
    const state = run(post, ["publish"]);
    expect(inferPost(state)).toHaveLength(5);
    expect(last(state).description).toContain("4種類");
  });
  it("removing current clues does not remove past information", () => {
    const state = run(post, [
      "school",
      "place",
      "schedule",
      "image",
      "past",
      ["audience", "friends"],
      "publish",
    ]);
    expect(inferPost(state)).toHaveLength(1);
    expect(inferPost(state)[0]).toContain("過去");
    expect(last(state).description).toContain("再共有");
  });
  it("supports recovery by editing and deleting a published post", () => {
    const state = run(post, [
      "publish",
      "edit",
      ["audience", "private"],
      "publish",
      "remove",
    ]);
    expect(state.outcomes[1].description).toContain("自分だけ");
    expect(last(state).id).toBe("removed");
    expect(state.discoveries).toContain("reshare");
  });
  it("ignores publication-only actions before publishing", () => {
    const state = initialSession(post);
    expect(run(post, ["remove"], state)).toBe(state);
  });
});
describe("L03: photo privacy", () => {
  it("distinguishes public disclosure without consent", () => {
    const state = run(photo, ["publish"]);
    expect(last(state).tone).toBe("care");
    expect(last(state).description).toContain("同意していません");
  });
  it("respects the actual conditional consent, beyond merely asking", () => {
    const asked = run(photo, ["consent", "publish"]);
    expect(last(asked).tone).toBe("care");
    const respected = run(photo, [
      "consent",
      "background",
      ["audience", "friends"],
      "publish",
    ]);
    expect(last(respected).tone).toBe("notice");
    expect(last(respected).description).toContain("希望を反映");
    expect(last(respected).description).toContain("再共有");
  });
  it("allows private saving and recovery after public posting", () => {
    const state = run(photo, [
      "publish",
      "remove",
      "edit",
      ["audience", "private"],
      "publish",
    ]);
    expect(last(state).description).toContain("ほかの人には公開されません");
    expect(state.outcomes[1].id).toBe("removed");
  });
  it("face blur does not erase background clues", () => {
    const state = run(photo, [
      "face",
      ["inspect", "sign"],
      ["inspect", "bag"],
      "publish",
    ]);
    expect(last(state).description).toContain("学校名や私物");
    expect(state.discoveries).toContain("background");
  });
});
describe("L04: comments", () => {
  it("personality attacks, action criticism and questions produce different results", () => {
    expect(last(run(comment, ["publish"])).id).toBe("attack");
    expect(last(run(comment, [["choice", "criticism"], "publish"])).id).toBe(
      "criticism",
    );
    expect(last(run(comment, [["choice", "question"], "publish"])).id).toBe(
      "question",
    );
  });
  it("rephrasing changes the actual comment and result", () => {
    const state = run(comment, ["rephrase", "publish"]);
    expect(commentText(state)).toBe(comments.criticism);
    expect(last(state).id).toBe("criticism");
  });
  it("supports cancelling, reporting, blocking and recovering after posting", () => {
    expect(last(run(comment, ["cancel"])).id).toBe("cancelled");
    expect(last(run(comment, ["report"])).id).toBe("reported");
    expect(run(comment, ["block"]).screen).toBe("blocked");
    const state = run(comment, [
      "publish",
      "remove",
      "edit",
      ["choice", "question"],
      "publish",
    ]);
    expect(state.outcomes.map((o) => o.id)).toEqual([
      "attack",
      "removed",
      "question",
    ]);
  });
  it("prevents editing posted settings until returning to editor", () => {
    const state = run(comment, ["publish"]);
    expect(run(comment, [["choice", "question"]], state)).toBe(state);
  });
});
it.each(scenarios)(
  "$id tolerates varied action sequences without invalid screens or discoveries",
  (scenario) => {
    let state = initialSession(scenario);
    const ids = Object.keys(scenario.actions);
    const events: EngineEvent[] = ids.flatMap((id) => [
      { type: "action" as const, id },
      { type: "action" as const, id, value: "invalid-value" },
    ]);
    for (let i = 0; i < 5; i++) {
      for (const event of [...events].reverse()) {
        state = transition(scenario, state, event);
        expect(scenario.states).toContain(state.screen);
        expect(
          state.discoveries.every((id) =>
            scenario.discoveries.some((d) => d.id === id),
          ),
        ).toBe(true);
        expect(
          state.outcomes.every((o) => !!o?.id && !!o.title && !!o.next),
        ).toBe(true);
      }
      state = transition(scenario, state, { type: "reset" });
    }
  },
);
