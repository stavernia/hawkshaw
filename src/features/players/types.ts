import type { EntityId } from "@/src/domain/core";

export type PlayerSummary = {
  id: EntityId;
  displayName: string;
  characterName?: string;
};

