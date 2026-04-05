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
import { requireCurrentUser } from "@/src/lib/auth/session";
import { buildHostScenarioViewFromHostGame, getHostGameDetailForGame } from "@/src/server/services/prototype";
import { SITE_ROUTES } from "@/src/config/routes";

export const dynamic = "force-dynamic";

const HOST_SECTIONS = ["settings", "controls", "roster", "rooms", "scenario"] as const;

type HostSection = (typeof HOST_SECTIONS)[number];

function stageLabel(stage?: string) {
  if (!stage) {
    return "Setup";
  }

  return stage.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function actionBudgetLabel(actionBudgetPerAct: number) {
  return actionBudgetPerAct < 0 ? "Unlimited" : String(actionBudgetPerAct);
}

function actionsRemainingLabel(actionsRemaining: number) {
  return actionsRemaining < 0 ? "Unlimited actions" : `${actionsRemaining} actions remaining`;
}

function getHostSection(section?: string): HostSection {
  if (section && HOST_SECTIONS.includes(section as HostSection)) {
    return section as HostSection;
  }

  return "settings";
}

function hostSectionHref(gameId: string, section: HostSection) {
  return `${SITE_ROUTES.gameHost(gameId)}?section=${section}`;
}

export default async function GameHostPage({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { gameId } = await params;
  const { section } = await searchParams;
  const activeSection = getHostSection(section);
  const user = await requireCurrentUser(SITE_ROUTES.gameHost(gameId));
  const hostGame = await getHostGameDetailForGame(user.id, gameId);

  if (!hostGame) {
    notFound();
  }

  const scenarioView = buildHostScenarioViewFromHostGame(hostGame);

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="app-surface overflow-hidden border-white/70">
        <CardContent className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
          <div className="-mx-1 overflow-x-auto scrollbar-hidden px-1">
            <div className="flex w-max gap-1.5">
              <Link href={hostSectionHref(gameId, "settings")}>
                <Button
                  className="h-9 shrink-0 rounded-full px-3.5 text-[14px]"
                  size="sm"
                  type="button"
                  variant={activeSection === "settings" ? "default" : "outline"}
                >
                  Settings
                </Button>
              </Link>
              <Link href={hostSectionHref(gameId, "controls")}>
                <Button
                  className="h-9 shrink-0 rounded-full px-3.5 text-[14px]"
                  size="sm"
                  type="button"
                  variant={activeSection === "controls" ? "default" : "outline"}
                >
                  Controls
                </Button>
              </Link>
              <Link href={hostSectionHref(gameId, "roster")}>
                <Button
                  className="h-9 shrink-0 rounded-full px-3.5 text-[14px]"
                  size="sm"
                  type="button"
                  variant={activeSection === "roster" ? "default" : "outline"}
                >
                  Roster
                </Button>
              </Link>
              <Link href={hostSectionHref(gameId, "rooms")}>
                <Button
                  className="h-9 shrink-0 rounded-full px-3.5 text-[14px]"
                  size="sm"
                  type="button"
                  variant={activeSection === "rooms" ? "default" : "outline"}
                >
                  Rooms
                </Button>
              </Link>
              <Link href={hostSectionHref(gameId, "scenario")}>
                <Button
                  className="h-9 shrink-0 rounded-full px-3.5 text-[14px]"
                  size="sm"
                  type="button"
                  variant={activeSection === "scenario" ? "default" : "outline"}
                >
                  Scenario
                </Button>
              </Link>
              <Link href={SITE_ROUTES.gamePlayer(gameId)}>
                <Button className="h-9 shrink-0 rounded-full px-3.5 text-[14px]" size="sm" type="button" variant="outline">
                  Player
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeSection === "settings" ? (
        <section className="grid gap-4 md:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader className="space-y-3 p-4 sm:p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Game Control</p>
              <CardTitle className="font-[family-name:var(--font-heading)] text-3xl leading-none sm:text-5xl">
                {hostGame.game.title}
              </CardTitle>
              <CardDescription className="break-words text-base leading-7">
                Code <span className="font-semibold text-foreground">{hostGame.game.code}</span> ·{" "}
                {stageLabel(hostGame.game.currentStage)} · {hostGame.game.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-4 pb-4 pt-0 sm:px-6 sm:pb-6 md:grid-cols-2">
              <div className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Join Route</p>
                <p className="mt-2 break-all font-medium text-foreground">{hostGame.joinUrl}</p>
              </div>
              <div className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Decision Branch</p>
                <p className="mt-2 font-medium text-foreground">{hostGame.branchLabel ?? "Not chosen yet"}</p>
              </div>
              <div className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Event</p>
                <p className="mt-2 font-medium text-foreground">{hostGame.eventTitle}</p>
                <p className="mt-1 break-words text-muted-foreground">{hostGame.eventDescription}</p>
              </div>
              <div className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Actions Per Act</p>
                <p className="mt-2 font-medium text-foreground">{actionBudgetLabel(hostGame.actionBudgetPerAct)}</p>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {activeSection === "controls" ? (
        <div className="grid gap-4">
          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Stage Controls</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              <form action={startPhaseOneAction}>
                <input name="gameId" type="hidden" value={hostGame.game.id} />
                <Button className="h-11 w-full justify-center" disabled={!hostGame.canStartActOne} type="submit">
                  Start Act 1
                </Button>
              </form>
              <form action={triggerEventAction}>
                <input name="gameId" type="hidden" value={hostGame.game.id} />
                <Button className="h-11 w-full justify-center" disabled={!hostGame.canTriggerEventOne} type="submit" variant="secondary">
                  Trigger Event 1
                </Button>
              </form>
              <form action={startActTwoAction}>
                <input name="gameId" type="hidden" value={hostGame.game.id} />
                <Button className="h-11 w-full justify-center" disabled={!hostGame.canStartActTwo} type="submit" variant="outline">
                  Start Act 2
                </Button>
              </form>
              <form action={startFinaleAction}>
                <input name="gameId" type="hidden" value={hostGame.game.id} />
                <Button className="h-11 w-full justify-center" disabled={!hostGame.canStartFinale} type="submit" variant="outline">
                  Start Finale
                </Button>
              </form>
              <form action={revealGameAction}>
                <input name="gameId" type="hidden" value={hostGame.game.id} />
                <Button className="h-11 w-full justify-center" disabled={!hostGame.canReveal} type="submit" variant="ghost">
                  Reveal Results
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Reset</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={resetGameToPregameAction}>
                <input name="gameId" type="hidden" value={hostGame.game.id} />
                <Button className="h-11 w-full justify-center" disabled={hostGame.game.currentStage === "setup"} type="submit" variant="ghost">
                  Reset To Setup
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeSection === "roster" ? (
        <section className="grid gap-4 md:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="app-surface overflow-hidden border-white/70">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Character Roster</CardTitle>
            <CardDescription>
              Assign players to characters from a compact roster. Reservation stays secondary and only appears when a seat is still open.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
            <div className="mx-auto flex w-full max-w-xl min-w-0 flex-col gap-3">
              {hostGame.participants.map((participant) => (
                <article key={participant.id} className="min-w-0 rounded-[1.35rem] border bg-white/85 px-3.5 py-3.5 shadow-sm sm:px-5 sm:py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                        <p className="break-words text-xl font-medium leading-none text-foreground sm:text-2xl">{participant.characterName}</p>
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {participant.characterTitle} · {actionsRemainingLabel(participant.actionsRemaining)}
                        </p>
                      </div>
                    </div>
                    <Link
                      className="text-sm font-medium text-primary sm:shrink-0"
                      href={`${SITE_ROUTES.gamePlayer(hostGame.game.id)}?as=${participant.id}`}
                    >
                      View Character
                    </Link>
                  </div>

                  <div className="mt-3 rounded-xl bg-background/60 px-3 py-2.5 text-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Assigned Player</p>
                    <p className="mt-1 break-words font-medium text-foreground">{participant.playerLabel}</p>
                    <p className="break-all text-muted-foreground">{participant.assignedEmail ?? "No email reserved"}</p>
                  </div>

                  <form action={assignSeatPlayerAction} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
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
                      <Button className="w-full sm:w-auto" disabled={hostGame.game.currentStage !== "setup"} size="sm" type="submit" variant="outline">
                        Save
                      </Button>
                  </form>

                  {!participant.hasUser ? (
                    <details className="mt-2 rounded-xl border bg-background/50 px-3 py-2">
                      <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:hidden">
                        {participant.assignedEmail ? "Edit reservation" : "Reserve by email"}
                      </summary>
                      <form action={assignSeatPlayerAction} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
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
                        <Button className="w-full sm:w-auto" disabled={hostGame.game.currentStage !== "setup"} size="sm" type="submit" variant="outline">
                          Save
                        </Button>
                      </form>
                    </details>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    {participant.hasUser ? (
                      <form action={removeParticipantFromSeatAction} className="w-full sm:w-auto">
                        <input name="gameId" type="hidden" value={hostGame.game.id} />
                        <input name="participantId" type="hidden" value={participant.id} />
                        <Button className="w-full sm:w-auto" disabled={hostGame.game.currentStage !== "setup"} size="sm" type="submit" variant="ghost">
                          Remove Player
                        </Button>
                      </form>
                    ) : participant.assignedEmail ? (
                      <form action={assignSeatPlayerAction} className="w-full sm:w-auto">
                        <input name="gameId" type="hidden" value={hostGame.game.id} />
                        <input name="mode" type="hidden" value="clear-reservation" />
                        <input name="participantId" type="hidden" value={participant.id} />
                        <input name="sourceParticipantId" type="hidden" value="" />
                        <input name="assignedEmail" type="hidden" value="" />
                        <Button className="w-full sm:w-auto" disabled={hostGame.game.currentStage !== "setup"} size="sm" type="submit" variant="ghost">
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
        </section>
      ) : null}

      {activeSection === "rooms" ? (
        <Card className="app-surface overflow-hidden border-white/70">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Room Links</CardTitle>
            <CardDescription>These are the stable room targets to use for QR codes or manual testing.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {hostGame.rooms.map((room) => (
              <div key={room.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="font-medium text-foreground">{room.name}</p>
                <p className="mt-1 break-words text-muted-foreground">{room.description}</p>
                <Link className="mt-3 block break-all font-medium text-primary" href={room.route}>
                  {room.route}
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {activeSection === "scenario" ? (
        <div className="grid gap-4 md:gap-6">
          <section className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
            <Card className="app-surface overflow-hidden border-white/70">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl">Scenario Summary</CardTitle>
                <CardDescription>Read-only authored scenario reference for host tuning and playtest review.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Title</p>
                  <p className="mt-2 font-medium text-foreground">{scenarioView.title}</p>
                  <p className="mt-1 break-all text-muted-foreground">{scenarioView.slug}</p>
                </div>
                <div className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Branch</p>
                  <p className="mt-2 font-medium text-foreground">{scenarioView.branchLabel ?? "Not chosen yet"}</p>
                </div>
                <div className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Counts</p>
                  <p className="mt-2 text-muted-foreground">
                    {scenarioView.stats.playerCount} roles · {scenarioView.stats.roomCount} rooms · {scenarioView.stats.clueCount} clues
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {scenarioView.stats.itemCount} items · {scenarioView.stats.secretCount} secrets · {scenarioView.stats.goalCount} goals
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Warnings</p>
                  <p className="mt-2 font-medium text-foreground">{scenarioView.stats.warningCount}</p>
                  <p className="mt-1 text-muted-foreground">Prototype tuning heuristics, not hard errors.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="app-surface overflow-hidden border-white/70">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl">Potential Weak Spots</CardTitle>
                <CardDescription>Quick heuristics to help spot thin paths or missing author notes.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {scenarioView.warnings.length > 0 ? (
                  scenarioView.warnings.map((warning) => (
                    <div key={warning.code} className="rounded-2xl border bg-white/80 p-4 text-sm">
                      <p className="font-medium text-foreground">{warning.title}</p>
                      <p className="mt-1 break-words text-muted-foreground">{warning.detail}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No obvious weak spots detected from the authored metadata.</p>
                )}
              </CardContent>
            </Card>
          </section>

          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Stage Timeline</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 lg:grid-cols-2">
              {scenarioView.stages.map((stage) => (
                <div key={stage.key} className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{stage.label}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Goals {stage.actGoalCount} · Event clues {stage.eventClueCount}
                    </span>
                  </div>
                  <p className="mt-2 text-foreground">{stage.eventTitle}</p>
                  <p className="mt-1 break-words text-muted-foreground">{stage.summary}</p>
                  <p className="mt-2 break-words text-muted-foreground">{stage.eventDescription}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {stage.mechanics.roomActions ? "Room actions" : "No room actions"} · {stage.mechanics.decision ? "Decision live" : "No decision"} ·{" "}
                    {stage.mechanics.accusations ? "Accusations open" : "No accusations"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Character Sheets</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-2">
              {scenarioView.roles.map((role) => (
                <article key={role.roleCode} className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{role.characterName}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{role.seatLabel}</span>
                    {role.isDecisionOwner ? (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                        Decision owner
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-muted-foreground">{role.characterTitle}</p>
                  <p className="mt-2 break-words text-muted-foreground">Assigned: {role.assignedPlayerLabel ?? "Open"}</p>
                  <p className="mt-3 text-foreground">{role.publicDescription}</p>
                  <p className="mt-2 break-words text-muted-foreground">{role.privateDescription}</p>
                  {role.actTwoBriefing ? <p className="mt-2 break-words text-muted-foreground">Act 2: {role.actTwoBriefing}</p> : null}
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Starting clues</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.startingClues.map((entry) => (
                          <span key={entry} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                            {entry}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Starting items</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.startingItems.map((entry) => (
                          <span key={entry} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                            {entry}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Private knowledge</p>
                    <div className="mt-2 grid gap-2">
                      {role.knowledge.map((entry) => (
                        <div key={`${role.roleCode}-${entry.title}`} className="rounded-xl border bg-background/70 p-3">
                          <p className="font-medium text-foreground">{entry.title}</p>
                          <p className="mt-1 text-muted-foreground">{entry.subjectName}</p>
                          <p className="mt-1 break-words text-muted-foreground">{entry.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Act 1 goals</p>
                      <ul className="mt-2 grid gap-1 text-muted-foreground">
                        {role.actOneGoals.map((goal) => (
                          <li key={goal}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Act 2 goals</p>
                      <ul className="mt-2 grid gap-1 text-muted-foreground">
                        {role.actTwoGoals.map((goal) => (
                          <li key={goal}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>

          <section className="grid gap-4 md:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="app-surface overflow-hidden border-white/70">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl">Secrets & Supporting Clues</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {scenarioView.secrets.map((secret) => (
                  <div key={secret.code} className="rounded-2xl border bg-white/80 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{secret.title}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {secret.clueTitles.length} clues
                      </span>
                    </div>
                    <p className="mt-2 break-words text-muted-foreground">{secret.truth}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {secret.clueTitles.map((clue) => (
                        <span key={clue} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                          {clue}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="app-surface overflow-hidden border-white/70">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl">Rooms</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {scenarioView.rooms.map((room) => (
                  <div key={room.code} className="rounded-2xl border bg-white/80 p-4 text-sm">
                    <p className="font-medium text-foreground">{room.name}</p>
                    <p className="mt-1 break-words text-muted-foreground">{room.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Act 1: {room.actOneSearchCount} search / {room.actOneEavesdropCount} eavesdrop
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Act 2: {room.actTwoSearchCount} search / {room.actTwoEavesdropCount} eavesdrop
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Clue / Item Source Map</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-2">
              <div className="grid gap-3">
                {scenarioView.clues.map((clue) => (
                  <div key={clue.code} className="rounded-2xl border bg-white/80 p-4 text-sm">
                    <p className="font-medium text-foreground">{clue.title}</p>
                    <p className="mt-1 break-words text-muted-foreground">{clue.body}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Supports</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {clue.secretTitles.map((entry) => (
                        <span key={entry} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                          {entry}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Sources</p>
                    <ul className="mt-2 grid gap-1 text-muted-foreground">
                      {clue.sourceHints.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Reachable by</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {clue.reachableRoleNames.map((entry) => (
                        <span key={entry} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                          {entry}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-3">
                {scenarioView.items.map((item) => (
                  <div key={item.code} className="rounded-2xl border bg-white/80 p-4 text-sm">
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="mt-1 break-words text-muted-foreground">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.flags.map((flag) => (
                        <span key={flag} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                          {flag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Starting owners</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.startingOwnerNames.map((entry) => (
                        <span key={entry} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                          {entry}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Used by goals</p>
                    <ul className="mt-2 grid gap-1 text-muted-foreground">
                      {item.usedByGoalTitles.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Source hints</p>
                    <ul className="mt-2 grid gap-1 text-muted-foreground">
                      {item.sourceHints.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">Goal Paths</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 xl:grid-cols-2">
              {scenarioView.goalPaths.map((goal) => (
                <div key={goal.code} className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">{goal.title}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {goal.roleName} · {goal.stage}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-muted-foreground">{goal.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{goal.ruleLabel}</p>
                  {goal.warning ? (
                    <p className="mt-2 rounded-xl bg-primary/10 px-3 py-2 text-xs text-foreground">{goal.warning}</p>
                  ) : null}
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Path</p>
                  <ol className="mt-2 grid gap-1 text-muted-foreground">
                    {goal.authorPath.map((entry, index) => (
                      <li key={`${goal.code}-${index}`}>{index + 1}. {entry}</li>
                    ))}
                  </ol>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Dependency clues</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {goal.dependencyClueTitles.map((entry) => (
                      <span key={entry} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                        {entry}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Dependency items</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {goal.dependencyItemLabels.map((entry) => (
                      <span key={entry} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                        {entry}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">Contacts</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {goal.softContactNames.map((entry) => (
                      <span key={entry} className="rounded-full border bg-background/70 px-2.5 py-1 text-xs text-foreground">
                        {entry}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
