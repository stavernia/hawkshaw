import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { getCurrentSessionUser } from "@/src/lib/auth/session";
import { SITE_ROUTES } from "@/src/config/routes";
import { eavesdropAction, searchRoomAction } from "@/src/server/actions/prototype";
import { getRoomViewForUser } from "@/src/server/services/prototype";

export const dynamic = "force-dynamic";

function stageLabel(stage: string) {
  return stage.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function actionsRemainingLabel(actionsRemaining: number) {
  return actionsRemaining < 0 ? "Unlimited" : String(actionsRemaining);
}

export default async function ScopedRoomEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string; code: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  const { gameId, code } = await params;
  const { as } = await searchParams;
  const user = await getCurrentSessionUser();

  if (!user) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12 md:px-10">
        <Card className="app-surface w-full border-white/70">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-heading)] text-4xl">Sign In To Use Room Actions</CardTitle>
            <CardDescription className="text-base leading-7">
              Room actions are tied to your authenticated player seat. Sign in, then reopen this room link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className="font-medium text-primary"
              href={`${SITE_ROUTES.login}?next=${encodeURIComponent(SITE_ROUTES.gameRoom(gameId, code))}`}
            >
              Go to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roomView = await getRoomViewForUser(user.id, gameId, code, as);

  if (!roomView) {
    notFound();
  }

  const { participant, roomState, stage, recentLogs, searchAvailable, eavesdropAvailable } = roomView;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12 md:px-10">
      <section className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="app-surface border-white/70">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Room Route</p>
              <CardTitle className="font-[family-name:var(--font-heading)] text-5xl leading-none">
                {roomState.scenarioRoom.name}
              </CardTitle>
            </div>
            <CardDescription className="max-w-2xl text-base leading-7">{roomState.scenarioRoom.description}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current Stage</p>
              <p className="mt-2 font-medium text-foreground">{stageLabel(stage)}</p>
            </div>
            <div className="rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Actions Remaining</p>
              <p className="mt-2 font-medium text-foreground">{actionsRemainingLabel(participant.actionsRemaining)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>Room Actions</CardTitle>
            <CardDescription>
              {["act-1", "act-2"].includes(stage)
                ? participant.actionsRemaining < 0
                  ? "Room actions are deterministic and unlimited during active acts in this prototype."
                  : "Room actions are deterministic and consume one action during active acts."
                : "Room actions pause during Event 1 and resume with the next active act."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <form action={searchRoomAction}>
              <input name="actingParticipantId" type="hidden" value={participant.id} />
              <input name="gameId" type="hidden" value={gameId} />
              <input name="roomCode" type="hidden" value={code} />
              <Button className="w-full justify-center" disabled={!["act-1", "act-2"].includes(stage) || !searchAvailable} type="submit">
                Search Room
              </Button>
            </form>
            <form action={eavesdropAction}>
              <input name="actingParticipantId" type="hidden" value={participant.id} />
              <input name="gameId" type="hidden" value={gameId} />
              <input name="roomCode" type="hidden" value={code} />
              <Button
                className="w-full justify-center"
                disabled={!["act-1", "act-2"].includes(stage) || !eavesdropAvailable}
                type="submit"
                variant="outline"
              >
                Eavesdrop
              </Button>
            </form>
            {["act-1", "act-2"].includes(stage) ? (
              <div className="space-y-1 rounded-2xl border bg-white/80 p-4 text-sm">
                <p className="font-medium text-foreground">Availability</p>
                <p className="text-muted-foreground">
                  Search: {searchAvailable ? "available" : "no results left for this act"}.
                </p>
                <p className="text-muted-foreground">
                  Eavesdrop: {eavesdropAvailable ? "available" : "no overheard result left for this act"}.
                </p>
              </div>
            ) : null}
            <Link className="text-sm font-medium text-primary" href={`${SITE_ROUTES.gamePlayer(gameId)}?as=${participant.id}`} prefetch={false}>
              Back to character dashboard
            </Link>
            <div className="space-y-2 rounded-2xl border bg-white/80 p-4 text-sm">
              <p className="font-medium text-foreground">Recent Results</p>
              {recentLogs.length > 0 ? (
                recentLogs.map((entry) => (
                  <div key={entry.id} className="rounded-xl border bg-background/70 p-3">
                    <p className="font-medium text-foreground">{entry.summary}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No room actions logged here yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
