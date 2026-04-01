import type { EntityId, Visibility } from "@/src/domain/core";

export type ItemSummary = {
  id: EntityId;
  label: string;
  visibility: Visibility;
  code?: string;
  description?: string;
  quantity?: number;
};
