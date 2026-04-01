import { describe, expect, it } from "vitest";
import { PROTOTYPE_SCENARIO } from "../src/features/prototype/definition";
import {
  computeRevealScore,
  evaluateGoalRule,
  selectNextRoomResult,
} from "../src/features/prototype/logic";

describe("prototype scenario definition", () => {
  it("ships a six-player seeded scenario", () => {
    expect(PROTOTYPE_SCENARIO.roles).toHaveLength(6);
    expect(PROTOTYPE_SCENARIO.clues.length).toBeGreaterThanOrEqual(10);
    expect(PROTOTYPE_SCENARIO.rooms.length).toBeGreaterThanOrEqual(4);
  });
});

describe("selectNextRoomResult", () => {
  it("filters results by phase and advances index", () => {
    const result = selectNextRoomResult(
      [
        { key: "one", text: "Act one", stage: "act-1" },
        { key: "two", text: "Act two", stage: "act-2" },
      ],
      0,
      "act-2",
    );

    expect(result?.result.key).toBe("two");
    expect(result?.nextIndex).toBe(1);
  });
});

describe("evaluateGoalRule", () => {
  it("completes possession and accusation rules correctly", () => {
    expect(
      evaluateGoalRule(
        { type: "possess-item", itemCode: "sealed-letter" },
        {
          itemCodes: ["sealed-letter"],
          clueCodes: [],
          decisionOutcomeKey: null,
          hasAccusation: false,
        },
      ),
    ).toBe(true);

    expect(
      evaluateGoalRule(
        { type: "submit-accusation" },
        {
          itemCodes: [],
          clueCodes: [],
          decisionOutcomeKey: null,
          hasAccusation: true,
        },
      ),
    ).toBe(true);
  });
});

describe("computeRevealScore", () => {
  it("awards accusation and goal points deterministically", () => {
    expect(
      computeRevealScore({
        suspectRoleCode: "silas-ward",
        motive: "debt",
        means: "knife",
        solution: {
          suspectRoleCode: "silas-ward",
          motive: "debt",
          means: "knife",
        },
        goalPoints: 4,
      }),
    ).toEqual({
      accusationScore: 7,
      goalScore: 4,
      total: 11,
    });
  });
});
