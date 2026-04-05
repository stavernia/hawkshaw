import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
    scenarioDefinition: {
      update: vi.fn(),
    },
    scenarioRole: {
      update: vi.fn(),
      create: vi.fn(),
    },
    scenarioRoom: {
      update: vi.fn(),
      create: vi.fn(),
    },
    scenarioClue: {
      update: vi.fn(),
      create: vi.fn(),
      findFirstOrThrow: vi.fn(),
    },
    scenarioItem: {
      update: vi.fn(),
      create: vi.fn(),
    },
    scenarioGoal: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    scenarioDecision: {
      update: vi.fn(),
      create: vi.fn(),
    },
    game: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    gameParticipant: {
      findUniqueOrThrow: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    playerGoalState: {
      createMany: vi.fn(),
      update: vi.fn(),
    },
    playerClue: {
      upsert: vi.fn(),
    },
    actionLog: {
      create: vi.fn(),
    },
  } as const;

  const prisma = {
    systemSetting: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    scenarioDefinition: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    scenarioRole: {
      update: vi.fn(),
      create: vi.fn(),
    },
    scenarioRoom: {
      update: vi.fn(),
      create: vi.fn(),
    },
    scenarioClue: {
      update: vi.fn(),
      create: vi.fn(),
    },
    scenarioItem: {
      update: vi.fn(),
      create: vi.fn(),
    },
    scenarioGoal: {
      update: vi.fn(),
      create: vi.fn(),
    },
    scenarioDecision: {
      update: vi.fn(),
      create: vi.fn(),
    },
    playerGoalState: {
      update: vi.fn(),
    },
    playerClue: {
      upsert: vi.fn(),
    },
    actionLog: {
      create: vi.fn(),
    },
    game: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    gameParticipant: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (input: unknown) => {
      if (typeof input === "function") {
        return input(tx);
      }

      return input;
    }),
  } as const;

  return { mockTx: tx, mockPrisma: prisma };
});

vi.mock("@/src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import {
  assignPlayerToSeat,
  getHostScenarioViewForGame,
  joinGameWithUser,
  startActTwo,
  triggerEventPhaseTwo,
} from "../src/server/services/prototype";

