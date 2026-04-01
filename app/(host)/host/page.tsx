import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { createPrototypeGameAction } from "@/src/server/actions/prototype";
import { requireCurrentSessionUser } from "@/src/lib/auth/session";
import { ensurePrototypeScenario, getHostGameList } from "@/src/server/services/prototype";

export const dynamic = "force-dynamic";

function stageLabel(stage: string) {
  return stage.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function HostPage() {
  const user = await requireCurrentSessionUser("/host");
  const [scenario, games] = await Promise.all([ensurePrototypeScenario(), getHostGameList(user.id)]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="app-surface border-white/70">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Host Home</p>
              <CardTitle className="font-[family-name:var(--font-heading)] text-5xl leading-none">
                {scenario.title}
              </CardTitle>
            </div>
            <CardDescription className="max-w-2xl text-base leading-7">{scenario.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>This pass now uses explicit game records instead of inferring one active host game.</p>
            <p>Create a prototype game, then open it from the list below to manage seats, acts, rooms, and reveal.</p>
            <form action={createPrototypeGameAction}>
              <Button size="lg" type="submit">
                Create Prototype Game
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>How This Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border bg-white/80 p-4">1. Create a game from the prototype scenario.</div>
            <div className="rounded-2xl border bg-white/80 p-4">2. Preassign player emails to characters, or share the join code so players can claim open seats.</div>
            <div className="rounded-2xl border bg-white/80 p-4">3. Open a specific game to confirm character assignments and run the acts.</div>
          </CardContent>
        </Card>
      </section>

      <Card className="app-surface border-white/70">
        <CardHeader>
          <CardTitle>Your Games</CardTitle>
          <CardDescription>Each game has its own host, player, and room routes under `/g/[gameId]/...`.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {games.length > 0 ? (
            games.map((game) => (
              <Link key={game.id} className="rounded-2xl border bg-white/80 p-4 transition hover:border-primary/60" href={game.href}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{game.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Code {game.code} · {stageLabel(game.currentStage)} · {game.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {game.claimedSeatCount}/{game.participantCount} seats claimed
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">Open Host Controls</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border bg-white/80 p-4 text-sm text-muted-foreground">
              No host games yet. Create your first prototype game to start testing.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
