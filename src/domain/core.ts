export type EntityId = string;
export type StageKey = "setup" | "act-1" | "event-1" | "act-2" | "finale" | "resolution";
export type Visibility = "public" | "private" | "host-only";

export type ActionTypeKey =
  | "search-room"
  | "eavesdrop"
  | "pickpocket"
  | "trade"
  | "plant-item"
  | "decision"
  | "accusation";

export type ItemTypeKey = "money" | "weapon" | "evidence" | "key-item";
export type GameStatusKey = "draft" | "active" | "completed";
export type GoalStatusKey = "active" | "completed" | "failed";
