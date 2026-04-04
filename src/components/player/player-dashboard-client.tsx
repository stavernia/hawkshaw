"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import type { PlayerDashboard } from "@/src/features/players/types";
import {
  pickpocketAction,
  plantItemAction,
  proposeTradeAction,
  respondToTradeAction,
  submitAccusationAction,
  submitDecisionAction,
} from "@/src/server/actions/prototype";

const PLAYER_TABS = [
  { key: "overview", label: "Overview" },
  { key: "goals", label: "Goals" },
  { key: "characters", label: "Characters" },
  { key: "inventory", label: "Inventory" },
  { key: "actions", label: "Actions" },
  { key: "rooms", label: "Rooms" },
  { key: "finale", label: "Finale" },
] as const;

type PlayerTab = (typeof PLAYER_TABS)[number]["key"];
export type { PlayerTab };

function canUseAppActions(stage: string) {
  return stage === "act-1" || stage === "act-2";
}

export function PlayerDashboardClient({
  dashboard,
  currentTab,
}: {
  dashboard: PlayerDashboard;
  currentTab: PlayerTab;
}) {
  const [activeTab, setActiveTab] = useState<PlayerTab>(currentTab);
  const [activeDashboardId, setActiveDashboardId] = useState(dashboard.participant.id);
  const router = useRouter();
  const controlledDashboards = [dashboard, ...(dashboard.controlledDashboards ?? [])];
  const currentDashboard =
    controlledDashboards.find((entry) => entry.participant.id === activeDashboardId) ?? dashboard;
  const canUseActions = canUseAppActions(currentDashboard.stage);
  const knownFacts = currentDashboard.players.flatMap((player) =>
    player.knownFacts.map((fact) => ({
      ...fact,
      characterName: player.characterName ?? player.actorName,
    })),
  );

  useEffect(() => {
    setActiveDashboardId(dashboard.participant.id);
  }, [dashboard.participant.id]);

  useEffect(() => {
    if (!dashboard.canControlCharacters) {
      return;
    }

    const localControlledIds = new Set([
      dashboard.participant.id,
      ...(dashboard.controlledDashboards ?? []).map((entry) => entry.participant.id),
    ]);

    currentDashboard.seatLinks.forEach((seat) => {
      if (!localControlledIds.has(seat.id)) {
        router.prefetch(`${seat.href}&tab=${activeTab}`);
      }
    });
  }, [
    activeTab,
    currentDashboard.seatLinks,
    dashboard.canControlCharacters,
    dashboard.controlledDashboards,
    dashboard.participant.id,
    router,
  ]);

  return (
    <div className="grid gap-4 md:gap-6">
      {dashboard.canControlCharacters ? (
        <Card className="app-surface overflow-hidden border-white/70">
          <CardContent className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
            <div className="flex items-center gap-2">
              <select
                id="host-player-switcher"
                className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background/70 px-3 py-2 text-sm"
                value={currentDashboard.participant.id}
                onChange={(event) => {
                  const nextSeatId = event.target.value;
                  const seat = currentDashboard.seatLinks.find((entry) => entry.id === nextSeatId);
                  if (!seat) {
                    return;
                  }

                  const href = `${seat.href}&tab=${activeTab}`;
                  const cached = controlledDashboards.find((entry) => entry.participant.id === nextSeatId);

                  if (cached) {
                    setActiveDashboardId(nextSeatId);
                    window.history.replaceState(null, "", href);
                    return;
                  }

                  window.location.assign(href);
                }}
              >
                {currentDashboard.seatLinks.map((seat) => (
                  <option key={seat.id} value={seat.id}>
                    {seat.characterName ?? seat.displayName}
                  </option>
                ))}
              </select>
              <Link href={currentDashboard.gameId ? `/g/${currentDashboard.gameId}/host?section=controls` : "#"}>
                <Button className="h-10 shrink-0 rounded-full px-3 text-[13px]" size="sm" type="button" variant="outline">
                  Host
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="app-surface overflow-hidden border-white/70">
        <CardHeader className="space-y-3 p-4 sm:p-6">
          <div className="min-w-0 space-y-2">
            <CardTitle className="font-[family-name:var(--font-heading)] text-3xl leading-none sm:text-4xl md:text-5xl">
              {currentDashboard.role?.characterName ?? "Unassigned Character"}
            </CardTitle>
            <p className="text-base font-medium text-foreground sm:text-lg">
              {currentDashboard.role?.characterTitle ?? "Character unavailable"}
            </p>
            <p className="text-sm text-muted-foreground">Played by {currentDashboard.participant.actorName}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
          <div className="-mx-1 overflow-x-auto scrollbar-hidden px-1">
            <div className="flex w-max gap-1.5">
              {PLAYER_TABS.map((entry) => (
                <Button
                  key={entry.key}
                  className="h-9 shrink-0 rounded-full px-3.5 text-[14px]"
                  size="sm"
                  type="button"
                  variant={activeTab === entry.key ? "default" : "outline"}
                  onClick={() => setActiveTab(entry.key)}
                >
                  {entry.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {activeTab === "overview" ? (
        <Card className="app-surface overflow-hidden border-white/70">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">Tonight</p>
              <p className="mt-2 break-words text-muted-foreground">{currentDashboard.scenarioSummary}</p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">{currentDashboard.eventTitle}</p>
              <p className="mt-2 break-words text-muted-foreground">{currentDashboard.eventDescription}</p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">Who You Are</p>
              <p className="mt-2 text-foreground">{currentDashboard.role?.characterName}</p>
              <p className="mt-1 break-words text-muted-foreground">{currentDashboard.role?.characterTitle}</p>
              <p className="mt-3 break-words text-muted-foreground">{currentDashboard.role?.publicDescription}</p>
              <p className="mt-3 break-words text-foreground">{currentDashboard.role?.privateDescription}</p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">Your Situation Right Now</p>
              <p className="mt-2 break-words text-muted-foreground">{currentDashboard.role?.currentSummary}</p>
              {currentDashboard.role?.nextSteps.length ? (
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">What To Do Now</p>
                  <ol className="mt-2 grid gap-1 text-muted-foreground">
                    {currentDashboard.role.nextSteps.map((step, index) => (
                      <li key={`${currentDashboard.role?.code}-step-${index}`}>{index + 1}. {step}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
              {currentDashboard.role?.actTwoBriefing ? (
                <div className="mt-3 rounded-xl bg-primary/10 p-3 break-words text-foreground">
                  {currentDashboard.role.actTwoBriefing}
                </div>
              ) : null}
            </div>
            {currentDashboard.decision ? (
              <div className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="font-medium text-foreground">Decision</p>
                <p className="mt-2 break-words text-muted-foreground">{currentDashboard.decision.description}</p>
                <div className="mt-3 grid gap-3">
                  <form action={submitDecisionAction} className="grid gap-3 rounded-2xl border bg-background/70 p-3">
                    <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                    <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                    <input name="outcomeKey" type="hidden" value={currentDashboard.decision.optionAKey} />
                    <Button type="submit" variant="outline">
                      {currentDashboard.decision.optionALabel}
                    </Button>
                  </form>
                  <form action={submitDecisionAction} className="grid gap-3 rounded-2xl border bg-background/70 p-3">
                    <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                    <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                    <input name="outcomeKey" type="hidden" value={currentDashboard.decision.optionBKey} />
                    <Button type="submit">{currentDashboard.decision.optionBLabel}</Button>
                  </form>
                </div>
              </div>
            ) : null}
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">What You Already Know</p>
              {currentDashboard.clues.length > 0 ? (
                <div className="mt-3 grid gap-3">
                  {currentDashboard.clues.map((clue) => (
                    <div key={clue.id} className="rounded-xl border bg-background/70 p-3">
                      <p className="font-medium text-foreground">{clue.title}</p>
                      <p className="mt-1 break-words text-muted-foreground">{clue.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">No personal clues recorded yet.</p>
              )}
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">What You Know About Other People</p>
              {knownFacts.length > 0 ? (
                <div className="mt-3 grid gap-3">
                  {knownFacts.map((fact) => (
                    <div key={fact.id} className="rounded-xl border bg-background/70 p-3">
                      <p className="font-medium text-foreground">{fact.characterName}</p>
                      <p className="mt-1 text-foreground">{fact.title}</p>
                      <p className="mt-1 break-words text-muted-foreground">{fact.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">Your private reads on the other players will collect here.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "goals" ? (
        <Card className="app-surface overflow-hidden border-white/70">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Goals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {currentDashboard.goals.map((goal) => (
              <div key={goal.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="break-words font-medium text-foreground">{goal.title}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{goal.status}</span>
                </div>
                <p className="mt-2 break-words text-muted-foreground">{goal.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "characters" ? (
        <Card className="app-surface overflow-hidden border-white/70">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Characters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {currentDashboard.players.map((player) => (
              <div key={player.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="text-lg font-medium text-foreground">{player.characterName ?? "Unknown Character"}</p>
                <p className="break-words text-muted-foreground">
                  {player.characterTitle ?? "Unknown role"} · played by {player.actorName}
                </p>
                <p className="mt-2 break-words text-muted-foreground">{player.publicDescription}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">What you know</p>
                  {player.knownFacts.length > 0 ? (
                    player.knownFacts.map((fact) => (
                      <div key={fact.id} className="rounded-xl border bg-background/70 p-3">
                        <p className="font-medium text-foreground">{fact.title}</p>
                        <p className="mt-1 break-words text-muted-foreground">{fact.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">Your private read on this character will appear here.</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "inventory" ? (
        <Card className="app-surface overflow-hidden border-white/70">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Inventory</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Clues</p>
              {currentDashboard.clues.map((clue) => (
                <div key={clue.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <p className="font-medium text-foreground">{clue.title}</p>
                  <p className="mt-2 break-words text-muted-foreground">{clue.body}</p>
                </div>
              ))}
              {currentDashboard.clues.length === 0 ? <p className="text-sm text-muted-foreground">No clues yet.</p> : null}
            </div>
            <div className="grid gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Items</p>
              {currentDashboard.items.map((item) => (
                <div key={item.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <p className="font-medium text-foreground">
                    {item.label} × {item.quantity}
                  </p>
                  <p className="mt-2 break-words text-muted-foreground">{item.description}</p>
                </div>
              ))}
              {currentDashboard.items.length === 0 ? <p className="text-sm text-muted-foreground">No items yet.</p> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "actions" ? (
        <div className="grid gap-4">
          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader>
              <CardTitle>Trade Requests</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {currentDashboard.pendingIncomingTrades.map((trade) => (
                <form key={trade.id} action={respondToTradeAction} className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                  <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                  <input name="tradeId" type="hidden" value={trade.id} />
                  <p className="break-words font-medium text-foreground">
                    {trade.proposerName} offers {trade.itemLabel}
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <Button name="decision" type="submit" value="accept">
                      Accept
                    </Button>
                    <Button name="decision" type="submit" value="reject" variant="outline">
                      Reject
                    </Button>
                  </div>
                </form>
              ))}
              {currentDashboard.pendingOutgoingTrades.map((trade) => (
                <div key={trade.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <p className="break-words font-medium text-foreground">
                    To {trade.responderName}: {trade.itemLabel}
                  </p>
                  <p className="mt-1 text-muted-foreground">{trade.status}</p>
                </div>
              ))}
              {currentDashboard.pendingIncomingTrades.length === 0 && currentDashboard.pendingOutgoingTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trades pending.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form action={pickpocketAction} className="grid gap-3 rounded-2xl border bg-white/80 p-4">
                <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                <p className="font-medium text-foreground">Pickpocket</p>
                <Label htmlFor="pickpocket-target">Target</Label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-background/70 px-4 py-2 text-sm"
                  id="pickpocket-target"
                  name="targetParticipantId"
                  disabled={!canUseActions}
                >
                  {currentDashboard.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.characterName ?? player.actorName}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="outline" disabled={!canUseActions}>
                  Resolve Pickpocket
                </Button>
              </form>

              <form action={proposeTradeAction} className="grid gap-3 rounded-2xl border bg-white/80 p-4">
                <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                <p className="font-medium text-foreground">Trade</p>
                <Label htmlFor="trade-item">Offer Item</Label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-background/70 px-4 py-2 text-sm"
                  id="trade-item"
                  name="playerItemId"
                  disabled={!canUseActions}
                >
                  {currentDashboard.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <Label htmlFor="trade-target">Recipient</Label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-background/70 px-4 py-2 text-sm"
                  id="trade-target"
                  name="targetParticipantId"
                  disabled={!canUseActions}
                >
                  {currentDashboard.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.characterName ?? player.actorName}
                    </option>
                  ))}
                </select>
                <Button type="submit" disabled={!canUseActions}>Send Trade</Button>
              </form>

              <form action={plantItemAction} className="grid gap-3 rounded-2xl border bg-white/80 p-4">
                <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                <p className="font-medium text-foreground">Plant Item</p>
                <Label htmlFor="plant-item">Item</Label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-background/70 px-4 py-2 text-sm"
                  id="plant-item"
                  name="playerItemId"
                  disabled={!canUseActions}
                >
                  {currentDashboard.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <Label htmlFor="plant-target">Target</Label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-background/70 px-4 py-2 text-sm"
                  id="plant-target"
                  name="targetParticipantId"
                  disabled={!canUseActions}
                >
                  {currentDashboard.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.characterName ?? player.actorName}
                    </option>
                  ))}
                </select>
                <Button className="mt-3" type="submit" variant="ghost" disabled={!canUseActions}>
                  Resolve Plant Item
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === "rooms" ? (
        <Card className="app-surface overflow-hidden border-white/70">
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {currentDashboard.rooms.map((room) => (
              <div key={room.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="font-medium text-foreground">{room.name}</p>
                {canUseActions ? (
                  <Link className="mt-2 block break-all text-primary" href={room.href}>
                    Open room actions
                  </Link>
                ) : (
                  <p className="mt-2 text-muted-foreground">
                    Room actions are not available in this stage. Wait for an active act to search or eavesdrop.
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "finale" ? (
        <div className="grid gap-4">
          <Card className="app-surface overflow-hidden border-white/70">
            <CardHeader>
              <CardTitle>Accusation</CardTitle>
            </CardHeader>
            <CardContent>
              {currentDashboard.canSubmitAccusation ? (
                <form action={submitAccusationAction} className="grid gap-4">
                  <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                  <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                  <div className="grid gap-2">
                    <Label htmlFor="accuse-suspect">Suspect</Label>
                    <select
                      className="h-11 w-full rounded-xl border border-input bg-background/70 px-4 py-2 text-sm"
                      defaultValue={currentDashboard.accusation?.suspectParticipantId ?? ""}
                      id="accuse-suspect"
                      name="suspectParticipantId"
                    >
                      <option value="">Choose a suspect</option>
                      {currentDashboard.accusationTargets.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.characterName ?? player.actorName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="accuse-motive">Motive</Label>
                    <Input defaultValue={currentDashboard.accusation?.motive ?? ""} id="accuse-motive" name="motive" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="accuse-means">Means</Label>
                    <Input defaultValue={currentDashboard.accusation?.means ?? ""} id="accuse-means" name="means" />
                  </div>
                  <Button size="lg" type="submit">
                    Submit Accusation
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Final accusations are locked until the host starts the Finale.
                </p>
              )}
            </CardContent>
          </Card>

          {currentDashboard.reveal ? (
            <Card className="app-surface overflow-hidden border-white/70">
              <CardHeader>
                <CardTitle>Resolution</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="rounded-2xl border bg-white/80 p-4">
                  <p className="font-medium text-foreground">True suspect</p>
                  <p className="mt-2 break-words text-muted-foreground">{currentDashboard.reveal.solution.suspectName}</p>
                </div>
                <div className="rounded-2xl border bg-white/80 p-4">
                  <p className="font-medium text-foreground">Motive / Means</p>
                  <p className="mt-2 break-words text-muted-foreground">
                    {currentDashboard.reveal.solution.motive} · {currentDashboard.reveal.solution.means}
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/80 p-4">
                  <p className="font-medium text-foreground">Outcome</p>
                  <p className="mt-2 break-words text-muted-foreground">{currentDashboard.reveal.solution.summary}</p>
                </div>
                <div className="rounded-2xl border bg-primary/10 p-4">
                  <p className="font-medium text-foreground">Score</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{currentDashboard.reveal.score}</p>
                  <p className="mt-1 text-muted-foreground">
                    Accusation {currentDashboard.reveal.accusationScore} · Goals {currentDashboard.reveal.goalScore}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