describe("prototype services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);
    mockPrisma.systemSetting.upsert.mockResolvedValue(undefined);
    mockPrisma.scenarioDefinition.findUnique.mockResolvedValue({
      id: "scenario-1",
      slug: "blackout-at-hale-cabin",
      title: "Blackout at Hale Cabin",
      summary: "Summary",
      playerCount: 6,
      roles: [],
      rooms: [{ id: "room-1" }],
      clues: [],
      items: [],
      goals: [],
      decision: null,
    });
    mockPrisma.scenarioDefinition.update.mockResolvedValue(undefined);
    mockPrisma.scenarioRole.update.mockResolvedValue(undefined);
    mockPrisma.scenarioRole.create.mockResolvedValue({ id: "role-created" });
    mockPrisma.scenarioRoom.update.mockResolvedValue(undefined);
    mockPrisma.scenarioRoom.create.mockResolvedValue(undefined);
    mockPrisma.scenarioClue.update.mockResolvedValue(undefined);
    mockPrisma.scenarioClue.create.mockResolvedValue(undefined);
    mockPrisma.scenarioItem.update.mockResolvedValue(undefined);
    mockPrisma.scenarioItem.create.mockResolvedValue(undefined);
    mockPrisma.scenarioGoal.update.mockResolvedValue(undefined);
    mockPrisma.scenarioGoal.create.mockResolvedValue(undefined);
    mockPrisma.scenarioDecision.update.mockResolvedValue(undefined);
    mockPrisma.scenarioDecision.create.mockResolvedValue(undefined);
    mockPrisma.playerGoalState.update.mockResolvedValue(undefined);
    mockPrisma.playerClue.upsert.mockResolvedValue(undefined);
    mockPrisma.actionLog.create.mockResolvedValue(undefined);
    mockPrisma.game.findUnique.mockResolvedValue(undefined);
    mockPrisma.game.findFirst.mockResolvedValue(undefined);
    mockPrisma.game.findUniqueOrThrow.mockResolvedValue({
      id: "game-1",
      createdByUserId: "host-1",
    });
    mockPrisma.game.update.mockResolvedValue(undefined);
    mockTx.scenarioDefinition.update.mockResolvedValue(undefined);
    mockTx.scenarioRole.update.mockResolvedValue(undefined);
    mockTx.scenarioRole.create.mockResolvedValue({ id: "role-created" });
    mockTx.scenarioRoom.update.mockResolvedValue(undefined);
    mockTx.scenarioRoom.create.mockResolvedValue(undefined);
    mockTx.scenarioClue.update.mockResolvedValue(undefined);
    mockTx.scenarioClue.create.mockResolvedValue(undefined);
    mockTx.scenarioItem.update.mockResolvedValue(undefined);
    mockTx.scenarioItem.create.mockResolvedValue(undefined);
    mockTx.scenarioGoal.update.mockResolvedValue(undefined);
    mockTx.scenarioGoal.create.mockResolvedValue(undefined);
    mockTx.scenarioDecision.update.mockResolvedValue(undefined);
    mockTx.scenarioDecision.create.mockResolvedValue(undefined);
    mockPrisma.gameParticipant.findMany.mockResolvedValue([]);
    mockTx.gameParticipant.update.mockResolvedValue(undefined);
    mockTx.playerGoalState.update.mockResolvedValue(undefined);
    mockTx.playerGoalState.createMany.mockResolvedValue(undefined);
    mockTx.playerClue.upsert.mockResolvedValue(undefined);
    mockTx.actionLog.create.mockResolvedValue(undefined);
  });

  it("joins a reserved email onto the reserved seat before any generic open seat", async () => {
    mockPrisma.game.findUnique.mockResolvedValue({
      id: "game-1",
      participants: [
        { id: "open-seat", userId: null, assignedEmail: null },
        { id: "reserved-seat", userId: null, assignedEmail: "reserved@example.com" },
      ],
    });
    mockPrisma.gameParticipant.update.mockResolvedValue({ id: "reserved-seat" });

    await joinGameWithUser("ash-123", {
      id: "user-1",
      email: "reserved@example.com",
      user_metadata: { full_name: "Reserved Player" },
    });

    expect(mockPrisma.gameParticipant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "reserved-seat" },
      }),
    );
  });

  it("does not clear a claimed seat when move-player submits with no selected player", async () => {
    mockTx.gameParticipant.findUniqueOrThrow.mockResolvedValue({
      id: "seat-1",
      gameId: "game-1",
      scenarioRoleId: "role-1",
      userId: "player-1",
      assignedEmail: "player@example.com",
      displayName: "Player One",
      joinedAt: new Date("2026-04-01T10:00:00.000Z"),
      game: {
        createdByUserId: "host-1",
        stage: "SETUP",
      },
    });

    await assignPlayerToSeat("seat-1", "host-1", { mode: "move-player" });

    expect(mockTx.gameParticipant.update).not.toHaveBeenCalled();
  });

  it("clears only the reservation when asked to clear an open reserved seat", async () => {
    mockTx.gameParticipant.findUniqueOrThrow.mockResolvedValue({
      id: "seat-1",
      gameId: "game-1",
      scenarioRoleId: "role-1",
      userId: null,
      assignedEmail: "reserved@example.com",
      displayName: "Open",
      joinedAt: new Date("2026-04-01T10:00:00.000Z"),
      game: {
        createdByUserId: "host-1",
        stage: "SETUP",
      },
    });

    await assignPlayerToSeat("seat-1", "host-1", { mode: "clear-reservation" });

    expect(mockTx.gameParticipant.update).toHaveBeenCalledWith({
      where: { id: "seat-1" },
      data: {
        assignedEmail: null,
      },
    });
  });

  it("keeps Event 1 from granting new action budgets", async () => {
    mockPrisma.game.findUniqueOrThrow.mockResolvedValueOnce({
      id: "game-1",
      createdByUserId: "host-1",
    });
    mockPrisma.game.findUniqueOrThrow.mockResolvedValueOnce({
      id: "game-1",
      createdByUserId: "host-1",
      decisionOutcomeKey: null,
      scenario: {
        eventTitle: "The blackout",
        clues: [
          { id: "clue-1", code: "victor-dead-in-study" },
          { id: "clue-2", code: "dagger-missing-after-blackout" },
          { id: "clue-3", code: "blackout-timing" },
          { id: "clue-4", code: "daniel-public-outburst" },
        ],
      },
      participants: [
        {
          id: "seat-1",
          goals: [],
        },
      ],
    });

    await triggerEventPhaseTwo("game-1", "host-1");

    expect(mockPrisma.game.update).toHaveBeenCalledWith({
      where: { id: "game-1" },
      data: expect.objectContaining({ stage: "EVENT_1" }),
    });
    expect(mockPrisma.playerClue.upsert).toHaveBeenCalled();
    expect(mockTx.gameParticipant.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ actionsRemaining: expect.any(Number) }),
      }),
    );
  });

  it("starts Act 2 by restoring action budgets and activating act-two goals", async () => {
    mockPrisma.game.findUniqueOrThrow.mockResolvedValueOnce({
      id: "game-1",
      createdByUserId: "host-1",
    });
    mockPrisma.game.findUniqueOrThrow.mockResolvedValueOnce({
      id: "game-1",
      createdByUserId: "host-1",
      scenario: {
        actionBudgetPerAct: 3,
        goals: [],
      },
      participants: [
        {
          id: "seat-1",
          goals: [
            {
              id: "goal-1",
              status: "FAILED",
              scenarioGoal: {
                stage: "ACT_2",
              },
            },
          ],
        },
      ],
    });

    await startActTwo("game-1", "host-1");

    expect(mockPrisma.gameParticipant.update).toHaveBeenCalledWith({
      where: { id: "seat-1" },
      data: {
        actionsRemaining: 3,
      },
    });
    expect(mockPrisma.playerGoalState.update).toHaveBeenCalledWith({
      where: { id: "goal-1" },
      data: {
        status: "ACTIVE",
      },
    });
  });

  it("builds a read-only host scenario view from the seeded definition", async () => {
    mockPrisma.game.findFirst.mockResolvedValue({
      id: "game-1",
      title: "Blackout at Hale Cabin",
      code: "ash-123",
      status: "ACTIVE",
      stage: "ACT_1",
      decisionOutcomeKey: "daniel-public-outburst",
      scenario: {
        title: "Blackout at Hale Cabin",
        eventTitle: "The Blackout Murder",
        eventDescription: "Victor publicly names Marcus as his successor.",
        actionBudgetPerAct: 3,
        roles: [
          {
            id: "role-1",
            code: "victor-hale",
            slotNumber: 1,
            characterName: "Victor Hale",
          },
        ],
        rooms: [
          {
            id: "room-1",
            code: "study",
            name: "Study",
            description: "Study",
          },
        ],
      },
      participants: [
        {
          id: "seat-1",
          userId: "user-1",
          displayName: "Steven",
          assignedEmail: "steven@example.com",
          scenarioRoleId: "role-1",
          assignedAt: new Date("2026-04-01T10:00:00.000Z"),
          joinedAt: new Date("2026-04-01T10:00:00.000Z"),
          actionsRemaining: 3,
          scenarioRole: {
            code: "victor-hale",
            characterName: "Victor Hale",
            characterTitle: "The Host",
            slotNumber: 1,
          },
        },
      ],
    });

    const result = await getHostScenarioViewForGame("host-1", "game-1");

    expect(result?.title).toBe("Blackout at Hale Cabin");
    expect(result?.stages).toHaveLength(6);
    expect(result?.stages.find((stage) => stage.key === "event-1")?.eventClueCount).toBe(4);
    expect(result?.roles.some((role) => role.isDecisionOwner && role.roleCode === "daniel-hale")).toBe(true);
    expect(result?.secrets.every((secret) => secret.clueTitles.length >= 2)).toBe(true);
    expect(result?.goalPaths.some((goal) => goal.authorPath.length > 0)).toBe(true);
  });
});
