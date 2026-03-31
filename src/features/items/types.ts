import type { EntityId, Visibility } from "@/src/domain/core";

export type ItemSummary = {
  id: EntityId;
  label: string;
  visibility: Visibility;
};

