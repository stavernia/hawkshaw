import type {
  ActionType,
  ClueVisibilitySource,
  GameStage,
  GameStatus,
  GoalStatus,
  TradeStatus,
  Prisma,
} from "@prisma/client";
import { SITE_ROUTES } from "@/src/config/routes";
import { prisma } from "@/src/lib/prisma";
import { PROTOTYPE_SCENARIO, type PrototypeGoalRule, type PrototypeRoomResult } from "@/src/features/prototype/definition";
import {
  canAccuseRole,
  canSubmitAccusation,
  canUseDecision,
  canUseLiveActions,
  computeRevealScore,
  deriveSeatSwap,
  evaluateGoalRule,
  getEventClueCodes,
  getActTwoGoalStatus,
  getSetupGoalStatus,
  isEventOneOrLater,
  mapActionTypeToLabel,
  mapGameStageToKey,
  mapGameStatusToKey,
  mapGoalStatusToKey,
  pickJoinableSeat,
  selectNextRoomResult,
} from "@/src/features/prototype/logic";
import type {
  HostGameDetail,
  HostGameListItem,
  HostScenarioView,
  ScenarioSummary,
} from "@/src/features/games/types";
import type { PlayerDashboard, PlayerDashboardView } from "@/src/features/players/types";
const GAME_STAGE = {
  SETUP: "SETUP",
  ACT_1: "ACT_1",
  EVENT_1: "EVENT_1",
  ACT_2: "ACT_2",
  FINALE: "FINALE",
  RESOLUTION: "RESOLUTION",
} as const satisfies Record<string, GameStage>;

const GAME_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
} as const satisfies Record<string, GameStatus>;

const GOAL_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const satisfies Record<string, GoalStatus>;

const TRADE_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED",
} as const satisfies Record<string, TradeStatus>;

const ACTION_TYPE = {
  SEARCH_ROOM: "SEARCH_ROOM",
  EAVESDROP: "EAVESDROP",
  PICKPOCKET: "PICKPOCKET",
  TRADE_PROPOSED: "TRADE_PROPOSED",
  TRADE_RESPONDED: "TRADE_RESPONDED",
  PLANT_ITEM: "PLANT_ITEM",
  DECISION_SUBMITTED: "DECISION_SUBMITTED",
  ACCUSATION_SUBMITTED: "ACCUSATION_SUBMITTED",
  ACT_STARTED: "ACT_STARTED",
  EVENT_TRIGGERED: "EVENT_TRIGGERED",
  FINALE_STARTED: "FINALE_STARTED",
  RESOLUTION_OPENED: "RESOLUTION_OPENED",
} as const satisfies Record<string, ActionType>;

const CLUE_VISIBILITY_SOURCE = {
  ROLE_INFO: "ROLE_INFO",
  GOAL_REWARD: "GOAL_REWARD",
  ROOM_ACTION: "ROOM_ACTION",
  EVENT_UPDATE: "EVENT_UPDATE",
  PLAYER_ACTION: "PLAYER_ACTION",
  DECISION_OUTCOME: "DECISION_OUTCOME",
} as const satisfies Record<string, ClueVisibilitySource>;

const PROTOTYPE_SCENARIO_SYNC_KEY = `prototype-scenario-sync:${PROTOTYPE_SCENARIO.slug}`;
const PROTOTYPE_SCENARIO_SYNC_VERSION = "2026-04-04-cabin-prototype-v1";

function parseJsonArray<T>(value: Prisma.JsonValue): T[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as T[];
}

function buildGameCode() {
  return `ash-${Math.random().toString(36).slice(2, 8)}`;
}

function displayNameFromUser(user: { email?: string | null; user_metadata?: Record<string, unknown> | null }) {
  const nameValue = user.user_metadata?.full_name ?? user.user_metadata?.name;

  if (typeof nameValue === "string" && nameValue.trim().length > 0) {
    return nameValue.trim();
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Guest";
}

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || null;
}

function playerLabelFromSeat(seat: { userId?: string | null; displayName: string; assignedEmail?: string | null }) {
  if (seat.userId) {
    return seat.displayName;
  }

  return seat.assignedEmail ?? "Host Control";
}

function requireParticipantRole(participant: { scenarioRole: { code: string } | null }) {
  if (!participant.scenarioRole) {
    throw new Error("Participant has not been assigned a role yet.");
  }

  return participant.scenarioRole;
}

function sortParticipantsForSeatOrder<
  T extends {
    displayName: string;
    scenarioRole?: { slotNumber?: number | null } | null;
  },
>(participants: T[]) {
  return [...participants].sort((left, right) => {
    const leftSlot = left.scenarioRole?.slotNumber ?? Number.MAX_SAFE_INTEGER;
    const rightSlot = right.scenarioRole?.slotNumber ?? Number.MAX_SAFE_INTEGER;

    if (leftSlot !== rightSlot) {
      return leftSlot - rightSlot;
    }

    return left.displayName.localeCompare(right.displayName);
  });
}

type HostGameDetailRecord = {
  id: string;
  title: string;
  code: string;
  status: GameStatus;
  stage: GameStage;
  decisionOutcomeKey: string | null;
  scenario: {
    title: string;
    eventTitle: string;
    eventDescription: string;
    actionBudgetPerAct: number;
    roles: Array<{
      id: string;
      code: string;
      slotNumber: number;
      characterName: string;
    }>;
    rooms: Array<{
      id: string;
      code: string;
      name: string;
      description: string;
    }>;
  };
  participants: Array<{
    id: string;
    userId: string | null;
    displayName: string;
    assignedEmail: string | null;
    scenarioRoleId: string;
    assignedAt: Date | null;
    joinedAt: Date;
    actionsRemaining: number;
    scenarioRole: {
      code: string;
      characterName: string;
      characterTitle: string;
      slotNumber: number;
    };
  }>;
};

function mapHostGameDetail(detail: HostGameDetailRecord): HostGameDetail {
  return {
    game: {
      id: detail.id,
      title: detail.title,
      code: detail.code,
      status: mapGameStatusToKey(detail.status),
      currentStage: mapGameStageToKey(detail.stage),
      scenarioTitle: detail.scenario.title,
    },
    eventTitle: detail.scenario.eventTitle,
    eventDescription: detail.scenario.eventDescription,
    actionBudgetPerAct: detail.scenario.actionBudgetPerAct,
    participants: sortParticipantsForSeatOrder(detail.participants).map((participant) => ({
      id: participant.id,
      seatLabel: `Seat ${participant.scenarioRole.slotNumber}`,
      playerName: participant.userId ? participant.displayName : undefined,
      playerLabel: participant.userId
        ? participant.displayName
        : participant.assignedEmail ?? "Open",
      assignedEmail: participant.assignedEmail ?? undefined,
      email: participant.assignedEmail ?? undefined,
      hasUser: !!participant.userId,
      roleId: participant.scenarioRoleId,
      roleCode: participant.scenarioRole.code,
      characterName: participant.scenarioRole.characterName,
      characterTitle: participant.scenarioRole.characterTitle,
      joinedAt: participant.joinedAt.toISOString(),
      assignedAt: participant.assignedAt?.toISOString(),
      actionsRemaining: participant.actionsRemaining,
      seatStatus: participant.userId ? "claimed" : "open",
      controlState: participant.userId ? "host-or-player" : "host",
    })),
    rooms: detail.scenario.rooms.map((room) => ({
      id: room.id,
      code: room.code,
      name: room.name,
      description: room.description,
      route: SITE_ROUTES.gameRoom(detail.id, room.code),
    })),
    joinUrl: SITE_ROUTES.join(detail.code),
    canStartActOne: detail.stage === GAME_STAGE.SETUP,
    canTriggerEventOne: detail.stage === GAME_STAGE.ACT_1,
    canStartActTwo: detail.stage === GAME_STAGE.EVENT_1,
    canStartFinale: detail.stage === GAME_STAGE.ACT_2,
    canReveal: detail.stage === GAME_STAGE.FINALE,
    branchLabel: detail.decisionOutcomeKey ?? undefined,
    joinedPlayers: detail.participants
      .filter((participant) => !!participant.userId)
      .map((participant) => ({
        seatId: participant.id,
        playerName: participant.displayName,
        email: participant.assignedEmail ?? undefined,
      })),
  };
}

