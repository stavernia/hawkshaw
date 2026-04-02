"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SITE_ROUTES } from "@/src/config/routes";
import { requireCurrentUser } from "@/src/lib/auth/session";
import {
  assignPlayerToSeat,
  createPrototypeGame,
  eavesdropAs,
  joinGameWithUser,
  pickpocket,
  plantItem,
  proposeTrade,
  removeParticipantFromSeat,
  resetGameToPregame,
  respondToTrade,
  revealGame,
  searchRoomAs,
  startActTwo,
  startFinale,
  startPhaseOne,
  submitAccusation,
  submitDecision,
  triggerEventPhaseTwo,
} from "@/src/server/services/prototype";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createPrototypeGameAction() {
  const user = await requireCurrentUser(SITE_ROUTES.hostHome);
  const game = await createPrototypeGame(user.id);
  revalidatePath(SITE_ROUTES.hostHome);
  redirect(SITE_ROUTES.gameHost(game.id));
}

export async function joinGameAction(formData: FormData) {
  const code = getString(formData, "code");
  const user = await requireCurrentUser(SITE_ROUTES.join(code));
  let participant;

  try {
    participant = await joinGameWithUser(code, user);
  } catch (error) {
    if (error instanceof Error) {
      redirect(`${SITE_ROUTES.join(code)}?error=${encodeURIComponent(error.message)}`);
    }

    throw error;
  }

  revalidatePath(SITE_ROUTES.hostHome);
  revalidatePath(SITE_ROUTES.gameHost(participant.gameId));
  revalidatePath(SITE_ROUTES.gamePlayer(participant.gameId));
  redirect(SITE_ROUTES.gamePlayer(participant.gameId));
}

