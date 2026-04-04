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

export type HostScenarioWarning = {
  code: string;
  title: string;
  detail: string;
};

export type HostScenarioStageSummary = {
  key: StageKey | "resolution";
  label: string;
  summary: string;
  eventTitle: string;
  eventDescription: string;
  mechanics: {
    roomActions: boolean;
    decision: boolean;
    accusations: boolean;
  };
  actGoalCount: number;
  eventClueCount: number;
};

export type HostScenarioRoleSheet = {
  roleCode: string;
  seatLabel: string;
  characterName: string;
  characterTitle: string;
  assignedPlayerLabel?: string;
  publicDescription: string;
  privateDescription: string;
  actTwoBriefing?: string;
  isDecisionOwner: boolean;
  startingClues: string[];
  startingItems: string[];
  knowledge: Array<{
    subjectName: string;
    title: string;
    body: string;
  }>;
  actOneGoals: string[];
  actTwoGoals: string[];
};

export type HostScenarioSecretSummary = {
  code: string;
  title: string;
  truth: string;
  clueCodes: string[];
  clueTitles: string[];
};

export type HostScenarioClueSummary = {
  code: string;
  title: string;
  body: string;
  secretTitles: string[];
  sourceHints: string[];
  reachableRoleNames: string[];
};

export type HostScenarioItemSummary = {
  code: string;
  label: string;
  description: string;
  flags: string[];
  startingOwnerNames: string[];
  usedByGoalTitles: string[];
  sourceHints: string[];
};

export type HostScenarioGoalPath = {
  code: string;
  roleName: string;
  stage: StageKey | "resolution";
  title: string;
  description: string;
  ruleLabel: string;
  authorPath: string[];
  dependencyClueTitles: string[];
  dependencyItemLabels: string[];
  softContactNames: string[];
  warning?: string;
};

export type HostScenarioRoomSummary = {
  code: string;
  name: string;
  description: string;
  actOneSearchCount: number;
  actOneEavesdropCount: number;
  actTwoSearchCount: number;
  actTwoEavesdropCount: number;
};

export type HostScenarioView = {
  title: string;
  slug: string;
  branchLabel?: string;
  stats: {
    playerCount: number;
    roomCount: number;
    clueCount: number;
    itemCount: number;
    secretCount: number;
    goalCount: number;
    warningCount: number;
  };
  stages: HostScenarioStageSummary[];
  roles: HostScenarioRoleSheet[];
  secrets: HostScenarioSecretSummary[];
  clues: HostScenarioClueSummary[];
  items: HostScenarioItemSummary[];
  rooms: HostScenarioRoomSummary[];
  goalPaths: HostScenarioGoalPath[];
  warnings: HostScenarioWarning[];
};