function stageLabelFromKey(stage: string) {
  return stage.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stageKeyFromGameStage(stage: GameStage) {
  return mapGameStageToKey(stage) as "setup" | "act-1" | "event-1" | "act-2" | "finale" | "resolution";
}

function buildFallbackKnowledgeFact(input: {
  viewerRoleCode?: string;
  subjectRoleCode?: string;
  subjectName?: string;
}) {
  const subjectName = input.subjectName ?? "this player";
  const title = "First read";

  switch (input.subjectRoleCode) {
    case "victor-hale":
      return {
        id: `fallback-${input.viewerRoleCode ?? "viewer"}-${input.subjectRoleCode}`,
        title,
        body: `${subjectName} is the center of the weekend. Whatever happens tonight will start with his authority, his decision, or the trouble gathering around him.`,
        subjectName,
      };
    case "eleanor-hale":
      return {
        id: `fallback-${input.viewerRoleCode ?? "viewer"}-${input.subjectRoleCode}`,
        title,
        body: `${subjectName} knows how to manage the room and protect appearances. If she turns her attention toward someone, there is usually a reason.`,
        subjectName,
      };
    case "daniel-hale":
      return {
        id: `fallback-${input.viewerRoleCode ?? "viewer"}-${input.subjectRoleCode}`,
        title,
        body: `${subjectName} carries expectation badly. If tonight starts slipping away from him, his frustration will be easy to spot.`,
        subjectName,
      };
    case "marcus-reed":
      return {
        id: `fallback-${input.viewerRoleCode ?? "viewer"}-${input.subjectRoleCode}`,
        title,
        body: `${subjectName} is polished, close to Victor, and harder to read than most people in the cabin. That usually means he knows more than he is saying.`,
        subjectName,
      };
    case "sofia-vale":
      return {
        id: `fallback-${input.viewerRoleCode ?? "viewer"}-${input.subjectRoleCode}`,
        title,
        body: `${subjectName} is more of an outsider than the family wants to admit. People may underestimate her, but she is close enough to notice what others miss.`,
        subjectName,
      };
    case "jack-mercer":
      return {
        id: `fallback-${input.viewerRoleCode ?? "viewer"}-${input.subjectRoleCode}`,
        title,
        body: `${subjectName} does not fit the rest of the guest list, which makes his presence worth watching. He feels like someone who arrived with unfinished business.`,
        subjectName,
      };
    default:
      return {
        id: `fallback-${input.viewerRoleCode ?? "viewer"}-${input.subjectRoleCode ?? "subject"}`,
        title,
        body: `${subjectName} is part of the pressure building in the cabin tonight. Even if you do not have leverage on them yet, they are worth keeping an eye on.`,
        subjectName,
      };
  }
}

function buildKnownFactsForPlayer(input: {
  viewerRoleCode?: string;
  subjectRoleCode?: string;
  subjectName?: string;
  knowledgeAbout: Array<{
    id: string;
    title: string;
    body: string;
  }>;
}) {
  if (input.knowledgeAbout.length > 0) {
    return input.knowledgeAbout.map((knowledge) => ({
      id: knowledge.id,
      title: knowledge.title,
      body: knowledge.body,
      subjectName: input.subjectName,
    }));
  }

  return [
    buildFallbackKnowledgeFact({
      viewerRoleCode: input.viewerRoleCode,
      subjectRoleCode: input.subjectRoleCode,
      subjectName: input.subjectName,
    }),
  ];
}

function describeGoalRule(rule: PrototypeGoalRule) {
  switch (rule.type) {
    case "possess-item":
      return `Possess item: ${rule.itemCode}`;
    case "possess-item-until-stage-end":
      return `Possess item through stage end: ${rule.itemCode}`;
    case "gain-clue":
      return `Gain clue: ${rule.clueCode}`;
    case "gain-any-clue":
      return `Gain any of: ${rule.clueCodes.join(", ")}`;
    case "decision-branch":
      return `Decision branch: ${rule.outcomeKey}`;
    case "submit-accusation":
      return "Submit accusation";
  }
}

function countResultsForStage(results: PrototypeRoomResult[], stage: "act-1" | "act-2") {
  return results.filter((result) => !result.stage || result.stage === stage).length;
}

function buildHostScenarioView(input: {
  branchLabel?: string;
  participants: HostGameDetail["participants"];
}): HostScenarioView {
  const roleByCode = new Map(PROTOTYPE_SCENARIO.roles.map((role) => [role.code, role]));
  const clueByCode = new Map(PROTOTYPE_SCENARIO.clues.map((clue) => [clue.code, clue]));
  const itemByCode = new Map(PROTOTYPE_SCENARIO.items.map((item) => [item.code, item]));
  const goalByCode = new Map(PROTOTYPE_SCENARIO.goals.map((goal) => [goal.code, goal]));
  const participantByRoleCode = new Map(input.participants.map((participant) => [participant.roleCode, participant]));

  const stages = (["setup", "act-1", "event-1", "act-2", "finale", "resolution"] as const).map((stageKey) => {
    const mechanics = PROTOTYPE_SCENARIO.stageMechanics[stageKey];
    const actGoalCount =
      stageKey === "act-1"
        ? PROTOTYPE_SCENARIO.goals.filter((goal) => goal.stage === "ACT_1").length
        : stageKey === "act-2"
          ? PROTOTYPE_SCENARIO.goals.filter((goal) => goal.stage === "ACT_2").length
          : 0;
    const selectedBranchCodes = input.branchLabel
      ? (PROTOTYPE_SCENARIO.eventAwards.branchClueCodes[input.branchLabel] ?? [])
      : [];
    const defaultBranchClueCount =
      input.branchLabel
        ? selectedBranchCodes.length
        : Math.max(0, ...Object.values(PROTOTYPE_SCENARIO.eventAwards.branchClueCodes).map((codes) => codes.length));
    const eventClueCount =
      stageKey === "event-1"
        ? PROTOTYPE_SCENARIO.eventAwards.everyoneClueCodes.length +
          defaultBranchClueCount
        : 0;

    return {
      key: stageKey,
      label: stageLabelFromKey(stageKey),
      summary: PROTOTYPE_SCENARIO.stageContent[stageKey].summary,
      eventTitle: PROTOTYPE_SCENARIO.stageContent[stageKey].eventTitle,
      eventDescription: PROTOTYPE_SCENARIO.stageContent[stageKey].eventDescription,
      mechanics,
      actGoalCount,
      eventClueCount,
    };
  });

  const roles = PROTOTYPE_SCENARIO.roles.map((role) => {
    const participant = participantByRoleCode.get(role.code);
    const actOneGoals = PROTOTYPE_SCENARIO.goals.filter((goal) => goal.roleCode === role.code && goal.stage === "ACT_1");
    const actTwoGoals = PROTOTYPE_SCENARIO.goals.filter((goal) => goal.roleCode === role.code && goal.stage === "ACT_2");

    return {
      roleCode: role.code,
      seatLabel: `Seat ${role.slotNumber}`,
      characterName: role.characterName,
      characterTitle: role.characterTitle,
      assignedPlayerLabel: participant?.playerLabel,
      publicDescription: role.publicDescription,
      privateDescription: role.privateDescription,
      actTwoBriefing: role.actTwoBriefing,
      isDecisionOwner: PROTOTYPE_SCENARIO.decision.decisionMakerRoleCode === role.code,
      startingClues: role.startingClueCodes.map((code) => clueByCode.get(code)?.title ?? code),
      startingItems: role.startingItemCodes.map((code) => itemByCode.get(code)?.label ?? code),
      knowledge: role.knowledge.map((entry) => ({
        subjectName: roleByCode.get(entry.subjectRoleCode)?.characterName ?? entry.subjectRoleCode,
        title: entry.title,
        body: entry.body,
      })),
      actOneGoals: actOneGoals.map((goal) => goal.title),
      actTwoGoals: actTwoGoals.map((goal) => goal.title),
    };
  });

  const secrets = PROTOTYPE_SCENARIO.secrets.map((secret) => ({
    code: secret.code,
    title: secret.title,
    truth: secret.truth,
    clueCodes: secret.clueCodes,
    clueTitles: secret.clueCodes.map((code) => clueByCode.get(code)?.title ?? code),
  }));

  const clues = PROTOTYPE_SCENARIO.clues.map((clue) => ({
    code: clue.code,
    title: clue.title,
    body: clue.body,
    secretTitles: (clue.secretCodes ?? []).map((code) => PROTOTYPE_SCENARIO.secrets.find((secret) => secret.code === code)?.title ?? code),
    sourceHints: clue.sourceHints ?? [],
    reachableRoleNames: (clue.reachableByRoleCodes ?? []).map((code) => roleByCode.get(code)?.characterName ?? code),
  }));

  const items = PROTOTYPE_SCENARIO.items.map((item) => ({
    code: item.code,
    label: item.label,
    description: item.description,
    flags: [
      item.isStealable === false ? null : "Stealable",
      item.isTradeable === false ? null : "Tradeable",
      item.isPlantable === false ? null : "Plantable",
    ].filter((flag): flag is string => !!flag),
    startingOwnerNames: PROTOTYPE_SCENARIO.roles
      .filter((role) => role.startingItemCodes.includes(item.code))
      .map((role) => role.characterName),
    usedByGoalTitles: (item.usedByGoalCodes ?? []).map((code) => goalByCode.get(code)?.title ?? code),
    sourceHints: item.sourceHints ?? [],
  }));

  const rooms = PROTOTYPE_SCENARIO.rooms.map((room) => ({
    code: room.code,
    name: room.name,
    description: room.description,
    actOneSearchCount: countResultsForStage(room.searchResults, "act-1"),
    actOneEavesdropCount: countResultsForStage(room.eavesdropResults, "act-1"),
    actTwoSearchCount: countResultsForStage(room.searchResults, "act-2"),
    actTwoEavesdropCount: countResultsForStage(room.eavesdropResults, "act-2"),
  }));

  const goalPaths = PROTOTYPE_SCENARIO.goals.map((goal) => {
    const dependencyClueTitles = (goal.dependsOnClueCodes ?? []).map((code) => clueByCode.get(code)?.title ?? code);
    const dependencyItemLabels = (goal.dependsOnItemCodes ?? []).map((code) => itemByCode.get(code)?.label ?? code);
    const softContactNames = (goal.softContacts ?? []).map((code) => roleByCode.get(code)?.characterName ?? code);

    let warning: string | undefined;
    if (!goal.authorPath?.length && dependencyClueTitles.length === 0 && dependencyItemLabels.length === 0) {
      warning = "No authored path notes";
    } else if ((goal.authorPath?.length ?? 0) <= 1 && dependencyClueTitles.length + dependencyItemLabels.length <= 1) {
      warning = "Only one obvious authored route";
    }

    return {
      code: goal.code,
      roleName: roleByCode.get(goal.roleCode)?.characterName ?? goal.roleCode,
      stage: stageKeyFromGameStage(goal.stage),
      title: goal.title,
      description: goal.description,
      ruleLabel: describeGoalRule(goal.rule),
      authorPath: goal.authorPath ?? [],
      dependencyClueTitles,
      dependencyItemLabels,
      softContactNames,
      warning,
    };
  });

  const warnings = [
    ...PROTOTYPE_SCENARIO.clues
      .filter((clue) => !clue.secretCodes || clue.secretCodes.length === 0)
      .map((clue) => ({
        code: `clue-no-secret-${clue.code}`,
        title: "Clue is not mapped to a secret",
        detail: `${clue.title} does not list any supporting secret codes.`,
      })),
    ...PROTOTYPE_SCENARIO.secrets
      .filter((secret) => secret.clueCodes.length < 2)
      .map((secret) => ({
        code: `secret-thin-${secret.code}`,
        title: "Secret has thin support",
        detail: `${secret.title} has fewer than two supporting clues.`,
      })),
    ...PROTOTYPE_SCENARIO.goals
      .filter((goal) => !goal.authorPath?.length && !(goal.dependsOnClueCodes?.length || goal.dependsOnItemCodes?.length))
      .map((goal) => ({
        code: `goal-no-path-${goal.code}`,
        title: "Goal lacks path guidance",
        detail: `${goal.title} has no authored path steps or dependency hints.`,
      })),
    ...PROTOTYPE_SCENARIO.goals
      .flatMap((goal) =>
        (goal.dependsOnItemCodes ?? [])
          .filter((itemCode) => {
            const item = itemByCode.get(itemCode);
            const hasStartingOwner = PROTOTYPE_SCENARIO.roles.some((role) => role.startingItemCodes.includes(itemCode));
            return !!item && !hasStartingOwner && !(item.sourceHints?.length);
          })
          .map((itemCode) => ({
            code: `goal-item-unreachable-${goal.code}-${itemCode}`,
            title: "Goal depends on a weakly sourced item",
            detail: `${goal.title} depends on ${itemByCode.get(itemCode)?.label ?? itemCode}, but that item has no starting owner or source hint.`,
          })),
      ),
    ...PROTOTYPE_SCENARIO.items
      .filter((item) => (item.usedByGoalCodes?.length ?? 0) > 0)
      .filter((item) => {
        const hasStartingOwner = PROTOTYPE_SCENARIO.roles.some((role) => role.startingItemCodes.includes(item.code));
        return !hasStartingOwner && !(item.sourceHints?.length);
      })
      .map((item) => ({
        code: `item-weak-source-${item.code}`,
        title: "Item is used but weakly sourced",
        detail: `${item.label} is tied to goals but has no starting owner or source hint.`,
      })),
    ...PROTOTYPE_SCENARIO.rooms.flatMap((room) => {
      const warningsForRoom = [];
      if (PROTOTYPE_SCENARIO.stageMechanics["act-1"].roomActions && countResultsForStage(room.searchResults, "act-1") === 0) {
        warningsForRoom.push({
          code: `room-no-act1-search-${room.code}`,
          title: "Room lacks Act 1 search result",
          detail: `${room.name} has no searchable Act 1 result.`,
        });
      }
      if (PROTOTYPE_SCENARIO.stageMechanics["act-1"].roomActions && countResultsForStage(room.eavesdropResults, "act-1") === 0) {
        warningsForRoom.push({
          code: `room-no-act1-eavesdrop-${room.code}`,
          title: "Room lacks Act 1 eavesdrop result",
          detail: `${room.name} has no eavesdrop Act 1 result.`,
        });
      }
      if (PROTOTYPE_SCENARIO.stageMechanics["act-2"].roomActions && countResultsForStage(room.searchResults, "act-2") === 0) {
        warningsForRoom.push({
          code: `room-no-act2-search-${room.code}`,
          title: "Room lacks Act 2 search result",
          detail: `${room.name} has no searchable Act 2 result.`,
        });
      }
      if (PROTOTYPE_SCENARIO.stageMechanics["act-2"].roomActions && countResultsForStage(room.eavesdropResults, "act-2") === 0) {
        warningsForRoom.push({
          code: `room-no-act2-eavesdrop-${room.code}`,
          title: "Room lacks Act 2 eavesdrop result",
          detail: `${room.name} has no eavesdrop Act 2 result.`,
        });
      }
      return warningsForRoom;
    }),
  ];

  return {
    title: PROTOTYPE_SCENARIO.title,
    slug: PROTOTYPE_SCENARIO.slug,
    branchLabel: input.branchLabel,
    stats: {
      playerCount: PROTOTYPE_SCENARIO.playerCount,
      roomCount: PROTOTYPE_SCENARIO.rooms.length,
      clueCount: PROTOTYPE_SCENARIO.clues.length,
      itemCount: PROTOTYPE_SCENARIO.items.length,
      secretCount: PROTOTYPE_SCENARIO.secrets.length,
      goalCount: PROTOTYPE_SCENARIO.goals.length,
      warningCount: warnings.length,
    },
    stages,
    roles,
    secrets,
    clues,
    items,
    rooms,
    goalPaths,
    warnings,
  };
}

export function buildHostScenarioViewFromHostGame(hostGame: HostGameDetail): HostScenarioView {
  return buildHostScenarioView({
    branchLabel: hostGame.branchLabel,
    participants: hostGame.participants,
  });
}

async function requireOwnedGame(
  db: Prisma.TransactionClient | typeof prisma,
  gameId: string,
  createdByUserId: string,
) {
  const game = await db.game.findUniqueOrThrow({
    where: { id: gameId },
  });

  if (game.createdByUserId !== createdByUserId) {
    throw new Error("Only the host who created this game can use host controls.");
  }

  return game;
}

async function requireOwnedParticipantGame(
  db: Prisma.TransactionClient | typeof prisma,
  participantId: string,
  createdByUserId: string,
) {
  const participant = await db.gameParticipant.findUniqueOrThrow({
    where: { id: participantId },
    include: {
      game: true,
    },
  });

  if (participant.game.createdByUserId !== createdByUserId) {
    throw new Error("Only the host who created this game can use host controls.");
  }

  return participant;
}

async function getActingParticipant(input: {
  userId: string;
  gameId?: string;
  actingParticipantId?: string;
}) {
  if (input.actingParticipantId) {
    const participant = await prisma.gameParticipant.findUnique({
      where: { id: input.actingParticipantId },
      include: {
        game: {
          include: {
            scenario: {
              include: {
                decision: true,
                rooms: {
                  orderBy: { name: "asc" },
                },
              },
            },
          },
        },
        scenarioRole: true,
        items: { include: { scenarioItem: true } },
        clues: { include: { scenarioClue: true } },
        goals: { include: { scenarioGoal: true } },
        accusations: true,
      },
    });

    if (
      participant &&
      participant.game.status !== GAME_STATUS.COMPLETED &&
      (!input.gameId || participant.gameId === input.gameId) &&
      participant.game.createdByUserId === input.userId
    ) {
      return participant;
    }
  }

  return getUserParticipantForGame(input.userId, input.gameId);
}

type GoalClient = Prisma.TransactionClient | typeof prisma;

async function recomputeParticipantGoals(db: GoalClient, participantId: string) {
  const participant = await db.gameParticipant.findUniqueOrThrow({
    where: { id: participantId },
    include: {
      game: true,
      scenarioRole: true,
      items: { include: { scenarioItem: true } },
      clues: { include: { scenarioClue: true } },
      goals: { include: { scenarioGoal: true } },
      accusations: true,
    },
  });

  for (const goalState of participant.goals) {
    const rule = goalState.scenarioGoal.completionRuleJson as Prisma.JsonValue | null;

    if (!rule) {
      continue;
    }

    const isComplete = evaluateGoalRule(rule as never, {
      itemCodes: participant.items.map((item) => item.scenarioItem.code),
      clueCodes: participant.clues.map((clue) => clue.scenarioClue.code),
      decisionOutcomeKey: participant.game.decisionOutcomeKey,
      hasAccusation: participant.accusations.length > 0,
      currentStage: mapGameStageToKey(participant.game.stage),
      goalStage: goalState.scenarioGoal.stage,
    });

    const nextStatus = isComplete ? GOAL_STATUS.COMPLETED : GOAL_STATUS.ACTIVE;

    if (goalState.status !== nextStatus) {
      await db.playerGoalState.update({
        where: { id: goalState.id },
        data: {
          status: nextStatus,
          completedAt: isComplete ? goalState.completedAt ?? new Date() : null,
        },
      });
    }
  }
}

async function recomputeGameGoals(db: GoalClient, gameId: string) {
  const participants = await db.gameParticipant.findMany({
    where: { gameId },
    select: { id: true },
  });

  for (const participant of participants) {
    await recomputeParticipantGoals(db, participant.id);
  }
}

async function resetSeatGoalsForSetup(
  tx: Prisma.TransactionClient,
  input: {
    participantId: string;
    scenarioId: string;
    scenarioRoleId: string;
  },
) {
  const goals = await tx.scenarioGoal.findMany({
    where: {
      scenarioId: input.scenarioId,
      roleId: input.scenarioRoleId,
    },
    select: {
      id: true,
      stage: true,
    },
  });

  if (goals.length === 0) {
    return;
  }

  await tx.playerGoalState.createMany({
    data: goals.map((goal) => ({
      participantId: input.participantId,
      scenarioGoalId: goal.id,
      status: getSetupGoalStatus(goal.stage),
    })),
  });
}

async function ensureClue(
  tx: Prisma.TransactionClient,
  participantId: string,
  scenarioClueId: string,
  source: ClueVisibilitySource,
) {
  await tx.playerClue.upsert({
    where: {
      participantId_scenarioClueId: {
        participantId,
        scenarioClueId,
      },
    },
    create: {
      participantId,
      scenarioClueId,
      source,
    },
    update: {},
  });
}

async function addItemByScenarioItemId(
  tx: Prisma.TransactionClient,
  participantId: string,
  scenarioItemId: string,
) {
  const existing = await tx.playerItem.findUnique({
    where: {
      participantId_scenarioItemId: {
        participantId,
        scenarioItemId,
      },
    },
  });

  if (existing) {
    await tx.playerItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + 1 },
    });
    return;
  }

  await tx.playerItem.create({
    data: {
      participantId,
      scenarioItemId,
      quantity: 1,
    },
  });
}

