import type { EntityId, Visibility } from "@/src/domain/core";

export type ClueSummary = {
  id: EntityId;
  title: string;
  visibility: Visibility;
  body?: string;
  source?: string;
};
