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
              Assign players to characters from a compact roster. Reservation stays secondary and only appears when a seat is still open.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
              {hostGame.participants.map((participant) => (
                <article key={participant.id} className="rounded-2xl border bg-white/85 px-4 py-4 shadow-sm sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{participant.seatLabel}</p>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                          {participant.hasUser ? "Claimed" : participant.assignedEmail ? "Reserved" : "Open"}
                        </span>
                        <span className="rounded-full border border-input bg-background/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                          {participant.controlState === "host-or-player" ? "Host + Player" : "Host Control"}
                        </span>
                      </div>
                      <div>
                        <p className="text-2xl font-medium leading-none text-foreground">{participant.characterName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {participant.characterTitle} · {participant.actionsRemaining} actions remaining
                        </p>
                      </div>
                    </div>
                    <Link
                      className="shrink-0 text-sm font-medium text-primary"
                      href={`${SITE_ROUTES.gamePlayer(hostGame.game.id)}?as=${participant.id}`}
                    >
                      View Character
                    </Link>
                  </div>

                  <div className="mt-3 rounded-xl bg-background/60 px-3 py-2.5 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Assigned Player</p>
                    <p className="mt-1 truncate font-medium text-foreground">{participant.playerLabel}</p>
                    <p className="truncate text-muted-foreground">{participant.assignedEmail ?? "No email reserved"}</p>
                  </div>

                  <form action={assignSeatPlayerAction} className="mt-3 flex items-center gap-2">
                      <input name="gameId" type="hidden" value={hostGame.game.id} />
                      <input name="mode" type="hidden" value="move-player" />
                      <input name="participantId" type="hidden" value={participant.id} />
                      <select
                        className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background/70 px-3 py-2 text-sm"
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
                    <details className="mt-2 rounded-xl border bg-background/50 px-3 py-2">
                      <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:hidden">
                        {participant.assignedEmail ? "Edit reservation" : "Reserve by email"}
                      </summary>
                      <form action={assignSeatPlayerAction} className="mt-3 flex items-center gap-2">
                        <input name="gameId" type="hidden" value={hostGame.game.id} />
                        <input name="mode" type="hidden" value="reserve-email" />
                        <input name="participantId" type="hidden" value={participant.id} />
                        <input name="sourceParticipantId" type="hidden" value="" />
                        <input
                          className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-white px-3 py-2 text-sm"
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
                    </details>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
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
                        <input name="mode" type="hidden" value="clear-reservation" />
                        <input name="participantId" type="hidden" value={participant.id} />
                        <input name="sourceParticipantId" type="hidden" value="" />
                        <input name="assignedEmail" type="hidden" value="" />
                        <Button disabled={hostGame.game.currentStage !== "setup"} size="sm" type="submit" variant="ghost">
                          Clear Reservation
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </article>
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
