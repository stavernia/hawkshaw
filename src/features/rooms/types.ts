import type { EntityId } from "@/src/domain/core";

export type RoomSummary = {
  id: EntityId;
  name: string;
  qrCodeSlug: string;
  description?: string;
};
