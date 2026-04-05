import type { ActionType, GameStage, GameStatus, GoalStatus } from "@prisma/client";
import type { StageKey } from "@/src/domain/core";
import type { PrototypeGoalRule, PrototypeRoomResult } from "@/src/features/prototype/definition";

export type SeatOccupant = {
  userId: string | null;
  displayName: string;
  assignedEmail: string | null;
  joinedAt: Date;
};

export function mapGameStageToKey(stage: GameStage | string | null | undefined): StageKey {
  switch (stage) {
    case "SETUP":
    case "PREGAME":
      return "setup";
    case "ACT_1":
    case "PHASE_1":
      return "act-1";
    case "EVENT_1":
      return "event-1";
    case "ACT_2":
    case "PHASE_2":
      return "act-2";
    case "FINALE":
      return "finale";
    case "RESOLUTION":
    case "REVEALED":
      return "resolution";
    default:
      return "setup";
  }
}

export function mapGameStatusToKey(status: GameStatus): "draft" | "active" | "completed" {
  switch (status) {
    case "DRAFT":
      return "draft";
    case "ACTIVE":
      return "active";
    case "COMPLETED":
      return "completed";
  }
}

export function mapGoalStatusToKey(status: GoalStatus): "active" | "completed" | "failed" {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
  }
}

export function mapActionTypeToLabel(actionType: ActionType): string {
  switch (actionType) {
    case "SEARCH_ROOM":
      return "Search Room";
    case "EAVESDROP":
      return "Eavesdrop";
    case "PICKPOCKET":
      return "Pickpocket";
    case "TRADE_PROPOSED":
      return "Trade Proposed";
    case "TRADE_RESPONDED":
      return "Trade Response";
    case "PLANT_ITEM":
      return "Plant Item";
    case "DECISION_SUBMITTED":
      return "Decision";
    case "ACCUSATION_SUBMITTED":
      return "Accusation";
    case "ACT_STARTED":
      return "Act Start";
    case "EVENT_TRIGGERED":
      return "Event 1";
    case "FINALE_STARTED":
      return "Finale";
    case "RESOLUTION_OPENED":
      return "Resolution";
  }
}

export function canUseLiveActions(stage: StageKey) {
  return stage === "act-1" || stage === "act-2";
}

export function isEventOneOrLater(stage: StageKey) {
  return stage === "event-1" || stage === "act-2" || stage === "finale" || stage === "resolution";
}

export function canUseDecision(stage: StageKey) {
  return stage === "act-1";
}

export function canSubmitAccusation(stage: StageKey) {
  return stage === "finale";
}

function hasStagePassed(goalStage: GameStage, currentStage: StageKey) {
  if (goalStage === "ACT_1") {
    return currentStage === "event-1" || currentStage === "act-2" || currentStage === "finale" || currentStage === "resolution";
  }

  if (goalStage === "ACT_2") {
    return currentStage === "finale" || currentStage === "resolution";
  }

  return false;
}

export function getSetupGoalStatus(goalStage: GameStage): GoalStatus {
  return goalStage === "ACT_1" ? "ACTIVE" : "FAILED";
}

export function getActTwoGoalStatus(goalStage: GameStage, currentStatus: GoalStatus): GoalStatus {
  if (goalStage === "ACT_2") {
    return "ACTIVE";
  }

  return currentStatus === "COMPLETED" ? "COMPLETED" : "FAILED";
}

export function pickJoinableSeat<T extends { userId: string | null; assignedEmail: string | null }>(
  seats: T[],
  normalizedEmail?: string | null,
) {
  if (normalizedEmail) {
    const reservedSeat = seats.find(
      (seat) => !seat.userId && seat.assignedEmail?.trim().toLowerCase() === normalizedEmail,
    );

    if (reservedSeat) {
      return reservedSeat;
    }
  }

  return seats.find((seat) => !seat.userId && !seat.assignedEmail) ?? null;
}

export function deriveSeatSwap(
  target: SeatOccupant,
  source: SeatOccupant,
  fallbackAssignedEmail?: string | null,
) {
  return {
    target: {
      userId: source.userId,
      displayName: source.displayName,
      assignedEmail: source.assignedEmail ?? fallbackAssignedEmail ?? null,
      joinedAt: source.joinedAt,
    },
    source: target.userId
      ? {
          userId: target.userId,
          displayName: target.displayName,
          assignedEmail: target.assignedEmail,
          joinedAt: target.joinedAt,
        }
      : {
          userId: null,
          displayName: "Open",
          assignedEmail: null,
          joinedAt: new Date(),
        },
  };
}

export function normalizeFreeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function selectNextRoomResult(
  results: PrototypeRoomResult[],
  index: number,
  stage: StageKey,
  participantRoleCode?: string,
) {
  const eligible = results.filter(
    (result) =>
      (!result.stage || result.stage === stage) &&
      (!participantRoleCode || !result.excludedRoleCodes?.includes(participantRoleCode)),
  );

  if (eligible.length === 0) {
    return null;
  }

  return {
    result: eligible[index % eligible.length],
    nextIndex: index + 1,
  };
}

export function evaluateGoalRule(rule: PrototypeGoalRule, input: {
  itemCodes: string[];
  clueCodes: string[];
  decisionOutcomeKey?: string | null;
  hasAccusation: boolean;
  currentStage: StageKey;
  goalStage: GameStage;
}) {
  switch (rule.type) {
    case "possess-item":
      return input.itemCodes.includes(rule.itemCode);
    case "possess-item-until-stage-end":
      return hasStagePassed(input.goalStage, input.currentStage) && input.itemCodes.includes(rule.itemCode);
    case "gain-clue":
      return input.clueCodes.includes(rule.clueCode);
    case "gain-any-clue":
      return rule.clueCodes.some((clueCode) => input.clueCodes.includes(clueCode));
    case "decision-branch":
      return input.decisionOutcomeKey === rule.outcomeKey;
    case "submit-accusation":
      return input.hasAccusation;
  }
}

export function getEventClueCodes(input: {
  everyoneClueCodes: string[];
  branchClueCodes: Record<string, string[]>;
  branchKey: string;
}) {
  return [...input.everyoneClueCodes, ...(input.branchClueCodes[input.branchKey] ?? [])];
}

export function canAccuseRole(input: {
  stage: StageKey;
  roleCode?: string | null;
  nonSuspectRoleCodes?: string[];
}) {
  if (!input.roleCode) {
    return false;
  }

  if (input.stage === "setup" || input.stage === "act-1") {
    return true;
  }

  return !(input.nonSuspectRoleCodes ?? []).includes(input.roleCode);
}

export function computeRevealScore(input: {
  suspectRoleCode?: string | null;
  motive: string;
  means: string;
  solution: {
    suspectRoleCode: string;
    motive: string;
    means: string;
  };
  goalPoints: number;
}) {
  let accusationScore = 0;

  if (input.suspectRoleCode === input.solution.suspectRoleCode) {
    accusationScore += 3;
  }

  if (normalizeFreeText(input.motive) === normalizeFreeText(input.solution.motive)) {
    accusationScore += 2;
  }

  if (normalizeFreeText(input.means) === normalizeFreeText(input.solution.means)) {
    accusationScore += 2;
  }

  return {
    accusationScore,
    goalScore: input.goalPoints,
    total: accusationScore + input.goalPoints,
  };
}
