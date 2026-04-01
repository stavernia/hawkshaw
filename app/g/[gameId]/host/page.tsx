import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
  assignSeatPlayerAction,
  removeParticipantFromSeatAction,
  resetGameToPregameAction,
  revealGameAction,
  startActTwoAction,
  startFinaleAction,
  startPhaseOneAction,
  triggerEventAction,
} from "@/src/server/actions/prototype";
import { requireCurrentSessionUser } from "@/src/lib/auth/session";
import { getHostGameDetailForGame } from "@/src/server/services/prototype";
import { SITE_ROUTES } from "@/src/config/routes";

export const dynamic = "force-dynamic";

function stageLabel(stage?: string) {
  if (!stage) {
    return "Setup";
  }

  return stage.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function GameHostPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const user = await requireCurrentSessionUser(SITE_ROUTES.gameHost(gameId));
  const hostGame = await getHostGameDetailForGame(user.id, gameId);

  if (!hostGame) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="app-surface border-white/70">
          <CardHeader className="space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Game Control</p>
            <CardTitle className="font-[family-name:var(--font-heading)] text-5xl leading-none">
              {hostGame.game.title}
            </CardTitle>
            <CardDescription className="text-base leading-7">
              Code <span className="font-semibold text-foreground">{hostGame.game.code}</span> ·{" "}
              {stageLabel(hostGame.game.currentStage)} · {hostGame.game.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Join Route</p>
              <p className="mt-2 font-medium text-foreground">{hostGame.joinUrl}</p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Decision Branch</p>
              <p className="mt-2 font-medium text-foreground">{hostGame.branchLabel ?? "Not chosen yet"}</p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Event</p>
              <p className="mt-2 font-medium text-foreground">{hostGame.eventTitle}</p>
              <p className="mt-1 text-muted-foreground">{hostGame.eventDescription}</p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Actions Per Act</p>
              <p className="mt-2 font-medium text-foreground">{hostGame.actionBudgetPerAct}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>Stage Controls</CardTitle>
            <CardDescription>Keep transitions explicit. Only one stage control should be used at a time.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <form action={startPhaseOneAction}>
              <input name="gameId" type="hidden" value={hostGame.game.id} />
              <Button className="w-full justify-center" disabled={!hostGame.canStartActOne} type="submit">
                Start Act 1
              </Button>
            </form>
            <form action={triggerEventAction}>
              <input name="gameId" type="hidden" value={hostGame.game.id} />
              <Button className="w-full justify-center" disabled={!hostGame.canTriggerEventOne} type="submit" variant="secondary">
                Trigger Event 1
              </Button>
            </form>
            <form action={startActTwoAction}>
              <input name="gameId" type="hidden" value={hostGame.game.id} />
              <Button className="w-full justify-center" disabled={!hostGame.canStartActTwo} type="submit" variant="outline">
                Start Act 2
              </Button>
            </form>
            <form action={resetGameToPregameAction}>
              <input name="gameId" type="hidden" value={hostGame.game.id} />
              <Button className="w-full justify-center" disabled={hostGame.game.currentStage === "setup"} type="submit" variant="outline">
                Reset To Setup
              </Button>
            </form>
            <form action={startFinaleAction}>
              <input name="gameId" type="hidden" value={hostGame.game.id} />
              <Button className="w-full justify-center" disabled={!hostGame.canStartFinale} type="submit" variant="outline">
                Start Finale
              </Button>
            </form>
            <form action={revealGameAction}>
              <input name="gameId" type="hidden" value={hostGame.game.id} />
              <Button className="w-full justify-center" disabled={!hostGame.canReveal} type="submit" variant="ghost">
                Reveal Results
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>Character Roster</CardTitle>
            <CardDescription>
              Characters are instantiated onto seats at game creation. Assign a player email ahead of time, or move a joined player onto the right character during setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
              {hostGame.participants.map((participant) => (
                <div key={participant.id} className="rounded-2xl border bg-white/80 px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{participant.seatLabel}</p>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                          {participant.seatStatus}
                        </span>
                        <span className="rounded-full border border-input bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                          {participant.controlState === "host-or-player" ? "Host + Player" : "Host"}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-medium leading-none text-foreground">{participant.characterName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {participant.characterTitle} · {participant.actionsRemaining} actions remaining
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Assigned Player</p>
                    <p className="mt-1 truncate font-medium text-foreground">{participant.playerLabel}</p>
                    <p className="truncate text-sm text-muted-foreground">{participant.assignedEmail ?? "No email reserved"}</p>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <form action={assignSeatPlayerAction} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <input name="gameId" type="hidden" value={hostGame.game.id} />
                      <input name="participantId" type="hidden" value={participant.id} />
                      <select
                        className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 py-2 text-sm"
                        defaultValue={participant.hasUser ? participant.id : ""}
                        disabled={hostGame.game.currentStage !== "setup"}
                        name="sourceParticipantId"
                      >
                        <option value="">Move Joined Player</option>
                        {hostGame.joinedPlayers.map((player) => (
                          <option key={player.seatId} value={player.seatId}>
                            {player.playerName}{player.email ? ` (${player.email})` : ""}
                          </option>
                        ))}
                      </select>
                      <Button disabled={hostGame.game.currentStage !== "setup"} size="sm" type="submit" variant="outline">
                        Save
                      </Button>
                    </form>

                    {!participant.hasUser ? (
                      <form action={assignSeatPlayerAction} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <input name="gameId" type="hidden" value={hostGame.game.id} />
                        <input name="participantId" type="hidden" value={participant.id} />
                        <input name="sourceParticipantId" type="hidden" value="" />
                        <input
                          className="h-10 w-full rounded-xl border border-input bg-background/70 px-3 py-2 text-sm"
                          defaultValue={participant.assignedEmail ?? ""}
                          disabled={hostGame.game.currentStage !== "setup"}
                          name="assignedEmail"
                          placeholder="Reserve Email"
                          type="email"
                        />
                        <Button disabled={hostGame.game.currentStage !== "setup"} size="sm" type="submit" variant="outline">
                          Save
                        </Button>
                      </form>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3 text-sm">
                    <Link className="font-medium text-primary" href={`${SITE_ROUTES.gamePlayer(hostGame.game.id)}?as=${participant.id}`}>
                      View Character
                    </Link>
                    {participant.hasUser ? (
                      <form action={removeParticipantFromSeatAction}>
                        <input name="gameId" type="hidden" value={hostGame.game.id} />
                        <input name="participantId" type="hidden" value={participant.id} />
                        <Button disabled={hostGame.game.currentStage !== "setup"} size="sm" type="submit" variant="ghost">
                          Remove Player
                        </Button>
                      </form>
                    ) : participant.assignedEmail ? (
                      <form action={assignSeatPlayerAction}>
                        <input name="gameId" type="hidden" value={hostGame.game.id} />
                        <input name="participantId" type="hidden" value={participant.id} />
                        <input name="sourceParticipantId" type="hidden" value="" />
                        <input name="assignedEmail" type="hidden" value="" />
                        <Button disabled={hostGame.game.currentStage !== "setup"} size="sm" type="submit" variant="ghost">
                          Clear Reservation
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>Room Links</CardTitle>
            <CardDescription>These are the stable room targets to use for QR codes or manual testing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {hostGame.rooms.map((room) => (
              <div key={room.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="font-medium text-foreground">{room.name}</p>
                <p className="mt-1 text-muted-foreground">{room.description}</p>
                <Link className="mt-3 block font-medium text-primary" href={room.route}>
                  {room.route}
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
