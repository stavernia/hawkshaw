import type { EntityId } from "@/src/domain/core";

export type DecisionOption = {
  id: EntityId;
  label: string;
};

export type DecisionSummary = {
  id: EntityId;
  title: string;
  options: DecisionOption[];
};

