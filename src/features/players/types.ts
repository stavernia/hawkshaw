import type { EntityId, GameStatusKey } from "@/src/domain/core";

export type PlayerSummary = {
  id: EntityId;
  displayName: string;
  characterName?: string;
  publicDescription?: string;
};

export type PlayerKnowledgeFact = {
  id: EntityId;
  title: string;
  body: string;
  subjectName?: string;
};

export type PersonalizedPlayerDetail = {
  id: EntityId;
  actorName: string;
  roleCode?: string;
  characterName?: string;
  characterTitle?: string;
  publicDescription?: string;
  canBePickpocketed?: boolean;
  knownFacts: PlayerKnowledgeFact[];
};

export type PendingTradeSummary = {
  id: EntityId;
  proposerName: string;
  responderName: string;
  itemLabel: string;
  status: "pending" | "accepted" | "rejected" | "canceled";
  createdAt: string;
};

export type PlayerDashboardView = {
  canControlCharacters: boolean;
  isImpersonating: boolean;
  gameId: EntityId;
  gameCode: string;
  scenarioTitle: string;
  stage: "setup" | "act-1" | "event-1" | "act-2" | "finale" | "resolution";
  status: GameStatusKey;
  title: string;
  scenarioSummary: string;
  eventTitle: string;
  eventDescription: string;
  crimeSceneTitle?: string;
  crimeSceneDescription?: string;
  participant: {
    id: EntityId;
    actorName: string;
    actionsRemaining: number;
  };
  seatLinks: Array<{
    id: EntityId;
    displayName: string;
    characterName?: string;
    href: string;
  }>;
  rooms: Array<{
    id: EntityId;
    code: string;
    name: string;
    href: string;
  }>;
  role?: {
    code: string;
    characterName: string;
    characterTitle: string;
    publicDescription: string;
    privateDescription: string;
    actTwoBriefing?: string;
    howToAct: {
      vibe: string;
      inspiration: string;
      quirk: string;
      playTips: string[];
    };
    currentSummary: string;
    starterHints: string[];
    nextSteps: string[];
  };
  goals: Array<{
    id: EntityId;
    title: string;
    description: string;
    status: "active" | "completed" | "failed";
    points: number;
  }>;
  clues: Array<{
    id: EntityId;
    title: string;
    body: string;
    source: string;
  }>;
  items: Array<{
    id: EntityId;
    label: string;
    description: string;
    quantity: number;
    code: string;
  }>;
  players: PersonalizedPlayerDetail[];
  accusationTargets: Array<{
    id: EntityId;
    actorName: string;
    roleCode?: string;
    characterName?: string;
    characterTitle?: string;
  }>;
  pendingIncomingTrades: PendingTradeSummary[];
  pendingOutgoingTrades: PendingTradeSummary[];
  accusation?: {
    suspectParticipantId?: string;
    motive: string;
    means: string;
  };
  decision?: {
    title: string;
    description: string;
    optionAKey: string;
    optionALabel: string;
    optionBKey: string;
    optionBLabel: string;
    selectedOutcomeKey?: string;
  };
  canSubmitAccusation: boolean;
  actionLog: Array<{
    id: EntityId;
    actionType: string;
    summary: string;
    createdAt: string;
  }>;
  reveal?: {
    solution: {
      suspectName: string;
      motive: string;
      means: string;
      summary: string;
    };
    score: number;
    accusationScore: number;
    goalScore: number;
  };
};

export type PlayerDashboard = PlayerDashboardView & {
  controlledDashboards?: PlayerDashboardView[];
};