async function removeItemByScenarioItemId(
  tx: Prisma.TransactionClient,
  participantId: string,
  scenarioItemId: string,
) {
  const existing = await tx.playerItem.findUniqueOrThrow({
    where: {
      participantId_scenarioItemId: {
        participantId,
        scenarioItemId,
      },
    },
  });

  if (existing.quantity <= 1) {
    await tx.playerItem.delete({
      where: { id: existing.id },
    });
    return;
  }

  await tx.playerItem.update({
    where: { id: existing.id },
    data: { quantity: existing.quantity - 1 },
  });
}

async function consumeAction(tx: Prisma.TransactionClient, participantId: string) {
  const participant = await tx.gameParticipant.findUniqueOrThrow({
    where: { id: participantId },
  });

  if (participant.actionsRemaining <= 0) {
    throw new Error("No actions remaining this stage.");
  }

  await tx.gameParticipant.update({
    where: { id: participantId },
    data: { actionsRemaining: participant.actionsRemaining - 1 },
  });
}

function assertLiveActionStage(stage: GameStage) {
  if (!canUseLiveActions(mapGameStageToKey(stage))) {
    throw new Error("App actions are paused until the next active act begins.");
  }
}

async function createLog(
  tx: Prisma.TransactionClient,
  input: {
    gameId: string;
    participantId?: string;
    targetParticipantId?: string;
    roomStateId?: string;
    actionType: ActionType;
     stage: GameStage;
    summary: string;
    detailsJson?: Prisma.InputJsonValue;
  },
) {
  await tx.actionLog.create({
    data: input,
  });
}

