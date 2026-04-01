import type { EntityId, GameStatusKey, StageKey } from "@/src/domain/core";

export type GameSummary = {
  id: EntityId;
  title: string;
  code: string;
  status: GameStatusKey;
  currentStage: StageKey | "resolution";
  scenarioTitle: string;
};

export type ScenarioSummary = {
  id: EntityId;
  slug: string;
  title: string;
  summary: string;
  playerCount: number;
  roomCount: number;
};

export type HostGameListItem = {
  id: EntityId;
  title: string;
  code: string;
  status: GameStatusKey;
  currentStage: StageKey | "resolution";
  scenarioTitle: string;
  participantCount: number;
  claimedSeatCount: number;
  updatedAt: string;
  href: string;
};

export type HostParticipantSummary = {
  id: EntityId;
  seatLabel: string;
  playerName?: string;
  playerLabel: string;
  assignedEmail?: string;
  email?: string;
  hasUser: boolean;
  roleId: EntityId;
  roleCode: string;
  characterName: string;
  characterTitle: string;
  joinedAt: string;
  assignedAt?: string;
  actionsRemaining: number;
  seatStatus: "open" | "claimed";
  controlState: "host" | "player" | "host-or-player";
};

export type HostRoomSummary = {
  id: EntityId;
  code: string;
  name: string;
  description: string;
  route: string;
};

export type HostGameDetail = {
  game: GameSummary;
  eventTitle: string;
  eventDescription: string;
  actionBudgetPerAct: number;
  participants: HostParticipantSummary[];
  rooms: HostRoomSummary[];
  joinUrl: string;
  canStartActOne: boolean;
  canTriggerEventOne: boolean;
  canStartActTwo: boolean;
  canStartFinale: boolean;
  canReveal: boolean;
  branchLabel?: string;
  joinedPlayers: Array<{
    seatId: EntityId;
    playerName: string;
    email?: string;
  }>;
};
