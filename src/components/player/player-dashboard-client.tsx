"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
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
  { key: "character", label: "Character" },
  { key: "players", label: "Players" },
  { key: "evidence", label: "Evidence" },
  { key: "actions", label: "Actions" },
  { key: "rooms", label: "Rooms" },
  { key: "finale", label: "Finale" },
] as const;

type PlayerTab = (typeof PLAYER_TABS)[number]["key"];

function stageLabel(stage: string) {
  switch (stage) {
    case "setup":
      return "Setup";
    case "act-1":
      return "Act 1";
    case "event-1":
      return "Event 1";
    case "act-2":
      return "Act 2";
    case "finale":
      return "Finale";
    case "resolution":
      return "Resolution";
    default:
      return stage;
  }
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

  useEffect(() => {
    setActiveDashboardId(dashboard.participant.id);
  }, [dashboard.participant.id]);

  useEffect(() => {
    if (!dashboard.canControlCharacters) {
      return;
    }

    const localControlledIds = new Set([dashboard.participant.id, ...(dashboard.controlledDashboards ?? []).map((entry) => entry.participant.id)]);

    currentDashboard.seatLinks.forEach((seat) => {
      if (!localControlledIds.has(seat.id)) {
        router.prefetch(`${seat.href}&tab=${activeTab}`);
      }
    });
  }, [activeTab, currentDashboard.seatLinks, dashboard.canControlCharacters, dashboard.controlledDashboards, dashboard.participant.id, router]);

  return (
    <div className="grid gap-4 md:gap-6">
      <Card className="app-surface border-white/70">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                {currentDashboard.title} · {stageLabel(currentDashboard.stage)}
              </p>
              <CardTitle className="font-[family-name:var(--font-heading)] text-4xl leading-none md:text-5xl">
                {currentDashboard.role?.characterName ?? "Unassigned Character"}
              </CardTitle>
              <p className="text-base font-medium text-foreground md:text-lg">
                {currentDashboard.role?.characterTitle ?? "Character unavailable"}
              </p>
              <p className="text-sm text-muted-foreground">Played by {currentDashboard.participant.actorName}</p>
            </div>
            <div className="rounded-2xl border bg-white/80 px-4 py-3 text-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Actions Left</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{currentDashboard.participant.actionsRemaining}</p>
            </div>
          </div>
          {dashboard.canControlCharacters ? (
            <div className="flex flex-wrap gap-2 rounded-2xl border bg-white/80 p-3">
              {currentDashboard.seatLinks.map((seat) => {
                const href = `${seat.href}&tab=${activeTab}`;
                const cached = controlledDashboards.find((entry) => entry.participant.id === seat.id);

                if (cached) {
                  return (
                    <Button
                      key={seat.id}
                      size="sm"
                      type="button"
                      variant={seat.id === currentDashboard.participant.id ? "default" : "outline"}
                      onClick={() => {
                        setActiveDashboardId(seat.id);
                        window.history.replaceState(null, "", href);
                      }}
                    >
                      {seat.characterName ?? seat.displayName}
                    </Button>
                  );
                }

                return (
                  <Link key={seat.id} href={href} prefetch>
                    <Button size="sm" type="button" variant={seat.id === currentDashboard.participant.id ? "default" : "outline"}>
                      {seat.characterName ?? seat.displayName}
                    </Button>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="flex snap-x gap-2 overflow-x-auto pb-1">
            {PLAYER_TABS.map((entry) => (
              <Button
                key={entry.key}
                size="sm"
                type="button"
                variant={activeTab === entry.key ? "default" : "outline"}
                onClick={() => setActiveTab(entry.key)}
              >
                {entry.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {activeTab === "overview" ? (
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>What this game is, where you are, and what matters right now.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">Where are we?</p>
              <p className="mt-2 text-muted-foreground">{currentDashboard.scenarioSummary}</p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">Current moment</p>
              <p className="mt-2 text-muted-foreground">
                {currentDashboard.eventTitle}: {currentDashboard.eventDescription}
              </p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">Recent activity</p>
              <div className="mt-3 grid gap-2">
                {currentDashboard.actionLog.length > 0 ? (
                  currentDashboard.actionLog.map((entry) => (
                    <div key={entry.id} className="rounded-xl border bg-background/70 p-3">
                      <p className="font-medium text-foreground">{entry.actionType}</p>
                      <p className="mt-1 text-muted-foreground">{entry.summary}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No logged activity yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "character" ? (
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>My Character</CardTitle>
            <CardDescription>Your identity, private context, and current goals.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">{currentDashboard.role?.characterName}</p>
              <p className="mt-1 text-muted-foreground">{currentDashboard.role?.publicDescription}</p>
              <p className="mt-3 text-foreground">{currentDashboard.role?.privateDescription}</p>
              {currentDashboard.role?.actTwoBriefing ? (
                <div className="mt-3 rounded-xl bg-primary/10 p-3 text-foreground">{currentDashboard.role.actTwoBriefing}</div>
              ) : null}
            </div>
            <div className="grid gap-3">
              {currentDashboard.goals.map((goal) => (
                <div key={goal.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{goal.title}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{goal.status}</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">{goal.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "players" ? (
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>Players</CardTitle>
            <CardDescription>Character-first roster with your personal knowledge layered in.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {currentDashboard.players.map((player) => (
              <div key={player.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="text-lg font-medium text-foreground">{player.characterName ?? "Unknown Character"}</p>
                <p className="text-muted-foreground">
                  {player.characterTitle ?? "Unknown role"} · played by {player.actorName}
                </p>
                <p className="mt-2 text-muted-foreground">{player.publicDescription}</p>
                <div className="mt-3 space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">What you know</p>
                  {player.knownFacts.length > 0 ? (
                    player.knownFacts.map((fact) => (
                      <div key={fact.id} className="rounded-xl border bg-background/70 p-3">
                        <p className="font-medium text-foreground">{fact.title}</p>
                        <p className="mt-1 text-muted-foreground">{fact.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No personal notes recorded yet.</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "evidence" ? (
        <div className="grid gap-4">
          <Card className="app-surface border-white/70">
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
              <CardDescription>Your clues and inventory stay private unless you choose to share them.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3">
                {currentDashboard.clues.map((clue) => (
                  <div key={clue.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                    <p className="font-medium text-foreground">{clue.title}</p>
                    <p className="mt-2 text-muted-foreground">{clue.body}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3">
                {currentDashboard.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border bg-white/80 p-4 text-sm">
                    <p className="font-medium text-foreground">
                      {item.label} × {item.quantity}
                    </p>
                    <p className="mt-2 text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="app-surface border-white/70">
            <CardHeader>
              <CardTitle>Trade Requests</CardTitle>
              <CardDescription>Trade stays nested under evidence for this prototype.</CardDescription>
            </CardHeader>
          <CardContent className="grid gap-3">
              {currentDashboard.pendingIncomingTrades.map((trade) => (
                <form key={trade.id} action={respondToTradeAction} className="rounded-2xl border bg-white/80 p-4 text-sm">
                  <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                  <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                  <input name="tradeId" type="hidden" value={trade.id} />
                  <p className="font-medium text-foreground">
                    {trade.proposerName} offers {trade.itemLabel}
                  </p>
                  <div className="mt-3 flex gap-3">
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
                  <p className="font-medium text-foreground">
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
        </div>
      ) : null}

      {activeTab === "actions" ? (
        <div className="grid gap-4">
          <Card className="app-surface border-white/70">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Choose the action first, then choose the target.</CardDescription>
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
                >
                  {currentDashboard.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.characterName ?? player.actorName}
                    </option>
                  ))}
                </select>
                <Button type="submit" variant="outline">
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
                >
                  {currentDashboard.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.characterName ?? player.actorName}
                    </option>
                  ))}
                </select>
                <Button type="submit">Send Trade</Button>
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
                >
                  {currentDashboard.players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.characterName ?? player.actorName}
                    </option>
                  ))}
                </select>
                <Button className="mt-3" type="submit" variant="ghost">
                  Resolve Plant Item
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === "rooms" ? (
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
            <CardDescription>Use room links directly in the prototype. QR codes can point here later.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {currentDashboard.rooms.map((room) => (
              <Link
                key={room.id}
                className="rounded-2xl border bg-white/80 p-4 text-sm transition hover:border-primary/60"
                href={room.href}
              >
                <p className="font-medium text-foreground">{room.name}</p>
                <p className="mt-2 text-primary">Open room actions</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {activeTab === "finale" ? (
        <div className="grid gap-4">
          {currentDashboard.decision ? (
            <Card className="app-surface border-white/70">
              <CardHeader>
                <CardTitle>Decision</CardTitle>
                <CardDescription>{currentDashboard.decision.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <form action={submitDecisionAction} className="grid gap-3 rounded-2xl border bg-white/80 p-4">
                  <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                  <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                  <input name="outcomeKey" type="hidden" value={currentDashboard.decision.optionAKey} />
                  <Button type="submit" variant="outline">
                    {currentDashboard.decision.optionALabel}
                  </Button>
                </form>
                <form action={submitDecisionAction} className="grid gap-3 rounded-2xl border bg-white/80 p-4">
                  <input name="actingParticipantId" type="hidden" value={currentDashboard.participant.id} />
                  <input name="gameId" type="hidden" value={currentDashboard.gameId} />
                  <input name="outcomeKey" type="hidden" value={currentDashboard.decision.optionBKey} />
                  <Button type="submit">{currentDashboard.decision.optionBLabel}</Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card className="app-surface border-white/70">
            <CardHeader>
              <CardTitle>Accusation</CardTitle>
              <CardDescription>Submit suspect, motive, and means. Character names take precedence here.</CardDescription>
            </CardHeader>
            <CardContent>
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
                    {currentDashboard.players.map((player) => (
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
            </CardContent>
          </Card>

          {currentDashboard.reveal ? (
            <Card className="app-surface border-white/70">
              <CardHeader>
                <CardTitle>Resolution</CardTitle>
                <CardDescription>The host has opened the reveal.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="rounded-2xl border bg-white/80 p-4">
                  <p className="font-medium text-foreground">True suspect</p>
                  <p className="mt-2 text-muted-foreground">{currentDashboard.reveal.solution.suspectName}</p>
                </div>
                <div className="rounded-2xl border bg-white/80 p-4">
                  <p className="font-medium text-foreground">Motive / Means</p>
                  <p className="mt-2 text-muted-foreground">
                    {currentDashboard.reveal.solution.motive} · {currentDashboard.reveal.solution.means}
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/80 p-4">
                  <p className="font-medium text-foreground">Outcome</p>
                  <p className="mt-2 text-muted-foreground">{currentDashboard.reveal.solution.summary}</p>
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