export async function assignSeatPlayerAction(formData: FormData) {
  const user = await requireCurrentUser(SITE_ROUTES.hostHome);
  const gameId = getString(formData, "gameId");
  await assignPlayerToSeat(getString(formData, "participantId"), user.id, {
    mode: (getString(formData, "mode") || undefined) as "move-player" | "reserve-email" | "clear-reservation" | undefined,
    sourceParticipantId: getString(formData, "sourceParticipantId") || undefined,
    assignedEmail: getString(formData, "assignedEmail") || undefined,
  });
  revalidatePath(SITE_ROUTES.hostHome);
  revalidatePath(SITE_ROUTES.gameHost(gameId));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function removeParticipantFromSeatAction(formData: FormData) {
  const user = await requireCurrentUser(SITE_ROUTES.hostHome);
  const gameId = getString(formData, "gameId");
  await removeParticipantFromSeat(getString(formData, "participantId"), user.id);
  revalidatePath(SITE_ROUTES.hostHome);
  revalidatePath(SITE_ROUTES.gameHost(gameId));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function resetGameToPregameAction(formData: FormData) {
  const user = await requireCurrentUser(SITE_ROUTES.hostHome);
  const gameId = getString(formData, "gameId");
  await resetGameToPregame(gameId, user.id);
  revalidatePath(SITE_ROUTES.hostHome);
  revalidatePath(SITE_ROUTES.gameHost(gameId));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function startPhaseOneAction(formData: FormData) {
  const user = await requireCurrentUser(SITE_ROUTES.hostHome);
  const gameId = getString(formData, "gameId");
  await startPhaseOne(gameId, user.id);
  revalidatePath(SITE_ROUTES.hostHome);
  revalidatePath(SITE_ROUTES.gameHost(gameId));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function triggerEventAction(formData: FormData) {
  const user = await requireCurrentUser(SITE_ROUTES.hostHome);
  const gameId = getString(formData, "gameId");
  await triggerEventPhaseTwo(gameId, user.id);
  revalidatePath(SITE_ROUTES.hostHome);
  revalidatePath(SITE_ROUTES.gameHost(gameId));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function startActTwoAction(formData: FormData) {
  const user = await requireCurrentUser(SITE_ROUTES.hostHome);
  const gameId = getString(formData, "gameId");
  await startActTwo(gameId, user.id);
  revalidatePath(SITE_ROUTES.hostHome);
  revalidatePath(SITE_ROUTES.gameHost(gameId));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function startFinaleAction(formData: FormData) {
  const user = await requireCurrentUser(SITE_ROUTES.hostHome);
  const gameId = getString(formData, "gameId");
  await startFinale(gameId, user.id);
  revalidatePath(SITE_ROUTES.hostHome);
  revalidatePath(SITE_ROUTES.gameHost(gameId));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function revealGameAction(formData: FormData) {
  const user = await requireCurrentUser(SITE_ROUTES.hostHome);
  const gameId = getString(formData, "gameId");
  await revealGame(gameId, user.id);
  revalidatePath(SITE_ROUTES.hostHome);
  revalidatePath(SITE_ROUTES.gameHost(gameId));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function searchRoomAction(formData: FormData) {
  const gameId = getString(formData, "gameId");
  const roomCode = getString(formData, "roomCode");
  const user = await requireCurrentUser(SITE_ROUTES.gameRoom(gameId, roomCode));
  const actingParticipantId = getString(formData, "actingParticipantId") || undefined;
  await searchRoomAs(user.id, gameId, roomCode, actingParticipantId);
  revalidatePath(SITE_ROUTES.gameRoom(gameId, roomCode));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function eavesdropAction(formData: FormData) {
  const gameId = getString(formData, "gameId");
  const roomCode = getString(formData, "roomCode");
  const user = await requireCurrentUser(SITE_ROUTES.gameRoom(gameId, roomCode));
  const actingParticipantId = getString(formData, "actingParticipantId") || undefined;
  await eavesdropAs(user.id, gameId, roomCode, actingParticipantId);
  revalidatePath(SITE_ROUTES.gameRoom(gameId, roomCode));
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function pickpocketAction(formData: FormData) {
  const gameId = getString(formData, "gameId");
  const user = await requireCurrentUser(SITE_ROUTES.gamePlayer(gameId));
  await pickpocket(
    user.id,
    getString(formData, "targetParticipantId"),
    getString(formData, "actingParticipantId") || undefined,
  );
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function proposeTradeAction(formData: FormData) {
  const gameId = getString(formData, "gameId");
  const user = await requireCurrentUser(SITE_ROUTES.gamePlayer(gameId));
  await proposeTrade(
    user.id,
    getString(formData, "targetParticipantId"),
    getString(formData, "playerItemId"),
    getString(formData, "actingParticipantId") || undefined,
  );
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function respondToTradeAction(formData: FormData) {
  const gameId = getString(formData, "gameId");
  const user = await requireCurrentUser(SITE_ROUTES.gamePlayer(gameId));
  await respondToTrade(
    user.id,
    getString(formData, "tradeId"),
    getString(formData, "decision") === "accept",
    getString(formData, "actingParticipantId") || undefined,
  );
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function plantItemAction(formData: FormData) {
  const gameId = getString(formData, "gameId");
  const user = await requireCurrentUser(SITE_ROUTES.gamePlayer(gameId));
  await plantItem(
    user.id,
    getString(formData, "targetParticipantId"),
    getString(formData, "playerItemId"),
    getString(formData, "actingParticipantId") || undefined,
  );
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
}

export async function submitDecisionAction(formData: FormData) {
  const gameId = getString(formData, "gameId");
  const user = await requireCurrentUser(SITE_ROUTES.gamePlayer(gameId));
  await submitDecision(
    user.id,
    getString(formData, "outcomeKey"),
    getString(formData, "actingParticipantId") || undefined,
  );
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
  revalidatePath(SITE_ROUTES.gameHost(gameId));
}

export async function submitAccusationAction(formData: FormData) {
  const gameId = getString(formData, "gameId");
  const user = await requireCurrentUser(SITE_ROUTES.gamePlayer(gameId));
  await submitAccusation(
    user.id,
    {
      suspectParticipantId: getString(formData, "suspectParticipantId") || undefined,
      motive: getString(formData, "motive"),
      means: getString(formData, "means"),
    },
    getString(formData, "actingParticipantId") || undefined,
  );
  revalidatePath(SITE_ROUTES.gamePlayer(gameId));
  revalidatePath(SITE_ROUTES.gameHost(gameId));
}