export async function ensurePrototypeScenario(): Promise<ScenarioSummary> {
  const [existing, syncSetting] = await Promise.all([
    prisma.scenarioDefinition.findUnique({
      where: { slug: PROTOTYPE_SCENARIO.slug },
      include: {
        roles: true,
        rooms: true,
        clues: true,
        items: true,
        goals: true,
        decision: true,
      },
    }),
    prisma.systemSetting.findUnique({
      where: { key: PROTOTYPE_SCENARIO_SYNC_KEY },
    }),
  ]);

  if (existing) {
    if (syncSetting?.valueJson === PROTOTYPE_SCENARIO_SYNC_VERSION) {
      return {
        id: existing.id,
        slug: existing.slug,
        title: existing.title,
        summary: existing.summary,
        playerCount: existing.playerCount,
        roomCount: existing.rooms.length,
      };
    }

    await prisma.scenarioDefinition.update({
      where: { id: existing.id },
      data: {
        title: PROTOTYPE_SCENARIO.title,
        summary: PROTOTYPE_SCENARIO.summary,
        playerCount: PROTOTYPE_SCENARIO.playerCount,
        actionBudgetPerAct: PROTOTYPE_SCENARIO.actionBudgetPerAct,
        eventTitle: PROTOTYPE_SCENARIO.eventTitle,
        eventDescription: PROTOTYPE_SCENARIO.eventDescription,
        revealPayloadJson: PROTOTYPE_SCENARIO.reveal,
      },
    });

    const roleIdByCode = new Map(existing.roles.map((role) => [role.code, role.id]));

    for (const role of PROTOTYPE_SCENARIO.roles) {
      const existingRoleId = roleIdByCode.get(role.code);

      if (existingRoleId) {
        await prisma.scenarioRole.update({
          where: { id: existingRoleId },
          data: {
            slotNumber: role.slotNumber,
            characterName: role.characterName,
            characterTitle: role.characterTitle,
            publicDescription: role.publicDescription,
            privateDescription: role.privateDescription,
            actTwoBriefing: role.actTwoBriefing,
          },
        });
        continue;
      }

      const createdRole = await prisma.scenarioRole.create({
        data: {
          scenarioId: existing.id,
          code: role.code,
          slotNumber: role.slotNumber,
          characterName: role.characterName,
          characterTitle: role.characterTitle,
          publicDescription: role.publicDescription,
          privateDescription: role.privateDescription,
          actTwoBriefing: role.actTwoBriefing,
        },
      });
      roleIdByCode.set(role.code, createdRole.id);
    }

    for (const room of PROTOTYPE_SCENARIO.rooms) {
      const existingRoom = existing.rooms.find((entry) => entry.code === room.code);

      if (existingRoom) {
        await prisma.scenarioRoom.update({
          where: { id: existingRoom.id },
          data: {
            name: room.name,
            description: room.description,
            searchResultsJson: room.searchResults as Prisma.InputJsonValue,
            eavesdropJson: room.eavesdropResults as Prisma.InputJsonValue,
          },
        });
        continue;
      }

      await prisma.scenarioRoom.create({
        data: {
          scenarioId: existing.id,
          code: room.code,
          name: room.name,
          description: room.description,
          searchResultsJson: room.searchResults as Prisma.InputJsonValue,
          eavesdropJson: room.eavesdropResults as Prisma.InputJsonValue,
        },
      });
    }

    for (const clue of PROTOTYPE_SCENARIO.clues) {
      const existingClue = existing.clues.find((entry) => entry.code === clue.code);

      if (existingClue) {
        await prisma.scenarioClue.update({
          where: { id: existingClue.id },
          data: {
            title: clue.title,
            body: clue.body,
          },
        });
        continue;
      }

      await prisma.scenarioClue.create({
        data: {
          scenarioId: existing.id,
          code: clue.code,
          title: clue.title,
          body: clue.body,
        },
      });
    }

    for (const item of PROTOTYPE_SCENARIO.items) {
      const existingItem = existing.items.find((entry) => entry.code === item.code);

      if (existingItem) {
        await prisma.scenarioItem.update({
          where: { id: existingItem.id },
          data: {
            label: item.label,
            description: item.description,
            itemType: item.itemType,
            isStealable: item.isStealable ?? true,
            isPlantable: item.isPlantable ?? true,
            isTradeable: item.isTradeable ?? true,
          },
        });
        continue;
      }

      await prisma.scenarioItem.create({
        data: {
          scenarioId: existing.id,
          code: item.code,
          label: item.label,
          description: item.description,
          itemType: item.itemType,
          isStealable: item.isStealable ?? true,
          isPlantable: item.isPlantable ?? true,
          isTradeable: item.isTradeable ?? true,
        },
      });
    }

    for (const goal of PROTOTYPE_SCENARIO.goals) {
      const existingGoal = existing.goals.find((entry) => entry.code === goal.code);
      const roleId = roleIdByCode.get(goal.roleCode);

      if (!roleId) {
        throw new Error(`Missing scenario role for goal sync: ${goal.roleCode}`);
      }

      if (existingGoal) {
        await prisma.scenarioGoal.update({
          where: { id: existingGoal.id },
          data: {
            roleId,
            stage: goal.stage,
            title: goal.title,
            description: goal.description,
            points: goal.points,
            completionRuleJson: goal.rule as Prisma.InputJsonValue,
          },
        });
        continue;
      }

      await prisma.scenarioGoal.create({
        data: {
          scenarioId: existing.id,
          roleId,
          code: goal.code,
          stage: goal.stage,
          title: goal.title,
          description: goal.description,
          points: goal.points,
          completionRuleJson: goal.rule as Prisma.InputJsonValue,
        },
      });
    }

    const decisionMakerRoleId = roleIdByCode.get(PROTOTYPE_SCENARIO.decision.decisionMakerRoleCode);

    if (!decisionMakerRoleId) {
      throw new Error(`Missing decision maker role for scenario sync: ${PROTOTYPE_SCENARIO.decision.decisionMakerRoleCode}`);
    }

    if (existing.decision) {
      await prisma.scenarioDecision.update({
        where: { id: existing.decision.id },
        data: {
          decisionMakerRoleId,
          code: PROTOTYPE_SCENARIO.decision.code,
          title: PROTOTYPE_SCENARIO.decision.title,
          description: PROTOTYPE_SCENARIO.decision.description,
          optionALabel: PROTOTYPE_SCENARIO.decision.optionA.label,
          optionBLabel: PROTOTYPE_SCENARIO.decision.optionB.label,
          outcomeAKey: PROTOTYPE_SCENARIO.decision.optionA.outcomeKey,
          outcomeBKey: PROTOTYPE_SCENARIO.decision.optionB.outcomeKey,
          outcomeASummary: PROTOTYPE_SCENARIO.decision.optionA.summary,
          outcomeBSummary: PROTOTYPE_SCENARIO.decision.optionB.summary,
        },
      });
    } else {
      await prisma.scenarioDecision.create({
        data: {
          scenarioId: existing.id,
          decisionMakerRoleId,
          code: PROTOTYPE_SCENARIO.decision.code,
          title: PROTOTYPE_SCENARIO.decision.title,
          description: PROTOTYPE_SCENARIO.decision.description,
          optionALabel: PROTOTYPE_SCENARIO.decision.optionA.label,
          optionBLabel: PROTOTYPE_SCENARIO.decision.optionB.label,
          outcomeAKey: PROTOTYPE_SCENARIO.decision.optionA.outcomeKey,
          outcomeBKey: PROTOTYPE_SCENARIO.decision.optionB.outcomeKey,
          outcomeASummary: PROTOTYPE_SCENARIO.decision.optionA.summary,
          outcomeBSummary: PROTOTYPE_SCENARIO.decision.optionB.summary,
        },
      });
    }

    await prisma.systemSetting.upsert({
      where: { key: PROTOTYPE_SCENARIO_SYNC_KEY },
      create: {
        key: PROTOTYPE_SCENARIO_SYNC_KEY,
        valueJson: PROTOTYPE_SCENARIO_SYNC_VERSION,
      },
      update: {
        valueJson: PROTOTYPE_SCENARIO_SYNC_VERSION,
      },
    });

    return {
      id: existing.id,
      slug: existing.slug,
      title: PROTOTYPE_SCENARIO.title,
      summary: PROTOTYPE_SCENARIO.summary,
      playerCount: PROTOTYPE_SCENARIO.playerCount,
      roomCount: PROTOTYPE_SCENARIO.rooms.length,
    };
  }

  let created;

  try {
    created = await prisma.$transaction(async (tx) => {
      const scenario = await tx.scenarioDefinition.create({
        data: {
          slug: PROTOTYPE_SCENARIO.slug,
          title: PROTOTYPE_SCENARIO.title,
          summary: PROTOTYPE_SCENARIO.summary,
          playerCount: PROTOTYPE_SCENARIO.playerCount,
          actionBudgetPerAct: PROTOTYPE_SCENARIO.actionBudgetPerAct,
          eventTitle: PROTOTYPE_SCENARIO.eventTitle,
          eventDescription: PROTOTYPE_SCENARIO.eventDescription,
          revealPayloadJson: PROTOTYPE_SCENARIO.reveal,
        },
      });

      const roleIds = new Map<string, string>();

      for (const role of PROTOTYPE_SCENARIO.roles) {
        const createdRole = await tx.scenarioRole.create({
          data: {
            scenarioId: scenario.id,
            code: role.code,
            slotNumber: role.slotNumber,
            characterName: role.characterName,
            characterTitle: role.characterTitle,
            publicDescription: role.publicDescription,
            privateDescription: role.privateDescription,
            actTwoBriefing: role.actTwoBriefing,
          },
        });
        roleIds.set(role.code, createdRole.id);
      }

      await tx.scenarioRoom.createMany({
        data: PROTOTYPE_SCENARIO.rooms.map((room) => ({
          scenarioId: scenario.id,
          code: room.code,
          name: room.name,
          description: room.description,
          searchResultsJson: room.searchResults as Prisma.InputJsonValue,
          eavesdropJson: room.eavesdropResults as Prisma.InputJsonValue,
        })),
      });

      await tx.scenarioClue.createMany({
        data: PROTOTYPE_SCENARIO.clues.map((clue) => ({
          scenarioId: scenario.id,
          code: clue.code,
          title: clue.title,
          body: clue.body,
        })),
      });

      await tx.scenarioItem.createMany({
        data: PROTOTYPE_SCENARIO.items.map((item) => ({
          scenarioId: scenario.id,
          code: item.code,
          label: item.label,
          description: item.description,
          itemType: item.itemType,
          isStealable: item.isStealable ?? true,
          isPlantable: item.isPlantable ?? true,
          isTradeable: item.isTradeable ?? true,
        })),
      });

      await tx.scenarioGoal.createMany({
        data: PROTOTYPE_SCENARIO.goals.map((goal) => ({
          scenarioId: scenario.id,
          roleId: roleIds.get(goal.roleCode)!,
          code: goal.code,
          stage: goal.stage,
          title: goal.title,
          description: goal.description,
          points: goal.points,
          completionRuleJson: goal.rule as Prisma.InputJsonValue,
        })),
      });

      await tx.scenarioDecision.create({
        data: {
          scenarioId: scenario.id,
          decisionMakerRoleId: roleIds.get(PROTOTYPE_SCENARIO.decision.decisionMakerRoleCode)!,
          code: PROTOTYPE_SCENARIO.decision.code,
          title: PROTOTYPE_SCENARIO.decision.title,
          description: PROTOTYPE_SCENARIO.decision.description,
          optionALabel: PROTOTYPE_SCENARIO.decision.optionA.label,
          optionBLabel: PROTOTYPE_SCENARIO.decision.optionB.label,
          outcomeAKey: PROTOTYPE_SCENARIO.decision.optionA.outcomeKey,
          outcomeBKey: PROTOTYPE_SCENARIO.decision.optionB.outcomeKey,
          outcomeASummary: PROTOTYPE_SCENARIO.decision.optionA.summary,
          outcomeBSummary: PROTOTYPE_SCENARIO.decision.optionB.summary,
        },
      });

      return tx.scenarioDefinition.findUniqueOrThrow({
        where: { id: scenario.id },
        include: { rooms: true },
      });
    }, { timeout: 20000, maxWait: 10000 });
  } catch (error: unknown) {
    const concurrent = await prisma.scenarioDefinition.findUnique({
      where: { slug: PROTOTYPE_SCENARIO.slug },
      include: { rooms: true },
    });

    if (concurrent) {
      return {
        id: concurrent.id,
        slug: concurrent.slug,
        title: concurrent.title,
        summary: concurrent.summary,
        playerCount: concurrent.playerCount,
        roomCount: concurrent.rooms.length,
      };
    }

    throw error;
  }

  return {
    id: created.id,
    slug: created.slug,
    title: created.title,
    summary: created.summary,
    playerCount: created.playerCount,
    roomCount: created.rooms.length,
  };
}

export async function createPrototypeGame(createdByUserId?: string | null) {
  const scenario = await ensurePrototypeScenario();
  const scenarioRecord = await prisma.scenarioDefinition.findUniqueOrThrow({
    where: { id: scenario.id },
    include: {
      roles: {
        orderBy: {
          slotNumber: "asc",
        },
      },
      goals: {
        select: {
          id: true,
          roleId: true,
          stage: true,
        },
      },
      rooms: true,
      decision: true,
    },
  });

  const code = buildGameCode();

  const game = await prisma.$transaction(async (tx) => {
    const createdGame = await tx.game.create({
      data: {
        scenarioId: scenarioRecord.id,
        code,
        title: scenarioRecord.title,
        createdByUserId: createdByUserId ?? undefined,
      },
    });

    for (const role of scenarioRecord.roles) {
      const participant = await tx.gameParticipant.create({
        data: {
          gameId: createdGame.id,
          scenarioRoleId: role.id,
          displayName: "Open",
          assignedAt: new Date(),
        },
      });

      const goals = scenarioRecord.goals.filter((goal) => goal.roleId === role.id);

      if (goals.length > 0) {
        await tx.playerGoalState.createMany({
          data: goals.map((goal) => ({
            participantId: participant.id,
            scenarioGoalId: goal.id,
            status: getSetupGoalStatus(goal.stage),
          })),
        });
      }
    }

    for (const room of scenarioRecord.rooms) {
      await tx.gameRoomState.create({
        data: {
          gameId: createdGame.id,
          scenarioRoomId: room.id,
        },
      });
    }

    return createdGame;
  });

  return game;
}

