import { describe, expect, it } from "vitest";
import { PROTOTYPE_SCENARIO } from "../src/features/prototype/definition";
import {
  canUseLiveActions,
  computeRevealScore,
  deriveSeatSwap,
  evaluateGoalRule,
  getActTwoGoalStatus,
  getSetupGoalStatus,
  pickJoinableSeat,
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

describe("stage helpers", () => {
  it("freezes app actions during Event 1 and enables them during active acts", () => {
    expect(canUseLiveActions("act-1")).toBe(true);
    expect(canUseLiveActions("event-1")).toBe(false);
    expect(canUseLiveActions("act-2")).toBe(true);
  });

  it("tracks goal activation by setup and act two windows", () => {
    expect(getSetupGoalStatus("ACT_1")).toBe("ACTIVE");
    expect(getSetupGoalStatus("ACT_2")).toBe("FAILED");

    expect(getActTwoGoalStatus("ACT_2", "FAILED")).toBe("ACTIVE");
    expect(getActTwoGoalStatus("ACT_1", "COMPLETED")).toBe("COMPLETED");
    expect(getActTwoGoalStatus("ACT_1", "FAILED")).toBe("FAILED");
  });
});

describe("seat helpers", () => {
  it("prefers a reserved seat before a generic open seat", () => {
    const seats = [
      { userId: null, assignedEmail: null, code: "open" },
      { userId: null, assignedEmail: "reserved@example.com", code: "reserved" },
    ];

    expect(pickJoinableSeat(seats, "reserved@example.com")?.code).toBe("reserved");
    expect(pickJoinableSeat(seats, "other@example.com")?.code).toBe("open");
  });

  it("swaps humans between seats without losing the destination occupant", () => {
    const joinedAt = new Date("2026-04-01T10:00:00.000Z");
    const targetJoinedAt = new Date("2026-04-01T11:00:00.000Z");
    const result = deriveSeatSwap(
      {
        userId: "player-b",
        displayName: "Player B",
        assignedEmail: "b@example.com",
        joinedAt: targetJoinedAt,
      },
      {
        userId: "player-a",
        displayName: "Player A",
        assignedEmail: "a@example.com",
        joinedAt,
      },
    );

    expect(result.target).toMatchObject({
      userId: "player-a",
      displayName: "Player A",
      assignedEmail: "a@example.com",
      joinedAt,
    });

    expect(result.source).toMatchObject({
      userId: "player-b",
      displayName: "Player B",
      assignedEmail: "b@example.com",
      joinedAt: targetJoinedAt,
    });
  });

  it("turns the source seat back into an open seat when the destination was unclaimed", () => {
    const result = deriveSeatSwap(
      {
        userId: null,
        displayName: "Open",
        assignedEmail: "reserved@example.com",
        joinedAt: new Date("2026-04-01T11:00:00.000Z"),
      },
      {
        userId: "player-a",
        displayName: "Player A",
        assignedEmail: "a@example.com",
        joinedAt: new Date("2026-04-01T10:00:00.000Z"),
      },
      null,
    );

    expect(result.target).toMatchObject({
      userId: "player-a",
      displayName: "Player A",
      assignedEmail: "a@example.com",
    });
    expect(result.source.userId).toBeNull();
    expect(result.source.displayName).toBe("Open");
    expect(result.source.assignedEmail).toBeNull();
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
