import type { EntityId } from "@/src/domain/core";

export type GoalStatus = "active" | "completed" | "failed";

export type GoalSummary = {
  id: EntityId;
  title: string;
  status: GoalStatus;
  description?: string;
  points?: number;
};
