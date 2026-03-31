import type { EntityId, PhaseKey } from "@/src/domain/core";

export type GameStatus = "draft" | "active" | "completed";

export type GameSummary = {
  id: EntityId;
  title: string;
  status: GameStatus;
  currentPhase: PhaseKey;
};