export async function getHostGameList(createdByUserId: string): Promise<HostGameListItem[]> {
  await ensurePrototypeScenario();
  const games = await prisma.game.findMany({
    where: {
      createdByUserId,
      scenario: {
        slug: PROTOTYPE_SCENARIO.slug,
      },
    },
    include: {
      scenario: {
        select: {
          title: true,
        },
      },
      participants: {
        select: {
          id: true,
          userId: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return games.map((game) => ({
    id: game.id,
    title: game.title,
    code: game.code,
    status: mapGameStatusToKey(game.status),
    currentStage: mapGameStageToKey(game.stage),
    scenarioTitle: game.scenario.title,
    participantCount: game.participants.length,
    claimedSeatCount: game.participants.filter((participant) => !!participant.userId).length,
    updatedAt: game.updatedAt.toISOString(),
    href: SITE_ROUTES.gameHost(game.id),
  }));
}

export async function getHostGameDetailForGame(
  createdByUserId: string,
  gameId: string,
): Promise<HostGameDetail | null> {
  await ensurePrototypeScenario();
  const detail = await prisma.game.findFirst({
    where: {
      id: gameId,
      createdByUserId,
      scenario: {
        slug: PROTOTYPE_SCENARIO.slug,
      },
    },
    include: {
      scenario: {
        include: {
          roles: {
            orderBy: { slotNumber: "asc" },
          },
          rooms: {
            orderBy: { name: "asc" },
          },
        },
      },
      participants: {
        include: {
          scenarioRole: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!detail) {
    return null;
  }

  return mapHostGameDetail(detail as HostGameDetailRecord);
}

export async function getHostScenarioViewForGame(
  createdByUserId: string,
  gameId: string,
): Promise<HostScenarioView | null> {
  const hostGame = await getHostGameDetailForGame(createdByUserId, gameId);

  if (!hostGame) {
    return null;
  }

  return buildHostScenarioViewFromHostGame(hostGame);
}

export async function joinGameWithUser(
  code: string,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null },
) {
  const game = await prisma.game.findUnique({
    where: { code },
    include: {
      participants: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!game) {
    throw new Error("Game not found.");
  }

  const existing = game.participants.find((participant) => participant.userId === user.id);
  if (existing) {
    return existing;
  }

  const normalizedEmail = normalizeEmail(user.email);
  const openSeat = pickJoinableSeat(
    game.participants.map((participant) => ({
      ...participant,
      assignedEmail: normalizeEmail(participant.assignedEmail),
    })),
    normalizedEmail,
  );

  if (!openSeat) {
    throw new Error("This game is already full.");
  }

  return prisma.gameParticipant.update({
    where: { id: openSeat.id },
    data: {
      userId: user.id,
      displayName: displayNameFromUser(user),
      assignedEmail: normalizedEmail,
      joinedAt: new Date(),
    },
  });
}

export async function removeParticipantFromSeat(participantId: string, createdByUserId: string) {
  await prisma.$transaction(async (tx) => {
    const participant = await requireOwnedParticipantGame(tx, participantId, createdByUserId);

    if (participant.game.stage !== GAME_STAGE.SETUP) {
      throw new Error("Players can only be removed before Act 1 starts.");
    }

    await tx.playerGoalState.deleteMany({
      where: { participantId },
    });

    await tx.playerItem.deleteMany({
      where: { participantId },
    });

    await tx.playerClue.deleteMany({
      where: { participantId },
    });

    await tx.playerKnowledge.deleteMany({
      where: {
        OR: [{ viewerParticipantId: participantId }, { subjectParticipantId: participantId }],
      },
    });

    await tx.accusation.deleteMany({
      where: { participantId },
    });

    await tx.tradeProposal.deleteMany({
      where: {
        OR: [{ proposerParticipantId: participantId }, { responderParticipantId: participantId }],
      },
    });

    await tx.actionLog.deleteMany({
      where: {
        OR: [{ participantId }, { targetParticipantId: participantId }],
      },
    });

    await tx.gameParticipant.update({
      where: { id: participantId },
      data: {
        userId: null,
        displayName: "Open",
        assignedEmail: null,
        actionsRemaining: 0,
        joinedAt: new Date(),
      },
    });

    await resetSeatGoalsForSetup(tx, {
      participantId,
      scenarioId: participant.game.scenarioId,
      scenarioRoleId: participant.scenarioRoleId,
    });
  });
}

export async function resetGameToPregame(gameId: string, createdByUserId: string) {
  await prisma.$transaction(async (tx) => {
    await requireOwnedGame(tx, gameId, createdByUserId);
    const game = await tx.game.findUniqueOrThrow({
      where: { id: gameId },
      include: {
        scenario: {
          include: {
            goals: {
              select: {
                id: true,
                roleId: true,
                 stage: true,
              },
            },
          },
        },
        participants: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const goalsByRoleId = new Map<string, Array<{ id: string;  stage: GameStage }>>();
    for (const goal of game.scenario.goals) {
      const existing = goalsByRoleId.get(goal.roleId) ?? [];
      existing.push({ id: goal.id,  stage: goal.stage });
      goalsByRoleId.set(goal.roleId, existing);
    }

    await tx.playerGoalState.deleteMany({
      where: {
        participant: {
          gameId,
        },
      },
    });

    await tx.playerItem.deleteMany({
      where: {
        participant: {
          gameId,
        },
      },
    });

    await tx.playerClue.deleteMany({
      where: {
        participant: {
          gameId,
        },
      },
    });

    await tx.playerKnowledge.deleteMany({
      where: { gameId },
    });

    await tx.accusation.deleteMany({
      where: { gameId },
    });

    await tx.tradeProposal.deleteMany({
      where: { gameId },
    });

    await tx.actionLog.deleteMany({
      where: { gameId },
    });

    await tx.gameRoomState.updateMany({
      where: { gameId },
      data: {
        searchIndex: 0,
        eavesdropIndex: 0,
      },
    });

    await tx.game.update({
      where: { id: gameId },
      data: {
        status: GAME_STATUS.DRAFT,
         stage: GAME_STAGE.SETUP,
        decisionOutcomeKey: null,
        eventOneTriggeredAt: null,
        finaleStartedAt: null,
        resolvedAt: null,
      },
    });

    for (const participant of game.participants) {
      await tx.gameParticipant.update({
        where: { id: participant.id },
        data: {
          actionsRemaining: 0,
        },
      });

      if (participant.scenarioRoleId) {
        const goals = goalsByRoleId.get(participant.scenarioRoleId) ?? [];

        if (goals.length > 0) {
          await tx.playerGoalState.createMany({
            data: goals.map((goal) => ({
              participantId: participant.id,
              scenarioGoalId: goal.id,
              status: getSetupGoalStatus(goal.stage),
            })),
          });
        }
      }
    }
  }, { timeout: 20000, maxWait: 10000 });
}

export async function getPlayerDashboardForUser(
  userId: string,
  gameId?: string,
  actingParticipantId?: string,
): Promise<PlayerDashboard | null> {
  return getPlayerDashboard({ userId, gameId, actingParticipantId });
}

export async function getPlayerDashboard(input: {
  userId: string;
  gameId?: string;
  actingParticipantId?: string;
}): Promise<PlayerDashboard | null> {
  const dashboard = await buildPlayerDashboardView(input);

  if (!dashboard) {
    return null;
  }

  if (!dashboard.canControlCharacters) {
    return dashboard;
  }

  const controlledDashboards = await Promise.all(
    dashboard.seatLinks
      .filter((seat) => seat.id !== dashboard.participant.id)
      .map((seat) => buildPlayerDashboardView({ ...input, actingParticipantId: seat.id })),
  );

  return {
    ...dashboard,
    controlledDashboards: controlledDashboards.filter((entry): entry is PlayerDashboardView => !!entry),
  };
}

async function buildPlayerDashboardView(input: {
  userId: string;
  gameId?: string;
  actingParticipantId?: string;
}): Promise<PlayerDashboardView | null> {
  const participant = await getActingParticipant(input);

  if (!participant) {
    return null;
  }

  const [players, tradeProposals, actionLog] = await Promise.all([
    prisma.gameParticipant.findMany({
      where: {
        gameId: participant.gameId,
        NOT: {
          id: participant.id,
        },
      },
      include: {
        scenarioRole: true,
        knowledgeAbout: {
          where: {
            viewerParticipantId: participant.id,
          },
        },
      },
      orderBy: {
        displayName: "asc",
      },
    }),
    prisma.tradeProposal.findMany({
      where: {
        gameId: participant.gameId,
        OR: [{ responderParticipantId: participant.id }, { proposerParticipantId: participant.id }],
      },
      include: {
        proposerParticipant: {
          include: {
            scenarioRole: true,
          },
        },
        responderParticipant: {
          include: {
            scenarioRole: true,
          },
        },
        scenarioItem: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
    prisma.actionLog.findMany({
      where: {
        gameId: participant.gameId,
        OR: [{ participantId: participant.id }, { targetParticipantId: participant.id }],
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
  ]);

  const revealPayload = participant.game.scenario.revealPayloadJson as {
    suspectRoleCode: string;
    motive: string;
    means: string;
    summary: string;
    nonSuspectRoleCodes?: string[];
  };
  const stageKey = mapGameStageToKey(participant.game.stage);
  const roleBriefingStageKey = stageKey === "resolution" ? "finale" : stageKey;
  const stageContent = PROTOTYPE_SCENARIO.stageContent[stageKey];
  const accusation = participant.accusations[0];
  const goalPoints = participant.goals
    .filter((goal) => goal.status === GOAL_STATUS.COMPLETED)
    .reduce((sum, goal) => sum + goal.scenarioGoal.points, 0);
  const revealScore =
    participant.game.stage === GAME_STAGE.RESOLUTION
      ? computeRevealScore({
          suspectRoleCode:
            accusation?.suspectParticipantId
              ? players
                  .concat({
                    ...participant,
                    knowledgeAbout: [],
                  })
                  .find((entry) => entry.id === accusation.suspectParticipantId)?.scenarioRole?.code ?? null
              : null,
          motive: accusation?.motive ?? "",
          means: accusation?.means ?? "",
          solution: revealPayload,
          goalPoints,
        })
      : null;

  const canControlCharacters = participant.game.createdByUserId === input.userId;
  const orderedSeatParticipants = sortParticipantsForSeatOrder([participant, ...players]).filter(
    (entry) => !!entry.scenarioRole?.characterName,
  );
  const pendingIncomingTrades = tradeProposals.filter(
    (trade) => trade.responderParticipantId === participant.id && trade.status === TRADE_STATUS.PENDING,
  );
  const pendingOutgoingTrades = tradeProposals.filter((trade) => trade.proposerParticipantId === participant.id);
  const accusationTargets = players.filter((player) =>
    canAccuseRole({
      stage: mapGameStageToKey(participant.game.stage),
      roleCode: player.scenarioRole?.code,
      nonSuspectRoleCodes: revealPayload.nonSuspectRoleCodes,
    }),
  );

  return {
    canControlCharacters,
    isImpersonating: canControlCharacters && input.actingParticipantId === participant.id,
    gameId: participant.gameId,
    gameCode: participant.game.code,
    scenarioTitle: participant.game.scenario.title,
    stage: stageKey,
    status: mapGameStatusToKey(participant.game.status),
    title: participant.game.title,
    scenarioSummary: stageContent.summary,
    eventTitle: stageContent.eventTitle,
    eventDescription: stageContent.eventDescription,
    participant: {
      id: participant.id,
      actorName: playerLabelFromSeat(participant),
      actionsRemaining: participant.actionsRemaining,
    },
    seatLinks: orderedSeatParticipants.map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      characterName: entry.scenarioRole?.characterName,
      href: `${SITE_ROUTES.gamePlayer(participant.gameId)}?as=${entry.id}`,
    })),
    rooms: participant.game.scenario.rooms.map((room) => ({
      id: room.id,
      code: room.code,
      name: room.name,
      href: `${SITE_ROUTES.gameRoom(participant.gameId, room.code)}?as=${participant.id}`,
    })),
    role: participant.scenarioRole
      ? {
          code: participant.scenarioRole.code,
          characterName: participant.scenarioRole.characterName,
          characterTitle: participant.scenarioRole.characterTitle,
          publicDescription: participant.scenarioRole.publicDescription,
          privateDescription: participant.scenarioRole.privateDescription,
          actTwoBriefing: isEventOneOrLater(stageKey) ? participant.scenarioRole.actTwoBriefing ?? undefined : undefined,
          howToAct:
            PROTOTYPE_SCENARIO.roles.find((entry) => entry.code === participant.scenarioRole!.code)?.performance ?? {
              vibe: participant.scenarioRole.privateDescription,
              inspiration: "Play the strongest version of this role you can imagine.",
              quirk: "Choose one small repeated behavior and commit to it.",
              playTips: [],
            },
          currentSummary:
            PROTOTYPE_SCENARIO.roles.find((entry) => entry.code === participant.scenarioRole!.code)?.stageBriefings[roleBriefingStageKey]?.summary ??
            participant.scenarioRole.privateDescription,
          nextSteps:
            PROTOTYPE_SCENARIO.roles.find((entry) => entry.code === participant.scenarioRole!.code)?.stageBriefings[roleBriefingStageKey]?.nextSteps ?? [],
        }
      : undefined,
    goals: participant.goals
      .filter(
        (goal) =>
          goal.status === GOAL_STATUS.COMPLETED ||
          goal.scenarioGoal.stage === participant.game.stage ||
          (participant.game.stage === GAME_STAGE.FINALE && goal.scenarioGoal.stage === GAME_STAGE.ACT_2) ||
          (participant.game.stage === GAME_STAGE.RESOLUTION && goal.scenarioGoal.stage === GAME_STAGE.ACT_2),
      )
      .map((goal) => ({
        id: goal.id,
        title: goal.scenarioGoal.title,
        description: goal.scenarioGoal.description,
        status: mapGoalStatusToKey(goal.status),
        points: goal.scenarioGoal.points,
      })),
    clues: participant.clues.map((clue) => ({
      id: clue.id,
      title: clue.scenarioClue.title,
      body: clue.scenarioClue.body,
      source: clue.source,
    })),
    items: participant.items.map((item) => ({
      id: item.id,
      label: item.scenarioItem.label,
      description: item.scenarioItem.description,
      quantity: item.quantity,
      code: item.scenarioItem.code,
    })),
    players: players.map((player) => ({
      id: player.id,
      actorName: playerLabelFromSeat(player),
      roleCode: player.scenarioRole?.code,
      characterName: player.scenarioRole?.characterName,
      characterTitle: player.scenarioRole?.characterTitle,
      publicDescription: player.scenarioRole?.publicDescription,
      knownFacts: buildKnownFactsForPlayer({
        viewerRoleCode: participant.scenarioRole?.code,
        subjectRoleCode: player.scenarioRole?.code,
        subjectName: player.scenarioRole?.characterName,
        knowledgeAbout: player.knowledgeAbout,
      }),
    })),
    accusationTargets: accusationTargets.map((player) => ({
      id: player.id,
      actorName: playerLabelFromSeat(player),
      roleCode: player.scenarioRole?.code,
      characterName: player.scenarioRole?.characterName,
      characterTitle: player.scenarioRole?.characterTitle,
    })),
    pendingIncomingTrades: pendingIncomingTrades.map((trade) => ({
      id: trade.id,
      proposerName: trade.proposerParticipant.scenarioRole?.characterName ?? playerLabelFromSeat(trade.proposerParticipant),
      responderName: trade.responderParticipant.scenarioRole?.characterName ?? playerLabelFromSeat(trade.responderParticipant),
      itemLabel: trade.scenarioItem.label,
      status: trade.status.toLowerCase() as "pending",
      createdAt: trade.createdAt.toISOString(),
    })),
    pendingOutgoingTrades: pendingOutgoingTrades.map((trade) => ({
      id: trade.id,
      proposerName: trade.proposerParticipant.scenarioRole?.characterName ?? playerLabelFromSeat(trade.proposerParticipant),
      responderName: trade.responderParticipant.scenarioRole?.characterName ?? playerLabelFromSeat(trade.responderParticipant),
      itemLabel: trade.scenarioItem.label,
      status: trade.status.toLowerCase() as "pending" | "accepted" | "rejected" | "canceled",
      createdAt: trade.createdAt.toISOString(),
    })),
    accusation: accusation
      ? {
          suspectParticipantId: accusation.suspectParticipantId ?? undefined,
          motive: accusation.motive,
          means: accusation.means,
        }
      : undefined,
    decision:
      canUseDecision(stageKey) &&
      participant.game.scenario.decision &&
      participant.scenarioRole?.id === participant.game.scenario.decision.decisionMakerRoleId
      ? {
          title: participant.game.scenario.decision.title,
          description: participant.game.scenario.decision.description,
          optionAKey: participant.game.scenario.decision.outcomeAKey,
          optionALabel: participant.game.scenario.decision.optionALabel,
          optionBKey: participant.game.scenario.decision.outcomeBKey,
          optionBLabel: participant.game.scenario.decision.optionBLabel,
          selectedOutcomeKey: participant.game.decisionOutcomeKey ?? undefined,
        }
      : undefined,
    canSubmitAccusation: canSubmitAccusation(stageKey),
    actionLog: actionLog.map((entry) => ({
      id: entry.id,
      actionType: mapActionTypeToLabel(entry.actionType),
      summary: entry.summary,
      createdAt: entry.createdAt.toISOString(),
    })),
    reveal:
      participant.game.stage === GAME_STAGE.RESOLUTION && revealScore
        ? {
            solution: {
              suspectName:
                players
                  .concat({
                    ...participant,
                    knowledgeAbout: [],
                  })
                  .find((entry) => entry.scenarioRole?.code === revealPayload.suspectRoleCode)?.scenarioRole?.characterName ??
                revealPayload.suspectRoleCode,
              motive: revealPayload.motive,
              means: revealPayload.means,
              summary: revealPayload.summary,
            },
            score: revealScore.total,
            accusationScore: revealScore.accusationScore,
            goalScore: revealScore.goalScore,
          }
        : undefined,
  };
}

async function getUserParticipantForGame(userId: string, gameId?: string) {
  return prisma.gameParticipant.findFirst({
    where: {
      userId,
      ...(gameId ? { gameId } : {}),
      game: {
        status: {
          not: GAME_STATUS.COMPLETED,
        },
      },
    },
    include: {
      game: {
        include: {
          scenario: {
            include: {
              decision: true,
              rooms: {
                orderBy: { name: "asc" },
              },
            },
          },
        },
      },
      scenarioRole: true,
      items: {
        include: {
          scenarioItem: true,
        },
      },
      clues: {
        include: {
          scenarioClue: true,
        },
      },
      goals: {
        include: {
          scenarioGoal: true,
        },
      },
      accusations: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getUserParticipantForGameLite(userId: string, gameId?: string) {
  return prisma.gameParticipant.findFirst({
    where: {
      userId,
      ...(gameId ? { gameId } : {}),
      game: {
        status: {
          not: GAME_STATUS.COMPLETED,
        },
      },
    },
    include: {
      game: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getLatestPlayerGameIdForUser(userId: string) {
  const participant = await getUserParticipantForGameLite(userId);
  return participant?.gameId ?? null;
}

async function getActingParticipantForRoom(input: {
  userId: string;
  gameId?: string;
  actingParticipantId?: string;
}) {
  if (input.actingParticipantId) {
    const participant = await prisma.gameParticipant.findUnique({
      where: { id: input.actingParticipantId },
      include: {
        game: true,
      },
    });

    if (
      participant &&
      participant.game.status !== GAME_STATUS.COMPLETED &&
      (!input.gameId || participant.gameId === input.gameId) &&
      participant.game.createdByUserId === input.userId
    ) {
      return participant;
    }
  }

  return getUserParticipantForGameLite(input.userId, input.gameId);
}

export async function assignPlayerToSeat(
  participantId: string,
  createdByUserId: string,
  input: {
    mode?: "move-player" | "reserve-email" | "clear-reservation";
    sourceParticipantId?: string;
    assignedEmail?: string;
  },
) {
  await prisma.$transaction(async (tx) => {
    const target = await requireOwnedParticipantGame(tx, participantId, createdByUserId);

    if (target.game.stage !== GAME_STAGE.SETUP) {
      throw new Error("Player assignment can only change during setup.");
    }

    const normalizedAssignedEmail = normalizeEmail(input.assignedEmail);
    const sourceParticipantId = input.sourceParticipantId?.trim() || undefined;
    const mode = input.mode ?? "move-player";

    if (mode === "move-player") {
      if (!sourceParticipantId) {
        return;
      }

      const source = await tx.gameParticipant.findUniqueOrThrow({
        where: { id: sourceParticipantId },
      });

      if (source.gameId !== target.gameId) {
        throw new Error("That player is not in this game.");
      }

      if (!source.userId) {
        throw new Error("Select a joined player to assign.");
      }

      if (source.id === target.id) {
        await tx.gameParticipant.update({
          where: { id: target.id },
          data: {
            assignedEmail: source.assignedEmail ?? normalizedAssignedEmail,
          },
        });
        return;
      }

      const swappedSeats = deriveSeatSwap(
        {
          userId: target.userId,
          displayName: target.displayName,
          assignedEmail: target.assignedEmail,
          joinedAt: target.joinedAt,
        },
        {
          userId: source.userId,
          displayName: source.displayName,
          assignedEmail: source.assignedEmail,
          joinedAt: source.joinedAt,
        },
        normalizedAssignedEmail,
      );

      await tx.gameParticipant.update({
        where: { id: target.id },
        data: {
          userId: null,
        },
      });

      await tx.gameParticipant.update({
        where: { id: source.id },
        data: {
          userId: null,
        },
      });

      await tx.gameParticipant.update({
        where: { id: target.id },
        data: {
          ...swappedSeats.target,
        },
      });

      await tx.gameParticipant.update({
        where: { id: source.id },
        data: swappedSeats.source,
      });

      return;
    }

    if (mode === "reserve-email") {
      if (!normalizedAssignedEmail) {
        return;
      }

      const existingEmailSeat = await tx.gameParticipant.findFirst({
        where: {
          gameId: target.gameId,
          assignedEmail: normalizedAssignedEmail,
          NOT: { id: target.id },
        },
      });

      if (existingEmailSeat) {
        throw new Error("That email is already assigned to another character in this game.");
      }

      if (target.userId && target.assignedEmail && target.assignedEmail !== normalizedAssignedEmail) {
        throw new Error("Use joined-player reassignment to move a claimed player to a different character.");
      }

      await tx.gameParticipant.update({
        where: { id: target.id },
        data: {
          assignedEmail: normalizedAssignedEmail,
        },
      });
      return;
    }

    if (mode === "clear-reservation" && !target.userId) {
      await tx.gameParticipant.update({
        where: { id: target.id },
        data: {
          assignedEmail: null,
        },
      });
    }
  });
}

export async function startPhaseOne(gameId: string, createdByUserId: string) {
  await ensurePrototypeScenario();
  await requireOwnedGame(prisma, gameId, createdByUserId);
  const game = await prisma.game.findUniqueOrThrow({
    where: { id: gameId },
    include: {
      scenario: {
        include: {
          roles: true,
          clues: true,
          items: true,
        },
      },
      participants: {
        include: {
          scenarioRole: true,
          goals: {
            include: {
              scenarioGoal: true,
            },
          },
        },
      },
    },
  });

  const itemByCode = new Map(game.scenario.items.map((item) => [item.code, item.id]));
  const clueByCode = new Map(game.scenario.clues.map((clue) => [clue.code, clue.id]));
  const participantByRoleCode = new Map(
    game.participants
      .filter((participant) => participant.scenarioRole?.code)
      .map((participant) => [participant.scenarioRole!.code, participant]),
  );

  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.game.update({
      where: { id: gameId },
      data: {
        stage: GAME_STAGE.ACT_1,
        status: GAME_STATUS.ACTIVE,
      },
    }),
  ];

  for (const participant of game.participants) {
    const role = requireParticipantRole(participant);
    const roleDef = PROTOTYPE_SCENARIO.roles.find((entry) => entry.code === role.code)!;

    operations.push(
      prisma.gameParticipant.update({
        where: { id: participant.id },
        data: {
          actionsRemaining: game.scenario.actionBudgetPerAct,
        },
      }),
    );

    for (const itemCode of roleDef.startingItemCodes) {
      const scenarioItemId = itemByCode.get(itemCode);

      if (!scenarioItemId) {
        throw new Error(`Missing scenario item for Act 1 start: ${itemCode}`);
      }

      operations.push(
        prisma.playerItem.upsert({
          where: {
            participantId_scenarioItemId: {
              participantId: participant.id,
              scenarioItemId,
            },
          },
          create: {
            participantId: participant.id,
            scenarioItemId,
            quantity: 1,
          },
          update: {},
        }),
      );
    }

    for (const clueCode of roleDef.startingClueCodes) {
      const scenarioClueId = clueByCode.get(clueCode);

      if (!scenarioClueId) {
        throw new Error(`Missing scenario clue for Act 1 start: ${clueCode}`);
      }

      operations.push(
        prisma.playerClue.upsert({
          where: {
            participantId_scenarioClueId: {
              participantId: participant.id,
              scenarioClueId,
            },
          },
          create: {
            participantId: participant.id,
            scenarioClueId,
            source: CLUE_VISIBILITY_SOURCE.ROLE_INFO,
          },
          update: {},
        }),
      );
    }

    for (const knowledgeDef of roleDef.knowledge) {
      const subject = participantByRoleCode.get(knowledgeDef.subjectRoleCode);

      if (!subject) {
        continue;
      }

      operations.push(
        prisma.playerKnowledge.upsert({
          where: {
            gameId_viewerParticipantId_subjectParticipantId_factKey: {
              gameId,
              viewerParticipantId: participant.id,
              subjectParticipantId: subject.id,
              factKey: knowledgeDef.factKey,
            },
          },
          create: {
            gameId,
            viewerParticipantId: participant.id,
            subjectParticipantId: subject.id,
            factKey: knowledgeDef.factKey,
            title: knowledgeDef.title,
            body: knowledgeDef.body,
          },
          update: {},
        }),
      );
    }

    for (const goal of participant.goals) {
      operations.push(
        prisma.playerGoalState.update({
          where: { id: goal.id },
          data: {
            status: getSetupGoalStatus(goal.scenarioGoal.stage),
          },
        }),
      );
    }
  }

  operations.push(
    prisma.actionLog.create({
      data: {
        gameId,
        actionType: ACTION_TYPE.ACT_STARTED,
        stage: GAME_STAGE.ACT_1,
        summary: "Act 1 has started.",
      },
    }),
  );

  await prisma.$transaction(operations);

  await recomputeGameGoals(prisma, gameId);
}

export async function triggerEventPhaseTwo(gameId: string, createdByUserId: string) {
  await prisma.$transaction(async (tx) => {
    await requireOwnedGame(tx, gameId, createdByUserId);
    const game = await tx.game.findUniqueOrThrow({
      where: { id: gameId },
      include: {
        scenario: {
          include: {
            clues: true,
          },
        },
        participants: {
          include: {
            goals: {
              include: {
                scenarioGoal: true,
              },
            },
          },
        },
      },
    });

    await tx.game.update({
      where: { id: gameId },
      data: {
         stage: GAME_STAGE.EVENT_1,
        eventOneTriggeredAt: new Date(),
      },
    });

    const clueByCode = new Map(game.scenario.clues.map((clue) => [clue.code, clue.id]));
    const branchKey = game.decisionOutcomeKey ?? PROTOTYPE_SCENARIO.decision.optionA.outcomeKey;
    const awardedClueCodes = getEventClueCodes({
      everyoneClueCodes: PROTOTYPE_SCENARIO.eventAwards.everyoneClueCodes,
      branchClueCodes: PROTOTYPE_SCENARIO.eventAwards.branchClueCodes,
      branchKey,
    });

    for (const participant of game.participants) {
      for (const clueCode of awardedClueCodes) {
        await ensureClue(
          tx,
          participant.id,
          clueByCode.get(clueCode)!,
          PROTOTYPE_SCENARIO.eventAwards.branchClueCodes[branchKey]?.includes(clueCode)
            ? CLUE_VISIBILITY_SOURCE.DECISION_OUTCOME
            : CLUE_VISIBILITY_SOURCE.EVENT_UPDATE,
        );
      }
    }

    await createLog(tx, {
      gameId,
      actionType: ACTION_TYPE.EVENT_TRIGGERED,
      stage: GAME_STAGE.EVENT_1,
      summary: `${game.scenario.eventTitle} reshapes the investigation.`,
      detailsJson: { branchKey },
    });
  });

  await recomputeGameGoals(prisma, gameId);
}

export async function startActTwo(gameId: string, createdByUserId: string) {
  await prisma.$transaction(async (tx) => {
    await requireOwnedGame(tx, gameId, createdByUserId);
    const game = await tx.game.findUniqueOrThrow({
      where: { id: gameId },
      include: {
        scenario: {
          include: {
            goals: {
              select: {
                id: true,
                roleId: true,
                stage: true,
              },
            },
          },
        },
        participants: {
          include: {
            goals: {
              include: {
                scenarioGoal: true,
              },
            },
          },
        },
      },
    });

    await tx.game.update({
      where: { id: gameId },
      data: {
        stage: GAME_STAGE.ACT_2,
      },
    });

    for (const participant of game.participants) {
      await tx.gameParticipant.update({
        where: { id: participant.id },
        data: {
          actionsRemaining: game.scenario.actionBudgetPerAct,
        },
      });

      for (const goal of participant.goals) {
        await tx.playerGoalState.update({
          where: { id: goal.id },
          data: {
            status: getActTwoGoalStatus(goal.scenarioGoal.stage, goal.status),
          },
        });
      }
    }

    await createLog(tx, {
      gameId,
      actionType: ACTION_TYPE.ACT_STARTED,
      stage: GAME_STAGE.ACT_2,
      summary: "Act 2 has started.",
    });
  });

  await recomputeGameGoals(prisma, gameId);
}

export async function startFinale(gameId: string, createdByUserId: string) {
  await prisma.$transaction(async (tx) => {
    await requireOwnedGame(tx, gameId, createdByUserId);
    await tx.game.update({
      where: { id: gameId },
      data: {
         stage: GAME_STAGE.FINALE,
        finaleStartedAt: new Date(),
      },
    });

    const participants = await tx.gameParticipant.findMany({
      where: { gameId },
    });

    for (const participant of participants) {
      await tx.gameParticipant.update({
        where: { id: participant.id },
        data: {
          actionsRemaining: 0,
        },
      });
    }

    await createLog(tx, {
      gameId,
      actionType: ACTION_TYPE.FINALE_STARTED,
       stage: GAME_STAGE.FINALE,
      summary: "The finale has begun. Accusations are now open.",
    });
  });
}

export async function revealGame(gameId: string, createdByUserId: string) {
  await prisma.$transaction(async (tx) => {
    await requireOwnedGame(tx, gameId, createdByUserId);
    await tx.game.update({
      where: { id: gameId },
      data: {
         stage: GAME_STAGE.RESOLUTION,
        status: GAME_STATUS.COMPLETED,
        resolvedAt: new Date(),
      },
    });

    await createLog(tx, {
      gameId,
      actionType: ACTION_TYPE.RESOLUTION_OPENED,
       stage: GAME_STAGE.RESOLUTION,
      summary: "The host opened the reveal.",
    });
  });

  await recomputeGameGoals(prisma, gameId);
}

export async function submitDecision(userId: string, outcomeKey: string, actingParticipantId?: string) {
  const participant = await getActingParticipant({ userId, actingParticipantId });

  if (!participant) {
    throw new Error("No active participant found.");
  }

  if (!canUseDecision(mapGameStageToKey(participant.game.stage))) {
    throw new Error("This decision is only available during Act 1.");
  }

  const decision = participant.game.scenario.decision;
  if (!decision || participant.scenarioRoleId !== decision.decisionMakerRoleId) {
    throw new Error("You are not the decision maker.");
  }

  if (![decision.outcomeAKey, decision.outcomeBKey].includes(outcomeKey)) {
    throw new Error("Invalid decision option.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.game.update({
      where: { id: participant.gameId },
      data: {
        decisionOutcomeKey: outcomeKey,
      },
    });

    await createLog(tx, {
      gameId: participant.gameId,
      participantId: participant.id,
      actionType: ACTION_TYPE.DECISION_SUBMITTED,
      stage: participant.game.stage,
      summary: `Daniel's public posture is now ${outcomeKey}.`,
      detailsJson: { outcomeKey },
    });

    await recomputeGameGoals(tx, participant.gameId);
  });
}

export async function submitAccusation(userId: string, input: {
  suspectParticipantId?: string;
  motive: string;
  means: string;
}, actingParticipantId?: string) {
  const participant = await getActingParticipant({ userId, actingParticipantId });

  if (!participant) {
    throw new Error("No active participant found.");
  }

  if (!canSubmitAccusation(mapGameStageToKey(participant.game.stage))) {
    throw new Error("Accusations only open during the finale.");
  }

  const revealPayload = participant.game.scenario.revealPayloadJson as {
    nonSuspectRoleCodes?: string[];
  };

  if (input.suspectParticipantId) {
    const target = await prisma.gameParticipant.findFirstOrThrow({
      where: {
        id: input.suspectParticipantId,
        gameId: participant.gameId,
      },
      include: {
        scenarioRole: true,
      },
    });

    if (
      !canAccuseRole({
        stage: mapGameStageToKey(participant.game.stage),
        roleCode: target.scenarioRole?.code,
        nonSuspectRoleCodes: revealPayload.nonSuspectRoleCodes,
      })
    ) {
      throw new Error("That character can no longer be accused.");
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.accusation.upsert({
      where: {
        gameId_participantId: {
          gameId: participant.gameId,
          participantId: participant.id,
        },
      },
      create: {
        gameId: participant.gameId,
        participantId: participant.id,
        suspectParticipantId: input.suspectParticipantId || null,
        motive: input.motive.trim(),
        means: input.means.trim(),
      },
      update: {
        suspectParticipantId: input.suspectParticipantId || null,
        motive: input.motive.trim(),
        means: input.means.trim(),
        submittedAt: new Date(),
      },
    });

    await createLog(tx, {
      gameId: participant.gameId,
      participantId: participant.id,
      targetParticipantId: input.suspectParticipantId,
      actionType: ACTION_TYPE.ACCUSATION_SUBMITTED,
       stage: participant.game.stage,
      summary: "An accusation has been filed.",
    });

    await recomputeParticipantGoals(tx, participant.id);
  });
}

export async function getRoomViewForUser(
  userId: string,
  gameId: string,
  roomCode: string,
  actingParticipantId?: string,
) {
  const participant = await getActingParticipantForRoom({ userId, gameId, actingParticipantId });

  if (!participant) {
    return null;
  }

  const roomState = await prisma.gameRoomState.findFirst({
    where: {
      gameId: participant.gameId,
      scenarioRoom: {
        code: roomCode,
      },
    },
    include: {
      scenarioRoom: true,
    },
  });

  if (!roomState) {
    return null;
  }

  const recentLogs = await prisma.actionLog.findMany({
    where: {
      gameId: participant.gameId,
      participantId: participant.id,
      roomStateId: roomState.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return {
    participant,
    roomState,
     stage: mapGameStageToKey(participant.game.stage),
    recentLogs,
  };
}

async function resolveRoomAction(
  userId: string,
  gameId: string,
  roomCode: string,
  actingParticipantId: string | undefined,
  action: "search" | "eavesdrop",
) {
  const participant = await getActingParticipantForRoom({ userId, gameId, actingParticipantId });
  if (!participant) {
    throw new Error("Room not found.");
  }

  const roomState = await prisma.gameRoomState.findFirst({
    where: {
      gameId: participant.gameId,
      scenarioRoom: {
        code: roomCode,
      },
    },
    include: {
      scenarioRoom: true,
    },
  });

  if (!roomState) {
    throw new Error("Room not found.");
  }

  const stage = mapGameStageToKey(participant.game.stage);

  if (!canUseLiveActions(stage)) {
    throw new Error("Room actions are paused until the next active act begins.");
  }

  const payload =
    action === "search"
      ? selectNextRoomResult(parseJsonArray<PrototypeRoomResult>(roomState.scenarioRoom.searchResultsJson), roomState.searchIndex, stage)
      : selectNextRoomResult(parseJsonArray<PrototypeRoomResult>(roomState.scenarioRoom.eavesdropJson), roomState.eavesdropIndex, stage);

  if (!payload) {
    throw new Error("No results remain for this action.");
  }

  await prisma.$transaction(async (tx) => {
    await consumeAction(tx, participant.id);

    await tx.gameRoomState.update({
      where: { id: roomState.id },
      data: action === "search" ? { searchIndex: payload.nextIndex } : { eavesdropIndex: payload.nextIndex },
    });

    if (payload.result.clueCode) {
      const clue = await tx.scenarioClue.findFirstOrThrow({
        where: {
          scenarioId: participant.game.scenarioId,
          code: payload.result.clueCode,
        },
      });

      await ensureClue(tx, participant.id, clue.id, CLUE_VISIBILITY_SOURCE.ROOM_ACTION);
    }

    if (payload.result.itemCode) {
      const item = await tx.scenarioItem.findFirstOrThrow({
        where: {
          scenarioId: participant.game.scenarioId,
          code: payload.result.itemCode,
        },
      });
      await addItemByScenarioItemId(tx, participant.id, item.id);
    }

    await createLog(tx, {
      gameId: participant.gameId,
      participantId: participant.id,
      roomStateId: roomState.id,
      actionType: action === "search" ? ACTION_TYPE.SEARCH_ROOM : ACTION_TYPE.EAVESDROP,
       stage: participant.game.stage,
      summary: payload.result.text,
      detailsJson: payload.result as Prisma.InputJsonValue,
    });

    await recomputeParticipantGoals(tx, participant.id);
  });

  return payload.result.text;
}

export async function searchRoom(userId: string, gameId: string, roomCode: string) {
  return searchRoomAs(userId, gameId, roomCode);
}

export async function eavesdrop(userId: string, gameId: string, roomCode: string) {
  return eavesdropAs(userId, gameId, roomCode);
}

export async function searchRoomAs(
  userId: string,
  gameId: string,
  roomCode: string,
  actingParticipantId?: string,
) {
  return resolveRoomAction(userId, gameId, roomCode, actingParticipantId, "search");
}

export async function eavesdropAs(
  userId: string,
  gameId: string,
  roomCode: string,
  actingParticipantId?: string,
) {
  return resolveRoomAction(userId, gameId, roomCode, actingParticipantId, "eavesdrop");
}

export async function pickpocket(userId: string, targetParticipantId: string, actingParticipantId?: string) {
  const participant = await getActingParticipant({ userId, actingParticipantId });
  if (!participant) {
    throw new Error("No active participant found.");
  }

  assertLiveActionStage(participant.game.stage);

  const target = await prisma.gameParticipant.findFirstOrThrow({
    where: {
      id: targetParticipantId,
      gameId: participant.gameId,
    },
    include: {
      items: {
        include: { scenarioItem: true },
      },
    },
  });

  const stealable = target.items.find((item) => item.quantity > 0 && item.scenarioItem.isStealable);

  if (!stealable) {
    throw new Error("Target has no stealable item.");
  }

  await prisma.$transaction(async (tx) => {
    await consumeAction(tx, participant.id);
    await removeItemByScenarioItemId(tx, target.id, stealable.scenarioItemId);
    await addItemByScenarioItemId(tx, participant.id, stealable.scenarioItemId);

    await createLog(tx, {
      gameId: participant.gameId,
      participantId: participant.id,
      targetParticipantId: target.id,
      actionType: ACTION_TYPE.PICKPOCKET,
       stage: participant.game.stage,
      summary: `You stole ${stealable.scenarioItem.label} from ${target.displayName}.`,
      detailsJson: { itemCode: stealable.scenarioItem.code },
    });

    await recomputeParticipantGoals(tx, participant.id);
    await recomputeParticipantGoals(tx, target.id);
  });
}

export async function proposeTrade(
  userId: string,
  targetParticipantId: string,
  playerItemId: string,
  actingParticipantId?: string,
) {
  const participant = await getActingParticipant({ userId, actingParticipantId });
  if (!participant) {
    throw new Error("No active participant found.");
  }

  assertLiveActionStage(participant.game.stage);

  const playerItem = participant.items.find((item) => item.id === playerItemId);
  if (!playerItem || !playerItem.scenarioItem.isTradeable) {
    throw new Error("Item cannot be traded.");
  }

  await prisma.$transaction(async (tx) => {
    await consumeAction(tx, participant.id);
    await tx.tradeProposal.create({
      data: {
        gameId: participant.gameId,
        proposerParticipantId: participant.id,
        responderParticipantId: targetParticipantId,
        scenarioItemId: playerItem.scenarioItemId,
        status: TRADE_STATUS.PENDING,
      },
    });

    await createLog(tx, {
      gameId: participant.gameId,
      participantId: participant.id,
      targetParticipantId,
      actionType: ACTION_TYPE.TRADE_PROPOSED,
       stage: participant.game.stage,
      summary: `Trade proposed: ${playerItem.scenarioItem.label}.`,
      detailsJson: { itemCode: playerItem.scenarioItem.code },
    });
  });
}

export async function respondToTrade(
  userId: string,
  tradeId: string,
  accept: boolean,
  actingParticipantId?: string,
) {
  const participant = await getActingParticipant({ userId, actingParticipantId });
  if (!participant) {
    throw new Error("No active participant found.");
  }

  assertLiveActionStage(participant.game.stage);

  const trade = await prisma.tradeProposal.findUniqueOrThrow({
    where: { id: tradeId },
    include: {
      scenarioItem: true,
    },
  });

  if (trade.responderParticipantId !== participant.id || trade.status !== TRADE_STATUS.PENDING) {
    throw new Error("Trade is not available.");
  }

  await prisma.$transaction(async (tx) => {
    if (accept) {
      await removeItemByScenarioItemId(tx, trade.proposerParticipantId, trade.scenarioItemId);
      await addItemByScenarioItemId(tx, trade.responderParticipantId, trade.scenarioItemId);
    }

    await tx.tradeProposal.update({
      where: { id: trade.id },
      data: {
        status: accept ? TRADE_STATUS.ACCEPTED : TRADE_STATUS.REJECTED,
        respondedAt: new Date(),
      },
    });

    await createLog(tx, {
      gameId: participant.gameId,
      participantId: participant.id,
      targetParticipantId: trade.proposerParticipantId,
      actionType: ACTION_TYPE.TRADE_RESPONDED,
       stage: participant.game.stage,
      summary: accept
        ? `Trade accepted for ${trade.scenarioItem.label}.`
        : `Trade rejected for ${trade.scenarioItem.label}.`,
      detailsJson: { accepted: accept, itemCode: trade.scenarioItem.code },
    });

    if (accept) {
      await recomputeParticipantGoals(tx, trade.proposerParticipantId);
      await recomputeParticipantGoals(tx, trade.responderParticipantId);
    }
  });
}

export async function plantItem(
  userId: string,
  targetParticipantId: string,
  playerItemId: string,
  actingParticipantId?: string,
) {
  const participant = await getActingParticipant({ userId, actingParticipantId });
  if (!participant) {
    throw new Error("No active participant found.");
  }

  assertLiveActionStage(participant.game.stage);

  const playerItem = participant.items.find((item) => item.id === playerItemId);

  if (!playerItem || !playerItem.scenarioItem.isPlantable) {
    throw new Error("Item cannot be planted.");
  }

  await prisma.$transaction(async (tx) => {
    await consumeAction(tx, participant.id);
    await removeItemByScenarioItemId(tx, participant.id, playerItem.scenarioItemId);
    await addItemByScenarioItemId(tx, targetParticipantId, playerItem.scenarioItemId);

    await createLog(tx, {
      gameId: participant.gameId,
      participantId: participant.id,
      targetParticipantId,
      actionType: ACTION_TYPE.PLANT_ITEM,
       stage: participant.game.stage,
      summary: `You planted ${playerItem.scenarioItem.label}.`,
      detailsJson: { itemCode: playerItem.scenarioItem.code },
    });

    await recomputeParticipantGoals(tx, participant.id);
    await recomputeParticipantGoals(tx, targetParticipantId);
  });
}
