import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const tx = {
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
    scenarioGoal: {
      findMany: vi.fn(),
    },
    playerGoalState: {
      createMany: vi.fn(),
      update: vi.fn(),
    },
    scenarioClue: {
      findFirstOrThrow: vi.fn(),
    },
    playerClue: {
      upsert: vi.fn(),
    },
    actionLog: {
      create: vi.fn(),
    },
  } as const;

  const prisma = {
    game: {
      findUnique: vi.fn(),
    },
    gameParticipant: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (callback: (client: unknown) => Promise<unknown>) => callback(tx)),
  } as const;

  return { mockTx: tx, mockPrisma: prisma };
});

vi.mock("@/src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import {
  assignPlayerToSeat,
  joinGameWithUser,
  startActTwo,
  triggerEventPhaseTwo,
} from "../src/server/services/prototype";

describe("prototype services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    mockTx.game.findUniqueOrThrow.mockResolvedValue({
      id: "game-1",
      createdByUserId: "host-1",
      decisionOutcomeKey: null,
      scenario: {
        eventTitle: "The blackout",
        clues: [{ id: "clue-1", code: "storm-clue" }],
      },
      participants: [
        {
          id: "seat-1",
          goals: [],
        },
      ],
    });

    await triggerEventPhaseTwo("game-1", "host-1");

    expect(mockTx.game.update).toHaveBeenCalledWith({
      where: { id: "game-1" },
      data: expect.objectContaining({ stage: "EVENT_1" }),
    });
    expect(mockTx.gameParticipant.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ actionsRemaining: expect.any(Number) }),
      }),
    );
  });

  it("starts Act 2 by restoring action budgets and activating act-two goals", async () => {
    mockTx.game.findUniqueOrThrow.mockResolvedValue({
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

    expect(mockTx.gameParticipant.update).toHaveBeenCalledWith({
      where: { id: "seat-1" },
      data: {
        actionsRemaining: 3,
      },
    });
    expect(mockTx.playerGoalState.update).toHaveBeenCalledWith({
      where: { id: "goal-1" },
      data: {
        status: "ACTIVE",
      },
    });
  });
});
